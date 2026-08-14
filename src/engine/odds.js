// Pot odds and the frequencies that fall out of them.
//
// Everything here is arithmetic with a single right answer. Unlike the strategy
// frequencies elsewhere in this app, none of it is a model, an approximation or
// a heuristic — which makes it the part of the trainer you can trust
// completely, and the part most worth internalising. Get these right at the
// table and you have already recovered most of what a solver would tell you.
//
// All amounts are in big blinds. "Pot" always means the pot *before* the bet
// under discussion, so `pot` and `bet` never double-count.

/**
 * Equity needed for a call to break even.
 *
 *   you risk `callAmount` to win `pot + callAmount`
 *
 * Facing 5 into a pot of 10 you are getting 3-to-1 and need 25%.
 */
export function breakEvenEquity(callAmount, pot) {
  if (callAmount <= 0) return 0;
  return callAmount / (pot + callAmount);
}

/** The same number expressed the way it gets quoted at a table: "3.0 to 1". */
export function potOddsRatio(callAmount, pot) {
  if (callAmount <= 0) return Infinity;
  return pot / callAmount;
}

/**
 * Minimum defence frequency — how often you must continue to stop a bet of this
 * size from printing money as a pure bluff.
 *
 * The mirror image of break-even equity, from the caller's side of the table:
 * against a half-pot bet you must defend 2/3 of the time.
 */
export function minimumDefenceFrequency(bet, pot) {
  if (bet <= 0) return 1;
  return pot / (pot + bet);
}

/**
 * The share of a betting range that can be bluffs while the bet stays
 * indifferent for the caller. Also the fraction of the time a bluff needs to
 * work: a pot-sized bluff needs to succeed half the time.
 */
export function breakEvenBluffFrequency(bet, pot) {
  if (bet <= 0) return 0;
  return bet / (pot + bet);
}

/**
 * Fold equity a semi-bluff needs, given the equity it retains when called.
 *
 * Returns 0 when the hand already has enough equity to bet without folds — that
 * is not a bluff, it is a value bet, and the answer to "how often must this
 * work" is "never".
 */
export function requiredFoldEquity(bet, pot, equityWhenCalled) {
  const rewardIfFolds = pot;
  // Called and winning takes the pot plus villain's call; called and losing
  // costs the bet.
  const evIfCalled = equityWhenCalled * (pot + bet) - (1 - equityWhenCalled) * bet;

  if (evIfCalled >= 0) return 0;
  const needed = -evIfCalled / (rewardIfFolds - evIfCalled);
  return Math.max(0, Math.min(1, needed));
}

/**
 * Exact chance of completing a draw, by enumeration rather than the "rule of
 * 2 and 4", which is off by several points on a flop draw.
 *
 * @param outs cards that complete the hand
 * @param cardsToCome 1 (turn to river) or 2 (flop to river)
 * @param unseen cards not yet visible — 47 on the flop, 46 on the turn
 */
export function drawEquity(outs, cardsToCome, unseen = cardsToCome === 2 ? 47 : 46) {
  if (outs <= 0) return 0;
  if (cardsToCome <= 0) return 0;

  if (cardsToCome === 1) return Math.min(1, outs / unseen);

  // P(hit at least one) = 1 - P(miss both)
  const missFirst = (unseen - outs) / unseen;
  const missSecond = (unseen - 1 - outs) / (unseen - 1);
  return 1 - missFirst * missSecond;
}

/** What the rule of 2 and 4 would have told you — for showing the error. */
export function ruleOfTwoAndFour(outs, cardsToCome) {
  return Math.min(1, (outs * (cardsToCome === 2 ? 4 : 2)) / 100);
}

/**
 * EV of calling, in big blinds, relative to folding.
 *
 * Assumes the hand goes to showdown with no further betting — true on the
 * river, and an over-estimate everywhere else, because you do not realise your
 * whole equity when there are streets left to play. Only use it on the river,
 * or state the assumption.
 */
export function callEV(equity, callAmount, pot) {
  // Winning nets you the pot as it stood — your own call comes back to you, so
  // counting it as winnings would overstate every call by the size of the call
  // and put the break-even point in the wrong place.
  return equity * pot - (1 - equity) * callAmount;
}

/**
 * Combos of a hand class still available after some cards are known to be gone.
 *
 * The reason blockers matter: holding one ace cuts villain's AA combos from 6
 * to 3, and their AK from 16 to 12. Counting this correctly is the whole of
 * blocker reasoning.
 *
 * @param pattern {ranks: [rank, rank], suited: boolean|null} — null means any
 * @param deadRanks ranks already accounted for, as an array of rank characters
 */
export function combosRemaining({ ranks, suited }, deadRanks = []) {
  const [r1, r2] = ranks;
  const gone = (rank) => deadRanks.filter(r => r === rank).length;

  if (r1 === r2) {
    const available = 4 - gone(r1);
    return Math.max(0, (available * (available - 1)) / 2);
  }

  const a = Math.max(0, 4 - gone(r1));
  const b = Math.max(0, 4 - gone(r2));

  if (suited === true) return Math.min(a, b);
  if (suited === false) return Math.max(0, a * b - Math.min(a, b));
  return a * b;
}
