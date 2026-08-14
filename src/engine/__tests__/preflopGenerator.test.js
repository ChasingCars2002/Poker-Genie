import { describe, it, expect } from 'vitest';
import {
  generatePreflopScenario, analysePreflop, strategyFor, dealHandForSpot, CLOSE_MARGIN,
} from '../preflopGenerator';
import { PREFLOP_SPOTS, spotById, OPENING_RANGES } from '../../data/preflopSpots';
import { parseRange } from '../rangeNotation';
import { breakEvenEquity } from '../odds';
import { rangePercent } from '../equity';
import { CONCEPT_INFO, preflopHandClassOf } from '../../data/concepts';
import { gradeAction } from '../../data/gtoData';

const bbVsBtn = spotById('bb-vs-btn-open');

describe('preflop spots', () => {
  it('states an explicit villain range for every spot', () => {
    // The range is a premise the player is asked to reason from, so it must
    // exist and be non-trivial — an empty one would make the equity meaningless.
    for (const spot of PREFLOP_SPOTS) {
      expect(spot.villainRange.size, spot.id).toBeGreaterThan(0);
    }
  });

  it('keeps the pot and the amount to call consistent', () => {
    for (const spot of PREFLOP_SPOTS) {
      expect(spot.toCall, spot.id).toBeGreaterThan(0);
      expect(spot.potBeforeAction, spot.id).toBeGreaterThan(spot.toCall);
    }
  });

  it('gives opening ranges that widen with position', () => {
    // A model of a competent reg, and the ordering is the part that matters.
    const widths = ['LJ', 'HJ', 'CO', 'BTN'].map(p => rangePercent(parseRange(OPENING_RANGES[p])));
    for (let i = 0; i < widths.length - 1; i++) {
      expect(widths[i], `${i} should be tighter than the next seat`).toBeLessThan(widths[i + 1]);
    }
  });

  it('keeps every opening range plausible in width', () => {
    for (const [position, text] of Object.entries(OPENING_RANGES)) {
      const width = rangePercent(parseRange(text));
      expect(width, `${position} too tight`).toBeGreaterThan(0.08);
      expect(width, `${position} too wide`).toBeLessThan(0.6);
    }
  });
});

