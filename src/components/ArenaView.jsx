import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import TableView from './TableView';
import StrategyFeedback from './StrategyFeedback';
import LevelBar from './LevelBar';
import ScorePopup from './ScorePopup';
import AchievementToast from './AchievementToast';
import ArenaHUD from './ArenaHUD';
import RunSummary from './RunSummary';
import { useArena } from '../hooks/useArena';

export default function ArenaView({ onBack }) {
  const {
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
    levelInfo,
    newAchievements,
    handleAction,
    nextHand,
    restartArena,
    dismissAchievement,
    handsPerFloor,
  } = useArena();

  if (gameOver) {
    return (
      <RunSummary
        stats={{
          floorsCleared,
          totalHandsPlayed,
          runScore,
          bestStreak,
          bossesDefeated,
          xpEarned,
          results,
        }}
        onReplay={restartArena}
        onBack={onBack}
      />
    );
  }

  const activeStrategy = currentScenario?.gtoStrategy || null;

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Score Popup */}
      <ScorePopup data={scorePopup} />

      {/* Achievement Toast */}
      <AchievementToast
        achievement={newAchievements[0] || null}
        onDismiss={dismissAchievement}
      />

      {/* Level Bar */}
      <div className="mb-3">
        <LevelBar levelInfo={levelInfo} />
      </div>

      {/* Arena HUD */}
      <div className="mb-3">
        <ArenaHUD
          lives={lives}
          floor={floor}
          handOnFloor={handOnFloor}
          handsPerFloor={handsPerFloor}
          multiplier={multiplier}
          runScore={runScore}
          isBossHand={isBossHand}
          consecutiveCorrect={consecutiveCorrect}
        />
      </div>

      {/* Streak */}
      {consecutiveCorrect >= 2 && (
        <div className="flex items-center justify-center mb-3">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-sm font-bold text-orange-400"
          >
            <Flame size={14} /> {consecutiveCorrect} in a row
          </motion.span>
        </div>
      )}

      {/* Table */}
      <div className={`mb-6 ${isBossHand ? 'ring-2 ring-red-500/40 rounded-2xl' : ''}`}>
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
          <StrategyFeedback
            feedback={feedback}
            onNext={nextHand}
            isLastHand={false}
          />
        </div>
      )}
    </div>
  );
}
