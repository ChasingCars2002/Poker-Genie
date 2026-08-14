import { recordAttempt, updateRating, getDueConcepts } from './masteryModel';
import { recordHand, markSession } from './weeklyStats';
import { ACHIEVEMENTS } from '../data/gtoData';

/**
 * Fold one graded hand into the persistent profile.
 *
 * Pure: takes a profile, returns a new profile. Both training modes route
 * through here so lifetime stats, mastery, the review queue and the weekly
 * buckets cannot drift apart the way they did when each hook kept its own
 * copy of the bookkeeping.
 */
export function applyAnswer(progress, {
  grade,
  evLoss,
  xp,
  difficulty,
  concepts,
  drillId,
  isExploit = false,
  at = new Date(),
}) {
  const isCorrect = grade === 'perfect' || grade === 'acceptable';
  const isBlunder = grade === 'blunder';

  const handCounter = progress.totalHands + 1;
  const rating = updateRating(progress.skillRating, { difficulty, grade });

  // Both the decision concept and the board-texture concept get credited —
  // they fail independently and want separate review schedules.
  const nextConcepts = { ...progress.concepts };
  for (const conceptId of [concepts?.primary, concepts?.secondary].filter(Boolean)) {
    nextConcepts[conceptId] = recordAttempt(nextConcepts[conceptId], {
      isCorrect,
      evLoss,
      handCounter,
    });
  }

  const next = {
    ...progress,
    xp: progress.xp + xp,
    totalHands: handCounter,
    totalCorrect: progress.totalCorrect + (isCorrect ? 1 : 0),
    totalEVLoss: Math.round((progress.totalEVLoss + evLoss) * 100) / 100,
    handsWithoutBlunder: isBlunder ? 0 : progress.handsWithoutBlunder + 1,
    exploitWins: progress.exploitWins + (isExploit && isCorrect ? 1 : 0),
    concepts: nextConcepts,
    skillRating: rating,
    lastPlayedAt: at.toISOString(),
    weeks: recordHand(progress.weeks, { grade, evLoss, xp, rating, at }),
  };

  if (drillId && !progress.drillsCompleted[drillId]) {
    next.drillsAttempted = progress.drillsAttempted + 1;
    next.drillsCompleted = { ...progress.drillsCompleted, [drillId]: true };
  }

  next.reviewQueue = getDueConcepts(nextConcepts, handCounter, 8);

  return next;
}

export function applyStreak(progress, streak) {
  if (streak <= progress.bestStreak) return progress;
  return { ...progress, bestStreak: streak };
}

export function applySessionStart(progress, at = new Date()) {
  return { ...progress, weeks: markSession(progress.weeks, at) };
}

/**
 * Achievements newly satisfied by this profile.
 * Returns the unlocked definitions plus the profile with their ids recorded,
 * so the caller does not have to run the check twice.
 */
export function collectAchievements(progress) {
  const unlocked = ACHIEVEMENTS.filter(a => {
    if (progress.unlockedAchievements.includes(a.id)) return false;
    try {
      return a.check(progress);
    } catch {
      // A malformed achievement predicate should not take down a session.
      return false;
    }
  });

  if (unlocked.length === 0) return { unlocked, progress };

  return {
    unlocked,
    progress: {
      ...progress,
      unlockedAchievements: [...progress.unlockedAchievements, ...unlocked.map(a => a.id)],
    },
  };
}
