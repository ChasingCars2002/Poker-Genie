// Scenario templates encoding GTO strategy shapes.
// Each template defines a strategic skeleton — the generator randomizes concrete cards within constraints.
// difficultyBase 1-3 = easy (obvious best action), 4-6 = medium, 7-10 = hard (close EV decisions).

export const POSITION_MATCHUPS = {
  IP_VS_BB:  { hero: 'BTN', villain: 'BB',  label: 'IP vs BB' },
  CO_VS_BB:  { hero: 'CO',  villain: 'BB',  label: 'CO vs BB' },
  BTN_VS_SB: { hero: 'BTN', villain: 'SB',  label: 'BTN vs SB' },
  OOP_VS_IP: { hero: 'BB',  villain: 'BTN', label: 'BB vs BTN' },
  SB_VS_BTN: { hero: 'SB',  villain: 'BTN', label: 'SB vs BTN' },
  BB_VS_CO:  { hero: 'BB',  villain: 'CO',  label: 'BB vs CO' },
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
        { action: 'check',  freqRange: [0, 0],    evOffset: [-0.8, -0.4] },
        { action: 'bet33',  freqRange: [75, 100],  evOffset: [0, 0.3],    sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],   evOffset: [-0.3, 0],   sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],    evOffset: [-0.4, -0.2], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['RANGE_ADVANTAGE', 'NUT_ADVANTAGE', 'THIN_VALUE'],
    explanationTemplate: '{hand} is top pair top kicker on a dry {board}. BTN has a massive range advantage here — your entire PFR range connects while BB must defend with weaker holdings. The 33% bet extracts value from the widest possible continuing range: worse aces, pocket pairs, and backdoor draws all call comfortably. Sizing larger folds the exact hands that pay you off, while overbetting is unnecessary when villain has no strong draws to charge. Mix in occasional checks to protect your range.',
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
        { action: 'check',  freqRange: [0, 0],   evOffset: [-0.6, -0.3] },
        { action: 'bet33',  freqRange: [75, 100], evOffset: [0, 0.2],    sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.2, 0.1], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.4, -0.2], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['RANGE_ADVANTAGE', 'NUT_ADVANTAGE', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} is an overpair on a dry {board}. The board is too static for protection to matter — draws are minimal — so focus entirely on value efficiency. Small sizing keeps BB\'s entire calling range in: underpairs, weak top pairs, and floats all pay a 33% bet but fold to larger ones. Your goal is to bet three streets for maximum total extraction, not to win the most on any single street. Overbetting here is pure value destruction.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0 },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [0, 0.2],     sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.1, 0.2],  sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.1, 0.15], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'BOARD_COVERAGE'],
    explanationTemplate: '{hand} flopped a set on a dry {board} — an exceptionally strong hand with no single "correct" line. All four options are close in EV, making this a genuine solver mixed strategy. Checking traps opponents who will c-bet their entire range into you; small bets start building the pot early; larger bets and overbets occasionally work on specific run-outs where your hand is maximally disguised. The key concept: protecting your checking range with sets prevents opponents from exploiting your check-back frequency.',
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
        { action: 'check',  freqRange: [0, 0],   evOffset: [-1.0, -0.5] },
        { action: 'bet33',  freqRange: [25, 50],  evOffset: [-0.2, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [50, 75],  evOffset: [0, 0.3],     sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],   evOffset: [-0.1, 0.15], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['EQUITY_DENIAL', 'DRAW_HEAVY', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} is top pair on a draw-heavy {board} — unlike dry boards, wet textures demand larger sizing. Flush draws have ~36% equity, open-enders have ~32%; letting them see turns cheaply is a significant EV leak. The 75% bet charges draws the full equity price while extracting maximum value from weaker top pairs that will continue. The small bet is too kind to draws. Overbets are occasionally correct when you suspect villain is heavily weighted toward draws and will call any size.',
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
        { action: 'check',  freqRange: [0, 25],  evOffset: [-0.4, -0.1] },
        { action: 'bet33',  freqRange: [0, 25],  evOffset: [-0.2, 0],    sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [50, 75], evOffset: [0, 0.3],     sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [0, 0.25],    sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'EQUITY_DENIAL', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} flopped two pair on a wet {board} — a powerful but time-sensitive hand. Two pair must both protect against draws and extract value before the board gets dangerous. Bet large to charge flush and straight draws the full equity price; turn cards can dramatically shift your relative strength. An overbet is in range here since two pair is near the top of your value range on this texture and can support large bets — consider it when villain is polarized toward draws and will call any size.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.8, -0.4], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-1.0, -0.6], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'RANGE_ADVANTAGE', 'BOARD_COVERAGE'],
    explanationTemplate: '{hand} completely misses {board}. On dry high boards, BTN can profitably range-bet small — this is the "range bet" concept where your positional advantage is so large that almost any hand profits from a small probe. However, pure air hands should check back most of the time; small c-betting is profitable only when balanced against value hands and semi-bluffs with backdoor equity. Betting 75% or more is burning money with no equity backing. Checking preserves your equity and avoids building a pot you can\'t win.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.3, 0] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.2],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.2, 0.1],  sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.2, 0.15], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'DRAW_HEAVY', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} has a flush draw on {board} — a prime semi-bluffing candidate with two ways to win. When betting, you have fold equity now plus ~36% equity when called. The frequency split between checking and betting reflects that IP draws don\'t always need to semi-bluff; checking sometimes realizes equity cheaply. When you do bet, sizing matters: larger bets build bigger pots for when you hit, fold out more marginal equity; smaller bets keep wide calling ranges intact. Overbetting is viable with the nut draw specifically, since your equity justifies the size.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.6, -0.3], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.8, -0.5], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'POT_CONTROL'],
    explanationTemplate: '{hand} has a gutshot straight draw on {board} — limited equity, limited aggression. With only 4 outs (~17%), gutshots lack the raw equity to justify aggressive semi-bluffing without additional backdoor value. The decision splits between checking (cheaply realizing equity) and small c-betting (range betting on dry boards where BTN dominates). Any backdoor flush draw or pair outs dramatically change the calculus. Without them, lean heavily toward checking. Betting large or potting with a gutshot as your only equity is an expensive mistake.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33',  freqRange: [50, 75], evOffset: [0, 0.2],     sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.5, -0.2], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.7, -0.4], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['RANGE_ADVANTAGE', 'EQUITY_DENIAL', 'BOARD_COVERAGE'],
    explanationTemplate: '{hand} has two overcards on a low {board}. On low boards BTN has a powerful range advantage — your entire preflop range overhauls this texture while BB defends wide with weak holdings. Small c-bet exploits this: 6 live outs to improve on the turn, plus significant fold equity against BB\'s capped range. Sizing up is counterproductive — you want calls from the widest possible range of weaker hands. This is a core "range bet" spot: even hands with modest equity profit from small continuation bets when your positional advantage is this large.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.5, -0.2], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.7, -0.4], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
    explanationTemplate: '{hand} on a dry {board} from OOP — strong hand, wrong position. BB faces a range disadvantage on high boards where BTN\'s preflop raising range connects far more frequently. Checking is standard: you allow IP to c-bet into you, and your check-raise or check-call lines extract more value than leading does. Donking into the preflop aggressor narrows your range unnecessarily and telegraphs hand strength. Use check-raise with your strongest holdings to build pots from a position of strength; check-call with hands like this to stay in the pot cheaply.',
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
        { action: 'check',  freqRange: [75, 100], evOffset: [0, 0.2] },
        { action: 'bet33',  freqRange: [0, 25],   evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],    evOffset: [-0.5, -0.2], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],    evOffset: [-0.6, -0.3], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['CHECK_RAISE_CANDIDATE', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} flopped a set on {board} from OOP — check-raise is the dominant line. On dry boards, IP will c-bet at high frequency; your check invites this, and the subsequent raise forces them to continue with their entire range or fold. This builds a much larger pot than leading, which IP can simply call and control the size. The rare small donk is only correct in specific exploitative situations where you expect IP to check back frequently. Stack-to-pot ratio determines whether check-raise now or check-call and raise later is optimal.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.4, -0.1], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.6, -0.3], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['DRAW_HEAVY', 'CHECK_RAISE_CANDIDATE', 'BLUFF_CANDIDATE'],
    explanationTemplate: '{hand} has a flush draw on a wet {board} from OOP. Check-raise semi-bluff is the primary weapon: check to IP\'s expected c-bet, then raise to build a large pot while you have maximum equity. This line gives you two ways to win (fold equity from the raise and equity when called) and is more powerful than a donk bet since it builds a larger pot. Occasionally leading small balances your range. Never lead large with draws OOP — you build a pot from the worst possible position without the protection of knowing IP\'s action.',
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
        { action: 'check',  freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'bet33',  freqRange: [0, 25],   evOffset: [-0.4, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],    evOffset: [-0.8, -0.4], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],    evOffset: [-1.0, -0.6], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL'],
    explanationTemplate: '{hand} has nothing on {board} from OOP. This is one of the clearest situations in poker: check and surrender gracefully. You have no equity, no blockers, no credible bluffing story — and you\'re out of position against the preflop aggressor. Donking with air OOP is a significant leak that compounds over thousands of hands. Check to IP; if they bet, fold. If they check back, you\'ve seen a free turn card with no damage done. Discipline in recognizing and accepting these situations separates improving players from those who leak chips on unwinnable spots.',
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
        { action: 'check',  freqRange: [75, 100], evOffset: [0, 0.1] },
        { action: 'bet33',  freqRange: [0, 25],   evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],    evOffset: [-0.6, -0.3], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],    evOffset: [-0.8, -0.5], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
    explanationTemplate: '{hand} has middle pair on a high {board} from OOP — classic pot control situation. Middle pair has showdown value but cannot withstand heavy action on a board where IP\'s range is loaded with better hands. Checking controls the pot size and lets you get to showdown at minimum cost. If IP bets, you can check-call once with favorable pot odds, but be wary of multiple streets of aggression. Your hand is a bluff-catcher, not a value hand — treat it accordingly. Leading turns your showdown hand into a bloated pot where you may face difficult decisions.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.4, -0.1], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.6, -0.3], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} on a monotone {board} without a flush draw — proceed with caution. BB has a significant flush draw advantage on three-suited flops, meaning many turns and rivers will be dangerous for your top pair. Checking is often superior: you see if IP fires a second barrel and can make informed decisions without inflating the pot. If you do bet, use small sizing only as a range balance tool. Large bets and overbets are ill-advised — you have limited ability to withstand raises and limited ability to continue on many turn cards.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33',  freqRange: [50, 75], evOffset: [0, 0.2],     sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.2, 0.1],  sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.1, 0.2],  sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'DRAW_HEAVY', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} has the nut flush draw on a monotone {board} — a powerful semi-bluffing hand. You block the highest-value flush (the nut flush), giving you fold equity against weaker draws, and you have ~36% equity to the best possible flush. Betting small builds the pot and forces BB to continue with weaker draws at a disadvantage. An overbet is occasionally correct here specifically because you block the nuts — villain\'s range contains more folds than you\'d expect, making the larger size profitable. This is one of the few IP overbet spots on the flop.',
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
        { action: 'check',  freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'bet33',  freqRange: [0, 25],   evOffset: [-0.4, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],    evOffset: [-0.8, -0.4], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],    evOffset: [-1.0, -0.6], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} on a monotone {board} with no flush draw — pure check-back. Bluffing on monotone boards without a flush draw is deeply flawed logic: you\'re representing a flush you don\'t have against a BB who is incentivized to call with any flush. Your c-bets on monotone boards should be reserved entirely for hands with a flush draw (especially the nut draw). Without one, you have no equity against the part of BB\'s range that calls, and you build a pot you cannot continue in. Give up cleanly.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33',  freqRange: [50, 75], evOffset: [0, 0.2],     sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.3, -0.1], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.5, -0.2], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['BOARD_PAIR', 'RANGE_ADVANTAGE', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} with overcards on a paired {board} — an underappreciated c-bet spot. Paired boards reduce the number of strong hands for both players, but the reduction hurts BB more than BTN: BB has fewer trips combos and fewer strong holdings that interact well with paired textures. BTN\'s range advantage is preserved. Small c-bet leverages this: BB cannot continue comfortably with most of their range, and your overcards have 6 real outs to improve. Sizing up is less efficient since the fold equity from the range advantage is only valuable at small sizes.',
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
        { action: 'check',  freqRange: [0, 25],  evOffset: [-0.5, -0.2] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [50, 75], evOffset: [0, 0.3],     sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.1, 0.2],  sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'RANGE_ADVANTAGE'],
    explanationTemplate: '{hand} on {board} — second barrel with top pair. Continuing on the turn after c-betting the flop is standard and correct. Sizing up on the turn is preferred: pot-to-stack ratios shift as you near the river, and a 75% turn bet builds toward a natural river shove situation. Consider what the turn card means for your range: a brick favors continuing at full frequency; if the turn completes draws, you may check occasionally and re-evaluate. Your hand is too strong to give up but must be protected from check-raise bluffs with some checking.',
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
        { action: 'check',  freqRange: [0, 0],   evOffset: [-0.6, -0.3] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [50, 75], evOffset: [0, 0.3],     sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.1, 0.25], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'EQUITY_DENIAL', 'THIN_VALUE'],
    explanationTemplate: '{hand} overpair on {board} — fire the second barrel. Overpairs on dry boards have clear turn value: your hand beats all pairs, and BB\'s range has no realistic hand that beats you unless they have a set. Sizing up to 75% builds toward a river stack-off and denies equity from any remaining draws or gutshots. An overbet is occasionally in range when SPR is low enough that you\'re near commitment territory — a pot-sized bet and a call often sets up a natural river all-in with favorable pot odds.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [25, 50], evOffset: [-0.1, 0.2],  sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.1, 0.2],  sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'DRAW_HEAVY', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} is still drawing on {board} — one card to come, maximum aggression or patience? With a single card to come, the semi-bluff remains profitable if your pot equity (~20% for a flush draw) exceeds the required fold equity given your sizing. All four lines are viable depending on opponent type: against calling stations, checking realizes equity cheaply; against folders, large bets maximize fold equity; balanced opponents warrant a medium bet that forces difficult decisions. The overbet is specifically strong with the nut draw, where your equity is maximized and you block villain\'s strongest calls.',
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
        { action: 'check',  freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'bet33',  freqRange: [0, 25],   evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],    evOffset: [-0.7, -0.3], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],    evOffset: [-0.9, -0.5], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'BLUFF_CANDIDATE'],
    explanationTemplate: '{hand} on {board} — time to abandon the bluff. Double-barreling air without equity is expensive and strategically bankrupt. BB\'s calling range on the turn has narrowed to hands that beat you: they folded draws and weak pairs to the flop bet; what remains are pairs, top pairs, and slowplayed monsters. Without blockers to their calling range or a strong equity draw, firing again costs you money on each iteration. The rare small bet is only viable with specific blocker combinations. Check back, take your lumps, and move to the next hand without compounding the loss.',
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
        { action: 'check',  freqRange: [75, 100], evOffset: [0, 0.1] },
        { action: 'bet33',  freqRange: [0, 25],   evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],    evOffset: [-0.5, -0.2], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],    evOffset: [-0.7, -0.4], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE'],
    explanationTemplate: '{hand} middle pair on {board} — showdown value that cannot withstand aggression. Middle pair has gotten relatively weaker on the turn: board has more dangerous overcards, and BB\'s continuing range after calling a flop bet skews toward hands that beat you. Check back to reach showdown cheaply; if BB leads, your pot odds may justify one call with no plans for further investment. This hand is in the classic "bluff-catching" zone: call one reasonable bet, fold to large bets or multiple streets of pressure.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.3, -0.1], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.5, -0.3], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'RANGE_DISADVANTAGE'],
    explanationTemplate: '{hand} on {board} from OOP on the turn — check-calling is standard. Leading on the turn after checking the flop is generally suboptimal OOP: it narrows your range to a transparent band of top pair hands and allows IP to raise or float effectively. Check-calling keeps all hands in your range, confuses IP about your holding, and avoids the range-transparency problem of turn leads. The key factor in whether to call: is top pair good enough against IP\'s turn betting range? On most dry boards with no scary turn card, yes — call one barrel and reassess the river.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [25, 50], evOffset: [0, 0.2],     sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.1, 0.15], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} on {board} on the river — a real sizing decision. Top pair is thin value: you want calls from second pair and worse top pairs but don\'t want to be raised off the best hand. Sizing around 50-75% pot targets the widest calling range; a small block bet is for maximally thin value when you fear a raise. Checking is correct if BB is a frequent bluffer who will bet into you after you check. The overbet is viable only when the river card specifically caps BB\'s range in a way that makes their calls predictable and you hold a blocker to their best hands.',
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
        { action: 'check',  freqRange: [0, 25],  evOffset: [-0.3, -0.1] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [50, 75], evOffset: [0, 0.3],     sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [25, 50], evOffset: [0, 0.25],    sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'NUT_ADVANTAGE'],
    explanationTemplate: '{hand} overpair on {board} on the river — clear value, question is sizing. Overpairs beat nearly everything in BB\'s calling range on dry runouts: you want to extract maximum chips per call. A 75% pot bet is the standard line; an overbet is also in range here when you hold a blocker to BB\'s strongest calling hands and the board is dry enough that their range cannot contain many strong holdings. Checking is a small mistake — passive lines with value hands cost EV over time. Be willing to call a raise: your hand is too strong to fold to a single raise.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [0, 0.05] },
        { action: 'bet33',  freqRange: [0, 25],  evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [25, 50], evOffset: [-0.1, 0.2],  sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} bricked the river on {board} — the only way to win is to bluff. River bluffs require: (1) blockers to villain\'s calling range — holding cards that reduce the combinations of strong hands they can have, (2) a credible value story — your bet range must contain hands that make sense on this board and runout, and (3) villain\'s range is capped — they cannot continue comfortably without premium holdings. Large sizing is critical; small river bluffs are poor risk-reward since villain calls with any made hand. Without good blockers, checking is clearly superior.',
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
        { action: 'check',  freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'bet33',  freqRange: [0, 25],   evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],    evOffset: [-0.6, -0.3], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],    evOffset: [-0.8, -0.5], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['POT_CONTROL'],
    explanationTemplate: '{hand} on a dry {board} on the river — check and accept defeat. Without draws to represent, blockers to BB\'s calling range, or a credible three-street betting story, bluffing is deeply negative EV. BB\'s range on a dry board will call with any pair; you have no fold equity and no equity. Checking is the only play — show discipline, muck your hand at showdown, and move on. The urge to bluff with nothing on the river is one of the most expensive leaks in poker. Not every hand needs to be fought for.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.1, 0] },
        { action: 'bet33',  freqRange: [0, 0],   evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [50, 75], evOffset: [0, 0.15],    sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [25, 50], evOffset: [0, 0.2],     sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['BLOCKER_EFFECT', 'BLUFF_CANDIDATE'],
    explanationTemplate: '{hand} on {board} — the blocker bluff is a precision instrument. Your specific hand blocks key value combos in BB\'s calling range, meaning they fold at higher-than-expected frequency. This elevates a bluff from marginally unprofitable to marginally profitable. The math: if you remove 20-30% of their calling combos through blockers, a large bluff requires ~40% folds instead of ~60% — achievable. Large sizing is required (small bluffs are never correct here). Identify exactly which combos you block, calculate their frequency, and commit if the math works out.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.3, -0.1], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.5, -0.3], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE', 'BLOCK_BET'],
    explanationTemplate: '{hand} on {board} from OOP on the river — the classic block bet vs check debate. A small lead (block bet) controls pot size, prevents IP from betting large with hands that beat you, and extracts thin value from hands worse than yours. Checking induces bluffs from IP\'s missed draws but risks facing a large value bet. Neither line is universally correct — it depends on IP\'s tendencies: against frequent river bluffers, check; against players who bet medium for value, the block bet sets your own price. Never lead large OOP on the river; you get called exclusively by better hands.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.2, 0] },
        { action: 'bet33',  freqRange: [0, 25],  evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [50, 75], evOffset: [0, 0.3],     sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [50, 75], evOffset: [0, 0.35],    sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'THIN_VALUE'],
    explanationTemplate: '{hand} on {board} from OOP on the river — monster hand, extract maximum value. With a very strong holding from OOP, leading is preferred over trapping: IP may check back with medium hands or bet small, reducing your EV significantly. A large lead forces a call-or-raise decision and maximizes expected value from hands like two pair, weaker sets, and overpairs that will continue. An overbet is specifically powerful here: your monster can withstand a raise, and IP\'s range on a dry board likely contains enough calling hands that the larger size extracts more chips per decision.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.1, 0.05] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.05, 0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.2, -0.05], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.3, -0.1],  sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE', 'BOARD_COVERAGE'],
    explanationTemplate: '{hand} is a weak top pair on {board} — intentionally close. Your hand is strong enough to bet for thin value against worse top pairs and second pairs, but vulnerable enough that checking for pot control and bluff-catching is also valid. GTO solvers mix between checking and small betting because both lines have nearly identical EV; the correct play varies based on opponent tendencies and your range balance at this frequency. This is a hand that teaches you to resist defaulting to one extreme — neither always betting nor always checking is correct.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.05, 0.05] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.05, 0.05], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.15, 0],    sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.15, 0.05], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'THIN_VALUE', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} on a wet turn {board} — a solver-level mixed strategy situation. Competing pressures are at work: your hand has thin value against weaker holdings but is vulnerable to raises; the board texture argues for caution but your position argues for aggression. GTO solvers mix between all four options in these spots specifically to remain unexploitable — any single fixed strategy can be countered. Your primary job here is not to find the single correct answer but to understand why mixing is correct and how opponent tendencies should tilt you toward one option.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.05, 0.05] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.05, 0.05], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.1, 0],     sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.1, 0.05],  sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'BLOCKER_EFFECT', 'BLOCK_BET'],
    explanationTemplate: '{hand} on {board} — razor thin value on the river. Betting small extracts thin value but risks a check-raise that forces you to fold the best hand; checking is safe but may leave money on the table; an overbet creates a polarizing situation where BB can fold or call based on your bet-or-check frequency tells. The solver is nearly indifferent between betting and checking. What tips the scale: if BB is a station, bet any size; if BB is aggressive, check; if BB is a folder, consider a large bet. This is where opponent-specific reads become the dominant factor.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [0, 0.05] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.05, 0.05], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.1, 0.05],  sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.1, 0.05],  sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['CHECK_RAISE_CANDIDATE', 'NUT_ADVANTAGE', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} two pair on a wet {board} from OOP — check-raise or lead? Check-raising is more powerful on average: it builds a larger pot since IP will c-bet frequently, and your raise forces them to continue with their entire range or fold. Leading is valid for equity denial against hands that have real draws, and occasionally the large lead is correct when IP checks back at high frequency. Both lines and all sizings are viable. The key concept: at higher difficulty levels, understanding that both lines work prevents you from being exploitable by opponents who adjust to a predictable single strategy.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [0, 0.05] },
        { action: 'bet33',  freqRange: [0, 25],  evOffset: [-0.1, 0],     sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.1, 0],     sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.1, 0.05],  sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['POT_CONTROL', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} on {board} — marginal showdown value on the river. Your hand is a classic bluff-catcher: strong enough to call a bet but not strong enough to extract value by betting. Converting it to a bet turns your hand into a bluff, which is only profitable with specific blockers to BB\'s calling range. Checking keeps all hands in your range — BB must decide whether you have a value hand or a bluff — and induces bet/bluff from their missed draws. This scenario tests your understanding of showdown value and when betting turns thin value into an exploitable bluff.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.03, 0.03] },
        { action: 'bet33',  freqRange: [0, 0],   evOffset: [-0.2, -0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [50, 75], evOffset: [-0.03, 0.03], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [25, 50], evOffset: [-0.02, 0.04], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} on {board} — elite-level polarized river strategy. At the highest level, river strategies are purely polarized: bet large with the top of your range (strong value) AND the bottom of your range (best bluffs), while checking with medium-strength hands. With no value and the right blockers, a large polarized bluff is the GTO play. Without blockers, the checking frequency increases substantially. The EV difference between betting and checking is under 0.1 BB — this is a spot where deep understanding of blocker effects and range construction separates top-level players from everyone else.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.02, 0.02] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.02, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.05, 0.02], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.05, 0.02], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['THIN_VALUE', 'POT_CONTROL', 'BLOCKER_EFFECT'],
    explanationTemplate: '{hand} on {board} — solver indifference at difficulty 9. EV of checking and betting small differ by under 0.05 BB, making any answer technically defensible. What GTO theory says: you should mix between all viable options at specific frequencies to remain unexploitable. What practical theory says: in this spot, lean toward the action that exploits your specific opponent\'s tendencies — against a station, bet any size for thin value; against an aggressor, check and let them bluff into your hand. This is the spot where theory meets live reads.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.02, 0.02] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.02, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.05, 0.02], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.05, 0.02], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['CHECK_RAISE_CANDIDATE', 'NUT_ADVANTAGE', 'DRAW_HEAVY'],
    explanationTemplate: '{hand} set on a draw-heavy {board} from OOP — the most complex OOP flop decision. Trapping (check to check-raise) maximizes pot size when IP c-bets frequently and gives you maximum information before committing; leading denies equity from draws immediately and starts building stacks on your terms. Both lines are theoretically correct at meaningful frequencies. The board texture is the key variable: heavily draw-laden boards favor leading to charge draws now; less draw-dependent boards favor trapping since IP is unlikely to improve and the check-raise is more devastating.',
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
        { action: 'check',  freqRange: [25, 50], evOffset: [-0.02, 0.02] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.02, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.05, 0],    sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.05, 0],    sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['BLOCK_BET', 'THIN_VALUE', 'BLOCKER_EFFECT', 'POT_CONTROL'],
    explanationTemplate: '{hand} on {board} from OOP on the river — difficulty 10, the hardest spot in poker. Block betting OOP controls the price you pay: by setting a small bet, you prevent IP from betting 75%+ pot with their value range. Checking induces bluffs but exposes you to a large value bet. The solver assigns nearly equal EV to both lines. In practice, the correct answer depends on three factors: (1) IP\'s exact river betting frequency, (2) the specific hands in their value and bluff ranges, and (3) your own range\'s composition. This is the spot where theory and live reads must work together.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [-0.02, 0.02] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.02, 0.02], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.2, -0.1],  sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.3, -0.2],  sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL', 'CHECK_RAISE_CANDIDATE'],
    explanationTemplate: '{hand} in a 3-bet pot from OOP on {board} — compressed SPR, higher stakes per decision. Three-bet pots have much lower stack-to-pot ratios (~4-6x), making every decision more consequential: you\'re closer to commitment with each bet. On a high board, check allows IP to c-bet wide with their entire range, then your check-raise or check-call controls the information flow. Small lead is in range but barely — it prevents IP from checking back entirely and seeing a free turn. Large bets OOP in 3-bet pots are almost never correct: they commit you to a pot where IP has the positional advantage for all remaining streets.',
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
        { action: 'check',  freqRange: [0, 25],  evOffset: [-0.4, -0.1] },
        { action: 'bet33',  freqRange: [75, 100], evOffset: [0, 0.3],    sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 25],  evOffset: [-0.2, 0.1],  sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 25],  evOffset: [-0.1, 0.15], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['NUT_ADVANTAGE', 'RANGE_ADVANTAGE', 'EQUITY_DENIAL'],
    explanationTemplate: '{hand} overpair in a 3-bet pot on {board}. Three-bet pots dramatically reduce SPR — with 4-6x stacks left, commitment thresholds are low and decisions are binary. Small c-bet starts the stack-off process: bet flop small, barrel turn medium, commit river. BB\'s 3-bet calling range is strong (pairs, suited connectors, Ax), so you\'re not getting folds easily — value extraction over three streets beats winning the pot now. An overbet is in range specifically when SPR suggests that a pot-sized bet sets up a natural all-in on the turn.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.05], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.5, -0.2], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.7, -0.4], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['BLUFF_CANDIDATE', 'RANGE_ADVANTAGE'],
    explanationTemplate: '{hand} misses {board} in a 3-bet pot — c-betting air here is significantly riskier than in SRPs. BB called a 3-bet with a strong, condensed range specifically designed to continue against c-bets; they will not fold easily. The small probe bet exploits your range advantage on high boards and can fold out weak portions of BB\'s range. But pure air hands should check back more frequently in 3-bet pots than in SRPs. If you do bet and get called, evaluate the turn very carefully — you have no equity backing your aggression.',
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
        { action: 'check',  freqRange: [50, 75], evOffset: [0, 0.1] },
        { action: 'bet33',  freqRange: [25, 50], evOffset: [-0.1, 0.1],  sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],   evOffset: [-0.4, -0.1], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],   evOffset: [-0.6, -0.3], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL', 'POSITIONAL_ADVANTAGE'],
    explanationTemplate: '{hand} from SB on a dry {board}. SB is the absolute worst position postflop — you act first on every street, BTN has range advantage on high boards, and any bet you make gives BTN perfect information. Checking is standard: use check-raise with your strongest hands to build pots from a position of strength, and check-call with solid hands like this. Donking into the preflop raiser from SB is a significant leak that compounds over time. If you do lead, use only small sizing — leading large from SB telegraphs strength and reduces your profits with made hands.',
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
        { action: 'check',  freqRange: [75, 100], evOffset: [0, 0.05] },
        { action: 'bet33',  freqRange: [0, 25],   evOffset: [-0.3, -0.1], sizeMultiplier: 0.33 },
        { action: 'bet75',  freqRange: [0, 0],    evOffset: [-0.6, -0.3], sizeMultiplier: 0.75 },
        { action: 'betPot', freqRange: [0, 0],    evOffset: [-0.8, -0.5], sizeMultiplier: 1.0 },
      ],
    },
    logicTagPool: ['RANGE_DISADVANTAGE', 'POT_CONTROL'],
    explanationTemplate: '{hand} from SB on {board} with nothing. Check and fold to aggression — this is non-negotiable. SB is the worst position to attempt bluffs from without a strong equity backing: BTN will c-bet frequently into your check, and you have no credible holdings to represent with a donk bet. Checking passes initiative to BTN at no cost; if they check back, take your free turn card. If they bet, fold without remorse. Discipline in these spots saves substantial money and teaches you to recognize when position and range disadvantage combine to make bluffing fundamentally unprofitable.',
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
