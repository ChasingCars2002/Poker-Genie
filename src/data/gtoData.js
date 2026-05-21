// Mock GTO Solver Data
// Provides pre-computed strategy data for sample boards.
// Frequencies are "human-simplified" — rounded to nearest 25%.

export const POSITIONS = {
  UTG:    'Under the Gun',
  'UTG+1':'UTG+1',
  MP:     'Middle Position',
  LJ:     'Lojack',
  HJ:     'Hijack',
  CO:     'Cutoff',
  BTN:    'Button',
  SB:     'Small Blind',
  BB:     'Big Blind',
};

// Standard 9-max seat order, clockwise starting from the button.
// Used to lay out seats around the oval table so the visual ordering
// matches real poker action flow.
export const SEAT_ORDER_9MAX = ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO'];

export const SUITS = { s: 'spade', h: 'heart', d: 'diamond', c: 'club' };
export const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };
export const SUIT_COLORS = { s: '#94a3b8', h: '#ef4444', d: '#3b82f6', c: '#22c55e' };
export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function parseCard(str) {
  return { rank: str[0], suit: str[1] };
}

// ── Drills ──

export const DRILLS = [
  {
    id: 'srp-btn-vs-bb',
    name: 'SRP: BTN vs BB',
    description: 'Single Raised Pot as Button vs Big Blind. Practice c-betting and barreling strategies.',
    category: 'Single Raised Pots',
    difficulty: 'Beginner',
    icon: 'target',
    heroPosition: 'BTN',
    villainPosition: 'BB',
    potType: 'SRP',
  },
  {
    id: '3bet-oop-caller',
    name: '3-Bet Pots as Caller (OOP)',
    description: 'Defend your 3-bet calling range out of position. Focus on check-raising and delayed c-bets.',
    category: '3-Bet Pots',
    difficulty: 'Intermediate',
    icon: 'shield',
    heroPosition: 'BB',
    villainPosition: 'BTN',
    potType: '3BET',
  },
  {
    id: 'cbet-monotone',
    name: 'C-Betting on Monotone Boards',
    description: 'Learn when to fire and when to give up on single-suited flops.',
    category: 'Board Texture',
    difficulty: 'Intermediate',
    icon: 'layers',
    heroPosition: 'BTN',
    villainPosition: 'BB',
    potType: 'SRP',
  },
  {
    id: 'sb-defense',
    name: 'Small Blind Defense',
    description: 'Navigate the toughest position at the table. Practice 3-betting, calling, and postflop play from the SB.',
    category: 'Positional',
    difficulty: 'Advanced',
    icon: 'shield-alert',
    heroPosition: 'SB',
    villainPosition: 'BTN',
    potType: 'SRP',
  },
  {
    id: 'turn-barrels',
    name: 'Turn Barreling Decisions',
    description: 'Should you fire the second barrel or give up? Practice turn play after c-betting the flop.',
    category: 'Multi-Street',
    difficulty: 'Intermediate',
    icon: 'flame',
    heroPosition: 'BTN',
    villainPosition: 'BB',
    potType: 'SRP',
  },
  {
    id: 'river-bluffs',
    name: 'River Bluff or Give Up',
    description: 'The final street — the most important decision in poker. Practice river bluffing with blockers.',
    category: 'Multi-Street',
    difficulty: 'Advanced',
    icon: 'zap',
    heroPosition: 'BTN',
    villainPosition: 'BB',
    potType: 'SRP',
  },
  {
    id: 'multiway-pots',
    name: 'Multiway Pot Navigation',
    description: 'Tighten up and pick your spots carefully in 3+ player pots.',
    category: 'Multiway',
    difficulty: 'Advanced',
    icon: 'users',
    heroPosition: 'CO',
    villainPosition: 'BTN+BB',
    potType: 'SRP',
  },
  {
    id: 'squeeze-spots',
    name: 'Squeeze Play Mastery',
    description: 'Identify and execute profitable squeeze opportunities from the blinds.',
    category: '3-Bet Pots',
    difficulty: 'Advanced',
    icon: 'crosshair',
    heroPosition: 'BB',
    villainPosition: 'CO+BTN',
    potType: '3BET',
  },
];

// ── Logic Tags ──

export const LOGIC_TAGS = {
  RANGE_ADVANTAGE: { label: 'Range Advantage', color: '#3b82f6', description: 'Your range is stronger on this board texture overall.' },
  NUT_ADVANTAGE: { label: 'Nut Advantage', color: '#a855f7', description: 'You have more of the strongest hands (sets, two pair+).' },
  BOARD_COVERAGE: { label: 'High Board Coverage', color: '#22c55e', description: 'Betting covers many board runouts effectively.' },
  EQUITY_DENIAL: { label: 'Equity Denial', color: '#ef4444', description: 'Betting denies opponent equity with marginal holdings.' },
  POT_CONTROL: { label: 'Pot Control', color: '#f59e0b', description: 'Keeping the pot small protects your medium-strength hands.' },
  BLOCK_BET: { label: 'Block Bet', color: '#06b6d4', description: 'Small bet to set your own price and deny a larger bet from opponent.' },
  THIN_VALUE: { label: 'Thin Value', color: '#10b981', description: 'Extracting value from hands that are only slightly ahead.' },
  BLUFF_CANDIDATE: { label: 'Bluff Candidate', color: '#f43f5e', description: 'Good hand to bluff with due to blockers or backdoor equity.' },
  CHECK_RAISE_CANDIDATE: { label: 'Check-Raise Candidate', color: '#8b5cf6', description: 'Strong hand that benefits from trapping via check-raise.' },
  BLOCKER_EFFECT: { label: 'Blocker Effect', color: '#ec4899', description: 'Your hand blocks key combos in villain\'s range.' },
  BOARD_PAIR: { label: 'Paired Board', color: '#64748b', description: 'Paired boards reduce the number of strong hands for both players.' },
  DRAW_HEAVY: { label: 'Draw Heavy', color: '#f97316', description: 'Many draws available — protect your equity or semi-bluff.' },
  POSITIONAL_ADVANTAGE: { label: 'Position', color: '#06b6d4', description: 'Acting last gives you more information and control.' },
  RANGE_DISADVANTAGE: { label: 'Range Disadvantage', color: '#ef4444', description: 'Opponent\'s range is stronger on this texture.' },
};

// ── Scenarios ──

