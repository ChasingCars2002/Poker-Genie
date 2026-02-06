import { useState, useCallback, useMemo } from 'react';
import { SCENARIOS, EXPLOITS, calculateEVLoss, classifyEVLoss } from '../data/gtoData';

const initialStats = {
  handsPlayed: 0,
  perfectPlays: 0,
  inaccuracies: 0,
  blunders: 0,
  totalEVLoss: 0,
};

export function useTrainer(drillId) {
  const scenarios = useMemo(() => SCENARIOS[drillId] || [], [drillId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState(initialStats);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [exploit, setExploit] = useState(null);
  const [history, setHistory] = useState([]);

  const currentScenario = scenarios[currentIndex] || null;

  const activeStrategy = useMemo(() => {
    if (!currentScenario) return null;
    const base = currentScenario.gtoStrategy;
    if (exploit && EXPLOITS[exploit]) {
      return EXPLOITS[exploit].adjust(base);
    }
    return base;
  }, [currentScenario, exploit]);

  const handleAction = useCallback((chosenAction) => {
    if (!activeStrategy || showFeedback) return;

    const evLoss = calculateEVLoss(activeStrategy, chosenAction);
    const classification = classifyEVLoss(evLoss);
    const chosenActionData = activeStrategy.actions.find(a => a.action === chosenAction);
    const bestActionData = activeStrategy.actions.reduce((best, a) => a.ev > best.ev ? a : best, activeStrategy.actions[0]);

    const result = {
      chosenAction,
      chosenEV: chosenActionData?.ev ?? 0,
      bestAction: bestActionData.action,
      bestEV: bestActionData.ev,
      evLoss: Math.round(evLoss * 100) / 100,
      classification,
      strategy: activeStrategy,
      scenario: currentScenario,
    };

    setFeedback(result);
    setShowFeedback(true);
    setHistory(prev => [...prev, result]);

    setStats(prev => ({
      handsPlayed: prev.handsPlayed + 1,
      perfectPlays: prev.perfectPlays + (classification.grade === 'perfect' || classification.grade === 'acceptable' ? 1 : 0),
      inaccuracies: prev.inaccuracies + (classification.grade === 'inaccuracy' ? 1 : 0),
      blunders: prev.blunders + (classification.grade === 'blunder' ? 1 : 0),
      totalEVLoss: Math.round((prev.totalEVLoss + evLoss) * 100) / 100,
    }));
  }, [activeStrategy, showFeedback, currentScenario]);

  const nextHand = useCallback(() => {
    setShowFeedback(false);
    setFeedback(null);
    setCurrentIndex(prev => (prev + 1) % scenarios.length);
  }, [scenarios.length]);

  const resetDrill = useCallback(() => {
    setCurrentIndex(0);
    setStats(initialStats);
    setFeedback(null);
    setShowFeedback(false);
    setHistory([]);
  }, []);

  const toggleExploit = useCallback((exploitId) => {
    setExploit(prev => prev === exploitId ? null : exploitId);
  }, []);

  return {
    currentScenario,
    activeStrategy,
    feedback,
    showFeedback,
    stats,
    history,
    exploit,
    handleAction,
    nextHand,
    resetDrill,
    toggleExploit,
    scenarioCount: scenarios.length,
    currentIndex,
  };
}
