// Turn a raw TexasSolver dump into a compact training chunk.
//
// Raw dumps are far too large to ship (a single flop street is ~300KB, and all
// three streets would run to gigabytes). The trainer needs very little of it:
// for each decision node we keep the action list and, per hand combo, the
// action frequencies and EVs.
//
// On the EV convention — verified empirically, see ../NOTES.md: TexasSolver's
// EVs are net chips relative to the start of the subgame, so folding is worth
// -(your own contribution to the pot), not 0. That offset is identical for
// every hand at a node, which means EV *differences* between actions are
// unaffected by it — and differences are all that grading needs. We keep the
// raw values and record the fold baseline alongside, rather than silently
// rebasing numbers the solver reported.

/** Solver action strings look like "CHECK", "CALL", "FOLD", "BET 25.000000". */
export function parseAction(raw, potAtNode) {
  const [verb, amountText] = raw.split(' ');
  const kind = verb.toLowerCase();
  if (amountText === undefined) return { kind, raw, amount: null, pctPot: null };
  const amount = Number(amountText);
  return {
    kind,
    raw,
    amount,
    pctPot: potAtNode > 0 ? Math.round((amount / potAtNode) * 1000) / 10 : null,
  };
}

/**
 * Walk the dump depth-first, yielding every action node with its action path.
 * Chance nodes are traversed but never emitted — they carry no strategy.
 */
export function* walkNodes(node, path = []) {
  if (!node || typeof node !== 'object') return;
  if (node.node_type === 'action_node' && node.strategy) {
    yield { node, path };
  }
  const children = node.childrens || node.children;
  if (children) {
    for (const [action, child] of Object.entries(children)) {
      yield* walkNodes(child, [...path, action]);
    }
  }
}

/**
 * Extract one node into the compact per-combo form.
 * Returns null when the node has no EV block, which is how a dump from an
 * unpatched solver announces itself — better to fail loudly upstream than to
 * ship a chunk with frequencies and no EVs.
 */
export function extractNode({ node, path }, { potAtNode }) {
  const strategy = node.strategy?.strategy;
  const actionsRaw = node.strategy?.actions;
  const evs = node.evs?.evs;
  if (!strategy || !actionsRaw) return null;
  if (!evs) {
    throw new Error(
      'Dump has no "evs" block. Build the solver with solver/patches/0001-dump-evs.patch — see solver/NOTES.md',
    );
  }

  const actions = actionsRaw.map((a) => parseAction(a, potAtNode));
  const foldIndex = actions.findIndex((a) => a.kind === 'fold');

  const combos = [];
  for (const [combo, freqs] of Object.entries(strategy)) {
    const ev = evs[combo];
    if (!ev) continue;
    combos.push({
      combo,
      freq: freqs.map((f) => Math.round(f * 10000) / 10000),
      ev: ev.map((v) => Math.round(v * 1000) / 1000),
    });
  }

  // Folding costs the same for every hand, so a varying fold column means the
  // solve or the extraction is wrong. Cheap, exact integrity check.
  let foldEV = null;
  if (foldIndex >= 0 && combos.length > 0) {
    const values = combos.map((c) => c.ev[foldIndex]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max - min > 0.01) {
      throw new Error(`Fold EV varies across hands (${min}..${max}) at ${path.join('/') || 'root'}`);
    }
    foldEV = min;
  }

  return {
    path: path.join('/'),
    actor: node.player,
    actions: actions.map((a) => ({ kind: a.kind, raw: a.raw, amount: a.amount, pctPot: a.pctPot })),
    foldEV,
    comboCount: combos.length,
    combos,
  };
}

/** Extract every action node from a dump. */
export function extractDump(dump, { pot }) {
  const nodes = [];
  for (const entry of walkNodes(dump)) {
    // Pot only grows as wagers go in; using the root pot understates it at
    // deeper nodes, so pctPot is advisory. The action's absolute `amount` is
    // authoritative and is what the app displays.
    const extracted = extractNode(entry, { potAtNode: pot });
    if (extracted) nodes.push(extracted);
  }
  return nodes;
}
