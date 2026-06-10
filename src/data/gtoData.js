// Mock GTO Solver Data
// Pre-computed strategy data for hand-authored training spots.
// Frequencies are "human-simplified" — rounded to the nearest 25%.
//
// Soundness conventions:
// - Actions mixed at positive frequency have near-identical EV (within ~0.05 BB),
//   since at equilibrium every action in a mixed strategy is indifferent.
// - Zero-frequency actions have strictly lower EV; the gap determines whether
//   choosing one is an inaccuracy or a blunder.
// - Fold is only offered when the hero actually faces a bet, and its EV is 0
//   by definition (everything is measured relative to surrendering the pot).

export const POSITIONS = {
  BTN: 'Button',
  SB: 'Small Blind',
  BB: 'Big Blind',
  CO: 'Cutoff',
  HJ: 'Hijack',
  LJ: 'Lojack',
};

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
    id: 'srp-cbet',
    name: 'Flop C-Betting',
    description: 'BTN vs BB single raised pots. Learn which textures to attack, which sizes to use, and when to give up.',
    category: 'Single Raised Pots',
    difficulty: 'Beginner',
    icon: 'target',
    heroPosition: 'BTN',
    villainPosition: 'BB',
    potType: 'SRP',
  },
  {
    id: 'bb-defense',
    name: 'Big Blind Defense',
    description: 'Facing c-bets out of position. Practice the fold / call / check-raise decision with pairs, draws, and air.',
    category: 'Defense',
    difficulty: 'Beginner',
    icon: 'shield',
    heroPosition: 'BB',
    villainPosition: 'BTN',
    potType: 'SRP',
  },
  {
    id: 'turn-barrels',
    name: 'Turn Barreling',
    description: 'Your flop c-bet got called. Which turn cards to double-barrel, which hands to fire, and when to shut down.',
    category: 'Single Raised Pots',
    difficulty: 'Intermediate',
    icon: 'trending-up',
    heroPosition: 'BTN',
    villainPosition: 'BB',
    potType: 'SRP',
  },
  {
    id: '3bet-oop',
    name: '3-Bet Pots OOP',
    description: 'You 3-bet from the BB and got called. Navigate low SPR pots out of position as the aggressor.',
    category: '3-Bet Pots',
    difficulty: 'Intermediate',
    icon: 'swords',
    heroPosition: 'BB',
    villainPosition: 'BTN',
    potType: '3BET',
  },
  {
    id: 'river-decisions',
    name: 'River: Hero or Zero',
    description: 'Triple-barrel rivers. Thin value, blocker bluffs, and knowing when your missed draw should just give up.',
    category: 'Single Raised Pots',
    difficulty: 'Advanced',
    icon: 'zap',
    heroPosition: 'BTN',
    villainPosition: 'BB',
    potType: 'SRP',
  },
  {
    id: 'tricky-textures',
    name: 'Tricky Textures',
    description: 'Monotone, paired, and hyper-connected boards — the flops that confuse everyone. Learn the patterns.',
    category: 'Board Texture',
    difficulty: 'Advanced',
    icon: 'layers',
    heroPosition: 'BTN',
    villainPosition: 'BB',
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
  BLOCKER_BLUFF: { label: 'Blocker Bluff', color: '#ec4899', description: 'Your hand blocks the nuts, making villain folds more likely.' },
  CHECK_RAISE_CANDIDATE: { label: 'Check-Raise Candidate', color: '#8b5cf6', description: 'Hand that benefits from raising after checking — for value or as a semi-bluff.' },
  WAY_AHEAD_WAY_BEHIND: { label: 'Way Ahead / Way Behind', color: '#64748b', description: 'You either have villain crushed or are crushed — keep the pot small.' },
  GIVE_UP: { label: 'Give Up', color: '#6b7280', description: 'No equity, no blockers — putting in money here just burns EV.' },
  PRICE_IN: { label: 'Priced In', color: '#0ea5e9', description: 'The bet is small enough that even marginal hands must continue.' },
  SEMI_BLUFF: { label: 'Semi-Bluff', color: '#fb923c', description: 'Raising with a draw — you win folds now or improve to the best hand later.' },
};

// ── Scenarios ──
// Each scenario: board, hero hand, action context, and the GTO strategy.
// `facingBet` (in BB) is set when the hero must respond to a villain bet —
// only those spots offer fold/call/raise.

const SRP_CONTEXT = 'You open 2.5 BB on the BTN, BB calls. BB checks to you.';
const TURN_CONTEXT = 'You opened BTN, BB called. Your 1.8 BB flop c-bet got called. BB checks the turn.';
const RIVER_CONTEXT = 'You bet the flop and barreled the turn — BB called both. BB checks the river.';
const DEFENSE_CONTEXT = 'BTN opens 2.5 BB, you call in the BB. You check, BTN bets 1.8 BB (33% pot).';
const THREEBET_CONTEXT = 'BTN opens 2.5 BB, you 3-bet to 11 BB from the BB, BTN calls. You act first.';

