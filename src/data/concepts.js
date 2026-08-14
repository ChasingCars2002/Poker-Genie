// The skill taxonomy the trainer measures you against.
//
// Every hand is tagged with two concepts: a *primary* one (what decision you
// were making) and a *texture* one (what kind of board you were making it on).
// Both are tracked separately because they fail independently — plenty of
// players barrel turns competently and still have no idea what to do on a
// monotone flop.

export const HAND_CLASSES = {
  'top-pair': 'value',
  'top-pair-top-kicker': 'value',
  'overpair': 'value',
  'set': 'value',
  'two-pair': 'value',
  'monster': 'value',
  'flush-draw': 'draw',
  'oesd': 'draw',
  'gutshot': 'draw',
  'air': 'air',
  'overcards': 'air',
  'marginal': 'marginal',
  'middle-pair': 'marginal',
  'weak-top-pair': 'marginal',
};

export function handClassOf(handCategoryType) {
  return HAND_CLASSES[handCategoryType] || 'air';
}

/** Which board-texture skill a flop exercises. */
export function textureConceptOf(boardTextureType) {
  switch (boardTextureType) {
    case 'monotone': return 'texture-monotone';
    case 'paired': return 'texture-paired';
    case 'wet': return 'texture-wet';
    default: return 'texture-dry';
  }
}

/**
 * Primary concept for a scenario.
 * @param {{street: string, handCategoryType: string, decisionMode?: string}} template
 */
export function primaryConceptOf(template) {
  const mode = template.decisionMode === 'defend' ? 'defend' : 'bet';
  return `${mode}-${template.street}-${handClassOf(template.handCategoryType)}`;
}

export function conceptsOf(template) {
  return {
    primary: primaryConceptOf(template),
    texture: textureConceptOf(template.boardTextureType),
  };
}

