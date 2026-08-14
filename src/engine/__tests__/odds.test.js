import { describe, it, expect } from 'vitest';
import {
  breakEvenEquity, potOddsRatio, minimumDefenceFrequency, breakEvenBluffFrequency,
  requiredFoldEquity, drawEquity, ruleOfTwoAndFour, callEV, combosRemaining,
} from '../odds';

// Everything in odds.js is arithmetic with one right answer, so these assert
// exact values rather than ranges.

describe('breakEvenEquity', () => {
  it('needs a third against a half-pot bet', () => {
    // Call 5 into a pot of 10: risk 5 to win 15.
    expect(breakEvenEquity(5, 10)).toBeCloseTo(1 / 3, 10);
  });

  it('needs a quarter against a third-pot bet', () => {
    expect(breakEvenEquity(1, 3)).toBeCloseTo(0.25, 10);
  });

  it('needs a third against a pot-sized bet, counting the bet in the pot', () => {
    // Villain bets 10 into 10; the pot is now 20 and you call 10.
    expect(breakEvenEquity(10, 20)).toBeCloseTo(1 / 3, 10);
  });

  it('is free when there is nothing to call', () => {
    expect(breakEvenEquity(0, 10)).toBe(0);
  });

  it('approaches 1 as the price gets absurd', () => {
    expect(breakEvenEquity(1000, 1)).toBeGreaterThan(0.99);
  });
});

describe('potOddsRatio', () => {
  it('quotes the odds the way a table does', () => {
    expect(potOddsRatio(5, 15)).toBe(3);
  });

  it('agrees with breakEvenEquity', () => {
    for (const [call, pot] of [[5, 10], [1, 3], [10, 20], [7, 13]]) {
      const ratio = potOddsRatio(call, pot);
      expect(breakEvenEquity(call, pot)).toBeCloseTo(1 / (ratio + 1), 10);
    }
  });
});

describe('minimumDefenceFrequency', () => {
  it('is two thirds against a half-pot bet', () => {
    expect(minimumDefenceFrequency(5, 10)).toBeCloseTo(2 / 3, 10);
  });

  it('is a half against a pot-sized bet', () => {
    expect(minimumDefenceFrequency(10, 10)).toBeCloseTo(0.5, 10);
  });

  it('falls as the bet grows', () => {
    const sizes = [3, 5, 10, 20, 50];
    const defences = sizes.map(b => minimumDefenceFrequency(b, 10));
    for (let i = 0; i < defences.length - 1; i++) {
      expect(defences[i]).toBeGreaterThan(defences[i + 1]);
    }
  });

  it('is the complement of the break-even bluff frequency', () => {
    for (const bet of [1, 3, 5, 10, 25]) {
      expect(minimumDefenceFrequency(bet, 10) + breakEvenBluffFrequency(bet, 10)).toBeCloseTo(1, 10);
    }
  });
});

describe('breakEvenBluffFrequency', () => {
  it('needs to work half the time at pot size', () => {
    expect(breakEvenBluffFrequency(10, 10)).toBeCloseTo(0.5, 10);
  });

  it('needs to work a third of the time at half pot', () => {
    expect(breakEvenBluffFrequency(5, 10)).toBeCloseTo(1 / 3, 10);
  });

  it('needs to work a quarter of the time at a third pot', () => {
    expect(breakEvenBluffFrequency(5, 15)).toBeCloseTo(0.25, 10);
  });
});