export const SCENARIOS = {
  'srp-cbet': [
    {
      id: 'cbet-1',
      context: SRP_CONTEXT,
      board: { flop: ['As', '8h', '3c'], turn: null, river: null },
      heroHand: ['Ah', 'Kd'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 0, ev: 3.3 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 3.85, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 3.82, size: 4.1 },
        ],
        bestAction: 'bet33',
        logicTags: ['RANGE_ADVANTAGE', 'NUT_ADVANTAGE'],
        explanation: 'A83 rainbow is one of the best flops for the preflop raiser — bet your whole range. With top pair top kicker the small size is best: it keeps BB\'s worse Ax, pocket pairs, and gutshots in. Checking a hand this strong on a board this good just lets equity in for free.',
      },
    },
    {
      id: 'cbet-2',
      context: SRP_CONTEXT,
      board: { flop: ['Qs', '9h', '4d'], turn: null, river: null },
      heroHand: ['Kd', 'Qc'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 2.58 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 2.6, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 2.2, size: 4.1 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'EQUITY_DENIAL'],
        explanation: 'Top pair second kicker on a dryish board wants a small value bet — Jx, 9x, and pocket pairs all continue. The big size folds out everything you beat and only builds a pot against better. A few checks keep your checking range protected.',
      },
    },
    {
      id: 'cbet-3',
      context: SRP_CONTEXT,
      board: { flop: ['7h', '6h', '5s'], turn: null, river: null },
      heroHand: ['Ac', 'Kd'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 1.05 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 1.02, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 0.25, size: 4.1 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'RANGE_ADVANTAGE'],
        explanation: 'Low connected boards like 765 smash the BB\'s calling range — they have all the 84s, 98s, and 43s type hands; you don\'t. AK-high still wins plenty of showdowns, so check back, realize your equity, and keep the pot small. Bombing this board with one overcard range is torching money.',
      },
    },
    {
      id: 'cbet-4',
      context: SRP_CONTEXT,
      board: { flop: ['Ks', '7d', '2c'], turn: null, river: null },
      heroHand: ['5d', '5c'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 1.47 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 1.5, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 1.05, size: 4.1 },
        ],
        bestAction: 'bet33',
        logicTags: ['EQUITY_DENIAL', 'RANGE_ADVANTAGE'],
        explanation: 'K72 rainbow heavily favors the BTN, so nearly your whole range bets small. Pocket fives love the cheap bet: overcards like QJ and JT fold immediately, denying six outs against you, and you set your own price. Betting big turns your hand into a bluff.',
      },
    },
    {
      id: 'cbet-5',
      context: SRP_CONTEXT,
      board: { flop: ['Th', '9h', '8s'], turn: null, river: null },
      heroHand: ['Ad', 'Ac'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 4.15 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 4.18, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 50, ev: 4.2, size: 4.1 },
        ],
        bestAction: 'bet75',
        logicTags: ['EQUITY_DENIAL', 'BOARD_COVERAGE'],
        explanation: 'T98 two-tone is a minefield — almost every turn card changes the nuts. An overpair wants to bet big now: charge the pair-plus-draw hands the maximum while you\'re still ahead. Mixing in some checks and small bets is fine, but the polar size does the heavy lifting.',
      },
    },
    {
      id: 'cbet-6',
      context: SRP_CONTEXT,
      board: { flop: ['As', '8h', '3c'], turn: null, river: null },
      heroHand: ['7d', '6d'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: -0.1 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: -0.12, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: -0.55, size: 4.1 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'BLUFF_CANDIDATE'],
        explanation: '76s here has only backdoor straight and no flush draw — not a gutshot, nothing made. It\'s a fringe bluff candidate at best: a small stab occasionally folds out better high cards, but mostly you check, give up cheaply, and save the aggression for hands with real equity.',
      },
    },
    {
      id: 'cbet-7',
      context: SRP_CONTEXT,
      board: { flop: ['Jc', '8c', '4s'], turn: null, river: null },
      heroHand: ['Kh', 'Qh'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 0.93 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 0.95, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 0.5, size: 4.1 },
        ],
        bestAction: 'bet33',
        logicTags: ['BLUFF_CANDIDATE', 'EQUITY_DENIAL'],
        explanation: 'Two live overcards plus a backdoor straight draw make KQ a classic mixed c-bet. Betting small folds out A-high and denies equity; checking realizes your six outs for free. Both lines print roughly the same EV — the one mistake is bloating the pot with king-high.',
      },
    },
    {
      id: 'cbet-8',
      context: SRP_CONTEXT,
      board: { flop: ['As', '8h', '3c'], turn: null, river: null },
      heroHand: ['Ac', '3d'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 4.45 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 4.5, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 4.2, size: 4.1 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'Bottom two pair on a dry board is a clear value bet, but the small size is key: worse Ax and pocket pairs call 33% all day and fold to 75%. Mix in an occasional trap, and remember 8x/3x turns can counterfeit you — betting now beats slow-playing.',
      },
    },
  ],

  'bb-defense': [
    {
      id: 'def-1',
      context: DEFENSE_CONTEXT,
      board: { flop: ['As', '8h', '3c'], turn: null, river: null },
      heroHand: ['8s', '7s'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 7.3,
      effectiveStack: 97.5,
      facingBet: 1.8,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold', label: 'Fold', frequency: 0, ev: 0 },
          { action: 'call', label: 'Call', frequency: 100, ev: 1.0, size: 1.8 },
          { action: 'raise', label: 'Raise to 7.2', frequency: 0, ev: 0.3, size: 7.2 },
        ],
        bestAction: 'call',
        logicTags: ['PRICE_IN', 'POT_CONTROL'],
        explanation: 'Middle pair with a backdoor flush draw is a mandatory call against a 33% bet — you need barely 20% equity and you have far more. Raising turns a fine bluff-catcher into a bluff: every better hand continues and worse folds. Folding pairs to small bets is the fastest way to get run over.',
      },
    },
    {
      id: 'def-2',
      context: DEFENSE_CONTEXT,
      board: { flop: ['As', '8h', '3c'], turn: null, river: null },
      heroHand: ['5d', '4d'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 7.3,
      effectiveStack: 97.5,
      facingBet: 1.8,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold', label: 'Fold', frequency: 25, ev: 0 },
          { action: 'call', label: 'Call', frequency: 50, ev: 0.05, size: 1.8 },
          { action: 'raise', label: 'Raise to 7.2', frequency: 25, ev: 0.03, size: 7.2 },
        ],
        bestAction: 'call',
        logicTags: ['SEMI_BLUFF', 'BLUFF_CANDIDATE'],
        explanation: '54s has a gutshot to the wheel (any 2) plus backdoor diamonds. It\'s close to indifferent between all three options — exactly the kind of hand GTO mixes. Calling realizes the draw cheaply, raising makes a fine semi-bluff against a range-betting BTN, and folding loses almost nothing.',
      },
    },
    {
      id: 'def-3',
      context: DEFENSE_CONTEXT,
      board: { flop: ['Ks', '7d', '2c'], turn: null, river: null },
      heroHand: ['Qh', 'Th'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 7.3,
      effectiveStack: 97.5,
      facingBet: 1.8,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold', label: 'Fold', frequency: 75, ev: 0 },
          { action: 'call', label: 'Call', frequency: 25, ev: 0, size: 1.8 },
          { action: 'raise', label: 'Raise to 7.2', frequency: 0, ev: -0.5, size: 7.2 },
        ],
        bestAction: 'fold',
        logicTags: ['GIVE_UP'],
        explanation: 'Queen-high with no draw on K72 is a break-even float at best — you call, miss, and face another barrel on most turns. Folding and calling have the same EV (that\'s what makes BTN\'s small bet work), so mostly let it go. Bluff-raising into the range that smashed this board is the one real mistake.',
      },
    },
    {
      id: 'def-4',
      context: DEFENSE_CONTEXT,
      board: { flop: ['Th', '9h', '8s'], turn: null, river: null },
      heroHand: ['6h', '5h'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 7.3,
      effectiveStack: 97.5,
      facingBet: 1.8,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold', label: 'Fold', frequency: 0, ev: 0 },
          { action: 'call', label: 'Call', frequency: 50, ev: 1.55, size: 1.8 },
          { action: 'raise', label: 'Raise to 7.2', frequency: 50, ev: 1.6, size: 7.2 },
        ],
        bestAction: 'raise',
        logicTags: ['SEMI_BLUFF', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'Flush draw plus a gutshot (any 7) is a monster combo draw — around 12 clean outs. Check-raising builds the pot while you can still make villain fold, and you have plenty of equity when called. Flatting to keep the pot controlled is the other half of the mix. Folding this much equity is unthinkable.',
      },
    },
    {
      id: 'def-5',
      context: DEFENSE_CONTEXT,
      board: { flop: ['Ks', '7d', '2c'], turn: null, river: null },
      heroHand: ['Kh', '8h'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 7.3,
      effectiveStack: 97.5,
      facingBet: 1.8,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold', label: 'Fold', frequency: 0, ev: 0 },
          { action: 'call', label: 'Call', frequency: 75, ev: 2.0, size: 1.8 },
          { action: 'raise', label: 'Raise to 7.2', frequency: 25, ev: 1.95, size: 7.2 },
        ],
        bestAction: 'call',
        logicTags: ['POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'Top pair on a dry board mostly wants to call — there are no draws to charge, and raising folds out the air you dominate. A small check-raise frequency keeps BTN honest and gets value from worse Kx and stubborn pairs, but flatting and letting villain keep barreling bluffs is the moneymaker.',
      },
    },
    {
      id: 'def-6',
      context: DEFENSE_CONTEXT,
      board: { flop: ['Qs', '9h', '4d'], turn: null, river: null },
      heroHand: ['6c', '6d'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 7.3,
      effectiveStack: 97.5,
      facingBet: 1.8,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'fold', label: 'Fold', frequency: 0, ev: 0 },
          { action: 'call', label: 'Call', frequency: 100, ev: 0.4, size: 1.8 },
          { action: 'raise', label: 'Raise to 7.2', frequency: 0, ev: -0.3, size: 7.2 },
        ],
        bestAction: 'call',
        logicTags: ['PRICE_IN', 'POT_CONTROL'],
        explanation: 'An underpair to one card is well ahead of a range-betting BTN\'s air, and at 4:1 pot odds you can\'t fold. Call once and re-evaluate — most turns you check-fold to more pressure, but plenty of hands give up after one barrel. Raising accomplishes nothing: better hands snap you off, worse hands fold.',
      },
    },
  ],

  'turn-barrels': [
    {
      id: 'turn-1',
      context: TURN_CONTEXT,
      board: { flop: ['Ks', '7d', '2c'], turn: 'Ah', river: null },
      heroHand: ['Kd', 'Qc'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 9.1,
      effectiveStack: 95.7,
      street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 2.88 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 2.9, size: 3.0 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 2.45, size: 6.8 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'WAY_AHEAD_WAY_BEHIND'],
        explanation: 'The ace is great for your range but awkward for this hand — BB\'s floats with Ax just got there, while worse Kx still pays a small bet. Mix thin value bets with checks to get to showdown cheaply. Barreling big turns second pair into a bluff against the hands that continue.',
      },
    },
    {
      id: 'turn-2',
      context: TURN_CONTEXT,
      board: { flop: ['Qs', '9h', '4d'], turn: '2c', river: null },
      heroHand: ['Ac', 'Kc'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 9.1,
      effectiveStack: 95.7,
      street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 1.38 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: 1.15, size: 3.0 },
          { action: 'bet75', label: 'Bet 75%', frequency: 50, ev: 1.4, size: 6.8 },
        ],
        bestAction: 'bet75',
        logicTags: ['BLUFF_CANDIDATE', 'EQUITY_DENIAL'],
        explanation: 'AK is the perfect double-barrel bluff: six outs to the best hand, and the big size pressures 9x and pocket pairs that called the flop. The brick 2 changes nothing, which is exactly why your polar bet is credible. If you bet, bet big — the small size folds out nothing and wastes your leverage.',
      },
    },
    {
      id: 'turn-3',
      context: TURN_CONTEXT,
      board: { flop: ['Th', '9h', '8s'], turn: '3d', river: null },
      heroHand: ['Ad', 'Ac'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 9.1,
      effectiveStack: 95.7,
      street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 3.55 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: 3.3, size: 3.0 },
          { action: 'bet75', label: 'Bet 75%', frequency: 75, ev: 3.6, size: 6.8 },
        ],
        bestAction: 'bet75',
        logicTags: ['EQUITY_DENIAL', 'THIN_VALUE'],
        explanation: 'The 3 is a total brick — your overpair is still the best hand against the pairs and draws that called the flop. Keep charging the maximum while the draws are still drawing. Checking lets a third of the deck beat you for free; the small size under-charges 12-out monsters.',
      },
    },
    {
      id: 'turn-4',
      context: TURN_CONTEXT,
      board: { flop: ['As', '8h', '3c'], turn: 'Kd', river: null },
      heroHand: ['7d', '6d'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 9.1,
      effectiveStack: 95.7,
      street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: -0.2 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: -0.45, size: 3.0 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: -0.22, size: 6.8 },
        ],
        bestAction: 'check',
        logicTags: ['GIVE_UP', 'BLUFF_CANDIDATE'],
        explanation: 'The king is a strong barrel card — it smashes your range and misses BB\'s — but 76s has zero equity when called: no pair, no draw. Barrel big occasionally because the card is so good, and give up the rest of the time. The small bet is the worst of both worlds: no fold equity, no value.',
      },
    },
    {
      id: 'turn-5',
      context: TURN_CONTEXT,
      board: { flop: ['Kc', '9c', '5d'], turn: '4c', river: null },
      heroHand: ['Ac', 'Jd'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 9.1,
      effectiveStack: 95.7,
      street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 0.58 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: 0.3, size: 3.0 },
          { action: 'bet75', label: 'Bet 75%', frequency: 50, ev: 0.6, size: 6.8 },
        ],
        bestAction: 'bet75',
        logicTags: ['BLOCKER_BLUFF', 'SEMI_BLUFF'],
        explanation: 'The third club is scary — but you hold the Ac, the key card. You block the nut flush, you can still make it on the river, and a big barrel puts every one-pair hand in a vise. Checking keeps A-high\'s showdown value. Both work; the Ac is what makes the aggressive line printable.',
      },
    },
    {
      id: 'turn-6',
      context: TURN_CONTEXT,
      board: { flop: ['Qd', '9s', '4c'], turn: '9d', river: null },
      heroHand: ['Ad', 'Qc'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 9.1,
      effectiveStack: 95.7,
      street: 'turn',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 2.65 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 2.7, size: 3.0 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 2.45, size: 6.8 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'BLOCK_BET'],
        explanation: 'The board pairing actually helps you: trips just got rarer combinatorially, and your top pair top kicker still dominates Qx and pocket pairs. Paired turns call for small sizes — the value targets are medium-strength hands that fold to big bets. Bet small, get called by worse, repeat.',
      },
    },
  ],

  '3bet-oop': [
    {
      id: '3bet-1',
      context: THREEBET_CONTEXT,
      board: { flop: ['Ks', 'Jh', '7d'], turn: null, river: null },
      heroHand: ['Qh', 'Qd'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 22.5,
      effectiveStack: 89,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 6.95 },
          { action: 'bet33', label: 'C-bet 33%', frequency: 25, ev: 7.0, size: 7.4 },
          { action: 'bet75', label: 'C-bet 75%', frequency: 0, ev: 6.4, size: 16.9 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'WAY_AHEAD_WAY_BEHIND'],
        explanation: 'QQ under the king is a classic check-call in 3-bet pots: every Kx in BTN\'s range has you beaten, and everything you beat folds to big bets. Check, let BTN stab with worse, and keep the pot small with a hand that\'s really a strong bluff-catcher here.',
      },
    },
    {
      id: '3bet-2',
      context: THREEBET_CONTEXT,
      board: { flop: ['Ks', 'Jh', '7d'], turn: null, river: null },
      heroHand: ['As', 'Kd'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 22.5,
      effectiveStack: 89,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 9.45 },
          { action: 'bet33', label: 'C-bet 33%', frequency: 50, ev: 9.5, size: 7.4 },
          { action: 'bet75', label: 'C-bet 75%', frequency: 0, ev: 9.0, size: 16.9 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'CHECK_RAISE_CANDIDATE'],
        explanation: 'Top pair top kicker as the 3-bettor: a small c-bet gets three streets going against Kx, Jx, and QQ-type hands. Checking is just as good — it under-represents your hand and lets you check-raise BTN\'s stabs. With the SPR this low, you don\'t need a big size to get stacks in by the river.',
      },
    },
    {
      id: '3bet-3',
      context: THREEBET_CONTEXT,
      board: { flop: ['8d', '6s', '2c'], turn: null, river: null },
      heroHand: ['Ah', 'Kh'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 22.5,
      effectiveStack: 89,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 2.15 },
          { action: 'bet33', label: 'C-bet 33%', frequency: 75, ev: 2.2, size: 7.4 },
          { action: 'bet75', label: 'C-bet 75%', frequency: 0, ev: 1.8, size: 16.9 },
        ],
        bestAction: 'bet33',
        logicTags: ['EQUITY_DENIAL', 'BLUFF_CANDIDATE'],
        explanation: 'Low boards miss both ranges, but your AK has the two best overcards plus backdoor hearts. A small c-bet folds out QT and JT type hands that share your situation, denies their equity, and keeps your overpairs and air balanced. Cheap, effective, hard to exploit.',
      },
    },
    {
      id: '3bet-4',
      context: THREEBET_CONTEXT,
      board: { flop: ['Ac', 'Qs', '5h'], turn: null, river: null },
      heroHand: ['Kd', 'Ks'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 22.5,
      effectiveStack: 89,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 5.15 },
          { action: 'bet33', label: 'C-bet 33%', frequency: 25, ev: 5.2, size: 7.4 },
          { action: 'bet75', label: 'C-bet 75%', frequency: 0, ev: 4.7, size: 16.9 },
        ],
        bestAction: 'check',
        logicTags: ['WAY_AHEAD_WAY_BEHIND', 'POT_CONTROL'],
        explanation: 'KK under the ace is way-ahead-or-way-behind: Ax has you crushed, and JJ-type hands you crush won\'t put in much money. Check to keep the pot small and bluff-catch. The occasional small bet denies equity to KQ/QJ floats, but building a big pot here only helps villain.',
      },
    },
    {
      id: '3bet-5',
      context: THREEBET_CONTEXT,
      board: { flop: ['7s', '7h', '3d'], turn: null, river: null },
      heroHand: ['Ad', 'Qd'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 22.5,
      effectiveStack: 89,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 1.95 },
          { action: 'bet33', label: 'C-bet 33%', frequency: 75, ev: 2.0, size: 7.4 },
          { action: 'bet75', label: 'C-bet 75%', frequency: 0, ev: 1.6, size: 16.9 },
        ],
        bestAction: 'bet33',
        logicTags: ['RANGE_ADVANTAGE', 'EQUITY_DENIAL'],
        explanation: 'Paired low boards barely interact with either range, and the 3-bettor\'s overpairs dominate — so you get to c-bet small with almost everything. AQ-high bets for cheap equity denial: 88-JJ might fold by the river, and you have two clean overcards plus backdoors when called.',
      },
    },
    {
      id: '3bet-6',
      context: THREEBET_CONTEXT,
      board: { flop: ['Qd', 'Js', '8s'], turn: null, river: null },
      heroHand: ['Ac', 'Ah'],
      heroPosition: 'BB',
      villainPosition: 'BTN',
      potSize: 22.5,
      effectiveStack: 89,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 7.95 },
          { action: 'bet33', label: 'C-bet 33%', frequency: 25, ev: 7.97, size: 7.4 },
          { action: 'bet75', label: 'C-bet 75%', frequency: 50, ev: 8.0, size: 16.9 },
        ],
        bestAction: 'bet75',
        logicTags: ['EQUITY_DENIAL', 'BOARD_COVERAGE'],
        explanation: 'QJ8 two-tone is dripping with draws that crush an unprotected overpair. Bet big: KT, T9, flush draws, and pair-plus-gutshot hands all pay full price, and with SPR around 4 you set up a clean turn shove. Slow-playing aces on boards this wet is how overpairs go broke.',
      },
    },
  ],

  'river-decisions': [
    {
      id: 'river-1',
      context: RIVER_CONTEXT,
      board: { flop: ['As', '8h', '3c'], turn: 'Kd', river: '2s' },
      heroHand: ['Ah', 'Ks'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 22.7,
      effectiveStack: 88.9,
      street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 0, ev: 7.2 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 8.16, size: 7.5 },
          { action: 'bet75', label: 'Bet 75%', frequency: 75, ev: 8.2, size: 17.0 },
        ],
        bestAction: 'bet75',
        logicTags: ['NUT_ADVANTAGE', 'THIN_VALUE'],
        explanation: 'Top two pair on a blank river after BB called twice — their range is full of Ax and stubborn Kx that will pay one more big bet. This is exactly the hand your triple-barrel line is built around. Checking back the near-nuts after building a 22 BB pot is lighting value on fire.',
      },
    },
    {
      id: 'river-2',
      context: RIVER_CONTEXT,
      board: { flop: ['As', '8h', '3c'], turn: 'Kd', river: '2s' },
      heroHand: ['Qh', 'Jh'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 22.7,
      effectiveStack: 88.9,
      street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 0.2 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: -0.6, size: 7.5 },
          { action: 'bet75', label: 'Bet 75%', frequency: 50, ev: 0.22, size: 17.0 },
        ],
        bestAction: 'bet75',
        logicTags: ['BLUFF_CANDIDATE', 'BOARD_COVERAGE'],
        explanation: 'Queen-high never wins at showdown, which makes QJ a natural bluff — it loses nothing by betting and the big size puts every 8x and pocket pair to the test. Bluff big or give up: the 33% bluff offers BB 4:1, so even weak pairs are priced in to call and your fold equity evaporates.',
      },
    },
    {
      id: 'river-3',
      context: RIVER_CONTEXT,
      board: { flop: ['Th', '9h', '8s'], turn: '3d', river: 'Ah' },
      heroHand: ['Ad', 'Ac'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 22.7,
      effectiveStack: 88.9,
      street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 4.97 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 5.0, size: 7.5 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 4.6, size: 17.0 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'WAY_AHEAD_WAY_BEHIND'],
        explanation: 'You rivered top set, but look at the board: QJ and 76 made straights on the flop, and the Ah completed the flush. Your set now beats one-pair hands and loses to everything that check-calls big. Bet small to get value from Tx/9x, or check back — bombing into this runout is value-owning yourself.',
      },
    },
    {
      id: 'river-4',
      context: RIVER_CONTEXT,
      board: { flop: ['Qs', '9h', '4d'], turn: '2c', river: '9d' },
      heroHand: ['Kc', 'Kd'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 22.7,
      effectiveStack: 88.9,
      street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 6.45 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 6.5, size: 7.5 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 6.0, size: 17.0 },
        ],
        bestAction: 'bet33',
        logicTags: ['THIN_VALUE', 'BLOCK_BET'],
        explanation: 'The 9 pairing is good for your overpair — fewer 9x combos remain, and Qx must still pay off. But Qx won\'t call big on a paired board, so size down: the 33% bet gets called by every queen and some pocket pairs. Thin value is found with small bets, not brave ones.',
      },
    },
    {
      id: 'river-5',
      context: RIVER_CONTEXT,
      board: { flop: ['Kc', '9c', '5d'], turn: '4c', river: '8s' },
      heroHand: ['Ac', 'Jd'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 22.7,
      effectiveStack: 88.9,
      street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 1.07 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: 0.4, size: 7.5 },
          { action: 'bet75', label: 'Bet 75%', frequency: 50, ev: 1.1, size: 17.0 },
        ],
        bestAction: 'bet75',
        logicTags: ['BLOCKER_BLUFF', 'BLUFF_CANDIDATE'],
        explanation: 'You barreled the flush turn holding the Ac and bricked — but the blocker still does its job on the river: BB can never hold the nut flush, so their check-calls are weak flushes and one-pair hands under maximum pressure. A-high occasionally wins at showdown, which is why checking mixes in equally.',
      },
    },
    {
      id: 'river-6',
      context: RIVER_CONTEXT,
      board: { flop: ['As', '8h', '3c'], turn: 'Kd', river: '2s' },
      heroHand: ['7d', '6d'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 22.7,
      effectiveStack: 88.9,
      street: 'river',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 0 },
          { action: 'bet33', label: 'Bet 33%', frequency: 0, ev: -0.6, size: 7.5 },
          { action: 'bet75', label: 'Bet 75%', frequency: 25, ev: 0, size: 17.0 },
        ],
        bestAction: 'check',
        logicTags: ['GIVE_UP', 'BLUFF_CANDIDATE'],
        explanation: 'Seven-high can only win by betting, and at equilibrium river bluffs are exactly break-even — villain defends just enough to make you indifferent. So why mostly check? Your bluffing slots are limited, and the solver fills them with hands that block villain\'s calling range. 76 blocks nothing relevant on A-8-3-K-2, so it mostly gives up — and that\'s fine. Knowing which missed hands DON\'T need to bluff is a skill too.',
      },
    },
  ],

  'tricky-textures': [
    {
      id: 'tex-1',
      context: SRP_CONTEXT,
      board: { flop: ['Th', '7h', '3h'], turn: null, river: null },
      heroHand: ['Ad', 'Ah'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 3.35 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 3.4, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 2.9, size: 4.1 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'BOARD_COVERAGE'],
        explanation: 'Overpair plus the nut flush draw — the dream holding on a monotone board. Small is still the right size: monotone boards favor small bets across your whole range because made flushes are already in BB\'s range and big bets only get action from them. With the Ah, you have the nut redraw even when called by a flush.',
      },
    },
    {
      id: 'tex-2',
      context: SRP_CONTEXT,
      board: { flop: ['Th', '7h', '3h'], turn: null, river: null },
      heroHand: ['Ks', 'Kc'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 1.55 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 1.6, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 0.9, size: 4.1 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'WAY_AHEAD_WAY_BEHIND'],
        explanation: 'KK with no heart is a bluff-catcher dressed as an overpair. Any heart among BB\'s ~20% flush combos has you drawing nearly dead, and a fourth heart kills your action either way. Check back, keep the pot small, and re-evaluate turns. The naked overpair and the overpair with a redraw are different hands — play them differently.',
      },
    },
    {
      id: 'tex-3',
      context: SRP_CONTEXT,
      board: { flop: ['Th', '7h', '3h'], turn: null, river: null },
      heroHand: ['Qh', 'Jh'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 0, ev: 4.1 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 4.6, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 50, ev: 4.58, size: 4.1 },
        ],
        bestAction: 'bet33',
        logicTags: ['NUT_ADVANTAGE', 'EQUITY_DENIAL'],
        explanation: 'A flopped queen-high flush is a strong made hand that hates free cards — a fourth heart frees BB to fold everything worse, and the Ah or Kh turn can even beat you. Bet now while worse flushes, sets, and big hearts pay. Slow-playing medium flushes on monotone boards is a classic EV leak.',
      },
    },
    {
      id: 'tex-4',
      context: SRP_CONTEXT,
      board: { flop: ['9s', '9h', '4c'], turn: null, river: null },
      heroHand: ['Ac', 'Kc'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 25, ev: 0.87 },
          { action: 'bet33', label: 'Bet 33%', frequency: 75, ev: 0.9, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 0.5, size: 4.1 },
        ],
        bestAction: 'bet33',
        logicTags: ['RANGE_ADVANTAGE', 'EQUITY_DENIAL'],
        explanation: 'Paired boards are range-bet city: BB rarely has a 9, and your overcards play great against their float-or-fold range. The tiny bet folds out QJ/JT/87 immediately and wins the pot outright a huge percentage of the time. Trips are so rare that big sizes have nothing to target — keep it small and relentless.',
      },
    },
    {
      id: 'tex-5',
      context: SRP_CONTEXT,
      board: { flop: ['8c', '7c', '6s'], turn: null, river: null },
      heroHand: ['As', 'Ad'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 50, ev: 2.08 },
          { action: 'bet33', label: 'Bet 33%', frequency: 50, ev: 2.1, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 1.7, size: 4.1 },
        ],
        bestAction: 'bet33',
        logicTags: ['POT_CONTROL', 'WAY_AHEAD_WAY_BEHIND'],
        explanation: 'Aces on 876 two-tone — strong in a vacuum, fragile in practice. BB\'s range is loaded with straights (T9, 54), two pairs, and massive combo draws, and nearly every turn card is bad for you. Mix small bets with checks and keep the pot medium. Overpairs that auto-pot connected boards are the ones that stack off drawing thin.',
      },
    },
    {
      id: 'tex-6',
      context: SRP_CONTEXT,
      board: { flop: ['Kd', 'Qd', 'Jd'], turn: null, river: null },
      heroHand: ['Ah', 'Kh'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      potSize: 5.5,
      effectiveStack: 97.5,
      street: 'flop',
      gtoStrategy: {
        actions: [
          { action: 'check', frequency: 75, ev: 2.36 },
          { action: 'bet33', label: 'Bet 33%', frequency: 25, ev: 2.4, size: 1.8 },
          { action: 'bet75', label: 'Bet 75%', frequency: 0, ev: 1.9, size: 4.1 },
        ],
        bestAction: 'check',
        logicTags: ['POT_CONTROL', 'WAY_AHEAD_WAY_BEHIND'],
        explanation: 'Top pair top kicker plus a royal gutshot sounds huge — but with no diamond, you\'re behind every flush, and the Ten that completes your broadway straight completes plenty of theirs. KQJ monotone is a "smallest pot possible" board for non-diamond hands. Check, bluff-catch, and let the Ad/Td turns make your decisions for you.',
      },
    },
  ],
};

