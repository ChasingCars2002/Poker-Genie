import { LOGIC_TAGS } from '../data/gtoData';
import { getBoardTexture } from './boardGenerator';
import { normalizeStrategy } from './gtoEngine';

function pickInRange(range, rng) {
  const [min, max] = range;
  return min + (rng ? rng() : Math.random()) * (max - min);
}

function roundToNearest25(val) {
  return Math.round(val / 25) * 25;
}

function round2(v) {
  return Math.round(v * 100) / 100;
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

export function calculateStrategy(template, board, hand, potSize, rng) {
  // Build the raw action shape. The authored EV offsets seed how "dominated"
  // each line is; the engine then derives the final, internally-consistent EVs.
  const actions = template.strategyShape.actions.map(a => {
    const rawFreq = roundToNearest25(pickInRange(a.freqRange, rng));
    const rawEV = potSize * 0.5 + pickInRange(a.evOffset, rng) * potSize * 0.3;
    return {
      action: a.action,
      label: a.label,
      frequency: rawFreq,
      ev: round2(rawEV),
    };
  });

  for (const mod of (template.modifiers || [])) {
    if (evaluateCondition(mod.condition, board, hand)) {
      for (const a of actions) {
        if (mod.freqAdjust && mod.freqAdjust[a.action] !== undefined) {
          a.frequency = Math.max(0, Math.min(100, roundToNearest25(a.frequency + mod.freqAdjust[a.action])));
        }
        if (mod.evAdjust && mod.evAdjust[a.action] !== undefined) {
          a.ev = round2(a.ev + mod.evAdjust[a.action] * potSize * 0.3);
        }
      }
    }
  }

  const logicTagCount = Math.min(template.logicTagPool.length, 2 + Math.floor((rng ? rng() : Math.random()) * 2));
  const shuffledTags = [...template.logicTagPool].sort(() => (rng ? rng() : Math.random()) - 0.5);
  const logicTags = shuffledTags.slice(0, logicTagCount).filter(tag => LOGIC_TAGS[tag]);

  // Single source of truth: guarantees four actions, frequencies summing to
  // 100, consistent EVs, and an unambiguous best action.
  return normalizeStrategy({ actions, logicTags }, potSize);
}
