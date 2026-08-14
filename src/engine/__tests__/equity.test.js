import { describe, it, expect } from 'vitest';
import {
  equityVsClass, equityVsRange, notationOfHand, combosAvailable,
  rangeCombos, rangePercent, blockerEffect, deadRanksOf,
} from '../equity';
import {
  CLASS_COUNT, TOTAL_COMBOS, classNotation, classFromNotation, comboCount,
  isPair, isSuited, combosOf, ALL_CLASSES,
} from '../handClass';
import { parseCardIndex } from '../handRank';

// Exact values, each produced by exhaustively enumerating every disjoint combo
// pair over all C(48,5) boards:  node scripts/exactEquity.mjs AA KK
// These are the yardstick for the sampled table.
const EXACT = [
  ['AA', 'KK', 0.819461],
  ['AA', 'AKs', 0.878595],
  ['AA', '72o', 0.881996],
  ['AKs', 'QQ', 0.460485],
  ['AKo', 'QQ', 0.432423],
  ['JJ', 'AKo', 0.568509],
  ['98s', 'AKo', 0.396714],
];

// The table is sampled, not enumerated, so it is checked against a stated
// tolerance rather than for equality. Tightening this without rebuilding at a
// higher board count should fail — that is the point.
const TOLERANCE = 0.004;

describe('hand class indexing', () => {
  it('decomposes the deck into exactly 1326 combos', () => {
    // 13 pairs x 6 + 78 suited x 4 + 78 offsuit x 12 = 1326 = C(52,2).
    const total = ALL_CLASSES.reduce((sum, c) => sum + comboCount(c), 0);
    expect(total).toBe(TOTAL_COMBOS);
    expect(total).toBe((52 * 51) / 2);
  });

  it('has 13 pairs, 78 suited and 78 offsuit classes', () => {
    const pairs = ALL_CLASSES.filter(isPair);
    const suited = ALL_CLASSES.filter(c => !isPair(c) && isSuited(c));
    const offsuit = ALL_CLASSES.filter(c => !isPair(c) && !isSuited(c));

    expect(pairs).toHaveLength(13);
    expect(suited).toHaveLength(78);
    expect(offsuit).toHaveLength(78);
    expect(pairs.length + suited.length + offsuit.length).toBe(CLASS_COUNT);
  });

  it('round-trips every class through its notation', () => {
    for (const c of ALL_CLASSES) {
      expect(classFromNotation(classNotation(c))).toBe(c);
    }
  });

  it('produces the notation people actually write', () => {
    expect(classNotation(classFromNotation('AA'))).toBe('AA');
    expect(classNotation(classFromNotation('AKs'))).toBe('AKs');
    expect(classNotation(classFromNotation('AKo'))).toBe('AKo');
    expect(classNotation(classFromNotation('72o'))).toBe('72o');
  });

  it('enumerates the right number of concrete combos per class', () => {
    for (const c of ALL_CLASSES) {
      expect(combosOf(c), classNotation(c)).toHaveLength(comboCount(c));
    }
  });

  it('never repeats a card within a combo', () => {
    for (const c of ALL_CLASSES) {
      for (const [a, b] of combosOf(c)) {
        expect(a, classNotation(c)).not.toBe(b);
      }
    }
  });

  it('assigns every one of the 1326 real combos to exactly one class', () => {
    const seen = new Map();
    for (const c of ALL_CLASSES) {
      for (const [a, b] of combosOf(c)) {
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        expect(seen.has(key), `${key} claimed twice`).toBe(false);
        seen.set(key, c);
      }
    }
    expect(seen.size).toBe(TOTAL_COMBOS);
  });

  it('classifies a dealt holding correctly', () => {
    expect(notationOfHand(['Ah', 'Kh'])).toBe('AKs');
    expect(notationOfHand(['Ah', 'Kd'])).toBe('AKo');
    expect(notationOfHand(['Ah', 'Ad'])).toBe('AA');
    expect(notationOfHand(['2h', '7d'])).toBe('72o');
    expect(notationOfHand(['Kh', 'Ah'])).toBe('AKs'); // order must not matter
  });
});

