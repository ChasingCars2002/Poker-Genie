// Builds the 169x169 preflop equity matrix that the trainer's preflop maths
// rests on.
//
// This script IS the provenance. Everything it emits can be regenerated and
// checked by anyone with this repo — which is the property that shipping
// somebody else's chart data cannot offer, and the reason the preflop mode
// teaches computed arithmetic rather than memorised frequencies.
//
//   node scripts/buildEquityTable.mjs [--boards N] [--seed N]
//
// Method: board-major Monte Carlo. Sample a five-card board, score every one
// of the C(47,2) = 1081 remaining combos on it, then accumulate pairwise
// results for every non-conflicting pair. One sampled board therefore yields
// ~535,000 matchup samples rather than one, which is what makes this finish in
// under a minute instead of over a day.
//
// Conditioned on not clashing with a given matchup's four cards, a uniformly
// sampled board is uniform over the C(48,5) boards that matchup can see — so
// the estimator is unbiased, not merely close.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluate7 } from '../src/engine/handRank.js';
import { classOfCards, CLASS_COUNT, classNotation } from '../src/engine/handClass.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(HERE, '..', 'src', 'data', 'equityTable.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const read = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i >= 0 ? Number(args[i + 1]) : fallback;
  };
  return { boards: read('--boards', 6000), seed: read('--seed', 20260814) };
}

// Seeded so a rebuild reproduces the committed table exactly. An unseeded
// build would make the data unverifiable, which defeats the point.
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

const { boards: BOARD_SAMPLES, seed } = parseArgs();
const rng = makeRng(seed);

// Accumulators over ordered class pairs: wins[a][b] counts hands where a beat
// b, ties[a][b] the splits, total[a][b] the matchups seen.
const size = CLASS_COUNT * CLASS_COUNT;
const wins = new Float64Array(size);
const ties = new Float64Array(size);
const total = new Float64Array(size);

// The accuracy of this table cannot be derived from the raw sample count. Every
// matchup observed on a single board shares that board, so those samples are
// heavily correlated — treating them as independent understates the true error
// by roughly an order of magnitude, which would be a very convincing lie.
//
// Instead the run is split into independent batches and the spread between them
// is measured. That is an empirical standard error which makes no independence
// assumption at all, and it is the number reported in the generated file.
const BATCHES = 8;
const batchWins = [];
const batchTotal = [];
for (let i = 0; i < BATCHES; i++) {
  batchWins.push(new Float64Array(size));
  batchTotal.push(new Float64Array(size));
}

const deck = new Int32Array(52);
const hand = new Int32Array(7);

// Per-board working state.
const comboC1 = new Int32Array(1081);
const comboC2 = new Int32Array(1081);
const comboScore = new Int32Array(1081);
const comboClass = new Int32Array(1081);

console.log(`Building equity table: ${BOARD_SAMPLES.toLocaleString()} boards, seed ${seed}`);
const start = Date.now();

