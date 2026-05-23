import { LOGIC_TAGS } from '../data/gtoData';
import { getBoardTexture } from './boardGenerator';

function pickInRange(range, rng) {
  const [min, max] = range;
  return min + (rng ? rng() : Math.random()) * (max - min);
}

function roundToNearest25(val) {
  return Math.round(val / 25) * 25;
}

function normalizeFrequencies(actions) {
  const total = actions.reduce((sum, a) => sum + a.frequency, 0);
  if (total === 0) {
    actions[0].frequency = 100;
    return actions;
  }
  if (total === 100) return actions;

  const scale = 100 / total;
  actions.forEach(a => {
    a.frequency = roundToNearest25(a.frequency * scale);
  });

  const newTotal = actions.reduce((sum, a) => sum + a.frequency, 0);
  if (newTotal !== 100) {
    const maxAction = actions.reduce((best, a) => a.frequency > best.frequency ? a : best, actions[0]);
    maxAction.frequency += (100 - newTotal);
    maxAction.frequency = Math.max(0, Math.min(100, maxAction.frequency));
  }

  return actions;
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
  const actions = template.strategyShape.actions.map(a => {
    const rawFreq = pickInRange(a.freqRange, rng);
    const rawEV = potSize * 0.5 + pickInRange(a.evOffset, rng) * potSize * 0.3;

    return {
      action: a.action,
      label: a.label,
      frequency: roundToNearest25(rawFreq),
      ev: Math.round(rawEV * 100) / 100,
      ...(a.sizeMultiplier ? { size: Math.round(potSize * a.sizeMultiplier * 100) / 100 } : {}),
    };
  });

  for (const mod of (template.modifiers || [])) {
    if (evaluateCondition(mod.condition, board, hand)) {
      for (const a of actions) {
        if (mod.freqAdjust && mod.freqAdjust[a.action] !== undefined) {
          a.frequency = roundToNearest25(a.frequency + mod.freqAdjust[a.action]);
          a.frequency = Math.max(0, Math.min(100, a.frequency));
        }
        if (mod.evAdjust && mod.evAdjust[a.action] !== undefined) {
          a.ev = Math.round((a.ev + mod.evAdjust[a.action] * potSize * 0.3) * 100) / 100;
        }
      }
    }
  }

  normalizeFrequencies(actions);

  const bestAction = actions.reduce((best, a) => a.ev > best.ev ? a : best, actions[0]);

  const logicTagCount = Math.min(template.logicTagPool.length, 2 + Math.floor((rng ? rng() : Math.random()) * 2));
  const shuffledTags = [...template.logicTagPool].sort(() => (rng ? rng() : Math.random()) - 0.5);
  const logicTags = shuffledTags.slice(0, logicTagCount).filter(tag => LOGIC_TAGS[tag]);

  return {
    actions,
    bestAction: bestAction.action,
    logicTags,
  };
}

export function adjustDifficultyEV(strategy, difficultyLevel) {
  if (difficultyLevel >= 7) {
    const bestEV = Math.max(...strategy.actions.map(a => a.ev));
    strategy.actions.forEach(a => {
      if (a.action !== strategy.bestAction) {
        const gap = bestEV - a.ev;
        const compressed = gap * (1 - (difficultyLevel - 6) * 0.1);
        a.ev = Math.round((bestEV - Math.max(compressed, 0.01)) * 100) / 100;
      }
    });
  }
  return strategy;
}
