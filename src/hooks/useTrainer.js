import { useState, useCallback, useMemo, useRef } from 'react';
import {
  SCENARIOS, EXPLOITS, calculateEVLoss, classifyEVLoss,
  SCORE_CONFIG, getLevelForXP, ACHIEVEMENTS, pickScenarioWeighted,
} from '../data/gtoData';

const PROGRESS_KEY = 'poker-genie-progress';
const LIFETIME_KEY = 'poker-genie-lifetime';
const RECENT_BUFFER = 15;
const COLD_START_HANDS = 20;

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return fallback;
}

function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* noop */ }
}

const defaultProgress = {
  xp: 0,
  totalHands: 0,
  totalCorrect: 0,
  bestStreak: 0,
  handsWithoutBlunder: 0,
  exploitWins: 0,
  unlockedAchievements: [],
};

const defaultLifetime = {
  totalHands: 0,
  totalScore: 0,
  lifetimeAvgScore: 0,
  bestHandScore: 0,
  bestSessionAvg: 0,
  dailyStreak: 0,
  lastPlayedDate: null,
};

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

function daysBetween(prevStr, todayStr) {
  if (!prevStr) return Infinity;
  const prev = new Date(prevStr);
  const today = new Date(todayStr);
  const ms = today.getTime() - prev.getTime();
  return Math.round(ms / 86400000);
}

function updateDailyStreak(lifetime) {
  const today = new Date().toDateString();
  if (lifetime.lastPlayedDate === today) return lifetime;
  const diff = daysBetween(lifetime.lastPlayedDate, today);
  const nextStreak = diff === 1 ? (lifetime.dailyStreak || 0) + 1 : 1;
  return { ...lifetime, dailyStreak: nextStreak, lastPlayedDate: today };
}

