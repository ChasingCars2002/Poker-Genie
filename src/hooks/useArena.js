import { useState, useCallback, useMemo, useEffect } from 'react';
import { generateScenario, generateBossScenario } from '../engine/scenarioGenerator';
import {
  calculateEVLoss, classifyEVLoss, SCORE_CONFIG,
  getLevelForXP, ACHIEVEMENTS,
} from '../data/gtoData';

const STORAGE_KEY = 'poker-genie-progress';
const HANDS_PER_FLOOR = 10;

const MULTIPLIER_TIERS = [
  { min: 0, max: 2, value: 1.0 },
  { min: 3, max: 4, value: 1.5 },
  { min: 5, max: 7, value: 2.0 },
  { min: 8, max: 11, value: 3.0 },
  { min: 12, max: 15, value: 4.0 },
  { min: 16, max: Infinity, value: 5.0 },
];

function getMultiplier(streak) {
  const tier = MULTIPLIER_TIERS.find(t => streak >= t.min && streak <= t.max);
  return tier ? tier.value : 1.0;
}

function getMultiplierTierIndex(streak) {
  return MULTIPLIER_TIERS.findIndex(t => streak >= t.min && streak <= t.max);
}

function dropMultiplierOneTier(streak) {
  const currentIdx = getMultiplierTierIndex(streak);
  if (currentIdx <= 0) return 0;
  return MULTIPLIER_TIERS[currentIdx - 1].min;
}

function getDifficultyForFloor(floor) {
  if (floor <= 3) return { min: 1, max: 4 };
  if (floor <= 6) return { min: 3, max: 6 };
  if (floor <= 9) return { min: 5, max: 8 };
  return { min: 7, max: 10 };
}

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    xp: 0, totalHands: 0, totalCorrect: 0, bestStreak: 0,
    handsWithoutBlunder: 0, perfectDrill: false,
    drillsAttempted: 0, drillsCompleted: {},
    exploitWins: 0, unlockedAchievements: [],
    bestArenaFloor: 0, bestArenaScore: 0, arenaBossesDefeated: 0,
  };
}

function saveProgress(progress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
}

function generateNextScenario(floor, handOnFloor, consecutiveCorrect, justLostLife) {
  const isBoss = handOnFloor >= HANDS_PER_FLOOR;

  if (isBoss) {
    return { scenario: generateBossScenario(floor), isBoss: true };
  }

  const { min, max } = getDifficultyForFloor(floor);
  let difficulty = min + Math.floor(Math.random() * (max - min + 1));

  if (consecutiveCorrect >= 5) difficulty = Math.min(10, difficulty + 1);
  if (justLostLife) difficulty = Math.max(1, difficulty - 2);

  return { scenario: generateScenario(difficulty), isBoss: false };
}

