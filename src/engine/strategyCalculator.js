import { LOGIC_TAGS } from '../data/gtoData';
import { getBoardTexture } from './boardGenerator';

// Turns a template's strategy *shape* into a concrete strategy with
// frequencies and EVs.
//
// The previous version rolled each action's frequency and EV from independent
// random ranges. Nothing tied them together, so a strategy could come out
// saying "bet 75% of the time" while assigning the highest EV to an action
// played 0% of the time — and the trainer would then mark the recommended line
// wrong. Every EV here is now derived from the frequencies, using the actual
// theory below.

// ── The indifference principle ───────────────────────────────────────────
//
// In an equilibrium strategy, every action taken with non-zero frequency has
// (near-)equal EV — that is *why* the solver mixes. Actions at 0% are the ones
// that are genuinely worse. So:
//
//   - actions in the mix  -> EVs within a hair of each other, all gradeable as
//                            correct, because they really are
//   - actions at 0%       -> a clear EV gap, gradeable as a mistake
//
// This matters for learning: telling someone that the 50%-frequency check was
// "wrong" because the 50%-frequency bet scored 0.01 BB higher teaches a
// precision that does not exist.

// EV gap given to never-played actions, in BB. Wide at low difficulty (the
// mistake is obvious), narrow at high difficulty (the spot is genuinely close)
// — but never below the inaccuracy threshold, or a real error would grade
// as correct.
const MISTAKE_GAP_EASY = 1.6;
const MISTAKE_GAP_HARD = 0.35;

// Spread across the actions that *are* in the mix. Capped below the
// "inaccuracy" boundary of 0.25 BB so a mixed line never grades as an error.
const MIX_SPREAD_MAX = 0.18;

const QUARTER = 25;

function pickInRange(range, rng) {
  const [min, max] = range;
  return min + (rng ? rng() : Math.random()) * (max - min);
}

function round2(val) {
  return Math.round(val * 100) / 100;
}

/**
 * Snap frequencies to the 0/25/50/75/100 grid the app advertises, guaranteeing
 * they sum to exactly 100.
 *
 * Uses largest-remainder over quarters. Naive independent rounding does not
 * sum to 100 — the old implementation patched the shortfall onto whichever
 * action happened to be largest, which could silently push it past 100.
 *
 * Returns a new array; does not mutate the input.
 */
export function normalizeFrequencies(actions) {
  const total = actions.reduce((sum, a) => sum + Math.max(0, a.frequency), 0);

  if (total <= 0) {
    // Degenerate shape (every range rolled to zero). Make the first action pure
    // rather than shipping a strategy with no strategy in it.
    return actions.map((a, i) => ({ ...a, frequency: i === 0 ? 100 : 0 }));
  }

  const TOTAL_QUARTERS = 100 / QUARTER;

  const scaled = actions.map(a => {
    // An action the template rolled to exactly zero stays out of the mix; it is
    // deliberately a "never" action, not a rounding casualty.
    const exact = a.frequency <= 0 ? 0 : (a.frequency / total) * TOTAL_QUARTERS;
    return { floor: Math.floor(exact), remainder: exact - Math.floor(exact), excluded: a.frequency <= 0 };
  });

  let assigned = scaled.reduce((sum, s) => sum + s.floor, 0);

  // Hand out the leftover quarters to the largest remainders.
  const order = scaled
    .map((s, i) => ({ i, remainder: s.remainder, excluded: s.excluded }))
    .filter(s => !s.excluded)
    .sort((a, b) => b.remainder - a.remainder);

  let cursor = 0;
  while (assigned < TOTAL_QUARTERS && order.length > 0) {
    scaled[order[cursor % order.length].i].floor += 1;
    assigned += 1;
    cursor += 1;
  }

  // Over-assignment can only happen if every remainder was zero and the floors
  // already summed high; strip from the smallest non-zero holder.
  while (assigned > TOTAL_QUARTERS) {
    const victim = scaled
      .map((s, i) => ({ i, floor: s.floor }))
      .filter(s => s.floor > 0)
      .sort((a, b) => a.floor - b.floor)[0];
    if (!victim) break;
    scaled[victim.i].floor -= 1;
    assigned -= 1;
  }

  return actions.map((a, i) => ({ ...a, frequency: scaled[i].floor * QUARTER }));
}

function evaluateCondition(condition, board, hand) {
  const boardCards = [...(board.flop || [])];
  if (board.turn) boardCards.push(board.turn);
  if (board.river) boardCards.push(board.river);

  const boardSuits = boardCards.map(c => c[c.length - 1]);
  const handSuits = hand.map(c => c[c.length - 1]);
  const handRanks = hand.map(c => c.slice(0, -1));
  const boardRanks = boardCards.map(c => c.slice(0, -1));

  switch (condition) {
    case 'hasBackdoorFlushDraw': {
      const allSuits = [...boardSuits, ...handSuits];
      const counts = {};
      allSuits.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
      return Object.values(counts).some(c => c >= 3) && boardCards.length <= 3;
    }
    case 'boardHasFlushDraw': {
      const counts = {};
      boardSuits.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
      return Object.values(counts).some(c => c >= 2);
    }
    case 'hasBlocker': {
      return handRanks.some(r => boardRanks.includes(r) || ['A', 'K'].includes(r));
    }
    case 'turnCompletesDraws': {
      if (!board.turn) return false;
      const texture = getBoardTexture(board.flop);
      const turnSuit = board.turn[board.turn.length - 1];
      const flopSuits = board.flop.map(c => c[c.length - 1]);
      const suitCount = flopSuits.filter(s => s === turnSuit).length;
      return suitCount >= 2 || texture.isConnected;
    }
    default:
      return false;
  }
}

