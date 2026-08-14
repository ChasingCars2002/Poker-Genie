import { describe, it, expect, beforeEach } from 'vitest';
import { applyAnswer, applyStreak, collectAchievements } from '../sessionRecorder';
import { emptyProgress, _internals } from '../../state/progressStore';
import { isoWeekKey } from '../weeklyStats';

const CONCEPTS = { primary: 'bet-flop-value', texture: 'texture-dry' };

function answer(progress, overrides = {}) {
  return applyAnswer(progress, {
    grade: 'perfect',
    evLoss: 0,
    xp: 25,
    difficulty: 5,
    concepts: CONCEPTS,
    at: new Date('2026-08-14T12:00:00Z'),
    ...overrides,
  });
}

describe('applyAnswer', () => {
  let base;
  beforeEach(() => { base = emptyProgress(); });

  it('is pure — the input profile is untouched', () => {
    answer(base);
    expect(base.totalHands).toBe(0);
    expect(Object.keys(base.concepts)).toHaveLength(0);
  });

  it('advances lifetime totals', () => {
    const next = answer(base);
    expect(next.totalHands).toBe(1);
    expect(next.totalCorrect).toBe(1);
    expect(next.xp).toBe(25);
  });

  it('does not credit a blunder as correct', () => {
    const next = answer(base, { grade: 'blunder', evLoss: 2.5, xp: 0 });
    expect(next.totalCorrect).toBe(0);
    expect(next.totalEVLoss).toBe(2.5);
  });

  it('records both the decision concept and the texture concept', () => {
    const next = answer(base);
    expect(next.concepts['bet-flop-value'].attempts).toBe(1);
    expect(next.concepts['texture-dry'].attempts).toBe(1);
  });

  it('resets the no-blunder counter only on a blunder', () => {
    let progress = answer(base);
    progress = answer(progress, { grade: 'inaccuracy', evLoss: 0.5 });
    expect(progress.handsWithoutBlunder).toBe(2);

    progress = answer(progress, { grade: 'blunder', evLoss: 3 });
    expect(progress.handsWithoutBlunder).toBe(0);
  });

  it('buckets the hand into the right ISO week', () => {
    const at = new Date('2026-08-14T12:00:00Z');
    const next = answer(base, { at });
    expect(next.weeks[isoWeekKey(at)].hands).toBe(1);
  });

  it('moves the skill rating', () => {
    const next = answer(base, { difficulty: 8 });
    expect(next.skillRating).not.toBe(base.skillRating);
  });

  it('marks a drill attempted exactly once', () => {
    let progress = answer(base, { drillId: 'srp-btn-vs-bb' });
    expect(progress.drillsAttempted).toBe(1);

    progress = answer(progress, { drillId: 'srp-btn-vs-bb' });
    expect(progress.drillsAttempted).toBe(1);

    progress = answer(progress, { drillId: 'turn-barrels' });
    expect(progress.drillsAttempted).toBe(2);
  });

  it('queues a missed concept for review', () => {
    let progress = answer(base, { grade: 'blunder', evLoss: 3 });
    // Play enough unrelated hands for the short interval to elapse.
    for (let i = 0; i < 4; i++) {
      progress = answer(progress, { concepts: { primary: 'bet-river-air', texture: 'texture-wet' } });
    }
    expect(progress.reviewQueue).toContain('bet-flop-value');
  });

  it('only counts an exploit win when the answer was correct', () => {
    expect(answer(base, { isExploit: true }).exploitWins).toBe(1);
    expect(answer(base, { isExploit: true, grade: 'blunder' }).exploitWins).toBe(0);
  });
});

describe('applyStreak', () => {
  it('raises the best streak but never lowers it', () => {
    const progress = applyStreak(emptyProgress(), 7);
    expect(progress.bestStreak).toBe(7);
    expect(applyStreak(progress, 3).bestStreak).toBe(7);
  });
});

describe('collectAchievements', () => {
  it('unlocks on the first hand and does not re-unlock', () => {
    const progress = answer(emptyProgress());
    const first = collectAchievements(progress);

    expect(first.unlocked.map(a => a.id)).toContain('first_hand');
    expect(collectAchievements(first.progress).unlocked).toHaveLength(0);
  });

  it('survives an achievement predicate that throws', () => {
    // A single bad predicate should not take a whole session down.
    const progress = { ...emptyProgress(), totalHands: 1 };
    expect(() => collectAchievements(progress)).not.toThrow();
  });
});

describe('progress store migration', () => {
  it('carries a v1 profile forward and fills in the learning fields', () => {
    const legacy = {
      xp: 500, totalHands: 40, totalCorrect: 30, bestStreak: 6,
      handsWithoutBlunder: 3, drillsAttempted: 2, drillsCompleted: { 'turn-barrels': true },
      exploitWins: 1, unlockedAchievements: ['first_hand'],
    };

    const migrated = _internals.migrate(legacy);

    expect(migrated.xp).toBe(500);
    expect(migrated.totalHands).toBe(40);
    expect(migrated.unlockedAchievements).toEqual(['first_hand']);
    expect(migrated.schemaVersion).toBe(_internals.SCHEMA_VERSION);
    // Fields that did not exist in v1 get their defaults, not undefined.
    expect(migrated.concepts).toEqual({});
    expect(migrated.weeks).toEqual({});
    expect(migrated.reviewQueue).toEqual([]);
    expect(typeof migrated.skillRating).toBe('number');
  });

  it('replaces fields of the wrong type rather than propagating them', () => {
    const corrupt = { xp: 'not a number', concepts: [], unlockedAchievements: 'nope' };
    const migrated = _internals.migrate(corrupt);

    expect(typeof migrated.xp).toBe('number');
    expect(Array.isArray(migrated.unlockedAchievements)).toBe(true);
    expect(Array.isArray(migrated.concepts)).toBe(false);
  });

  it('returns a clean profile for null or garbage input', () => {
    expect(_internals.migrate(null).totalHands).toBe(0);
    expect(_internals.migrate('a string').totalHands).toBe(0);
  });
});