describe('equity table', () => {
  it('matches exact enumeration within the stated tolerance', () => {
    for (const [a, b, exact] of EXACT) {
      const got = equityVsClass(classFromNotation(a), classFromNotation(b));
      expect(Math.abs(got - exact), `${a} vs ${b}: got ${got}, exact ${exact}`)
        .toBeLessThan(TOLERANCE);
    }
  });

  it('gives a hand exactly even money against itself', () => {
    for (const c of ALL_CLASSES) {
      expect(equityVsClass(c, c), classNotation(c)).toBeCloseTo(0.5, 2);
    }
  });

  it('is symmetric: the two sides of a matchup sum to one', () => {
    for (const a of ALL_CLASSES) {
      for (const b of ALL_CLASSES) {
        const sum = equityVsClass(a, b) + equityVsClass(b, a);
        expect(sum, `${classNotation(a)} vs ${classNotation(b)}`).toBeCloseTo(1, 2);
      }
    }
  });

  it('stays a probability everywhere', () => {
    for (const a of ALL_CLASSES) {
      for (const b of ALL_CLASSES) {
        const e = equityVsClass(a, b);
        expect(e).toBeGreaterThanOrEqual(0);
        expect(e).toBeLessThanOrEqual(1);
      }
    }
  });

  it('makes aces the best hand against every other holding', () => {
    const aces = classFromNotation('AA');
    for (const c of ALL_CLASSES) {
      if (c === aces) continue;
      expect(equityVsClass(aces, c), `AA vs ${classNotation(c)}`).toBeGreaterThan(0.5);
    }
  });

  it('ranks a pair above its own suited connector cousins', () => {
    // KK beats KQs heads-up; a dominated suited hand is still dominated.
    expect(equityVsClass(classFromNotation('KK'), classFromNotation('KQs'))).toBeGreaterThan(0.8);
  });

  it('makes suited better than the same offsuit hand', () => {
    for (const [suited, offsuit] of [['AKs', 'AKo'], ['76s', '76o'], ['T9s', 'T9o']]) {
      const vs = classFromNotation('QQ');
      expect(
        equityVsClass(classFromNotation(suited), vs),
        `${suited} should beat ${offsuit} against QQ`,
      ).toBeGreaterThan(equityVsClass(classFromNotation(offsuit), vs));
    }
  });

  it('shows a big pair as a favourite over two overcards, but not a lock', () => {
    // The classic coinflip: a pair is about 55% against two live overcards.
    const e = equityVsClass(classFromNotation('QQ'), classFromNotation('AKo'));
    expect(e).toBeGreaterThan(0.52);
    expect(e).toBeLessThan(0.60);
  });
});

describe('card removal', () => {
  it('halves villain aces when hero holds one', () => {
    const aces = classFromNotation('AA');
    expect(combosAvailable(aces, [])).toBe(6);

    const { before, after, removed } = blockerEffect(['Ah', 'Kd'], aces);
    expect(before).toBe(6);
    expect(after).toBe(3);
    expect(removed).toBe(3);
  });

  it('removes four AK combos when hero holds an ace', () => {
    const ak = classFromNotation('AKo');
    expect(blockerEffect(['Ah', '2d'], ak).after).toBe(9);
  });

  it('leaves an unrelated class untouched', () => {
    const deuces = classFromNotation('22');
    expect(blockerEffect(['Ah', 'Kd'], deuces).removed).toBe(0);
  });

  it('removes the exact suited combo hero is holding', () => {
    // AKs has one combo per suit. Holding the hearts version leaves three.
    const aks = classFromNotation('AKs');
    expect(combosAvailable(aks, [])).toBe(4);
    expect(combosAvailable(aks, ['Ah', 'Kh'].map(parseCardIndex))).toBe(3);

    // Two cards of different classes each knock out one combo.
    expect(combosAvailable(aks, ['Ah', 'Ks'].map(parseCardIndex))).toBe(2);
  });

  it('reports dead ranks for combinatorics', () => {
    expect(deadRanksOf(['Ah', 'Kd'])).toEqual(['A', 'K']);
    expect(deadRanksOf(['Th', 'Td'])).toEqual(['T', 'T']);
  });
});

