// Builds preflop scenarios whose correct answer is derived, not asserted.
//
// The postflop generator picks a template and reads its hand-authored
// frequencies. Nothing here works that way: given a spot's stated villain range
// and its exact price, hero's equity is looked up from the computed table and
// the correct action falls out of the comparison. Change the range and the
// answer changes with it, because the answer was never written down.

import { PREFLOP_SPOTS } from '../data/preflopSpots';
import { equityVsRange, notationOfHand } from './equity';
import { breakEvenEquity, potOddsRatio } from './odds';
import { combosOf, ALL_CLASSES, classNotation } from './handClass';
import { assignEVs } from './strategyCalculator';
import { formatCard } from './handRank';
import { preflopConceptsOf } from '../data/concepts';

let counter = 0;

function pickRandom(arr, rng) {
  return arr[Math.floor((rng ? rng() : Math.random()) * arr.length)];
}

/**
 * Margin, in equity points, inside which a decision counts as genuinely close.
 * Choosing either action within this band is defensible: the equity table is
 * accurate to a few tenths of a point, and no real opponent's range is known to
 * better than a couple of points anyway. Grading a 0.3-point miss as an error
 * would be false precision of exactly the kind this app is trying to remove.
 */
export const CLOSE_MARGIN = 0.02;

/**
 * Deal a hand for a spot, biased toward the decision boundary.
 *
 * Dealing uniformly would spend most of the session on hands nobody misplays —
 * aces are a snap-call and seven-deuce is a snap-fold, and neither teaches
 * anything. The hands worth practising are the ones near the threshold, so
 * those are dealt more often.
 */
/**
 * Equity hero needs to break even calling in this spot.
 *
 * `potBeforeAction` is everything in the middle before hero acts and already
 * excludes hero's call, so it goes straight into the formula. Subtracting
 * `toCall` from it — as an earlier version did — takes out money that was never
 * in there, and put the threshold for a 3-bet spot at 60.7% instead of 37.8%.
 */
function requiredEquityFor(spot) {
  return breakEvenEquity(spot.toCall, spot.potBeforeAction);
}

export function dealHandForSpot(spot, rng, { boundaryBias = 0.7 } = {}) {
  const required = requiredEquityFor(spot);

  if ((rng ? rng() : Math.random()) < boundaryBias) {
    const nearBoundary = classesNearBoundary(spot, required);
    if (nearBoundary.length > 0) return dealFromClass(pickRandom(nearBoundary, rng), rng);
  }

  return dealFromClass(pickRandom(ALL_CLASSES, rng), rng);
}

// Which classes sit close to this spot's threshold. Cached per spot: it is a
// 169-entry equity sweep and the spot list is fixed.
const boundaryCache = new Map();
function classesNearBoundary(spot, required) {
  const cached = boundaryCache.get(spot.id);
  if (cached) return cached;

  const near = ALL_CLASSES.filter(classIndex => {
    const [c1, c2] = combosOf(classIndex)[0];
    const hand = [formatCard(c1), formatCard(c2)];
    const { equity } = equityVsRange(hand, spot.villainRange);
    return Math.abs(equity - required) < 0.08;
  });

  boundaryCache.set(spot.id, near);
  return near;
}

function dealFromClass(classIndex, rng) {
  const combos = combosOf(classIndex);
  const [c1, c2] = pickRandom(combos, rng);
  return [formatCard(c1), formatCard(c2)];
}

/**
 * Everything computed about a hand in a spot. Separated from scenario building
 * so the UI and the tests can both ask for the maths without a scenario.
 */
export function analysePreflop(spot, hand) {
  const requiredEquity = requiredEquityFor(spot);
  const { equity, combos } = equityVsRange(hand, spot.villainRange);
  const margin = equity - requiredEquity;

  return {
    handNotation: notationOfHand(hand),
    requiredEquity,
    equity,
    margin,
    potOdds: potOddsRatio(spot.toCall, spot.potBeforeAction),
    potToWin: spot.potBeforeAction,
    villainCombos: combos,
    clears: margin > 0,
    close: Math.abs(margin) <= CLOSE_MARGIN,
  };
}

/**
 * The action frequencies implied by the analysis.
 *
 * Deliberately not a lookup. A hand that clears the price by a mile is a pure
 * call; one that misses by a mile is a pure fold; one within the close margin
 * is a genuine mix, and both actions grade as correct because both are
 * defensible.
 */
export function strategyFor(analysis) {
  const { margin, close } = analysis;

  if (close) return { call: 50, fold: 50 };
  if (margin > 0.10) return { call: 100, fold: 0 };
  if (margin > 0) return { call: 75, fold: 25 };
  if (margin > -0.10) return { call: 25, fold: 75 };
  return { call: 0, fold: 100 };
}

