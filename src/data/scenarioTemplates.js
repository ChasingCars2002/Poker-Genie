// Scenario templates encoding GTO strategy shapes.
// Every template has 4 actions: check, bet33, bet66, bet75.
// All spots are designed to be genuinely difficult — close EV decisions with mixed strategies.
// difficultyBase 4-6 = medium (close decisions), 7-10 = hard (razor thin, solver-level).

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
  //  FLOP — IP SPOTS (Mixed Strategies)
  // ════════════════════════════════════════════════════

  {
    id: 'ip-tptk-dry-sizing',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.15, -0.05] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [0, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [25, 50], evOffset: [-0.02, 0.08], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.08, 0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_ADVANTAGE', 'NUT_ADVANTAGE', 'THIN_VALUE'],
    explanationTemplate: '{hand} on {board} — strong top pair but sizing matters. Small bet keeps villain\'s range wide; larger sizing polarizes but can fold out worse. Close between 33% and 66%.',
    modifiers: [
      { condition: 'hasBackdoorFlushDraw', freqAdjust: { bet33: 5 }, evAdjust: { bet33: 0.02 } },
    ],
  },
  {
    id: 'ip-overpair-wet-sizing',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'overpair',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 0], evOffset: [-0.2, -0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.08, 0.02] },
        { action: 'bet66', label: 'Bet 66%', freqRange: [25, 50], evOffset: [0, 0.1], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [-0.02, 0.08], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['EQUITY_DENIAL', 'NUT_ADVANTAGE', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} overpair on {board} — wet boards demand larger sizing to deny equity from draws. 66% and 75% are both strong; 33% doesn\'t charge enough.',
    modifiers: [
      { condition: 'boardHasFlushDraw', freqAdjust: { bet75: 10 }, evAdjust: { bet75: 0.03 } },
    ],
  },
  {
    id: 'ip-set-dry-trap-or-bet',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'set',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.03, 0.03] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.03, 0.03], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.05, 0.02], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.06, 0.01], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'BOARD_COVERAGE', 'CHECK_RAISE_CANDIDATE'],
    explanationTemplate: '{hand} flopped a set on {board}. Monster hand on a dry board — trapping and betting small are nearly identical in EV. Check to induce or bet small to build the pot.',
    modifiers: [],
  },
  {
    id: 'ip-tptk-wet-protection',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 0], evOffset: [-0.2, -0.1] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.1, 0] },
        { action: 'bet66', label: 'Bet 66%', freqRange: [25, 50], evOffset: [-0.02, 0.06], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [0, 0.08], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['EQUITY_DENIAL', 'DRAW_HEAVY', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} on {board} — top pair needs to protect on draw-heavy texture. Larger sizings charge draws correctly. 33% is too cheap here.',
    modifiers: [
      { condition: 'boardHasFlushDraw', freqAdjust: { bet75: 5 }, evAdjust: { bet75: 0.02 } },
    ],
  },
  {
    id: 'ip-twopair-wet-sizing',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'two-pair',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.1, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.06, 0.02] },
        { action: 'bet66', label: 'Bet 66%', freqRange: [25, 50], evOffset: [-0.02, 0.05], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [0, 0.06], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'EQUITY_DENIAL', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} two pair on {board} — strong but vulnerable to draws. Large sizing denies equity but close between 66% and 75%. Board texture drives the decision.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  FLOP — IP BLUFFING (Sizing Selection)
  // ════════════════════════════════════════════════════

  {
    id: 'ip-flushdraw-wet-semibluff',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'flush-draw',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.04, 0.02] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.04], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.04, 0.02], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.05, 0.01], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'DRAW_HEAVY', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} flush draw on {board}. Semi-bluffing is viable but sizing is tricky — small bet risks less; check preserves equity realization. The EV of checking and betting small are very close.',
    modifiers: [],
  },
  {
    id: 'ip-gutshot-dry-bluff-or-give-up',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'gutshot',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.02, 0.04] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.04], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.06, 0], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.12, -0.05], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'POT_CONTROL', 'BOARD_COVERAGE'],
    explanationTemplate: '{hand} gutshot on {board}. Mixed spot — checking realizes equity cheaply while small c-bet leverages range advantage. Larger sizing overcommits with a marginal draw.',
    modifiers: [
      { condition: 'hasBackdoorFlushDraw', freqAdjust: { bet33: 10 }, evAdjust: { bet33: 0.02 } },
    ],
  },
  {
    id: 'ip-overcards-low-board',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-low',
    handCategoryType: 'overcards',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.06, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [50, 75], evOffset: [0, 0.06], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.04, 0.02], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.1, -0.04], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_ADVANTAGE', 'EQUITY_DENIAL', 'BOARD_COVERAGE'],
    explanationTemplate: '{hand} overcards on {board}. BTN has a massive range advantage on low boards. Small c-bet is preferred — 33% sizing achieves maximum fold equity per chip risked.',
    modifiers: [],
  },
  {
    id: 'ip-weaktp-dry-mixed',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'weak-top-pair',
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.02, 0.03] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.03], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.04, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.08, -0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE', 'BOARD_COVERAGE'],
    explanationTemplate: '{hand} weak top pair on {board}. Genuine mixed spot — our hand has value but is vulnerable. Checking for pot control and betting small for thin value are nearly identical in EV.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  FLOP — OOP DECISIONS
  // ════════════════════════════════════════════════════

  {
    id: 'oop-tptk-check-vs-lead',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.04] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.04], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 0], evOffset: [-0.1, -0.04] },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.15, -0.06], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
    explanationTemplate: '{hand} on {board} OOP. Despite top pair, BB has a range disadvantage on high cards. Checking is standard but donking small has merit as a blocker bet. Close decision.',
    modifiers: [],
  },
  {
    id: 'oop-set-trap-decision',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'set',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.04] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.04, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 0], evOffset: [-0.08, -0.02], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.04, 0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['CHECK_RAISE_CANDIDATE', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} set on {board} OOP. Trapping is highest EV — IP c-bets frequently, setting up a check-raise. Some overbet leads are mixed in for balance.',
    modifiers: [],
  },
  {
    id: 'oop-flushdraw-wet-checkraise',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'wet',
    handCategoryType: 'flush-draw',
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.03] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.03, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.04, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.08, -0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['DRAW_HEAVY', 'CHECK_RAISE_CANDIDATE', 'BLUFF_CANDIDATE'],
    explanationTemplate: '{hand} flush draw on {board} OOP. Checking to check-raise as a semi-bluff is strong. Donking small is occasionally mixed in. All options are close.',
    modifiers: [],
  },
  {
    id: 'oop-middlepair-pot-control',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'middle-pair',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [75, 100], evOffset: [0, 0.03] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.06, -0.01], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 0], evOffset: [-0.12, -0.05], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.15, -0.08], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
    explanationTemplate: '{hand} middle pair on {board} OOP. Clear check — our hand has showdown value but can\'t stand aggression. Donking bloats the pot against a stronger range.',
    modifiers: [],
  },
  {
    id: 'oop-twopair-wet-lead-or-trap',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'wet',
    handCategoryType: 'two-pair',
    difficultyBase: 8,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.02, 0.02] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.03, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.04, 0.01], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['CHECK_RAISE_CANDIDATE', 'NUT_ADVANTAGE', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} two pair on {board} OOP on a wet board. Check-raise is standard but leading to deny free cards is viable. Nearly indifferent — solver uses a true mixed strategy.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  FLOP — MONOTONE BOARDS
  // ════════════════════════════════════════════════════

  {
    id: 'ip-tptk-monotone-caution',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'monotone',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.03] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.03], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 0], evOffset: [-0.08, -0.02], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.1, -0.04], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} on {board} (monotone) without a flush draw. Top pair is marginal — BB has many made flushes and flush draws. Checking and betting small are close; larger sizes are -EV.',
    modifiers: [],
  },
  {
    id: 'ip-nutflushdraw-monotone',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'monotone',
    handCategoryType: 'flush-draw',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.06, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [50, 75], evOffset: [0, 0.06], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.03, 0.03], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.05, 0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'DRAW_HEAVY', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} nut flush draw on {board}. Semi-bluffing with the best draw is strong. Small sizing is preferred on monotone boards. Close between 33% and 66%.',
    modifiers: [],
  },
  {
    id: 'ip-overcards-paired',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'paired',
    handCategoryType: 'overcards',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.05, 0.01] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [50, 75], evOffset: [0, 0.05], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.04, 0.02], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.08, -0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BOARD_PAIR', 'RANGE_ADVANTAGE', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} overcards on {board} (paired). Paired boards reduce strong combos for both sides. Small c-bet leverages range advantage — BB rarely has trips.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  TURN — BARRELING DECISIONS
  // ════════════════════════════════════════════════════

  {
    id: 'ip-tptk-turn-sizing-decision',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.08, -0.02] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.04, 0.02] },
        { action: 'bet66', label: 'Bet 66%', freqRange: [25, 50], evOffset: [0, 0.06], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [-0.02, 0.05], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'RANGE_ADVANTAGE'],
    explanationTemplate: '{hand} on {board} — second barrel. Top pair should continue on the turn but sizing is key. 66% and 75% extract value from worse pairs without over-committing.',
    modifiers: [
      { condition: 'turnCompletesDraws', freqAdjust: { check: 15, bet75: -10 }, evAdjust: { check: 0.03 } },
    ],
  },
  {
    id: 'ip-overpair-turn-value',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-low',
    handCategoryType: 'overpair',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 0], evOffset: [-0.1, -0.04] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.04, 0.02] },
        { action: 'bet66', label: 'Bet 66%', freqRange: [25, 50], evOffset: [0, 0.06], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [-0.01, 0.05], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'EQUITY_DENIAL', 'THIN_VALUE'],
    explanationTemplate: '{hand} overpair on {board} turn. Clear bet for value — sizing decision between 66% and 75%. Both are strong; the turn card determines which is marginally better.',
    modifiers: [],
  },
  {
    id: 'ip-flushdraw-turn-semibluff',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'flush-draw',
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.02, 0.03] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.04, 0.01] },
        { action: 'bet66', label: 'Bet 66%', freqRange: [25, 50], evOffset: [-0.02, 0.03], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.03, 0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'DRAW_HEAVY', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} still drawing on {board}. Turn semi-bluff or check to see a free river? The EV of checking, medium bet, and large bet are all very close.',
    modifiers: [],
  },
  {
    id: 'ip-middlepair-turn-control',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'middle-pair',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.04] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.04, 0.01] },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 0], evOffset: [-0.1, -0.04], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.12, -0.05], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE'],
    explanationTemplate: '{hand} middle pair on {board} turn. Showdown value hand — check to control pot. Small bet is occasionally mixed for thin value but risks getting raised.',
    modifiers: [],
  },
  {
    id: 'ip-marginal-turn-close',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'marginal',
    difficultyBase: 8,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.01, 0.02] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.01, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.03, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.06, -0.01], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} on {board} — genuinely tough turn spot. Checking, small bet, and medium bet are all nearly identical in EV. Consider board texture and blocker effects.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  TURN — OOP
  // ════════════════════════════════════════════════════

  {
    id: 'oop-tptk-turn-lead-or-check',
    street: 'turn',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.03] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.03], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 0], evOffset: [-0.06, -0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.08, -0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'RANGE_DISADVANTAGE', 'BLOCK_BET'],
    explanationTemplate: '{hand} on {board} OOP on the turn. Check-calling is the standard line but block-betting (33%) has merit to set your own price. Close between check and small lead.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  RIVER — VALUE DECISIONS
  // ════════════════════════════════════════════════════

  {
    id: 'ip-tptk-river-thinvalue',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.04, 0.01] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.03], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [25, 50], evOffset: [-0.01, 0.03], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.04, 0.01], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} on {board} river. Thin value bet — villain\'s check-call range determines optimal sizing. 33% and 66% are close; 75% risks only getting called by better.',
    modifiers: [],
  },
  {
    id: 'ip-overpair-river-sizing',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-low',
    handCategoryType: 'overpair',
    difficultyBase: 5,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 0], evOffset: [-0.1, -0.04] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.04, 0.02] },
        { action: 'bet66', label: 'Bet 66%', freqRange: [25, 50], evOffset: [0, 0.06], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [-0.02, 0.05], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} overpair on {board} river. Clear value bet — 66% and 75% both extract well from pairs and missed draws. Sizing depends on villain\'s perceived calling range.',
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
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.01, 0.02] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 0], evOffset: [-0.08, -0.03], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.03, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [-0.01, 0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} missed all draws on {board}. River bluff or give up? If bluffing, size large (75%) to maximize fold equity. Small bluffs don\'t get enough folds. Checking is close.',
    modifiers: [
      { condition: 'hasBlocker', freqAdjust: { bet75: 10 }, evAdjust: { bet75: 0.03 } },
    ],
  },
  {
    id: 'ip-blockerbluff-river',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'air',
    difficultyBase: 9,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.01, 0.01] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 0], evOffset: [-0.06, -0.02], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.02, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [-0.01, 0.01], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLOCKER_EFFECT', 'BLUFF_CANDIDATE'],
    explanationTemplate: '{hand} on {board} — blocker bluff. Our hand blocks villain\'s value combos. Large bluff is marginally +EV but checking is nearly the same. Razor thin solver split.',
    modifiers: [
      { condition: 'hasBlocker', freqAdjust: { bet75: 5 }, evAdjust: { bet75: 0.02 } },
    ],
  },
  {
    id: 'ip-marginal-river-check-or-thinvalue',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'marginal',
    difficultyBase: 9,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.01, 0.01] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.01, 0.01], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.02, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.05, -0.01], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'BLOCKER_EFFECT', 'BLOCK_BET'],
    explanationTemplate: '{hand} on {board} river — razor thin. Small bet extracts from worse but risks a raise. Checking is safe. Solver uses a near-50/50 split. This is peak difficulty.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  RIVER — OOP
  // ════════════════════════════════════════════════════

  {
    id: 'oop-tptk-river-blockbet',
    street: 'river',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.02, 0.02] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.01, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.04, 0], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.08, -0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE', 'BLOCK_BET'],
    explanationTemplate: '{hand} on {board} OOP river. Block bet (33%) sets your own price and denies IP a large bet. Checking to induce bluffs is close in EV. Avoid large sizes OOP.',
    modifiers: [],
  },
  {
    id: 'oop-monster-river-lead',
    street: 'river',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'set',
    difficultyBase: 6,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.05, 0.01] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.03, 0.02] },
        { action: 'bet66', label: 'Bet 66%', freqRange: [25, 50], evOffset: [-0.01, 0.04], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [0, 0.04], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'THIN_VALUE'],
    explanationTemplate: '{hand} monster on {board} river OOP. Lead out for value — 66% and 75% both extract well. Checking risks IP checking back with a hand that would have called.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  BOSS-TIER SPOTS (difficulty 8-10)
  // ════════════════════════════════════════════════════

  {
    id: 'boss-river-polarize',
    street: 'river',
    position: 'IP_VS_BB',
    boardTextureType: 'wet',
    handCategoryType: 'air',
    difficultyBase: 10,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.01, 0.01] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 0], evOffset: [-0.05, -0.02], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.02, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [25, 50], evOffset: [-0.01, 0.01], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} on {board} — boss-level river. With blockers, a polarized 75% bluff is correct. Without them, give up. The EV gap between check and bet75 is under 0.1 BB.',
    modifiers: [
      { condition: 'hasBlocker', freqAdjust: { bet75: 5 }, evAdjust: { bet75: 0.01 } },
    ],
  },
  {
    id: 'boss-turn-marginal-barrel',
    street: 'turn',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'marginal',
    difficultyBase: 10,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [-0.01, 0.01] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.01, 0.01], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.02, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.04, -0.01], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'POT_CONTROL', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} on {board} — solver nightmare. Check, bet33, and bet66 are within 0.05 BB of each other. Pure mixed strategy. No clearly "correct" answer.',
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
        { action: 'check', freqRange: [25, 50], evOffset: [-0.01, 0.01] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.01, 0.01], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.02, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.02, 0.01], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['CHECK_RAISE_CANDIDATE', 'NUT_ADVANTAGE', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} set on {board} OOP wet. Trap via check-raise or lead to protect? Both are correct. Nearly indifferent — the wet texture makes leading more viable than on dry boards.',
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
        { action: 'check', freqRange: [25, 50], evOffset: [-0.01, 0.01] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.01, 0.01], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.02, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.04, -0.01], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLOCK_BET', 'THIN_VALUE', 'BLOCKER_EFFECT', 'POT_CONTROL'],
    explanationTemplate: '{hand} on {board} OOP river. Block bet to deny a larger IP bet, or check to induce bluffs? The solver is nearly indifferent. This is the hardest spot in poker.',
    modifiers: [],
  },
  {
    id: 'boss-3bet-pot-oop-tptk',
    street: 'flop',
    position: 'OOP_VS_IP',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 10,
    potType: '3BET',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [-0.01, 0.01] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.01, 0.01], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 0], evOffset: [-0.05, -0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.06, -0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
    explanationTemplate: '{hand} in a 3-bet pot OOP on {board}. Narrow ranges make this incredibly close between check and small lead. 50/50 solver split — both lines are correct.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  3-BET POTS
  // ════════════════════════════════════════════════════

  {
    id: '3bet-ip-overpair-sizing',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-low',
    handCategoryType: 'overpair',
    difficultyBase: 5,
    potType: '3BET',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [0, 25], evOffset: [-0.06, 0] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [50, 75], evOffset: [0, 0.06], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.03, 0.03], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 25], evOffset: [-0.04, 0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'RANGE_ADVANTAGE', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} overpair in a 3-bet pot on {board}. Lower SPR means small c-bet sets up a turn shove. 33% is generally preferred but medium sizing is close.',
    modifiers: [],
  },
  {
    id: '3bet-ip-air-mixed',
    street: 'flop',
    position: 'IP_VS_BB',
    boardTextureType: 'dry-high',
    handCategoryType: 'air',
    difficultyBase: 7,
    potType: '3BET',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [25, 50], evOffset: [0, 0.03] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [25, 50], evOffset: [-0.02, 0.03], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 0], evOffset: [-0.08, -0.02], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.1, -0.04], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'RANGE_ADVANTAGE'],
    explanationTemplate: '{hand} air in a 3-bet pot on {board}. Opponent\'s range is stronger, so bluffing is riskier. Check and small c-bet are close — larger sizes are too expensive.',
    modifiers: [],
  },

  // ════════════════════════════════════════════════════
  //  SB VS BTN
  // ════════════════════════════════════════════════════

  {
    id: 'sb-tptk-check-vs-lead',
    street: 'flop',
    position: 'SB_VS_BTN',
    boardTextureType: 'dry-high',
    handCategoryType: 'top-pair-top-kicker',
    difficultyBase: 7,
    potType: 'SRP',
    strategyShape: {
      actions: [
        { action: 'check', freqRange: [50, 75], evOffset: [0, 0.03] },
        { action: 'bet33', label: 'Bet 33%', freqRange: [0, 25], evOffset: [-0.03, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet66', label: 'Bet 66%', freqRange: [0, 25], evOffset: [-0.04, 0.01], sizeMultiplier: 0.66 },
        { action: 'bet75', label: 'Bet 75%', freqRange: [0, 0], evOffset: [-0.08, -0.02], sizeMultiplier: 0.75 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
    explanationTemplate: '{hand} from SB on {board}. SB is the worst position — check-raise strategy is standard. Some small leads mixed in. Close between check and 33%.',
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
