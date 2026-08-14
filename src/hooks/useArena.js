import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { generateScenario, generateBossScenario } from '../engine/scenarioGenerator';
import { gradeAction, SCORE_CONFIG, getLevelForXP } from '../data/gtoData';
import { conceptsForScenario } from '../engine/conceptTagger';
import { applyAnswer, applyStreak, applySessionStart, collectAchievements } from '../engine/sessionRecorder';
import { updateProgress, getProgress } from '../state/progressStore';
import { useProgress } from './useProgress';

const HANDS_PER_FLOOR = 10;
const MAX_LIVES = 5;
const MAX_RUN_RESULTS = 200;

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

function dropMultiplierOneTier(streak) {
  const currentIdx = MULTIPLIER_TIERS.findIndex(t => streak >= t.min && streak <= t.max);
  if (currentIdx <= 0) return 0;
  return MULTIPLIER_TIERS[currentIdx - 1].min;
}

function getDifficultyForFloor(floor) {
  if (floor <= 3) return { min: 1, max: 4 };
  if (floor <= 6) return { min: 3, max: 6 };
  if (floor <= 9) return { min: 5, max: 8 };
  return { min: 7, max: 10 };
}

function generateNextScenario(floor, handOnFloor, consecutiveCorrect, justLostLife) {
  if (handOnFloor >= HANDS_PER_FLOOR) {
    return { scenario: generateBossScenario(floor), isBoss: true };
  }

  const { min, max } = getDifficultyForFloor(floor);
  let difficulty = min + Math.floor(Math.random() * (max - min + 1));

  if (consecutiveCorrect >= 5) difficulty = Math.min(10, difficulty + 1);
  if (justLostLife) difficulty = Math.max(1, difficulty - 2);

  // Arena difficulty is driven by the floor, but the review queue still
  // applies — the concepts you keep missing should follow you into the run.
  return {
    scenario: generateScenario(difficulty, { concepts: getProgress().reviewQueue }),
    isBoss: false,
  };
}