describe('requiredFoldEquity', () => {
  it('demands nothing when the hand is already ahead', () => {
    expect(requiredFoldEquity(10, 10, 0.6)).toBe(0);
  });

  it('demands everything from a hand drawing dead', () => {
    // With zero equity when called, a pot-sized bet must simply win outright.
    expect(requiredFoldEquity(10, 10, 0)).toBeCloseTo(0.5, 10);
  });

  it('demands less as the hand keeps more equity', () => {
    const needs = [0, 0.15, 0.3, 0.45].map(e => requiredFoldEquity(10, 10, e));
    for (let i = 0; i < needs.length - 1; i++) {
      expect(needs[i]).toBeGreaterThan(needs[i + 1]);
    }
  });

  it('stays a probability', () => {
    for (const bet of [1, 5, 10, 30]) {
      for (const eq of [0, 0.1, 0.25, 0.5, 0.9]) {
        const need = requiredFoldEquity(bet, 10, eq);
        expect(need).toBeGreaterThanOrEqual(0);
        expect(need).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('drawEquity', () => {
  it('is exact for one card to come', () => {
    // Nine outs, 46 unseen on the turn.
    expect(drawEquity(9, 1)).toBeCloseTo(9 / 46, 10);
  });

  it('is exact for a flush draw from the flop', () => {
    // 1 - (38/47)(37/46) = 34.97%, not the 36% the rule of 4 claims.
    const expected = 1 - (38 / 47) * (37 / 46);
    expect(drawEquity(9, 2)).toBeCloseTo(expected, 10);
    expect(drawEquity(9, 2)).toBeCloseTo(0.3497, 4);
  });

  it('is exact for an open-ended straight draw from the flop', () => {
    expect(drawEquity(8, 2)).toBeCloseTo(1 - (39 / 47) * (38 / 46), 10);
    expect(drawEquity(8, 2)).toBeCloseTo(0.3145, 4);
  });

  it('is exact for a gutshot from the flop', () => {
    // 1 - (43·42)/(47·46) = 356/2162
    expect(drawEquity(4, 2)).toBeCloseTo(356 / 2162, 10);
    expect(drawEquity(4, 2)).toBeCloseTo(0.1647, 4);
  });

  it('has no equity with no outs', () => {
    expect(drawEquity(0, 2)).toBe(0);
  });

  it('is certain when every unseen card is an out', () => {
    expect(drawEquity(46, 1, 46)).toBe(1);
  });

  it('falls short of the rule of 2 and 4 on every real draw', () => {
    // The rule over-states from eight outs up, and the error grows with the
    // draw: at fifteen outs it promises 60% against a true 54%. Acting on the
    // rule with a big draw means calling prices that are not there.
    for (const outs of [8, 9, 12, 15]) {
      expect(drawEquity(outs, 2), `${outs} outs`).toBeLessThan(ruleOfTwoAndFour(outs, 2));
    }
    expect(ruleOfTwoAndFour(15, 2) - drawEquity(15, 2)).toBeGreaterThan(0.05);
  });

  it('is slightly understated by the rule for a gutshot', () => {
    // The rule is not uniformly optimistic — below about five outs it errs the
    // other way. Worth knowing before trusting it as a rule of thumb.
    expect(drawEquity(4, 2)).toBeGreaterThan(ruleOfTwoAndFour(4, 2));
  });
});

describe('callEV', () => {
  it('is zero exactly at the break-even point', () => {
    const pot = 10;
    const call = 5;
    expect(callEV(breakEvenEquity(call, pot), call, pot)).toBeCloseTo(0, 10);
  });

  it('is positive above it and negative below', () => {
    expect(callEV(0.5, 5, 10)).toBeGreaterThan(0);
    expect(callEV(0.2, 5, 10)).toBeLessThan(0);
  });
});

describe('combosRemaining', () => {
  it('counts a fresh deck correctly', () => {
    expect(combosRemaining({ ranks: ['A', 'A'], suited: null })).toBe(6);
    expect(combosRemaining({ ranks: ['A', 'K'], suited: true })).toBe(4);
    expect(combosRemaining({ ranks: ['A', 'K'], suited: false })).toBe(12);
    expect(combosRemaining({ ranks: ['A', 'K'], suited: null })).toBe(16);
  });

  it('halves villain pocket aces when you hold one ace', () => {
    // The canonical blocker: 6 combos become 3.
    expect(combosRemaining({ ranks: ['A', 'A'], suited: null }, ['A'])).toBe(3);
  });

  it('leaves one combo of aces when you hold two', () => {
    expect(combosRemaining({ ranks: ['A', 'A'], suited: null }, ['A', 'A'])).toBe(1);
  });

  it('cuts AK from sixteen to twelve when you hold an ace', () => {
    expect(combosRemaining({ ranks: ['A', 'K'], suited: null }, ['A'])).toBe(12);
  });

  it('cuts suited AK from four to three when you hold an ace', () => {
    expect(combosRemaining({ ranks: ['A', 'K'], suited: true }, ['A'])).toBe(3);
  });

  it('never goes negative', () => {
    expect(combosRemaining({ ranks: ['A', 'A'], suited: null }, ['A', 'A', 'A', 'A'])).toBe(0);
    expect(combosRemaining({ ranks: ['A', 'K'], suited: null }, ['A', 'A', 'A', 'A'])).toBe(0);
  });

  it('keeps suited plus offsuit equal to the total', () => {
    for (const dead of [[], ['A'], ['K'], ['A', 'K']]) {
      const suited = combosRemaining({ ranks: ['A', 'K'], suited: true }, dead);
      const offsuit = combosRemaining({ ranks: ['A', 'K'], suited: false }, dead);
      const any = combosRemaining({ ranks: ['A', 'K'], suited: null }, dead);
      expect(suited + offsuit, `dead: ${dead}`).toBe(any);
    }
  });
});