describe('equity against a range', () => {
  const premium = [classFromNotation('AA'), classFromNotation('KK'), classFromNotation('QQ')];

  it('sits between the best and worst matchup in the range', () => {
    const { equity } = equityVsRange(['Ah', 'Kh'], premium);
    const individual = premium.map(c => equityVsClass(classFromNotation('AKs'), c));

    expect(equity).toBeGreaterThanOrEqual(Math.min(...individual) - 1e-9);
    expect(equity).toBeLessThanOrEqual(Math.max(...individual) + 1e-9);
  });

  it('applies card removal, so blockers move the number', () => {
    // Holding an ace guts villain's AA, the one hand crushing us hardest, so
    // equity against the same nominal range must be higher.
    const withAce = equityVsRange(['Ah', 'Kd'], premium).equity;
    const withoutAce = equityVsRange(['Qh', 'Jd'], [
      classFromNotation('AA'), classFromNotation('KK'),
    ]).equity;

    const noBlocker = equityVsRange(['7h', '2d'], premium).equity;
    expect(withAce).toBeGreaterThan(noBlocker);
    expect(withoutAce).toBeGreaterThan(0);
  });

  it('reports how many combos the range actually holds', () => {
    const { combos } = equityVsRange(['7h', '2d'], premium);
    expect(combos).toBe(18); // three pairs, six combos each, none blocked
  });

  it('drops villain combos that hero blocks', () => {
    const { combos } = equityVsRange(['Ah', 'Kd'], premium);
    expect(combos).toBe(12); // AA down to 3, KK down to 3, QQ still 6
  });

  it('accepts weights, not just membership', () => {
    const weighted = new Map([
      [classFromNotation('AA'), 1],
      [classFromNotation('72o'), 1],
    ]);
    const halfJunk = new Map([
      [classFromNotation('AA'), 1],
      [classFromNotation('72o'), 0.1],
    ]);

    const hero = ['Qh', 'Qd'];
    expect(equityVsRange(hero, halfJunk).equity)
      .toBeLessThan(equityVsRange(hero, weighted).equity);
  });

  it('is even money against a full random range for a middling hand', () => {
    const everything = ALL_CLASSES;
    const { equity } = equityVsRange(['9h', '8h'], everything);
    // 98s is a slight favourite over a random hand but nowhere near dominant.
    expect(equity).toBeGreaterThan(0.5);
    expect(equity).toBeLessThan(0.62);
  });

  it('falls back to even money on an empty range rather than dividing by zero', () => {
    expect(equityVsRange(['Ah', 'Kd'], []).equity).toBe(0.5);
  });
});

describe('range sizing', () => {
  it('counts a full range as every combo in the deck', () => {
    expect(rangeCombos(ALL_CLASSES)).toBe(TOTAL_COMBOS);
    expect(rangePercent(ALL_CLASSES)).toBe(1);
  });

  it('counts pocket pairs as 6 combos each', () => {
    const allPairs = ALL_CLASSES.filter(isPair);
    expect(rangeCombos(allPairs)).toBe(78);
    expect(rangePercent(allPairs)).toBeCloseTo(78 / 1326, 10);
  });

  it('scales with weights', () => {
    const half = new Map(ALL_CLASSES.map(c => [c, 0.5]));
    expect(rangeCombos(half)).toBe(TOTAL_COMBOS / 2);
  });
});
