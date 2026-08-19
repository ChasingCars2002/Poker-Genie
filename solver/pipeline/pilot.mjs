#!/usr/bin/env node
// Measure what a solve actually costs on THIS machine, before committing to a
// batch that runs overnight.
//
//   node --import ./solver/pipeline/register.mjs solver/pipeline/pilot.mjs \
//        --config c0 --boards Ks,7h,2c/9h,8h,7s/Ah,Kh,Qh
//
// This exists because the published 172s / 1600MB benchmark is an SPR 4 spot,
// and a 6-max 100bb single-raised pot is SPR 17.7 — a different animal. Solves
// sized from that benchmark ran out of memory before reaching iteration one.
// Estimating from someone else's tree is how you lose a night; measure instead.
//
// Boards are solved one at a time, deliberately. The point is to learn each
// solve's true peak memory, which concurrency would obscure.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  if (fallback !== undefined) return fallback;
  throw new Error(`missing --${name}`);
}

const here = dirname(new URL(import.meta.url).pathname);
const configId = arg('config', 'c0');

// Default spread spans the complexity range: a dry rainbow board is the cheap
// case, a monotone connected one the expensive case, and the solve cost between
// them is not a small factor.
// Short solves by default: the pilot is measuring peak memory and cost per
// iteration, both of which are visible long before convergence.
const iterations = arg('iterations', '12');
const boards = arg('boards', 'Ks,7h,2c/9h,8h,7s/Ah,Kh,Qh')
  .split('/')
  .map((b) => b.trim())
  .filter(Boolean);

const results = [];
for (const board of boards) {
  try {
    const stdout = execFileSync(
      process.execPath,
      ['--import', join(here, 'register.mjs'), join(here, 'runSolve.mjs'),
       '--config', configId, '--board', board,
       '--iterations', iterations, '--gate', 'off'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'inherit'] },
    );
    const line = stdout.split('\n').find((l) => l.includes('solved in')) ?? '';
    const seconds = Number(line.match(/solved in ([\d.]+)s/)?.[1] ?? NaN);
    const exploitability = Number(line.match(/exploitability ([\d.]+)%/)?.[1] ?? NaN);
    const peak = line.match(/peak RSS ([\d.]+)GB/)?.[1];
    results.push({ board, ok: true, seconds, exploitability, peakGB: peak ? Number(peak) : null });
  } catch (err) {
    // A failed pilot entry is a result, not an error — it tells you this config
    // does not fit, which is exactly what the pilot is for.
    results.push({ board, ok: false, reason: (err.message || '').split('\n')[0].slice(0, 120) });
  }
}

console.log(`\n=== pilot: config ${configId} ===`);
for (const r of results) {
  if (!r.ok) { console.log(`  ${r.board.padEnd(12)} FAILED  ${r.reason}`); continue; }
  const perIter = (r.seconds / Number(iterations)).toFixed(1);
  console.log(`  ${r.board.padEnd(12)} ${String(r.seconds).padStart(7)}s  ${perIter}s/iter  ${String(r.peakGB ?? '?').padStart(5)}GB  expl ${r.exploitability}% after ${iterations}`);
}

const ok = results.filter((r) => r.ok);
if (ok.length === 0) {
  console.log('\nNo solve completed. Shrink the bet-size tree in configs.json — it dominates cost.');
  process.exit(1);
}

const meanSeconds = ok.reduce((a, r) => a + r.seconds, 0) / ok.length;
const meanPerIter = meanSeconds / Number(iterations);
const maxGB = Math.max(...ok.map((r) => r.peakGB ?? 0));
const totalRamGB = Number((readFileSync('/proc/meminfo', 'utf8').match(/MemTotal:\s+(\d+)/)?.[1] ?? 0)) / 1024 ** 2;
// Leave a gigabyte of headroom: an OOM kill loses the whole solve, and a solve
// is worth far more than the throughput of one extra worker.
const workers = maxGB > 0 ? Math.max(1, Math.floor((totalRamGB - 1) / maxGB)) : 1;

console.log(`\nmean ${meanSeconds.toFixed(1)}s/solve, worst peak ${maxGB}GB, ${totalRamGB.toFixed(1)}GB total RAM`);
console.log(`=> up to ${workers} concurrent single-threaded solve(s) fit in memory`);
// Exploitability decays roughly as C/T, so fit C from where this short run
// landed and read off the iterations needed for a usable solve. It is a coarse
// extrapolation from a short run — treat it as a planning figure, and rely on
// the real gate in runSolve to reject anything that has not actually converged.
const meanExpl = ok.reduce((a, r) => a + r.exploitability, 0) / ok.length;
const fitC = meanExpl * Number(iterations);
for (const target of [1.0, 0.5]) {
  const itersNeeded = Math.ceil(fitC / target);
  const perSolveH = (itersNeeded * meanPerIter) / 3600;
  console.log(`\n  to reach ${target}% exploitability: ~${itersNeeded} iters, ~${perSolveH.toFixed(1)}h/solve`);
  for (const n of [10, 25]) {
    console.log(`     ${String(n).padStart(3)} flops: ~${((perSolveH * n) / workers).toFixed(1)}h at ${workers} worker(s)`);
  }
}
console.log('\nMemory is the binding constraint, not time: every concurrent solve needs its own tree.');
