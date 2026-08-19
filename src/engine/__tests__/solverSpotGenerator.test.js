import { describe, it, expect } from 'vitest';
import fixture from '../../solver/__fixtures__/c0-lite-as8h3c.json';
import {
  mapAction, decisionRelevance, pickCombo, splitCombo, buildSolverScenario,
} from '../solverSpotGenerator';

// Genuine TexasSolver output: BTN vs BB on As 8h 3c, pot 5.5bb, stack 97.5bb.
// Under-converged and labelled as such, which is fine for exercising code paths.
const root = fixture.nodes.find((n) => n.path === '');
const facingBet = fixture.nodes.find((n) => n.path !== '');

describe('mapAction', () => {
  it('maps the sizeless verbs', () => {
    expect(mapAction('CHECK', 5.5, 97.5)).toMatchObject({ action: 'check' });
    expect(mapAction('FOLD', 5.5, 97.5)).toMatchObject({ action: 'fold' });
  });

  it('names bets by percentage of pot', () => {
    expect(mapAction('BET 1.815000', 5.5, 97.5)).toMatchObject({ action: 'bet33', label: 'Bet 33%' });
  });

  it('calls an all-in an all-in rather than a 1764% bet', () => {
    // The solver reaches this through set_allin_threshold, not a configured
    // size, so expressing it as a percentage would be nonsense.
    expect(mapAction('BET 97.000000', 5.5, 97.5)).toMatchObject({ action: 'allin', label: 'All-in' });
  });

  it('refuses an unknown verb', () => {
    expect(() => mapAction('SHOVE 97', 5.5, 97.5)).toThrow(/Unknown solver action/);
  });
});

describe('decisionRelevance', () => {
  it('is zero for a pure strategy', () => {
    expect(decisionRelevance([1, 0, 0])).toBe(0);
  });

  it('rises as the strategy mixes', () => {
    expect(decisionRelevance([0.5, 0.5, 0])).toBeGreaterThan(decisionRelevance([0.9, 0.1, 0]));
  });
});

describe('splitCombo', () => {
  it('splits the solver`s combo keys', () => {
    expect(splitCombo('AcKs')).toEqual(['Ac', 'Ks']);
    expect(splitCombo('2d2c')).toEqual(['2d', '2c']);
  });

  it('rejects anything malformed', () => {
    expect(() => splitCombo('AcK')).toThrow(/Malformed combo/);
  });
});

describe('the fixture is real solver output', () => {
  it('carries many combos at each node', () => {
    expect(root.comboCount).toBeGreaterThan(400);
  });

  it('has continuous frequencies, not the old 0/25/50/75/100 buckets', () => {
    const quarters = root.combos.filter((c) =>
      c.freq.every((f) => [0, 0.25, 0.5, 0.75, 1].includes(f)));
    expect(quarters.length / root.combos.length).toBeLessThan(0.05);
  });

  it('has a constant fold baseline where folding is offered', () => {
    // Folding costs every hand the same: what it already put in.
    expect(facingBet.foldEV).toBe(-2.75);
  });
});

describe('buildSolverScenario', () => {
  const scenario = buildSolverScenario({
    chunk: fixture, node: root, comboIndex: 0,
    heroPosition: 'BTN', villainPosition: 'BB',
  });

  it('emits the board in the shape the UI already renders', () => {
    expect(scenario.board).toEqual({ flop: ['As', '8h', '3c'], turn: null, river: null });
    expect(scenario.street).toBe('flop');
  });

  it('gives hero two real cards', () => {
    expect(scenario.heroHand).toHaveLength(2);
    expect(scenario.heroHand[0]).toMatch(/^[AKQJT2-9][shdc]$/);
  });

  it('carries frequencies that sum to about 100%', () => {
    const total = scenario.gtoStrategy.actions.reduce((a, x) => a + x.frequency, 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it('picks bestAction by frequency, not by EV', () => {
    // In a mixed strategy the EVs are equal by construction, so ordering by EV
    // would be reading convergence noise.
    const actions = scenario.gtoStrategy.actions;
    const maxFreq = Math.max(...actions.map((a) => a.frequency));
    expect(actions.find((a) => a.action === scenario.gtoStrategy.bestAction).frequency).toBe(maxFreq);
  });

  it('offers no fold when hero faces no bet', () => {
    expect(scenario.gtoStrategy.actions.some((a) => a.action === 'fold')).toBe(false);
    expect(scenario.facingBet).toBeUndefined();
    expect(scenario.decisionMode).toBe('bet');
  });

  it('records provenance so the UI can be honest about it', () => {
    expect(scenario.gtoStrategy.solverMeta.exploitability).toBeCloseTo(7.66, 1);
    expect(scenario.gtoStrategy.solverMeta.converged).toBe(false);
  });

  it('switches to defend mode at a node facing a bet', () => {
    const defend = buildSolverScenario({
      chunk: fixture, node: facingBet, comboIndex: 0,
      heroPosition: 'BB', villainPosition: 'BTN',
    });
    expect(defend.decisionMode).toBe('defend');
    expect(defend.facingBet).toBe(2);
    expect(defend.gtoStrategy.actions.some((a) => a.action === 'fold')).toBe(true);
  });
});

describe('pickCombo', () => {
  it('is deterministic under an injected rng', () => {
    const rng = () => 0.5;
    expect(pickCombo(root, { rng })).toBe(pickCombo(root, { rng }));
  });

  it('returns an index within the node', () => {
    const idx = pickCombo(root, { rng: () => 0.99 });
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(root.combos.length);
  });

  it('favours mixed hands over pure ones', () => {
    // Over many draws, the average mixedness of chosen hands should beat the
    // node average — that is the whole point of the weighting.
    let seed = 1;
    const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const picks = Array.from({ length: 300 }, () => pickCombo(root, { rng }));
    const meanPicked = picks.reduce((a, i) => a + decisionRelevance(root.combos[i].freq), 0) / picks.length;
    const meanAll = root.combos.reduce((a, c) => a + decisionRelevance(c.freq), 0) / root.combos.length;
    expect(meanPicked).toBeGreaterThan(meanAll);
  });
});
