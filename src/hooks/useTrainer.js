import { useState, useCallback, useMemo } from 'react';
import {
  SCENARIOS,
  gradeAction,
  streakMultiplier,
  shuffle,
  saveSessionResult,
  randomSuitPermutation,
  permuteScenarioSuits,
} from '../data/gtoData';

// Shuffle the drill's spots and re-skin each with a random suit permutation,
// so repeat sessions deal visually different (but strategically identical) hands.
function buildDeck(drillId) {
  return shuffle(SCENARIOS[drillId] || [])
    .map(s => permuteScenarioSuits(s, randomSuitPermutation()));
}

const initialStats = {
  handsPlayed: 0,
  perfect: 0,
  good: 0,
  inaccuracies: 0,
  blunders: 0,
  totalEVLoss: 0,
};

export function useTrainer(drillId) {
  const [deck, setDeck] = useState(() => buildDeck(drillId));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState(initialStats);
  const [feedback, setFeedback] = useState(null);
  const [phase, setPhase] = useState('acting'); // 'acting' | 'feedback' | 'summary'
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState(null);

  const currentScenario = deck[currentIndex] || null;
  const strategy = currentScenario?.gtoStrategy || null;

  const handleAction = useCallback((chosenAction) => {
    if (!strategy || phase !== 'acting') return;

    const result = gradeAction(strategy, chosenAction);
    const correct = result.grade === 'perfect' || result.grade === 'good';
    const newStreak = correct ? streak + 1 : 0;
    const points = Math.round(result.points * streakMultiplier(streak));

    setStreak(newStreak);
    setBestStreak(prev => Math.max(prev, newStreak));
    setScore(prev => prev + points);
    setFeedback({
      chosenAction,
      ...result,
      points,
      strategy,
      scenario: currentScenario,
    });
    setPhase('feedback');

    setStats(prev => ({
      handsPlayed: prev.handsPlayed + 1,
      perfect: prev.perfect + (result.grade === 'perfect' ? 1 : 0),
      good: prev.good + (result.grade === 'good' ? 1 : 0),
      inaccuracies: prev.inaccuracies + (result.grade === 'inaccuracy' ? 1 : 0),
      blunders: prev.blunders + (result.grade === 'blunder' ? 1 : 0),
      totalEVLoss: Math.round((prev.totalEVLoss + result.evLoss) * 100) / 100,
    }));
  }, [strategy, phase, streak, currentScenario]);

  const nextHand = useCallback(() => {
    if (phase !== 'feedback') return;
    setFeedback(null);

    if (currentIndex + 1 >= deck.length) {
      // Session complete — persist bests and show summary
      const finalAccuracy = stats.handsPlayed > 0
        ? Math.round(((stats.perfect + stats.good) / stats.handsPlayed) * 100)
        : 0;
      const { newRecord } = saveSessionResult(drillId, {
        score,
        accuracy: finalAccuracy,
        streak: bestStreak,
      });
      setSummary({ stats, score, bestStreak, accuracy: finalAccuracy, newRecord });
      setPhase('summary');
    } else {
      setCurrentIndex(prev => prev + 1);
      setPhase('acting');
    }
  }, [phase, currentIndex, deck.length, drillId, stats, score, bestStreak]);

  const restart = useCallback(() => {
    setDeck(buildDeck(drillId));
    setCurrentIndex(0);
    setStats(initialStats);
    setFeedback(null);
    setPhase('acting');
    setStreak(0);
    setBestStreak(0);
    setScore(0);
    setSummary(null);
  }, [drillId]);

  const accuracy = useMemo(() => (
    stats.handsPlayed > 0
      ? Math.round(((stats.perfect + stats.good) / stats.handsPlayed) * 100)
      : null
  ), [stats]);

  return {
    currentScenario,
    strategy,
    feedback,
    phase,
    stats,
    streak,
    bestStreak,
    score,
    accuracy,
    summary,
    handleAction,
    nextHand,
    restart,
    scenarioCount: deck.length,
    currentIndex,
  };
}