for (let iter = 0; iter < BOARD_SAMPLES; iter++) {
  const batch = iter % BATCHES;
  const bWins = batchWins[batch];
  const bTotal = batchTotal[batch];

  for (let i = 0; i < 52; i++) deck[i] = i;
  // Partial Fisher-Yates: only the first five positions need to be settled.
  for (let i = 0; i < 5; i++) {
    const j = i + Math.floor(rng() * (52 - i));
    const tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
  }

  hand[2] = deck[0]; hand[3] = deck[1]; hand[4] = deck[2];
  hand[5] = deck[3]; hand[6] = deck[4];

  // Score every combo available on this board.
  let n = 0;
  for (let i = 5; i < 52; i++) {
    const c1 = deck[i];
    hand[0] = c1;
    for (let j = i + 1; j < 52; j++) {
      const c2 = deck[j];
      hand[1] = c2;
      comboC1[n] = c1;
      comboC2[n] = c2;
      comboScore[n] = evaluate7(hand);
      comboClass[n] = classOfCards(c1, c2);
      n++;
    }
  }

  // Accumulate every non-conflicting matchup on this board at once.
  for (let a = 0; a < n; a++) {
    const a1 = comboC1[a];
    const a2 = comboC2[a];
    const scoreA = comboScore[a];
    const classA = comboClass[a] * CLASS_COUNT;

    for (let b = a + 1; b < n; b++) {
      const b1 = comboC1[b];
      if (b1 === a1 || b1 === a2) continue;
      const b2 = comboC2[b];
      if (b2 === a1 || b2 === a2) continue;

      const scoreB = comboScore[b];
      const ab = classA + comboClass[b];
      const ba = comboClass[b] * CLASS_COUNT + comboClass[a];

      total[ab]++; total[ba]++;
      bTotal[ab]++; bTotal[ba]++;
      if (scoreA > scoreB) { wins[ab]++; bWins[ab]++; }
      else if (scoreB > scoreA) { wins[ba]++; bWins[ba]++; }
      else {
        ties[ab]++; ties[ba]++;
        bWins[ab] += 0.5; bWins[ba] += 0.5;
      }
    }
  }

  if ((iter + 1) % 500 === 0) {
    const pct = ((iter + 1) / BOARD_SAMPLES * 100).toFixed(0);
    const secs = ((Date.now() - start) / 1000).toFixed(0);
    process.stdout.write(`\r  ${pct}% (${iter + 1}/${BOARD_SAMPLES} boards, ${secs}s)`);
  }
}

process.stdout.write('\n');

// Equity counts a tie as half a win, the standard convention.
const equity = new Uint16Array(size);
let missing = 0;
let minSamples = Infinity;

for (let i = 0; i < size; i++) {
  if (total[i] === 0) {
    // Only possible if a matchup never came up; with any realistic sample
    // count it does not happen, but leaving a silent zero would be a lie.
    missing++;
    equity[i] = 5000;
    continue;
  }
  minSamples = Math.min(minSamples, total[i]);
  const e = (wins[i] + ties[i] / 2) / total[i];
  equity[i] = Math.round(e * 10000);
}

// Empirical standard error of the mean, from the spread between independent
// batches. No independence assumption within a batch, so this survives the
// board-sharing correlation that makes the naive figure meaningless.
let worstSE = 0;
let meanSE = 0;
let measured = 0;

for (let i = 0; i < size; i++) {
  const estimates = [];
  for (let b = 0; b < BATCHES; b++) {
    if (batchTotal[b][i] > 0) estimates.push(batchWins[b][i] / batchTotal[b][i]);
  }
  if (estimates.length < 2) continue;

  const mean = estimates.reduce((s, e) => s + e, 0) / estimates.length;
  const variance = estimates.reduce((s, e) => s + (e - mean) ** 2, 0) / (estimates.length - 1);
  const se = Math.sqrt(variance / estimates.length); // standard error of the mean

  worstSE = Math.max(worstSE, se);
  meanSE += se;
  measured++;
}
meanSE /= measured || 1;

const elapsed = ((Date.now() - start) / 1000).toFixed(1);

console.log(`\nDone in ${elapsed}s`);
console.log(`  thinnest matchup: ${minSamples.toLocaleString()} raw samples (heavily correlated)`);
console.log(`  measured standard error: mean ${(meanSE * 100).toFixed(3)}pp, worst ${(worstSE * 100).toFixed(3)}pp`);
if (missing > 0) console.log(`  WARNING: ${missing} matchups never sampled`);

