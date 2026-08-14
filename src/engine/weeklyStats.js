// Week-over-week progress tracking.
//
// "Am I better than last week?" needs a number that is comparable across
// weeks of different length. Hands played is not it — a 400-hand week and a
// 40-hand week say nothing about skill. The headline metric here is EV lost
// per hand, because that is the only one that maps to money at a real table,
// and it is scale-free.

/**
 * ISO-8601 week key, e.g. "2026-W33". Weeks start Monday.
 * Chosen over "last 7 days" so the boundary is stable — a fixed cutoff means
 * a week's number stops moving once the week ends.
 */
export function isoWeekKey(date = new Date()) {
  // Work on a UTC copy so a late-evening session does not land in a different
  // week than the local calendar shows.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // ISO weeks are numbered by the Thursday they contain.
  const dayNum = d.getUTCDay() || 7; // Sunday is 7, not 0
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function previousWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - 7);
  return isoWeekKey(d);
}

export function emptyWeek() {
  return {
    hands: 0,
    correct: 0,
    perfect: 0,
    inaccuracies: 0,
    blunders: 0,
    evLoss: 0,
    xp: 0,
    sessions: 0,
    ratingStart: null,
    ratingEnd: null,
    days: {}, // ISO date -> hands, for the consistency streak
  };
}

/**
 * Fold one graded hand into its week bucket. Pure — returns a new weeks map.
 */
export function recordHand(weeks, { grade, evLoss, xp, rating, at = new Date() }) {
  const key = isoWeekKey(at);
  const prev = weeks[key] || emptyWeek();
  const dayKey = at.toISOString().slice(0, 10);

  const isCorrect = grade === 'perfect' || grade === 'acceptable';

  return {
    ...weeks,
    [key]: {
      ...prev,
      hands: prev.hands + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      perfect: prev.perfect + (grade === 'perfect' ? 1 : 0),
      inaccuracies: prev.inaccuracies + (grade === 'inaccuracy' ? 1 : 0),
      blunders: prev.blunders + (grade === 'blunder' ? 1 : 0),
      evLoss: Math.round((prev.evLoss + evLoss) * 100) / 100,
      xp: prev.xp + xp,
      ratingStart: prev.ratingStart === null ? rating : prev.ratingStart,
      ratingEnd: rating,
      days: { ...prev.days, [dayKey]: (prev.days[dayKey] || 0) + 1 },
    },
  };
}

export function markSession(weeks, at = new Date()) {
  const key = isoWeekKey(at);
  const prev = weeks[key] || emptyWeek();
  return { ...weeks, [key]: { ...prev, sessions: prev.sessions + 1 } };
}

export function summariseWeek(week) {
  if (!week || week.hands === 0) return null;
  return {
    hands: week.hands,
    accuracy: week.correct / week.hands,
    perfectRate: week.perfect / week.hands,
    blunderRate: week.blunders / week.hands,
    evLossPerHand: week.evLoss / week.hands,
    daysPlayed: Object.keys(week.days || {}).length,
    xp: week.xp,
    ratingStart: week.ratingStart,
    ratingEnd: week.ratingEnd,
    ratingDelta: week.ratingEnd !== null && week.ratingStart !== null
      ? week.ratingEnd - week.ratingStart
      : 0,
  };
}

// A week needs enough hands before its numbers mean anything. Below this the
// report says "keep going" rather than showing noise as if it were signal.
export const MIN_HANDS_FOR_COMPARISON = 25;

/**
 * Compare the current week against the previous one.
 *
 * `improved` is keyed on EV lost per hand, and deliberately not on accuracy:
 * accuracy can rise while EV loss also rises if the errors get more expensive.
 */
export function weekOverWeek(weeks, at = new Date()) {
  const current = summariseWeek(weeks[isoWeekKey(at)]);
  const previous = summariseWeek(weeks[previousWeekKey(at)]);

  const comparable = Boolean(
    current && previous &&
    current.hands >= MIN_HANDS_FOR_COMPARISON &&
    previous.hands >= MIN_HANDS_FOR_COMPARISON
  );

  if (!comparable) {
    return {
      current,
      previous,
      comparable: false,
      handsNeeded: current
        ? Math.max(0, MIN_HANDS_FOR_COMPARISON - current.hands)
        : MIN_HANDS_FOR_COMPARISON,
    };
  }

  const evDelta = previous.evLossPerHand - current.evLossPerHand; // positive = leaking less

  return {
    current,
    previous,
    comparable: true,
    handsNeeded: 0,
    deltas: {
      evLossPerHand: evDelta,
      accuracy: current.accuracy - previous.accuracy,
      blunderRate: current.blunderRate - previous.blunderRate,
      rating: (current.ratingEnd ?? 0) - (previous.ratingEnd ?? 0),
      hands: current.hands - previous.hands,
    },
    improved: evDelta > 0,
  };
}

/** Consecutive days played ending today (or yesterday, if today is unplayed). */
export function currentDayStreak(weeks, at = new Date()) {
  const played = new Set();
  for (const week of Object.values(weeks)) {
    for (const day of Object.keys(week.days || {})) played.add(day);
  }
  if (played.size === 0) return 0;

  const dayKey = (d) => d.toISOString().slice(0, 10);
  const cursor = new Date(Date.UTC(at.getFullYear(), at.getMonth(), at.getDate()));

  // Today not being played yet should not zero out a live streak, so start
  // from yesterday in that case.
  if (!played.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);

  let streak = 0;
  while (played.has(dayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** Chronological series for charting, oldest first. */
export function weekSeries(weeks, limit = 12) {
  return Object.keys(weeks)
    .sort()
    .slice(-limit)
    .map(key => ({ key, ...summariseWeek(weeks[key]) }))
    .filter(w => w.hands > 0);
}
