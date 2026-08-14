import { describe, it, expect } from 'vitest';
import {
  evaluate7, parseCardIndex, formatCard, straightHigh, categoryOf,
  CATEGORY, CATEGORY_NAMES, cardIndex, rankOfCard, suitOfCard,
} from '../handRank';

const hand = (...cards) => evaluate7(cards.map(parseCardIndex));
const cat = (...cards) => categoryOf(hand(...cards));

describe('card encoding', () => {
  it('round-trips every card in the deck', () => {
    for (let i = 0; i < 52; i++) {
      expect(parseCardIndex(formatCard(i))).toBe(i);
    }
  });

  it('covers all 52 cards exactly once', () => {
    const seen = new Set();
    for (const rank of '23456789TJQKA') {
      for (const suit of 'shdc') seen.add(parseCardIndex(`${rank}${suit}`));
    }
    expect(seen.size).toBe(52);
  });

  it('decomposes an index back into rank and suit', () => {
    const card = cardIndex(12, 0); // ace of spades
    expect(rankOfCard(card)).toBe(12);
    expect(suitOfCard(card)).toBe(0);
    expect(formatCard(card)).toBe('As');
  });

  it('rejects nonsense', () => {
    expect(() => parseCardIndex('Zz')).toThrow();
  });
});

describe('straightHigh', () => {
  const maskOf = (...ranks) => ranks.reduce((m, r) => m | (1 << r), 0);

  it('finds a broadway straight', () => {
    expect(straightHigh(maskOf(8, 9, 10, 11, 12))).toBe(12);
  });

  it('finds the wheel and calls the five the high card', () => {
    // A-2-3-4-5. The ace plays low, so the straight is five-high (rank index 3).
    expect(straightHigh(maskOf(12, 0, 1, 2, 3))).toBe(3);
  });

  it('prefers the higher straight when six ranks connect', () => {
    expect(straightHigh(maskOf(0, 1, 2, 3, 4, 5))).toBe(5);
  });

  it('returns -1 with a gap', () => {
    expect(straightHigh(maskOf(0, 1, 2, 4, 5))).toBe(-1);
  });

  it('does not wrap around the ace', () => {
    // K-A-2-3-4 is not a straight.
    expect(straightHigh(maskOf(11, 12, 0, 1, 2))).toBe(-1);
  });
});

describe('hand categories', () => {
  it('identifies each category', () => {
    expect(cat('As', 'Ks', 'Qs', 'Js', 'Ts', '2h', '3d')).toBe(CATEGORY.STRAIGHT_FLUSH);
    expect(cat('As', 'Ah', 'Ad', 'Ac', 'Kh', '2h', '3d')).toBe(CATEGORY.QUADS);
    expect(cat('As', 'Ah', 'Ad', 'Kc', 'Kh', '2h', '3d')).toBe(CATEGORY.FULL_HOUSE);
    expect(cat('As', 'Ks', '9s', '5s', '2s', '7h', '3d')).toBe(CATEGORY.FLUSH);
    expect(cat('9s', '8h', '7d', '6c', '5h', 'Ah', 'Kd')).toBe(CATEGORY.STRAIGHT);
    expect(cat('As', 'Ah', 'Ad', 'Kc', 'Qh', '2h', '3d')).toBe(CATEGORY.TRIPS);
    expect(cat('As', 'Ah', 'Kd', 'Kc', 'Qh', '2h', '3d')).toBe(CATEGORY.TWO_PAIR);
    expect(cat('As', 'Ah', 'Kd', 'Qc', 'Jh', '2h', '3d')).toBe(CATEGORY.PAIR);
    expect(cat('As', 'Kh', 'Qd', 'Jc', '9h', '2h', '3d')).toBe(CATEGORY.HIGH_CARD);
  });

  it('finds the wheel as a straight', () => {
    expect(cat('As', '2h', '3d', '4c', '5h', 'Kd', 'Qc')).toBe(CATEGORY.STRAIGHT);
  });

  it('finds the steel wheel as a straight flush', () => {
    expect(cat('As', '2s', '3s', '4s', '5s', 'Kd', 'Qc')).toBe(CATEGORY.STRAIGHT_FLUSH);
  });

  it('reads two sets of trips as a full house', () => {
    expect(cat('As', 'Ah', 'Ad', 'Kc', 'Kh', 'Kd', '3d')).toBe(CATEGORY.FULL_HOUSE);
  });

  it('does not call a 5-card flush with a gappy straight a straight flush', () => {
    expect(cat('As', 'Ks', 'Qs', 'Js', '9s', '2h', '3d')).toBe(CATEGORY.FLUSH);
  });

  it('does not build a straight flush from a straight in mixed suits', () => {
    // Spades are 9-8-7-3-2 (a flush, but not connected) and the straight is
    // 9-8-7-6-5 (connected, but not all spades). Both are present; neither
    // combines into a straight flush, and the flush is the better hand.
    expect(cat('9s', '8s', '7s', '6h', '5d', '2s', '3s')).toBe(CATEGORY.FLUSH);
  });
});

