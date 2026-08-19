// Turn a config + flop into a TexasSolver console input file.
//
// The one thing this module exists for: TexasSolver's range parser is far more
// restrictive than the notation the app uses. It accepts only `AA`, `AK`,
// `AKs`, `AKo`, exact combos, and an optional `:weight` — there is no `+` and
// no `-` span, and anything else throws "format not recognize".
//
// So ranges must be pre-expanded, and rangeNotation.js already does exactly
// that expansion for the app. Using it here means the range the solver is fed
// and the range the UI displays are parsed from the same source text by the
// same code, and cannot drift.

import { readFileSync } from 'node:fs';
import { parseRange } from '../../src/engine/rangeNotation.js';
import { classNotation } from '../../src/engine/handClass.js';

/** Strip `#` comment lines and join the rest into one range expression. */
export function readRangeFile(path) {
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((line) => !line.trim().startsWith('#'))
    .join(' ')
    .trim();
}

/**
 * Expand shorthand into the explicit comma list TexasSolver requires.
 * Weights below 0.005 are dropped — the solver ignores them anyway.
 */
export function toSolverRange(text) {
  const parsed = parseRange(text);
  const terms = [];
  for (const [classIndex, weight] of parsed) {
    if (weight <= 0.005) continue;
    const notation = classNotation(classIndex);
    terms.push(weight === 1 ? notation : `${notation}:${weight}`);
  }
  if (terms.length === 0) throw new Error('Range expanded to nothing');
  return terms.join(',');
}

function betSizeLines(betSizes) {
  const lines = [];
  for (const street of ['flop', 'turn', 'river']) {
    const perStreet = betSizes[street];
    if (!perStreet) continue;
    for (const actor of ['oop', 'ip']) {
      const spec = perStreet[actor];
      if (!spec) continue;
      for (const [action, sizes] of Object.entries(spec)) {
        lines.push(`set_bet_sizes ${actor},${street},${action},${sizes.join(',')}`);
      }
      lines.push(`set_bet_sizes ${actor},${street},allin`);
    }
  }
  return lines;
}

/**
 * @param {object}   config      one entry from configs.json
 * @param {string[]} board       3, 4 or 5 cards, e.g. ['As','8h','3c']
 * @param {string}   ipRange     already-expanded solver range string
 * @param {string}   oopRange    already-expanded solver range string
 * @param {string}   dumpPath    where the solver should write its JSON
 * @returns {string} the complete input file
 */
export function buildInput({ config, board, ipRange, oopRange, dumpPath }) {
  return [
    `set_pot ${config.pot}`,
    `set_effective_stack ${config.effectiveStack}`,
    `set_board ${board.join(',')}`,
    `set_range_ip ${ipRange}`,
    `set_range_oop ${oopRange}`,
    ...betSizeLines(config.betSizes),
    `set_allin_threshold ${config.allinThreshold}`,
    'build_tree',
    // One thread, always. The multithreaded solver has a data race that
    // segfaults non-deterministically; parallelism comes from running several
    // of these processes at once. See ../NOTES.md.
    'set_thread_num 1',
    `set_accuracy ${config.accuracy}`,
    `set_max_iteration ${config.maxIteration}`,
    'set_print_interval 10',
    'set_use_isomorphism 1',
    'start_solve',
    // Dump one street only. Dumping all three runs to gigabytes because of
    // turn/river fan-out; later streets come from re-rooted solves instead.
    'set_dump_rounds 1',
    `dump_result ${dumpPath}`,
    '',
  ].join('\n');
}
