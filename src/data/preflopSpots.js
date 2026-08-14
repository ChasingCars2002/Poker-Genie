// Preflop spots for 100bb 6-max cash.
//
// These are deliberately NOT opening charts to memorise. True 100bb GTO
// opening ranges cannot be computed without solving every postflop node, and no
// public chart set is licensed for redistribution — so shipping one would mean
// either inventing it or taking it. Both are worse than useless when the whole
// point is knowing which numbers to trust.
//
// What is computable exactly is the arithmetic that *generates* ranges: the
// price you are being offered, your equity against a stated range, and whether
// one clears the other. That transfers to every opponent and every stack depth,
// which memorising "LJ opens 15.5%" does not.
//
// So every spot here is a DEFENCE decision with an explicit, stated villain
// range. The range is a premise, shown on screen, and the answer follows from
// it by arithmetic rather than by assertion.

import { parseRange } from '../engine/rangeNotation';

// Blinds are 0.5 / 1. All amounts are big blinds.
export const SMALL_BLIND = 0.5;
export const BIG_BLIND = 1;

/**
 * Assumed opening ranges by position, used as the stated premise for equity.
 *
 * These are conventional, widely-taught opening ranges — tighter early, wider
 * late. They are a reasonable model of a competent 6-max reg, not solver
 * output, and the UI says so. Their job is to be a *stated assumption* the
 * player reasons from, which is why they live here in readable notation
 * instead of being buried in a table.
 */
export const OPENING_RANGES = {
  LJ: '77+, ATs+, KTs+, QTs+, JTs, T9s, 98s, AJo+, KQo',
  HJ: '66+, A9s+, K9s+, Q9s+, J9s+, T9s, 98s, 87s, ATo+, KJo+',
  CO: '44+, A5s+, K8s+, Q9s+, J9s+, T8s+, 97s+, 86s+, 75s+, ATo+, KTo+, QJo',
  BTN: '22+, A2s+, K7s+, Q8s+, J8s+, T8s+, 97s+, 86s+, 75s+, 65s, 54s, A7o+, K9o+, Q9o+, J9o+, T9o',
  SB: '22+, A2s+, K8s+, Q9s+, J9s+, T9s, 98s, 87s, A9o+, KTo+, QJo',
};

/** Ranges that continue against a 3-bet — much narrower than the open. */
export const VS_THREEBET_CONTINUE = {
  BTN: 'TT+, AQs+, AKo',
  CO: 'JJ+, AQs+, AKo',
  SB: 'JJ+, AKs, AKo',
};

/**
 * A spot the player can be dealt.
 *
 * `potBeforeAction` is everything in the middle before hero acts, including
 * villain's bet. `toCall` is what hero must put in. Keeping them separate is
 * what makes the pot-odds arithmetic checkable.
 */
function spot(config) {
  return { ...config, villainRange: parseRange(config.villainRangeText) };
}

