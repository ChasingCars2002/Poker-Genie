import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  SCENARIOS, EXPLOITS, calculateEVLoss, classifyEVLoss,
  SCORE_CONFIG, getLevelForXP, ACHIEVEMENTS,
} from '../data/gtoData';
import { loadProgress, saveProgress } from '../lib/progress';

const initialSessionStats = {
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

function shuffledScenarios(drillId) {
  return [...(SCENARIOS[drillId] || [])].sort(() => Math.random() - 0.5);
}

export function useTrainer(drillId) {
  const scenarios = useMemo(() => shuffledScenarios(drillId), [drillId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState(initialSessionStats);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [exploit, setExploit] = useState(null);
  const [progress, setProgress] = useState(loadProgress);
  const [newAchievements, setNewAchievements] = useState([]);
  const [drillComplete, setDrillComplete] = useState(false);
  const [scorePopup, setScorePopup] = useState(null);
  const popupTimer = useRef(null);

  const currentScenario = scenarios[currentIndex] || null;

  const activeStrategy = useMemo(() => {
    if (!currentScenario) return null;
    const base = currentScenario.gtoStrategy;
    return exploit && EXPLOITS[exploit] ? EXPLOITS[exploit].adjust(base) : base;
  }, [currentScenario, exploit]);

  const levelInfo = useMemo(() => getLevelForXP(progress.xp), [progress.xp]);

  useEffect(() => () => clearTimeout(popupTimer.current), []);

  const applyProgress = useCallback((updater) => {
    setProgress(prev => {
      const next = updater(prev);
      const unlocked = ACHIEVEMENTS.filter(
        a => !next.unlockedAchievements.includes(a.id) && a.check(next)
      );
      const updated = unlocked.length === 0 ? next : {
        ...next,
        unlockedAchievements: [...next.unlockedAchievements, ...unlocked.map(a => a.id)],
      };
      if (unlocked.length > 0) setNewAchievements(p => [...p, ...unlocked]);
      saveProgress(updated);
      return updated;
    });
  }, []);

  const handleAction = useCallback((chosenAction) => {
    if (!activeStrategy || showFeedback) return;

    const evLoss = calculateEVLoss(activeStrategy, chosenAction);
    const classification = classifyEVLoss(evLoss);
    const chosen = activeStrategy.actions.find(a => a.action === chosenAction);
    const best = activeStrategy.actions.reduce((b, a) => a.ev > b.ev ? a : b, activeStrategy.actions[0]);

    const isCorrect = classification.grade === 'perfect' || classification.grade === 'acceptable';
    const scoreData = SCORE_CONFIG[classification.grade];

    const newStreak = isCorrect ? stats.currentStreak + 1 : 0;
    const streakMult = Math.min(newStreak, SCORE_CONFIG.maxStreakMultiplier);
    const streakXP = isCorrect ? streakMult * SCORE_CONFIG.streakBonus : 0;
    const totalXP = scoreData.xp + streakXP;

    const result = {
      chosenAction,
      chosenEV: chosen?.ev ?? 0,
      bestAction: best.action,
      bestEV: best.ev,
      evLoss: Math.round(evLoss * 100) / 100,
      classification,
      strategy: activeStrategy,
      scenario: currentScenario,
      score: scoreData.points,
      xpGained: totalXP,
      streakBonus: streakXP,
      streak: newStreak,
    };

    setFeedback(result);
    setShowFeedback(true);
    setScorePopup({ id: Date.now(), points: scoreData.points, xp: totalXP, grade: classification.grade, streak: newStreak });
    clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setScorePopup(null), 1200);

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
      results: [...prev.results, result],
    }));

    applyProgress(prev => {
      const updated = {
        ...prev,
        xp: prev.xp + totalXP,
        totalHands: prev.totalHands + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        bestStreak: Math.max(prev.bestStreak, newStreak),
        handsWithoutBlunder: classification.grade === 'blunder' ? 0 : prev.handsWithoutBlunder + 1,
        exploitWins: prev.exploitWins + (exploit && isCorrect ? 1 : 0),
      };
      if (!prev.drillsCompleted[drillId]) {
        updated.drillsAttempted = prev.drillsAttempted + 1;
        updated.drillsCompleted = { ...prev.drillsCompleted, [drillId]: true };
      }
      return updated;
    });
  }, [activeStrategy, showFeedback, currentScenario, stats.currentStreak, exploit, drillId, applyProgress]);

  const nextHand = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= scenarios.length) {
      const allCorrect = stats.results.every(r =>
        r.classification.grade === 'perfect' || r.classification.grade === 'acceptable'
      );
      if (allCorrect && stats.handsPlayed >= scenarios.length) {
        applyProgress(prev => ({ ...prev, perfectDrill: true }));
      }
      setDrillComplete(true);
    } else {
      setShowFeedback(false);
      setFeedback(null);
      setCurrentIndex(nextIdx);
    }
  }, [currentIndex, scenarios.length, stats, applyProgress]);

  const resetDrill = useCallback(() => {
    setCurrentIndex(0);
    setStats(initialSessionStats);
    setFeedback(null);
    setShowFeedback(false);
    setDrillComplete(false);
  }, []);

  const toggleExploit = useCallback((exploitId) => {
    setExploit(prev => prev === exploitId ? null : exploitId);
  }, []);

  const dismissAchievement = useCallback(() => {
    setNewAchievements(prev => prev.slice(1));
  }, []);

  return {
    currentScenario,
    activeStrategy,
    feedback,
    showFeedback,
    stats,
    progress,
    levelInfo,
    exploit,
    drillComplete,
    scorePopup,
    newAchievements,
    handleAction,
    nextHand,
    resetDrill,
    toggleExploit,
    dismissAchievement,
    scenarioCount: scenarios.length,
    currentIndex,
  };
}
