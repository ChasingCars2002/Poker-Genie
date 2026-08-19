// Estimating how long a solve needs, from the checkpoints it already prints.
//
// CFR exploitability does not decay as C/T. Fitting C from a single early
// reading is not merely imprecise, it is biased in a knowable direction —
// measured on a real 100bb run, C = expl x T fell from 598 at iteration 11 to
// 391 at iteration 51. Extrapolating from iteration 10 therefore overstates the
// work required, and it overstates it by a lot.
//
// A power law, expl = A * T^-p, fits that data far better and is what this
// module estimates. Fitting in log-log space by least squares over every
// checkpoint costs nothing: the solver already prints them.

/** Pull (iteration, exploitability) pairs out of solver stdout. */
export function parseCheckpoints(output) {
  const lines = String(output).split('\n');
  const points = [];
  let iteration = null;
  for (const line of lines) {
    const iter = line.match(/^Iter:\s*(\d+)/);
    if (iter) { iteration = Number(iter[1]); continue; }
    const expl = line.match(/Total exploitability ([\d.]+)\s*precent/);
    if (expl && iteration !== null) {
      points.push({ iteration, exploitability: Number(expl[1]) });
    }
  }
  // Iteration 0 is the starting point, not a measurement of progress.
  return points.filter((p) => p.iteration > 0 && p.exploitability > 0);
}

/**
 * Least-squares fit of expl = A * T^-p in log-log space.
 *
 * `skip` drops leading checkpoints. The first few iterations are not on the
 * asymptotic curve — the opening reading of a real 100bb run was 300%, and
 * including it pulled the fitted exponent from 1.26 down to 0.90, which nearly
 * tripled the predicted work. Warm-up is not convergence.
 *
 * Returns null when there are too few points to say anything honest.
 */
export function fitPowerLaw(points, skip = 0) {
  const used = points.slice(skip);
  if (used.length < 3) return null;
  return fitPoints(used);
}

function fitPoints(points) {
  const xs = points.map((p) => Math.log(p.iteration));
  const ys = points.map((p) => Math.log(p.exploitability));
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  if (den === 0) return null;
  const slope = num / den;            // = -p
  const intercept = meanY - slope * meanX;
  return { exponent: -slope, logA: intercept, points: n };
}

/** Iterations needed to reach `target` percent, or null if the fit is unusable. */
export function iterationsToReach(fit, target) {
  if (!fit || !(fit.exponent > 0)) return null;
  const logT = (fit.logA - Math.log(target)) / fit.exponent;
  const iterations = Math.exp(logT);
  return Number.isFinite(iterations) ? Math.ceil(iterations) : null;
}

/**
 * Full estimate for one solve, with an honest uncertainty band.
 *
 * The headline number comes from dropping one warm-up point. The range comes
 * from refitting while dropping one, two and three, because the answer is
 * genuinely sensitive to that choice — on a real run the estimates spanned 276
 * to 195 iterations, and including the warm-up point gave 672. Reporting a
 * single figure from one arbitrary cut would imply a precision the data does
 * not support.
 *
 * `secondsPerIteration` comes from the measured run, not from a benchmark.
 */
export function estimateSolve({ output, secondsPerIteration, targets = [1.0, 0.5] }) {
  const points = parseCheckpoints(output);
  const fit = fitPowerLaw(points, 1);
  const variants = [1, 2, 3].map((skip) => fitPowerLaw(points, skip)).filter(Boolean);

  const hours = (iterations) => (iterations === null ? null
    : Number(((iterations * secondsPerIteration) / 3600).toFixed(1)));

  return {
    points: points.length,
    exponent: fit ? Number(fit.exponent.toFixed(3)) : null,
    // An exponent under 1 means a long tail: the last decimal of accuracy costs
    // far more than the first. Worth flagging rather than burying.
    slowTail: fit ? fit.exponent < 1 : null,
    targets: targets.map((target) => {
      const iterations = iterationsToReach(fit, target);
      const spread = variants
        .map((v) => iterationsToReach(v, target))
        .filter((x) => x !== null);
      return {
        target,
        iterations,
        hours: hours(iterations),
        iterationsRange: spread.length ? [Math.min(...spread), Math.max(...spread)] : null,
        hoursRange: spread.length ? [hours(Math.min(...spread)), hours(Math.max(...spread))] : null,
      };
    }),
  };
}
