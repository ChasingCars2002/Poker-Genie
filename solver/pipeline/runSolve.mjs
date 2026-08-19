#!/usr/bin/env node
// Solve one (config, flop) and extract it to a training chunk.
//
//   node --import ./solver/pipeline/register.mjs solver/pipeline/runSolve.mjs \
//        --config c0 --board As,8h,3c --solver solver/bin/console_solver
//
// Deliberately solves exactly one spot per process. The multithreaded solver
// races (see ../NOTES.md), so throughput comes from running several of these
// concurrently — which also means a crash costs one flop, not the batch.

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { buildInput, readRangeFile, toSolverRange } from './buildInput.mjs';
import { extractDump } from './extract.mjs';
import { trackPeakRss, formatGB } from './measure.mjs';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  if (fallback !== undefined) return fallback;
  throw new Error(`missing --${name}`);
}

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const configId = arg('config', 'c0');
const board = arg('board').split(',').map((c) => c.trim());
const solverBin = resolve(arg('solver', join(root, 'bin/console_solver')));
const outDir = resolve(arg('out', join(root, 'runs')));
// The solver loads ~57MB of hand-comparison lookup tables at startup. They are
// vendor data from the upstream clone, far too large to commit, so we point at
// the clone that build.sh already made rather than copying them into the repo.
const resourcesDir = resolve(arg('resources', join(root, '.build/TexasSolver/resources')));

const { configs } = JSON.parse(readFileSync(join(root, 'config/configs.json'), 'utf8'));
const config = configs.find((c) => c.id === configId);
const iterationOverride = Number(arg('iterations', '0'));
if (config && iterationOverride > 0) config.maxIteration = iterationOverride;
if (!config) throw new Error(`no config ${configId}`);
if (!existsSync(solverBin)) {
  throw new Error(`solver binary not found at ${solverBin} — run solver/build.sh first`);
}
if (!existsSync(resourcesDir)) {
  throw new Error(`solver resources not found at ${resourcesDir} — run solver/build.sh first, or pass --resources`);
}

const slug = `${configId}-${board.join('').toLowerCase()}`;
const workDir = join(outDir, slug);
mkdirSync(workDir, { recursive: true });

const ipRange = toSolverRange(readRangeFile(join(root, 'config/ranges', config.ipRangeFile)));
const oopRange = toSolverRange(readRangeFile(join(root, 'config/ranges', config.oopRangeFile)));
const dumpPath = join(workDir, 'output_result.json');
const inputPath = join(workDir, 'input.txt');

writeFileSync(inputPath, buildInput({ config, board, ipRange, oopRange, dumpPath }));
console.log(`[${slug}] solving ${board.join(' ')} — pot ${config.pot}bb, stack ${config.effectiveStack}bb`);

let peakRss = 0;
const started = Date.now();
// Stream the solver's output as it goes rather than buffering it. A deep solve
// runs for many minutes, and during a long batch you want to see convergence
// progress rather than stare at a silent process wondering whether it hung.
const stdout = await new Promise((resolveRun, rejectRun) => {
  const child = spawn(solverBin, ['-i', inputPath, '-r', resourcesDir], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const rss = trackPeakRss(child.pid);
  let captured = '';
  const relay = (stream) => {
    stream.setEncoding('utf8');
    stream.on('data', (text) => {
      captured += text;
      process.stderr.write(text);
    });
  };
  relay(child.stdout);
  relay(child.stderr);
  child.on('error', rejectRun);
  child.on('close', (code, signal) => {
    peakRss = rss.stop();
    if (signal === 'SIGKILL') {
      // Distinct from the thread race, which segfaults. SIGKILL with no
      // iterations means the OOM killer took it while building the tree.
      rejectRun(new Error(
        `solver was SIGKILLed — almost certainly out of memory. Shrink the bet-size ` +
        `tree in configs.json (it dominates cost), or use fewer concurrent solves.`,
      ));
    } else if (code !== 0) {
      rejectRun(new Error(`solver exited ${code} (signal ${signal})`));
    } else {
      resolveRun(captured);
    }
  });
});
const elapsed = ((Date.now() - started) / 1000).toFixed(1);

// The solver reports convergence as it iterates; the last figure is what we got.
const exploitability = [...stdout.matchAll(/Total exploitability ([\d.]+) precent/g)]
  .map((m) => Number(m[1]))
  .pop();
if (exploitability === undefined) throw new Error('could not parse exploitability from solver output');

console.log(`[${slug}] solved in ${elapsed}s, exploitability ${exploitability}%, peak RSS ${formatGB(peakRss)}`);

// A dump that never converged is worse than no dump: it looks authoritative and
// is not. Gate it here rather than discovering it in the trainer.
// The pilot measures cost, not quality, so it needs to run short solves that
// have not converged. Everything else keeps the gate: an under-converged dump
// still looks authoritative, which makes shipping one worse than shipping none.
const GATE = Number(arg('gate', '1.0'));
if (Number.isFinite(GATE) && exploitability > GATE) {
  throw new Error(
    `exploitability ${exploitability}% exceeds ${GATE}% — raise maxIteration or lower accuracy in configs.json`,
  );
}

const dump = JSON.parse(readFileSync(dumpPath, 'utf8'));
const nodes = extractDump(dump, { pot: config.pot });
const chunk = {
  schemaVersion: 1,
  configId,
  board,
  pot: config.pot,
  effectiveStack: config.effectiveStack,
  solver: {
    exploitability,
    elapsedSeconds: Number(elapsed),
    peakRssBytes: peakRss,
    accuracy: config.accuracy,
    maxIteration: config.maxIteration,
  },
  ranges: { ip: config.ipRangeFile, oop: config.oopRangeFile },
  evConvention: 'net chips relative to subgame start; fold = -(own pot contribution)',
  nodes,
};

const chunkPath = join(workDir, 'chunk.json');
writeFileSync(chunkPath, JSON.stringify(chunk));
const rawMB = (statSync(dumpPath).size / 1e6).toFixed(2);
const chunkMB = (statSync(chunkPath).size / 1e6).toFixed(2);
console.log(`[${slug}] ${nodes.length} nodes; raw ${rawMB}MB -> chunk ${chunkMB}MB`);
for (const n of nodes) {
  console.log(`  ${(n.path || '(root)').padEnd(28)} actor=${n.actor} combos=${n.comboCount} actions=${n.actions.map((a) => a.raw).join('|')}`);
}
