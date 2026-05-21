import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Settings, RotateCcw, Trash2 } from 'lucide-react';
import TableView from './TableView';
import StrategyFeedback from './StrategyFeedback';
import StatsBar from './StatsBar';
import ExploitToggle from './ExploitToggle';
import LevelBar from './LevelBar';
import ScorePopup from './ScorePopup';
import AchievementToast from './AchievementToast';
import { useTrainer } from '../hooks/useTrainer';
import { getAvgTier, exploitApplies, EXPLOITS } from '../data/gtoData';

function HeroMetric({ label, value, color = 'text-white', flame = false, animateKey = null }) {
  return (
    <div className="flex flex-col items-center min-w-[60px]">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</span>
      <div className={`flex items-center gap-1 text-2xl font-extrabold ${color}`}>
        {flame && <Flame size={18} className="text-orange-400" />}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={animateKey ?? value}
            initial={{ y: -10, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function TrainerView() {
  const {
    currentScenario,
    activeStrategy,
    feedback,
    showFeedback,
    stats,
    sessionAvg,
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
  } = useTrainer();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  // Keyboard: Space/Enter advances; in TrainerView for global feel.
  // Per-button shortcuts (F/C/B/R/S) are handled inside ActionBar.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (showFeedback) {
          e.preventDefault();
          nextHand();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showFeedback, nextHand]);

  const avgDisplay = lifetime.totalHands > 0 ? Math.round(lifetime.lifetimeAvgScore) : 0;
  const tier = getAvgTier(avgDisplay);
  const sessionAvgDisplay = stats.handsPlayed > 0 ? Math.round(sessionAvg) : 0;

  const exploitVisible = activeStrategy && Object.values(EXPLOITS).some(e => exploitApplies(e.id, activeStrategy));

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 max-w-3xl mx-auto">
      <ScorePopup data={scorePopup} />
      <AchievementToast
        achievement={newAchievements[0] || null}
        onDismiss={dismissAchievement}
      />

      {/* Hero metrics header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={avgDisplay}
                initial={{ y: -16, opacity: 0, scale: 0.7 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 16, opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="text-5xl font-black tabular-nums leading-none"
                style={{ color: tier.color }}
              >
                {avgDisplay}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">avg</span>
          </div>
          <span className="text-xs font-semibold mt-1" style={{ color: tier.color }}>
            {tier.label}
            <span className="text-gray-500 font-normal"> · {lifetime.totalHands.toLocaleString()} hands all-time</span>
          </span>
        </div>

        <div className="flex items-center gap-5">
          <HeroMetric label="Session" value={sessionAvgDisplay} color="text-gold" animateKey={sessionAvgDisplay} />
          <HeroMetric label="Hands" value={stats.handsPlayed} color="text-blue-300" animateKey={stats.handsPlayed} />
          <HeroMetric
            label="Streak"
            value={stats.currentStreak}
            color={stats.currentStreak >= 3 ? 'text-orange-400' : 'text-gray-300'}
            flame={stats.currentStreak >= 3}
            animateKey={stats.currentStreak}
          />
          <HeroMetric
            label="Daily"
            value={lifetime.dailyStreak || 0}
            color="text-orange-400"
            flame
            animateKey={lifetime.dailyStreak}
          />

          {/* Settings */}
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(v => !v)}
              className="text-gray-400 hover:text-white p-2 cursor-pointer"
              aria-label="Settings"
            >
              <Settings size={18} />
            </motion.button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-10 z-30 bg-surface-800 border border-white/10 rounded-xl shadow-2xl py-1 w-52"
                >
                  <button
                    onClick={() => { resetSession(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 cursor-pointer"
                  >
                    <RotateCcw size={14} /> Reset session
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Wipe ALL progress (XP, lifetime average, achievements)? This cannot be undone.')) {
                        resetAllProgress();
                        setMenuOpen(false);
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/10 cursor-pointer"
                  >
                    <Trash2 size={14} /> Wipe all progress
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Level bar */}
      <div className="mb-3">
        <LevelBar levelInfo={levelInfo} />
      </div>

      {/* Session stats strip */}
      <div className="mb-4">
        <StatsBar stats={stats} />
      </div>

      {/* Exploit toggle — hidden when no exploits apply to current scenario */}
      {exploitVisible && (
        <div className="mb-4">
          <ExploitToggle activeExploit={exploit} onToggle={toggleExploit} />
        </div>
      )}

      {/* Table + actions */}
      <div className="mb-6">
        <TableView
          scenario={currentScenario}
          strategy={activeStrategy}
          onAction={handleAction}
          disabled={showFeedback}
        />
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className="mb-6">
          <StrategyFeedback feedback={feedback} onNext={nextHand} isLastHand={false} />
        </div>
      )}
    </div>
  );
}
