// Mastery tracking and spaced repetition.
//
// The point of this module is the difference between "playing a lot of hands"
// and "getting better". A trainer that deals uniformly random spots lets you
// keep dodging the thing you are worst at. This tracks per-concept mastery,
// schedules missed concepts to come back, and steers difficulty toward the
// band where learning actually happens.

// Leitner boxes. Intervals are measured in hands played, not wall-clock time —
// study sessions here are bursty, and "see this again in 3 days" is useless if
// the next session is 20 minutes long.
const BOX_INTERVALS = [2, 5, 12, 30, 70, 150];
const MAX_BOX = BOX_INTERVALS.length - 1;

// A miss drops you two boxes rather than back to zero: fully resetting a
// concept you have answered correctly forty times over-corrects for one slip.
const DEMOTION = 2;

// Weight on the most recent attempt when smoothing a concept's accuracy.
// 0.2 means roughly the last ~10 attempts dominate the estimate.
const EMA_ALPHA = 0.2;

// A concept counts as a leak once there is enough evidence to trust the number.
const MIN_ATTEMPTS_FOR_LEAK = 4;

export function emptyConcept() {
  return {
    attempts: 0,
    correct: 0,
    evLossSum: 0,
    accuracyEMA: null, // null until first attempt, so untried != 0% accurate
    box: 0,
    dueAtHand: 0,
    lastSeenHand: 0,
  };
}

/**
 * Fold one graded answer into a concept's mastery record.
 * @param {object|undefined} concept existing record, or undefined if new
 * @param {{isCorrect: boolean, evLoss: number, handCounter: number}} outcome
 */
export function recordAttempt(concept, { isCorrect, evLoss, handCounter }) {
  const prev = concept || emptyConcept();

  const box = isCorrect
    ? Math.min(MAX_BOX, prev.box + 1)
    : Math.max(0, prev.box - DEMOTION);

  const accuracyEMA = prev.accuracyEMA === null
    ? (isCorrect ? 1 : 0)
    : prev.accuracyEMA + EMA_ALPHA * ((isCorrect ? 1 : 0) - prev.accuracyEMA);

  return {
    attempts: prev.attempts + 1,
    correct: prev.correct + (isCorrect ? 1 : 0),
    evLossSum: Math.round((prev.evLossSum + evLoss) * 100) / 100,
    accuracyEMA,
    box,
    dueAtHand: handCounter + BOX_INTERVALS[box],
    lastSeenHand: handCounter,
  };
}

/**
 * Concepts whose review interval has elapsed, worst-mastered first.
 * These are what the generator should preferentially deal.
 */
export function getDueConcepts(concepts, handCounter, limit = 5) {
  return Object.entries(concepts)
    .filter(([, c]) => c.attempts > 0 && handCounter >= c.dueAtHand)
    .sort((a, b) => {
      // Overdue-ness first (a concept 40 hands past due matters more than one
      // that just came due), then weakest mastery.
      const overdueA = handCounter - a[1].dueAtHand;
      const overdueB = handCounter - b[1].dueAtHand;
      if (overdueB !== overdueA) return overdueB - overdueA;
      return (a[1].accuracyEMA ?? 1) - (b[1].accuracyEMA ?? 1);
    })
    .slice(0, limit)
    .map(([id]) => id);
}

/**
 * The concepts costing the most EV — what to actually work on this week.
 * Ranked by total EV bled, not by accuracy: a spot you misplay badly twice a
 * session is worth more attention than one you get slightly wrong constantly.
 */
export function getLeaks(concepts, limit = 3) {
  return Object.entries(concepts)
    .filter(([, c]) => c.attempts >= MIN_ATTEMPTS_FOR_LEAK)
    .map(([id, c]) => ({
      conceptId: id,
      attempts: c.attempts,
      accuracy: c.correct / c.attempts,
      evLossPerHand: c.evLossSum / c.attempts,
      totalEVLoss: c.evLossSum,
    }))
    .filter(c => c.evLossPerHand > 0.05)
    .sort((a, b) => b.evLossPerHand - a.evLossPerHand)
    .slice(0, limit);
}

export function getMasteredConcepts(concepts, threshold = 0.85) {
  return Object.entries(concepts)
    .filter(([, c]) => c.attempts >= MIN_ATTEMPTS_FOR_LEAK && (c.accuracyEMA ?? 0) >= threshold)
    .map(([id]) => id);
}

// ── Adaptive difficulty ──────────────────────────────────────────────────
//
// An Elo-style rating rather than a raw accuracy threshold: it settles
// smoothly, survives a bad run without collapsing, and gives one honest number
// to compare against last week's.

export const RATING_FLOOR = 600;
export const RATING_CEILING = 2000;
const K_FACTOR = 24;

/** Map a 1-10 scenario difficulty onto the rating scale. */
export function difficultyToRating(difficulty) {
  const clamped = Math.max(1, Math.min(10, difficulty));
  return RATING_FLOOR + ((clamped - 1) / 9) * (RATING_CEILING - RATING_FLOOR);
}

export function ratingToDifficulty(rating) {
  const clamped = Math.max(RATING_FLOOR, Math.min(RATING_CEILING, rating));
  return 1 + ((clamped - RATING_FLOOR) / (RATING_CEILING - RATING_FLOOR)) * 9;
}

/**
 * Update the player's rating after one graded hand.
 * Partial credit for an inaccuracy keeps a near-miss from reading the same as
 * a blunder — the rating tracks EV bled, which is what actually costs money.
 */
export function updateRating(rating, { difficulty, grade }) {
  const scenarioRating = difficultyToRating(difficulty);
  const expected = 1 / (1 + Math.pow(10, (scenarioRating - rating) / 400));

  const actual = { perfect: 1, acceptable: 0.85, inaccuracy: 0.4, blunder: 0 }[grade] ?? 0;

  const next = rating + K_FACTOR * (actual - expected);
  return Math.round(Math.max(RATING_FLOOR, Math.min(RATING_CEILING, next)));
}

/**
 * Difficulty to deal next.
 *
 * Aimed slightly below the player's rating so the steady state lands near
 * 75-80% correct. Constant success teaches nothing and constant failure just
 * burns people out; the useful zone is the one that is still uncomfortable.
 */
export function nextDifficulty(rating, { jitter = Math.random } = {}) {
  const centre = ratingToDifficulty(rating) - 0.5;
  const spread = (jitter() - 0.5) * 2.5;
  return Math.max(1, Math.min(10, Math.round(centre + spread)));
}

export const _internals = { BOX_INTERVALS, MAX_BOX, DEMOTION, EMA_ALPHA, MIN_ATTEMPTS_FOR_LEAK };