// ── Grading ──
// At equilibrium, every action played at positive frequency has equal EV.
// So the grade is frequency-first: picking any action the solver actually
// uses is correct; picking a zero-frequency action loses EV, and the size
// of that loss separates an inaccuracy from a blunder.

export const GRADES = {
  perfect: { label: 'Perfect', grade: 'perfect', color: '#22c55e', points: 100 },
  good: { label: 'Good', grade: 'good', color: '#3b82f6', points: 60 },
  inaccuracy: { label: 'Inaccuracy', grade: 'inaccuracy', color: '#f59e0b', points: 20 },
  blunder: { label: 'Blunder', grade: 'blunder', color: '#ef4444', points: 0 },
};

export function gradeAction(strategy, actionId) {
  const actions = strategy.actions;
  const bestEV = Math.max(...actions.map(a => a.ev));
  const chosen = actions.find(a => a.action === actionId);
  const chosenEV = chosen ? chosen.ev : 0;
  const frequency = chosen ? chosen.frequency : 0;
  const evLoss = Math.round(Math.max(0, bestEV - chosenEV) * 100) / 100;

  let grade;
  if (frequency >= 50) grade = GRADES.perfect;
  else if (frequency >= 25) grade = GRADES.good;
  else if (evLoss <= 0.6) grade = GRADES.inaccuracy;
  else grade = GRADES.blunder;

  return { ...grade, evLoss, frequency, chosenEV, bestEV };
}

