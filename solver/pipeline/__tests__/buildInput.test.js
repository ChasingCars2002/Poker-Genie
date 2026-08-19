import { describe, it, expect } from 'vitest';
import { toSolverRange, buildInput } from '../buildInput.mjs';

// TexasSolver's range parser accepts ONLY `AA`, `AK`, `AKs`, `AKo`, exact
// combos, and an optional `:weight`. Anything else throws "format not
// recognize" and the solve dies before it starts, so these are the tests that
// keep a config from being silently unusable.
describe('toSolverRange', () => {
  it('expands `+` shorthand, which the solver cannot parse itself', () => {
    const out = toSolverRange('22+');
    expect(out.split(',')).toHaveLength(13);
    expect(out).toContain('AA');
    expect(out).toContain('22');
    expect(out).not.toContain('+');
  });

  it('expands suited and offsuit runs separately', () => {
    expect(toSolverRange('ATs+').split(',').sort()).toEqual(['AJs', 'AKs', 'AQs', 'ATs']);
    expect(toSolverRange('KJo+').split(',').sort()).toEqual(['KJo', 'KQo']);
  });

  it('expands a bare pair-less term to both suited and offsuit', () => {
    expect(toSolverRange('AK').split(',').sort()).toEqual(['AKo', 'AKs']);
  });

  it('preserves weights in the solver`s own syntax', () => {
    expect(toSolverRange('AA:0.5')).toBe('AA:0.5');
  });

  it('drops negligible weights the solver would ignore anyway', () => {
    expect(() => toSolverRange('AA:0.001')).toThrow(/expanded to nothing/);
  });

  it('emits nothing the solver would reject', () => {
    const out = toSolverRange('22+, A2s+, K5s+, A2o+, 76s-98s');
    for (const term of out.split(',')) {
      const [body] = term.split(':');
      expect(body).toMatch(/^([AKQJT2-9]{2}[so]?|[AKQJT2-9][shdc][AKQJT2-9][shdc])$/);
    }
  });
});

describe('buildInput', () => {
  const config = {
    pot: 5.5,
    effectiveStack: 97.5,
    betSizes: { flop: { ip: { bet: [33, 75] }, oop: { bet: [33] } } },
    allinThreshold: 0.67,
    accuracy: 0.5,
    maxIteration: 200,
  };
  const input = buildInput({
    config,
    board: ['As', '8h', '3c'],
    ipRange: 'AA,KK',
    oopRange: 'QQ,JJ',
    dumpPath: '/tmp/out.json',
  });

  it('emits the board comma-separated as the solver expects', () => {
    expect(input).toContain('set_board As,8h,3c');
  });

  it('always pins one thread, because the multithreaded solver races', () => {
    expect(input).toContain('set_thread_num 1');
  });

  it('dumps a single street, since deeper dumps run to gigabytes', () => {
    expect(input).toContain('set_dump_rounds 1');
  });

  it('adds an allin option alongside the declared sizes', () => {
    expect(input).toContain('set_bet_sizes ip,flop,bet,33,75');
    expect(input).toContain('set_bet_sizes ip,flop,allin');
  });

  it('orders build_tree before start_solve before dump_result', () => {
    expect(input.indexOf('build_tree')).toBeLessThan(input.indexOf('start_solve'));
    expect(input.indexOf('start_solve')).toBeLessThan(input.indexOf('dump_result'));
  });
});
