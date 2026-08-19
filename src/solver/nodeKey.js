// Stable identifiers for solver decision nodes.
//
// This module is imported by BOTH the offline extractor and the browser
// runtime, on purpose. A node key is the join between a chunk on disk and the
// spot a player is looking at, so if the two sides ever computed keys
// differently the failure would be silent — spots would simply stop being
// found, or worse, be matched to the wrong strategy.
//
// Solver action strings carry absolute amounts and float noise
// ("BET 2.000000"), which makes them unusable as identifiers: the same decision
// has a different string in a different pot. Encoding as a fraction of the pot
// gives a key that is readable, stable across pot sizes, and diffable.

/** Actions in a path are joined by '-' so a key stays greppable. */
const PATH_SEPARATOR = '-';

/**
 * Encode one solver action relative to the pot it faced.
 * check -> 'x', fold -> 'f', call -> 'c', bet 33% -> 'b33', raise 60% -> 'r60'.
 */
export function encodeAction(rawAction, potAtNode) {
  const [verb, amountText] = String(rawAction).split(' ');
  const kind = verb.toLowerCase();
  if (kind === 'check') return 'x';
  if (kind === 'fold') return 'f';
  if (kind === 'call') return 'c';

  const letter = kind === 'bet' ? 'b' : kind === 'raise' ? 'r' : null;
  if (letter === null) throw new Error(`Unknown solver action: ${rawAction}`);
  if (!(potAtNode > 0)) throw new Error(`Cannot encode "${rawAction}" without a positive pot`);

  // Round to whole percent. Solver sizes are configured in whole percentages,
  // so anything else is float noise and rounding is lossless in practice.
  return letter + String(Math.round((Number(amountText) / potAtNode) * 100));
}

/** Encode a full action path. `potsAtNode[i]` is the pot facing action `i`. */
export function encodePath(rawActions, potsAtNode) {
  return rawActions.map((a, i) => encodeAction(a, potsAtNode[i])).join(PATH_SEPARATOR);
}

/**
 * Build a node key.
 *
 *   c0/As8h3c/flop/ip/x        IP's decision after a check
 *   c0/As8h3c/flop/oop/x-b33   OOP facing a 33% c-bet
 *   c0/As8h3c/turn:Kh/ip/x     same, one street later
 *
 * `path` may be a pre-encoded string or an array of encoded actions. An empty
 * path means the first decision of the street, written as '_' so every key has
 * the same number of segments and can be split without special cases.
 */
export function buildNodeKey({ configId, board, street, runout = null, actor, path = '' }) {
  if (!configId) throw new Error('nodeKey needs a configId');
  if (actor !== 'ip' && actor !== 'oop') throw new Error(`actor must be ip or oop, got ${actor}`);

  const boardPart = Array.isArray(board) ? board.join('') : board;
  const streetPart = runout ? `${street}:${runout}` : street;
  const pathPart = (Array.isArray(path) ? path.join(PATH_SEPARATOR) : path) || '_';
  return [configId, boardPart, streetPart, actor, pathPart].join('/');
}

/** Inverse of buildNodeKey. Throws rather than returning a half-parsed object. */
export function parseNodeKey(key) {
  const parts = String(key).split('/');
  if (parts.length !== 5) throw new Error(`Malformed node key: ${key}`);
  const [configId, boardPart, streetPart, actor, pathPart] = parts;
  if (actor !== 'ip' && actor !== 'oop') throw new Error(`Malformed actor in node key: ${key}`);

  const [street, runout = null] = streetPart.split(':');
  const board = boardPart.match(/[AKQJT2-9][shdc]/g) ?? [];
  if (board.join('') !== boardPart) throw new Error(`Malformed board in node key: ${key}`);

  return {
    configId,
    board,
    street,
    runout,
    actor,
    path: pathPart === '_' ? '' : pathPart,
  };
}

/** The chunk a node lives in: one file per (config, board, street). */
export function chunkPathFor(key) {
  const { configId, board, street, runout } = parseNodeKey(key);
  const streetPart = runout ? `${street}-${runout}` : street;
  return `${configId}/${board.join('')}/${streetPart}.json`;
}
