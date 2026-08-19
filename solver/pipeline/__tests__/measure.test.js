import { describe, it, expect } from 'vitest';
import { peakRssBytes, formatGB } from '../measure.mjs';

describe('peakRssBytes', () => {
  it('reads the high-water mark for a live process', () => {
    const bytes = peakRssBytes(process.pid);
    // VmHWM only exists on Linux; elsewhere this returns null and the pipeline
    // simply reports 0, which is why the caller must tolerate null.
    if (bytes === null) return;
    expect(bytes).toBeGreaterThan(1024 * 1024);
  });

  it('returns null rather than throwing for a pid that does not exist', () => {
    expect(peakRssBytes(2 ** 30)).toBeNull();
  });
});

describe('formatGB', () => {
  it('formats bytes as gigabytes', () => {
    expect(formatGB(2.5 * 1024 ** 3)).toBe('2.50GB');
    expect(formatGB(0)).toBe('0.00GB');
  });
});