describe('analysePreflop', () => {
  it('computes the price from the pot, not from a table', () => {
    const analysis = analysePreflop(bbVsBtn, ['7h', '2d']);
    // BB vs a 2.5x open: 2.5 + 0.5 + 1 = 4 in the middle, call 1.5 more.
    // 1.5 / (4 + 1.5) = 27.3% — the textbook big-blind defence number.
    expect(analysis.requiredEquity).toBeCloseTo(breakEvenEquity(1.5, 4), 10);
    expect(analysis.requiredEquity).toBeCloseTo(1.5 / 5.5, 10);
    expect(analysis.potOdds).toBeCloseTo(4 / 1.5, 10);
  });

  it('prices every spot off the pot already in the middle', () => {
    // Regression: potBeforeAction already excludes hero's call, so subtracting
    // it removes money that was never in there. That put the 3-bet threshold at
    // 60.7% instead of 37.8% — a difference that would have taught folding
    // hands that are comfortable calls.
    for (const spot of PREFLOP_SPOTS) {
      const analysis = analysePreflop(spot, ['Ah', 'Kd']);
      expect(analysis.requiredEquity, spot.id)
        .toBeCloseTo(spot.toCall / (spot.potBeforeAction + spot.toCall), 10);
    }
  });

  it('never asks for more than half the pot in equity on a blind defence', () => {
    // Defending a blind always gets a price better than even money. A threshold
    // above 50% there means the arithmetic is wrong, not that the spot is hard.
    for (const spot of PREFLOP_SPOTS.filter(s => s.context === 'vs-open')) {
      expect(analysePreflop(spot, ['Ah', 'Kd']).requiredEquity, spot.id).toBeLessThan(0.5);
    }
  });

  it('gives the big blind a better price than the small blind against the same open', () => {
    const bb = analysePreflop(spotById('bb-vs-btn-open'), ['Ah', 'Kd']);
    const sb = analysePreflop(spotById('sb-vs-btn-open'), ['Ah', 'Kd']);
    expect(bb.requiredEquity).toBeLessThan(sb.requiredEquity);
  });

  it('rates a premium far above the threshold and junk far below', () => {
    const aces = analysePreflop(bbVsBtn, ['Ah', 'Ad']);
    const junk = analysePreflop(bbVsBtn, ['7h', '2d']);

    expect(aces.equity).toBeGreaterThan(0.8);
    expect(aces.clears).toBe(true);
    expect(junk.equity).toBeLessThan(aces.equity);
  });

  it('reports how many combos the stated range actually contains', () => {
    const { villainCombos } = analysePreflop(bbVsBtn, ['7h', '2d']);
    expect(villainCombos).toBeGreaterThan(100);
  });

  it('derives the answer from the range, so changing the range changes it', () => {
    // The whole point: nothing is looked up. KJo against a wide button open is
    // a comfortable call; against a tight early open it is much closer.
    const wide = { ...bbVsBtn, villainRange: parseRange(OPENING_RANGES.BTN) };
    const tight = { ...bbVsBtn, villainRange: parseRange(OPENING_RANGES.LJ) };

    const vsWide = analysePreflop(wide, ['Kh', 'Jd']);
    const vsTight = analysePreflop(tight, ['Kh', 'Jd']);

    expect(vsWide.equity).toBeGreaterThan(vsTight.equity);
  });

  it('applies blockers, so the same class can differ by suit', () => {
    // Against a range containing suited aces, holding the ace of that suit
    // removes combos and nudges the number.
    const spot = { ...bbVsBtn, villainRange: parseRange('AA, AKs, AQs') };
    const withAce = analysePreflop(spot, ['Ah', '9d']);
    const withoutAce = analysePreflop(spot, ['Th', '9d']);
    expect(withAce.equity).not.toBeCloseTo(withoutAce.equity, 3);
  });

  it('does not flag a trivial decision as close', () => {
    expect(analysePreflop(bbVsBtn, ['Ah', 'Ad']).close).toBe(false);
  });

  it('shows the worst hand in poker as a breakeven call at big-blind prices', () => {
    // Getting 2.7-to-1 against a wide button open, seven-deuce offsuit has
    // about 29% raw equity against a 27.3% threshold. That is the real answer,
    // and it is why the realisation caveat matters: you will not realise 29%
    // out of position with three streets to play, so this is a fold in practice
    // despite clearing the bar on paper. Anyone reading only the margin would
    // learn to defend far too wide.
    const analysis = analysePreflop(bbVsBtn, ['7h', '2d']);

    expect(analysis.equity).toBeGreaterThan(0.27);
    expect(analysis.equity).toBeLessThan(0.32);
    expect(analysis.close).toBe(true);
    expect(bbVsBtn.exact).toBeUndefined(); // so the caveat is shown
  });

  it('rates suited above offsuit for the same ranks', () => {
    const suited = analysePreflop(bbVsBtn, ['7h', '2h']);
    const offsuit = analysePreflop(bbVsBtn, ['7h', '2d']);
    expect(suited.equity).toBeGreaterThan(offsuit.equity);
  });
});

describe('strategyFor', () => {
  it('makes a clear call pure', () => {
    expect(strategyFor({ margin: 0.3, close: false })).toEqual({ call: 100, fold: 0 });
  });

  it('makes a clear fold pure', () => {
    expect(strategyFor({ margin: -0.3, close: false })).toEqual({ call: 0, fold: 100 });
  });

  it('mixes at the boundary, so both actions grade as correct', () => {
    // A hand within a couple of equity points of the threshold is a genuine
    // coin flip. Marking either choice wrong would be false precision — the
    // table itself is only accurate to a few tenths of a point.
    const mixed = strategyFor({ margin: 0.001, close: true });
    expect(mixed.call).toBeGreaterThan(0);
    expect(mixed.fold).toBeGreaterThan(0);
  });

  it('always sums to 100', () => {
    for (const margin of [-0.5, -0.15, -0.05, 0, 0.05, 0.15, 0.5]) {
      const s = strategyFor({ margin, close: Math.abs(margin) <= CLOSE_MARGIN });
      expect(s.call + s.fold, `margin ${margin}`).toBe(100);
    }
  });

  it('never recommends folding a hand that clears the bar by a mile', () => {
    expect(strategyFor({ margin: 0.4, close: false }).fold).toBe(0);
  });
});

