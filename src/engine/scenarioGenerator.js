import { SCENARIO_TEMPLATES, POSITION_MATCHUPS, getTemplatesForDifficulty } from '../data/scenarioTemplates';
import { generateDryBoard, generateWetBoard, generateMonotoneBoard, generatePairedBoard, generateTurnCard, generateRiverCard } from './boardGenerator';
import { generateHandByCategory } from './handGenerator';
import { calculateStrategy, adjustDifficultyEV } from './strategyCalculator';
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

  if (template.street === 'turn' || template.street === 'river') {
    const turnResult = generateTurnCard(flop, 'brick', usedCards, rng);
    board.turn = turnResult.card;
    usedCards = turnResult.usedCards;
  }

  if (template.street === 'river') {
    const boardCards = [...flop, board.turn];
    const riverResult = generateRiverCard(boardCards, usedCards, rng);
    board.river = riverResult.card;
    usedCards = riverResult.usedCards;
  }

  return { board, usedCards };
}

export function generateScenario(difficultyLevel, rng) {
  const minDiff = Math.max(1, difficultyLevel - 2);
  const maxDiff = Math.min(10, difficultyLevel + 1);

  let templates = getTemplatesForDifficulty(minDiff, maxDiff);
  if (templates.length === 0) {
    templates = SCENARIO_TEMPLATES;
  }

  const template = pickRandom(templates, rng);
  const positionMatchup = POSITION_MATCHUPS[template.position] || POSITION_MATCHUPS.IP_VS_BB;

  const { flop, usedCards: boardUsed } = generateBoard(template.boardTextureType, new Set(), rng);
  const { board, usedCards: allBoardUsed } = getStreetBoard(template, flop, boardUsed, rng);

  const handResult = generateHandByCategory(template.handCategoryType, board, allBoardUsed, rng);
  const hand = handResult.hand;

  const { potSize, effectiveStack } = getPotAndStack(template);

  let strategy = calculateStrategy(template, board, hand, potSize, rng);
  strategy = adjustDifficultyEV(strategy, difficultyLevel);

  const explanation = buildExplanation(template, board, hand, strategy);

  scenarioCounter++;

  return {
    id: `arena-${scenarioCounter}`,
    board,
    heroHand: hand,
    heroPosition: positionMatchup.hero,
    villainPosition: positionMatchup.villain,
    potSize,
    effectiveStack,
    street: template.street,
    gtoStrategy: {
      ...strategy,
      explanation,
    },
    _meta: {
      templateId: template.id,
      difficulty: template.difficultyBase,
      requestedDifficulty: difficultyLevel,
    },
  };
}

export function generateBossScenario(floorNumber, rng) {
  const bossDifficulty = Math.min(10, Math.max(7, floorNumber + 2));

  const bossTemplates = SCENARIO_TEMPLATES.filter(t => t.difficultyBase >= 7);
  if (bossTemplates.length === 0) {
    return generateScenario(bossDifficulty, rng);
  }

  const template = pickRandom(bossTemplates, rng);
  const positionMatchup = POSITION_MATCHUPS[template.position] || POSITION_MATCHUPS.IP_VS_BB;

  const { flop, usedCards: boardUsed } = generateBoard(template.boardTextureType, new Set(), rng);
  const { board, usedCards: allBoardUsed } = getStreetBoard(template, flop, boardUsed, rng);

  const handResult = generateHandByCategory(template.handCategoryType, board, allBoardUsed, rng);
  const hand = handResult.hand;

  const { potSize, effectiveStack } = getPotAndStack(template);

  let strategy = calculateStrategy(template, board, hand, potSize, rng);
  strategy = adjustDifficultyEV(strategy, bossDifficulty);

  const explanation = buildExplanation(template, board, hand, strategy);

  scenarioCounter++;

  return {
    id: `boss-${scenarioCounter}`,
    board,
    heroHand: hand,
    heroPosition: positionMatchup.hero,
    villainPosition: positionMatchup.villain,
    potSize,
    effectiveStack,
    street: template.street,
    gtoStrategy: {
      ...strategy,
      explanation,
    },
    _meta: {
      templateId: template.id,
      difficulty: bossDifficulty,
      requestedDifficulty: bossDifficulty,
      isBoss: true,
    },
  };
}