describe('hand comparisons', () => {
  const beats = (a, b) => evaluate7(a.map(parseCardIndex)) > evaluate7(b.map(parseCardIndex));

  it('orders the categories correctly', () => {
    const ladder = [
      ['As', 'Ks', 'Qs', 'Js', 'Ts', '2h', '3d'], // straight flush
      ['9s', '9h', '9d', '9c', 'Kh', '2h', '3d'], // quads
      ['9s', '9h', '9d', 'Kc', 'Kh', '2h', '3d'], // full house
      ['As', 'Ks', '9s', '5s', '2s', '7h', '3d'], // flush
      ['9s', '8h', '7d', '6c', '5h', 'Ah', 'Kd'], // straight
      ['9s', '9h', '9d', 'Kc', 'Qh', '2h', '3d'], // trips
      ['9s', '9h', 'Kd', 'Kc', 'Qh', '2h', '3d'], // two pair
      ['9s', '9h', 'Kd', 'Qc', 'Jh', '2h', '3d'], // pair
      ['As', 'Kh', 'Qd', 'Jc', '9h', '2h', '3d'], // high card
    ];
    for (let i = 0; i < ladder.length - 1; i++) {
      expect(beats(ladder[i], ladder[i + 1]), `${CATEGORY_NAMES[8 - i]} should beat the next`).toBe(true);
    }
  });

  it('beats quads with a straight flush', () => {
    expect(beats(
      ['6s', '7s', '8s', '9s', 'Ts', 'Ah', 'Ad'],
      ['As', 'Ah', 'Ad', 'Ac', 'Kh', '2h', '3d'],
    )).toBe(true);
  });

  it('ranks a higher straight over a lower one', () => {
    expect(beats(
      ['9s', '8h', '7d', '6c', '5h', '2h', '3d'],
      ['8s', '7h', '6d', '5c', '4h', '2h', '3d'],
    )).toBe(true);
  });

  it('ranks the wheel as the lowest straight', () => {
    expect(beats(
      ['6s', '5h', '4d', '3c', '2h', 'Kh', 'Qd'],
      ['As', '2h', '3d', '4c', '5h', 'Kd', 'Qc'],
    )).toBe(true);
  });

  it('separates top pair by kicker', () => {
    expect(beats(
      ['As', 'Ah', 'Kd', 'Qc', 'Jh', '2h', '3d'],
      ['As', 'Ah', 'Qd', 'Jc', '9h', '2h', '3d'],
    )).toBe(true);
  });

  it('uses the third pair as a kicker but never as the hand', () => {
    // Three pairs: aces and kings play, with the queen as kicker.
    const threePair = ['As', 'Ah', 'Kd', 'Kc', 'Qh', 'Qd', '3d'];
    const twoPairWeakKicker = ['As', 'Ah', 'Kd', 'Kc', 'Jh', '7d', '3d'];
    expect(beats(threePair, twoPairWeakKicker)).toBe(true);
    expect(categoryOf(evaluate7(threePair.map(parseCardIndex)))).toBe(CATEGORY.TWO_PAIR);
  });

  it('picks the best five from a seven-card flush', () => {
    const bigFlush = ['As', 'Ks', 'Qs', '4s', '3s', '2s', '5s'];
    const smallFlush = ['Js', 'Ts', '9s', '4s', '3s', '2h', '5h'];
    expect(beats(bigFlush, smallFlush)).toBe(true);
  });

  it('finds a quads kicker outside the quads', () => {
    expect(beats(
      ['9s', '9h', '9d', '9c', 'Ah', '2h', '3d'],
      ['9s', '9h', '9d', '9c', 'Kh', '2h', '3d'],
    )).toBe(true);
  });

  it('ties identical hands played by the board', () => {
    const board = ['As', 'Ks', 'Qs', 'Js', 'Ts'];
    expect(evaluate7([...board, '2h', '3d'].map(parseCardIndex)))
      .toBe(evaluate7([...board, '4c', '7h'].map(parseCardIndex)));
  });

  it('ranks a higher full house over a lower one by the trips', () => {
    expect(beats(
      ['Ks', 'Kh', 'Kd', '2c', '2h', '7h', '8d'],
      ['Qs', 'Qh', 'Qd', 'As', 'Ah', '7h', '8d'],
    )).toBe(true);
  });
});