export const SCENARIOS = {
  'srp-btn-vs-bb': [
    // ── Board: As 8h 3c (A-high dry) ──
    {
      id: 'srp-1',
      board: { flop: ['As', '8h', '3c'], turn: null, river: null },
      heroHand: ['Ah', 'Kd'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 0, ev: 3.1 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 3.8, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 3.5, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['RANGE_ADVANTAGE', 'NUT_ADVANTAGE'],
        explanation: 'On A-high dry boards, BTN has a significant range and nut advantage. Top pair top kicker is a clear value hand. A small c-bet is preferred to keep BB\'s calling range wide.',
      },
    },
    {
      id: 'srp-2',
      board: { flop: ['As', '8h', '3c'], turn: null, river: null },
      heroHand: ['Kh', 'Qh'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 1.2 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 1.4, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 0.8, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['EQUITY_DENIAL', 'BOARD_COVERAGE'],
        explanation: 'KQo with backdoor flush draws has decent equity but is vulnerable to turn overcards. A small c-bet denies equity while building the pot cheaply. Checking is also fine as a mixed strategy.',
      },
    },
    {
      id: 'srp-3',
      board: { flop: ['As', '8h', '3c'], turn: null, river: null },
      heroHand: ['7d', '6d'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: -0.3 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: -0.1, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: -0.8, size: 4.88 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'BLUFF_CANDIDATE'],
        explanation: '76 suited with a gutshot is a marginal bluff candidate. Checking is preferred most of the time as we have little equity vs BB\'s continuing range. When we do bet, 33% size keeps it cheap.',
      },
    },
    {
      id: 'srp-4',
      board: { flop: ['As', '8h', '3c'], turn: null, river: null },
      heroHand: ['Ac', '3d'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 4.0 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 4.5, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 4.3, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'Two pair on a dry board is a strong hand. Small bet extracts thin value from Ax hands and pocket pairs. Mixing some checks to trap is also viable.',
      },
    },
    {
      id: 'srp-5',
      board: { flop: ['As', '8h', '3c'], turn: null, river: null },
      heroHand: ['Jc', 'Tc'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 0.4 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 0.6, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: -0.1, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['EQUITY_DENIAL', 'BLUFF_CANDIDATE'],
        explanation: 'JTs with backdoor straight and flush draws is a good c-bet candidate. We deny equity from hands like 9x, Tx, and small pairs while having backup equity if called.',
      },
    },
    // ── Board: Kd 7s 2h (K-high dry) ──
    {
      id: 'srp-6',
      board: { flop: ['Kd', '7s', '2h'], turn: null, river: null },
      heroHand: ['Ad', 'Kh'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 0, ev: 4.2 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 4.8, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 4.5, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['RANGE_ADVANTAGE', 'NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'AK on K-high dry is the nuts effectively. Small bet extracts max value from Kx, pocket pairs, and floats. BB has very few strong hands here.',
      },
    },
    {
      id: 'srp-7',
      board: { flop: ['Kd', '7s', '2h'], turn: null, river: null },
      heroHand: ['Qc', 'Jc'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 0.8 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 1.0, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 0.2, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['EQUITY_DENIAL', 'BOARD_COVERAGE'],
        explanation: 'QJo has two overcards and gutshot potential. Betting small is good to deny equity from hands like A5, A4, small pairs. Check is fine too in a mixed strategy.',
      },
    },
    {
      id: 'srp-8',
      board: { flop: ['Kd', '7s', '2h'], turn: null, river: null },
      heroHand: ['9h', '9s'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 2.1 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 2.3, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 1.5, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'EQUITY_DENIAL'],
        explanation: 'Pocket 9s are a medium-strength hand below top pair. Small bet for thin value against lower pairs and to deny equity from overcards. Checking to pot control is also fine.',
      },
    },
    // ── Board: Jh Ts 4d (connected) ──
    {
      id: 'srp-9',
      board: { flop: ['Jh', 'Ts', '4d'], turn: null, river: null },
      heroHand: ['Ah', 'Jd'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 3.0 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 3.2, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 50, ev: 3.5, size: 4.88 },
        ],
        bestAction: 'bet75',
        logicTags: ['DRAW_HEAVY', 'THIN_VALUE'],
        explanation: 'TPGK on a connected board with many draws. Larger sizing is preferred to charge draws and protect against straight/two-pair combos. BB has many draws in their range.',
      },
    },
    {
      id: 'srp-10',
      board: { flop: ['Jh', 'Ts', '4d'], turn: null, river: null },
      heroHand: ['8s', '7s'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 0.2 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 0.4, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 0.3, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['DRAW_HEAVY', 'BLUFF_CANDIDATE'],
        explanation: 'Open-ended straight draw is a great semi-bluff candidate. We have 8 outs to the nuts. Mixing between checking (to see free cards) and betting (to build the pot and fold out better) is optimal.',
      },
    },
    {
      id: 'srp-11',
      board: { flop: ['Jh', 'Ts', '4d'], turn: null, river: null },
      heroHand: ['5c', '5d'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: -0.1 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 0.0, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: -0.6, size: 4.88 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL'],
        explanation: 'Low pocket pair on a connected board is in bad shape. Too many overcards and draws out there. Check back and hope to see a safe runout. This hand has little value betting.',
      },
    },
    // ── Board: Qs 6d 2c (Q-high dry) ──
    {
      id: 'srp-12',
      board: { flop: ['Qs', '6d', '2c'], turn: null, river: null },
      heroHand: ['Ad', 'Qc'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 0, ev: 3.6 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 4.2, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 3.9, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['RANGE_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'AQ on Q-high dry board is a premium hand. Small sizing maximizes value as BB will call with many Qx, pocket pairs, and backdoor draws.',
      },
    },
    {
      id: 'srp-13',
      board: { flop: ['Qs', '6d', '2c'], turn: null, river: null },
      heroHand: ['Ts', '9s'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 0.3 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 0.5, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: -0.2, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['EQUITY_DENIAL', 'BLUFF_CANDIDATE'],
        explanation: 'T9s has overcards and backdoor draws. Good c-bet bluff candidate on Q-high dry board where BTN has range advantage. Folds out small pairs and weak Ax hands.',
      },
    },
  ],
  '3bet-oop-caller': [
    // ── Board: Ks Jh 7d ──
    {
      id: '3bet-1',
      board: { flop: ['Ks', 'Jh', '7d'], turn: null, river: null },
      heroHand: ['Qh', 'Qd'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 13.5, effectiveStack: 87, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 4.8 },
          { action: 'bet33', label: 'Donk 33%', frequency: 0, ev: 3.9, size: 4.46 },
          { action: 'bet75', label: 'Donk 75%', frequency: 25, ev: 4.2, size: 10.13 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'QQ on K-high board is a check most of the time. We have an overpair but face many Kx combos in villain\'s range. Check-calling is the standard line.',
      },
    },
    {
      id: '3bet-2',
      board: { flop: ['Ks', 'Jh', '7d'], turn: null, river: null },
      heroHand: ['As', 'Ks'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 13.5, effectiveStack: 87, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 6.2 },
          { action: 'bet33', label: 'Donk 33%', frequency: 25, ev: 5.8, size: 4.46 },
          { action: 'bet75', label: 'Donk 75%', frequency: 25, ev: 6.0, size: 10.13 },
        ],
        bestAction: 'check',
        logicTags: ['NUT_ADVANTAGE', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'AKs on K-high board is a premium hand we want to check-raise with. By checking, we let BTN c-bet, then we can raise for value against their entire continuation range.',
      },
    },
    {
      id: '3bet-3',
      board: { flop: ['Ks', 'Jh', '7d'], turn: null, river: null },
      heroHand: ['Th', 'Td'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 13.5, effectiveStack: 87, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 100, ev: 3.2 },
          { action: 'bet33', label: 'Donk 33%', frequency: 0, ev: 2.1, size: 4.46 },
          { action: 'bet75', label: 'Donk 75%', frequency: 0, ev: 1.5, size: 10.13 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'TT on KJ7 is an underpair in a 3-bet pot. Pure check — we\'re a bluff catcher. Donking would be lighting money on fire against a range full of Kx and Jx.',
      },
    },
    {
      id: '3bet-4',
      board: { flop: ['Ks', 'Jh', '7d'], turn: null, river: null },
      heroHand: ['Ac', 'Qc'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 13.5, effectiveStack: 87, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 2.5 },
          { action: 'bet33', label: 'Donk 33%', frequency: 25, ev: 2.3, size: 4.46 },
          { action: 'bet75', label: 'Donk 75%', frequency: 0, ev: 1.4, size: 10.13 },
        ],
        bestAction: 'check',
        logicTags: ['DRAW_HEAVY', 'BLUFF_CANDIDATE'],
        explanation: 'AQo has a gutshot (T makes a straight) and overcards. Check to pick off c-bets or check-raise as a semi-bluff. We have good equity but are behind most of villain\'s c-bet range.',
      },
    },
    // ── Board: 9c 6s 2h (low board, 3-bet pot) ──
    {
      id: '3bet-5',
      board: { flop: ['9c', '6s', '2h'], turn: null, river: null },
      heroHand: ['Ah', 'Kh'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 13.5, effectiveStack: 87, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 2.8 },
          { action: 'bet33', label: 'Donk 33%', frequency: 25, ev: 2.5, size: 4.46 },
          { action: 'bet75', label: 'Donk 75%', frequency: 0, ev: 1.8, size: 10.13 },
        ],
        bestAction: 'check',
        logicTags: ['RANGE_ADVANTAGE', 'EQUITY_DENIAL'],
        explanation: 'AK on a low board in a 3-bet pot — we actually have range advantage on low boards as caller. Check and let BTN c-bet, then decide. Our overcards have great equity.',
      },
    },
    {
      id: '3bet-6',
      board: { flop: ['9c', '6s', '2h'], turn: null, river: null },
      heroHand: ['9h', '9d'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 13.5, effectiveStack: 87, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 7.5 },
          { action: 'bet33', label: 'Donk 33%', frequency: 25, ev: 7.0, size: 4.46 },
          { action: 'bet75', label: 'Donk 75%', frequency: 25, ev: 7.2, size: 10.13 },
        ],
        bestAction: 'check',
        logicTags: ['NUT_ADVANTAGE', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'Top set on a dry board in a 3-bet pot. This is a monster. Check to induce BTN\'s c-bet then check-raise for maximum value. No need to rush — the pot is already big.',
      },
    },
    {
      id: '3bet-7',
      board: { flop: ['9c', '6s', '2h'], turn: null, river: null },
      heroHand: ['Jd', 'Js'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 13.5, effectiveStack: 87, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 5.0 },
          { action: 'bet33', label: 'Donk 33%', frequency: 25, ev: 4.6, size: 4.46 },
          { action: 'bet75', label: 'Donk 75%', frequency: 25, ev: 4.8, size: 10.13 },
        ],
        bestAction: 'check',
        logicTags: ['THIN_VALUE', 'POT_CONTROL'],
        explanation: 'JJ is an overpair on a low board. We\'re ahead of most of BTN\'s range but there are some traps (QQ+, sets). Check-call is the main line; some donk bets are fine for protection.',
      },
    },
  ],
  'cbet-monotone': [
    // ── Board: Th 7h 3h ──
    {
      id: 'mono-1',
      board: { flop: ['Th', '7h', '3h'], turn: null, river: null },
      heroHand: ['Ad', 'Ah'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 4.1 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 4.5, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 3.5, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'BOARD_COVERAGE'],
        explanation: 'AA with the Ah is extremely strong — overpair plus nut flush draw. On monotone boards, betting small is key. Our nut redraw makes this a strong bet.',
      },
    },
    {
      id: 'mono-2',
      board: { flop: ['Th', '7h', '3h'], turn: null, river: null },
      heroHand: ['Ks', 'Kc'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 2.0 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 1.8, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 0.9, size: 4.88 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL'],
        explanation: 'KK without a heart is in trouble on this board. BB has many flush combos. Check back to control the pot and see a safe turn card.',
      },
    },
    {
      id: 'mono-3',
      board: { flop: ['Th', '7h', '3h'], turn: null, river: null },
      heroHand: ['Kh', 'Qd'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 1.8 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 2.2, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 1.2, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['DRAW_HEAVY', 'BLOCKER_EFFECT'],
        explanation: 'Kh gives us the second nut flush draw. Betting small with one heart builds the pot for when we hit and also folds out hands that have us beat without a heart.',
      },
    },
    {
      id: 'mono-4',
      board: { flop: ['Th', '7h', '3h'], turn: null, river: null },
      heroHand: ['As', 'Kc'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 0.4 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 0.3, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: -0.5, size: 4.88 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'AK with no heart is basically air on this monotone board. We have zero equity against flushes and limited equity overall. Check back and give up most of the time.',
      },
    },
    // ── Board: Qs 8s 5s (spade monotone) ──
    {
      id: 'mono-5',
      board: { flop: ['Qs', '8s', '5s'], turn: null, river: null },
      heroHand: ['As', 'Kd'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 2.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 3.0, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 2.0, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'DRAW_HEAVY'],
        explanation: 'As gives us the nut flush draw with AK high. Bet small to build the pot and deny equity from non-spade hands. We have the best draw possible.',
      },
    },
    {
      id: 'mono-6',
      board: { flop: ['Qs', '8s', '5s'], turn: null, river: null },
      heroHand: ['Jh', 'Jd'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 100, ev: 0.8 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: 0.3, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: -0.5, size: 4.88 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'JJ with no spade is in terrible shape. Below top pair and no flush draw. Pure check — we have no value targets that call and every spade kills our hand.',
      },
    },
    {
      id: 'mono-7',
      board: { flop: ['Qs', '8s', '5s'], turn: null, river: null },
      heroHand: ['Ks', 'Ts'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 6.5, effectiveStack: 97, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 4.8 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 5.2, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 4.9, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'We flopped a flush! Bet small for thin value — we want calls from bare spades, pairs, and straight draws. Don\'t overbet and fold out everything.',
      },
    },
  ],
  'sb-defense': [
    // ── Board: Qd 9s 4c ──
    {
      id: 'sb-1',
      board: { flop: ['Qd', '9s', '4c'], turn: null, river: null },
      heroHand: ['As', 'Js'],
      heroPosition: 'SB', villainPosition: 'BTN',
      potSize: 7, effectiveStack: 96.5, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 1.0 },
          { action: 'bet33', label: 'Donk 33%', frequency: 25, ev: 1.2, size: 2.31 },
          { action: 'bet75', label: 'Donk 75%', frequency: 0, ev: 0.5, size: 5.25 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'EQUITY_DENIAL'],
        explanation: 'AJs missed this flop but retains good equity with two overcards and a backdoor flush draw. Checking is standard OOP.',
      },
    },
    {
      id: 'sb-2',
      board: { flop: ['Qd', '9s', '4c'], turn: null, river: null },
      heroHand: ['Qh', 'Th'],
      heroPosition: 'SB', villainPosition: 'BTN',
      potSize: 7, effectiveStack: 96.5, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 3.2 },
          { action: 'bet33', label: 'Donk 33%', frequency: 0, ev: 2.8, size: 2.31 },
          { action: 'bet75', label: 'Donk 75%', frequency: 25, ev: 3.0, size: 5.25 },
        ],
        bestAction: 'check',
        logicTags: ['CHECK_RAISE_CANDIDATE', 'THIN_VALUE'],
        explanation: 'Top pair decent kicker is a strong check-call or check-raise hand OOP. Let BTN c-bet then trap.',
      },
    },
    {
      id: 'sb-3',
      board: { flop: ['Qd', '9s', '4c'], turn: null, river: null },
      heroHand: ['6h', '6d'],
      heroPosition: 'SB', villainPosition: 'BTN',
      potSize: 7, effectiveStack: 96.5, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 100, ev: -0.2 },
          { action: 'bet33', label: 'Donk 33%', frequency: 0, ev: -0.8, size: 2.31 },
          { action: 'bet75', label: 'Donk 75%', frequency: 0, ev: -1.5, size: 5.25 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'Small pocket pair on Q-high board OOP — pure check-fold in most cases. We\'re behind virtually everything that continues. Don\'t waste chips.',
      },
    },
    {
      id: 'sb-4',
      board: { flop: ['Qd', '9s', '4c'], turn: null, river: null },
      heroHand: ['9d', '8d'],
      heroPosition: 'SB', villainPosition: 'BTN',
      potSize: 7, effectiveStack: 96.5, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 2.0 },
          { action: 'bet33', label: 'Donk 33%', frequency: 25, ev: 1.8, size: 2.31 },
          { action: 'bet75', label: 'Donk 75%', frequency: 0, ev: 1.2, size: 5.25 },
        ],
        bestAction: 'check',
        logicTags: ['THIN_VALUE', 'POT_CONTROL'],
        explanation: 'Second pair with a backdoor flush draw. Check-call is the main line. We have showdown value but can\'t handle heavy action. Some donk bets can be mixed in for balance.',
      },
    },
    // ── Board: 7h 5d 3s (low board SB defense) ──
    {
      id: 'sb-5',
      board: { flop: ['7h', '5d', '3s'], turn: null, river: null },
      heroHand: ['8s', '8c'],
      heroPosition: 'SB', villainPosition: 'BTN',
      potSize: 7, effectiveStack: 96.5, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 2.8 },
          { action: 'bet33', label: 'Donk 33%', frequency: 25, ev: 2.6, size: 2.31 },
          { action: 'bet75', label: 'Donk 75%', frequency: 25, ev: 2.5, size: 5.25 },
        ],
        bestAction: 'check',
        logicTags: ['RANGE_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'Overpair on a low board where SB actually has range advantage. Check to induce a c-bet from BTN\'s overcards, then check-raise for value.',
      },
    },
    {
      id: 'sb-6',
      board: { flop: ['7h', '5d', '3s'], turn: null, river: null },
      heroHand: ['6s', '4s'],
      heroPosition: 'SB', villainPosition: 'BTN',
      potSize: 7, effectiveStack: 96.5, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 4.5 },
          { action: 'bet33', label: 'Donk 33%', frequency: 25, ev: 4.2, size: 2.31 },
          { action: 'bet75', label: 'Donk 75%', frequency: 50, ev: 4.8, size: 5.25 },
        ],
        bestAction: 'bet75',
        logicTags: ['NUT_ADVANTAGE', 'BOARD_COVERAGE'],
        explanation: 'Flopped the nut straight! On a low board from SB, we can donk bet large for value. BTN will call with overpairs, two pairs, and draws. Maximize value now — the board can pair.',
      },
    },
  ],
  'turn-barrels': [
    // ── Board: As 8h 3c → Kd (BTN c-bet flop, now turn) ──
    {
      id: 'turn-1',
      board: { flop: ['As', '8h', '3c'], turn: 'Kd', river: null },
      heroHand: ['Ah', 'Qd'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 10.8, effectiveStack: 94.85, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 4.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 4.8, size: 3.56 },
          { action: 'bet75', label: 'Bet 75%', frequency: 50, ev: 5.2, size: 8.1 },
        ],
        bestAction: 'bet75',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'AQ on AK3 board with K turn — we now have top two pair. Larger sizing gets value from single-pair hands, Kx and flush draws. This is a clear value barrel.',
      },
    },
    {
      id: 'turn-2',
      board: { flop: ['As', '8h', '3c'], turn: 'Kd', river: null },
      heroHand: ['Jh', 'Th'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 10.8, effectiveStack: 94.85, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: -0.2 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 0.0, size: 3.56 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: -0.8, size: 8.1 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'BLUFF_CANDIDATE'],
        explanation: 'JTo with a gutshot — the K turn is bad for our bluffs as BB now has more Kx. Give up most of the time. Small bet occasionally with the straight draw is fine.',
      },
    },
    {
      id: 'turn-3',
      board: { flop: ['As', '8h', '3c'], turn: '5s', river: null },
      heroHand: ['Ks', 'Qs'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 10.8, effectiveStack: 94.85, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 1.0 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 1.2, size: 3.56 },
          { action: 'bet75', label: 'Bet 75%', frequency: 50, ev: 1.5, size: 8.1 },
        ],
        bestAction: 'bet75',
        logicTags: ['DRAW_HEAVY', 'BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
        explanation: 'Picked up a flush draw on the turn! KQs is now a powerful semi-bluff — we have the second nut flush draw plus two overcards. Barrel big for fold equity + equity when called.',
      },
    },
    {
      id: 'turn-4',
      board: { flop: ['Jh', 'Ts', '4d'], turn: '2c', river: null },
      heroHand: ['Ah', 'Jd'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 15.8, effectiveStack: 89.12, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 4.0 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 4.5, size: 5.21 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 4.2, size: 11.85 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'BOARD_COVERAGE'],
        explanation: 'TPGK on a brick turn. Small bet continues to extract from draws and worse pairs. The deuce changed nothing — keep the pressure on with a thin value barrel.',
      },
    },
    {
      id: 'turn-5',
      board: { flop: ['Jh', 'Ts', '4d'], turn: 'Qc', river: null },
      heroHand: ['8s', '7s'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 15.8, effectiveStack: 89.12, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 0.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 0.6, size: 5.21 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 0.8, size: 11.85 },
        ],
        bestAction: 'bet75',
        logicTags: ['DRAW_HEAVY', 'BLUFF_CANDIDATE'],
        explanation: 'We turned an open-ended straight draw (9 makes the nuts). The Q is a scare card we can rep. Barrel big as a semi-bluff — huge equity when called and good fold equity.',
      },
    },
    {
      id: 'turn-6',
      board: { flop: ['Kd', '7s', '2h'], turn: '7d', river: null },
      heroHand: ['Ad', 'Kh'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 10.8, effectiveStack: 94.85, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 4.2 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 4.8, size: 3.56 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 4.5, size: 8.1 },
        ],
        bestAction: 'bet33',
        logicTags: ['BOARD_PAIR', 'THIN_VALUE'],
        explanation: 'Board paired the 7 — good for us. AK is now top pair on a paired board. BB\'s 7x just improved to trips but that\'s few combos. Bet small for value from underpairs and draws.',
      },
    },
    {
      id: 'turn-7',
      board: { flop: ['Kd', '7s', '2h'], turn: 'Ac', river: null },
      heroHand: ['Qc', 'Jc'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 10.8, effectiveStack: 94.85, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 0.3 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 0.5, size: 3.56 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 0.6, size: 8.1 },
        ],
        bestAction: 'bet75',
        logicTags: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
        explanation: 'Ace on the turn is a great barrel card — we can rep AK, AQ, AA. QJo blocks some of BB\'s calling combos (QT, JT). Big bet as a bluff is profitable here.',
      },
    },
  ],
  'river-bluffs': [
    // ── River decisions ──
    {
      id: 'river-1',
      board: { flop: ['Ks', 'Jh', '4d'], turn: 'Ts', river: '2c' },
      heroHand: ['As', 'Qs'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 28.5, effectiveStack: 72.75, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 1.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: 0.8, size: 9.41 },
          { action: 'bet75', label: 'Bet 75%', frequency: 75, ev: 2.8, size: 21.38 },
        ],
        bestAction: 'bet75',
        logicTags: ['BLOCKER_EFFECT', 'BLUFF_CANDIDATE'],
        explanation: 'AQs missed the flush but has the nut straight (Broadway). AQ makes the nuts on this runout! Bet big for value — BB will call with two pair, sets, and worse straights.',
      },
    },
    {
      id: 'river-2',
      board: { flop: ['Ks', 'Jh', '4d'], turn: 'Ts', river: '2c' },
      heroHand: ['9h', '8h'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 28.5, effectiveStack: 72.75, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: -0.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: -1.0, size: 9.41 },
          { action: 'bet75', label: 'Bet 75%', frequency: 50, ev: 0.2, size: 21.38 },
        ],
        bestAction: 'bet75',
        logicTags: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
        explanation: '98o has a straight draw that missed but 9 blocks T9 and Q9 straights. Large river bluff representing the straight or flush. We need ~40% folds to profit — achievable against capped range.',
      },
    },
    {
      id: 'river-3',
      board: { flop: ['Qs', '8d', '5h'], turn: '3c', river: 'As' },
      heroHand: ['Kh', 'Kd'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 22, effectiveStack: 78, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 3.0 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 3.2, size: 7.26 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 2.5, size: 16.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'BLOCK_BET'],
        explanation: 'KK on A river — we lost to Ax but still beat everything else. Small block bet targets Qx, JJ, TT. If raised, we can fold. This thin value bet is key to maximizing EV.',
      },
    },
    {
      id: 'river-4',
      board: { flop: ['Qs', '8d', '5h'], turn: '3c', river: 'As' },
      heroHand: ['7s', '6s'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 22, effectiveStack: 78, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: -0.8 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: -1.2, size: 7.26 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: -0.3, size: 16.5 },
        ],
        bestAction: 'check',
        logicTags: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
        explanation: '76s bricked everything. The A river is a potential bluff card but we don\'t block any of BB\'s calling range. Give up most of the time — save your chips for better spots.',
      },
    },
    {
      id: 'river-5',
      board: { flop: ['Td', '8d', '3s'], turn: '6d', river: 'Jc' },
      heroHand: ['Ad', '2d'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 35, effectiveStack: 65, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 0, ev: 5.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 6.5, size: 11.55 },
          { action: 'bet75', label: 'Bet 75%', frequency: 75, ev: 7.8, size: 26.25 },
        ],
        bestAction: 'bet75',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'We turned the nut flush. River J changes nothing for us. Bet large for value — BB will call with straights, sets, two pair, and worse flushes. This is a clear value bet.',
      },
    },
    {
      id: 'river-6',
      board: { flop: ['Td', '8d', '3s'], turn: '6d', river: 'Jc' },
      heroHand: ['Ks', 'Qd'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 35, effectiveStack: 65, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: -0.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: -1.0, size: 11.55 },
          { action: 'bet75', label: 'Bet 75%', frequency: 75, ev: 0.5, size: 26.25 },
        ],
        bestAction: 'bet75',
        logicTags: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
        explanation: 'KQo with Qd — we block the second nut flush! The J river also gives us a straight. Actually KQ makes a straight here (K-Q-J-T-9? No, Q-J-T-9-8? No). We have Q-high with a flush blocker. Big bluff — Qd blocks flushes, making it harder for BB to call.',
      },
    },
  ],
  'multiway-pots': [
    {
      id: 'multi-1',
      board: { flop: ['Kh', '9d', '4s'], turn: null, river: null },
      heroHand: ['Ah', 'Kd'],
      heroPosition: 'CO', villainPosition: 'BTN+BB',
      potSize: 10, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 3.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 4.0, size: 3.3 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 3.0, size: 7.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'TPTK in a multiway pot — still bet, but go small. With multiple opponents, someone is more likely to have connected. Small bet targets wide calling ranges while keeping the pot manageable.',
      },
    },
    {
      id: 'multi-2',
      board: { flop: ['Kh', '9d', '4s'], turn: null, river: null },
      heroHand: ['Qc', 'Jc'],
      heroPosition: 'CO', villainPosition: 'BTN+BB',
      potSize: 10, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 100, ev: 0.2 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: -0.3, size: 3.3 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: -1.0, size: 7.5 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'QJ in a multiway pot with K on board — pure check. Bluffing into multiple opponents is far less effective. Someone likely has a K or better. Wait for a better spot.',
      },
    },
    {
      id: 'multi-3',
      board: { flop: ['Kh', '9d', '4s'], turn: null, river: null },
      heroHand: ['9s', '9c'],
      heroPosition: 'CO', villainPosition: 'BTN+BB',
      potSize: 10, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 5.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 5.2, size: 3.3 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 5.0, size: 7.5 },
        ],
        bestAction: 'check',
        logicTags: ['CHECK_RAISE_CANDIDATE', 'NUT_ADVANTAGE'],
        explanation: 'Middle set in a multiway pot — slowplay for a street. Let others catch up or bet into us. With 2 opponents, there\'s a higher chance someone will stab. Check-raise is devastating.',
      },
    },
    {
      id: 'multi-4',
      board: { flop: ['7c', '6c', '2d'], turn: null, river: null },
      heroHand: ['Ac', 'Kc'],
      heroPosition: 'CO', villainPosition: 'BTN+BB',
      potSize: 10, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 1.8 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 2.0, size: 3.3 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 1.2, size: 7.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['DRAW_HEAVY', 'NUT_ADVANTAGE'],
        explanation: 'Nut flush draw on a wet low board in multiway. We can bet small to build the pot for when we hit, or check to see a free card. Both are fine — our draw is to the nuts.',
      },
    },
    {
      id: 'multi-5',
      board: { flop: ['7c', '6c', '2d'], turn: null, river: null },
      heroHand: ['Ah', 'As'],
      heroPosition: 'CO', villainPosition: 'BTN+BB',
      potSize: 10, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 0, ev: 3.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 3.8, size: 3.3 },
          { action: 'bet75', label: 'Bet 75%', frequency: 75, ev: 4.2, size: 7.5 },
        ],
        bestAction: 'bet75',
        logicTags: ['EQUITY_DENIAL', 'NUT_ADVANTAGE'],
        explanation: 'AA on a wet low board multiway — bet BIG. Tons of draws and hands with equity against us. We need to charge draws from two opponents. Don\'t slow play — protect your hand.',
      },
    },
  ],
  'squeeze-spots': [
    {
      id: 'squeeze-1',
      board: { flop: ['Ah', '9c', '5d'], turn: null, river: null },
      heroHand: ['Ad', 'Jd'],
      heroPosition: 'BB', villainPosition: 'CO+BTN',
      potSize: 18, effectiveStack: 82, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 4.2 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 4.5, size: 5.94 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 3.8, size: 13.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'RANGE_ADVANTAGE'],
        explanation: 'We squeezed pre and hit top pair. In a 3-bet pot, we have range advantage. Small c-bet extracts value while keeping in worse Ax and pocket pairs. Strong hand in a strong spot.',
      },
    },
    {
      id: 'squeeze-2',
      board: { flop: ['Ah', '9c', '5d'], turn: null, river: null },
      heroHand: ['Kd', 'Kc'],
      heroPosition: 'BB', villainPosition: 'CO+BTN',
      potSize: 18, effectiveStack: 82, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 3.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 3.2, size: 5.94 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 2.5, size: 13.5 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'KK on A-high board after squeezing — tricky spot. Check and evaluate. If both opponents check, we likely have the best hand. If someone bets, we can call or raise based on sizing.',
      },
    },
    {
      id: 'squeeze-3',
      board: { flop: ['Ah', '9c', '5d'], turn: null, river: null },
      heroHand: ['Qh', 'Qs'],
      heroPosition: 'BB', villainPosition: 'CO+BTN',
      potSize: 18, effectiveStack: 82, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 2.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 2.2, size: 5.94 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 1.5, size: 13.5 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'QQ facing an A on board in a 3-bet pot. We\'re behind all Ax. Check and play cautiously. This is more of a bluff-catcher now — don\'t invest too much.',
      },
    },
    {
      id: 'squeeze-4',
      board: { flop: ['7d', '6h', '3c'], turn: null, river: null },
      heroHand: ['As', 'Ah'],
      heroPosition: 'BB', villainPosition: 'CO+BTN',
      potSize: 18, effectiveStack: 82, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 5.5 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 5.8, size: 5.94 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 5.5, size: 13.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'EQUITY_DENIAL'],
        explanation: 'AA on a low wet board in a squeeze pot. Bet to protect — lots of straight draws and connected hands in opponents\' ranges. Don\'t let them see free cards.',
      },
    },
    {
      id: 'squeeze-5',
      board: { flop: ['7d', '6h', '3c'], turn: null, river: null },
      heroHand: ['Jd', 'Td'],
      heroPosition: 'BB', villainPosition: 'CO+BTN',
      potSize: 18, effectiveStack: 82, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 0.8 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 1.0, size: 5.94 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 0.2, size: 13.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['BOARD_COVERAGE', 'BLUFF_CANDIDATE'],
        explanation: 'JTd whiffed but we can c-bet as a bluff. In squeeze pots we should c-bet wide since opponents have capped ranges. Small sizing puts pressure on their medium-strength hands.',
      },
    },
  ],

  // ── Facing flop c-bet (BB defends vs BTN open + c-bet) ──
  'facing-flop-cbet': [
    {
      id: 'fc-1', difficulty: 'medium',
      board: { flop: ['Kh', '8c', '3d'], turn: null, river: null },
      heroHand: ['As', '5s'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 7.5, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 25, ev: 0.00 },
          { action: 'call',  frequency: 65, ev: 0.45, size: 2.5 },
          { action: 'raise', frequency: 10, ev: 0.10, size: 8.5 },
        ],
        bestAction: 'call',
        logicTags: ['POT_CONTROL'],
        explanation: 'A5s on K83 rainbow has overcard plus backdoor flush/straight equity vs a small c-bet. Calling realizes our equity cheaply. Folding is a small leak; raising is too thin without made-hand equity.',
      },
    },
    {
      id: 'fc-2', difficulty: 'easy',
      board: { flop: ['Kh', '8c', '3d'], turn: null, river: null },
      heroHand: ['7d', '2c'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 7.5, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 100, ev: 0.00 },
          { action: 'call',  frequency: 0,   ev: -1.20, size: 2.5 },
          { action: 'raise', frequency: 0,   ev: -2.30, size: 8.5 },
        ],
        bestAction: 'fold',
        logicTags: ['RANGE_DISADVANTAGE'],
        explanation: '72o has essentially no equity vs BTN c-betting range on K-high. Pure fold — calling burns chips, raising punts.',
      },
    },
    {
      id: 'fc-3', difficulty: 'medium',
      board: { flop: ['9h', '8h', '4c'], turn: null, river: null },
      heroHand: ['Td', '9d'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 7.5, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,  ev: 0.00 },
          { action: 'call',  frequency: 50, ev: 1.80, size: 2.5 },
          { action: 'raise', frequency: 50, ev: 1.85, size: 8.5 },
        ],
        bestAction: 'raise',
        logicTags: ['CHECK_RAISE_CANDIDATE', 'EQUITY_DENIAL'],
        explanation: 'Top pair + open-ended straight draw on a wet board. Check-raising is great for protection and to deny equity from overcards. Calling is fine too but raising is slightly better.',
      },
    },
    {
      id: 'fc-4', difficulty: 'hard',
      board: { flop: ['Js', 'Ts', '5d'], turn: null, river: null },
      heroHand: ['Qd', 'Jd'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 7.5, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,  ev: 0.00 },
          { action: 'call',  frequency: 70, ev: 2.40, size: 2.5 },
          { action: 'raise', frequency: 30, ev: 2.20, size: 8.5 },
        ],
        bestAction: 'call',
        logicTags: ['POT_CONTROL', 'BLOCKER_EFFECT'],
        explanation: 'Top pair good kicker on a coordinated board. Mostly call — we don\'t want to bloat the pot OOP with one pair when villain can have JT, sets, and combo draws.',
      },
    },
    {
      id: 'fc-5', difficulty: 'medium',
      board: { flop: ['Ad', '7h', '2c'], turn: null, river: null },
      heroHand: ['9c', '9d'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 7.5, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 35, ev: 0.00 },
          { action: 'call',  frequency: 60, ev: 0.20, size: 2.5 },
          { action: 'raise', frequency: 5,  ev: -0.30, size: 8.5 },
        ],
        bestAction: 'call',
        logicTags: ['POT_CONTROL'],
        explanation: '99 on A-high faces a tough spot. Mostly call against a small c-bet — folding too often invites exploitation. Raising is bad: villain\'s value range crushes us.',
      },
    },
    {
      id: 'fc-6', difficulty: 'hard',
      board: { flop: ['Qc', 'Qh', '6d'], turn: null, river: null },
      heroHand: ['Ah', 'Ts'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 7.5, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 40, ev: 0.00 },
          { action: 'call',  frequency: 60, ev: 0.05, size: 2.5 },
          { action: 'raise', frequency: 0,  ev: -1.20, size: 8.5 },
        ],
        bestAction: 'call',
        logicTags: ['BOARD_PAIR', 'POT_CONTROL'],
        explanation: 'Paired boards reduce value combos. AT high with backdoors has just enough to defend a small bet — mostly call/fold, never raise.',
      },
    },
    {
      id: 'fc-7', difficulty: 'medium',
      board: { flop: ['8s', '7s', '2h'], turn: null, river: null },
      heroHand: ['9s', '9c'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 7.5, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,  ev: 0.00 },
          { action: 'call',  frequency: 40, ev: 1.55, size: 2.5 },
          { action: 'raise', frequency: 60, ev: 1.70, size: 8.5 },
        ],
        bestAction: 'raise',
        logicTags: ['EQUITY_DENIAL', 'CHECK_RAISE_CANDIDATE', 'DRAW_HEAVY'],
        explanation: 'Overpair on a wet draw-heavy board. Raise for protection and value vs draws. Calling lets too many turns kill our equity.',
      },
    },
    {
      id: 'fc-8', difficulty: 'medium',
      board: { flop: ['Kd', 'Qc', '4h'], turn: null, river: null },
      heroHand: ['Jh', 'Th'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 7.5, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,  ev: 0.00 },
          { action: 'call',  frequency: 75, ev: 1.10, size: 2.5 },
          { action: 'raise', frequency: 25, ev: 0.90, size: 8.5 },
        ],
        bestAction: 'call',
        logicTags: ['DRAW_HEAVY', 'POT_CONTROL'],
        explanation: 'Open-ender + backdoor flush. Strong call, mixed raise. Don\'t fold a hand this strong vs a small c-bet.',
      },
    },
    {
      id: 'fc-9', difficulty: 'hard',
      board: { flop: ['Ts', '6c', '2d'], turn: null, river: null },
      heroHand: ['Ad', 'Qh'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 7.5, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 55, ev: 0.00 },
          { action: 'call',  frequency: 45, ev: -0.10, size: 2.5 },
          { action: 'raise', frequency: 0,  ev: -1.50, size: 8.5 },
        ],
        bestAction: 'fold',
        logicTags: ['POT_CONTROL'],
        explanation: 'AQ overcards on T62 is mostly a fold to a 33% bet — too little equity to peel profitably. Calling is close. Raising bluff is bad with no equity backing.',
      },
    },
    {
      id: 'fc-10', difficulty: 'hard',
      board: { flop: ['8h', '5h', '5c'], turn: null, river: null },
      heroHand: ['7h', '6h'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 7.5, effectiveStack: 95, street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,  ev: 0.00 },
          { action: 'call',  frequency: 35, ev: 1.95, size: 2.5 },
          { action: 'raise', frequency: 65, ev: 2.15, size: 8.5 },
        ],
        bestAction: 'raise',
        logicTags: ['BOARD_PAIR', 'DRAW_HEAVY', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'Flush draw + open-ender on a paired board. Massive equity — semi-bluff raise to maximize fold equity while having a great drawing hand.',
      },
    },
  ],

  // ── Facing turn barrels (hero called flop, faces turn bet) ──
  'facing-turn-bet': [
    {
      id: 'ft-1', difficulty: 'medium',
      board: { flop: ['Ks', '8c', '3d'], turn: '5h', river: null },
      heroHand: ['Qc', 'Jc'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 12.0, effectiveStack: 92, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 60, ev: 0.00 },
          { action: 'call',  frequency: 40, ev: -0.20, size: 7.5 },
          { action: 'raise', frequency: 0,  ev: -2.10, size: 24.0 },
        ],
        bestAction: 'fold',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'No equity improvement on the turn brick. Fold most of the time vs a second barrel — peeling burns chips.',
      },
    },
    {
      id: 'ft-2', difficulty: 'medium',
      board: { flop: ['Js', 'Ts', '4d'], turn: '2s', river: null },
      heroHand: ['Ah', 'Js'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 12.0, effectiveStack: 92, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,  ev: 0.00 },
          { action: 'call',  frequency: 80, ev: 3.10, size: 7.5 },
          { action: 'raise', frequency: 20, ev: 2.80, size: 24.0 },
        ],
        bestAction: 'call',
        logicTags: ['BLOCKER_EFFECT', 'POT_CONTROL'],
        explanation: 'Top pair + nut flush blocker. Strong call — raising bloats vs value-heavy ranges. The Ah blocks villain\'s strongest bluffs and value.',
      },
    },
    {
      id: 'ft-3', difficulty: 'hard',
      board: { flop: ['9h', '7h', '2c'], turn: 'Kd', river: null },
      heroHand: ['Tc', '9c'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 12.0, effectiveStack: 92, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 70, ev: 0.00 },
          { action: 'call',  frequency: 30, ev: -0.35, size: 7.5 },
          { action: 'raise', frequency: 0,  ev: -3.00, size: 24.0 },
        ],
        bestAction: 'fold',
        logicTags: ['RANGE_DISADVANTAGE'],
        explanation: 'Middle pair on a turn that hits villain\'s range hard. The K overcard is bad news — mostly fold.',
      },
    },
    {
      id: 'ft-4', difficulty: 'hard',
      board: { flop: ['Ad', 'Td', '6c'], turn: '3d', river: null },
      heroHand: ['Kd', 'Qs'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 12.0, effectiveStack: 92, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,  ev: 0.00 },
          { action: 'call',  frequency: 65, ev: 2.50, size: 7.5 },
          { action: 'raise', frequency: 35, ev: 2.40, size: 24.0 },
        ],
        bestAction: 'call',
        logicTags: ['DRAW_HEAVY', 'BLOCKER_EFFECT'],
        explanation: 'Nut flush draw + gutshot + overcard. Call with high frequency. Raise some as semi-bluff with the Kd nut blocker.',
      },
    },
    {
      id: 'ft-5', difficulty: 'medium',
      board: { flop: ['8c', '8h', '4d'], turn: 'Jh', river: null },
      heroHand: ['Ts', 'Td'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 12.0, effectiveStack: 92, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 25, ev: 0.00 },
          { action: 'call',  frequency: 70, ev: 0.55, size: 7.5 },
          { action: 'raise', frequency: 5,  ev: -0.20, size: 24.0 },
        ],
        bestAction: 'call',
        logicTags: ['POT_CONTROL', 'BOARD_PAIR'],
        explanation: 'Overpair on a paired board with a turn overcard. Call to keep bluffs in. Raising blows out everything we beat.',
      },
    },
    {
      id: 'ft-6', difficulty: 'hard',
      board: { flop: ['Qh', '9h', '5c'], turn: '2h', river: null },
      heroHand: ['Ah', '7h'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 12.0, effectiveStack: 92, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,  ev: 0.00 },
          { action: 'call',  frequency: 25, ev: 5.10, size: 7.5 },
          { action: 'raise', frequency: 75, ev: 5.50, size: 24.0 },
        ],
        bestAction: 'raise',
        logicTags: ['BLOCKER_EFFECT', 'EQUITY_DENIAL'],
        explanation: 'Nut flush. Raise for value — straightforward bet vs likely sets, two pair, and worse flushes. Slow-playing leaves money on the table.',
      },
    },
    {
      id: 'ft-7', difficulty: 'medium',
      board: { flop: ['Kc', '7c', '3h'], turn: 'Qd', river: null },
      heroHand: ['Ad', 'Tc'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 12.0, effectiveStack: 92, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 80, ev: 0.00 },
          { action: 'call',  frequency: 20, ev: -0.45, size: 7.5 },
          { action: 'raise', frequency: 0,  ev: -2.50, size: 24.0 },
        ],
        bestAction: 'fold',
        logicTags: ['RANGE_DISADVANTAGE'],
        explanation: 'ATo with backdoor club draw faces a tough double-barrel on a two-high-card board. Fold most of the time — equity is too thin.',
      },
    },
    {
      id: 'ft-8', difficulty: 'medium',
      board: { flop: ['6h', '5d', '2c'], turn: '7s', river: null },
      heroHand: ['8c', '7c'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 12.0, effectiveStack: 92, street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,  ev: 0.00 },
          { action: 'call',  frequency: 40, ev: 2.95, size: 7.5 },
          { action: 'raise', frequency: 60, ev: 3.10, size: 24.0 },
        ],
        bestAction: 'raise',
        logicTags: ['NUT_ADVANTAGE', 'EQUITY_DENIAL'],
        explanation: 'Open-ended straight draw + pair on a connected board. Raise to deny equity from overpairs and protect vs villain\'s wide range.',
      },
    },
  ],

  // ── River decisions: jam-or-fold, big-bet defense ──
  'river-decision': [
    {
      id: 'rd-1', difficulty: 'medium',
      board: { flop: ['Ks', '9c', '4d'], turn: '3h', river: '2s' },
      heroHand: ['Ah', 'Ks'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 40.0, effectiveStack: 70, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'fold', frequency: 0,  ev: 0.00 },
          { action: 'call', frequency: 95, ev: 12.0, size: 28.0 },
          { action: 'raise',frequency: 5,  ev: 4.0,  size: 70.0 },
        ],
        bestAction: 'call',
        logicTags: ['BLOCKER_EFFECT', 'THIN_VALUE'],
        explanation: 'Top pair top kicker is rarely beaten on this brick runout. Call vs polarized river bet. Raising turns our hand into a bluff and gets called only by better.',
      },
    },
    {
      id: 'rd-2', difficulty: 'hard',
      board: { flop: ['Jh', 'Th', '5c'], turn: '3d', river: '9h' },
      heroHand: ['Qc', 'Jc'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 40.0, effectiveStack: 70, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'fold', frequency: 70, ev: 0.00 },
          { action: 'call', frequency: 30, ev: -3.0, size: 28.0 },
          { action: 'raise',frequency: 0,  ev: -25.0,size: 70.0 },
        ],
        bestAction: 'fold',
        logicTags: ['RANGE_DISADVANTAGE'],
        explanation: 'Top pair on a runout where flushes and straights all got there. Fold most of the time vs a big river bet — too many value combos beat us.',
      },
    },
    {
      id: 'rd-3', difficulty: 'hard',
      board: { flop: ['As', 'Ts', '6h'], turn: '4c', river: '2s' },
      heroHand: ['Ks', 'Qs'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 40.0, effectiveStack: 70, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'fold', frequency: 0,  ev: 0.00 },
          { action: 'call', frequency: 100, ev: 24.0, size: 28.0 },
          { action: 'raise',frequency: 0,   ev: 18.0, size: 70.0 },
        ],
        bestAction: 'call',
        logicTags: ['THIN_VALUE'],
        explanation: 'King-high flush. Snap call vs river bet — only nut flush beats us and that\'s one combo. Raising for value is too thin; we get called by better.',
      },
    },
    {
      id: 'rd-4', difficulty: 'hard',
      board: { flop: ['9d', '7d', '2c'], turn: 'Kh', river: '5d' },
      heroHand: ['Ad', 'Qd'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 40.0, effectiveStack: 70, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 20, ev: 8.0 },
          { action: 'bet75', label: 'Bet Big', frequency: 50, ev: 14.0, size: 30.0 },
          { action: 'shove', frequency: 30, ev: 13.0, size: 70.0 },
        ],
        bestAction: 'bet75',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'Nut flush. Bet big or shove for value — villain has plenty of two pair, sets, and worse flushes that call.',
      },
    },
    {
      id: 'rd-5', difficulty: 'medium',
      board: { flop: ['Qh', '7c', '3s'], turn: '4d', river: '4h' },
      heroHand: ['As', 'Ks'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 40.0, effectiveStack: 70, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'fold', frequency: 55, ev: 0.00 },
          { action: 'call', frequency: 45, ev: -1.2, size: 28.0 },
          { action: 'raise',frequency: 0,  ev: -28.0,size: 70.0 },
        ],
        bestAction: 'fold',
        logicTags: ['BLOCKER_EFFECT', 'POT_CONTROL'],
        explanation: 'Ace high with no pair on a paired runout. Mostly fold; bluff-catch some with the A blocker. Never raise without a real hand.',
      },
    },
    {
      id: 'rd-6', difficulty: 'hard',
      board: { flop: ['8h', '6c', '2d'], turn: 'Jh', river: '7s' },
      heroHand: ['9c', '5c'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 40.0, effectiveStack: 70, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'fold', frequency: 0,  ev: 0.00 },
          { action: 'call', frequency: 5,  ev: 20.0,  size: 28.0 },
          { action: 'raise',frequency: 95, ev: 28.0, size: 70.0 },
        ],
        bestAction: 'raise',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'Straight on a non-threatening runout. Raise (jam) for value — villain calls with sets, two pair, and bluff-catches an overpair.',
      },
    },
    {
      id: 'rd-7', difficulty: 'medium',
      board: { flop: ['Jd', '8d', '5c'], turn: '2d', river: 'Th' },
      heroHand: ['9d', '9c'],
      heroPosition: 'BB', villainPosition: 'BTN',
      potSize: 40.0, effectiveStack: 70, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'fold', frequency: 85, ev: 0.00 },
          { action: 'call', frequency: 15, ev: -2.4, size: 28.0 },
          { action: 'raise',frequency: 0,  ev: -30.0,size: 70.0 },
        ],
        bestAction: 'fold',
        logicTags: ['POT_CONTROL'],
        explanation: 'Underpair on a runout that completed flushes and straights. Fold most of the time vs a big river bet.',
      },
    },
    {
      id: 'rd-8', difficulty: 'medium',
      board: { flop: ['Ks', 'Qd', '5h'], turn: '8c', river: '3c' },
      heroHand: ['Kd', 'Jh'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 40.0, effectiveStack: 70, street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 6.5 },
          { action: 'bet33', label: 'Bet',    frequency: 25, ev: 7.0,  size: 13.0 },
          { action: 'shove', frequency: 0,   ev: -8.0, size: 70.0 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'POT_CONTROL'],
        explanation: 'Top pair decent kicker — thin value bet for small. Shoving is suicide; check is fine too but small bet extracts from worse Kx and busted draws sometimes call.',
      },
    },
  ],

  // ── Short-stack shove or fold (preflop) ──
  'shove-or-fold': [
    {
      id: 'sh-1', difficulty: 'easy',
      board: { flop: null, turn: null, river: null },
      heroHand: ['As', 'Kh'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 1.5, effectiveStack: 12, street: 'preflop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,   ev: 0.00 },
          { action: 'shove', frequency: 100, ev: 4.50, size: 12.0 },
        ],
        bestAction: 'shove',
        logicTags: ['NUT_ADVANTAGE'],
        explanation: 'AK at 12bb on the button — pure shove. Folding here is a massive blunder.',
      },
    },
    {
      id: 'sh-2', difficulty: 'easy',
      board: { flop: null, turn: null, river: null },
      heroHand: ['9c', '4d'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 1.5, effectiveStack: 12, street: 'preflop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 100, ev: 0.00 },
          { action: 'shove', frequency: 0,   ev: -2.20, size: 12.0 },
        ],
        bestAction: 'fold',
        logicTags: ['POT_CONTROL'],
        explanation: '94o is below the shoving threshold even at 12bb on the button. Pure fold.',
      },
    },
    {
      id: 'sh-3', difficulty: 'medium',
      board: { flop: null, turn: null, river: null },
      heroHand: ['Ad', '5d'],
      heroPosition: 'SB', villainPosition: 'BB',
      potSize: 1.5, effectiveStack: 10, street: 'preflop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,   ev: 0.00 },
          { action: 'shove', frequency: 100, ev: 0.85, size: 10.0 },
        ],
        bestAction: 'shove',
        logicTags: ['BLOCKER_EFFECT'],
        explanation: 'A5s from SB at 10bb — easy shove. Strong A-blocker and decent equity when called.',
      },
    },
    {
      id: 'sh-4', difficulty: 'medium',
      board: { flop: null, turn: null, river: null },
      heroHand: ['7c', '6c'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 1.5, effectiveStack: 14, street: 'preflop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,   ev: 0.00 },
          { action: 'shove', frequency: 100, ev: 0.45, size: 14.0 },
        ],
        bestAction: 'shove',
        logicTags: ['POT_CONTROL'],
        explanation: '76s at 14bb on the button is a profitable shove — connected/suited equity carries it.',
      },
    },
    {
      id: 'sh-5', difficulty: 'hard',
      board: { flop: null, turn: null, river: null },
      heroHand: ['Kd', 'Tc'],
      heroPosition: 'SB', villainPosition: 'BB',
      potSize: 1.5, effectiveStack: 15, street: 'preflop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,   ev: 0.00 },
          { action: 'shove', frequency: 100, ev: 1.10, size: 15.0 },
        ],
        bestAction: 'shove',
        logicTags: ['BLOCKER_EFFECT'],
        explanation: 'KTo from SB at 15bb is a profitable shove. Folding is a real leak.',
      },
    },
    {
      id: 'sh-6', difficulty: 'hard',
      board: { flop: null, turn: null, river: null },
      heroHand: ['Qd', '9h'],
      heroPosition: 'CO', villainPosition: 'BB',
      potSize: 1.5, effectiveStack: 13, street: 'preflop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 30, ev: 0.00 },
          { action: 'shove', frequency: 70, ev: 0.15, size: 13.0 },
        ],
        bestAction: 'shove',
        logicTags: ['POT_CONTROL'],
        explanation: 'Q9o from CO at 13bb is a mixed shove — barely profitable. Folding is slightly worse but close.',
      },
    },
    {
      id: 'sh-7', difficulty: 'medium',
      board: { flop: null, turn: null, river: null },
      heroHand: ['Js', '8s'],
      heroPosition: 'HJ', villainPosition: 'BB',
      potSize: 1.5, effectiveStack: 11, street: 'preflop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 60, ev: 0.00 },
          { action: 'shove', frequency: 40, ev: -0.10, size: 11.0 },
        ],
        bestAction: 'fold',
        logicTags: ['POT_CONTROL'],
        explanation: 'J8s from HJ at 11bb is mostly a fold — too many players left to act. Shove some of the time as a mixed strategy.',
      },
    },
    {
      id: 'sh-8', difficulty: 'medium',
      board: { flop: null, turn: null, river: null },
      heroHand: ['7h', '7d'],
      heroPosition: 'BTN', villainPosition: 'BB',
      potSize: 1.5, effectiveStack: 18, street: 'preflop',
      gtoStrategy: {
        actions: [
          { action: 'fold',  frequency: 0,   ev: 0.00 },
          { action: 'shove', frequency: 100, ev: 1.65, size: 18.0 },
        ],
        bestAction: 'shove',
        logicTags: ['NUT_ADVANTAGE'],
        explanation: 'Pocket 7s at 18bb on the button is a pure shove. Min-raising can also work but shove is highest EV.',
      },
    },
  ],
};

