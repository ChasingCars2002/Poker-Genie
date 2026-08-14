import { RANKS } from '../data/gtoData';

const RANK_NAMES = {
  'A': 'Ace', 'K': 'King', 'Q': 'Queen', 'J': 'Jack', 'T': 'Ten',
  '9': 'Nine', '8': 'Eight', '7': 'Seven', '6': 'Six', '5': 'Five',
  '4': 'Four', '3': 'Three', '2': 'Deuce',
};

const SUIT_NAMES = { 's': 'spades', 'h': 'hearts', 'd': 'diamonds', 'c': 'clubs' };

function handName(hand) {
  const r1 = hand[0].slice(0, -1);
  const r2 = hand[1].slice(0, -1);
  const s1 = hand[0][hand[0].length - 1];
  const s2 = hand[1][hand[1].length - 1];

  const suited = s1 === s2;
  if (r1 === r2) return `pocket ${RANK_NAMES[r1]?.toLowerCase() || r1}s`;

  return `${r1}${r2}${suited ? 's' : 'o'}`;
}

function boardName(board) {
  const cards = [...(board.flop || [])];
  if (board.turn) cards.push(board.turn);
  if (board.river) cards.push(board.river);
  return cards.join(' ');
}

function boardTextureName(board) {
  const suits = board.flop.map(c => c[c.length - 1]);
  const uniqueSuits = new Set(suits).size;

  if (uniqueSuits === 1) return 'a monotone flop';
  if (uniqueSuits === 2) return 'a two-tone flop';
  return 'a rainbow flop';
}

export function buildExplanation(template, board, hand, strategy) {
  let text = template.explanationTemplate;

  text = text.replace('{hand}', handName(hand));
  text = text.replace('{board}', boardName(board));
  text = text.replace('{board_texture}', boardTextureName(board));

  const bestAction = strategy.actions.find(a => a.action === strategy.bestAction);
  if (bestAction) {
    const sizeLogic = bestAction.label
      ? `${bestAction.label} is the preferred line.`
      : 'Checking is the preferred line.';
    text = text.replace('{size_logic}', sizeLogic);
  }

  return text;
}
