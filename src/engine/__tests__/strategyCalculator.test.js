import { describe, it, expect } from 'vitest';
import { calculateStrategy, normalizeFrequencies, _internals } from '../strategyCalculator';
import { SCENARIO_TEMPLATES } from '../../data/scenarioTemplates';
import { classifyEVLoss, calculateEVLoss, gradeAction } from '../../data/gtoData';

// A deterministic RNG so a failure is reproducible rather than a flake.
function seededRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const FLOP = { flop: ['As', '8h', '3c'], turn: null, river: null };
const HAND = ['Ah', 'Kd'];

describe('normalizeFrequencies', () => {
  it('always sums to exactly 100', () => {
    const cases = [
      [10, 20, 30],
      [1, 1, 1],
      [33, 33, 33],
      [99, 1, 0],
      [50, 50, 50, 50],
      [7],
    ];

    for (const freqs of cases) {
      const actions = freqs.map((f, i) => ({ action: `a${i}`, frequency: f }));
      const total = normalizeFrequencies(actions).reduce((s, a) => s + a.frequency, 0);
      expect(total, `input ${freqs}`).toBe(100);
    }
  });

  it('snaps every frequency onto the 25% grid the UI advertises', () => {
    const actions = [{ action: 'a', frequency: 37 }, { action: 'b', frequency: 63 }];
    for (const a of normalizeFrequencies(actions)) {
      expect(a.frequency % 25).toBe(0);
    }
  });

  it('keeps deliberately-zero actions out of the mix', () => {
    const actions = [
      { action: 'check', frequency: 0 },
      { action: 'bet33', frequency: 80 },
      { action: 'bet75', frequency: 20 },
    ];
    const result = normalizeFrequencies(actions);
    expect(result.find(a => a.action === 'check').frequency).toBe(0);
  });

  it('does not mutate its input', () => {
    const actions = [{ action: 'a', frequency: 37 }, { action: 'b', frequency: 63 }];
    normalizeFrequencies(actions);
    expect(actions[0].frequency).toBe(37);
  });

  it('produces a playable strategy from an all-zero shape', () => {
    const result = normalizeFrequencies([
      { action: 'a', frequency: 0 },
      { action: 'b', frequency: 0 },
    ]);
    expect(result.reduce((s, a) => s + a.frequency, 0)).toBe(100);
  });
});

describe('calculateStrategy frequency/EV coherence', () => {
  // This is the invariant the old implementation violated: it rolled EV and
  // frequency from independent ranges, so the trainer could mark the
  // recommended line as a mistake.
  it('never gives a 0%-frequency action the highest EV, across every template', () => {
    for (const template of SCENARIO_TEMPLATES) {
      for (let seed = 1; seed <= 25; seed++) {
        const rng = seededRng(seed * 7919);
        const strategy = calculateStrategy(template, FLOP, HAND, 6.5, rng, 5);

        const bestEV = Math.max(...strategy.actions.map(a => a.ev));
        const zeroFreqAtBest = strategy.actions.filter(a => a.frequency === 0 && a.ev === bestEV);

        expect(zeroFreqAtBest, `${template.id} seed ${seed}`).toHaveLength(0);
      }
    }
  });

  it('makes the recommended action the most frequent one', () => {
    for (const template of SCENARIO_TEMPLATES) {
      for (let seed = 1; seed <= 10; seed++) {
        const strategy = calculateStrategy(template, FLOP, HAND, 6.5, seededRng(seed * 104729), 5);
        const best = strategy.actions.find(a => a.action === strategy.bestAction);
        const maxFrequency = Math.max(...strategy.actions.map(a => a.frequency));

        expect(best.frequency, `${template.id} seed ${seed}`).toBe(maxFrequency);
      }
    }
  });

  it('grades every action in the mix as correct', () => {
    // The indifference principle: if the solver plays it at all, it is not a
    // mistake. Grading a 50%-frequency check as wrong because the 50%-frequency
    // bet scored fractionally higher teaches precision that does not exist.
    for (const template of SCENARIO_TEMPLATES) {
      for (let seed = 1; seed <= 10; seed++) {
        const strategy = calculateStrategy(template, FLOP, HAND, 6.5, seededRng(seed * 15485863), 5);

        for (const action of strategy.actions.filter(a => a.frequency > 0)) {
          const { classification } = gradeAction(strategy, action.action);
          expect(
            ['perfect', 'acceptable'],
            `${template.id} seed ${seed} action ${action.action}`
          ).toContain(classification.grade);
        }
      }
    }
  });

  it('grades actions outside the mix as mistakes', () => {
    for (const template of SCENARIO_TEMPLATES) {
      for (let seed = 1; seed <= 10; seed++) {
        const strategy = calculateStrategy(template, FLOP, HAND, 6.5, seededRng(seed * 32452843), 5);

        for (const action of strategy.actions.filter(a => a.frequency === 0)) {
          const { classification } = gradeAction(strategy, action.action);
          expect(
            ['inaccuracy', 'blunder'],
            `${template.id} seed ${seed} action ${action.action}`
          ).toContain(classification.grade);
        }
      }
    }
  });

  it('tightens the gap between right and wrong as difficulty rises', () => {
    const easy = _internals.mistakeGapFor(1);
    const hard = _internals.mistakeGapFor(10);

    expect(easy).toBeGreaterThan(hard);
    // Even at maximum difficulty the gap must stay above the "acceptable"
    // boundary, or a genuine error would be scored as a correct answer.
    expect(hard).toBeGreaterThan(0.25);
  });

  it('reports acceptableActions matching the non-zero frequencies', () => {
    const strategy = calculateStrategy(SCENARIO_TEMPLATES[0], FLOP, HAND, 6.5, seededRng(42), 5);
    const nonZero = strategy.actions.filter(a => a.frequency > 0).map(a => a.action);
    expect(strategy.acceptableActions.sort()).toEqual(nonZero.sort());
  });
});