export function useArena() {
  const persisted = useProgress();

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
  const [bossCleared, setBossCleared] = useState(false);

  // Generated in a lazy initialiser rather than a mount effect: setting state
  // synchronously inside an effect renders the table once with no scenario and
  // then immediately again with one.
  // Records as they stood when this run began. The summary screen used to
  // compare the finished run against the *already updated* stored bests with
  // `>=`, so every single run was reported as a new personal best.
  const [recordsAtRunStart, setRecordsAtRunStart] = useState(() => {
    const p = getProgress();
    return { floor: p.bestArenaFloor, score: p.bestArenaScore };
  });

  const [firstHand] = useState(() => generateNextScenario(1, 0, 0, false));
  const [currentScenario, setCurrentScenario] = useState(firstHand.scenario);
  const [isBossHand, setIsBossHand] = useState(firstHand.isBoss);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scorePopup, setScorePopup] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);

  const popupTimer = useRef(null);

  const multiplier = useMemo(() => getMultiplier(consecutiveCorrect), [consecutiveCorrect]);
  const levelInfo = useMemo(() => getLevelForXP(persisted.xp), [persisted.xp]);

  useEffect(() => {
    updateProgress(p => applySessionStart(p));
    return () => {
      if (popupTimer.current) clearTimeout(popupTimer.current);
    };
  }, []);

  const handleAction = useCallback((chosenAction) => {
    if (!currentScenario || showFeedback || gameOver) return;

    const strategy = currentScenario.gtoStrategy;
    const { evLoss, classification } = gradeAction(strategy, chosenAction);
    const chosenActionData = strategy.actions.find(a => a.action === chosenAction);
    const bestActionData = strategy.actions.reduce(
      (best, a) => (a.ev > best.ev ? a : best), strategy.actions[0]
    );

    const isCorrect = classification.grade === 'perfect' || classification.grade === 'acceptable';
    const isBlunder = classification.grade === 'blunder';
    const isInaccuracy = classification.grade === 'inaccuracy';
    const scoreData = SCORE_CONFIG[classification.grade];

    const newConsecutive = isCorrect
      ? consecutiveCorrect + 1
      : (isInaccuracy ? dropMultiplierOneTier(consecutiveCorrect) : 0);
    const currentMultiplier = getMultiplier(isCorrect ? newConsecutive : consecutiveCorrect);
    const points = Math.round(scoreData.points * (isBossHand ? 3 : 1) * currentMultiplier);
    const xp = Math.round(scoreData.xp * (isBossHand ? 2 : 1) * currentMultiplier);

    let newLives = lives;
    let gainedLife = false;

    if (isBlunder) {
      newLives = lives - 1;
      setJustLostLife(true);
    } else {
      setJustLostLife(false);
    }

    if (isCorrect && newConsecutive > 0 && newConsecutive % 5 === 0 && newLives < MAX_LIVES) {
      newLives += 1;
      gainedLife = true;
    }

    // A boss only counts as beaten if it was actually played correctly. The
    // previous version incremented on advancing past the hand, so blundering a
    // boss and surviving on a spare life still logged a kill.
    if (isBossHand) setBossCleared(isCorrect);

    const concepts = currentScenario.concepts || conceptsForScenario(currentScenario);

    const result = {
      chosenAction,
      chosenEV: chosenActionData?.ev ?? 0,
      bestAction: bestActionData.action,
      bestEV: bestActionData.ev,
      evLoss: Math.round(evLoss * 100) / 100,
      classification,
      strategy,
      scenario: currentScenario,
      concepts,
      score: points,
      xpGained: xp,
      streak: newConsecutive,
      isBoss: isBossHand,
      multiplier: currentMultiplier,
    };

    setFeedback(result);
    setShowFeedback(true);
    setScorePopup({
      id: totalHandsPlayed + 1,
      points, xp, grade: classification.grade, streak: newConsecutive,
      multiplier: currentMultiplier, lostLife: isBlunder, gainedLife, isBoss: isBossHand,
    });
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setScorePopup(null), 2500);

    setConsecutiveCorrect(newConsecutive);
    setBestStreak(prev => Math.max(prev, newConsecutive));
    setRunScore(prev => prev + points);
    setXpEarned(prev => prev + xp);
    setTotalHandsPlayed(prev => prev + 1);
    setResults(prev => [...prev, result].slice(-MAX_RUN_RESULTS));
    setLives(newLives);
    if (isBlunder) setBlundersOnFloor(prev => prev + 1);

    const runOver = newLives <= 0;
    if (runOver) setGameOver(true);

    updateProgress(prev => {
      let next = applyAnswer(prev, {
        grade: classification.grade,
        evLoss,
        xp,
        difficulty: currentScenario._meta?.difficulty ?? 5,
        concepts,
      });
      next = applyStreak(next, newConsecutive);

      if (runOver) {
        next = {
          ...next,
          bestArenaFloor: Math.max(next.bestArenaFloor, floor),
          bestArenaScore: Math.max(next.bestArenaScore, runScore + points),
        };
      }

      const { unlocked, progress: withAchievements } = collectAchievements(next);
      if (unlocked.length > 0) setNewAchievements(a => [...a, ...unlocked]);
      return withAchievements;
    });
  }, [currentScenario, showFeedback, gameOver, consecutiveCorrect, lives, isBossHand, floor, runScore, totalHandsPlayed]);

  const nextHand = useCallback(() => {
    if (gameOver) return;

    let nextFloor = floor;
    let nextHandOnFloor = handOnFloor + 1;

    if (isBossHand) {
      if (bossCleared) {
        setBossesDefeated(prev => prev + 1);
        // Persist immediately rather than only at game over — quitting a run
        // mid-way used to discard every boss kill in it.
        updateProgress(prev => ({
          ...prev,
          arenaBossesDefeated: prev.arenaBossesDefeated + 1,
        }));
      }

      if (blundersOnFloor === 0 && lives < MAX_LIVES) {
        setLives(prev => Math.min(MAX_LIVES, prev + 1));
      }

      nextFloor = floor + 1;
      nextHandOnFloor = 0;
      setFloor(nextFloor);
      setFloorsCleared(prev => prev + 1);
      setBlundersOnFloor(0);
      setBossCleared(false);

      updateProgress(prev => ({
        ...prev,
        bestArenaFloor: Math.max(prev.bestArenaFloor, nextFloor - 1),
      }));
    }

    setHandOnFloor(nextHandOnFloor);

    const { scenario, isBoss } = generateNextScenario(
      nextFloor, nextHandOnFloor, consecutiveCorrect, justLostLife
    );
    setCurrentScenario(scenario);
    setIsBossHand(isBoss);
    setShowFeedback(false);
    setFeedback(null);
  }, [gameOver, floor, handOnFloor, isBossHand, bossCleared, consecutiveCorrect, justLostLife, blundersOnFloor, lives]);

  const restartArena = useCallback(() => {
    const p = getProgress();
    setRecordsAtRunStart({ floor: p.bestArenaFloor, score: p.bestArenaScore });
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
    setBossCleared(false);
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
    progress: persisted,
    recordsAtRunStart,
    levelInfo,
    newAchievements,
    handleAction,
    nextHand,
    restartArena,
    dismissAchievement,
    handsPerFloor: HANDS_PER_FLOOR,
    maxLives: MAX_LIVES,
  };
}
