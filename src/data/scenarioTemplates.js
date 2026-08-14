// Scenario templates encoding GTO strategy shapes.
// Each template defines a strategic skeleton — the generator randomizes concrete cards within constraints.
// difficultyBase 1-3 = easy (obvious best action), 4-6 = medium, 7-10 = hard (close EV decisions).

export const POSITION_MATCHUPS = {
  IP_VS_BB: { hero: 'BTN', villain: 'BB', label: 'IP vs BB' },
  CO_VS_BB: { hero: 'CO', villain: 'BB', label: 'CO vs BB' },
  BTN_VS_SB: { hero: 'BTN', villain: 'SB', label: 'BTN vs SB' },
  OOP_VS_IP: { hero: 'BB', villain: 'BTN', label: 'BB vs BTN' },
  SB_VS_BTN: { hero: 'SB', villain: 'BTN', label: 'SB vs BTN' },
  BB_VS_CO: { hero: 'BB', villain: 'CO', label: 'BB vs CO' },
};

export const SCENARIO_TEMPLATES = [

  // ════════════════════════════════════════════════════
  //  FLOP — IP VALUE BETTING
  // ════════════════════════════════════════════════════

  {
    id: 'ip-tptk-dry-flop',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 1,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 0], evOffset: [-0.8, -0.4] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [75, 100], evOffset: [0, 0.3], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.3, 0], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_ADVANTAGE', 'NUT_ADVANTAGE', 'THIN_VALUE'],
    explanationTemplate: '{hand} on {board} is a premium top pair. Small c-bet is preferred to keep villain\'s calling range wide while building the pot.',
    modifiers: [
      { condition: 'hasBackdoorFlushDraw', freqAdjust: { bet33: 0 }, evAdjust: { bet33: 0.05 } },
    ],
  },
  {
    id: 'ip-overpair-dry-flop',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-low',
    handCategoryType: 'overpair',
    difficultyBase: 1,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 0], evOffset: [-0.6, -0.3] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [75, 100], evOffset: [0, 0.2], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.2, 0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_ADVANTAGE', 'NUT_ADVANTAGE', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} is an overpair on {board}. We have a clear value hand that should bet for protection and value. Small sizing is efficient on dry textures.',
    modifiers: [],
  },
  {
    id: 'ip-set-dry-flop',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'set',
    difficultyBase: 2,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.3, 0], sizeMultiplier: 0 },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [0, 0.2], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [-0.1, 0.2], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'BOARD_COVERAGE'],
    explanationTemplate: '{hand} flopped a set on {board}. With a monster hand on a dry board, we can mix between trapping and building the pot. All actions are close in EV.',
    modifiers: [],
  },
  {
    id: 'ip-tptk-wet-flop',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 3,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 0], evOffset: [-1.0, -0.5] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.2, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [50, 75], evOffset: [0, 0.3], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['EQUITY_DENIAL', 'DRAW_HEAVY', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} on {board} needs to protect against draws. Larger sizing is preferred on wet boards to deny equity and charge draws.',
    modifiers: [
      { condition: 'boardHasFlushDraw', freqAdjust: { bet75: 10 }, evAdjust: { bet75: 0.1 } },
    ],
  },
  {
    id: 'ip-twopair-wet-flop',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'two-pair',
    difficultyBase: 3,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.4, -0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.2, 0], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [50, 75], evOffset: [0, 0.3], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'EQUITY_DENIAL', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} flopped two pair on {board}. Strong hand but vulnerable to draws. Bet large to deny equity and build a big pot.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  FLOP — IP BLUFFING
  // ════════════════════════════════════════════════════

  {
    id: 'ip-air-dry-flop',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'air',
    difficultyBase: 2,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.8, -0.4], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'RANGE_ADVANTAGE', 'BOARD_COVERAGE'],
    explanationTemplate: '{hand} missed the {board} completely. On a dry board, checking back is usually best — our hand has some showdown value or can improve. Small c-bet is an option as a range bet.',
    modifiers: [
      { condition: 'hasBackdoorFlushDraw', freqAdjust: { bet33: 10 }, evAdjust: { bet33: 0.1 } },
    ],
  },
  {
    id: 'ip-flushdraw-wet-flop',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'flush-draw',
    difficultyBase: 3,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.3, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.2], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.2, 0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'DRAW_HEAVY', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} has a flush draw on {board}. Semi-bluffing is a good option — we have strong equity when called and fold equity when betting.',
    modifiers: [],
  },
  {
    id: 'ip-gutshot-dry-flop',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'gutshot',
    difficultyBase: 4,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.6, -0.3], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'POT_CONTROL'],
    explanationTemplate: '{hand} has a gutshot on {board}. Mixed between checking (to realize equity cheaply) and small c-betting (as a range bet with some back-door potential).',
    modifiers: [],
  },
  {
    id: 'ip-overcards-dry-flop',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-low',
    handCategoryType: 'overcards',
    difficultyBase: 3,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [50, 75], evOffset: [0, 0.2], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.5, -0.2], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_ADVANTAGE', 'EQUITY_DENIAL', 'BOARD_COVERAGE'],
    explanationTemplate: '{hand} has overcards on {board}. On a low board, BTN has a significant range advantage. Small c-bet denies equity and leverages positional advantage.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  FLOP — OOP PLAY
  // ════════════════════════════════════════════════════

  {
    id: 'oop-tptk-dry-flop',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 4,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.5, -0.2], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
    explanationTemplate: '{hand} on {board} from OOP. Despite having top pair, BB has a range disadvantage on high boards. Checking to the raiser is standard — we can check-call or check-raise.',
    modifiers: [],
  },
  {
    id: 'oop-set-check-raise',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'set',
    difficultyBase: 3,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [75, 100], evOffset: [0, 0.2] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.5, -0.2], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['CHECK_RAISE_CANDIDATE', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} flopped a set on {board} from OOP. Checking is optimal to trap — we expect IP to c-bet frequently, setting up a profitable check-raise.',
    modifiers: [],
  },
  {
    id: 'oop-flushdraw-wet',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'wet',
    handCategoryType: 'flush-draw',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.4, -0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['DRAW_HEAVY', 'CHECK_RAISE_CANDIDATE', 'BLUFF_CANDIDATE'],
    explanationTemplate: '{hand} has a flush draw on {board} from OOP. Checking is preferred to set up a check-raise semi-bluff. Donking small is occasionally mixed in.',
    modifiers: [],
  },
  {
    id: 'oop-air-low-board',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-low',
    handCategoryType: 'air',
    difficultyBase: 2,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.4, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.8, -0.4], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL'],
    explanationTemplate: '{hand} on {board} from OOP with nothing. Clear check — donking with air from OOP is a leak. Wait to see what IP does.',
    modifiers: [],
  },
  {
    id: 'oop-middlepair-dry',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'middle-pair',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [75, 100], evOffset: [0, 0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.6, -0.3], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
    explanationTemplate: '{hand} has middle pair on {board} from OOP. Check to control the pot — our hand has showdown value but can\'t stand heavy action.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  FLOP — MONOTONE BOARDS
  // ════════════════════════════════════════════════════

  {
    id: 'ip-tptk-monotone',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'monotone',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.4, -0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} on {board} (monotone). Top pair without a flush draw should play cautiously. Checking is often preferred — many turns will be scary and BB has lots of flushes.',
    modifiers: [],
  },
  {
    id: 'ip-nutflush-draw-monotone',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'monotone',
    handCategoryType: 'flush-draw',
    difficultyBase: 4,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [50, 75], evOffset: [0, 0.2], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.2, 0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'DRAW_HEAVY', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} has a nut flush draw on {board}. Semi-bluffing with the nut flush draw is strong — we have excellent equity and can build the pot for when we hit.',
    modifiers: [],
  },
  {
    id: 'ip-air-monotone',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'monotone',
    handCategoryType: 'air',
    difficultyBase: 2,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.4, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.8, -0.4], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} on {board} (monotone) with no flush draw. Give up — betting without a draw on a monotone board is pure spew.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  FLOP — PAIRED BOARDS
  // ════════════════════════════════════════════════════

  {
    id: 'ip-overcards-paired',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'paired',
    handCategoryType: 'overcards',
    difficultyBase: 4,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [50, 75], evOffset: [0, 0.2], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.3, -0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BOARD_PAIR', 'RANGE_ADVANTAGE', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} with overcards on {board} (paired). Paired boards reduce strong hand combos. Small c-bet leverages range advantage since BB has fewer trips.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  TURN — BARRELING
  // ════════════════════════════════════════════════════

  {
    id: 'ip-tptk-turn-barrel',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 3,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.5, -0.2] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [50, 75], evOffset: [0, 0.3], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'RANGE_ADVANTAGE'],
    explanationTemplate: '{hand} on {board} — second barrel. Top pair should continue for value on the turn. Sizing up on the turn is standard to build the pot.',
    modifiers: [
      { condition: 'turnCompletesDraws', freqAdjust: { check: 15, bet75: -10 }, evAdjust: { check: 0.1 } },
    ],
  },
  {
    id: 'ip-overpair-turn-barrel',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-low',
    handCategoryType: 'overpair',
    difficultyBase: 2,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 0], evOffset: [-0.6, -0.3] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [50, 75], evOffset: [0, 0.3], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'EQUITY_DENIAL', 'THIN_VALUE'],
    explanationTemplate: '{hand} overpair on {board} — clear value barrel. Continue betting to deny equity to draws and extract value from weaker pairs.',
    modifiers: [],
  },
  {
    id: 'ip-flushdraw-turn-semibluff',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'flush-draw',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [-0.1, 0.2], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'DRAW_HEAVY', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} still drawing on {board}. Turn semi-bluff is viable — we have one card to come and can fold out better hands. Checking is also reasonable to see a free river.',
    modifiers: [],
  },
  {
    id: 'ip-air-turn-giveup',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'air',
    difficultyBase: 3,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.7, -0.3], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'BLUFF_CANDIDATE'],
    explanationTemplate: '{hand} on {board} with nothing on the turn. Time to give up — double-barreling air without blockers or draws is burning money.',
    modifiers: [
      { condition: 'hasBlocker', freqAdjust: { bet33: 10 }, evAdjust: { bet33: 0.1 } },
    ],
  },
  {
    id: 'ip-middlepair-turn-check',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'middle-pair',
    difficultyBase: 4,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [75, 100], evOffset: [0, 0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.5, -0.2], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE'],
    explanationTemplate: '{hand} middle pair on {board}. Our hand has showdown value but can\'t withstand a raise. Check to control the pot and get to showdown cheaply.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  TURN — OOP
  // ════════════════════════════════════════════════════

  {
    id: 'oop-tptk-turn-check',
    street: 'turn',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.3, -0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
    explanationTemplate: '{hand} on {board} from OOP on the turn. Check-calling is usually best — leading out inflates the pot in a spot where IP has the range advantage.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  RIVER — VALUE BETS
  // ════════════════════════════════════════════════════

  {
    id: 'ip-tptk-river-value',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 4,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [0, 0.2], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} on {board} on the river. Thin value bet — we beat most of villain\'s check-call range. Larger sizing extracts more from second pair and worse.',
    modifiers: [],
  },
  {
    id: 'ip-overpair-river-value',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-low',
    handCategoryType: 'overpair',
    difficultyBase: 3,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.3, -0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [50, 75], evOffset: [0, 0.3], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} overpair on {board} on the river. Clear value bet — we beat all pairs and most of villain\'s range. Size up to extract maximum value.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  RIVER — BLUFFS
  // ════════════════════════════════════════════════════

  {
    id: 'ip-misseddraw-river-bluff',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'air',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [0, 0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} missed all draws on {board}. River bluff is the only way to win the pot. Large sizing is preferred to maximize fold equity. Having blockers to villain\'s value hands is key.',
    modifiers: [
      { condition: 'hasBlocker', freqAdjust: { bet75: 15 }, evAdjust: { bet75: 0.15 } },
    ],
  },
  {
    id: 'ip-air-river-giveup',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'air',
    difficultyBase: 3,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.6, -0.3], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL'],
    explanationTemplate: '{hand} on {board} on the river with nothing. No draws to represent, no blockers — checking is the clear play. Not every hand needs to bluff.',
    modifiers: [],
  },
  {
    id: 'ip-blockerbluff-river',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'air',
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.1, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 0], evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [50, 75], evOffset: [0, 0.15], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLOCKER_EFFECT', 'BLUFF_CANDIDATE'],
    explanationTemplate: '{hand} on {board} — blocker bluff. Our hand blocks key value combos in villain\'s range, making a large river bluff profitable. The blocker effect is crucial here.',
    modifiers: [
      { condition: 'hasBlocker', freqAdjust: { bet75: 10 }, evAdjust: { bet75: 0.1 } },
    ],
  },

  // ════════════════════════════════════════════════════
  //  RIVER — OOP
  // ════════════════════════════════════════════════════

  {
    id: 'oop-tptk-river-check',
    street: 'river',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.3, -0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE', 'BLOCK_BET'],
    explanationTemplate: '{hand} on {board} from OOP on the river. Mixed between checking (to induce bluffs) and small blocking bets (to set your own price). Avoid large bets — they only get called by better.',
    modifiers: [],
  },
  {
    id: 'oop-monster-river-value',
    street: 'river',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'set',
    difficultyBase: 4,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [50, 75], evOffset: [0, 0.3], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'THIN_VALUE'],
    explanationTemplate: '{hand} on {board} — monster hand on the river from OOP. Lead out for value — we need to get paid. Large sizing maximizes EV against villain\'s calling range.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  MIXED FREQUENCY / HARD SPOTS (difficulty 6-10)
  // ════════════════════════════════════════════════════

  {
    id: 'ip-weaktp-dry-mixed',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'weak-top-pair',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.1, 0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.05, 0.1] },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.2, -0.05], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE', 'BOARD_COVERAGE'],
    explanationTemplate: '{hand} weak top pair on {board}. Close spot — our hand is strong enough to value bet but vulnerable enough that checking for pot control is reasonable. Mixed frequency is correct.',
    modifiers: [],
  },
  {
    id: 'ip-marginal-turn-mixed',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'marginal',
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.05, 0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.05, 0.05], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.15, 0], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} on {board} — genuinely tough spot. All options are close in EV. Consider board texture and opponent tendencies. This is what mixed strategies are for.',
    modifiers: [],
  },
  {
    id: 'ip-thinvalue-river-mixed',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'marginal',
    difficultyBase: 8,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.05, 0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.05, 0.05], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.1, 0], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'BLOCKER_EFFECT', 'BLOCK_BET'],
    explanationTemplate: '{hand} on {board} — razor thin value. Betting small extracts thin value but risks a check-raise. Checking is safe but may miss value. A true solver split.',
    modifiers: [],
  },
  {
    id: 'oop-checkraise-or-call-mixed',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'wet',
    handCategoryType: 'two-pair',
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.05, 0.05], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.1, 0.05], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['CHECK_RAISE_CANDIDATE', 'NUT_ADVANTAGE', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} two pair on {board} from OOP on a wet board. Check to set up a check-raise is strong, but leading into IP is also viable to deny equity. Close decision.',
    modifiers: [],
  },
  {
    id: 'ip-bluffcatch-river-mixed',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'marginal',
    difficultyBase: 8,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.1, 0], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.1, 0], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} on {board} — marginal showdown hand on the river. Checking to bluff-catch is often best. Betting turns our hand into a bluff, which is only right with specific blockers.',
    modifiers: [
      { condition: 'hasBlocker', freqAdjust: { bet75: 10 }, evAdjust: { bet75: 0.1 } },
    ],
  },

  // ════════════════════════════════════════════════════
  //  EXTREME DIFFICULTY (9-10) — BOSS-TIER SPOTS
  // ════════════════════════════════════════════════════

  {
    id: 'boss-river-polarize',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'air',
    difficultyBase: 9,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.03, 0.03] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 0], evOffset: [-0.2, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [50, 75], evOffset: [-0.03, 0.03], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} on {board} — high-level river decision. With the right blockers, a large polarized bluff is correct. Without them, checking is better. The EV difference is razor thin.',
    modifiers: [
      { condition: 'hasBlocker', freqAdjust: { bet75: 10 }, evAdjust: { bet75: 0.05 } },
    ],
  },
  {
    id: 'boss-turn-marginal-barrel',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'marginal',
    difficultyBase: 9,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.02, 0.02] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.05, 0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'POT_CONTROL', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} on {board} — solver nightmare. The EV of checking and betting small are nearly identical. Your decision depends on subtle factors like blocker effects and opponent tendencies.',
    modifiers: [],
  },
  {
    id: 'boss-oop-trap-or-lead',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'wet',
    handCategoryType: 'set',
    difficultyBase: 9,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.02, 0.02] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.05, 0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['CHECK_RAISE_CANDIDATE', 'NUT_ADVANTAGE', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} set on {board} from OOP on a draw-heavy board. Trap via check-raise or lead to protect? Both lines have merit and the EV is nearly identical. True high-level decision.',
    modifiers: [],
  },
  {
    id: 'boss-river-block-or-check',
    street: 'river',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'marginal',
    difficultyBase: 10,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.02, 0.02] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.05, 0], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLOCK_BET', 'THIN_VALUE', 'BLOCKER_EFFECT', 'POT_CONTROL'],
    explanationTemplate: '{hand} on {board} from OOP on the river. Block bet to deny a larger IP bet, or check to induce bluffs? The solver is nearly indifferent. This is the hardest spot in poker.',
    modifiers: [],
  },
  {
    id: 'boss-3bet-pot-oop',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 10,
    potType: '3BET',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [-0.02, 0.02] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.2, -0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
    explanationTemplate: '{hand} in a 3-bet pot from OOP on {board}. Ranges are narrower in 3-bet pots, making decisions more polarized. Checking vs small lead is incredibly close.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  3-BET POTS
  // ════════════════════════════════════════════════════

  {
    id: '3bet-ip-overpair',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-low',
    handCategoryType: 'overpair',
    difficultyBase: 3,
    potType: '3BET',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.4, -0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [75, 100], evOffset: [0, 0.3], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.2, 0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'RANGE_ADVANTAGE', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} overpair in a 3-bet pot on {board}. In 3-bet pots, ranges are stronger and SPR is lower. Small c-bet to build the pot toward a shove.',
    modifiers: [],
  },
  {
    id: '3bet-ip-air',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'air',
    difficultyBase: 5,
    potType: '3BET',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.05], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.5, -0.2], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'RANGE_ADVANTAGE'],
    explanationTemplate: '{hand} air in a 3-bet pot on {board}. In 3-bet pots, c-betting air is riskier since opponent\'s range is stronger. Check back to realize equity or small bet as a range play.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  SB VS BTN
  // ════════════════════════════════════════════════════

  {
    id: 'sb-tptk-dry',
    street: 'flop',
    position: 'SB_VS_BTN',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.4, -0.1], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL', 'POSITIONAL_ADVANTAGE'],
    explanationTemplate: '{hand} from SB on {board}. SB has the worst position and a range disadvantage vs BTN. Checking is standard — use a check-raise strategy with strong hands.',
    modifiers: [],
  },
  {
    id: 'sb-air-dry',
    street: 'flop',
    position: 'SB_VS_BTN',
    boardTextureType: 'dry-low',
    handCategoryType: 'air',
    difficultyBase: 3,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.6, -0.3], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL'],
    explanationTemplate: '{hand} from SB on {board} with nothing. Check and fold to aggression. SB is the worst position to bluff from without a range advantage.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  FACING A BET — fold / call / raise
  // ════════════════════════════════════════════════════
  //
  //  Every template above this line is a betting decision: the hero always
  //  acts first into a checked pot. That is at most half of NLHE, and it is
  //  the easier half. These put the hero in against a bet, where the recurring
  //  and expensive mistakes actually live — calling too wide, folding too much
  //  to a second barrel, never raising a draw.
  //
  //  `facingBetSize` is villain's bet as a fraction of the pot.

  {
    id: 'def-flop-value-raise',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'wet',
    handCategoryType: 'two-pair',
    difficultyBase: 3,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.5,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [0, 0], evOffset: [-1.0, -0.6] },
        { action: 'call', label: 'Call', freqRange: [25, 50], evOffset: [0, 0.2] },
        { action: 'raise', label: 'Raise 3x', freqRange: [50, 75], evOffset: [0.1, 0.4], sizeMultiplier: 1.6 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'EQUITY_DENIAL', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} has two pair on {board} facing a bet. On a wet board this hand is strong but very beatable by the turn — raise now, while there are draws willing to pay. Calling lets a free card in that can cost the whole pot.',
    modifiers: [],
  },
  {
    id: 'def-flop-set-slowplay',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'set',
    difficultyBase: 5,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.33,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [0, 0], evOffset: [-1.4, -1.0] },
        { action: 'call', label: 'Call', freqRange: [50, 75], evOffset: [0.1, 0.3] },
        { action: 'raise', label: 'Raise 3x', freqRange: [25, 50], evOffset: [0, 0.2], sizeMultiplier: 1.6 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'CHECK_RAISE_CANDIDATE', 'POT_CONTROL'],
    explanationTemplate: '{hand} flopped a set on {board}. A dry board gives villain few hands that can continue against a raise, so calling keeps their bluffs in and their range wide. This is the one texture where slow-playing a monster is genuinely correct.',
    modifiers: [],
  },
  {
    id: 'def-flop-flushdraw',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'wet',
    handCategoryType: 'flush-draw',
    difficultyBase: 4,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.5,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [0, 0], evOffset: [-0.7, -0.4] },
        { action: 'call', label: 'Call', freqRange: [50, 75], evOffset: [0, 0.2] },
        { action: 'raise', label: 'Raise 3x', freqRange: [25, 50], evOffset: [-0.1, 0.2], sizeMultiplier: 1.6 },
      ],
    },
    logicTagPool: ['DRAW_HEAVY', 'BLUFF_CANDIDATE', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} has a flush draw on {board} facing half pot. You need roughly 25% to call and the draw alone is about 35% by the river, so folding is never right. Mixing in raises turns the draw into a hand that can win without improving.',
    modifiers: [],
  },
  {
    id: 'def-flop-gutshot-fold',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'gutshot',
    difficultyBase: 5,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.75,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [50, 75], evOffset: [0, 0.05] },
        { action: 'call', label: 'Call', freqRange: [25, 50], evOffset: [-0.1, 0.05] },
        { action: 'raise', label: 'Raise 3x', freqRange: [0, 0], evOffset: [-0.6, -0.3], sizeMultiplier: 1.6 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
    explanationTemplate: '{hand} has a gutshot on {board} facing three-quarter pot. Four outs is about 16% by the river and the price demands 30%. Without backdoor equity or position this is a fold, and folding it is not weak — it is the whole discipline.',
    modifiers: [
      { condition: 'hasBackdoorFlushDraw', freqAdjust: { call: 25, fold: -25 } },
    ],
  },
  {
    id: 'def-flop-air-fold',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'air',
    difficultyBase: 2,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.5,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'call', label: 'Call', freqRange: [0, 25], evOffset: [-0.4, -0.2] },
        { action: 'raise', label: 'Raise 3x', freqRange: [0, 0], evOffset: [-0.8, -0.5], sizeMultiplier: 1.6 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL'],
    explanationTemplate: '{hand} has nothing on {board} and no draw to speak of. Out of position with no equity, there is no line that makes money. Fold and keep the chips for a spot where you have something.',
    modifiers: [],
  },
  {
    id: 'def-flop-middlepair-call',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'middle-pair',
    difficultyBase: 6,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.33,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [0, 25], evOffset: [-0.3, -0.1] },
        { action: 'call', label: 'Call', freqRange: [75, 100], evOffset: [0, 0.1] },
        { action: 'raise', label: 'Raise 3x', freqRange: [0, 0], evOffset: [-0.7, -0.4], sizeMultiplier: 1.6 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE'],
    explanationTemplate: '{hand} has middle pair on {board} against a small bet. Getting 4-to-1 you only need to be good about 20% of the time, and a small c-bet range is full of air. Call — but plan to fold if the pressure keeps coming.',
    modifiers: [],
  },
  {
    id: 'def-turn-value-raise',
    street: 'turn',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 6,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.66,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [0, 0], evOffset: [-1.2, -0.8] },
        { action: 'call', label: 'Call', freqRange: [50, 75], evOffset: [0, 0.2] },
        { action: 'raise', label: 'Raise', freqRange: [25, 50], evOffset: [-0.1, 0.2], sizeMultiplier: 2.2 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'POT_CONTROL', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} is top pair top kicker on {board} facing a second barrel. Strong enough to call down comfortably; raising is a real option against opponents who barrel too often, but it folds out everything you beat.',
    modifiers: [],
  },
  {
    id: 'def-turn-draw-price',
    street: 'turn',
    position: 'OOP_VS_IP',
    boardTextureType: 'wet',
    handCategoryType: 'flush-draw',
    difficultyBase: 6,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.75,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [25, 50], evOffset: [-0.1, 0.05] },
        { action: 'call', label: 'Call', freqRange: [50, 75], evOffset: [0, 0.15] },
        { action: 'raise', label: 'Raise', freqRange: [0, 25], evOffset: [-0.3, 0], sizeMultiplier: 2.2 },
      ],
    },
    logicTagPool: ['DRAW_HEAVY', 'BLUFF_CANDIDATE'],
    explanationTemplate: '{hand} still has the flush draw on {board}, but with one card to come it is about 19%, not 35%. Three-quarter pot asks for 30%. This is where flop-and-turn draws quietly stop being calls unless the implied odds are real.',
    modifiers: [],
  },
  {
    id: 'def-turn-air-fold',
    street: 'turn',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'air',
    difficultyBase: 3,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.75,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'call', label: 'Call', freqRange: [0, 25], evOffset: [-0.6, -0.3] },
        { action: 'raise', label: 'Raise', freqRange: [0, 0], evOffset: [-1.0, -0.6], sizeMultiplier: 2.2 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL'],
    explanationTemplate: '{hand} is drawing dead-ish on {board} against a turn barrel. Two barrels out of position is a strong, narrow range. Fold.',
    modifiers: [],
  },
  {
    id: 'def-turn-bluffcatch',
    street: 'turn',
    position: 'OOP_VS_IP',
    boardTextureType: 'wet',
    handCategoryType: 'marginal',
    difficultyBase: 8,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.66,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [25, 50], evOffset: [-0.1, 0.05] },
        { action: 'call', label: 'Call', freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'raise', label: 'Raise', freqRange: [0, 0], evOffset: [-0.9, -0.5], sizeMultiplier: 2.2 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} is a bluff-catcher on {board}. You are not calling to win a big pot — you are calling to stop being run over. Two-thirds pot needs you good 29% of the time, which a wide barrelling range clears easily.',
    modifiers: [],
  },
  {
    id: 'def-river-value-raise',
    street: 'river',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'set',
    difficultyBase: 5,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.75,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [0, 0], evOffset: [-2.0, -1.5] },
        { action: 'call', label: 'Call', freqRange: [25, 50], evOffset: [0, 0.15] },
        { action: 'raise', label: 'Raise', freqRange: [50, 75], evOffset: [0.1, 0.4], sizeMultiplier: 2.5 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'THIN_VALUE'],
    explanationTemplate: '{hand} has a set on {board} facing a river bet. Just calling with a hand this strong is the most common leak there is. If they bet the river they have something — raise and get paid.',
    modifiers: [],
  },
  {
    id: 'def-river-bluffcatch-marginal',
    street: 'river',
    position: 'OOP_VS_IP',
    boardTextureType: 'wet',
    handCategoryType: 'marginal',
    difficultyBase: 9,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.75,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'call', label: 'Call', freqRange: [25, 50], evOffset: [-0.1, 0.05] },
        { action: 'raise', label: 'Raise', freqRange: [0, 0], evOffset: [-1.2, -0.8], sizeMultiplier: 2.5 },
      ],
    },
    logicTagPool: ['BLOCKER_EFFECT', 'POT_CONTROL'],
    explanationTemplate: '{hand} on {board} beats only bluffs. Three-quarter pot means you need to be right 30% of the time. Ask honestly how many missed draws they got here with — against most opponents the answer is not enough.',
    modifiers: [
      { condition: 'hasBlocker', freqAdjust: { call: 25, fold: -25 } },
    ],
  },
  {
    id: 'def-river-air-fold',
    street: 'river',
    position: 'OOP_VS_IP',
    boardTextureType: 'wet',
    handCategoryType: 'air',
    difficultyBase: 2,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 1.0,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [100, 100], evOffset: [0, 0] },
        { action: 'call', label: 'Call', freqRange: [0, 0], evOffset: [-1.0, -0.7] },
        { action: 'raise', label: 'Raise', freqRange: [0, 0], evOffset: [-1.4, -1.0], sizeMultiplier: 2.5 },
      ],
    },
    logicTagPool: ['POT_CONTROL'],
    explanationTemplate: '{hand} missed everything on {board} and cannot beat a bluff, because it cannot beat anything. There is no read that makes calling correct with zero showdown value. Fold.',
    modifiers: [],
  },
  {
    id: 'def-river-thin-call',
    street: 'river',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 7,
    potType: 'SRP',
    decisionMode: 'defend',
    facingBetSize: 0.5,
    strategyShape: {
      actions: [
        { action: 'fold', label: 'Fold', freqRange: [0, 0], evOffset: [-1.1, -0.7] },
        { action: 'call', label: 'Call', freqRange: [75, 100], evOffset: [0, 0.1] },
        { action: 'raise', label: 'Raise', freqRange: [0, 25], evOffset: [-0.4, -0.1], sizeMultiplier: 2.5 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'POT_CONTROL'],
    explanationTemplate: '{hand} is top pair on {board} facing half pot on the river. You need to be good 25% of the time and you beat every bluff plus some worse pairs. Call. Raising only gets called by hands that have you crushed.',
    modifiers: [],
  },
];

export function getTemplatesForDifficulty(minDiff, maxDiff) {
  return SCENARIO_TEMPLATES.filter(t =>
    t.difficultyBase >= minDiff && t.difficultyBase <= maxDiff
  );
}

export function getTemplateById(id) {
  return SCENARIO_TEMPLATES.find(t => t.id === id);
}
