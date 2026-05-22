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

const TOPBAR_BTN = 'flex items-center gap-2 text-gray-400 hover:text-white text-sm cursor-pointer transition-colors duration-100';

export default function TrainerView({ drillId, onBack }) {
  const drill = DRILLS.find(d => d.id === drillId);
  const {
    currentScenario, activeStrategy, feedback, showFeedback,
    stats, levelInfo, exploit, drillComplete, scorePopup, newAchievements,
    handleAction, nextHand, resetDrill, toggleExploit, dismissAchievement,
    scenarioCount, currentIndex,
  } = useTrainer(drillId);

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
      <ScorePopup data={scorePopup} />
      <AchievementToast achievement={newAchievements[0] || null} onDismiss={dismissAchievement} />

      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className={TOPBAR_BTN}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">{drill?.name}</h2>
          <p className="text-xs text-gray-500">Hand {currentIndex + 1} / {scenarioCount}</p>
        </div>
        <button onClick={resetDrill} className={TOPBAR_BTN}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="mb-3"><LevelBar levelInfo={levelInfo} /></div>

      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gold">Score: {stats.totalScore}</span>
          {stats.currentStreak >= 2 && (
            <span className="flex items-center gap-1 text-sm font-bold text-orange-400">
              <Flame size={14} /> {stats.currentStreak}x Streak
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">+{stats.xpEarned} XP this session</span>
      </div>

      <div className="mb-4"><StatsBar stats={stats} /></div>
      <div className="mb-4"><ExploitToggle activeExploit={exploit} onToggle={toggleExploit} /></div>

      <div className="mb-6">
        <TableView
          scenario={currentScenario}
          strategy={activeStrategy}
          onAction={handleAction}
          disabled={showFeedback}
        />
      </div>

      {showFeedback && (
        <div className="mb-6">
          <StrategyFeedback
            feedback={feedback}
            onNext={nextHand}
            isLastHand={currentIndex + 1 >= scenarioCount}
          />
        </div>
      )}
    </div>
  );
}