// ── EV Loss Classification ──

export function classifyEVLoss(evLoss) {
  if (evLoss <= 0.05) return { label: 'Perfect', grade: 'perfect', color: '#22c55e' };
  if (evLoss <= 0.25) return { label: 'Acceptable', grade: 'acceptable', color: '#3b82f6' };
  if (evLoss <= 1.0) return { label: 'Inaccuracy', grade: 'inaccuracy', color: '#f59e0b' };
  return { label: 'Blunder', grade: 'blunder', color: '#ef4444' };
}

export function calculateEVLoss(gtoStrategy, chosenAction) {
  const bestEV = Math.max(...gtoStrategy.actions.map(a => a.ev));
  const chosenEV = gtoStrategy.actions.find(a => a.action === chosenAction)?.ev ?? 0;
  return Math.max(0, bestEV - chosenEV);
}

export function simplifyFrequency(freq) {
  return Math.round(freq / 25) * 25;
}

// ── Scoring System ──

export const SCORE_CONFIG = {
  perfect: { points: 100, xp: 25, label: 'Perfect!' },
  acceptable: { points: 75, xp: 15, label: 'Good' },
  inaccuracy: { points: 30, xp: 5, label: 'Inaccuracy' },
  blunder: { points: 0, xp: 0, label: 'Blunder' },
  streakBonus: 10,       // extra XP per consecutive correct answer
  maxStreakMultiplier: 5, // cap streak bonus at 5x
};

