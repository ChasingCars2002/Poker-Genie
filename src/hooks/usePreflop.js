import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { generatePreflopScenario } from '../engine/preflopGenerator';
import { gradeAction, SCORE_CONFIG, getLevelForXP } from '../data/gtoData';
import { applyAnswer, applyStreak, applySessionStart, collectAchievements } from '../engine/sessionRecorder';
import { updateProgress, getProgress } from '../state/progressStore';
import { useProgress } from './useProgress';

const MAX_SESSION_RESULTS = 200;

const initialStats = {
  handsPlayed: 0,
  perfectPlays: 0,
  inaccuracies: 0,
  blunders: 0,
  totalEVLoss: 0,
  totalScore: 0,
  currentStreak: 0,
  bestSessionStreak: 0,
  xpEarned: 0,
  results: [],
};

/**
 * Endless preflop session.
 *
 * Deliberately a separate hook from useTrainer rather than a branch inside it:
 * preflop has no board, no curated deck, no exploit toggles and a different
 * generator. Sharing the shell would have meant guarding every one of those.
 * What it does share is the parts that must not diverge — grading, the mastery
 * model, and the weekly bookkeeping, all via sessionRecorder.
 */
export function usePreflop() {
  const progress = useProgress();

  const [currentScenario, setCurrentScenario] = useState(() =>
    generatePreflopScenario({ concepts: getProgress().reviewQueue }));
  const [stats, setStats] = useState(initialStats);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scorePopup, setScorePopup] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [sessionEnded, setSessionEnded] = useState(false);

  const popupTimer = useRef(null);

  useEffect(() => {
    updateProgress(p => applySessionStart(p));
    return () => {
      if (popupTimer.current) clearTimeout(popupTimer.current);
    };
  }, []);

  const levelInfo = useMemo(() => getLevelForXP(progress.xp), [progress.xp]);

  const handleAction = useCallback((chosenAction) => {
    if (!currentScenario || showFeedback) return;

    const strategy = currentScenario.gtoStrategy;
    const { evLoss, classification } = gradeAction(strategy, chosenAction);
    const isCorrect = classification.grade === 'perfect' || classification.grade === 'acceptable';
    const scoreData = SCORE_CONFIG[classification.grade];

    const newStreak = isCorrect ? stats.currentStreak + 1 : 0;
    const streakMultiplier = Math.min(newStreak, SCORE_CONFIG.maxStreakMultiplier);
    const streakXP = isCorrect ? streakMultiplier * SCORE_CONFIG.streakBonus : 0;
    const totalXP = scoreData.xp + streakXP;

    const bestActionData = strategy.actions.reduce(
      (best, a) => (a.frequency > best.frequency ? a : best), strategy.actions[0]
    );

    const result = {
      chosenAction,
      chosenEV: strategy.actions.find(a => a.action === chosenAction)?.ev ?? 0,
      bestAction: bestActionData.action,
      bestEV: bestActionData.ev ?? 0,
      evLoss: Math.round(evLoss * 100) / 100,
      classification,
      strategy,
      scenario: currentScenario,
      concepts: currentScenario.concepts,
      analysis: currentScenario.analysis,
      score: scoreData.points,
      xpGained: totalXP,
      streak: newStreak,
    };

    setFeedback(result);
    setShowFeedback(true);
    setScorePopup({
      id: stats.handsPlayed + 1,
      points: scoreData.points,
      xp: totalXP,
      grade: classification.grade,
      streak: newStreak,
    });
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setScorePopup(null), 2000);

    setStats(prev => ({
      handsPlayed: prev.handsPlayed + 1,
      perfectPlays: prev.perfectPlays + (isCorrect ? 1 : 0),
      inaccuracies: prev.inaccuracies + (classification.grade === 'inaccuracy' ? 1 : 0),
      blunders: prev.blunders + (classification.grade === 'blunder' ? 1 : 0),
      totalEVLoss: Math.round((prev.totalEVLoss + evLoss) * 100) / 100,
      totalScore: prev.totalScore + scoreData.points,
      currentStreak: newStreak,
      bestSessionStreak: Math.max(prev.bestSessionStreak, newStreak),
      xpEarned: prev.xpEarned + totalXP,
      results: [...prev.results, result].slice(-MAX_SESSION_RESULTS),
    }));

    updateProgress(prev => {
      let next = applyAnswer(prev, {
        grade: classification.grade,
        evLoss,
        xp: totalXP,
        difficulty: currentScenario._meta?.difficulty ?? 5,
        concepts: currentScenario.concepts,
        drillId: 'preflop',
      });
      next = applyStreak(next, newStreak);

      const { unlocked, progress: withAchievements } = collectAchievements(next);
      if (unlocked.length > 0) setNewAchievements(a => [...a, ...unlocked]);
      return withAchievements;
    });
  }, [currentScenario, showFeedback, stats.currentStreak, stats.handsPlayed]);

  const nextHand = useCallback(() => {
    setShowFeedback(false);
    setFeedback(null);
    setCurrentScenario(generatePreflopScenario({ concepts: getProgress().reviewQueue }));
  }, []);

  const endSession = useCallback(() => setSessionEnded(true), []);

  const resumeSession = useCallback(() => {
    setSessionEnded(false);
    setShowFeedback(false);
    setFeedback(null);
    setCurrentScenario(generatePreflopScenario({ concepts: getProgress().reviewQueue }));
  }, []);

  const dismissAchievement = useCallback(() => setNewAchievements(prev => prev.slice(1)), []);

  return {
    currentScenario,
    feedback,
    showFeedback,
    stats,
    progress,
    levelInfo,
    scorePopup,
    newAchievements,
    sessionEnded,
    handleAction,
    nextHand,
    endSession,
    resumeSession,
    dismissAchievement,
  };
}
