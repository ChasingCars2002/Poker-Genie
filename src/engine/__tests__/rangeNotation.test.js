import { describe, it, expect } from 'vitest';
import { parseRange, formatRange, complementOf } from '../rangeNotation';
import { classFromNotation, classNotation, ALL_CLASSES } from '../handClass';
import { rangeCombos, rangePercent } from '../equity';

const notations = (range) => [...range.keys()].map(classNotation).sort();

describe('single terms', () => {
  it('parses one class', () => {
    expect(notations(parseRange('AA'))).toEqual(['AA']);
    expect(notations(parseRange('AKs'))).toEqual(['AKs']);
    expect(notations(parseRange('72o'))).toEqual(['72o']);
  });

  it('treats a bare two-rank term as both suited and offsuit', () => {
    expect(notations(parseRange('AK')).sort()).toEqual(['AKo', 'AKs']);
  });

  it('parses a comma-separated list', () => {
    expect(notations(parseRange('AA, KK, AKs')).sort()).toEqual(['AA', 'AKs', 'KK']);
  });

  it('tolerates whitespace', () => {
    expect(notations(parseRange('  AA ,   KK  '))).toEqual(['AA', 'KK']);
  });

  it('returns an empty range for empty input', () => {
    expect(parseRange('').size).toBe(0);
    expect(parseRange(null).size).toBe(0);
  });
});

describe('plus notation', () => {
  it('climbs every pair from the given one', () => {
    expect(parseRange('TT+').size).toBe(5); // TT JJ QQ KK AA
    expect(notations(parseRange('TT+')).sort()).toEqual(['AA', 'JJ', 'KK', 'QQ', 'TT']);
  });

  it('includes every pair for 22+', () => {
    expect(parseRange('22+').size).toBe(13);
  });

  it('climbs the kicker, not the top card', () => {
    // ATs+ is ATs AJs AQs AKs — it must not wander into KTs.
    expect(notations(parseRange('ATs+')).sort()).toEqual(['AJs', 'AKs', 'AQs', 'ATs']);
  });

  it('handles offsuit kickers', () => {
    expect(notations(parseRange('KJo+')).sort()).toEqual(['KQo', 'KJo'].sort());
  });

  it('covers both suits when no suffix is given', () => {
    expect(notations(parseRange('AQ+')).sort()).toEqual(['AKo', 'AKs', 'AQo', 'AQs']);
  });

  it('never includes the pair itself', () => {
    expect(notations(parseRange('A2s+'))).not.toContain('AA');
    expect(parseRange('A2s+').size).toBe(12); // A2s through AKs
  });
});

describe('span notation', () => {
  it('walks a run of suited connectors', () => {
    expect(notations(parseRange('76s-98s')).sort()).toEqual(['76s', '87s', '98s']);
  });

  it('walks a pair span', () => {
    expect(notations(parseRange('22-55')).sort()).toEqual(['22', '33', '44', '55']);
  });

  it('accepts a span written in either direction', () => {
    expect(notations(parseRange('98s-76s')).sort()).toEqual(notations(parseRange('76s-98s')).sort());
  });

  it('walks one-gappers keeping the gap', () => {
    expect(notations(parseRange('75s-97s')).sort()).toEqual(['75s', '86s', '97s']);
  });

  it('rejects a span whose gap changes', () => {
    expect(() => parseRange('76s-A2s')).toThrow(/constant gap/);
  });

  it('rejects a span mixing suited and offsuit', () => {
    expect(() => parseRange('76s-98o')).toThrow(/Mismatched suits/);
  });
});

describe('weights', () => {
  it('parses an explicit weight', () => {
    const range = parseRange('AA:0.5');
    expect(range.get(classFromNotation('AA'))).toBe(0.5);
  });

  it('defaults to a full weight', () => {
    expect(parseRange('AA').get(classFromNotation('AA'))).toBe(1);
  });

  it('lets a later term override an earlier one', () => {
    // State a broad range, then carve an exception out of it.
    const range = parseRange('22+, 22:0.25');
    expect(range.get(classFromNotation('22'))).toBe(0.25);
    expect(range.get(classFromNotation('33'))).toBe(1);
  });

  it('applies a weight across an expanded term', () => {
    const range = parseRange('TT+:0.5');
    for (const weight of range.values()) expect(weight).toBe(0.5);
  });
});

describe('errors', () => {
  it('rejects an unknown rank', () => {
    expect(() => parseRange('XX')).toThrow();
  });

  it('rejects a non-numeric weight', () => {
    expect(() => parseRange('AA:banana')).toThrow(/Bad weight/);
  });
});

describe('range sizing', () => {
  it('expands a full opening range to the exact combo count', () => {
    // Counted by hand, term by term:
    //   22+ 78 · A2s+ 48 · K7s+ 24 · Q8s+ 16 · J8s+ 12 · T8s+ 8 · 97s+ 8
    //   86s+ 8 · 75s+ 8 · 65s 4 · 54s 4 · A7o+ 84 · K9o+ 48 · Q9o+ 36
    //   J9o+ 24 · T9o 12
    const btn = parseRange(
      '22+, A2s+, K7s+, Q8s+, J8s+, T8s+, 97s+, 86s+, 75s+, 65s, 54s, ' +
      'A7o+, K9o+, Q9o+, J9o+, T9o'
    );
    expect(rangeCombos(btn)).toBe(422);
    expect(rangePercent(btn)).toBeCloseTo(422 / 1326, 10);
  });

  it('measures a tight range as a small percentage', () => {
    expect(rangePercent(parseRange('QQ+, AKs'))).toBeLessThan(0.03);
  });

  it('counts combos consistently with the class definitions', () => {
    const range = parseRange('AA, AKs, AKo');
    expect(rangeCombos(range)).toBe(6 + 4 + 12);
  });
});

describe('complementOf', () => {
  it('returns everything not in the range', () => {
    const tight = parseRange('AA');
    const rest = complementOf(tight);
    expect(rest.size).toBe(ALL_CLASSES.length - 1);
    expect(rest.has(classFromNotation('AA'))).toBe(false);
  });

  it('partitions the deck exactly', () => {
    const range = parseRange('22+, ATs+');
    const rest = complementOf(range);
    expect(rangeCombos(range) + rangeCombos(rest)).toBe(1326);
  });
});

describe('formatRange', () => {
  it('renders back to readable notation', () => {
    expect(formatRange(parseRange('AA, KK'))).toContain('AA');
    expect(formatRange(parseRange('AA, KK'))).toContain('KK');
  });

  it('round-trips through the parser', () => {
    const original = parseRange('22+, ATs+, KJo+');
    const reparsed = parseRange(formatRange(original));
    expect(notations(reparsed).sort()).toEqual(notations(original).sort());
  });
});
