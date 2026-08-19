import { describe, it, expect } from 'vitest';
import {
  allFlops, canonicalFlop, flopClasses, suitedness, pairedness,
  weightByFeature, selectFlops,
} from '../flops.mjs';

const classes = flopClasses();

describe('canonicalisation', () => {
  it('enumerates every three-card board', () => {
    expect(allFlops()).toHaveLength(22100); // C(52,3)
  });

  it('collapses to the 1755 strategically distinct flops', () => {
    // The known count of suit-isomorphic flop classes. If this number moves,
    // the canonical form is wrong.
    expect(classes).toHaveLength(1755);
  });

  it('maps suit-relabelled boards to the same class', () => {
    expect(canonicalFlop(['As', '8h', '3c'])).toBe(canonicalFlop(['Ah', '8s', '3d']));
    expect(canonicalFlop(['As', '8s', '3s'])).toBe(canonicalFlop(['Ah', '8h', '3h']));
  });

  it('keeps genuinely different textures apart', () => {
    // Same ranks, different suit structure: rainbow vs monotone are not the
    // same problem and must not collapse together.
    expect(canonicalFlop(['As', '8h', '3c'])).not.toBe(canonicalFlop(['As', '8s', '3s']));
  });

  it('is order-independent', () => {
    expect(canonicalFlop(['3c', 'As', '8h'])).toBe(canonicalFlop(['As', '8h', '3c']));
  });

  it('accounts for all 22100 flops across the classes', () => {
    expect(classes.reduce((sum, c) => sum + c.multiplicity, 0)).toBe(22100);
    expect(classes.reduce((sum, c) => sum + c.weight, 0)).toBeCloseTo(1, 10);
  });

  it('gives every class a multiplicity of 4, 12 or 24', () => {
    // The only orbit sizes possible under the 24 suit permutations.
    const sizes = new Set(classes.map((c) => c.multiplicity));
    expect([...sizes].sort((a, b) => a - b)).toEqual([4, 12, 24]);
  });
});

describe('texture classification', () => {
  it('reads suitedness off the canonical form', () => {
    expect(suitedness(canonicalFlop(['As', '8h', '3c']))).toBe('rainbow');
    expect(suitedness(canonicalFlop(['As', '8s', '3c']))).toBe('two-tone');
    expect(suitedness(canonicalFlop(['As', '8s', '3s']))).toBe('monotone');
  });

  it('reads pairedness off the canonical form', () => {
    expect(pairedness(canonicalFlop(['As', '8h', '3c']))).toBe('unpaired');
    expect(pairedness(canonicalFlop(['As', 'Ah', '3c']))).toBe('paired');
    expect(pairedness(canonicalFlop(['As', 'Ah', 'Ac']))).toBe('trips');
  });

  it('matches the real-world frequency of each suit texture', () => {
    // Exact combinatorics: rainbow 39.76%, two-tone 55.06%, monotone 5.18%.
    const w = weightByFeature(classes, 'suitedness');
    expect(w.rainbow).toBeCloseTo(0.3976, 3);
    expect(w['two-tone']).toBeCloseTo(0.5506, 3);
    expect(w.monotone).toBeCloseTo(0.0518, 3);
  });

  it('matches the real-world frequency of pairing', () => {
    const w = weightByFeature(classes, 'pairedness');
    expect(w.unpaired).toBeCloseTo(0.8282, 3);
    expect(w.paired).toBeCloseTo(0.1694, 3);
    expect(w.trips).toBeCloseTo(0.0024, 3);
  });
});

describe('selectFlops', () => {
  const picked = selectFlops(25, classes);

  it('returns exactly k flops', () => {
    expect(picked).toHaveLength(25);
  });

  it('returns distinct flops', () => {
    expect(new Set(picked.map((p) => p.canonical)).size).toBe(25);
  });

  it('is deterministic, so a dataset can be regenerated exactly', () => {
    expect(selectFlops(25, classes).map((p) => p.canonical))
      .toEqual(picked.map((p) => p.canonical));
  });

  it('covers all three suit textures rather than only the common ones', () => {
    const kinds = new Set(picked.map((p) => p.suitedness));
    expect(kinds).toContain('rainbow');
    expect(kinds).toContain('two-tone');
    expect(kinds).toContain('monotone');
  });

  it('does not over-represent monotone boards, which are ~5% of reality', () => {
    const monotone = picked.filter((p) => p.suitedness === 'monotone').length;
    expect(monotone).toBeGreaterThanOrEqual(1);
    expect(monotone).toBeLessThanOrEqual(4);
  });

  it('weights ace-high boards near their true frequency', () => {
    // Roughly 1 in 4 flops has an ace as its highest card.
    const aceHigh = picked.filter((p) => p.highCard === 'A').length;
    expect(aceHigh / picked.length).toBeGreaterThan(0.12);
    expect(aceHigh / picked.length).toBeLessThan(0.40);
  });

  it('scales to other k without changing its contract', () => {
    expect(selectFlops(10, classes)).toHaveLength(10);
    expect(selectFlops(49, classes)).toHaveLength(49);
  });
});