// Human-readable names and, more importantly, what to actually do about it
// when the concept shows up as a leak.
export const CONCEPT_INFO = {
  // ── Betting decisions ──
  'bet-flop-value': {
    label: 'Flop value betting',
    tip: 'With a strong made hand, the question is sizing, not whether to bet. Small on dry boards to keep their range wide; large on wet ones to charge draws.',
  },
  'bet-flop-draw': {
    label: 'Flop semi-bluffing',
    tip: 'Draws want to bet when the fold equity plus the equity you realise when called beats checking. Strong draws bet big; weak gutshots mostly check.',
  },
  'bet-flop-air': {
    label: 'Flop c-bet bluffs',
    tip: 'Bluff with the hands that have backdoor equity or block their continues. Pure air with no backup is usually a check, not a bet.',
  },
  'bet-flop-marginal': {
    label: 'Flop pot control',
    tip: 'Middle pair and weak top pair want a cheap showdown. Betting turns them into a bluff-catcher facing a raise with nothing to gain.',
  },
  'bet-turn-value': {
    label: 'Turn value barrels',
    tip: 'Second barrels get bigger, not smaller. If you are still ahead of their calling range, size up — the turn is where the pot is really built.',
  },
  'bet-turn-draw': {
    label: 'Turn semi-bluffs',
    tip: 'One card to come halves your equity. Only barrel draws that can win the pot outright or that make the nuts when they hit.',
  },
  'bet-turn-air': {
    label: 'Turn barrel or give up',
    tip: 'Barrel the turns that improve your range and hurt theirs. Giving up is a real, profitable action — it is not a failure of nerve.',
  },
  'bet-turn-marginal': {
    label: 'Turn pot control',
    tip: 'Checking back the turn with showdown value keeps the pot small and lets you call a river bet. Betting invites a raise you cannot answer.',
  },
  'bet-river-value': {
    label: 'River value betting',
    tip: 'Ask which worse hands call. If the answer is "several", bet, and bet large enough to matter. Most players value bet too small here.',
  },
  'bet-river-draw': {
    label: 'River busted draws',
    tip: 'A missed draw is either a bluff or a fold — never a small "see what happens" bet. Pick the ones that block their calls.',
  },
  'bet-river-air': {
    label: 'River bluffing',
    tip: 'Bluff with blockers to their strong hands and no showdown value of your own. If your hand can win a checkdown, do not turn it into a bluff.',
  },
  'bet-river-marginal': {
    label: 'Thin river value',
    tip: 'The thinnest correct value bets are where most of the money is. A small bet that gets called by one worse hand still prints.',
  },

  // ── Facing a bet ──
  'defend-flop-value': {
    label: 'Flop raising for value',
    tip: 'Strong hands on wet boards want to raise now while there are draws to charge. Slow-playing a vulnerable hand is how you get outdrawn.',
  },
  'defend-flop-draw': {
    label: 'Flop draws facing a bet',
    tip: 'Compare pot odds to your equity, then add the implied odds. Strong draws prefer raising to calling; weak ones need a price.',
  },
  'defend-flop-air': {
    label: 'Flop defending with air',
    tip: 'Some floats are mandatory or you fold far too much. Pick the ones with backdoor equity and position, not the ones that "feel" playable.',
  },
  'defend-flop-marginal': {
    label: 'Flop bluff-catching',
    tip: 'Middle pair calls one bet, not three. Decide on the flop whether the hand is calling down or folding to pressure.',
  },
  'defend-turn-value': {
    label: 'Turn raising for value',
    tip: 'Raising the turn is the most under-used aggressive line in NLHE. Against a barreller it wins far more than calling.',
  },
  'defend-turn-draw': {
    label: 'Turn draws facing a bet',
    tip: 'Turn draws get one card. The pot odds you need roughly double — a call that was routine on the flop can be a fold here.',
  },
  'defend-turn-air': {
    label: 'Turn defending with air',
    tip: 'Most air should be folding by the turn. Continuing without equity is the single most expensive habit in low-stakes poker.',
  },
  'defend-turn-marginal': {
    label: 'Turn bluff-catching',
    tip: 'Your bluff-catchers are only as good as the bluffs they beat. Against a player who never bluffs turns, fold.',
  },
  'defend-river-value': {
    label: 'River raising for value',
    tip: 'River raises are almost never bluffs at low stakes. When you have the goods, raise — and when you face one, believe it.',
  },
  'defend-river-draw': {
    label: 'River missed draws facing a bet',
    tip: 'A busted draw has no showdown value. It is a fold or a raise-bluff, and against most opponents it is a fold.',
  },
  'defend-river-air': {
    label: 'River hero folds',
    tip: 'No showdown value means no call. The discipline to fold here funds the calls you make with real hands.',
  },
  'defend-river-marginal': {
    label: 'River bluff-catching',
    tip: 'Work out how often you need to be right from the price, then judge whether they have that many bluffs. Usually they do not.',
  },

  // ── Board textures ──
  'texture-dry': {
    label: 'Dry boards',
    tip: 'Dry boards favour the preflop aggressor. Bet small and often — you can attack the whole range cheaply because few hands connected.',
  },
  'texture-wet': {
    label: 'Wet / connected boards',
    tip: 'Connected boards shift equity toward the caller. Bet bigger with less of your range, and stop auto-c-betting air.',
  },
  'texture-monotone': {
    label: 'Monotone boards',
    tip: 'Everyone plays these badly. Bet small with the range advantage, and remember a single high card of the suit is worth more than a made hand without one.',
  },
  'texture-paired': {
    label: 'Paired boards',
    tip: 'Paired boards reduce strong holdings for both players, which makes them great for cheap bluffs and terrible for big value bets.',
  },
};

export function conceptLabel(conceptId) {
  return CONCEPT_INFO[conceptId]?.label || conceptId;
}

export function conceptTip(conceptId) {
  return CONCEPT_INFO[conceptId]?.tip || '';
}
