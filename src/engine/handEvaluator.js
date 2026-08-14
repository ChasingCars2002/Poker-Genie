// Classifies a hero holding against a board.
//
// The generated scenarios know what they dealt, so they can tag themselves.
// The handwritten scenarios in gtoData.js cannot — they are just cards. This
// reads the cards so those hands feed the mastery model too, instead of being
// a quarter of your session that quietly goes unmeasured.

const RANK_VALUES = { A: 14, K: 13, Q: 12, J: 11, T: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 };

const rankOf = (card) => card.slice(0, -1);
const suitOf = (card) => card[card.length - 1];
const valueOf = (card) => RANK_VALUES[rankOf(card)] || 0;

export function boardCardsOf(board) {
  const cards = [...(board.flop || [])];
  if (board.turn) cards.push(board.turn);
  if (board.river) cards.push(board.river);
  return cards;
}

function countBy(items) {
  const counts = {};
  for (const item of items) counts[item] = (counts[item] || 0) + 1;
  return counts;
}

/** Longest run of consecutive ranks available to the hero, ace-high or wheel. */
function straightOuts(values) {
  const unique = [...new Set(values)];
  if (unique.includes(14)) unique.push(1); // wheel
  const present = new Set(unique);

  let openEnded = false;
  let gutshot = false;

  for (let low = 1; low <= 10; low++) {
    const window = [low, low + 1, low + 2, low + 3, low + 4];
    const hits = window.filter(v => present.has(v)).length;
    if (hits === 5) return { made: true, openEnded: false, gutshot: false };
    if (hits === 4) {
      // Four to a straight. Open-ended if the four are consecutive.
      const missing = window.find(v => !present.has(v));
      if (missing === window[0] || missing === window[4]) openEnded = true;
      else gutshot = true;
    }
  }

  return { made: false, openEnded, gutshot };
}

/**
 * @returns {{
 *   category: string,   // fine-grained, matches handGenerator's categories
 *   handClass: string,  // 'value' | 'draw' | 'marginal' | 'air'
 *   madePair: string|null,
 * }}
 */
export function classifyHand(heroHand, board) {
  const boardCards = boardCardsOf(board);
  if (!heroHand || heroHand.length < 2 || boardCards.length === 0) {
    return { category: 'air', handClass: 'air', madePair: null };
  }

  const heroRanks = heroHand.map(rankOf);
  const boardRanks = boardCards.map(rankOf);
  const heroValues = heroHand.map(valueOf);
  const boardValues = boardCards.map(valueOf);

  const topBoard = Math.max(...boardValues);
  const boardRankCounts = countBy(boardRanks);
  const isPocketPair = heroRanks[0] === heroRanks[1];

  // How many board cards each hero card pairs.
  const pairedBoardRanks = heroRanks.filter(r => boardRanks.includes(r));

  // ── Made hands, strongest first ──
  if (isPocketPair && boardRanks.includes(heroRanks[0])) {
    return { category: 'set', handClass: 'value', madePair: heroRanks[0] };
  }
  if (pairedBoardRanks.length === 1 && boardRankCounts[pairedBoardRanks[0]] >= 2) {
    return { category: 'set', handClass: 'value', madePair: pairedBoardRanks[0] }; // trips
  }
  if (new Set(pairedBoardRanks).size >= 2) {
    return { category: 'two-pair', handClass: 'value', madePair: pairedBoardRanks[0] };
  }

  // Flush and straight checks use hero + board together.
  const allSuits = [...heroHand, ...boardCards].map(suitOf);
  const suitCounts = countBy(allSuits);
  const heroSuitCounts = countBy(heroHand.map(suitOf));
  const flushSuit = Object.keys(suitCounts).find(s => suitCounts[s] >= 5);
  // Only a flush if hero actually contributes — five on the board plays the board.
  if (flushSuit && heroSuitCounts[flushSuit]) {
    return { category: 'monster', handClass: 'value', madePair: null };
  }

  const straight = straightOuts([...heroValues, ...boardValues]);
  if (straight.made) {
    return { category: 'monster', handClass: 'value', madePair: null };
  }

  if (isPocketPair && heroValues[0] > topBoard) {
    return { category: 'overpair', handClass: 'value', madePair: heroRanks[0] };
  }

  if (pairedBoardRanks.length === 1) {
    const pairedValue = RANK_VALUES[pairedBoardRanks[0]];
    if (pairedValue === topBoard) {
      const kicker = Math.max(...heroValues.filter(v => v !== pairedValue));
      // Top pair with a weak kicker plays like a bluff-catcher, not a value
      // hand, and mis-tagging it as "value" would hide a very common leak.
      if (kicker >= 13) return { category: 'top-pair-top-kicker', handClass: 'value', madePair: pairedBoardRanks[0] };
      if (kicker >= 10) return { category: 'top-pair', handClass: 'value', madePair: pairedBoardRanks[0] };
      return { category: 'weak-top-pair', handClass: 'marginal', madePair: pairedBoardRanks[0] };
    }
    return { category: 'middle-pair', handClass: 'marginal', madePair: pairedBoardRanks[0] };
  }

  if (isPocketPair) {
    // Underpair to the board.
    return { category: 'marginal', handClass: 'marginal', madePair: heroRanks[0] };
  }

  // ── Draws, only while there are cards to come ──
  const cardsToCome = 5 - boardCards.length;
  if (cardsToCome > 0) {
    const drawSuit = Object.keys(suitCounts).find(s => suitCounts[s] === 4);
    if (drawSuit && heroSuitCounts[drawSuit]) {
      return { category: 'flush-draw', handClass: 'draw', madePair: null };
    }
    if (straight.openEnded) return { category: 'oesd', handClass: 'draw', madePair: null };
    if (straight.gutshot) return { category: 'gutshot', handClass: 'draw', madePair: null };
  }

  if (Math.min(...heroValues) > topBoard) {
    return { category: 'overcards', handClass: 'air', madePair: null };
  }

  return { category: 'air', handClass: 'air', madePair: null };
}
