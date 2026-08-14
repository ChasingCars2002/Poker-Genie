// Maps each drill onto the slice of the template library it should deal from.
//
// Drills used to be fixed lists of 6-13 handwritten scenarios: you exhausted
// one in a few minutes, and after two passes you were recognising hands rather
// than reading boards. Each drill now generates from these constraints
// forever, with its handwritten scenarios mixed in as anchors.

export const DRILL_PROFILES = {
  'srp-btn-vs-bb': {
    positions: ['IP_VS_BB'],
    potTypes: ['SRP'],
    streets: ['flop'],
  },
  '3bet-oop-caller': {
    positions: ['OOP_VS_IP'],
    potTypes: ['3BET', 'SRP'],
    streets: ['flop', 'turn'],
  },
  'cbet-monotone': {
    textures: ['monotone'],
    streets: ['flop'],
  },
  'sb-defense': {
    positions: ['SB_VS_BTN', 'OOP_VS_IP'],
    streets: ['flop', 'turn'],
  },
  'turn-barrels': {
    streets: ['turn'],
  },
  'river-bluffs': {
    streets: ['river'],
  },

  // The generator only models heads-up pots, so there is no honest way to
  // procedurally deal a three-way flop. Rather than serve heads-up hands under
  // a multiway label, this drill cycles its handwritten multiway scenarios
  // endlessly — genuinely multiway, but a smaller pool that will start
  // repeating. See "Known gaps" in the README.
  'multiway-pots': {
    curatedOnly: true,
    approximated: true,
  },

  // Squeeze pots do have 3-bet-pot templates to draw on, but none of them
  // model the third player, so the handwritten scenarios carry most of the
  // weight here.
  'squeeze-spots': {
    potTypes: ['3BET'],
    streets: ['flop'],
    curatedWeight: 0.65,
    approximated: true,
  },
};

// How often a drill deals one of its handwritten scenarios rather than a
// generated one. The handwritten spots are more precisely reasoned, so they
// stay in rotation; the generated ones supply the variety.
export const DEFAULT_CURATED_WEIGHT = 0.25;

export function profileFor(drillId) {
  return DRILL_PROFILES[drillId] || {};
}

/** Does this template belong in the given drill's pool? */
export function templateMatchesProfile(template, profile) {
  if (profile.streets && !profile.streets.includes(template.street)) return false;
  if (profile.positions && !profile.positions.includes(template.position)) return false;
  if (profile.textures && !profile.textures.includes(template.boardTextureType)) return false;
  if (profile.potTypes && !profile.potTypes.includes(template.potType || 'SRP')) return false;
  return true;
}
