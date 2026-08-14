import { describe, it, expect } from 'vitest';
import {
  isoWeekKey, previousWeekKey, recordHand, summariseWeek, weekOverWeek,
  currentDayStreak, weekSeries, emptyWeek, MIN_HANDS_FOR_COMPARISON,
} from '../weeklyStats';

const at = (iso) => new Date(iso);

function playWeek(weeks, date, { hands, grade = 'perfect', evLoss = 0, rating = 1000 }) {
  let result = weeks;
  for (let i = 0; i < hands; i++) {
    result = recordHand(result, { grade, evLoss, xp: 10, rating, at: date });
  }
  return result;
}

describe('isoWeekKey', () => {
  it('gives Monday and Sunday of the same ISO week the same key', () => {
    // 2026-08-10 is a Monday; 2026-08-16 the following Sunday.
    expect(isoWeekKey(at('2026-08-10T09:00:00Z'))).toBe(isoWeekKey(at('2026-08-16T23:00:00Z')));
  });

  it('separates adjacent weeks', () => {
    expect(isoWeekKey(at('2026-08-16T12:00:00Z'))).not.toBe(isoWeekKey(at('2026-08-17T12:00:00Z')));
  });

  it('formats as YYYY-Www', () => {
    expect(isoWeekKey(at('2026-08-14T12:00:00Z'))).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('sorts chronologically as plain text, which pruning and charts rely on', () => {
    const keys = [
      isoWeekKey(at('2026-01-05T12:00:00Z')),
      isoWeekKey(at('2026-03-05T12:00:00Z')),
      isoWeekKey(at('2026-11-05T12:00:00Z')),
    ];
    expect([...keys].sort()).toEqual(keys);
  });

  it('handles the year boundary without collapsing two years into one key', () => {
    expect(isoWeekKey(at('2025-12-30T12:00:00Z'))).not.toBe(isoWeekKey(at('2026-12-30T12:00:00Z')));
  });

  it('previousWeekKey steps back exactly one week', () => {
    const now = at('2026-08-14T12:00:00Z');
    expect(previousWeekKey(now)).toBe(isoWeekKey(at('2026-08-07T12:00:00Z')));
  });
});

describe('recordHand', () => {
  it('accumulates into the right week bucket', () => {
    const weeks = playWeek({}, at('2026-08-12T12:00:00Z'), { hands: 5 });
    const key = isoWeekKey(at('2026-08-12T12:00:00Z'));
    expect(weeks[key].hands).toBe(5);
  });

  it('counts correct answers but not inaccuracies', () => {
    let weeks = recordHand({}, { grade: 'perfect', evLoss: 0, xp: 1, rating: 1000, at: at('2026-08-12T12:00:00Z') });
    weeks = recordHand(weeks, { grade: 'inaccuracy', evLoss: 0.5, xp: 1, rating: 1000, at: at('2026-08-12T12:00:00Z') });
    weeks = recordHand(weeks, { grade: 'acceptable', evLoss: 0.1, xp: 1, rating: 1000, at: at('2026-08-12T12:00:00Z') });

    const week = weeks[isoWeekKey(at('2026-08-12T12:00:00Z'))];
    expect(week.hands).toBe(3);
    expect(week.correct).toBe(2); // perfect + acceptable
    expect(week.inaccuracies).toBe(1);
  });

  it('tracks the first and last rating of the week', () => {
    let weeks = recordHand({}, { grade: 'perfect', evLoss: 0, xp: 1, rating: 900, at: at('2026-08-10T12:00:00Z') });
    weeks = recordHand(weeks, { grade: 'perfect', evLoss: 0, xp: 1, rating: 1100, at: at('2026-08-13T12:00:00Z') });

    const summary = summariseWeek(weeks[isoWeekKey(at('2026-08-10T12:00:00Z'))]);
    expect(summary.ratingStart).toBe(900);
    expect(summary.ratingEnd).toBe(1100);
    expect(summary.ratingDelta).toBe(200);
  });

  it('records distinct days for the consistency streak', () => {
    let weeks = playWeek({}, at('2026-08-10T12:00:00Z'), { hands: 3 });
    weeks = playWeek(weeks, at('2026-08-11T12:00:00Z'), { hands: 3 });

    expect(summariseWeek(weeks[isoWeekKey(at('2026-08-10T12:00:00Z'))]).daysPlayed).toBe(2);
  });

  it('does not mutate the weeks it is given', () => {
    const original = {};
    recordHand(original, { grade: 'perfect', evLoss: 0, xp: 1, rating: 1000, at: at('2026-08-12T12:00:00Z') });
    expect(Object.keys(original)).toHaveLength(0);
  });
});

describe('summariseWeek', () => {
  it('returns null for a week with no hands', () => {
    expect(summariseWeek(emptyWeek())).toBeNull();
    expect(summariseWeek(undefined)).toBeNull();
  });

  it('computes EV loss per hand, the headline metric', () => {
    const weeks = playWeek({}, at('2026-08-12T12:00:00Z'), { hands: 4, evLoss: 0.5 });
    expect(summariseWeek(weeks[isoWeekKey(at('2026-08-12T12:00:00Z'))]).evLossPerHand).toBeCloseTo(0.5, 5);
  });
});

describe('weekOverWeek', () => {
  const now = at('2026-08-13T12:00:00Z');
  const lastWeek = at('2026-08-06T12:00:00Z');

  it('refuses to compare on too few hands', () => {
    let weeks = playWeek({}, lastWeek, { hands: 40, evLoss: 0.5 });
    weeks = playWeek(weeks, now, { hands: 3, evLoss: 0.1 });

    const report = weekOverWeek(weeks, now);
    expect(report.comparable).toBe(false);
    expect(report.handsNeeded).toBe(MIN_HANDS_FOR_COMPARISON - 3);
  });

  it('reports improvement when EV loss per hand falls', () => {
    let weeks = playWeek({}, lastWeek, { hands: 40, evLoss: 0.8 });
    weeks = playWeek(weeks, now, { hands: 40, evLoss: 0.3 });

    const report = weekOverWeek(weeks, now);
    expect(report.comparable).toBe(true);
    expect(report.improved).toBe(true);
    expect(report.deltas.evLossPerHand).toBeCloseTo(0.5, 5);
  });

  it('reports regression when EV loss per hand rises', () => {
    let weeks = playWeek({}, lastWeek, { hands: 40, evLoss: 0.2 });
    weeks = playWeek(weeks, now, { hands: 40, evLoss: 0.9 });

    expect(weekOverWeek(weeks, now).improved).toBe(false);
  });

  it('judges improvement on EV bled, not on raw volume', () => {
    // Twice the hands at the same quality is not improvement.
    let weeks = playWeek({}, lastWeek, { hands: 30, evLoss: 0.4 });
    weeks = playWeek(weeks, now, { hands: 120, evLoss: 0.4 });

    const report = weekOverWeek(weeks, now);
    expect(report.deltas.hands).toBe(90);
    expect(report.improved).toBe(false);
  });

  it('handles a first-ever week without throwing', () => {
    const report = weekOverWeek({}, now);
    expect(report.comparable).toBe(false);
    expect(report.current).toBeNull();
    expect(report.handsNeeded).toBe(MIN_HANDS_FOR_COMPARISON);
  });
});

describe('currentDayStreak', () => {
  const today = at('2026-08-14T12:00:00Z');

  it('counts consecutive days ending today', () => {
    let weeks = playWeek({}, at('2026-08-12T12:00:00Z'), { hands: 1 });
    weeks = playWeek(weeks, at('2026-08-13T12:00:00Z'), { hands: 1 });
    weeks = playWeek(weeks, today, { hands: 1 });

    expect(currentDayStreak(weeks, today)).toBe(3);
  });

  it('does not break a live streak just because today is unplayed yet', () => {
    let weeks = playWeek({}, at('2026-08-12T12:00:00Z'), { hands: 1 });
    weeks = playWeek(weeks, at('2026-08-13T12:00:00Z'), { hands: 1 });

    expect(currentDayStreak(weeks, today)).toBe(2);
  });

  it('is zero with no history', () => {
    expect(currentDayStreak({}, today)).toBe(0);
  });

  it('stops at a gap', () => {
    let weeks = playWeek({}, at('2026-08-09T12:00:00Z'), { hands: 1 });
    weeks = playWeek(weeks, at('2026-08-13T12:00:00Z'), { hands: 1 });
    weeks = playWeek(weeks, today, { hands: 1 });

    expect(currentDayStreak(weeks, today)).toBe(2);
  });

  it('spans an ISO week boundary', () => {
    // 2026-08-09 is a Sunday, 2026-08-10 the Monday of the next ISO week.
    const monday = at('2026-08-10T12:00:00Z');
    let weeks = playWeek({}, at('2026-08-09T12:00:00Z'), { hands: 1 });
    weeks = playWeek(weeks, monday, { hands: 1 });

    expect(currentDayStreak(weeks, monday)).toBe(2);
  });
});

describe('weekSeries', () => {
  it('returns weeks oldest first', () => {
    let weeks = playWeek({}, at('2026-07-06T12:00:00Z'), { hands: 5 });
    weeks = playWeek(weeks, at('2026-08-10T12:00:00Z'), { hands: 5 });

    const series = weekSeries(weeks);
    expect(series).toHaveLength(2);
    expect(series[0].key < series[1].key).toBe(true);
  });

  it('skips empty weeks', () => {
    const weeks = { '2026-W01': emptyWeek() };
    expect(weekSeries(weeks)).toHaveLength(0);
  });
});
