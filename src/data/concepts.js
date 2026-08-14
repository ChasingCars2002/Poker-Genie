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
    // Named `secondary` rather than `texture` because preflop fills this slot
    // with position instead — a field called `texture` holding
    // 'position-blinds' is the kind of name that breeds bugs.
    secondary: textureConceptOf(template.boardTextureType),
  };
}

// ── Preflop ──────────────────────────────────────────────────────────────
//
// The postflop hand classes above are board-relative and mean nothing before a
// flop, so preflop gets its own axis. The second slot carries position, which
// is the preflop equivalent of board texture: the situation you are in, as
// distinct from the decision you are making.

const PREFLOP_HAND_CLASSES = {
  premium: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs'],
  pair: ['TT', '99', '88', '77', '66', '55', '44', '33', '22'],
};

export function preflopHandClassOf(notation) {
  if (PREFLOP_HAND_CLASSES.premium.includes(notation)) return 'premium';
  if (PREFLOP_HAND_CLASSES.pair.includes(notation)) return 'pair';

  const suited = notation.endsWith('s');
  const [high, low] = notation;
  const BROADWAY = 'AKQJT';

  if (BROADWAY.includes(high) && BROADWAY.includes(low)) return 'broadway';
  if (high === 'A' && suited) return 'suited-ace';

  if (suited) {
    const order = 'AKQJT98765432';
    const gap = Math.abs(order.indexOf(high) - order.indexOf(low));
    if (gap <= 2) return 'suited-connector';
  }

  return 'junk';
}

export function preflopPositionConceptOf(position) {
  if (position === 'BB' || position === 'SB') return 'position-blinds';
  if (position === 'BTN' || position === 'CO') return 'position-late';
  return 'position-early';
}

/** Concepts for a preflop spot and the hand dealt into it. */
export function preflopConceptsOf(spot, handNotation) {
  return {
    primary: `${spot.context}-${preflopHandClassOf(handNotation)}`,
    secondary: preflopPositionConceptOf(spot.heroPosition),
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

  // ── Preflop decisions ──
  'vs-open-premium': {
    label: 'Premiums facing an open',
    tip: 'Premium hands are never folding for one raise. The only question is whether calling or 3-betting makes more, and against a wide opener it is usually 3-betting.',
  },
  'vs-open-pair': {
    label: 'Pocket pairs facing an open',
    tip: 'Small pairs need a price and someone to pay you off when you flop a set — roughly one time in eight. Out of position with a short stack behind, they are a fold.',
  },
  'vs-open-broadway': {
    label: 'Broadway hands facing an open',
    tip: 'Broadway offsuit hands look pretty and are frequently dominated. KJo against a tight early open is exactly the hand that costs people money.',
  },
  'vs-open-suited-ace': {
    label: 'Suited aces facing an open',
    tip: 'Suited aces flop the nut flush draw and block their strongest hands. They defend far wider than their offsuit counterparts.',
  },
  'vs-open-suited-connector': {
    label: 'Suited connectors facing an open',
    tip: 'Great equity when they connect, and they connect rarely. They need a good price and position; from the small blind most of them are folds.',
  },
  'vs-open-junk': {
    label: 'Weak hands facing an open',
    tip: 'The big blind gets a wonderful price, but a wonderful price on a hand with no equity is still a losing call. Check the number rather than the discount.',
  },
  'vs-3bet-premium': {
    label: 'Premiums facing a 3-bet',
    tip: 'This is where stacks go in. Work out whether you are ahead of their 3-betting range, not just whether your hand looks strong.',
  },
  'vs-3bet-pair': {
    label: 'Pocket pairs facing a 3-bet',
    tip: 'Middling pairs are the classic 3-bet trap: too good to fold by feel, not good enough to call by maths. The price usually says fold.',
  },
  'vs-3bet-broadway': {
    label: 'Broadway hands facing a 3-bet',
    tip: 'Against a polarised 3-bet you are either crushed or well ahead. Offsuit broadway is on the wrong side of that split more often than it feels.',
  },
  'vs-3bet-suited-ace': {
    label: 'Suited aces facing a 3-bet',
    tip: 'Blocking their aces and ace-king matters a lot here — every combo you block is one fewer hand that has you dominated.',
  },
  'vs-3bet-suited-connector': {
    label: 'Suited connectors facing a 3-bet',
    tip: 'The price is much worse than defending a blind and you are usually out of position. Most of these are folds despite the pretty cards.',
  },
  'vs-3bet-junk': {
    label: 'Weak hands facing a 3-bet',
    tip: 'Fold. A 3-bet is a narrow, strong range and no price you are being offered fixes having nothing.',
  },
  'vs-jam-premium': {
    label: 'Premiums facing an all-in',
    tip: 'No streets left, so raw equity is the whole answer. Compare it to the price and act — nothing else is relevant.',
  },
  'vs-jam-pair': {
    label: 'Pocket pairs facing an all-in',
    tip: 'A pair is a favourite against two overcards and a huge underdog to a bigger pair. Which one it is against depends entirely on their jamming range.',
  },
  'vs-jam-broadway': {
    label: 'Broadway hands facing an all-in',
    tip: 'Against a tight jam these are dominated far more often than they are racing. Check the number rather than the picture.',
  },
  'vs-jam-suited-ace': {
    label: 'Suited aces facing an all-in',
    tip: 'The suit is worth about two or three points of equity. Against a wide jam that can be the whole difference.',
  },
  'vs-jam-suited-connector': {
    label: 'Suited connectors facing an all-in',
    tip: 'Never dominated, never a big favourite. Against a wide jamming range they hold up better than their reputation suggests.',
  },
  'vs-jam-junk': {
    label: 'Weak hands facing an all-in',
    tip: 'The price has to be extraordinary before a hand with no equity is a call. It almost never is.',
  },

  // ── Preflop positions ──
  'position-blinds': {
    label: 'Playing the blinds',
    tip: 'You have money in already, which improves the price and tempts you to over-defend. You will also be out of position for the entire hand, which is what makes those calls expensive.',
  },
  'position-late': {
    label: 'Playing in position',
    tip: 'Acting last is worth real equity — you realise more of your hand than the same cards would from the blinds. Widen accordingly.',
  },
  'position-early': {
    label: 'Playing from early position',
    tip: 'With several players still to act you need a hand that can stand pressure. This is the seat where discipline is worth the most.',
  },
};

export function conceptLabel(conceptId) {
  return CONCEPT_INFO[conceptId]?.label || conceptId;
}

export function conceptTip(conceptId) {
  return CONCEPT_INFO[conceptId]?.tip || '';
}