export const LEVELS = [
  { level: 1, title: 'Fish', xpRequired: 0, color: '#94a3b8' },
  { level: 2, title: 'Recreational', xpRequired: 100, color: '#22c55e' },
  { level: 3, title: 'Regular', xpRequired: 300, color: '#3b82f6' },
  { level: 4, title: 'Grinder', xpRequired: 600, color: '#a855f7' },
  { level: 5, title: 'Shark', xpRequired: 1000, color: '#f59e0b' },
  { level: 6, title: 'Crusher', xpRequired: 1500, color: '#ef4444' },
  { level: 7, title: 'Wizard', xpRequired: 2500, color: '#ec4899' },
  { level: 8, title: 'GTO Machine', xpRequired: 4000, color: '#fbbf24' },
];

export function getLevelForXP(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  const nextIdx = LEVELS.indexOf(current) + 1;
  const next = nextIdx < LEVELS.length ? LEVELS[nextIdx] : null;
  const progressToNext = next
    ? (xp - current.xpRequired) / (next.xpRequired - current.xpRequired)
    : 1;
  return { ...current, next, progressToNext, xp };
}

export const ACHIEVEMENTS = [
  { id: 'first_hand', name: 'First Steps', description: 'Complete your first hand', icon: 'play', check: (s) => s.totalHands >= 1 },
  { id: 'ten_hands', name: 'Getting Started', description: 'Complete 10 hands', icon: 'target', check: (s) => s.totalHands >= 10 },
  { id: 'fifty_hands', name: 'Dedicated Student', description: 'Complete 50 hands', icon: 'book-open', check: (s) => s.totalHands >= 50 },
  { id: 'hundred_hands', name: 'Century', description: 'Complete 100 hands', icon: 'award', check: (s) => s.totalHands >= 100 },
  { id: 'thousand_hands', name: 'Grinder', description: 'Complete 1,000 hands', icon: 'award', check: (s) => s.totalHands >= 1000 },
  { id: 'streak_3', name: 'Hot Streak', description: 'Get 3 correct in a row', icon: 'flame', check: (s) => s.bestStreak >= 3 },
  { id: 'streak_5', name: 'On Fire', description: 'Get 5 correct in a row', icon: 'flame', check: (s) => s.bestStreak >= 5 },
  { id: 'streak_10', name: 'Unstoppable', description: 'Get 10 correct in a row', icon: 'flame', check: (s) => s.bestStreak >= 10 },
  { id: 'streak_25', name: 'Locked In', description: 'Get 25 correct in a row', icon: 'flame', check: (s) => s.bestStreak >= 25 },
  { id: 'no_blunders_10', name: 'Careful Player', description: 'Play 10 hands without a blunder', icon: 'shield', check: (s) => s.handsWithoutBlunder >= 10 },
  { id: 'no_blunders_50', name: 'Disciplined', description: 'Play 50 hands without a blunder', icon: 'shield', check: (s) => s.handsWithoutBlunder >= 50 },
  { id: 'accuracy_80', name: 'Sharpshooter', description: 'Maintain 80%+ accuracy over 20 hands', icon: 'crosshair', check: (s) => s.totalHands >= 20 && (s.totalCorrect / s.totalHands) >= 0.8 },
  { id: 'exploiter', name: 'Exploiter', description: 'Win 5 hands in exploitative mode', icon: 'zap', check: (s) => s.exploitWins >= 5 },
  { id: 'daily_3', name: 'Habit Forming', description: 'Play 3 days in a row', icon: 'flame', check: (s) => (s.dailyStreak || 0) >= 3 },
  { id: 'daily_7', name: 'One Week Strong', description: 'Play 7 days in a row', icon: 'flame', check: (s) => (s.dailyStreak || 0) >= 7 },
  { id: 'avg_70', name: 'Solid Player', description: 'Reach a 70+ lifetime average', icon: 'star', check: (s) => (s.totalHands || 0) >= 25 && (s.lifetimeAvgScore || 0) >= 70 },
  { id: 'avg_85', name: 'Sharkish', description: 'Reach an 85+ lifetime average', icon: 'star', check: (s) => (s.totalHands || 0) >= 50 && (s.lifetimeAvgScore || 0) >= 85 },
];

