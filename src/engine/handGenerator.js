import { RANKS } from '../data/gtoData';

const RANK_VALUES = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
const ALL_SUITS = ['s', 'h', 'd', 'c'];

function rankValue(r) { return RANK_VALUES[r] || 0; }
function cardStr(rank, suit) { return `${rank}${suit}`; }

function pickRandom(arr, rng) {
  return arr[Math.floor((rng ? rng() : Math.random()) * arr.length)];
}

function shuffleArray(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor((rng ? rng() : Math.random()) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function findAvailableCard(rank, usedCards, preferredSuit, rng) {
  if (preferredSuit) {
    const c = cardStr(rank, preferredSuit);
    if (!usedCards.has(c)) return c;
  }
  const suits = shuffleArray(ALL_SUITS, rng);
  for (const s of suits) {
    const c = cardStr(rank, s);
    if (!usedCards.has(c)) return c;
  }
  return null;
}

function getBoardRanks(board) {
  const allCards = [...(board.flop || [])];
  if (board.turn) allCards.push(board.turn);
  if (board.river) allCards.push(board.river);
  return allCards.map(c => c.slice(0, -1));
}

function getBoardSuits(board) {
  const allCards = [...(board.flop || [])];
  if (board.turn) allCards.push(board.turn);
  if (board.river) allCards.push(board.river);
  return allCards.map(c => c[c.length - 1]);
}

function getAllBoardCards(board) {
  const cards = [...(board.flop || [])];
  if (board.turn) cards.push(board.turn);
  if (board.river) cards.push(board.river);
  return cards;
}

export function generateTopPair(board, usedCards, rng) {
  const used = new Set(usedCards || []);
  getAllBoardCards(board).forEach(c => used.add(c));

  const boardRanks = getBoardRanks(board);
  const highestBoardRank = boardRanks.reduce((best, r) => rankValue(r) > rankValue(best) ? r : best, boardRanks[0]);

  const card1 = findAvailableCard(highestBoardRank, used, null, rng);
  if (!card1) return generateAir(board, usedCards, rng);
  used.add(card1);

  const kickerRanks = RANKS.filter(r =>
    rankValue(r) > 8 &&
    rankValue(r) !== rankValue(highestBoardRank) &&
    !boardRanks.includes(r)
  );
  const kickerRank = pickRandom(kickerRanks.length ? kickerRanks : RANKS.filter(r => !boardRanks.includes(r)).slice(0, 5), rng);
  const card2 = findAvailableCard(kickerRank, used, null, rng);
  if (!card2) return generateAir(board, usedCards, rng);
  used.add(card2);

  const hand = rankValue(card1.slice(0, -1)) > rankValue(card2.slice(0, -1))
    ? [card1, card2] : [card2, card1];

  return { hand, usedCards: used };
}

export function generateOverpair(board, usedCards, rng) {
  const used = new Set(usedCards || []);
  getAllBoardCards(board).forEach(c => used.add(c));

  const boardRanks = getBoardRanks(board);
  const highestBoardValue = Math.max(...boardRanks.map(r => rankValue(r)));

  const pairRanks = RANKS.filter(r => rankValue(r) > highestBoardValue);
  if (pairRanks.length === 0) return generateTopPair(board, usedCards, rng);

  const pairRank = pickRandom(pairRanks, rng);
  const suits = shuffleArray(ALL_SUITS, rng);
  const cards = [];
  for (const s of suits) {
    const c = cardStr(pairRank, s);
    if (!used.has(c)) {
      cards.push(c);
      used.add(c);
      if (cards.length === 2) break;
    }
  }
  if (cards.length < 2) return generateTopPair(board, usedCards, rng);

  return { hand: cards, usedCards: used };
}

export function generateDraw(board, drawType, usedCards, rng) {
  const used = new Set(usedCards || []);
  getAllBoardCards(board).forEach(c => used.add(c));

  const boardSuits = getBoardSuits(board);
  const boardRanks = getBoardRanks(board);
  const boardValues = boardRanks.map(r => rankValue(r)).sort((a, b) => a - b);

  if (drawType === 'flush') {
    const suitCounts = {};
    boardSuits.forEach(s => { suitCounts[s] = (suitCounts[s] || 0) + 1; });
    const flushSuit = Object.entries(suitCounts).find(([, count]) => count >= 2)?.[0];

    if (flushSuit) {
      const available = RANKS.filter(r => !used.has(cardStr(r, flushSuit)));
      if (available.length >= 1) {
        const shuffled = shuffleArray(available, rng);
        const card1 = cardStr(shuffled[0], flushSuit);

        // Second card must be off-suit, or we would be dealing a made flush
        // rather than a draw. Search every off-suit card instead of picking one
        // suit up front — that pick could leave no legal rank, and the old code
        // then built a card literally named "undefineds".
        const offSuits = shuffleArray(ALL_SUITS.filter(s => s !== flushSuit), rng);
        for (const suit of offSuits) {
          const rank = RANKS.find(r => r !== shuffled[0] && !used.has(cardStr(r, suit)));
          if (!rank) continue;
          const card2 = cardStr(rank, suit);
          used.add(card1);
          used.add(card2);
          return { hand: [card1, card2], usedCards: used };
        }
      }
    }
  }

  if (drawType === 'oesd' || drawType === 'gutshot') {
    const offset = drawType === 'oesd' ? 1 : 2;
    const target1 = boardValues[boardValues.length - 1] + offset;
    const target2 = boardValues[0] - offset;

    for (const tv of [target1, target2]) {
      if (tv >= 2 && tv <= 14) {
        const r = RANKS[14 - tv];
        if (r && !boardRanks.includes(r)) {
          const c1 = findAvailableCard(r, used, null, rng);
          if (c1) {
            used.add(c1);
            const otherRank = pickRandom(RANKS.filter(r2 =>
              !used.has(cardStr(r2, 's')) && !boardRanks.includes(r2) && r2 !== r
            ), rng);
            const c2 = findAvailableCard(otherRank, used, null, rng);
            if (c2) {
              used.add(c2);
              return { hand: [c1, c2], usedCards: used };
            }
          }
        }
      }
    }
  }

  return generateAir(board, usedCards, rng);
}

export function generateAir(board, usedCards, rng) {
  const used = new Set(usedCards || []);
  getAllBoardCards(board).forEach(c => used.add(c));

  const boardRanks = getBoardRanks(board);
  const lowRanks = RANKS.filter(r =>
    rankValue(r) <= 9 && !boardRanks.includes(r)
  );

  const cards = [];
  const shuffled = shuffleArray(lowRanks.length >= 2 ? lowRanks : RANKS.filter(r => !boardRanks.includes(r)), rng);
  for (const rank of shuffled) {
    // Try every suit for this rank. Picking one suit at random and moving on
    // when it collided used to discard perfectly legal ranks and drop us into
    // the exhaustive fallback below far more often than necessary.
    const card = findAvailableCard(rank, used, null, rng);
    if (card) {
      cards.push(card);
      used.add(card);
      if (cards.length === 2) break;
    }
  }

  if (cards.length < 2) {
    for (const r of RANKS) {
      for (const s of ALL_SUITS) {
        const c = cardStr(r, s);
        if (!used.has(c)) {
          cards.push(c);
          used.add(c);
          if (cards.length === 2) return { hand: cards, usedCards: used };
        }
      }
    }
  }

  return { hand: cards, usedCards: used };
}

export function generateOvercards(board, usedCards, rng) {
  const used = new Set(usedCards || []);
  getAllBoardCards(board).forEach(c => used.add(c));

  const boardRanks = getBoardRanks(board);
  const highestBoardValue = Math.max(...boardRanks.map(r => rankValue(r)));

  // Two cards above the board — the "overcards" category previously routed to
  // generateAir, which deals *low* ranks, i.e. the opposite of what the
  // template and its explanation text described.
  const overRanks = RANKS.filter(r => rankValue(r) > highestBoardValue && !boardRanks.includes(r));
  if (overRanks.length < 2) return generateAir(board, usedCards, rng);

  const shuffled = shuffleArray(overRanks, rng);
  const cards = [];
  for (const rank of shuffled) {
    const card = findAvailableCard(rank, used, null, rng);
    if (card) {
      cards.push(card);
      used.add(card);
      if (cards.length === 2) break;
    }
  }

  if (cards.length < 2) return generateAir(board, usedCards, rng);

  return {
    hand: cards.sort((a, b) => rankValue(b.slice(0, -1)) - rankValue(a.slice(0, -1))),
    usedCards: used,
  };
}

export function generateMonster(board, usedCards, rng) {
  const used = new Set(usedCards || []);
  getAllBoardCards(board).forEach(c => used.add(c));

  const boardRanks = getBoardRanks(board);

  for (const rank of boardRanks) {
    const available = ALL_SUITS.filter(s => !used.has(cardStr(rank, s)));
    if (available.length >= 2) {
      const suits = shuffleArray(available, rng).slice(0, 2);
      const cards = suits.map(s => cardStr(rank, s));
      cards.forEach(c => used.add(c));
      return { hand: cards, usedCards: used };
    }
  }

  if (boardRanks.length >= 2) {
    const c1 = findAvailableCard(boardRanks[0], used, null, rng);
    if (c1) {
      used.add(c1);
      const c2 = findAvailableCard(boardRanks[1], used, null, rng);
      if (c2) {
        used.add(c2);
        return { hand: [c1, c2], usedCards: used };
      }
    }
  }

  return generateTopPair(board, usedCards, rng);
}

export function generateTwoPair(board, usedCards, rng) {
  const used = new Set(usedCards || []);
  getAllBoardCards(board).forEach(c => used.add(c));

  // Two pair means pairing two *different* board ranks. The `two-pair`
  // category used to fall through to generateMonster, which pairs a single
  // rank twice — that is a set, and the explanation text said "two pair" over
  // a board where the player was actually looking at trips.
  const boardRanks = [...new Set(getBoardRanks(board))]
    .sort((a, b) => rankValue(b) - rankValue(a));

  if (boardRanks.length >= 2) {
    // Prefer the top two ranks; that is the two pair worth playing for.
    const [first, second] = boardRanks;
    const card1 = findAvailableCard(first, used, null, rng);
    if (card1) {
      used.add(card1);
      const card2 = findAvailableCard(second, used, null, rng);
      if (card2) {
        used.add(card2);
        return { hand: [card1, card2], usedCards: used };
      }
      used.delete(card1);
    }
  }

  return generateMonster(board, usedCards, rng);
}

export function generateMarginalHand(board, usedCards, rng) {
  const used = new Set(usedCards || []);
  getAllBoardCards(board).forEach(c => used.add(c));

  const boardRanks = getBoardRanks(board);
  const boardValues = boardRanks.map(r => rankValue(r)).sort((a, b) => b - a);

  const midRanks = boardRanks.filter(r => {
    const v = rankValue(r);
    return v < boardValues[0] && v > (boardValues[boardValues.length - 1] || 0);
  });

  const targetRank = midRanks.length ? pickRandom(midRanks, rng) : boardRanks[boardRanks.length - 1];

  const card1 = findAvailableCard(targetRank, used, null, rng);
  if (!card1) return generateAir(board, usedCards, rng);
  used.add(card1);

  const kickerRanks = RANKS.filter(r =>
    !boardRanks.includes(r) &&
    rankValue(r) >= 5 && rankValue(r) <= 10
  );
  const kickerRank = pickRandom(kickerRanks.length ? kickerRanks : RANKS.filter(r => !boardRanks.includes(r)), rng);
  const card2 = findAvailableCard(kickerRank, used, null, rng);
  if (!card2) return generateAir(board, usedCards, rng);
  used.add(card2);

  return { hand: [card1, card2], usedCards: used };
}

export function generateHandByCategory(category, board, usedCards, rng) {
  switch (category) {
    case 'top-pair':
    case 'top-pair-top-kicker':
      return generateTopPair(board, usedCards, rng);
    case 'overpair':
      return generateOverpair(board, usedCards, rng);
    case 'flush-draw':
      return generateDraw(board, 'flush', usedCards, rng);
    case 'oesd':
      return generateDraw(board, 'oesd', usedCards, rng);
    case 'gutshot':
      return generateDraw(board, 'gutshot', usedCards, rng);
    case 'air':
      return generateAir(board, usedCards, rng);
    case 'overcards':
      return generateOvercards(board, usedCards, rng);
    case 'monster':
    case 'set':
      return generateMonster(board, usedCards, rng);
    case 'two-pair':
      return generateTwoPair(board, usedCards, rng);
    case 'marginal':
    case 'middle-pair':
    case 'weak-top-pair':
      return generateMarginalHand(board, usedCards, rng);
    default:
      return generateAir(board, usedCards, rng);
  }
}
