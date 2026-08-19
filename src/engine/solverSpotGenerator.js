// Build a training spot from real solver output.
//
// This inverts how spots used to be made. A hand-authored spot starts from a
// lesson and invents numbers to suit it; a solver spot starts from a decision
// node the solver actually computed and picks a hand to face it with. The
// numbers are whatever the solver said, which is the entire point.
//
// The output is exactly the scenario shape scenarioGenerator.js already emits,
// so TableView, ActionBar and StrategyFeedback need no changes at all.

import { encodeAction } from '../solver/nodeKey';

/** Solver verbs → the action ids the UI already knows, sized where relevant. */
export function mapAction(rawAction, potAtNode, effectiveStack) {
  const [verb, amountText] = String(rawAction).split(' ');
  const kind = verb.toLowerCase();
  const amount = amountText === undefined ? null : Number(amountText);

  if (kind === 'check') return { action: 'check', label: 'Check' };
  if (kind === 'fold') return { action: 'fold', label: 'Fold' };
  if (kind === 'call') return { action: 'call', label: 'Call', size: amount ?? undefined };

  // Validate the verb before anything else. The all-in shortcut below matches on
  // amount alone, so checking it first would silently relabel an unrecognised
  // action as an all-in instead of failing — exactly the kind of quiet
  // mis-mapping that would corrupt a whole dataset without anyone noticing.
  const letter = kind === 'bet' ? 'b' : kind === 'raise' ? 'r' : null;
  if (letter === null) throw new Error(`Unknown solver action: ${rawAction}`);

  // An all-in is not a bet size — labelling it "Bet 1764%" would be absurd, and
  // the solver reaches it via set_allin_threshold rather than a configured size.
  // The amount can sit slightly under the nominal effective stack (the solver
  // emitted 97.0 against a 97.5 stack), so this compares proportionally.
  if (effectiveStack && amount !== null && amount >= effectiveStack * 0.95) {
    return { action: 'allin', label: 'All-in', size: amount };
  }

  const pct = Math.round((amount / potAtNode) * 100);
  if (letter === 'b') return { action: `bet${pct}`, label: `Bet ${pct}%`, size: amount };
  return { action: `raise${pct}`, label: `Raise ${pct}%`, size: amount };
}

/**
 * How much a combo is worth being asked about.
 *
 * A hand the solver always plays one way teaches nothing — aces bet, seven-deuce
 * folds, and the player learns only that they already knew. The instructive
 * spots are the mixed ones, where the decision is genuinely close. Weighting by
 * mixedness is the cheap version of the "sample near the decision boundary"
 * idea already used in preflopGenerator.js.
 */
export function decisionRelevance(freqs) {
  const max = Math.max(...freqs);
  return 1 - max; // 0 for a pure strategy, up to 1 - 1/n for a fully mixed one
}

/** Weighted pick without replacement bias; `rng` is injectable for tests. */
function weightedIndex(weights, rng) {
  const total = weights.reduce((a, b) => a + b, 0);
  if (!(total > 0)) return 0;
  let roll = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}

/**
 * Choose which hand to ask about at this node.
 * `pureFloor` keeps some pure-strategy hands in the mix — a trainer that only
 * ever showed knife-edge decisions would misrepresent how the spot actually
 * plays, and recognising an easy spot quickly is a real skill.
 */
export function pickCombo(node, { rng = Math.random, pureFloor = 0.15 } = {}) {
  const nActions = node.actions.length;
  const weights = node.combos.map((c) => pureFloor + decisionRelevance(c.freq.slice(0, nActions)));
  return weightedIndex(weights, rng);
}

/**
 * The wager hero is facing, read off the path that reached this node.
 *
 * The node's own action list describes what hero may do next — which includes
 * hero's raise option — so it cannot answer "what am I facing". The last sized
 * action in the path can.
 */
export function facingBetFromPath(path) {
  if (!path) return undefined;
  const sized = String(path)
    .split('/')
    .map((seg) => seg.match(/^(BET|RAISE) ([\d.]+)$/))
    .filter(Boolean);
  if (sized.length === 0) return undefined;
  return Number(sized[sized.length - 1][2]);
}

/** Parse "AcKs" into ['Ac', 'Ks']. */
export function splitCombo(combo) {
  const cards = String(combo).match(/[AKQJT2-9][shdc]/g);
  if (!cards || cards.length !== 2) throw new Error(`Malformed combo: ${combo}`);
  return cards;
}

/**
 * Build a scenario from a chunk node.
 *
 * EVs are passed through exactly as the solver reported them (net chips from
 * the start of the subgame). Grading uses differences, which that baseline does
 * not affect, and rebasing them would misrepresent what the solver said.
 */
export function buildSolverScenario({ chunk, node, comboIndex, heroPosition, villainPosition, idPrefix = 'solver' }) {
  const combo = node.combos[comboIndex];
  if (!combo) throw new Error(`No combo at index ${comboIndex}`);

  const potAtNode = chunk.pot;
  const actions = node.actions.map((a, i) => ({
    ...mapAction(a.raw, potAtNode, chunk.effectiveStack),
    frequency: Math.round(combo.freq[i] * 1000) / 10, // percent, one decimal
    ev: combo.ev[i],
  }));

  // Highest frequency, not highest EV. In a mixed strategy the EVs are equal by
  // construction, so EV order there is convergence noise; frequency is what the
  // solver is actually telling you to do.
  const best = actions.reduce((a, b) => (b.frequency > a.frequency ? b : a));

  // What hero faces is in the path that led here, NOT in the actions available
  // now. Reading it off the action list finds hero's own raise option and
  // reports a 2bb bet as a 97bb one.
  const facing = facingBetFromPath(node.path);
  const heroFacesBet = node.actions.some((a) => a.kind === 'fold');

  return {
    id: `${idPrefix}-${chunk.configId}-${chunk.board.join('')}-${node.path || 'root'}-${combo.combo}`,
    board: { flop: chunk.board.slice(0, 3), turn: chunk.board[3] ?? null, river: chunk.board[4] ?? null },
    heroHand: splitCombo(combo.combo),
    heroPosition,
    villainPosition,
    potSize: potAtNode,
    effectiveStack: chunk.effectiveStack,
    street: chunk.board.length >= 5 ? 'river' : chunk.board.length === 4 ? 'turn' : 'flop',
    decisionMode: heroFacesBet ? 'defend' : 'bet',
    facingBet: heroFacesBet ? facing : undefined,
    gtoStrategy: {
      actions,
      bestAction: best.action,
      // Frequencies are continuous here, never rounded to 0/25/50/75/100 —
      // that rounding is exactly the fiction this pipeline exists to remove.
      solverMeta: {
        nodePath: node.path,
        comboIndex,
        foldEV: node.foldEV,
        exploitability: chunk.solver?.exploitability ?? null,
        converged: chunk.solver?.converged ?? null,
      },
    },
    _meta: { source: 'solver', configId: chunk.configId },
  };
}

/** Convenience: pick a hand at a node and build the scenario in one call. */
export function generateSolverSpot({ chunk, node, rng = Math.random, heroPosition, villainPosition }) {
  const comboIndex = pickCombo(node, { rng });
  return buildSolverScenario({ chunk, node, comboIndex, heroPosition, villainPosition });
}

export { encodeAction };