// Round frequency to nearest 25%
export function simplifyFrequency(freq) {
  return Math.round(freq / 25) * 25;
}

// ── Session scoring ──

export function streakMultiplier(streak) {
  // +10% per consecutive correct play, capped at 2x
  return Math.min(2, 1 + streak * 0.1);
}

export function letterGrade(accuracy) {
  if (accuracy >= 95) return { letter: 'S', color: '#fbbf24', blurb: 'Solver-level. Frightening.' };
  if (accuracy >= 85) return { letter: 'A', color: '#22c55e', blurb: 'Crushing. The pool should fear you.' };
  if (accuracy >= 70) return { letter: 'B', color: '#3b82f6', blurb: 'Solid. A few leaks to patch.' };
  if (accuracy >= 55) return { letter: 'C', color: '#f59e0b', blurb: 'Getting there. Review the blunders.' };
  if (accuracy >= 40) return { letter: 'D', color: '#fb923c', blurb: 'Rough session. Run it back.' };
  return { letter: 'F', color: '#ef4444', blurb: 'The fish at the table was you.' };
}

// ── Persistence ──

const STORAGE_KEY = 'poker-genie-stats-v1';

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { totalXP: 0, bestStreak: 0, drills: {} };
  } catch {
    return { totalXP: 0, bestStreak: 0, drills: {} };
  }
}

export function saveSessionResult(drillId, { score, accuracy, streak }) {
  const progress = loadProgress();
  const prev = progress.drills[drillId] || { bestScore: 0, bestAccuracy: 0 };
  const newRecord = score > prev.bestScore;
  progress.drills[drillId] = {
    bestScore: Math.max(prev.bestScore, score),
    bestAccuracy: Math.max(prev.bestAccuracy, accuracy),
  };
  progress.totalXP += score;
  progress.bestStreak = Math.max(progress.bestStreak, streak);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage unavailable (private mode etc.) — session still works
  }
  return { progress, newRecord };
}

export function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
