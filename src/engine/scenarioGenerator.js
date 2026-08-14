import { SCENARIO_TEMPLATES, POSITION_MATCHUPS, getTemplatesForDifficulty } from '../data/scenarioTemplates';
import { templateMatchesProfile } from '../data/drillProfiles';
import { conceptsOf } from '../data/concepts';
import {
  generateDryBoard, generateWetBoard, generateMonotoneBoard, generatePairedBoard,
  generateTurnCard, generateRiverCard,
} from './boardGenerator';
import { generateHandByCategory } from './handGenerator';
import { calculateStrategy } from './strategyCalculator';
import { buildExplanation } from './explanationBuilder';

let scenarioCounter = 0;

function pickRandom(arr, rng) {
  return arr[Math.floor((rng ? rng() : Math.random()) * arr.length)];
}

function generateBoard(textureType, usedCards, rng) {
  switch (textureType) {
    case 'dry-high':
      return generateDryBoard('A', usedCards, rng);
    case 'dry-low':
      return generateDryBoard(pickRandom(['9', '8', '7'], rng), usedCards, rng);
    case 'wet':
      return generateWetBoard(usedCards, rng);
    case 'monotone':
      return generateMonotoneBoard(null, usedCards, rng);
    case 'paired':
      return generatePairedBoard(usedCards, rng);
    default:
      return generateDryBoard(null, usedCards, rng);
  }
}

function getPotAndStack(template) {
  if (template.potType === '3BET') {
    return { potSize: 18, effectiveStack: 82 };
  }
  return { potSize: 6.5, effectiveStack: 97 };
}

function getStreetBoard(template, flop, usedCards, rng) {
  const board = { flop, turn: null, river: null };
  let used = usedCards;

  if (template.street === 'turn' || template.street === 'river') {
    // Turn constraint alternates so barrel practice is not always a brick —
    // half the value of turn play is recognising which cards changed things.
    const constraint = (rng ? rng() : Math.random()) < 0.6 ? 'brick' : 'scare';
    const turnResult = generateTurnCard(flop, constraint, used, rng);
    board.turn = turnResult.card;
    used = turnResult.usedCards;
  }

  if (template.street === 'river') {
    const riverResult = generateRiverCard([...flop, board.turn], used, rng);
    board.river = riverResult.card;
    used = riverResult.usedCards;
  }

  return { board, usedCards: used };
}

/**
 * Build a concrete scenario from a template.
 * Shared by every generation path so they cannot drift apart — the boss
 * generator used to be a near-identical copy of this and had already fallen
 * behind on difficulty handling.
 */
function buildScenario(template, difficulty, rng, extra = {}) {
  const positionMatchup = POSITION_MATCHUPS[template.position] || POSITION_MATCHUPS.IP_VS_BB;

  const { flop, usedCards: boardUsed } = generateBoard(template.boardTextureType, new Set(), rng);
  const { board, usedCards: allBoardUsed } = getStreetBoard(template, flop, boardUsed, rng);

  const { hand } = generateHandByCategory(template.handCategoryType, board, allBoardUsed, rng);

  const { potSize, effectiveStack } = getPotAndStack(template);

  const strategy = calculateStrategy(template, board, hand, potSize, rng, difficulty);
  const explanation = buildExplanation(template, board, hand, strategy);

  scenarioCounter++;

  const concepts = conceptsOf(template);

  return {
    id: `${extra.idPrefix || 'gen'}-${scenarioCounter}`,
    board,
    heroHand: hand,
    heroPosition: positionMatchup.hero,
    villainPosition: positionMatchup.villain,
    potSize,
    effectiveStack,
    street: template.street,
    decisionMode: template.decisionMode || 'bet',
    // Present only when villain has bet into us, so the UI can show what we are
    // actually facing rather than implying a fold is always available.
    facingBet: template.facingBetSize
      ? Math.round(potSize * template.facingBetSize * 100) / 100
      : undefined,
    gtoStrategy: {
      ...strategy,
      explanation,
    },
    concepts,
    _meta: {
      templateId: template.id,
      difficulty,
      templateDifficulty: template.difficultyBase,
      ...extra.meta,
    },
  };
}

/**
 * Candidate templates for a request.
 *
 * Falls back progressively rather than to the whole library at once: a drill
 * that constrains to monotone flops should widen its difficulty band before it
 * starts dealing rainbow boards.
 */
export function selectTemplatePool({ difficulty = 5, profile = {}, concepts = [] } = {}) {
  const inProfile = SCENARIO_TEMPLATES.filter(t => templateMatchesProfile(t, profile));
  const base = inProfile.length > 0 ? inProfile : SCENARIO_TEMPLATES;

  // If specific concepts are due for review, prefer templates that teach them.
  if (concepts.length > 0) {
    const targeted = base.filter(t => {
      const c = conceptsOf(t);
      return concepts.includes(c.primary) || concepts.includes(c.texture);
    });
    if (targeted.length > 0) return targeted;
  }

  const min = Math.max(1, difficulty - 2);
  const max = Math.min(10, difficulty + 1);
  const inBand = base.filter(t => t.difficultyBase >= min && t.difficultyBase <= max);
  if (inBand.length > 0) return inBand;

  // Widen the band before abandoning the profile.
  const wide = base.filter(t => t.difficultyBase >= difficulty - 4 && t.difficultyBase <= difficulty + 3);
  return wide.length > 0 ? wide : base;
}

/**
 * @param {number} difficultyLevel 1-10
 * @param {object} [options]
 * @param {object} [options.profile] drill constraints (see drillProfiles.js)
 * @param {string[]} [options.concepts] concept ids due for review, preferred
 * @param {() => number} [options.rng] injectable for deterministic tests
 */
export function generateScenario(difficultyLevel = 5, options = {}) {
  // Kept tolerant of the old `generateScenario(difficulty, rng)` signature.
  const opts = typeof options === 'function' ? { rng: options } : options;
  const { profile = {}, concepts = [], rng } = opts;

  const pool = selectTemplatePool({ difficulty: difficultyLevel, profile, concepts });
  const template = pickRandom(pool, rng);

  return buildScenario(template, difficultyLevel, rng, { idPrefix: 'arena' });
}

export function generateBossScenario(floorNumber, options = {}) {
  const opts = typeof options === 'function' ? { rng: options } : options;
  const { profile = {}, rng } = opts;

  const bossDifficulty = Math.min(10, Math.max(7, floorNumber + 2));

  const inProfile = SCENARIO_TEMPLATES.filter(t => templateMatchesProfile(t, profile));
  const base = inProfile.length > 0 ? inProfile : SCENARIO_TEMPLATES;
  const bossTemplates = base.filter(t => t.difficultyBase >= 7);

  const template = bossTemplates.length > 0
    ? pickRandom(bossTemplates, rng)
    : pickRandom(base, rng);

  return buildScenario(template, bossDifficulty, rng, {
    idPrefix: 'boss',
    meta: { isBoss: true },
  });
}

// Re-exported for tests and for callers that want the unfiltered list.
export { getTemplatesForDifficulty };
