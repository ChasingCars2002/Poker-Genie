import { describe, it, expect } from 'vitest';
import { parseCheckpoints, fitPowerLaw, iterationsToReach, estimateSolve } from '../convergence.mjs';

// Real output from the 100bb BTN vs BB solve of As 8h 3c.
const REAL_OUTPUT = `
Iter: 1
player 0 exploitability 200.1
player 1 exploitability 100.5
Total exploitability 300.653 precent
Iter: 11
Total exploitability 54.333 precent
Iter: 21
Total exploitability 27.9512 precent
Iter: 31
Total exploitability 16.5558 precent
Iter: 41
Total exploitability 11.3855 precent
Iter: 51
Total exploitability 7.66443 precent
`;

describe('parseCheckpoints', () => {
  it('pairs each exploitability with the iteration it belongs to', () => {
    const points = parseCheckpoints(REAL_OUTPUT);
    expect(points).toHaveLength(6);
    expect(points[0]).toEqual({ iteration: 1, exploitability: 300.653 });
    expect(points.at(-1)).toEqual({ iteration: 51, exploitability: 7.66443 });
  });

  it('ignores the per-player lines and keeps only the total', () => {
    expect(parseCheckpoints(REAL_OUTPUT).some((p) => p.exploitability === 200.1)).toBe(false);
  });

  it('returns nothing for output with no checkpoints', () => {
    expect(parseCheckpoints('EXEC FROM FILE\n<<<START SOLVING>>>')).toEqual([]);
  });
});

describe('fitPowerLaw', () => {
  it('refuses to fit fewer than three points', () => {
    expect(fitPowerLaw([{ iteration: 10, exploitability: 50 }])).toBeNull();
  });

  it('recovers a known exponent', () => {
    const synthetic = [10, 20, 40, 80].map((iteration) => ({
      iteration, exploitability: 1000 * iteration ** -1.5,
    }));
    expect(fitPowerLaw(synthetic).exponent).toBeCloseTo(1.5, 3);
  });

  it('is dragged below 1/T by the warm-up reading', () => {
    // The opening iteration sits at 300% and is not on the asymptotic curve.
    // Including it is what makes the naive estimate so pessimistic.
    expect(fitPowerLaw(parseCheckpoints(REAL_OUTPUT), 0).exponent).toBeLessThan(1);
  });

  it('fits faster than 1/T once warm-up is dropped', () => {
    expect(fitPowerLaw(parseCheckpoints(REAL_OUTPUT), 1).exponent).toBeGreaterThan(1);
  });
});

describe('iterationsToReach', () => {
  const fit = fitPowerLaw(parseCheckpoints(REAL_OUTPUT), 1);

  it('estimates far fewer iterations than a single early C/T fit', () => {
    // Fitting C at iteration 10 gives C = 2729 and so ~2729 iterations for 1%.
    // The power-law fit over all checkpoints lands far below that.
    const iters = iterationsToReach(fit, 1.0);
    expect(iters).toBeGreaterThan(50);
    expect(iters).toBeLessThan(1000);
  });

  it('needs more iterations for a tighter target', () => {
    expect(iterationsToReach(fit, 0.5)).toBeGreaterThan(iterationsToReach(fit, 1.0));
  });

  it('returns null rather than a number it cannot justify', () => {
    expect(iterationsToReach(null, 1.0)).toBeNull();
  });
});

describe('estimateSolve', () => {
  it('turns iterations into hours using the measured rate', () => {
    const est = estimateSolve({ output: REAL_OUTPUT, secondsPerIteration: 11.8 });
    expect(est.points).toBe(6);
    expect(est.exponent).toBeGreaterThan(1);
    expect(est.targets[0].target).toBe(1.0);
    expect(est.targets[0].hours).toBeGreaterThan(0);
  });

  it('reports a range, because the estimate is genuinely sensitive', () => {
    const est = estimateSolve({ output: REAL_OUTPUT, secondsPerIteration: 11.8 });
    const [low, high] = est.targets[0].iterationsRange;
    expect(low).toBeLessThan(high);
    expect(est.targets[0].iterations).toBeGreaterThanOrEqual(low);
    expect(est.targets[0].hoursRange[0]).toBeLessThanOrEqual(est.targets[0].hoursRange[1]);
  });

  it('flags a slow tail when the exponent is under 1', () => {
    const slow = [10, 20, 40, 80].map((iteration) => ({ iteration, exploitability: 100 * iteration ** -0.6 }));
    const fit = fitPowerLaw(slow);
    expect(fit.exponent).toBeLessThan(1);
  });

  it('reports nulls rather than guesses when there is nothing to fit', () => {
    const est = estimateSolve({ output: 'no checkpoints here', secondsPerIteration: 10 });
    expect(est.exponent).toBeNull();
    expect(est.targets[0].iterations).toBeNull();
  });
});
