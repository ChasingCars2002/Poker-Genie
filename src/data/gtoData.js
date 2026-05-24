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
          { action: 'check',  frequency: 0,  ev: 3.1 },
          { action: 'bet33',  frequency: 75, ev: 3.8, size: 2.15 },
          { action: 'bet75',  frequency: 25, ev: 3.5, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: 3.2, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['RANGE_ADVANTAGE', 'NUT_ADVANTAGE'],
        explanation: 'AKo on A-high dry — you have top pair top kicker with massive range and nut advantage. Small c-bet is dominant: BB must continue wide with weaker Ax, pocket pairs, and backdoor draws that all fold to larger sizing. Betting 75%+ kills your own action by folding the exact hands that pay you off. Mix occasional checks to protect your range from being exploited.',
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
          { action: 'check',  frequency: 50, ev: 1.2 },
          { action: 'bet33',  frequency: 50, ev: 1.4, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: 0.8, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: 0.5, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['EQUITY_DENIAL', 'BOARD_COVERAGE'],
        explanation: 'KQo with backdoor equity is a classic mixed strategy hand. The small c-bet exploits BTN\'s range advantage: you fold out weaker underpairs and gutshots that have equity against you. But checking is also correct — you realize equity cheaply and can make better decisions on the turn. Going larger with only backdoor equity is an EV mistake; you want to build the pot only when your equity justifies the investment.',
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
          { action: 'check',  frequency: 75, ev: -0.3 },
          { action: 'bet33',  frequency: 25, ev: -0.1, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: -0.8, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: -1.2, size: 6.5 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'BLUFF_CANDIDATE'],
        explanation: '76s has a gutshot but completely misses A-high. Check back most of the time — your equity against BB\'s continuing range is minimal. The occasional small c-bet is a range balance move and can fold out weak holdings, but the hand itself cannot justify aggression. Larger bets compound a losing situation. When you do check back, you preserve 4 outs and can see a cheap turn.',
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
          { action: 'check',  frequency: 25, ev: 4.0 },
          { action: 'bet33',  frequency: 50, ev: 4.5, size: 2.15 },
          { action: 'bet75',  frequency: 25, ev: 4.3, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: 3.8, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'Two pair on a dry board — strong hand but you want calls, not folds. The small bet keeps BB\'s entire continuing range in: Ax hands, pocket pairs, and missed draws all call comfortably. Checking traps and is also correct since this board is so favorable you can afford deception. Larger sizing folds out exactly the thin value targets you want to extract from.',
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
          { action: 'check',  frequency: 50, ev: 0.4 },
          { action: 'bet33',  frequency: 50, ev: 0.6, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: -0.1, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: -0.5, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['EQUITY_DENIAL', 'BLUFF_CANDIDATE'],
        explanation: 'JTs with backdoor flush and straight draws is a good range-bet candidate. The small c-bet folds out hands with marginal equity against yours (low pairs, weak kickers) while your backdoor equity provides insurance when called. Checking is equally valid — you see a free turn with live overcards. This is a genuine 50/50 mixed strategy spot where either line is defensible.',
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
          { action: 'check',  frequency: 0,  ev: 4.2 },
          { action: 'bet33',  frequency: 75, ev: 4.8, size: 2.15 },
          { action: 'bet75',  frequency: 25, ev: 4.5, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: 4.0, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['RANGE_ADVANTAGE', 'NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'AK on K-high is essentially the nuts on this board. Small c-bet extracts maximum value by keeping BB\'s entire range in: Kx hands, pocket pairs, floats, and backdoor draws all call the 33% bet while folding to larger sizing. This is a pure value efficiency play — how much can you extract from every single hand in their range across three streets? The answer is: stack them slowly with small bets.',
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
          { action: 'check',  frequency: 50, ev: 0.8 },
          { action: 'bet33',  frequency: 50, ev: 1.0, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: 0.2, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: -0.1, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['EQUITY_DENIAL', 'BOARD_COVERAGE'],
        explanation: 'QJo has two overcards on K-high — a mixed strategy hand. Small c-bet exploits range advantage: BB has many weak hands that fold (A-low, small pairs, missed connectors). Checking is equally valid because your overcards have equity and you avoid building a pot where you have no current pair. Either line works; what matters is that you never size up — your hand can\'t handle the heat of large pots without top pair.',
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
          { action: 'check',  frequency: 50, ev: 2.1 },
          { action: 'bet33',  frequency: 50, ev: 2.3, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: 1.5, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: 1.0, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'EQUITY_DENIAL'],
        explanation: 'Pocket 9s are second pair with no real protection concerns on a dry board. Thin value betting small extracts from 8x, 7x, 6x, and missed overcards while keeping the pot manageable. Checking is also valid — you control the pot and avoid situations where BB check-raises your pair. Never bet large: you only get action from hands that beat you (Kx, sets) while folding everything you want to call.',
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
          { action: 'check',  frequency: 25, ev: 3.0 },
          { action: 'bet33',  frequency: 25, ev: 3.2, size: 2.15 },
          { action: 'bet75',  frequency: 50, ev: 3.5, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: 3.3, size: 6.5 },
        ],
        bestAction: 'bet75',
        logicTags: ['DRAW_HEAVY', 'THIN_VALUE'],
        explanation: 'TPGK on a connected board demands larger sizing to protect equity. BB\'s range has many draws: open-ended straights (K9, Q9, 87, 98), flush draws on two-tone boards, and combination draws. Small bets give these hands correct pot odds to continue; larger bets charge them real money. The EV difference between 33% and 75% on wet boards is significant — this is the spot where bet sizing most directly impacts your winrate.',
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
          { action: 'check',  frequency: 50, ev: 0.2 },
          { action: 'bet33',  frequency: 25, ev: 0.4, size: 2.15 },
          { action: 'bet75',  frequency: 25, ev: 0.3, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: -0.2, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['DRAW_HEAVY', 'BLUFF_CANDIDATE'],
        explanation: '87s with an open-ended straight draw is a powerful semi-bluff — 8 clean outs to the nuts. The choice between checking (free card) and semi-bluffing (fold equity + build pot) is genuinely close. Semi-bluffing small is preferred when the pot is relatively small and building it creates a larger payoff when you hit. Larger bets risk more chips than your current equity justifies. This is the core semi-bluff calculation: (fold equity + equity when called) vs (cost of bet).',
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
          { action: 'check',  frequency: 75, ev: -0.1 },
          { action: 'bet33',  frequency: 25, ev: 0.0, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: -0.6, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: -1.0, size: 6.5 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL'],
        explanation: 'Low pocket pair on a connected board is essentially a marginal showdown hand. You\'re below top pair on a board full of overcards and straight draws — there\'s no hand in BB\'s continuing range that you\'re confidently ahead of. Check back to see a safe turn; your set outs (2 cards) are your equity. If a 5 comes on the turn, you have a strong hand to bet. Until then, pot control is essential.',
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
          { action: 'check',  frequency: 0,  ev: 3.6 },
          { action: 'bet33',  frequency: 75, ev: 4.2, size: 2.15 },
          { action: 'bet75',  frequency: 25, ev: 3.9, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: 3.5, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['RANGE_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'AQ on Q-high dry is a premium hand that needs to extract value across all three streets. Small sizing maximizes total value: BB will call with all Qx, pocket pairs below Q, and backdoor draw hands. Going larger folds out the thin value targets while checking gives up a street of value against a hand you clearly have crushed. The dry board means no protection urgency — pure value efficiency is the only consideration.',
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
          { action: 'check',  frequency: 50, ev: 0.3 },
          { action: 'bet33',  frequency: 50, ev: 0.5, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: -0.2, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: -0.5, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['EQUITY_DENIAL', 'BLUFF_CANDIDATE'],
        explanation: 'T9s has two overcards, a backdoor flush draw, and a gutshot — real equity on a board where BTN has range dominance. Small c-bet folds out small pairs and weak Ax, denying them equity cheaply. Checking is equally valid since you have future card equity. The key principle: this hand wants to see cheap turns; small bets accomplish that while also having fold equity.',
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
          { action: 'check',  frequency: 75, ev: 4.8 },
          { action: 'bet33',  frequency: 0,  ev: 3.9, size: 4.46 },
          { action: 'bet75',  frequency: 25, ev: 4.2, size: 10.13 },
          { action: 'betPot', frequency: 0,  ev: 3.3, size: 13.5 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'QQ on K-high in a 3-bet pot — an overpair that may already be behind. BTN\'s 3-bet calling range has Kx at high frequency; check-calling is standard to realize equity cheaply. Any lead inflates the pot where you may already be a significant underdog. If BTN c-bets and you raise, you risk committing stacks with a second-best hand. Check, call one bet, reassess the turn.',
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
          { action: 'check',  frequency: 50, ev: 6.2 },
          { action: 'bet33',  frequency: 25, ev: 5.8, size: 4.46 },
          { action: 'bet75',  frequency: 25, ev: 6.0, size: 10.13 },
          { action: 'betPot', frequency: 0,  ev: 5.2, size: 13.5 },
        ],
        bestAction: 'check',
        logicTags: ['NUT_ADVANTAGE', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'AKs on K-high in a 3-bet pot — top pair with the nut kicker, excellent check-raise candidate. Checking allows BTN to c-bet their entire range, then your raise forces them to continue with second-best hands (QQ, JJ, QJ) or fold. This extracts significantly more value than leading, since BTN bets into you with a wider range than they call your donk with.',
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
          { action: 'check',  frequency: 100, ev: 3.2 },
          { action: 'bet33',  frequency: 0,   ev: 2.1, size: 4.46 },
          { action: 'bet75',  frequency: 0,   ev: 1.5, size: 10.13 },
          { action: 'betPot', frequency: 0,   ev: 0.8, size: 13.5 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'TT on KJ7 in a 3-bet pot is a pure bluff-catcher — check and pot-control or fold. BTN\'s 3-bet calling range contains KQ, KJ, AK, AJ, and all pairs above TT; you\'re behind significant portions of their range. Any lead inflates the pot with a hand that cannot comfortably call a raise. Check, see what BTN does, and make informed decisions. Your goal is damage control, not value extraction.',
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
          { action: 'check',  frequency: 75, ev: 2.5 },
          { action: 'bet33',  frequency: 25, ev: 2.3, size: 4.46 },
          { action: 'bet75',  frequency: 0,  ev: 1.4, size: 10.13 },
          { action: 'betPot', frequency: 0,  ev: 0.8, size: 13.5 },
        ],
        bestAction: 'check',
        logicTags: ['DRAW_HEAVY', 'BLUFF_CANDIDATE'],
        explanation: 'AQo has a backdoor nut flush draw, overcards, and a gutshot (T completes broadway). This hand has substantial equity when called — ~35% against top pair. Check-calling is the primary line, with occasional small leads to prevent BTN from always checking back. In a 3-bet pot, your nut equity (ace-high outs) justifies continuing. Aim for the check-raise semi-bluff if BTN c-bets.',
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
          { action: 'check',  frequency: 75, ev: 2.8 },
          { action: 'bet33',  frequency: 25, ev: 2.5, size: 4.46 },
          { action: 'bet75',  frequency: 0,  ev: 1.8, size: 10.13 },
          { action: 'betPot', frequency: 0,  ev: 1.2, size: 13.5 },
        ],
        bestAction: 'check',
        logicTags: ['RANGE_ADVANTAGE', 'EQUITY_DENIAL'],
        explanation: 'AK on a low board in a 3-bet pot — surprisingly, BB has range advantage on boards like this. Low boards favor the 3-bet caller\'s range which contains fewer pure air hands than BTN\'s position. Check to let BTN c-bet; if they fire, decide based on their sizing. Your two overcards have ~27% equity and the check-call keeps your range balanced with both strong hands and marginal holdings.',
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
          { action: 'check',  frequency: 50, ev: 7.5 },
          { action: 'bet33',  frequency: 25, ev: 7.0, size: 4.46 },
          { action: 'bet75',  frequency: 25, ev: 7.2, size: 10.13 },
          { action: 'betPot', frequency: 0,  ev: 6.8, size: 13.5 },
        ],
        bestAction: 'check',
        logicTags: ['NUT_ADVANTAGE', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'Top set in a 3-bet pot on a dry low board — a monster in a large pot. Check-raise is the primary line: BTN will c-bet frequently, and your raise forces them to commit stacks with hands like AA, KK, or QQ that are drawing nearly dead. The check-raise maximizes pot size from a position of near-certainty. Some leading is also mixed in to prevent BTN from always checking back and denying you the check-raise opportunity.',
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
          { action: 'check',  frequency: 50, ev: 5.0 },
          { action: 'bet33',  frequency: 25, ev: 4.6, size: 4.46 },
          { action: 'bet75',  frequency: 25, ev: 4.8, size: 10.13 },
          { action: 'betPot', frequency: 0,  ev: 4.0, size: 13.5 },
        ],
        bestAction: 'check',
        logicTags: ['THIN_VALUE', 'POT_CONTROL'],
        explanation: 'JJ is an overpair on a low 3-bet pot board — ahead of most hands but not invincible. Check-calling is standard; BTN\'s range contains overcards and higher pairs that need to be accounted for. When leading, medium sizing provides protection against draws while getting value from BTN\'s AK, AQ, and KQ — hands that have substantial equity against you. Avoid overbetting: you don\'t want to get check-raised off the best hand.',
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
          { action: 'check',  frequency: 50, ev: 4.1 },
          { action: 'bet33',  frequency: 50, ev: 4.5, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: 3.5, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: 3.2, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'BOARD_COVERAGE'],
        explanation: 'AA with the nut flush draw (Ah) on a monotone board — a truly dominant hand. Small c-bet is preferred: you want BB to call with their entire range of weaker flush draws and pairs, building a pot you will win at very high frequency. Checking is also correct to slow-play. Large bets fold too much of BB\'s range — on monotone boards, your goal is to extract from the wide range of players who will call small bets.',
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
          { action: 'check',  frequency: 75, ev: 2.0 },
          { action: 'bet33',  frequency: 25, ev: 1.8, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: 0.9, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: 0.4, size: 6.5 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL'],
        explanation: 'KK without a heart on a three-heart board — your overpair is significantly devalued. BB\'s range contains many flushes and flush draws that are ahead of or racing your hand. Checking is dominant: you avoid building a pot where you may be drawing thin. If BB leads the turn or river with a heart on board, you can make an informed fold. Betting into a board where opponent has many flushes is one of the most common BTN leaks.',
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
          { action: 'check',  frequency: 25, ev: 1.8 },
          { action: 'bet33',  frequency: 75, ev: 2.2, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: 1.2, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: 0.8, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['DRAW_HEAVY', 'BLOCKER_EFFECT'],
        explanation: 'Kh gives you the second nut flush draw — a powerful semi-bluff on a monotone board. Small bet builds the pot for when you hit (~36% equity to complete) while also folding out non-heart hands with marginal equity. You block the Kh-Xh flush that villain might otherwise represent. This is one of the best semi-bluffing hands available: you have the second nut draw and board coverage.',
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
          { action: 'check',  frequency: 75, ev: 0.4 },
          { action: 'bet33',  frequency: 25, ev: 0.3, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: -0.5, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: -0.9, size: 6.5 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'AK with no heart on a three-heart board is essentially air. Your overcards have minimal value against flushes, and BB\'s range is heavily weighted toward heart holdings. Check and take a free card; any heart that comes is a scare card for you. This is a clear "give up" spot — betting puts money in a pot where you\'re frequently behind with no draws. Occasional small leads are only for range balance.',
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
          { action: 'check',  frequency: 25, ev: 2.5 },
          { action: 'bet33',  frequency: 75, ev: 3.0, size: 2.15 },
          { action: 'bet75',  frequency: 0,  ev: 2.0, size: 4.88 },
          { action: 'betPot', frequency: 0,  ev: 1.5, size: 6.5 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'DRAW_HEAVY'],
        explanation: 'As is the nut flush draw — you have the best possible draw on this monotone board. Small bet builds the pot for when you complete to the nuts and also denies equity from non-spade hands. The As specifically blocks the nut flush from being in villain\'s range, making your semi-bluff fold equity higher than expected. When you hit, you will win the pot; when you bet and they fold, you win the pot immediately.',
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
          { action: 'check',  frequency: 100, ev: 0.8 },
          { action: 'bet33',  frequency: 0,   ev: 0.3, size: 2.15 },
          { action: 'bet75',  frequency: 0,   ev: -0.5, size: 4.88 },
          { action: 'betPot', frequency: 0,   ev: -1.0, size: 6.5 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'JJ with no spade on an all-spade board — pure check-back. You\'re below top pair with no flush draw: every call you get comes from a hand that beats you (spades) or is racing you (no-spade hands with pair equity). There is no hand in BB\'s continuing range that you\'re ahead of after they call. Save your chips and take the free turn card.',
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
          { action: 'check',  frequency: 25, ev: 4.8 },
          { action: 'bet33',  frequency: 25, ev: 5.2, size: 2.15 },
          { action: 'bet75',  frequency: 25, ev: 5.0, size: 4.88 },
          { action: 'betPot', frequency: 25, ev: 5.4, size: 6.5 },
        ],
        bestAction: 'betPot',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'King-high flush — an extremely strong hand on a monotone flop. All four sizings work, but the overbet is slightly best: you have a near-nutted flush and want maximum value from BB\'s weaker flush draws, pairs, and hands that will rationalize a call. Overbetting on monotone boards with a high flush is the correct approach because BB\'s range is heavily weighted toward flushes — hands that will stack off with worse flushes.',
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
          { action: 'check',  frequency: 75, ev: 1.0 },
          { action: 'bet33',  frequency: 25, ev: 1.2, size: 2.31 },
          { action: 'bet75',  frequency: 0,  ev: 0.5, size: 5.25 },
          { action: 'betPot', frequency: 0,  ev: 0.0, size: 7.0 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'EQUITY_DENIAL'],
        explanation: 'AJs has backdoor nut flush draw and two live overcards but completely missed Q-high. Checking is standard OOP: you pass initiative to BTN, see their action, and can make informed decisions. The occasional small lead balances your range and prevents BTN from checking back their entire range. With SB\'s positional disadvantage, checking preserves the option to check-raise with your equity when BTN c-bets.',
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
          { action: 'check',  frequency: 75, ev: 3.2 },
          { action: 'bet33',  frequency: 0,  ev: 2.8, size: 2.31 },
          { action: 'bet75',  frequency: 25, ev: 3.0, size: 5.25 },
          { action: 'betPot', frequency: 0,  ev: 2.3, size: 7.0 },
        ],
        bestAction: 'check',
        logicTags: ['CHECK_RAISE_CANDIDATE', 'THIN_VALUE'],
        explanation: 'Top pair with a backdoor flush draw from SB — a check-raise candidate. Checking allows BTN to c-bet their entire range; your check-raise then forces them to continue with second-best holdings like KQ, JJ, TT that are paying off your top pair. Occasional 75% lead is also in range to charge BTN\'s straight draws and flush draws while getting value. Never bet small from SB with a strong hand — it accomplishes nothing at minimal sizing.',
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
          { action: 'check',  frequency: 100, ev: -0.2 },
          { action: 'bet33',  frequency: 0,   ev: -0.8, size: 2.31 },
          { action: 'bet75',  frequency: 0,   ev: -1.5, size: 5.25 },
          { action: 'betPot', frequency: 0,   ev: -2.1, size: 7.0 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'Small pocket pair on Q-high from SB — check and prepare to fold to any bet. You\'re behind Q-x, 9-x, overpairs, and anything that connects with this board. Your equity is essentially your set outs (2 cards, ~8%) and nothing else. Any money you put in the pot is going in as a significant underdog. Check and fold to aggression; don\'t compound a losing situation by building the pot.',
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
          { action: 'check',  frequency: 75, ev: 2.0 },
          { action: 'bet33',  frequency: 25, ev: 1.8, size: 2.31 },
          { action: 'bet75',  frequency: 0,  ev: 1.2, size: 5.25 },
          { action: 'betPot', frequency: 0,  ev: 0.7, size: 7.0 },
        ],
        bestAction: 'check',
        logicTags: ['THIN_VALUE', 'POT_CONTROL'],
        explanation: 'Second pair (9s) with a backdoor flush draw from SB — check-call oriented. This hand has genuine showdown value against BTN\'s continuation bets and floats, but it cannot handle a raise. Check-calling is standard: you realize equity cheaply and avoid building a large pot as a marginal hand OOP. The small lead is mixed in occasionally for range balance and to charge BTN\'s overcards a small equity tax.',
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
          { action: 'check',  frequency: 50, ev: 2.8 },
          { action: 'bet33',  frequency: 25, ev: 2.6, size: 2.31 },
          { action: 'bet75',  frequency: 25, ev: 2.5, size: 5.25 },
          { action: 'betPot', frequency: 0,  ev: 2.2, size: 7.0 },
        ],
        bestAction: 'check',
        logicTags: ['RANGE_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'Overpair on a low connected board from SB — a spot where SB actually has range advantage. Low boards favor SB\'s defending range over BTN\'s raising range. Check-raise is a powerful option here: BTN will c-bet with their overcards, and your raise with an overpair forces them to call or fold in a pot where you\'re heavily favored. Some leads are also in range to charge 6x and 4x straight draws before they improve.',
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
          { action: 'check',  frequency: 0,  ev: 4.5 },
          { action: 'bet33',  frequency: 25, ev: 4.2, size: 2.31 },
          { action: 'bet75',  frequency: 25, ev: 4.8, size: 5.25 },
          { action: 'betPot', frequency: 50, ev: 5.1, size: 7.0 },
        ],
        bestAction: 'betPot',
        logicTags: ['NUT_ADVANTAGE', 'BOARD_COVERAGE'],
        explanation: 'Nut straight on a low board from SB — extract maximum value immediately. The board can pair (giving someone a boat over your straight), so don\'t wait. Overbet is the best line: BTN will continue with any pair, any overpair, any draw, and even two-pair hands that can\'t fold. Pot-sized bets on low boards with strong hands are underutilized by most players — use this spot to build a large pot before dangerous turn cards arrive.',
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
          { action: 'check',  frequency: 10, ev: 4.5 },
          { action: 'bet33',  frequency: 15, ev: 4.8, size: 3.56 },
          { action: 'bet75',  frequency: 50, ev: 5.2, size: 8.1 },
          { action: 'betPot', frequency: 25, ev: 5.5, size: 10.8 },
        ],
        bestAction: 'bet75',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'AQ improved to top two pair when the K arrived — a strong hand worth building a pot with. BB\'s turn checking range is heavily capped: they would have check-raised with sets and two pair on the flop. A large bet forces tough decisions from Kx, missed draws with equity, and any underpairs that floated. The pot-sized overbet is tempting but a 75% bet achieves the same goal while keeping value hands in BB\'s range that would fold to a larger sizing.',
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
          { action: 'check',  frequency: 75, ev: -0.2 },
          { action: 'bet33',  frequency: 25, ev: 0.0,  size: 3.56 },
          { action: 'bet75',  frequency: 0,  ev: -0.8, size: 8.1 },
          { action: 'betPot', frequency: 0,  ev: -1.0, size: 10.8 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'BLUFF_CANDIDATE'],
        explanation: 'JTo has a gutshot but the K turn is a disaster for our bluffing range — BB\'s calling range is now loaded with Kx that don\'t fold to any bet. We retain a few bluffing combos with small sizing since we have backdoor equity, but mostly this is a give-up street. Firing large into BB\'s reinforced range after they called an ace-high flop is burning chips with no fold equity.',
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
          { action: 'check',  frequency: 0,  ev: 1.0 },
          { action: 'bet33',  frequency: 25, ev: 1.2, size: 3.56 },
          { action: 'bet75',  frequency: 25, ev: 1.5, size: 8.1 },
          { action: 'betPot', frequency: 50, ev: 2.0, size: 10.8 },
        ],
        bestAction: 'betPot',
        logicTags: ['DRAW_HEAVY', 'BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
        explanation: 'KsQs picked up the second-nut flush draw on the 5s turn — a powerful semi-bluff with 9 flush outs plus overcard equity. The overbet is optimal here: it polarizes our range and puts maximum pressure on BB\'s medium-strength hands like Ax without a spade. BB can only continue with the best Ax and sets, giving us excellent fold equity. When called, we still win roughly 35% of the time even against strong holdings — the combination of equity and fold equity makes the overbet a clear profit play.',
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
          { action: 'check',  frequency: 25, ev: 4.0 },
          { action: 'bet33',  frequency: 50, ev: 4.5, size: 5.21 },
          { action: 'bet75',  frequency: 25, ev: 4.2, size: 11.85 },
          { action: 'betPot', frequency: 0,  ev: 3.8, size: 15.8 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'BOARD_COVERAGE'],
        explanation: 'TPGK on a connected board — the deuce is a blank but JT4 still has draws. A small turn bet charges straight draws (KQ, KQ, and backdoors), denies equity to 9x gutshots, and extracts thin value from Tx and 9x that floated. Betting large risks blowing out exactly the hands we want to keep in: BB calls 33% with weak Jx and underpairs but folds the same hands to a large bet, while strong hands like QTs or sets continue regardless of sizing.',
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
          { action: 'check',  frequency: 25, ev: 0.5 },
          { action: 'bet33',  frequency: 10, ev: 0.6, size: 5.21 },
          { action: 'bet75',  frequency: 15, ev: 0.8, size: 11.85 },
          { action: 'betPot', frequency: 50, ev: 1.1, size: 15.8 },
        ],
        bestAction: 'betPot',
        logicTags: ['DRAW_HEAVY', 'BLUFF_CANDIDATE'],
        explanation: '87s turned an open-ended straight draw to the nuts — any 9 makes the absolute best hand. The overbet is the optimal play: the Q is a scare card we can credibly represent (QJ, QT are in BTN\'s range), and BB\'s range is capped since he can\'t hold AA or KK from a BB defend. Large bets force folds from two-pair hands like JT that would call smaller bets but can\'t stack off against a pot-sized bet on a board where BTN\'s range crushes.',
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
          { action: 'check',  frequency: 25, ev: 4.2 },
          { action: 'bet33',  frequency: 50, ev: 4.8, size: 3.56 },
          { action: 'bet75',  frequency: 25, ev: 4.5, size: 8.1 },
          { action: 'betPot', frequency: 0,  ev: 4.3, size: 10.8 },
        ],
        bestAction: 'bet33',
        logicTags: ['BOARD_PAIR', 'THIN_VALUE'],
        explanation: 'AK has top pair on a board that just paired the 7 — only K7s (roughly 3 combos) in BB\'s range actually improved to trips. Small bets work perfectly here: BB continues with Kx, underpairs like 99-QQ, and any diamond draws. The paired board actually suppresses BB\'s bluff-raising frequency, making our value bets sticky. Over-sizing would fold out the thin-calling portion of BB\'s range that we want to extract from over multiple streets.',
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
          { action: 'check',  frequency: 50, ev: 0.3 },
          { action: 'bet33',  frequency: 25, ev: 0.5, size: 3.56 },
          { action: 'bet75',  frequency: 25, ev: 0.6, size: 8.1 },
          { action: 'betPot', frequency: 0,  ev: 0.4, size: 10.8 },
        ],
        bestAction: 'bet75',
        logicTags: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
        explanation: 'The ace is one of the best turn cards to barrel — it directly improves our perceived range (AK, AQ, AA all credible) while potentially killing the equity of BB\'s Kx hands that just became second pair. QcJc also has backdoor club flush equity. The 75% bet strikes the right balance: large enough to be credible as a value bet with Ax, but not so large we over-commit with complete air. BB must fold unpaired hands and many Kx holdings here.',
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
          { action: 'check',  frequency: 0,  ev: 1.5 },
          { action: 'bet33',  frequency: 0,  ev: 0.8, size: 9.41 },
          { action: 'bet75',  frequency: 75, ev: 2.8, size: 21.38 },
          { action: 'betPot', frequency: 25, ev: 3.5, size: 28.5 },
        ],
        bestAction: 'betPot',
        logicTags: ['NUT_ADVANTAGE', 'OVERBET_VALUE'],
        explanation: 'AQs makes Broadway — the nut straight on K-J-4-T-2 — a spot where many players dramatically under-size and leave money behind. BB\'s range after calling flop and turn is loaded with Kx, QJ, and two-pair combos that are pot-committed and often drawing dead. An overbet here extracts maximum value: BB calls with sets, two pair, and weaker straights — all of which you crush. The As also removes the nut flush draw possibility, making our hand unambiguous and our value massive.',
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
          { action: 'check',  frequency: 50, ev: -0.5 },
          { action: 'bet33',  frequency: 0,  ev: -1.0, size: 9.41 },
          { action: 'bet75',  frequency: 25, ev: 0.2,  size: 21.38 },
          { action: 'betPot', frequency: 25, ev: 0.4,  size: 28.5 },
        ],
        bestAction: 'bet75',
        logicTags: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
        explanation: '98h missed — busted straight draw, nine-high at showdown. The 9 in our hand blocks T9 combos that make the Broadway straight, providing a real blocker effect. A large river bluff representing Broadway requires BB to fold Kx, which is plausible since the board is terrifying for one-pair hands. Small bets accomplish nothing — BB calls any medium pair easily with pot odds. If you bluff here, commit: go large or check-fold and wait for a better spot.',
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
          { action: 'check',  frequency: 50, ev: 3.0 },
          { action: 'bet33',  frequency: 50, ev: 3.2, size: 7.26 },
          { action: 'bet75',  frequency: 0,  ev: 2.5, size: 16.5 },
          { action: 'betPot', frequency: 0,  ev: 2.2, size: 22 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'BLOCK_BET'],
        explanation: 'KK became a bluff-catcher when the ace arrived, but we still beat everything except Ax. The small block bet is a two-way tool: it extracts thin value from Qx, medium pairs, and 8x that we beat, while simultaneously preventing BB from making a large bluff that might force us off the best hand. If raised large, we fold. This line maximizes EV by keeping the pot small with a vulnerable hand while still charging BB\'s checking range.',
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
          { action: 'check',  frequency: 75, ev: -0.8 },
          { action: 'bet33',  frequency: 0,  ev: -1.2, size: 7.26 },
          { action: 'bet75',  frequency: 25, ev: -0.3, size: 16.5 },
          { action: 'betPot', frequency: 0,  ev: -1.5, size: 22 },
        ],
        bestAction: 'check',
        logicTags: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
        explanation: '76s bricked every street — no pair, no draw made it. While the As is a scary card, we hold the 7s and 6s which block none of BB\'s calling range (he calls with Qx, Ax, 8x). Good river bluff candidates hold the ace (blocks Ax), a king (blocks KQ), or a spade from earlier streets. We\'re missing all meaningful blockers and our narrative is incoherent. Give up, preserve chips, and find a better bluffing candidate.',
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
          { action: 'check',  frequency: 0,  ev: 5.5 },
          { action: 'bet33',  frequency: 10, ev: 6.5, size: 11.55 },
          { action: 'bet75',  frequency: 40, ev: 7.8, size: 26.25 },
          { action: 'betPot', frequency: 50, ev: 8.5, size: 35 },
        ],
        bestAction: 'betPot',
        logicTags: ['NUT_ADVANTAGE', 'OVERBET_VALUE'],
        explanation: 'Ad2d turned the nut flush on a three-diamond board — this is an overbet situation. BB\'s range after floating flop and turn on a three-flush board includes smaller flushes (Kd-x, Qd-x), straights (97s, 79s), and sets/two-pair that feel too strong to fold. All of these hands will call a pot-sized bet because they feel committed, yet they\'re all drawing dead. The J river is irrelevant. Betting small here is the clearest EV leak possible: you have the nuts and get called anyway.',
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
          { action: 'check',  frequency: 25, ev: -0.5 },
          { action: 'bet33',  frequency: 0,  ev: -1.0, size: 11.55 },
          { action: 'bet75',  frequency: 50, ev: 0.5,  size: 26.25 },
          { action: 'betPot', frequency: 25, ev: 0.6,  size: 35 },
        ],
        bestAction: 'bet75',
        logicTags: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
        explanation: 'KsQd is a strong bluff candidate: the Qd removes Qd-Xd flush combos from BB\'s calling range, slightly reducing his frequency of continuing. Our hand cannot win at showdown — Q-high loses to any pair. The large bet is required since small bets won\'t fold medium pairs or weaker flushes that called three streets. Between a pot-sized overbet and 75%, the 75% line is preferred — it achieves similar fold rates while risking fewer chips and keeping a profitable bluff from becoming a coin flip.',
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
          { action: 'check',  frequency: 25, ev: 3.5 },
          { action: 'bet33',  frequency: 75, ev: 4.0, size: 3.3 },
          { action: 'bet75',  frequency: 0,  ev: 3.0, size: 7.5 },
          { action: 'betPot', frequency: 0,  ev: 2.8, size: 10 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'TPTK is still strong multiway, but sizing down is mandatory. Against two opponents, the probability that someone has flopped a set, two pair, or strong draw increases significantly. Small bets charge draws from both players, extract thin value from underpairs, and keep the pot manageable in a spot where you cannot comfortably call a raise. If you face a raise here, you may need to fold TPTK — that\'s multiway dynamics at work.',
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
          { action: 'check',  frequency: 100, ev: 0.2 },
          { action: 'bet33',  frequency: 0,   ev: -0.3, size: 3.3 },
          { action: 'bet75',  frequency: 0,   ev: -1.0, size: 7.5 },
          { action: 'betPot', frequency: 0,   ev: -1.5, size: 10 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'QJo whiffed completely and bluffing into two opponents is nearly always a losing play. The fundamental issue: to profit, both opponents must fold simultaneously. If opponent A folds 55% and opponent B folds 55%, you only have roughly 30% combined fold equity — far below breakeven for most sizings. Check, look for a free card, and reassess. Save your bluffing frequency for spots with good blockers and fewer opponents.',
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
          { action: 'check',  frequency: 50, ev: 5.5 },
          { action: 'bet33',  frequency: 25, ev: 5.2, size: 3.3 },
          { action: 'bet75',  frequency: 25, ev: 5.0, size: 7.5 },
          { action: 'betPot', frequency: 0,  ev: 4.5, size: 10 },
        ],
        bestAction: 'check',
        logicTags: ['CHECK_RAISE_CANDIDATE', 'NUT_ADVANTAGE'],
        explanation: 'Middle set is a monster, but the check-raise line extracts maximum value multiway. With two opponents, at least one is likely to stab at the pot, giving us the opportunity to check-raise and build a massive pot immediately. Even if both check behind, we\'re fine — the K on board generates future action from any Kx. The check-raise also disguises our hand strength, while leading out advertises a strong hand and allows opponents to fold correctly.',
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
          { action: 'check',  frequency: 50, ev: 1.8 },
          { action: 'bet33',  frequency: 50, ev: 2.0, size: 3.3 },
          { action: 'bet75',  frequency: 0,  ev: 1.2, size: 7.5 },
          { action: 'betPot', frequency: 0,  ev: 0.8, size: 10 },
        ],
        bestAction: 'bet33',
        logicTags: ['DRAW_HEAVY', 'NUT_ADVANTAGE'],
        explanation: 'AcKc has the nut flush draw on a connected low board — roughly 40% equity multiway once we factor in flush outs plus two overcard outs. Small bets accomplish dual objectives: they build the pot for when we hit, and fold out medium-strength made hands that could beat us if we don\'t improve. Checking to see a free card is also correct. Larger sizing is suboptimal because we can\'t comfortably call a raise with just a draw, even a strong one.',
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
          { action: 'check',  frequency: 0,  ev: 3.5 },
          { action: 'bet33',  frequency: 25, ev: 3.8, size: 3.3 },
          { action: 'bet75',  frequency: 50, ev: 4.2, size: 7.5 },
          { action: 'betPot', frequency: 25, ev: 4.5, size: 10 },
        ],
        bestAction: 'betPot',
        logicTags: ['EQUITY_DENIAL', 'NUT_ADVANTAGE'],
        explanation: 'AA on a 7-6-2cc board multiway — this is a protection emergency. The board gives flush draws, straight draws (8x-5x, 9x-5x), and combo draws to both opponents combined. Against two players who both have incentive to call, an overbet is the correct play: you need to make draws expensive, and the dead money in the pot means you get snap-called by sets, two pair, flush draws, and combo draws — all of which you currently dominate. Slow-playing here and checking is the biggest mistake possible.',
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
          { action: 'check',  frequency: 50, ev: 4.2 },
          { action: 'bet33',  frequency: 50, ev: 4.5, size: 5.94 },
          { action: 'bet75',  frequency: 0,  ev: 3.8, size: 13.5 },
          { action: 'betPot', frequency: 0,  ev: 3.5, size: 18 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'RANGE_ADVANTAGE'],
        explanation: 'AJo hit top pair after squeezing — a very strong position. In a 3-bet pot, CO and BTN have capped their ranges by flatting pre: they cannot hold AA or KK. Our range advantage is significant since we have all the AA, KK, QQ, AK combos. A small c-bet capitalizes on this while keeping worse Ax, pocket pairs, and backdoor draws in the pot. Betting large here actually reduces EV because it folds out the exact hands we want to get three streets of value from.',
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
          { action: 'check',  frequency: 75, ev: 3.5 },
          { action: 'bet33',  frequency: 25, ev: 3.2, size: 5.94 },
          { action: 'bet75',  frequency: 0,  ev: 2.5, size: 13.5 },
          { action: 'betPot', frequency: 0,  ev: 2.8, size: 18 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'KK facing an ace after squeezing — a classic trap hand. You must check most of the time. Against two opponents who both called a 3-bet, one of them very likely holds an ace: they wouldn\'t call off 3x raises without strong hands. Betting forces you to fold to a raise, so why put chips in? Check, gather information, and call one modest bet from a single opponent. If action gets large from both players, KK is likely a fold.',
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
          { action: 'check',  frequency: 75, ev: 2.5 },
          { action: 'bet33',  frequency: 25, ev: 2.2, size: 5.94 },
          { action: 'bet75',  frequency: 0,  ev: 1.5, size: 13.5 },
          { action: 'betPot', frequency: 0,  ev: 1.2, size: 18 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
        explanation: 'QQ after squeezing into two opponents who called off 3x with an A on board — one of the most difficult spots in poker. Your overpair is now a bluff-catcher. Two opponents calling a squeeze can comfortably hold AJ, AT, A9s, even AQ. Check to protect our range (we shouldn\'t always bet a 3-bet range on an A-high board) and to minimize losses when behind. Occasionally small-bet as a blocker on later streets if they both check back.',
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
          { action: 'check',  frequency: 25, ev: 5.5 },
          { action: 'bet33',  frequency: 50, ev: 5.8, size: 5.94 },
          { action: 'bet75',  frequency: 25, ev: 5.5, size: 13.5 },
          { action: 'betPot', frequency: 0,  ev: 5.7, size: 18 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'EQUITY_DENIAL'],
        explanation: 'AA on a low connected board in a squeeze pot — bet for protection. The 7-6-3 board is dangerous for ranges that called a squeeze: 87s, 98s, 54s, T8s all have significant equity. Against two opponents with combined draw-heavy ranges, you must charge those draws. The small bet is optimal in a 3-bet pot because the pot is already large and smaller bets generate more calls, building the pot further. If raised, you can profitably get it in — nobody raises a 3-bettor here without strong two-pair or better.',
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
          { action: 'check',  frequency: 50, ev: 0.8 },
          { action: 'bet33',  frequency: 50, ev: 1.0, size: 5.94 },
          { action: 'bet75',  frequency: 0,  ev: 0.2, size: 13.5 },
          { action: 'betPot', frequency: 0,  ev: -0.5, size: 18 },
        ],
        bestAction: 'bet33',
        logicTags: ['BOARD_COVERAGE', 'BLUFF_CANDIDATE'],
        explanation: 'JTd missed the board but we exploit the capped ranges of our opponents — in a squeeze pot, CO and BTN hold pocket pairs, suited broadways, and some suited connectors, but not the strongest Ax or premium pairs. JTd has a gutshot draw and backdoor flush equity. The small c-bet folds out 88-TT and small pairs that have decent equity against us. Use this bluff selectively — don\'t barrel without improving on the turn.',
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
  { id: 'streak_3', name: 'Hot Streak', description: 'Get 3 correct in a row', icon: 'flame', check: (s) => s.bestStreak >= 3 },
  { id: 'streak_5', name: 'On Fire', description: 'Get 5 correct in a row', icon: 'flame', check: (s) => s.bestStreak >= 5 },
  { id: 'streak_10', name: 'Unstoppable', description: 'Get 10 correct in a row', icon: 'flame', check: (s) => s.bestStreak >= 10 },
  { id: 'streak_16', name: 'MAX Combo', description: 'Reach 5x multiplier (16 in a row)', icon: 'flame', check: (s) => s.bestStreak >= 16 },
  { id: 'no_blunders_10', name: 'Careful Player', description: 'Play 10 hands without a blunder', icon: 'shield', check: (s) => s.handsWithoutBlunder >= 10 },
  { id: 'perfect_drill', name: 'Drill Master', description: 'Score 100% on any drill', icon: 'star', check: (s) => s.perfectDrill },
  { id: 'all_drills', name: 'Well Rounded', description: 'Try every drill at least once', icon: 'compass', check: (s) => s.drillsAttempted >= DRILLS.length },
  { id: 'accuracy_80', name: 'Sharpshooter', description: 'Maintain 80%+ accuracy over 20 hands', icon: 'crosshair', check: (s) => s.totalHands >= 20 && (s.totalCorrect / s.totalHands) >= 0.8 },
  { id: 'exploiter', name: 'Exploiter', description: 'Win 5 hands in exploitative mode', icon: 'zap', check: (s) => s.exploitWins >= 5 },
  { id: 'arena_floor_3', name: 'Survivor', description: 'Clear Floor 3 in Arena Mode', icon: 'swords', check: (s) => (s.bestArenaFloor || 0) >= 3 },
  { id: 'arena_floor_5', name: 'Gladiator', description: 'Clear Floor 5 in Arena Mode', icon: 'swords', check: (s) => (s.bestArenaFloor || 0) >= 5 },
  { id: 'arena_floor_10', name: 'Champion', description: 'Clear Floor 10 in Arena Mode', icon: 'swords', check: (s) => (s.bestArenaFloor || 0) >= 10 },
  { id: 'arena_boss_5', name: 'Boss Slayer', description: 'Defeat 5 bosses in Arena Mode', icon: 'skull', check: (s) => (s.arenaBossesDefeated || 0) >= 5 },
];

// ── Exploitative Adjustments ──

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