describe('generatePreflopScenario', () => {
  it('produces a playable scenario with no board', () => {
    for (let i = 0; i < 100; i++) {
      const s = generatePreflopScenario();
      expect(s.street).toBe('preflop');
      expect(s.board.flop).toBeNull();
      expect(s.heroHand).toHaveLength(2);
      expect(s.gtoStrategy.actions).toHaveLength(2);
    }
  });

  it('never deals the same card twice', () => {
    for (let i = 0; i < 300; i++) {
      const { heroHand } = generatePreflopScenario();
      expect(heroHand[0]).not.toBe(heroHand[1]);
    }
  });

  it('always offers a fold, because hero is always facing a bet preflop', () => {
    for (let i = 0; i < 50; i++) {
      const s = generatePreflopScenario();
      expect(s.gtoStrategy.actions.some(a => a.action === 'fold')).toBe(true);
      expect(s.facingBet).toBeGreaterThan(0);
    }
  });

  it('sums frequencies to 100', () => {
    for (let i = 0; i < 100; i++) {
      const { gtoStrategy } = generatePreflopScenario();
      const total = gtoStrategy.actions.reduce((sum, a) => sum + a.frequency, 0);
      expect(total).toBe(100);
    }
  });

  it('tags concepts that carry coaching content', () => {
    for (let i = 0; i < 100; i++) {
      const { concepts } = generatePreflopScenario();
      expect(CONCEPT_INFO[concepts.primary], `missing ${concepts.primary}`).toBeDefined();
      expect(CONCEPT_INFO[concepts.secondary], `missing ${concepts.secondary}`).toBeDefined();
    }
  });

  it('gives every action a finite EV, so the weekly metric cannot be poisoned', () => {
    // Regression: preflop actions originally shipped with no `ev` at all.
    // calculateEVLoss then took Math.max of undefined, producing NaN, which
    // flowed straight into the mastery model and the weekly BB/hand headline —
    // silently, because NaN fails every comparison rather than throwing.
    for (let i = 0; i < 100; i++) {
      const { gtoStrategy } = generatePreflopScenario();
      for (const action of gtoStrategy.actions) {
        expect(Number.isFinite(action.ev), `${action.action} ev=${action.ev}`).toBe(true);
      }
    }
  });

  it('produces a finite, non-negative EV loss for every possible answer', () => {
    for (let i = 0; i < 100; i++) {
      const scenario = generatePreflopScenario();
      for (const action of ['fold', 'call']) {
        const { evLoss } = gradeAction(scenario.gtoStrategy, action);
        expect(Number.isFinite(evLoss), `${action} on ${scenario.spot.id}`).toBe(true);
        expect(evLoss).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('costs real EV to pick a line the spot never takes', () => {
    // Without this the leak board can never surface a preflop concept: getLeaks
    // filters on evLossPerHand > 0.05.
    let sawPenalty = false;
    for (let i = 0; i < 200 && !sawPenalty; i++) {
      const scenario = generatePreflopScenario();
      const never = scenario.gtoStrategy.actions.find(a => a.frequency === 0);
      if (!never) continue;
      const { evLoss } = gradeAction(scenario.gtoStrategy, never.action);
      if (evLoss > 0.05) sawPenalty = true;
    }
    expect(sawPenalty).toBe(true);
  });

  it('keeps preflop EV losses on the same scale as postflop ones', () => {
    // Both modes feed one leak board ranked by BB bled. A different scale would
    // make preflop either dominate the ranking or disappear from it.
    const losses = [];
    for (let i = 0; i < 200; i++) {
      const scenario = generatePreflopScenario();
      const never = scenario.gtoStrategy.actions.find(a => a.frequency === 0);
      if (never) losses.push(gradeAction(scenario.gtoStrategy, never.action).evLoss);
    }
    expect(losses.length).toBeGreaterThan(0);
    const worst = Math.max(...losses);
    expect(worst).toBeLessThan(5); // postflop blunders live in the same band
  });

  it('labels which numbers are computed and which are assumed', () => {
    const { gtoStrategy } = generatePreflopScenario();
    expect(gtoStrategy.provenance.equity).toBe('computed');
    expect(gtoStrategy.provenance.price).toBe('computed');
    expect(gtoStrategy.provenance.villainRange).toBe('assumed');
  });

  it('explains with real numbers rather than adjectives', () => {
    const { gtoStrategy } = generatePreflopScenario();
    expect(gtoStrategy.explanation).toMatch(/\d+\.\d%/);
    expect(gtoStrategy.explanation).toMatch(/to-1/);
  });

  it('states the realisation caveat on multi-street spots and not on all-ins', () => {
    // Raw equity is the ceiling with streets to come, and exactly right when
    // there are none. Claiming otherwise in either direction would teach a
    // known-expensive bias.
    const jam = spotById('vs-4bet-jam');
    const openSpot = spotById('bb-vs-btn-open');

    const jamScenario = { ...jam };
    const jamAnalysis = analysePreflop(jamScenario, ['Ah', 'Kd']);
    expect(jamAnalysis).toBeDefined();
    expect(jam.exact).toBe(true);
    expect(openSpot.exact).toBeUndefined();
  });

  it('prefers spots teaching a due concept', () => {
    const target = 'vs-jam-premium';
    let sawJam = 0;
    for (let i = 0; i < 40; i++) {
      const s = generatePreflopScenario({ concepts: [target] });
      if (s.spot.context === 'vs-jam') sawJam++;
    }
    expect(sawJam).toBe(40);
  });
});

describe('hand dealing', () => {
  it('biases toward the decision boundary', () => {
    // Uniform dealing would spend the session on snap-calls and snap-folds.
    // Boundary-biased dealing should produce far more genuinely close spots.
    let close = 0;
    for (let i = 0; i < 400; i++) {
      const hand = dealHandForSpot(bbVsBtn, undefined, { boundaryBias: 1 });
      if (analysePreflop(bbVsBtn, hand).close) close++;
    }
    const uniformClose = countCloseUniform(400);
    expect(close).toBeGreaterThan(uniformClose);
  });

  function countCloseUniform(n) {
    let close = 0;
    for (let i = 0; i < n; i++) {
      const hand = dealHandForSpot(bbVsBtn, undefined, { boundaryBias: 0 });
      if (analysePreflop(bbVsBtn, hand).close) close++;
    }
    return close;
  }

  it('deals legal cards', () => {
    for (let i = 0; i < 200; i++) {
      const hand = dealHandForSpot(bbVsBtn);
      expect(hand).toHaveLength(2);
      for (const card of hand) expect(card).toMatch(/^[AKQJT98765432][shdc]$/);
    }
  });
});

describe('preflop hand classification', () => {
  it('recognises the categories a player would name', () => {
    expect(preflopHandClassOf('AA')).toBe('premium');
    expect(preflopHandClassOf('AKs')).toBe('premium');
    expect(preflopHandClassOf('99')).toBe('pair');
    expect(preflopHandClassOf('KQo')).toBe('broadway');
    expect(preflopHandClassOf('A5s')).toBe('suited-ace');
    expect(preflopHandClassOf('76s')).toBe('suited-connector');
    expect(preflopHandClassOf('72o')).toBe('junk');
  });

  it('gives every class a concept with a tip, for both contexts', () => {
    const classes = ['premium', 'pair', 'broadway', 'suited-ace', 'suited-connector', 'junk'];
    for (const context of ['vs-open', 'vs-3bet', 'vs-jam']) {
      for (const handClass of classes) {
        const id = `${context}-${handClass}`;
        expect(CONCEPT_INFO[id], `missing ${id}`).toBeDefined();
        expect(CONCEPT_INFO[id].tip.length, id).toBeGreaterThan(20);
      }
    }
  });
});
