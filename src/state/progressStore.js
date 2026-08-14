// Single source of truth for everything persisted between sessions.
//
// Previously three files each had their own loadProgress() with a different
// default shape, so whichever screen wrote last decided which fields survived.
// Everything now goes through this module.

const STORAGE_KEY = 'poker-genie-progress-v2';
const LEGACY_KEY = 'poker-genie-progress';
const SCHEMA_VERSION = 2;

// Keep the rolling history bounded — this lives in localStorage, which is
// synchronous and typically capped around 5 MB.
const MAX_WEEKS_RETAINED = 26;
const MAX_REVIEW_QUEUE = 60;

export function emptyProgress() {
  return {
    schemaVersion: SCHEMA_VERSION,

    // Lifetime totals
    xp: 0,
    totalHands: 0,
    totalCorrect: 0,
    totalEVLoss: 0,
    bestStreak: 0,
    handsWithoutBlunder: 0,

    // Drill / arena records
    drillsAttempted: 0,
    drillsCompleted: {},
    perfectDrill: false,
    exploitWins: 0,
    bestArenaFloor: 0,
    bestArenaScore: 0,
    arenaBossesDefeated: 0,

    unlockedAchievements: [],

    // Learning state
    concepts: {},      // conceptId -> mastery record (see masteryModel.js)
    reviewQueue: [],   // conceptIds due for spaced repetition
    weeks: {},         // ISO week key -> aggregate stats (see weeklyStats.js)
    skillRating: 1000, // adaptive difficulty anchor
    lastPlayedAt: null,
  };
}

function migrate(raw) {
  const base = emptyProgress();
  if (!raw || typeof raw !== 'object') return base;

  // v1 had no schemaVersion and no learning state. Its lifetime counters map
  // across directly; the learning fields simply start empty.
  const merged = { ...base, ...raw, schemaVersion: SCHEMA_VERSION };

  // Guard against a partially-written or hand-edited payload: any field that
  // came back with the wrong type falls back to its default rather than
  // propagating a crash into the render tree.
  for (const [key, fallback] of Object.entries(base)) {
    const value = merged[key];
    if (value === null || value === undefined) {
      merged[key] = fallback;
      continue;
    }
    if (Array.isArray(fallback) !== Array.isArray(value)) {
      merged[key] = fallback;
      continue;
    }
    if (typeof fallback !== typeof value) merged[key] = fallback;
  }

  return merged;
}

function readRaw() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return JSON.parse(current);

    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return JSON.parse(legacy);
  } catch {
    // Corrupt JSON or storage blocked (private mode, disabled cookies).
    // Falling through to a fresh profile is better than a blank screen.
  }
  return null;
}

let state = migrate(readRaw());
const listeners = new Set();

let flushTimer = null;
let pendingWrite = false;

function writeNow() {
  pendingWrite = false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or storage unavailable — the session still works in
    // memory, it just will not survive a reload.
  }
}

// Every answered hand touches progress. Writing synchronously on each one puts
// a JSON.stringify of the whole profile on the interaction path, so batch it.
function schedulePersist() {
  pendingWrite = true;
  if (flushTimer !== null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    writeNow();
  }, 400);
}

export function flushProgress() {
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (pendingWrite) writeNow();
}

if (typeof window !== 'undefined') {
  // A debounced write loses the last few hands if the tab closes mid-timer.
  window.addEventListener('beforeunload', flushProgress);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushProgress();
  });
}

export function getProgress() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Apply a pure update to the stored profile.
 * @param {(progress: object) => object} updater receives the current profile
 *   and returns the next one. Must not mutate its argument.
 */
export function updateProgress(updater) {
  const next = updater(state);
  if (next === state) return state;

  state = pruneHistory(next);
  schedulePersist();
  listeners.forEach(l => l(state));
  return state;
}

function pruneHistory(progress) {
  const weekKeys = Object.keys(progress.weeks);
  const queueTooLong = progress.reviewQueue.length > MAX_REVIEW_QUEUE;

  if (weekKeys.length <= MAX_WEEKS_RETAINED && !queueTooLong) return progress;

  const pruned = { ...progress };

  if (weekKeys.length > MAX_WEEKS_RETAINED) {
    // Week keys are ISO "YYYY-Www", which sorts chronologically as text.
    const keep = weekKeys.sort().slice(-MAX_WEEKS_RETAINED);
    pruned.weeks = Object.fromEntries(keep.map(k => [k, progress.weeks[k]]));
  }

  if (queueTooLong) {
    pruned.reviewQueue = progress.reviewQueue.slice(-MAX_REVIEW_QUEUE);
  }

  return pruned;
}

export function resetProgress() {
  state = emptyProgress();
  writeNow();
  listeners.forEach(l => l(state));
  return state;
}

export const _internals = { STORAGE_KEY, LEGACY_KEY, SCHEMA_VERSION, migrate };