// Spot-checks against exact values, each computed by exhaustively enumerating
// every disjoint combo pair over all C(48,5) boards with this repo's own
// evaluator. Deliberately not "published" figures: the commonly quoted ones
// turned out to disagree with exact enumeration by up to 1.6pp, and a
// self-check against a number nobody can reproduce is not a check at all.
//
// Reproduce any row with scripts/exactEquity.mjs.
const CHECKS = [
  ['AA', 'KK', 0.819461],
  ['AA', 'AKs', 0.878595],
  ['AA', '72o', 0.881996],
  ['AKs', 'QQ', 0.460485],
  ['AKo', 'QQ', 0.432423],
  ['JJ', 'AKo', 0.568509],
  ['98s', 'AKo', 0.396714],
];

console.log('\nSpot-checks against exact enumeration:');
const notationToIndex = new Map();
for (let i = 0; i < CLASS_COUNT; i++) notationToIndex.set(classNotation(i), i);

const SPOT_CHECK_TOLERANCE = 0.004; // 0.4pp

let worstDelta = 0;
for (const [a, b, expected] of CHECKS) {
  const got = equity[notationToIndex.get(a) * CLASS_COUNT + notationToIndex.get(b)] / 10000;
  const delta = Math.abs(got - expected);
  worstDelta = Math.max(worstDelta, delta);
  const flag = delta < SPOT_CHECK_TOLERANCE ? 'OK  ' : 'OFF ';
  console.log(`  ${flag} ${a} vs ${b}: ${(got * 100).toFixed(2)}%  (exact ${(expected * 100).toFixed(2)}%, Δ${(delta * 100).toFixed(2)}pp)`);
}
console.log(`  worst deviation: ${(worstDelta * 100).toFixed(2)}pp`);

// Refuse to write a table that fails its own checks. Shipping a quietly wrong
// equity table would be worse than shipping none — the whole point of the
// preflop mode is that its arithmetic can be trusted.
if (worstDelta >= SPOT_CHECK_TOLERANCE) {
  console.error(
    `\nABORT: worst deviation ${(worstDelta * 100).toFixed(2)}pp exceeds the ` +
    `${(SPOT_CHECK_TOLERANCE * 100).toFixed(1)}pp tolerance. Raise --boards and rebuild.`
  );
  process.exit(1);
}

const packed = Array.from(equity).join(',');
const banner = `// GENERATED FILE — do not edit by hand.
//
// Rebuild with:  node scripts/buildEquityTable.mjs --boards ${BOARD_SAMPLES} --seed ${seed}
//
// 169x169 preflop equity, as basis points (5000 = 50.00%), indexed
// [heroClass * 169 + villainClass]. Ties count as half a win.
//
// Method: board-major Monte Carlo over ${BOARD_SAMPLES.toLocaleString()} sampled boards.
//
// Accuracy, measured rather than assumed: the run is split into ${BATCHES} independent
// batches and the spread between them gives an empirical standard error of
// ${(meanSE * 100).toFixed(3)}pp on average and ${(worstSE * 100).toFixed(3)}pp at worst. Counting the ${minSamples.toLocaleString()} raw
// samples of the thinnest matchup as independent would understate that by
// roughly an order of magnitude, since every matchup seen on one board shares
// that board.
//
// Checked against exact enumeration (scripts/exactEquity.mjs) on ${CHECKS.length} matchups;
// worst deviation ${(worstDelta * 100).toFixed(2)}pp.
//
// These are combo-count-weighted averages over suit configurations, which is
// how every published equity table reports them: AKs vs QJs differs slightly
// depending on whether the suits collide, and this is the average over both.
// Entries are estimates within the tolerance above, NOT exact enumerations.
`;

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, `${banner}
export const EQUITY_SAMPLE_BOARDS = ${BOARD_SAMPLES};
export const EQUITY_SEED = ${seed};
export const EQUITY_MIN_SAMPLES = ${minSamples};
export const EQUITY_STANDARD_ERROR = ${worstSE.toFixed(6)};

export const EQUITY_TABLE = Uint16Array.from(
  '${packed}'.split(',').map(Number)
);
`);

console.log(`\nWrote ${OUT_PATH}`);