export function useArena() {
  const [lives, setLives] = useState(3);
  const [floor, setFloor] = useState(1);
  const [handOnFloor, setHandOnFloor] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [runScore, setRunScore] = useState(0);
  const [bossesDefeated, setBossesDefeated] = useState(0);
  const [blundersOnFloor, setBlundersOnFloor] = useState(0);
  const [totalHandsPlayed, setTotalHandsPlayed] = useState(0);
  const [floorsCleared, setFloorsCleared] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [results, setResults] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [justLostLife, setJustLostLife] = useState(false);

  const [currentScenario, setCurrentScenario] = useState(null);
  const [isBossHand, setIsBossHand] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scorePopup, setScorePopup] = useState(null);
  const [progress, setProgress] = useState(loadProgress);
  const [newAchievements, setNewAchievements] = useState([]);

  const multiplier = useMemo(() => getMultiplier(consecutiveCorrect), [consecutiveCorrect]);
  const levelInfo = useMemo(() => getLevelForXP(progress.xp), [progress.xp]);

  useEffect(() => {
    const { scenario, isBoss } = generateNextScenario(1, 0, 0, false);
    setCurrentScenario(scenario);
    setIsBossHand(isBoss);
  }, []);

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
  }, [progress.totalHands, progress.bestStreak, progress.handsWithoutBlunder,
      progress.bestArenaFloor, progress.arenaBossesDefeated]);

  const handleAction = useCallback((chosenAction) => {
    if (!currentScenario || showFeedback || gameOver) return;

    const strategy = currentScenario.gtoStrategy;
    const evLoss = calculateEVLoss(strategy, chosenAction);
    const classification = classifyEVLoss(evLoss);
    const chosenActionData = strategy.actions.find(a => a.action === chosenAction);
    const bestActionData = strategy.actions.reduce((best, a) => a.ev > best.ev ? a : best, strategy.actions[0]);

    const isCorrect = classification.grade === 'perfect' || classification.grade === 'acceptable';
    const isBlunder = classification.grade === 'blunder';
    const isInaccuracy = classification.grade === 'inaccuracy';
    const scoreData = SCORE_CONFIG[classification.grade];

    let newConsecutive = isCorrect ? consecutiveCorrect + 1 : (isInaccuracy ? dropMultiplierOneTier(consecutiveCorrect) : 0);
    const currentMultiplier = getMultiplier(isCorrect ? newConsecutive : consecutiveCorrect);
    const points = Math.round(scoreData.points * (isBossHand ? 3 : 1) * currentMultiplier);
    const xp = Math.round(scoreData.xp * (isBossHand ? 2 : 1) * currentMultiplier);

    let newLives = lives;
    let lostLife = false;
    let gainedLife = false;

    if (isBlunder) {
      newLives = lives - 1;
      lostLife = true;
      setJustLostLife(true);
    } else {
      setJustLostLife(false);
    }

    if (isCorrect && newConsecutive > 0 && newConsecutive % 5 === 0 && newLives < 5) {
      newLives = newLives + 1;
      gainedLife = true;
    }

    const result = {
      chosenAction,
      chosenEV: chosenActionData?.ev ?? 0,
      bestAction: bestActionData.action,
      bestEV: bestActionData.ev,
      evLoss: Math.round(evLoss * 100) / 100,
      classification,
      strategy,
      scenario: currentScenario,
      score: points,
      xpGained: xp,
      streak: newConsecutive,
      isBoss: isBossHand,
      multiplier: currentMultiplier,
    };

    setFeedback(result);
    setShowFeedback(true);
    setScorePopup({
      points, xp, grade: classification.grade, streak: newConsecutive,
      multiplier: currentMultiplier, lostLife, gainedLife, isBoss: isBossHand,
    });
    setTimeout(() => setScorePopup(null), 2500);

    setConsecutiveCorrect(newConsecutive);
    setBestStreak(prev => Math.max(prev, newConsecutive));
    setRunScore(prev => prev + points);
    setXpEarned(prev => prev + xp);
    setTotalHandsPlayed(prev => prev + 1);
    setResults(prev => [...prev, result]);
    setLives(newLives);

    if (isBlunder) {
      setBlundersOnFloor(prev => prev + 1);
    }

    setProgress(prev => {
      const updated = {
        ...prev,
        xp: prev.xp + xp,
        totalHands: prev.totalHands + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        bestStreak: Math.max(prev.bestStreak, newConsecutive),
        handsWithoutBlunder: isBlunder ? 0 : prev.handsWithoutBlunder + 1,
      };
      saveProgress(updated);
      return updated;
    });

    if (newLives <= 0) {
      setGameOver(true);
      setProgress(prev => {
        const updated = {
          ...prev,
          bestArenaFloor: Math.max(prev.bestArenaFloor || 0, floor),
          bestArenaScore: Math.max(prev.bestArenaScore || 0, runScore + points),
          arenaBossesDefeated: (prev.arenaBossesDefeated || 0) + bossesDefeated,
        };
        saveProgress(updated);
        return updated;
      });
    }
  }, [currentScenario, showFeedback, gameOver, consecutiveCorrect, lives, isBossHand,
      floor, runScore, bossesDefeated]);

  const nextHand = useCallback(() => {
    if (gameOver) return;

    let nextFloor = floor;
    let nextHandOnFloor = handOnFloor + 1;

    if (isBossHand) {
      setBossesDefeated(prev => prev + 1);

      if (blundersOnFloor === 0 && lives < 5) {
        setLives(prev => Math.min(5, prev + 1));
      }

      nextFloor = floor + 1;
      nextHandOnFloor = 0;
      setFloor(nextFloor);
      setFloorsCleared(prev => prev + 1);
      setBlundersOnFloor(0);
    }

    setHandOnFloor(nextHandOnFloor);

    const { scenario, isBoss } = generateNextScenario(
      nextFloor, nextHandOnFloor, consecutiveCorrect, justLostLife
    );
    setCurrentScenario(scenario);
    setIsBossHand(isBoss);
    setShowFeedback(false);
    setFeedback(null);
  }, [gameOver, floor, handOnFloor, isBossHand, consecutiveCorrect, justLostLife, blundersOnFloor, lives]);

  const restartArena = useCallback(() => {
    setLives(3);
    setFloor(1);
    setHandOnFloor(0);
    setConsecutiveCorrect(0);
    setRunScore(0);
    setBossesDefeated(0);
    setBlundersOnFloor(0);
    setTotalHandsPlayed(0);
    setFloorsCleared(0);
    setBestStreak(0);
    setXpEarned(0);
    setResults([]);
    setGameOver(false);
    setJustLostLife(false);
    setFeedback(null);
    setShowFeedback(false);
    setScorePopup(null);

    const { scenario, isBoss } = generateNextScenario(1, 0, 0, false);
    setCurrentScenario(scenario);
    setIsBossHand(isBoss);
  }, []);

  const dismissAchievement = useCallback(() => {
    setNewAchievements(prev => prev.slice(1));
  }, []);

  return {
    lives,
    floor,
    handOnFloor,
    isBossHand,
    multiplier,
    consecutiveCorrect,
    runScore,
    bossesDefeated,
    totalHandsPlayed,
    floorsCleared,
    bestStreak,
    xpEarned,
    results,
    gameOver,
    currentScenario,
    feedback,
    showFeedback,
    scorePopup,
    progress,
    levelInfo,
    newAchievements,
    handleAction,
    nextHand,
    restartArena,
    dismissAchievement,
    handsPerFloor: HANDS_PER_FLOOR,
  };
}
