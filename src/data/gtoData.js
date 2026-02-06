// Mock GTO Solver Data
// Provides pre-computed strategy data for sample boards.
// Frequencies are "human-simplified" — rounded to nearest 25%.

export const POSITIONS = {
  BTN: 'Button',
  SB: 'Small Blind',
  BB: 'Big Blind',
  CO: 'Cutoff',
  HJ: 'Hijack',
  LJ: 'Lojack',
};

export const SUITS = { s: 'spade', h: 'heart', d: 'diamond', c: 'club' };

export const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };

export const SUIT_COLORS = {
  s: '#94a3b8',
  h: '#ef4444',
  d: '#3b82f6',
  c: '#22c55e',
};

export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// Parse a card string like "As" into { rank: 'A', suit: 's' }
export function parseCard(str) {
  return { rank: str[0], suit: str[1] };
}

// Drills available to the user
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
];

// Logic tags that explain solver reasoning
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
};

// ── Sample Scenarios ──
// Each scenario contains a board, hero hand, and the GTO-optimal actions with simplified frequencies.

export const SCENARIOS = {
  'srp-btn-vs-bb': [
    {
      id: 'srp-1',
      board: { flop: ['As', '8h', '3c'], turn: null, river: null },
      heroHand: ['Ah', 'Kd'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 6.5,
      effectiveStack: 97,
      street: 'flop',
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
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 6.5,
      effectiveStack: 97,
      street: 'flop',
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
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 6.5,
      effectiveStack: 97,
      street: 'flop',
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
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 6.5,
      effectiveStack: 97,
      street: 'flop',
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
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 6.5,
      effectiveStack: 97,
      street: 'flop',
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
  ],
  '3bet-oop-caller': [
    {
      id: '3bet-1',
      board: { flop: ['Ks', 'Jh', '7d'], turn: null, river: null },
      heroHand: ['Qh', 'Qd'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 13.5,
      effectiveStack: 87,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 4.8 },
          { action: 'bet33', label: 'Donk 33%', frequency: 0, ev: 3.9, size: 4.46 },
          { action: 'bet75', label: 'Donk 75%', frequency: 25, ev: 4.2, size: 10.13 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'QQ on K-high board is a check most of the time. We have an overpair but face many Kx combos in villain\'s range. Check-calling is the standard line, with some check-raises mixed in.',
      },
    },
    {
      id: '3bet-2',
      board: { flop: ['Ks', 'Jh', '7d'], turn: null, river: null },
      heroHand: ['As', 'Ks'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 13.5,
      effectiveStack: 87,
      street: 'flop',
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
  ],
  'cbet-monotone': [
    {
      id: 'mono-1',
      board: { flop: ['Th', '7h', '3h'], turn: null, river: null },
      heroHand: ['Ad', 'Ah'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 6.5,
      effectiveStack: 97,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 4.1 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 4.5, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 3.5, size: 4.88 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'BOARD_COVERAGE'],
        explanation: 'AA with the Ah is extremely strong — overpair plus nut flush draw. On monotone boards, betting small is key. BB has many flushes already; our nut redraw makes this a strong bet.',
      },
    },
    {
      id: 'mono-2',
      board: { flop: ['Th', '7h', '3h'], turn: null, river: null },
      heroHand: ['Ks', 'Kc'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 6.5,
      effectiveStack: 97,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 2.0 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 1.8, size: 2.15 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 0.9, size: 4.88 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL'],
        explanation: 'KK without a heart is in trouble on this board. BB has many flush combos. Check back to control the pot and see a safe turn card. We\'re basically playing a bluff-catcher.',
      },
    },
  ],
  'sb-defense': [
    {
      id: 'sb-1',
      board: { flop: ['Qd', '9s', '4c'], turn: null, river: null },
      heroHand: ['As', 'Js'],
      heroPosition: 'SB',
      villainPosition: 'BTN',
      potSize: 7,
      effectiveStack: 96.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 1.0 },
          { action: 'bet33', label: 'Donk 33%', frequency: 25, ev: 1.2, size: 2.31 },
          { action: 'bet75', label: 'Donk 75%', frequency: 0, ev: 0.5, size: 5.25 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'EQUITY_DENIAL'],
        explanation: 'AJs missed this flop but retains good equity with two overcards and a backdoor flush draw. Checking is standard OOP. Occasional small donk bets can be mixed in for balance.',
      },
    },
    {
      id: 'sb-2',
      board: { flop: ['Qd', '9s', '4c'], turn: null, river: null },
      heroHand: ['Qh', 'Th'],
      heroPosition: 'SB',
      villainPosition: 'BTN',
      potSize: 7,
      effectiveStack: 96.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 3.2 },
          { action: 'bet33', label: 'Donk 33%', frequency: 0, ev: 2.8, size: 2.31 },
          { action: 'bet75', label: 'Donk 75%', frequency: 25, ev: 3.0, size: 5.25 },
        ],
        bestAction: 'check',
        logicTags: ['CHECK_RAISE_CANDIDATE', 'THIN_VALUE'],
        explanation: 'Top pair decent kicker is a strong check-call or check-raise hand OOP. Let BTN c-bet then decide: call to trap or raise for value vs their wide c-bet range.',
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

// Calculate EV loss: difference between best EV and chosen action's EV
export function calculateEVLoss(gtoStrategy, chosenAction) {
  const bestEV = Math.max(...gtoStrategy.actions.map(a => a.ev));
  const chosenEV = gtoStrategy.actions.find(a => a.action === chosenAction)?.ev ?? 0;
  return Math.max(0, bestEV - chosenEV);
}

// Round frequency to nearest 25%
export function simplifyFrequency(freq) {
  return Math.round(freq / 25) * 25;
}

// ── Exploitative Adjustments ──

export const EXPLOITS = {
  overFoldCbet: {
    id: 'overFoldCbet',
    label: 'Opponent Over-folds to C-bets',
    description: 'Villain folds 70%+ to continuation bets (population avg ~55%)',
    adjust: (strategy) => {
      // Increase betting frequencies for bluffs
      return {
        ...strategy,
        actions: strategy.actions.map(a => {
          if (a.action === 'check') return { ...a, frequency: Math.max(0, a.frequency - 25), ev: a.ev - 0.3 };
          if (a.action === 'bet33') return { ...a, frequency: Math.min(100, a.frequency + 25), ev: a.ev + 0.4 };
          return a;
        }),
        explanation: strategy.explanation + ' EXPLOIT: Opponent folds too much — increase c-bet frequency with any two cards.',
        logicTags: [...strategy.logicTags, 'EQUITY_DENIAL'],
      };
    },
  },
  overCallRiver: {
    id: 'overCallRiver',
    label: 'Opponent Over-calls Rivers',
    description: 'Villain calls river bets too wide — stop bluffing, bet thin for value',
    adjust: (strategy) => {
      return {
        ...strategy,
        actions: strategy.actions.map(a => {
          if (a.action === 'check') return { ...a, frequency: Math.min(100, a.frequency + 25), ev: a.ev + 0.2 };
          if (a.action.startsWith('bet')) return { ...a, frequency: Math.max(0, a.frequency - 15), ev: a.ev - 0.1 };
          return a;
        }),
        explanation: strategy.explanation + ' EXPLOIT: Opponent calls too much on rivers — tighten bluffing range, widen value range.',
      };
    },
  },
  neverThreeBet: {
    id: 'neverThreeBet',
    label: 'Opponent Never 3-Bets',
    description: 'Villain only 3-bets premiums — widen your opening and steal range',
    adjust: (strategy) => {
      return {
        ...strategy,
        actions: strategy.actions.map(a => {
          if (a.action.startsWith('bet')) return { ...a, ev: a.ev + 0.3 };
          return a;
        }),
        explanation: strategy.explanation + ' EXPLOIT: Opponent 3-bets rarely — widen your open range and c-bet more aggressively.',
      };
    },
  },
};
