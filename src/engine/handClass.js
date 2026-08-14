// The 169 strategically distinct starting hands.
//
// Preflop, AhKh and AsKs play identically — only "ace-king suited" matters.
// Collapsing 1326 combos into 169 classes is what makes preflop tractable
// enough to compute exactly, and it is the axis of every range chart ever
// drawn.
//
// Indexing follows the conventional 13x13 grid: row and column are ranks in
// descending order (A=0 … 2=12), pairs on the diagonal, suited above it,
// offsuit below. `index = row * 13 + col`.

// Explicit .js extension, unlike the rest of the app: scripts/buildEquityTable.mjs
// imports this module in plain Node, which does not do extensionless resolution.
// Vite and vitest resolve it either way.
import { rankOfCard, suitOfCard } from './handRank.js';

/** Grid order, highest first — the same order as the chart axes. */
export const GRID_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export const CLASS_COUNT = 169;
export const TOTAL_COMBOS = 1326; // C(52,2)

/** Convert an evaluator rank (0=2 … 12=A) into a grid rank (0=A … 12=2). */
export const gridRankOf = (rank) => 12 - rank;

export function classIndexFromGridRanks(a, b, suited) {
  if (a === b) return a * 13 + a;
  const high = Math.min(a, b);
  const low = Math.max(a, b);
  return suited ? high * 13 + low : low * 13 + high;
}

/** Class index for two card indices (see handRank.js for the encoding). */
export function classOfCards(card1, card2) {
  const a = gridRankOf(rankOfCard(card1));
  const b = gridRankOf(rankOfCard(card2));
  return classIndexFromGridRanks(a, b, suitOfCard(card1) === suitOfCard(card2));
}

export function isPair(classIndex) {
  return (classIndex / 13 | 0) === classIndex % 13;
}

export function isSuited(classIndex) {
  const row = classIndex / 13 | 0;
  return row < classIndex % 13;
}

/**
 * How many of the 1326 combos this class represents.
 * Pairs have 6, suited hands 4, offsuit hands 12 — and 13*6 + 78*4 + 78*12
 * comes to exactly 1326, which is a useful thing to assert.
 */
export function comboCount(classIndex) {
  if (isPair(classIndex)) return 6;
  return isSuited(classIndex) ? 4 : 12;
}

/** Grid notation: 'AA', 'AKs', 'AKo'. */
export function classNotation(classIndex) {
  const row = classIndex / 13 | 0;
  const col = classIndex % 13;
  if (row === col) return `${GRID_RANKS[row]}${GRID_RANKS[row]}`;
  const high = GRID_RANKS[Math.min(row, col)];
  const low = GRID_RANKS[Math.max(row, col)];
  return `${high}${low}${row < col ? 's' : 'o'}`;
}

const NOTATION_TO_INDEX = new Map();
for (let i = 0; i < CLASS_COUNT; i++) NOTATION_TO_INDEX.set(classNotation(i), i);

export function classFromNotation(notation) {
  const index = NOTATION_TO_INDEX.get(notation);
  if (index === undefined) throw new Error(`Unknown hand class: ${notation}`);
  return index;
}

export const ALL_CLASSES = Array.from({ length: CLASS_COUNT }, (_, i) => i);

/** Every concrete two-card combo of a class, as pairs of card indices. */
export function combosOf(classIndex) {
  const row = classIndex / 13 | 0;
  const col = classIndex % 13;
  const rankA = 12 - Math.min(row, col); // back to evaluator ranks
  const rankB = 12 - Math.max(row, col);
  const combos = [];

  if (row === col) {
    for (let s1 = 0; s1 < 4; s1++) {
      for (let s2 = s1 + 1; s2 < 4; s2++) combos.push([rankA * 4 + s1, rankA * 4 + s2]);
    }
    return combos;
  }

  if (row < col) { // suited
    for (let s = 0; s < 4; s++) combos.push([rankA * 4 + s, rankB * 4 + s]);
    return combos;
  }

  for (let s1 = 0; s1 < 4; s1++) {
    for (let s2 = 0; s2 < 4; s2++) {
      if (s1 !== s2) combos.push([rankA * 4 + s1, rankB * 4 + s2]);
    }
  }
  return combos;
}