export function useTrainer() {
  const POOL = useMemo(() => {
    const all = Object.values(SCENARIOS).flat();
    // Ensure every scenario has a difficulty field
    return all.map(s => s.difficulty ? s : { ...s, difficulty: 'medium' });
  }, []);

  const [progress, setProgress] = useState(() => load(PROGRESS_KEY, defaultProgress));
  const [lifetime, setLifetime] = useState(() => {
    const loaded = load(LIFETIME_KEY, defaultLifetime);
    const updated = updateDailyStreak(loaded);
    if (updated !== loaded) save(LIFETIME_KEY, updated);
    return updated;
  });
  const [stats, setStats] = useState(initialSessionStats);
  const recentRef = useRef([]);

  const [currentScenario, setCurrentScenario] = useState(() =>
    pickScenarioWeighted(POOL, [], lifetime.totalHands >= COLD_START_HANDS ? lifetime.lifetimeAvgScore : 50)
  );
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [exploit, setExploit] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [scorePopup, setScorePopup] = useState(null);

  const activeStrategy = useMemo(() => {
    if (!currentScenario) return null;
    const base = currentScenario.gtoStrategy;
    if (exploit && EXPLOITS[exploit]) return EXPLOITS[exploit].adjust(base);
    return base;
  }, [currentScenario, exploit]);

  const levelInfo = useMemo(() => getLevelForXP(progress.xp), [progress.xp]);
  const sessionAvg = stats.handsPlayed > 0 ? stats.totalScore / stats.handsPlayed : 0;

  // Checks for newly-unlocked achievements against a combined state snapshot.
  // Returns the new IDs (caller merges them into progress.unlockedAchievements).
  const detectAchievements = (nextProgress, nextLifetime) => {
    const combined = { ...nextProgress, ...nextLifetime };
    return ACHIEVEMENTS.filter(
      a => !nextProgress.unlockedAchievements.includes(a.id) && a.check(combined)
    );
  };

  const handleAction = useCallback((chosenAction) => {
    if (!activeStrategy || showFeedback) return;

    const evLoss = calculateEVLoss(activeStrategy, chosenAction);
    const classification = classifyEVLoss(evLoss);
    const chosenActionData = activeStrategy.actions.find(a => a.action === chosenAction);
    const bestActionData = activeStrategy.actions.reduce(
      (best, a) => a.ev > best.ev ? a : best, activeStrategy.actions[0]
    );

    const isCorrect = classification.grade === 'perfect' || classification.grade === 'acceptable';
    const scoreData = SCORE_CONFIG[classification.grade];

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
    setTimeout(() => setScorePopup(null), 2000);

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

    const nextLifetime = (() => {
      const totalHands = lifetime.totalHands + 1;
      const totalScore = lifetime.totalScore + scoreData.points;
      const lifetimeAvgScore = totalScore / totalHands;
      const newSessionAvg = (stats.totalScore + scoreData.points) / (stats.handsPlayed + 1);
      return {
        ...lifetime,
        totalHands,
        totalScore,
        lifetimeAvgScore,
        bestHandScore: Math.max(lifetime.bestHandScore, scoreData.points),
        bestSessionAvg: Math.max(lifetime.bestSessionAvg, newSessionAvg),
      };
    })();

    const baseProgress = {
      ...progress,
      xp: progress.xp + totalXP,
      totalHands: progress.totalHands + 1,
      totalCorrect: progress.totalCorrect + (isCorrect ? 1 : 0),
      bestStreak: Math.max(progress.bestStreak, newStreak),
      handsWithoutBlunder: classification.grade === 'blunder' ? 0 : progress.handsWithoutBlunder + 1,
      exploitWins: progress.exploitWins + (exploit && isCorrect ? 1 : 0),
    };

    const unlocked = detectAchievements(baseProgress, nextLifetime);
    const nextProgress = unlocked.length
      ? { ...baseProgress, unlockedAchievements: [...baseProgress.unlockedAchievements, ...unlocked.map(a => a.id)] }
      : baseProgress;

    save(PROGRESS_KEY, nextProgress);
    save(LIFETIME_KEY, nextLifetime);
    setProgress(nextProgress);
    setLifetime(nextLifetime);
    if (unlocked.length) setNewAchievements(prev => [...prev, ...unlocked]);
  }, [activeStrategy, showFeedback, currentScenario, stats.currentStreak, stats.totalScore, stats.handsPlayed, exploit, progress, lifetime]);

  const nextHand = useCallback(() => {
    if (currentScenario) {
      recentRef.current = [...recentRef.current, currentScenario.id].slice(-RECENT_BUFFER);
    }
    const avgForWeighting = lifetime.totalHands >= COLD_START_HANDS ? lifetime.lifetimeAvgScore : 50;
    const next = pickScenarioWeighted(POOL, recentRef.current, avgForWeighting);
    setCurrentScenario(next);
    setFeedback(null);
    setShowFeedback(false);
  }, [POOL, currentScenario, lifetime.totalHands, lifetime.lifetimeAvgScore]);

  const resetSession = useCallback(() => {
    setStats(initialSessionStats);
    setFeedback(null);
    setShowFeedback(false);
    recentRef.current = [];
    const avgForWeighting = lifetime.totalHands >= COLD_START_HANDS ? lifetime.lifetimeAvgScore : 50;
    setCurrentScenario(pickScenarioWeighted(POOL, [], avgForWeighting));
  }, [POOL, lifetime.totalHands, lifetime.lifetimeAvgScore]);

  const resetAllProgress = useCallback(() => {
    try {
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(LIFETIME_KEY);
    } catch { /* noop */ }
    setProgress(defaultProgress);
    const freshLifetime = updateDailyStreak(defaultLifetime);
    save(LIFETIME_KEY, freshLifetime);
    setLifetime(freshLifetime);
    setStats(initialSessionStats);
    setFeedback(null);
    setShowFeedback(false);
    recentRef.current = [];
    setCurrentScenario(pickScenarioWeighted(POOL, [], 50));
    setNewAchievements([]);
  }, [POOL]);

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
    sessionAvg,
    progress,
    lifetime,
    levelInfo,
    exploit,
    scorePopup,
    newAchievements,
    handleAction,
    nextHand,
    resetSession,
    resetAllProgress,
    toggleExploit,
    dismissAchievement,
  };
}
