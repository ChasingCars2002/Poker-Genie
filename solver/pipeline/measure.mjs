// Peak-memory sampling for a running solve.
//
// Memory, not wall time, is what actually bounds a batch: each concurrent
// single-threaded solve needs its own full tree, so the question "how many can
// I run at once" is answered in gigabytes. Linux tracks the high-water mark for
// us in /proc/<pid>/status (VmHWM), which is exact and free — far better than
// polling RSS and hoping to catch the peak.

import { readFileSync } from 'node:fs';

/** Peak resident set size in bytes, or null if the process is already gone. */
export function peakRssBytes(pid) {
  try {
    const status = readFileSync(`/proc/${pid}/status`, 'utf8');
    const match = status.match(/^VmHWM:\s+(\d+)\s+kB$/m);
    return match ? Number(match[1]) * 1024 : null;
  } catch {
    return null; // process exited, or not Linux
  }
}

/**
 * Poll a pid's peak RSS until it exits, keeping the last reading. VmHWM only
 * ever rises, so the final successful read is the true peak.
 */
export function trackPeakRss(pid, { intervalMs = 500 } = {}) {
  let peak = 0;
  const timer = setInterval(() => {
    const current = peakRssBytes(pid);
    if (current !== null && current > peak) peak = current;
  }, intervalMs);
  if (typeof timer.unref === 'function') timer.unref();
  return {
    stop() {
      clearInterval(timer);
      return peak;
    },
  };
}

export const formatGB = (bytes) => `${(bytes / 1024 ** 3).toFixed(2)}GB`;
