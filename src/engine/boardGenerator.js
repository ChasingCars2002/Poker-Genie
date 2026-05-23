import { RANKS, SUITS } from '../data/gtoData';

const ALL_SUITS = Object.keys(SUITS);
const RANK_VALUES = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };

function rankValue(r) {
  return RANK_VALUES[r] || 0;
}

function cardStr(rank, suit) {
  return `${rank}${suit}`;
}

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

function randomSuit(exclude, rng) {
  const opts = ALL_SUITS.filter(s => !exclude.includes(s));
  return pickRandom(opts.length ? opts : ALL_SUITS, rng);
}

function diverseSuits(count, rng) {
  const shuffled = shuffleArray(ALL_SUITS, rng);
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length]);
  }
  return result;
}

function lowRanks(excludeAbove, rng) {
  return RANKS.filter(r => rankValue(r) < excludeAbove);
}

function isConnected(r1, r2) {
  return Math.abs(rankValue(r1) - rankValue(r2)) <= 2;
}

export function generateDryBoard(highCardRank, usedCards, rng) {
  const used = new Set(usedCards || []);
  const highRank = highCardRank || pickRandom(['A', 'K', 'Q'], rng);
  const highSuit = pickRandom(ALL_SUITS, rng);
  const highCard = cardStr(highRank, highSuit);
  used.add(highCard);

  const midRanks = RANKS.filter(r => rankValue(r) >= 5 && rankValue(r) <= rankValue(highRank) - 3);
  const lowRankPool = RANKS.filter(r => rankValue(r) >= 2 && rankValue(r) <= 6);

  let midRank, midSuit, midCard;
  for (let attempt = 0; attempt < 20; attempt++) {
    midRank = pickRandom(midRanks.length ? midRanks : ['8', '7', '6'], rng);
    midSuit = randomSuit([highSuit], rng);
    midCard = cardStr(midRank, midSuit);
    if (!used.has(midCard)) break;
  }
  used.add(midCard);

  let lowRank, lowSuit, lowCard;
  for (let attempt = 0; attempt < 20; attempt++) {
    lowRank = pickRandom(lowRankPool.length ? lowRankPool : ['4', '3', '2'], rng);
    if (lowRank === midRank) continue;
    lowSuit = randomSuit([highSuit, midSuit], rng);
    lowCard = cardStr(lowRank, lowSuit);
    if (!used.has(lowCard) && !isConnected(lowRank, midRank)) break;
  }
  used.add(lowCard);

  return { flop: [highCard, midCard, lowCard], usedCards: used };
}

export function generateWetBoard(usedCards, rng) {
  const used = new Set(usedCards || []);

  const startIdx = Math.floor((rng ? rng() : Math.random()) * 6) + 3;
  const r1 = RANKS[14 - startIdx];
  const r2 = RANKS[14 - startIdx + 1];
  const gap = Math.floor((rng ? rng() : Math.random()) * 2);
  const r3Idx = 14 - startIdx + 2 + gap;
  const r3 = RANKS[Math.min(r3Idx, RANKS.length - 1)];

  const suits = diverseSuits(3, rng);
  const twoSuited = (rng ? rng() : Math.random()) > 0.4;

  const s1 = suits[0];
  const s2 = twoSuited ? suits[0] : suits[1];
  const s3 = suits[2];

  const cards = [cardStr(r1, s1), cardStr(r2, s2), cardStr(r3, s3)];
  const valid = cards.every(c => !used.has(c)) && new Set(cards).size === 3;

  if (!valid) return generateDryBoard('K', usedCards, rng);

  cards.forEach(c => used.add(c));
  return { flop: cards, usedCards: used };
}

export function generateMonotoneBoard(suit, usedCards, rng) {
  const used = new Set(usedCards || []);
  const s = suit || pickRandom(ALL_SUITS, rng);

  const available = RANKS.filter(r => !used.has(cardStr(r, s)));
  const shuffled = shuffleArray(available, rng);

  const picked = shuffled.slice(0, 3).sort((a, b) => rankValue(b) - rankValue(a));
  const cards = picked.map(r => cardStr(r, s));
  cards.forEach(c => used.add(c));

  return { flop: cards, usedCards: used };
}