export const PREFLOP_SPOTS = [
  // ── Big blind defence ────────────────────────────────────────────────
  // The single highest-frequency spot in 6-max, and the one where most money
  // leaks. You are closing the action and already have a blind invested, so
  // the price is excellent — which is exactly why people over-fold here and
  // then over-call from everywhere else.
  spot({
    id: 'bb-vs-btn-open',
    label: 'BB vs BTN open',
    context: 'vs-open',
    heroPosition: 'BB',
    villainPosition: 'BTN',
    openSize: 2.5,
    // 2.5 open + 0.5 SB + 1 BB
    potBeforeAction: 4,
    toCall: 1.5,
    villainRangeText: OPENING_RANGES.BTN,
    difficulty: 3,
    note: 'You close the action and 1bb of the pot is already yours, so this is the best price you will get all hand.',
  }),
  spot({
    id: 'bb-vs-co-open',
    label: 'BB vs CO open',
    context: 'vs-open',
    heroPosition: 'BB',
    villainPosition: 'CO',
    openSize: 2.5,
    potBeforeAction: 4,
    toCall: 1.5,
    villainRangeText: OPENING_RANGES.CO,
    difficulty: 4,
    note: 'Same price as against the button, but a tighter range to beat — the correct defending range narrows with it.',
  }),
  spot({
    id: 'bb-vs-lj-open',
    label: 'BB vs LJ open',
    context: 'vs-open',
    heroPosition: 'BB',
    villainPosition: 'LJ',
    openSize: 2.5,
    potBeforeAction: 4,
    toCall: 1.5,
    villainRangeText: OPENING_RANGES.LJ,
    difficulty: 6,
    note: 'The tightest open you will face. The price has not changed, but what it takes to beat this range has.',
  }),
  spot({
    id: 'bb-vs-btn-large-open',
    label: 'BB vs BTN 3x open',
    context: 'vs-open',
    heroPosition: 'BB',
    villainPosition: 'BTN',
    openSize: 3,
    potBeforeAction: 4.5,
    toCall: 2,
    villainRangeText: OPENING_RANGES.BTN,
    difficulty: 5,
    note: 'A bigger open changes the price, not the range. Watch how much the required equity moves for half a big blind.',
  }),

  // ── Small blind defence ──────────────────────────────────────────────
  // Worse than the big blind in every way: a worse price, a player still to
  // act behind, and out of position for the rest of the hand.
  spot({
    id: 'sb-vs-btn-open',
    label: 'SB vs BTN open',
    context: 'vs-open',
    heroPosition: 'SB',
    villainPosition: 'BTN',
    openSize: 2.5,
    potBeforeAction: 4,
    toCall: 2,
    villainRangeText: OPENING_RANGES.BTN,
    difficulty: 6,
    note: 'A worse price than the big blind gets, the big blind still to act behind you, and out of position afterwards.',
  }),
  spot({
    id: 'sb-vs-co-open',
    label: 'SB vs CO open',
    context: 'vs-open',
    heroPosition: 'SB',
    villainPosition: 'CO',
    openSize: 2.5,
    potBeforeAction: 4,
    toCall: 2,
    villainRangeText: OPENING_RANGES.CO,
    difficulty: 7,
    note: 'The worst of both: a tight opening range and the worst seat at the table.',
  }),

  // ── Facing a 3-bet ───────────────────────────────────────────────────
  spot({
    id: 'btn-vs-bb-3bet',
    label: 'BTN vs BB 3-bet',
    context: 'vs-3bet',
    heroPosition: 'BTN',
    villainPosition: 'BB',
    openSize: 2.5,
    threeBetSize: 11,
    // 2.5 open + 11 three-bet + 0.5 SB
    potBeforeAction: 14,
    toCall: 8.5,
    villainRangeText: 'TT+, AJs+, KQs, AQo+, A5s:0.5, A4s:0.5, 76s:0.5, 65s:0.5',
    difficulty: 7,
    note: 'A polarised 3-bet range: premiums plus a slice of suited bluffs. You are getting a much worse price than the blinds ever do.',
  }),

  // ── Facing an all-in ─────────────────────────────────────────────────
  // The one preflop spot with no approximation whatsoever. There are no
  // streets left to misplay, so raw equity IS the answer — not an estimate of
  // it. Everything else on this list carries a realisation caveat; this does
  // not.
  spot({
    id: 'vs-4bet-jam',
    label: 'Facing a 4-bet jam',
    context: 'vs-jam',
    heroPosition: 'BTN',
    villainPosition: 'SB',
    potBeforeAction: 47,
    toCall: 25,
    villainRangeText: 'QQ+, AKs, AKo, JJ:0.5, AQs:0.5',
    difficulty: 5,
    exact: true,
    note: 'No streets left to play, so your raw equity is exactly your equity. This is the only preflop decision with no approximation in it at all.',
  }),
  spot({
    id: 'vs-short-jam',
    label: 'Facing a short stack jam',
    context: 'vs-jam',
    heroPosition: 'BB',
    villainPosition: 'BTN',
    potBeforeAction: 16.5,
    toCall: 14,
    villainRangeText: '22+, A2s+, K9s+, QTs+, JTs, T9s, A7o+, KTo+, QJo',
    difficulty: 4,
    exact: true,
    note: 'A wide jamming range and a decent price. Pure equity against a stated range — no realisation to worry about.',
  }),
];

export function spotById(id) {
  return PREFLOP_SPOTS.find(s => s.id === id);
}
