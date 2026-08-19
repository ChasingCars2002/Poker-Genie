import { describe, it, expect } from 'vitest';
import { parseAction, walkNodes, extractNode, extractDump } from '../extract.mjs';

// A miniature dump in exactly the shape TexasSolver emits, including the
// doubly-nested `strategy.strategy` and the misspelled `childrens` key.
function makeNode({ actions, strategy, evs, childrens }) {
  return {
    node_type: 'action_node',
    player: 0,
    actions,
    strategy: { actions, strategy },
    ...(evs ? { evs: { actions, evs } } : {}),
    ...(childrens ? { childrens } : {}),
  };
}

describe('parseAction', () => {
  it('parses verbs with no amount', () => {
    expect(parseAction('CHECK', 5.5)).toMatchObject({ kind: 'check', amount: null, pctPot: null });
    expect(parseAction('FOLD', 5.5).kind).toBe('fold');
  });

  it('recovers bet size as a percentage of pot', () => {
    expect(parseAction('BET 1.815000', 5.5)).toMatchObject({ kind: 'bet', amount: 1.815, pctPot: 33 });
    expect(parseAction('BET 4.125000', 5.5).pctPot).toBe(75);
  });

  it('does not divide by a zero pot', () => {
    expect(parseAction('BET 2.0', 0).pctPot).toBeNull();
  });
});

describe('walkNodes', () => {
  it('yields action nodes with their action path and skips chance nodes', () => {
    const dump = makeNode({
      actions: ['CHECK', 'BET 2.0'],
      strategy: { AcKs: [1, 0] },
      evs: { AcKs: [1, 2] },
      childrens: {
        CHECK: { node_type: 'chance_node', deal_number: 48, dealcards: {} },
        'BET 2.0': makeNode({ actions: ['CALL', 'FOLD'], strategy: { AcKs: [1, 0] }, evs: { AcKs: [3, -1] } }),
      },
    });
    const paths = [...walkNodes(dump)].map((n) => n.path.join('/'));
    expect(paths).toEqual(['', 'BET 2.0']);
  });
});

describe('extractNode', () => {
  const base = {
    node: makeNode({
      actions: ['CALL', 'FOLD'],
      strategy: { AcKs: [0.75, 0.25], '7d2c': [0.1, 0.9] },
      evs: { AcKs: [3.5, -2.75], '7d2c': [-8.25, -2.75] },
    }),
    path: ['BET 2.0'],
  };

  it('keeps per-combo frequencies and EVs', () => {
    const out = extractNode(base, { potAtNode: 5.5 });
    expect(out.comboCount).toBe(2);
    expect(out.combos[0]).toMatchObject({ combo: 'AcKs', freq: [0.75, 0.25], ev: [3.5, -2.75] });
  });

  it('records the constant fold baseline', () => {
    // TexasSolver EVs are net chips from the start of the subgame, so folding
    // is worth -(your own contribution) — the same for every hand.
    expect(extractNode(base, { potAtNode: 5.5 }).foldEV).toBe(-2.75);
  });

  it('throws when the fold column varies, which cannot happen in a correct solve', () => {
    const bad = {
      ...base,
      node: makeNode({
        actions: ['CALL', 'FOLD'],
        strategy: { AcKs: [1, 0], '7d2c': [1, 0] },
        evs: { AcKs: [3.5, -2.75], '7d2c': [-8.25, -1.0] },
      }),
    };
    expect(() => extractNode(bad, { potAtNode: 5.5 })).toThrow(/Fold EV varies/);
  });

  it('refuses a dump with no EV block rather than shipping frequencies alone', () => {
    const noEvs = {
      node: makeNode({ actions: ['CHECK'], strategy: { AcKs: [1] } }),
      path: [],
    };
    expect(() => extractNode(noEvs, { potAtNode: 5.5 })).toThrow(/0001-dump-evs\.patch/);
  });

  it('leaves foldEV null when folding is not on offer', () => {
    const noFold = {
      node: makeNode({ actions: ['CHECK', 'BET 2.0'], strategy: { AcKs: [1, 0] }, evs: { AcKs: [1.5, 1.2] } }),
      path: [],
    };
    expect(extractNode(noFold, { potAtNode: 5.5 }).foldEV).toBeNull();
  });
});

describe('extractDump', () => {
  it('extracts every action node in the tree', () => {
    const dump = makeNode({
      actions: ['CHECK', 'BET 2.0'],
      strategy: { AcKs: [0.6, 0.4] },
      evs: { AcKs: [1.5, 1.55] },
      childrens: {
        'BET 2.0': makeNode({ actions: ['CALL', 'FOLD'], strategy: { AcKs: [1, 0] }, evs: { AcKs: [3, -2.75] } }),
      },
    });
    const nodes = extractDump(dump, { pot: 5.5 });
    expect(nodes.map((n) => n.path)).toEqual(['', 'BET 2.0']);
  });
});