// ── Endless-mode tunables ──

export const AVG_TIERS = [
  { min: 90, label: 'Crushing', color: '#fbbf24' },
  { min: 75, label: 'Sharkish', color: '#ec4899' },
  { min: 60, label: 'Solid',    color: '#22c55e' },
  { min: 40, label: 'Leaky',    color: '#f59e0b' },
  { min: 0,  label: 'Learning', color: '#94a3b8' },
];

export function getAvgTier(avg) {
  for (const tier of AVG_TIERS) if (avg >= tier.min) return tier;
  return AVG_TIERS[AVG_TIERS.length - 1];
}

export const DIFFICULTY_WEIGHTS = {
  easy:   (avg) => Math.max(0.4, 1.4 - Math.max(0, (avg - 40)) / 40),
  medium: () => 1.0,
  hard:   (avg) => 1.0 + Math.max(0, (avg - 55)) / 30,
};

export function pickScenarioWeighted(pool, recentIds, avgScore) {
  if (!pool.length) return null;
  const blockedSet = new Set(recentIds);
  // Don't block more than ~half the pool
  const blockLimit = Math.floor(pool.length / 2);
  const eligible = pool.filter((s, i) =>
    !blockedSet.has(s.id) || (blockedSet.size > blockLimit && i % 2 === 0)
  );
  const candidates = eligible.length ? eligible : pool;
  const eff = avgScore != null ? avgScore : 50;
  const weights = candidates.map(s => {
    const diff = s.difficulty || 'medium';
    const fn = DIFFICULTY_WEIGHTS[diff] || DIFFICULTY_WEIGHTS.medium;
    return Math.max(0.05, fn(eff));
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

// ── Exploitative Adjustments ──
// `appliesTo(strategy)` lets the UI hide exploits that have no meaningful effect
// on a given scenario (e.g. c-bet exploits on facing-bet hands).

export function exploitApplies(exploitId, strategy) {
  if (!strategy?.actions) return false;
  const keys = new Set(strategy.actions.map(a => a.action));
  if (exploitId === 'overFoldCbet')  return keys.has('bet33') || keys.has('check');
  if (exploitId === 'overCallRiver') return [...keys].some(k => k.startsWith('bet'));
  if (exploitId === 'neverThreeBet') return [...keys].some(k => k.startsWith('bet'));
  return true;
}

export const EXPLOITS = {
  overFoldCbet: {
    id: 'overFoldCbet',
    label: 'Opponent Over-folds to C-bets',
    description: 'Villain folds 70%+ to continuation bets (population avg ~55%)',
    adjust: (strategy) => ({
      ...strategy,
      actions: strategy.actions.map(a => {
        if (a.action === 'check') return { ...a, frequency: Math.max(0, a.frequency - 25), ev: a.ev - 0.3 };
        if (a.action === 'bet33') return { ...a, frequency: Math.min(100, a.frequency + 25), ev: a.ev + 0.4 };
        return a;
      }),
      explanation: strategy.explanation + ' EXPLOIT: Opponent folds too much — increase c-bet frequency with any two cards.',
      logicTags: [...strategy.logicTags, 'EQUITY_DENIAL'],
    }),
  },
  overCallRiver: {
    id: 'overCallRiver',
    label: 'Opponent Over-calls Rivers',
    description: 'Villain calls river bets too wide — stop bluffing, bet thin for value',
    adjust: (strategy) => ({
      ...strategy,
      actions: strategy.actions.map(a => {
        if (a.action === 'check') return { ...a, frequency: Math.min(100, a.frequency + 25), ev: a.ev + 0.2 };
        if (a.action.startsWith('bet')) return { ...a, frequency: Math.max(0, a.frequency - 15), ev: a.ev - 0.1 };
        return a;
      }),
      explanation: strategy.explanation + ' EXPLOIT: Opponent calls too much on rivers — tighten bluffing range, widen value range.',
    }),
  },
  neverThreeBet: {
    id: 'neverThreeBet',
    label: 'Opponent Never 3-Bets',
    description: 'Villain only 3-bets premiums — widen your opening and steal range',
    adjust: (strategy) => ({
      ...strategy,
      actions: strategy.actions.map(a => {
        if (a.action.startsWith('bet')) return { ...a, ev: a.ev + 0.3 };
        return a;
      }),
      explanation: strategy.explanation + ' EXPLOIT: Opponent 3-bets rarely — widen your open range and c-bet more aggressively.',
    }),
  },
};
