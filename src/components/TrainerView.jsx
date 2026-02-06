import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Flame } from 'lucide-react';
import TableView from './TableView';
import StrategyFeedback from './StrategyFeedback';
import StatsBar from './StatsBar';
import ExploitToggle from './ExploitToggle';
import LevelBar from './LevelBar';
import ScorePopup from './ScorePopup';
import AchievementToast from './AchievementToast';
import SessionSummary from './SessionSummary';
import { useTrainer } from '../hooks/useTrainer';
import { DRILLS } from '../data/gtoData';

export default function TrainerView({ drillId, onBack }) {
  const drill = DRILLS.find(d => d.id === drillId);
  const {
    currentScenario,
    activeStrategy,
    feedback,
    showFeedback,
    stats,
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
    scenarioCount,
    currentIndex,
  } = useTrainer(drillId);

  // Session Summary screen
  if (drillComplete) {
    return (
      <SessionSummary
        stats={stats}
        drillName={drill?.name || 'Drill'}
        onReplay={resetDrill}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Score Popup */}
      <ScorePopup data={scorePopup} />

      {/* Achievement Toast */}
      <AchievementToast
        achievement={newAchievements[0] || null}
        onDismiss={dismissAchievement}
      />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">{drill?.name}</h2>
          <p className="text-xs text-gray-500">
            Hand {currentIndex + 1} / {scenarioCount}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetDrill}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
        >
          <RotateCcw size={14} />
          Reset
        </motion.button>
      </div>

      {/* Level Bar */}
      <div className="mb-3">
        <LevelBar levelInfo={levelInfo} />
      </div>

      {/* Score + Streak */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gold">Score: {stats.totalScore}</span>
          {stats.currentStreak >= 2 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-sm font-bold text-orange-400"
            >
              <Flame size={14} /> {stats.currentStreak}x Streak
            </motion.span>
          )}
        </div>
        <span className="text-xs text-gray-500">+{stats.xpEarned} XP this session</span>
      </div>

      {/* Stats */}
      <div className="mb-4">
        <StatsBar stats={stats} />
      </div>

      {/* Exploit Toggle */}
      <div className="mb-4">
        <ExploitToggle activeExploit={exploit} onToggle={toggleExploit} />
      </div>

      {/* Table */}
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
          <StrategyFeedback feedback={feedback} onNext={nextHand} isLastHand={currentIndex + 1 >= scenarioCount} />
        </div>
      )}
    </div>
  );
}