export function generatePairedBoard(usedCards, rng) {
  const used = new Set(usedCards || []);

  const pairRank = pickRandom(RANKS.slice(2, 10), rng);
  const suits = shuffleArray(ALL_SUITS, rng);
  const pairCards = [cardStr(pairRank, suits[0]), cardStr(pairRank, suits[1])];

  if (pairCards.some(c => used.has(c))) return generateDryBoard('A', usedCards, rng);

  const kickerRanks = RANKS.filter(r => r !== pairRank && rankValue(r) > rankValue(pairRank));
  const kickerRank = pickRandom(kickerRanks.length ? kickerRanks : RANKS.filter(r => r !== pairRank), rng);
  const kickerSuit = pickRandom(ALL_SUITS, rng);
  const kickerCard = cardStr(kickerRank, kickerSuit);

  const cards = [kickerCard, ...pairCards];
  cards.forEach(c => used.add(c));

  return { flop: cards, usedCards: used };
}

export function generateTurnCard(flop, constraints, usedCards, rng) {
  const used = new Set(usedCards || []);
  flop.forEach(c => used.add(c));

  const boardRanks = flop.map(c => c[0]);
  const boardSuits = flop.map(c => c[1]);

  if (constraints === 'brick') {
    const brickRanks = RANKS.filter(r =>
      rankValue(r) < rankValue(boardRanks[0]) - 2 &&
      !boardRanks.includes(r)
    );
    const rank = pickRandom(brickRanks.length ? brickRanks : ['4', '3', '2'], rng);
    const flushSuits = boardSuits.filter((s, i, arr) => arr.filter(x => x === s).length >= 2);
    const suit = randomSuit(flushSuits, rng);
    const card = cardStr(rank, suit);
    if (!used.has(card)) {
      used.add(card);
      return { card, usedCards: used };
    }
  }

  if (constraints === 'scare') {
    const scareRanks = RANKS.filter(r =>
      rankValue(r) >= rankValue(boardRanks[0]) &&
      !boardRanks.includes(r)
    );
    const rank = pickRandom(scareRanks.length ? scareRanks : ['A', 'K'], rng);
    const suit = pickRandom(ALL_SUITS, rng);
    const card = cardStr(rank, suit);
    if (!used.has(card)) {
      used.add(card);
      return { card, usedCards: used };
    }
  }

  const available = [];
  for (const r of RANKS) {
    for (const s of ALL_SUITS) {
      const c = cardStr(r, s);
      if (!used.has(c)) available.push(c);
    }
  }
  const card = pickRandom(available, rng);
  used.add(card);
  return { card, usedCards: used };
}

export function generateRiverCard(board, usedCards, rng) {
  const used = new Set(usedCards || []);
  board.forEach(c => used.add(c));

  const available = [];
  for (const r of RANKS) {
    for (const s of ALL_SUITS) {
      const c = cardStr(r, s);
      if (!used.has(c)) available.push(c);
    }
  }
  const card = pickRandom(available, rng);
  used.add(card);
  return { card, usedCards: used };
}

export function getBoardTexture(flop) {
  const suits = flop.map(c => c[c.length - 1]);
  const ranks = flop.map(c => c.slice(0, -1));
  const values = ranks.map(r => rankValue(r)).sort((a, b) => b - a);

  const isMonotone = suits[0] === suits[1] && suits[1] === suits[2];
  const isTwoTone = !isMonotone && new Set(suits).size <= 2;
  const isRainbow = new Set(suits).size === 3;
  const isPaired = new Set(ranks).size < 3;
  const highCard = values[0];
  const gaps = [values[0] - values[1], values[1] - values[2]];
  const isConnected = gaps[0] <= 2 && gaps[1] <= 2;
  const isDry = !isConnected && isRainbow && !isPaired;

  return { isMonotone, isTwoTone, isRainbow, isPaired, highCard, isConnected, isDry };
}
