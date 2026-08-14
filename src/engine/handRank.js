// Seven-card hand evaluator.
//
// This is the first piece of the app that computes something rather than
// asserting it. Everything downstream that claims to be a real number —
// equity, pot odds against a range, blocker effects — bottoms out here, so it
// has to be exactly right rather than approximately right.
//
// Cards are integer indices 0-51: `rank * 4 + suit`, rank 0..12 = 2..A,
// suit 0..3 = s,h,d,c. Integers rather than the app's 'As' strings because the
// equity build enumerates tens of millions of hands.

export const RANKS_LOW_TO_HIGH = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUIT_ORDER = ['s', 'h', 'd', 'c'];

export const CATEGORY = {
  HIGH_CARD: 0,
  PAIR: 1,
  TWO_PAIR: 2,
  TRIPS: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  QUADS: 7,
  STRAIGHT_FLUSH: 8,
};

export const CATEGORY_NAMES = [
  'High Card', 'Pair', 'Two Pair', 'Three of a Kind', 'Straight',
  'Flush', 'Full House', 'Four of a Kind', 'Straight Flush',
];

export const cardIndex = (rank, suit) => rank * 4 + suit;
export const rankOfCard = (card) => (card / 4) | 0;
export const suitOfCard = (card) => card % 4;

/** Parse the app's card notation ('As', 'Th') into an index. */
export function parseCardIndex(str) {
  const rank = RANKS_LOW_TO_HIGH.indexOf(str.slice(0, -1));
  const suit = SUIT_ORDER.indexOf(str[str.length - 1]);
  if (rank < 0 || suit < 0) throw new Error(`Unparseable card: ${str}`);
  return cardIndex(rank, suit);
}

export function formatCard(card) {
  return `${RANKS_LOW_TO_HIGH[rankOfCard(card)]}${SUIT_ORDER[suitOfCard(card)]}`;
}

/**
 * Highest rank completing a 5-straight in a 13-bit rank mask, or -1.
 * Returns the rank index of the straight's top card (so a wheel returns 3, the
 * index of the five — the wheel is the lowest straight, not an ace-high one).
 */
export function straightHigh(rankMask) {
  for (let high = 12; high >= 4; high--) {
    let complete = true;
    for (let step = 0; step < 5; step++) {
      if (!((rankMask >> (high - step)) & 1)) { complete = false; break; }
    }
    if (complete) return high;
  }
  // Wheel: A-2-3-4-5. The ace plays low, which no descending scan will find.
  if (((rankMask >> 12) & 1) && (rankMask & 0b1111) === 0b1111) return 3;
  return -1;
}

// Scratch buffers, reused across calls. The build script evaluates tens of
// millions of hands and allocating per call dominates the runtime.
const rankCounts = new Int32Array(13);
const suitCounts = new Int32Array(4);
const suitRankMasks = new Int32Array(4);

/**
 * Score a 7-card hand. Higher is better; scores are only comparable to each
 * other, and equal scores are genuine ties.
 *
 * Layout: category in bits 20-23, then five 4-bit tiebreak ranks, most
 * significant first. Five tiebreakers is always enough — a poker hand is five
 * cards, so any comparison is decided within them.
 */
export function evaluate7(cards) {
  rankCounts.fill(0);
  suitCounts.fill(0);
  suitRankMasks.fill(0);

  let rankMask = 0;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const rank = (card / 4) | 0;
    const suit = card % 4;
    rankCounts[rank]++;
    suitCounts[suit]++;
    suitRankMasks[suit] |= 1 << rank;
    rankMask |= 1 << rank;
  }

  let flushSuit = -1;
  for (let suit = 0; suit < 4; suit++) {
    if (suitCounts[suit] >= 5) { flushSuit = suit; break; }
  }

  if (flushSuit >= 0) {
    const suitedMask = suitRankMasks[flushSuit];

    // A straight flush outranks quads, so it has to be checked before the
    // rank-count categories below, not alongside the plain flush.
    const sfHigh = straightHigh(suitedMask);
    if (sfHigh >= 0) return score(CATEGORY.STRAIGHT_FLUSH, sfHigh);
  }

  // Bucket ranks by how many of each we hold. Descending within each bucket so
  // the tiebreakers come out in the right order.
  let quad = -1;
  const trips = [];
  const pairs = [];
  const singles = [];
  for (let rank = 12; rank >= 0; rank--) {
    switch (rankCounts[rank]) {
      case 4: quad = rank; break;
      case 3: trips.push(rank); break;
      case 2: pairs.push(rank); break;
      case 1: singles.push(rank); break;
      default: break;
    }
  }

  if (quad >= 0) {
    // Best kicker is the highest remaining card, which may itself be part of a
    // pair or trips.
    let kicker = -1;
    for (let rank = 12; rank >= 0; rank--) {
      if (rank !== quad && rankCounts[rank] > 0) { kicker = rank; break; }
    }
    return score(CATEGORY.QUADS, quad, kicker);
  }

  // Two sets of trips is a full house using the higher set as the trips.
  if (trips.length >= 2) return score(CATEGORY.FULL_HOUSE, trips[0], trips[1]);
  if (trips.length === 1 && pairs.length >= 1) return score(CATEGORY.FULL_HOUSE, trips[0], pairs[0]);

  if (flushSuit >= 0) {
    const suited = [];
    for (let rank = 12; rank >= 0 && suited.length < 5; rank--) {
      if ((suitRankMasks[flushSuit] >> rank) & 1) suited.push(rank);
    }
    return score(CATEGORY.FLUSH, ...suited);
  }

  const sHigh = straightHigh(rankMask);
  if (sHigh >= 0) return score(CATEGORY.STRAIGHT, sHigh);

  if (trips.length === 1) return score(CATEGORY.TRIPS, trips[0], singles[0], singles[1]);
  if (pairs.length >= 2) {
    // With three pairs only the top two play; the third pair's higher card is
    // still a candidate kicker.
    const kicker = Math.max(singles[0] ?? -1, pairs[2] ?? -1);
    return score(CATEGORY.TWO_PAIR, pairs[0], pairs[1], kicker);
  }
  if (pairs.length === 1) return score(CATEGORY.PAIR, pairs[0], singles[0], singles[1], singles[2]);

  return score(CATEGORY.HIGH_CARD, singles[0], singles[1], singles[2], singles[3], singles[4]);
}

function score(category, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0) {
  return (category << 20) | (t1 << 16) | (t2 << 12) | (t3 << 8) | (t4 << 4) | t5;
}

export const categoryOf = (score) => score >>> 20;
export const categoryNameOf = (score) => CATEGORY_NAMES[categoryOf(score)];