/** How wide the gap to a never-played action should be at this difficulty. */
function mistakeGapFor(difficulty) {
  const t = (Math.max(1, Math.min(10, difficulty)) - 1) / 9;
  return MISTAKE_GAP_EASY + t * (MISTAKE_GAP_HARD - MISTAKE_GAP_EASY);
}

/**
 * Assign EVs consistent with the frequencies.
 *
 * @param {Array} actions actions carrying final frequencies
 * @param {number} baseEV EV of the best line, in BB
 * @param {number} difficulty 1-10
 */
function assignEVs(actions, baseEV, difficulty) {
  const played = actions.filter(a => a.frequency > 0);
  if (played.length === 0) return actions.map(a => ({ ...a, ev: round2(baseEV) }));

  const topFrequency = Math.max(...played.map(a => a.frequency));
  const gap = mistakeGapFor(difficulty);

  // Higher difficulty also tightens the mix, so close spots feel close.
  const spread = MIX_SPREAD_MAX * (0.35 + 0.65 * ((Math.min(10, difficulty) - 1) / 9));

  return actions.map(a => {
    if (a.frequency <= 0) {
      // Never-played actions sit a full mistake-gap below the mix. Spreading
      // them slightly keeps two different wrong answers from tying.
      const extra = a.action === 'fold' ? 0.35 : 0;
      return { ...a, ev: round2(baseEV - gap - extra) };
    }

    // In-mix actions are near-indifferent; the most frequent one keeps the
    // reference EV and the rest sit a sliver below, in proportion to how much
    // less often the solver picks them.
    const shortfall = (topFrequency - a.frequency) / 100;
    return { ...a, ev: round2(baseEV - shortfall * spread) };
  });
}

export function calculateStrategy(template, board, hand, potSize, rng, difficulty = 5) {
  // Roll frequencies from the template's shape.
  let actions = template.strategyShape.actions.map(a => ({
    action: a.action,
    label: a.label,
    frequency: pickInRange(a.freqRange, rng),
    ...(a.sizeMultiplier ? { size: round2(potSize * a.sizeMultiplier) } : {}),
  }));

  // How good the spot is overall, independent of which action we pick. Taken
  // from the best action's offset so a strong holding shows a strong EV.
  const bestOffset = Math.max(...template.strategyShape.actions.map(a => pickInRange(a.evOffset, rng)));
  let baseEV = potSize * 0.5 + bestOffset * potSize * 0.3;

  // Modifiers nudge *frequencies*. Their evAdjust now moves the whole spot's
  // value rather than one action's, because per-action EV tweaks would break
  // the frequency/EV consistency established below.
  for (const mod of (template.modifiers || [])) {
    if (!evaluateCondition(mod.condition, board, hand)) continue;

    if (mod.freqAdjust) {
      actions = actions.map(a => (
        mod.freqAdjust[a.action] === undefined
          ? a
          : { ...a, frequency: Math.max(0, Math.min(100, a.frequency + mod.freqAdjust[a.action])) }
      ));
    }
    if (mod.evAdjust) {
      const shift = Object.values(mod.evAdjust).reduce((sum, v) => sum + v, 0) / Object.keys(mod.evAdjust).length;
      baseEV += shift * potSize * 0.3;
    }
  }

  actions = normalizeFrequencies(actions);
  actions = assignEVs(actions, baseEV, difficulty);

  // The recommended line is the one played most often. Ties go to the higher
  // EV, which after assignEVs is the same thing — kept explicit for clarity.
  const bestAction = actions.reduce((best, a) => {
    if (a.frequency !== best.frequency) return a.frequency > best.frequency ? a : best;
    return a.ev > best.ev ? a : best;
  }, actions[0]);

  const roll = () => (rng ? rng() : Math.random());
  const logicTagCount = Math.min(template.logicTagPool.length, 2 + Math.floor(roll() * 2));
  const shuffledTags = [...template.logicTagPool].sort(() => roll() - 0.5);
  const logicTags = shuffledTags.slice(0, logicTagCount).filter(tag => LOGIC_TAGS[tag]);

  return {
    actions,
    bestAction: bestAction.action,
    // Every action in the mix is a defensible choice — the UI uses this to
    // avoid presenting a mixed strategy as having one right answer.
    acceptableActions: actions.filter(a => a.frequency > 0).map(a => a.action),
    logicTags,
    difficulty,
  };
}

export const _internals = { mistakeGapFor, assignEVs, MIX_SPREAD_MAX, MISTAKE_GAP_EASY, MISTAKE_GAP_HARD };
