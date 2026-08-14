import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { SCENARIOS, EXPLOITS, gradeAction, SCORE_CONFIG } from '../data/gtoData';
import { getLevelForXP } from '../data/gtoData';
import { generateScenario } from '../engine/scenarioGenerator';
import { conceptsForScenario } from '../engine/conceptTagger';
import { nextDifficulty } from '../engine/masteryModel';
import { applyAnswer, applyStreak, applySessionStart, collectAchievements } from '../engine/sessionRecorder';
import { updateProgress, getProgress } from '../state/progressStore';
import { profileFor, DEFAULT_CURATED_WEIGHT } from '../data/drillProfiles';
import { useProgress } from './useProgress';

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

// The session log feeds the summary screen. Unbounded, it grows without limit
// in a mode that is now explicitly designed to be played indefinitely.
const MAX_SESSION_RESULTS = 200;

function shuffled(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Endless, adaptive drill session.
 *
 * Drills used to be a fixed array of handwritten scenarios, shuffled once and
 * then exhausted — six to thirteen hands and a "drill complete" wall. There is
 * no wall now: the handwritten scenarios stay in rotation as anchors and the
 * rest is generated to the drill's profile, at a difficulty tracking the
 * player's rating, biased toward whatever the mastery model says is due.
 */
export function useTrainer(drillId) {
  const progress = useProgress();
  const profile = useMemo(() => profileFor(drillId), [drillId]);

  // Handwritten scenarios for this drill, reshuffled each time the deck runs
  // out so they recur without repeating in a fixed order.
  const curatedDeck = useRef([]);
  const curatedSource = useMemo(() => SCENARIOS[drillId] || [], [drillId]);

  const drawCurated = useCallback(() => {
    if (curatedSource.length === 0) return null;
    if (curatedDeck.current.length === 0) curatedDeck.current = shuffled(curatedSource);
    return curatedDeck.current.pop();
  }, [curatedSource]);

  const nextScenario = useCallback(() => {
    const current = getProgress();
    // A curated-only drill has no procedural equivalent (see drillProfiles.js);
    // it recycles its handwritten scenarios rather than dealing something that
    // does not match its label.
    const curatedWeight = profile.curatedOnly ? 1 : (profile.curatedWeight ?? DEFAULT_CURATED_WEIGHT);

    if (curatedSource.length > 0 && Math.random() < curatedWeight) {
      const scenario = drawCurated();
      if (scenario) {
        return {
          ...scenario,
          concepts: conceptsForScenario(scenario),
          _meta: { ...scenario._meta, curated: true, difficulty: 5 },
        };
      }
    }

    return generateScenario(nextDifficulty(current.skillRating), {
      profile,
      concepts: current.reviewQueue,
    });
  }, [profile, curatedSource, drawCurated]);

  // The first hand comes straight from the adaptive generator rather than
  // through nextScenario(), which reads the curated deck ref — refs must not be
  // touched during render, and a lazy initialiser runs during render.
  const [currentScenario, setCurrentScenario] = useState(() => {
    const current = getProgress();
    return generateScenario(nextDifficulty(current.skillRating), {
      profile,
      concepts: current.reviewQueue,
    });
  });
  const [stats, setStats] = useState(initialSessionStats);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [exploit, setExploit] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [scorePopup, setScorePopup] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  const popupTimer = useRef(null);

  useEffect(() => {
    updateProgress(p => applySessionStart(p));
    return () => {
      if (popupTimer.current) clearTimeout(popupTimer.current);
    };
  }, []);

  // Switching drills gets a clean session by remounting: App keys TrainerView
  // on the drill id. Resetting the state from an effect instead would render
  // one frame of the previous drill's hand before correcting itself.

  const activeStrategy = useMemo(() => {
    if (!currentScenario) return null;
    const base = currentScenario.gtoStrategy;
    if (exploit && EXPLOITS[exploit]) return EXPLOITS[exploit].adjust(base);
    return base;
  }, [currentScenario, exploit]);

  const levelInfo = useMemo(() => getLevelForXP(progress.xp), [progress.xp]);

  const handleAction = useCallback((chosenAction) => {
    if (!activeStrategy || showFeedback) return;

    const { evLoss, classification } = gradeAction(activeStrategy, chosenAction);
    const chosenActionData = activeStrategy.actions.find(a => a.action === chosenAction);
    const bestActionData = activeStrategy.actions.reduce(
      (best, a) => (a.ev > best.ev ? a : best), activeStrategy.actions[0]
    );

    const isCorrect = classification.grade === 'perfect' || classification.grade === 'acceptable';
    const scoreData = SCORE_CONFIG[classification.grade];

    const newStreak = isCorrect ? stats.currentStreak + 1 : 0;
    const streakMultiplier = Math.min(newStreak, SCORE_CONFIG.maxStreakMultiplier);
    const streakXP = isCorrect ? streakMultiplier * SCORE_CONFIG.streakBonus : 0;
    const totalXP = scoreData.xp + streakXP;

    const concepts = currentScenario.concepts || conceptsForScenario(currentScenario);

    const result = {
      chosenAction,
      chosenEV: chosenActionData?.ev ?? 0,
      bestAction: bestActionData.action,
      bestEV: bestActionData.ev,
      evLoss: Math.round(evLoss * 100) / 100,
      classification,
      strategy: activeStrategy,
      scenario: currentScenario,
      concepts,
      score: scoreData.points,
      xpGained: totalXP,
      streakBonus: streakXP,
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
        concepts,
        drillId,
        isExploit: Boolean(exploit),
      });
      next = applyStreak(next, newStreak);

      const { unlocked, progress: withAchievements } = collectAchievements(next);
      if (unlocked.length > 0) setNewAchievements(a => [...a, ...unlocked]);
      return withAchievements;
    });
  }, [activeStrategy, showFeedback, currentScenario, stats.currentStreak, stats.handsPlayed, exploit, drillId]);

  const nextHand = useCallback(() => {
    setShowFeedback(false);
    setFeedback(null);
    setCurrentScenario(nextScenario());
  }, [nextScenario]);

  // The session no longer ends on its own — the player chooses when to stop
  // and see the summary.
  const endSession = useCallback(() => setSessionEnded(true), []);

  const resumeSession = useCallback(() => {
    setSessionEnded(false);
    setShowFeedback(false);
    setFeedback(null);
    setCurrentScenario(nextScenario());
  }, [nextScenario]);

  const resetDrill = useCallback(() => {
    // The old implementation built a freshly shuffled array and then never
    // used it, so "Reset" replayed the identical scenario order.
    curatedDeck.current = [];
    setStats(initialSessionStats);
    setFeedback(null);
    setShowFeedback(false);
    setSessionEnded(false);
    setScorePopup(null);
    setCurrentScenario(nextScenario());
  }, [nextScenario]);

  const toggleExploit = useCallback((exploitId) => {
    setExploit(prev => (prev === exploitId ? null : exploitId));
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
    scorePopup,
    newAchievements,
    sessionEnded,
    handleAction,
    nextHand,
    endSession,
    resumeSession,
    resetDrill,
    toggleExploit,
    dismissAchievement,
  };
}