function buildExplanation(spot, analysis) {
  const pct = (v) => `${(v * 100).toFixed(1)}%`;
  const { handNotation, requiredEquity, equity, margin, potOdds, villainCombos } = analysis;

  const price = `You are calling ${spot.toCall} to win the ${spot.potBeforeAction.toFixed(1)} already in the middle, ` +
    `which is ${potOdds.toFixed(1)}-to-1 and needs ${pct(requiredEquity)} to break even.`;

  const versus = `${handNotation} has ${pct(equity)} against the ${villainCombos.toFixed(0)} combos ` +
    `assumed for ${spot.villainPosition}.`;

  const verdict = analysis.close
    ? `That is within ${(CLOSE_MARGIN * 100).toFixed(0)} points of the threshold — genuinely a coin flip, and either action is fine.`
    : margin > 0
      ? `That clears the bar by ${pct(Math.abs(margin))}, so calling shows a profit.`
      : `That misses the bar by ${pct(Math.abs(margin))}, so calling loses money.`;

  // The caveat that keeps this honest. Raw equity assumes you get to realise
  // all of it, which is false out of position with streets left to play.
  const caveat = spot.exact
    ? 'There are no streets left, so this equity is exactly your equity — nothing is being approximated here.'
    : 'Raw equity is the ceiling, not the reality: out of position with three streets to play you will realise less than this, ' +
      'so treat clearing the bar as necessary rather than sufficient. This is why calling too wide from the blinds is the most ' +
      'common leak in low-stakes cash.';

  return `${price} ${versus} ${verdict}\n\n${caveat}`;
}

/**
 * Build a playable preflop scenario.
 *
 * @param {object} [options]
 * @param {string[]} [options.concepts] concept ids due for review
 * @param {() => number} [options.rng] injectable for deterministic tests
 */
export function generatePreflopScenario(options = {}) {
  const { concepts = [], rng } = options;

  const pool = concepts.length > 0
    ? PREFLOP_SPOTS.filter(s => {
      const tags = preflopConceptsOf(s, 'AA');
      return concepts.includes(tags.primary) || concepts.includes(tags.secondary);
    })
    : PREFLOP_SPOTS;

  const spot = pickRandom(pool.length > 0 ? pool : PREFLOP_SPOTS, rng);
  const hand = dealHandForSpot(spot, rng);
  const analysis = analysePreflop(spot, hand);
  const frequencies = strategyFor(analysis);

  // EVs come from the same indifference machinery the postflop generator uses,
  // deliberately.
  //
  // They could instead be derived from equity and pot odds, since both are
  // exact here — but that EV assumes full equity realisation, which is false
  // out of position and would systematically overvalue calling. A number
  // computed from a false premise is not more honest than an admitted model
  // output; here it would be worse, because it is wrong in the specific
  // direction that costs low-stakes players the most money.
  //
  // Sharing the ladder also keeps preflop and postflop EV losses on one scale,
  // which the leak board and the weekly BB/hand metric both require: a mode on
  // a different scale would either dominate those rankings or vanish from them.
  const actions = assignEVs(
    [
      { action: 'fold', label: 'Fold', frequency: frequencies.fold },
      {
        action: 'call',
        label: spot.context === 'vs-jam' ? 'Call All-In' : 'Call',
        frequency: frequencies.call,
        size: spot.toCall,
      },
    ],
    spot.potBeforeAction * 0.3,
    spot.difficulty,
  );

  counter++;

  return {
    id: `preflop-${counter}`,
    street: 'preflop',
    // No board preflop. Downstream code must branch on street rather than
    // assume board.flop exists — see conceptTagger and explanationBuilder.
    board: { flop: null, turn: null, river: null },
    heroHand: hand,
    heroPosition: spot.heroPosition,
    villainPosition: spot.villainPosition,
    potSize: spot.potBeforeAction,
    effectiveStack: 100 - spot.toCall,
    facingBet: spot.toCall,
    decisionMode: 'defend',
    spot,
    analysis,
    concepts: preflopConceptsOf(spot, analysis.handNotation),
    gtoStrategy: {
      actions,
      bestAction: frequencies.call >= frequencies.fold ? 'call' : 'fold',
      acceptableActions: actions.filter(a => a.frequency > 0).map(a => a.action),
      logicTags: [],
      explanation: buildExplanation(spot, analysis),
      // Flags for the UI: which parts of this are computed vs assumed.
      provenance: {
        equity: 'computed',
        price: 'computed',
        villainRange: 'assumed',
        exact: Boolean(spot.exact),
      },
    },
    _meta: {
      spotId: spot.id,
      difficulty: spot.difficulty,
      preflop: true,
    },
  };
}

export { classNotation };
