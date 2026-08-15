// Data invariant checker for the GTO scenario library.
// Run with: npm run validate
//
// Invariants enforced:
// - Every card is a valid rank+suit; no card appears twice in a spot
// - Action frequencies are multiples of 25 and sum to 100
// - Actions mixed at positive frequency have EVs within 0.05 BB of each
//   other (equilibrium indifference)
// - Zero-frequency actions have strictly lower EV than every mixed action
// - bestAction is part of the mix and has the highest frequency (ties OK)
// - Fold is offered if and only if the spot has a facingBet
// - Suit permutation round-trips cleanly (variation engine safety)
// - Explanations contain no suit-specific words that a permutation would
//   contradict
// - Every drill has scenarios and vice versa; logic tags all exist

import {
  SCENARIOS,
  DRILLS,
  LOGIC_TAGS,
  gradeAction,
  randomSuitPermutation,
  permuteScenarioSuits,
} from '../src/data/gtoData.js';

const errors = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);

const CARD_RE = /^[AKQJT98765432][shdc]$/;
const SUIT_WORDS = /\b(hearts?|clubs?|diamonds?|spades?)\b|\b[AKQJT2-9][shdc]\b/;

function checkScenario(s, idSuffix = '') {
  const id = s.id + idSuffix;
  const cards = [...s.board.flop, s.board.turn, s.board.river, ...s.heroHand].filter(Boolean);
  if (new Set(cards).size !== cards.length) err(id, `duplicate card in [${cards}]`);
  for (const c of cards) if (!CARD_RE.test(c)) err(id, `invalid card "${c}"`);

  const acts = s.gtoStrategy.actions;
  const freqSum = acts.reduce((t, a) => t + a.frequency, 0);
  if (freqSum !== 100) err(id, `frequencies sum to ${freqSum}`);
  for (const a of acts) if (a.frequency % 25 !== 0) err(id, `${a.action} frequency ${a.frequency} not a multiple of 25`);

  const mixed = acts.filter(a => a.frequency > 0);
  const maxEv = Math.max(...mixed.map(a => a.ev));
  const minEv = Math.min(...mixed.map(a => a.ev));
  if (maxEv - minEv > 0.051) err(id, `mixed-action EV gap ${(maxEv - minEv).toFixed(2)} > 0.05`);
  for (const a of acts.filter(a => a.frequency === 0)) {
    if (a.ev >= minEv) err(id, `zero-freq ${a.action} EV ${a.ev} not below mixed minimum ${minEv}`);
  }

  const best = acts.find(a => a.action === s.gtoStrategy.bestAction);
  if (!best || best.frequency === 0) err(id, `bestAction "${s.gtoStrategy.bestAction}" not in the mix`);
  const maxFreq = Math.max(...acts.map(a => a.frequency));
  if (best && best.frequency < maxFreq) err(id, `bestAction frequency ${best.frequency} < max ${maxFreq}`);

  const hasFold = acts.some(a => a.action === 'fold');
  if (s.facingBet && !hasFold) err(id, 'facing a bet but no fold action');
  if (!s.facingBet && hasFold) err(id, 'fold offered with no bet to face');

  for (const tag of s.gtoStrategy.logicTags) {
    if (!LOGIC_TAGS[tag]) err(id, `unknown logic tag "${tag}"`);
  }

  if (SUIT_WORDS.test(s.gtoStrategy.explanation)) {
    err(id, 'explanation references a specific suit/card — breaks under suit permutation');
  }

  // Grading sanity: frequency-first thresholds hold
  for (const a of acts) {
    const g = gradeAction(s.gtoStrategy, a.action);
    if (a.frequency >= 50 && g.grade !== 'perfect') err(id, `${a.action} freq ${a.frequency} graded ${g.grade}`);
    if (a.frequency === 25 && g.grade !== 'good') err(id, `${a.action} freq 25 graded ${g.grade}`);
    if (a.frequency === 0 && (g.grade === 'perfect' || g.grade === 'good')) err(id, `${a.action} freq 0 graded ${g.grade}`);
  }
}

let total = 0;
for (const [drillId, spots] of Object.entries(SCENARIOS)) {
  if (!DRILLS.some(d => d.id === drillId)) err(drillId, 'scenarios exist but drill is not registered');
  if (spots.length === 0) err(drillId, 'drill has no scenarios');
  const seen = new Set();
  for (const s of spots) {
    if (seen.has(s.id)) err(s.id, 'duplicate scenario id');
    seen.add(s.id);
    checkScenario(s);
    // Variation-engine safety: a random permutation must also validate
    checkScenario(permuteScenarioSuits(s, randomSuitPermutation()), ' (permuted)');
  }
  total += spots.length;
  console.log(`${drillId}: ${spots.length} spots OK${errors.length ? '?' : ''}`);
}
for (const d of DRILLS) {
  if (!SCENARIOS[d.id]) err(d.id, 'drill registered but has no scenarios');
}

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log(`\nAll invariants hold across ${total} spots.`);
