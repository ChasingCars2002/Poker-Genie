// Parser for the shorthand ranges are written in: "22+, ATs+, KJo+, 76s-98s".
//
// Ranges have to be readable and editable by a human in the source file, or
// nobody will ever check whether the assumed villain range is sensible — and in
// this app the assumed range is a premise the player is asked to reason from,
// so it needs to be inspectable rather than buried in 169 booleans.

import { classFromNotation, classNotation, GRID_RANKS, ALL_CLASSES } from './handClass';

const RANK_ORDER = GRID_RANKS; // 'A' … '2', strongest first
const rankValue = (r) => 12 - RANK_ORDER.indexOf(r); // A=12 … 2=0

/**
 * Parse a range string into a Map of classIndex -> weight.
 *
 * Supported forms:
 *   AA            a single class
 *   AKs / AKo     suited / offsuit specifically
 *   AK            both AKs and AKo
 *   22+           every pair from 22 up
 *   ATs+          A-ten suited and every stronger suited ace
 *   KJo+          K-jack offsuit and stronger offsuit kings
 *   76s-98s       a run of suited connectors
 *   AA:0.5        an explicit weight, for a mixed strategy
 */
export function parseRange(text) {
  const range = new Map();
  if (!text || !text.trim()) return range;

  for (const rawTerm of text.split(',')) {
    const term = rawTerm.trim();
    if (!term) continue;

    const [body, weightText] = term.split(':');
    const weight = weightText === undefined ? 1 : Number(weightText);
    if (Number.isNaN(weight)) throw new Error(`Bad weight in range term: ${term}`);

    for (const classIndex of expandTerm(body.trim())) {
      // A later term overrides an earlier one, so a chart can state a broad
      // range and then carve exceptions out of it.
      range.set(classIndex, weight);
    }
  }

  return range;
}

function expandTerm(term) {
  if (term.includes('-')) return expandSpan(term);
  if (term.endsWith('+')) return expandPlus(term.slice(0, -1));
  return expandSingle(term);
}

function expandSingle(term) {
  // 'AK' with no suffix means both AKs and AKo.
  if (term.length === 2 && term[0] !== term[1]) {
    return [classFromNotation(`${term}s`), classFromNotation(`${term}o`)];
  }
  return [classFromNotation(term)];
}

function parseParts(term) {
  const high = term[0];
  const low = term[1];
  const suffix = term.slice(2); // '', 's' or 'o'
  if (!RANK_ORDER.includes(high) || !RANK_ORDER.includes(low)) {
    throw new Error(`Unknown ranks in range term: ${term}`);
  }
  return { high, low, suffix };
}

function expandPlus(term) {
  const { high, low, suffix } = parseParts(term);

  // Pairs climb: 22+ is every pair from deuces to aces.
  if (high === low) {
    return RANK_ORDER
      .filter(r => rankValue(r) >= rankValue(low))
      .map(r => classFromNotation(`${r}${r}`));
  }

  // Non-pairs climb the *kicker*, holding the top card: ATs+ is ATs, AJs, AQs,
  // AKs — not A-anything and not KTs.
  const out = [];
  for (const kicker of RANK_ORDER) {
    const value = rankValue(kicker);
    if (value < rankValue(low) || value >= rankValue(high)) continue;
    out.push(...suffixed(high, kicker, suffix));
  }
  return out;
}

function expandSpan(term) {
  const [fromText, toText] = term.split('-').map(s => s.trim());
  const from = parseParts(fromText);
  const to = parseParts(toText);

  if (from.suffix !== to.suffix) {
    throw new Error(`Mismatched suits in range span: ${term}`);
  }

  // Pair spans: 22-99.
  if (from.high === from.low && to.high === to.low) {
    const lo = Math.min(rankValue(from.low), rankValue(to.low));
    const hi = Math.max(rankValue(from.low), rankValue(to.low));
    return RANK_ORDER
      .filter(r => rankValue(r) >= lo && rankValue(r) <= hi)
      .map(r => classFromNotation(`${r}${r}`));
  }

  // Connector spans keep the gap constant: 76s-98s is 76s, 87s, 98s.
  const gapFrom = rankValue(from.high) - rankValue(from.low);
  const gapTo = rankValue(to.high) - rankValue(to.low);
  if (gapFrom !== gapTo) {
    throw new Error(`Range span must keep a constant gap: ${term}`);
  }

  const lo = Math.min(rankValue(from.high), rankValue(to.high));
  const hi = Math.max(rankValue(from.high), rankValue(to.high));

  const out = [];
  for (const high of RANK_ORDER) {
    const value = rankValue(high);
    if (value < lo || value > hi) continue;
    const lowValue = value - gapFrom;
    if (lowValue < 0) continue;
    const low = RANK_ORDER[12 - lowValue];
    out.push(...suffixed(high, low, from.suffix));
  }
  return out;
}

function suffixed(high, low, suffix) {
  if (suffix === 's') return [classFromNotation(`${high}${low}s`)];
  if (suffix === 'o') return [classFromNotation(`${high}${low}o`)];
  return [classFromNotation(`${high}${low}s`), classFromNotation(`${high}${low}o`)];
}

/** Render a range back to a sorted, readable list — handy in tests and tooltips. */
export function formatRange(range) {
  return [...range.keys()]
    .sort((a, b) => a - b)
    .map(classNotation)
    .join(', ');
}

/** Every class not in the given range. */
export function complementOf(range) {
  return new Map(ALL_CLASSES.filter(c => !range.has(c)).map(c => [c, 1]));
}
