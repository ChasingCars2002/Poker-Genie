import { describe, it, expect } from 'vitest';
import { encodeAction, encodePath, buildNodeKey, parseNodeKey, chunkPathFor } from '../nodeKey';

describe('encodeAction', () => {
  it('encodes the actions that carry no size', () => {
    expect(encodeAction('CHECK', 5.5)).toBe('x');
    expect(encodeAction('FOLD', 5.5)).toBe('f');
    expect(encodeAction('CALL', 5.5)).toBe('c');
  });

  it('encodes sizes as a percentage of the pot faced', () => {
    // The solver reports absolute chips, so the same decision has a different
    // string in a different pot. Percentages are what make a key stable.
    expect(encodeAction('BET 1.815000', 5.5)).toBe('b33');
    expect(encodeAction('BET 4.125000', 5.5)).toBe('b75');
    expect(encodeAction('RAISE 3.300000', 5.5)).toBe('r60');
  });

  it('gives the same key for the same decision in a scaled pot', () => {
    expect(encodeAction('BET 3.630000', 11)).toBe(encodeAction('BET 1.815000', 5.5));
  });

  it('rounds away float noise', () => {
    expect(encodeAction('BET 1.8150001', 5.5)).toBe('b33');
  });

  it('refuses an unknown verb rather than inventing a key', () => {
    expect(() => encodeAction('SHOVE 97', 5.5)).toThrow(/Unknown solver action/);
  });

  it('refuses a sized action with no pot to measure against', () => {
    expect(() => encodeAction('BET 2.0', 0)).toThrow(/positive pot/);
  });
});

describe('encodePath', () => {
  it('encodes each action against the pot it faced', () => {
    expect(encodePath(['CHECK', 'BET 1.815000'], [5.5, 5.5])).toBe('x-b33');
  });
});

describe('buildNodeKey / parseNodeKey', () => {
  const key = buildNodeKey({
    configId: 'c0', board: ['As', '8h', '3c'], street: 'flop', actor: 'ip', path: 'x',
  });

  it('builds a readable key', () => {
    expect(key).toBe('c0/As8h3c/flop/ip/x');
  });

  it('writes an empty path as _ so every key has the same shape', () => {
    expect(buildNodeKey({ configId: 'c0', board: ['As', '8h', '3c'], street: 'flop', actor: 'oop' }))
      .toBe('c0/As8h3c/flop/oop/_');
  });

  it('carries the runout for later streets', () => {
    expect(buildNodeKey({
      configId: 'c0', board: ['As', '8h', '3c'], street: 'turn', runout: 'Kh', actor: 'ip', path: 'x',
    })).toBe('c0/As8h3c/turn:Kh/ip/x');
  });

  it('accepts a path given as an array', () => {
    expect(buildNodeKey({
      configId: 'c0', board: ['As', '8h', '3c'], street: 'flop', actor: 'oop', path: ['x', 'b33'],
    })).toBe('c0/As8h3c/flop/oop/x-b33');
  });

  it('round-trips every field', () => {
    // The extractor and the runtime both compute keys; if they ever disagreed
    // the failure would be silent, so this is the test that matters most.
    for (const spec of [
      { configId: 'c0', board: ['As', '8h', '3c'], street: 'flop', runout: null, actor: 'ip', path: 'x' },
      { configId: 'c0', board: ['As', '8h', '3c'], street: 'flop', runout: null, actor: 'oop', path: 'x-b33' },
      { configId: 'c2', board: ['Ks', '7h', '2c'], street: 'turn', runout: 'Kh', actor: 'ip', path: '' },
      { configId: 'c0', board: ['9h', '8h', '7s'], street: 'river', runout: 'Ad', actor: 'oop', path: 'x-b75-r60' },
    ]) {
      expect(parseNodeKey(buildNodeKey(spec))).toEqual(spec);
    }
  });

  it('rejects a malformed key rather than half-parsing it', () => {
    expect(() => parseNodeKey('c0/As8h3c/flop/ip')).toThrow(/Malformed node key/);
    expect(() => parseNodeKey('c0/As8h3c/flop/hero/x')).toThrow(/Malformed actor/);
    expect(() => parseNodeKey('c0/notaboard/flop/ip/x')).toThrow(/Malformed board/);
  });

  it('rejects an invalid actor at build time too', () => {
    expect(() => buildNodeKey({ configId: 'c0', board: ['As'], street: 'flop', actor: 'hero' }))
      .toThrow(/actor must be/);
  });
});

describe('chunkPathFor', () => {
  it('maps a node to one file per config, board and street', () => {
    expect(chunkPathFor('c0/As8h3c/flop/ip/x')).toBe('c0/As8h3c/flop.json');
    expect(chunkPathFor('c0/As8h3c/flop/oop/x-b33')).toBe('c0/As8h3c/flop.json');
  });

  it('keeps each runout in its own chunk', () => {
    expect(chunkPathFor('c0/As8h3c/turn:Kh/ip/x')).toBe('c0/As8h3c/turn-Kh.json');
  });
});
