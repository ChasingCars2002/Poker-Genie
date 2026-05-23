import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  SCENARIOS, EXPLOITS, calculateEVLoss, classifyEVLoss,
  SCORE_CONFIG, getLevelForXP, ACHIEVEMENTS, ensureFourActions,
} from '../data/gtoData';

const STORAGE_KEY = 'poker-genie-progress';

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    xp: 0,
    totalHands: 0,
    totalCorrect: 0,
    bestStreak: 0,
    handsWithoutBlunder: 0,
    perfectDrill: false,
    drillsAttempted: 0,
    drillsCompleted: {},
    exploitWins: 0,
    unlockedAchievements: [],
  };
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

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

export function useTrainer(drillId) {
  const scenarios = useMemo(() => {
    const base = SCENARIOS[drillId] || [];
    // Shuffle for variety
    return [...base].sort(() => Math.random() - 0.5);
  }, [drillId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState(initialSessionStats);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [exploit, setExploit] = useState(null);
  const [progress, setProgress] = useState(loadProgress);
  const [newAchievements, setNewAchievements] = useState([]);
  const [drillComplete, setDrillComplete] = useState(false);
  const [scorePopup, setScorePopup] = useState(null);

  const currentScenario = scenarios[currentIndex] || null;

  const activeStrategy = useMemo(() => {
    if (!currentScenario) return null;
    const base = ensureFourActions(currentScenario.gtoStrategy);
    if (exploit && EXPLOITS[exploit]) return EXPLOITS[exploit].adjust(base);
    return base;
  }, [currentScenario, exploit]);

  const levelInfo = useMemo(() => getLevelForXP(progress.xp), [progress.xp]);

  // Check achievements after progress changes
  useEffect(() => {
    const newlyUnlocked = ACHIEVEMENTS.filter(
      a => !progress.unlockedAchievements.includes(a.id) && a.check(progress)
    );
    if (newlyUnlocked.length > 0) {
      setNewAchievements(prev => [...prev, ...newlyUnlocked]);
      setProgress(prev => {
        const updated = {
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked.map(a => a.id)],
        };
        saveProgress(updated);
        return updated;
      });
    }
  }, [progress.totalHands, progress.bestStreak, progress.handsWithoutBlunder, progress.exploitWins]);

  const handleAction = useCallback((chosenAction) => {
    if (!activeStrategy || showFeedback) return;

    const evLoss = calculateEVLoss(activeStrategy, chosenAction);
    const classification = classifyEVLoss(evLoss);
    const chosenActionData = activeStrategy.actions.find(a => a.action === chosenAction);
    const bestActionData = activeStrategy.actions.reduce((best, a) => a.ev > best.ev ? a : best, activeStrategy.actions[0]);

    const isCorrect = classification.grade === 'perfect' || classification.grade === 'acceptable';
    const scoreData = SCORE_CONFIG[classification.grade];

    // Calculate streak bonus
    const newStreak = isCorrect ? stats.currentStreak + 1 : 0;
    const streakMultiplier = Math.min(newStreak, SCORE_CONFIG.maxStreakMultiplier);
    const streakXP = isCorrect ? streakMultiplier * SCORE_CONFIG.streakBonus : 0;
    const totalXP = scoreData.xp + streakXP;

    const result = {
      chosenAction,
      chosenEV: chosenActionData?.ev ?? 0,
      bestAction: bestActionData.action,
      bestEV: bestActionData.ev,
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
    setScorePopup({ points: scoreData.points, xp: totalXP, grade: classification.grade, streak: newStreak });

    // Clear score popup after animation
    setTimeout(() => setScorePopup(null), 2000);

    setStats(prev => {
      const newResults = [...prev.results, result];
      return {
        handsPlayed: prev.handsPlayed + 1,
        perfectPlays: prev.perfectPlays + (isCorrect ? 1 : 0),
        inaccuracies: prev.inaccuracies + (classification.grade === 'inaccuracy' ? 1 : 0),
        blunders: prev.blunders + (classification.grade === 'blunder' ? 1 : 0),
        totalEVLoss: Math.round((prev.totalEVLoss + evLoss) * 100) / 100,
        totalScore: prev.totalScore + scoreData.points,
        currentStreak: newStreak,
        bestSessionStreak: Math.max(prev.bestSessionStreak, newStreak),
        xpEarned: prev.xpEarned + totalXP,
        results: newResults,
      };
    });

    // Update persistent progress
    setProgress(prev => {
      const updated = {
        ...prev,
        xp: prev.xp + totalXP,
        totalHands: prev.totalHands + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        bestStreak: Math.max(prev.bestStreak, newStreak),
        handsWithoutBlunder: classification.grade === 'blunder' ? 0 : prev.handsWithoutBlunder + 1,
        exploitWins: prev.exploitWins + (exploit && isCorrect ? 1 : 0),
      };
      // Track which drills have been attempted
      if (!prev.drillsCompleted[drillId]) {
        updated.drillsAttempted = prev.drillsAttempted + 1;
        updated.drillsCompleted = { ...prev.drillsCompleted, [drillId]: true };
      }
      saveProgress(updated);
      return updated;
    });
  }, [activeStrategy, showFeedback, currentScenario, stats.currentStreak, exploit, drillId]);

  const nextHand = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= scenarios.length) {
      // Check for perfect drill
      const allCorrect = stats.results.every(r =>
        r.classification.grade === 'perfect' || r.classification.grade === 'acceptable'
      );
      if (allCorrect && stats.handsPlayed >= scenarios.length) {
        setProgress(prev => {
          const updated = { ...prev, perfectDrill: true };
          saveProgress(updated);
          return updated;
        });
      }
      setDrillComplete(true);
    } else {
      setShowFeedback(false);
      setFeedback(null);
      setCurrentIndex(nextIdx);
    }
  }, [currentIndex, scenarios.length, stats]);

  const resetDrill = useCallback(() => {
    const shuffled = [...(SCENARIOS[drillId] || [])].sort(() => Math.random() - 0.5);
    setCurrentIndex(0);
    setStats(initialSessionStats);
    setFeedback(null);
    setShowFeedback(false);
    setDrillComplete(false);
  }, [drillId]);

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