describe('calculateEVLoss', () => {
  const strategy = {
    actions: [
      { action: 'check', frequency: 0, ev: 1.0 },
      { action: 'bet33', frequency: 100, ev: 3.0 },
    ],
  };

  it('is zero for the best action', () => {
    expect(calculateEVLoss(strategy, 'bet33')).toBe(0);
  });

  it('never returns a negative loss', () => {
    expect(calculateEVLoss(strategy, 'check')).toBeGreaterThan(0);
  });

  it('does not treat an unknown action as worth exactly zero EV', () => {
    // The old `?? 0` meant folding a +3 BB spot and folding a +0.3 BB spot were
    // graded on a fabricated EV of 0 rather than on anything real.
    const loss = calculateEVLoss(strategy, 'someUnmappedAction');
    expect(loss).toBe(2.0); // falls back to the worst defined action, not 0
  });
});

describe('gradeAction reads the live mix', () => {
  it('grades an action the strategy still plays as correct', () => {
    const strategy = {
      actions: [
        { action: 'check', frequency: 50, ev: 3.0 },
        { action: 'bet33', frequency: 50, ev: 3.0 },
      ],
    };
    expect(gradeAction(strategy, 'check').classification.grade).not.toBe('blunder');
  });

  it('ignores a stale acceptableActions list after an exploit adjustment', () => {
    // EXPLOITS adjusters spread `...strategy`, carrying acceptableActions
    // through unchanged, then rewrite the frequencies underneath it. Trusting
    // the stale list promoted an action the adjusted strategy now never takes
    // to "Acceptable" — rewarding exactly the mistake the exploit teaches
    // against.
    const adjusted = {
      acceptableActions: ['check', 'bet33'], // stale: from before the adjustment
      actions: [
        { action: 'check', frequency: 0, ev: 1.0 },   // exploit dropped this to 0%
        { action: 'bet33', frequency: 100, ev: 3.0 },
      ],
    };

    const { classification } = gradeAction(adjusted, 'check');
    expect(['inaccuracy', 'blunder']).toContain(classification.grade);
  });

  it('still upgrades a genuinely in-mix action that lost on EV alone', () => {
    const strategy = {
      actions: [
        { action: 'check', frequency: 25, ev: 1.0 },  // in the mix, but far behind on EV
        { action: 'bet33', frequency: 75, ev: 3.0 },
      ],
    };
    expect(gradeAction(strategy, 'check').classification.grade).toBe('acceptable');
  });
});

describe('classifyEVLoss boundaries', () => {
  it('grades on the documented thresholds', () => {
    expect(classifyEVLoss(0).grade).toBe('perfect');
    expect(classifyEVLoss(0.05).grade).toBe('perfect');
    expect(classifyEVLoss(0.06).grade).toBe('acceptable');
    expect(classifyEVLoss(0.25).grade).toBe('acceptable');
    expect(classifyEVLoss(0.26).grade).toBe('inaccuracy');
    expect(classifyEVLoss(1.0).grade).toBe('inaccuracy');
    expect(classifyEVLoss(1.01).grade).toBe('blunder');
  });
});
