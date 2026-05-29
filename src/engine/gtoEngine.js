// ── Ironclad GTO Engine ──
// Single source of truth for strategy consistency.
//
// Core GTO principle enforced here: at equilibrium, every action played with a
// POSITIVE frequency must have (approximately) equal expected value — that is
// why the solver is willing to mix between them. Actions played with ZERO
// frequency are strictly dominated and therefore have a lower EV.
//
// normalizeStrategy() derives EVs *from* the mixing frequencies so that the two
// can never contradict each other. This makes grading deterministic and the
// "best action" unambiguous: the highest-frequency line is always (tied for)
// the highest EV.

// The four actions the player always chooses between, in fixed display order.
export const CANONICAL_ACTIONS = ['check', 'bet33', 'bet75', 'betPot'];

export const ACTION_META = {
  check: { defaultLabel: 'Check', sizeMultiplier: 0 },
  bet33: { defaultLabel: 'Bet 33%', sizeMultiplier: 0.33 },
  bet75: { defaultLabel: 'Bet 75%', sizeMultiplier: 0.75 },
  betPot: { defaultLabel: 'Overbet', sizeMultiplier: 1.25 },
};

const round2 = (v) => Math.round(v * 100) / 100;
const round25 = (v) => Math.round(v / 25) * 25;
const clampFreq = (v) => Math.max(0, Math.min(100, round25(v || 0)));

// EV offsets relative to the equilibrium value, keyed by mixing frequency.
// Positive-frequency lines are near-indifferent (tiny gaps); zero-frequency
// lines are penalised according to how dominated the authored data says they are.
function evForFrequency(frequency, anchorEV, authoredGap) {
  if (frequency >= 100) return anchorEV;
  if (frequency >= 75) return anchorEV - 0.02;
  if (frequency >= 50) return anchorEV - 0.05;
  if (frequency >= 25) return anchorEV - 0.14;
  // Zero frequency → genuinely worse. Respect the authored gap when present so
  // wildly dominated lines read as blunders and marginal ones as inaccuracies.
  const penalty = Math.min(Math.max(authoredGap ?? 0.7, 0.55), 2.4);
  return anchorEV - penalty;
}

/**
 * Make a strategy internally consistent and guarantee all four canonical
 * actions are present. Pure — never mutates the input.
 *
 * @param {object} strategy { actions:[{action,frequency,ev?,label?,size?}], ... }
 * @param {number} potSize  pot size in BB, used to derive bet sizings
 */
export function normalizeStrategy(strategy, potSize = 0) {
  const byAction = {};
  for (const a of strategy.actions || []) {
    byAction[a.action] = { ...a };
  }

  // Anchor = best authored EV (the equilibrium value of the spot).
  const authoredEvs = Object.values(byAction)
    .map((a) => (typeof a.ev === 'number' ? a.ev : null))
    .filter((v) => v != null);
  const anchorEV = authoredEvs.length ? Math.max(...authoredEvs) : round2(potSize * 0.5);

  // Capture authored gaps before we overwrite EVs.
  const authoredGap = {};
  for (const act of CANONICAL_ACTIONS) {
    const a = byAction[act];
    authoredGap[act] = a && typeof a.ev === 'number' ? Math.max(anchorEV - a.ev, 0) : null;
  }

  // Ensure every canonical action exists, in canonical order.
  const actions = CANONICAL_ACTIONS.map((act) => {
    const meta = ACTION_META[act];
    const existing = byAction[act] || { action: act, frequency: 0 };
    return {
      action: act,
      label: existing.label || meta.defaultLabel,
      frequency: clampFreq(existing.frequency),
      _meta: meta,
    };
  });

  // Frequencies must sum to exactly 100.
  let total = actions.reduce((s, a) => s + a.frequency, 0);
  if (total === 0) {
    actions[0].frequency = 100; // default to checking if nothing was specified
    total = 100;
  }
  if (total !== 100) {
    const maxA = actions.reduce((b, a) => (a.frequency > b.frequency ? a : b), actions[0]);
    maxA.frequency = clampFreq(maxA.frequency + (100 - total));
  }

  // Derive consistent EVs + sizings.
  for (const a of actions) {
    a.ev = round2(evForFrequency(a.frequency, anchorEV, authoredGap[a.action]));
    if (a._meta.sizeMultiplier > 0) {
      a.size = round2(potSize * a._meta.sizeMultiplier);
    }
    delete a._meta;
  }

  // Best action = highest EV, tie-broken by frequency. Guaranteed to be a
  // positive-frequency line because those carry the anchor EV.
  const bestAction = actions.reduce((best, a) => {
    if (a.ev > best.ev) return a;
    if (a.ev === best.ev && a.frequency > best.frequency) return a;
    return best;
  }, actions[0]).action;

  return { ...strategy, actions, bestAction };
}

// EV lost (in BB) by choosing a given action vs the best line.
export function evLoss(strategy, chosenAction) {
  const bestEV = Math.max(...strategy.actions.map((a) => a.ev));
  const chosen = strategy.actions.find((a) => a.action === chosenAction);
  return Math.max(0, bestEV - (chosen?.ev ?? bestEV));
}
