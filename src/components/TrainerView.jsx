import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import TableView from './TableView';
import StrategyFeedback from './StrategyFeedback';
import SessionSummary from './SessionSummary';
import StatsBar from './StatsBar';
import { useTrainer } from '../hooks/useTrainer';
import { DRILLS } from '../data/gtoData';

export default function TrainerView({ drillId, onBack }) {
  const drill = DRILLS.find(d => d.id === drillId);
  const {
    currentScenario,
    strategy,
    feedback,
    phase,
    streak,
    score,
    accuracy,
    summary,
    stats,
    handleAction,
    nextHand,
    restart,
    scenarioCount,
    currentIndex,
  } = useTrainer(drillId);

  // Keyboard shortcuts: 1-9 to act, Enter/Space to advance
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.repeat) return;
      if (phase === 'feedback' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        nextHand();
      } else if (phase === 'acting' && strategy) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < strategy.actions.length) {
          handleAction(strategy.actions[idx].action);
        }
      } else if (phase === 'summary' && e.key === 'Enter') {
        restart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, strategy, handleAction, nextHand, restart]);

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          Drills
        </motion.button>
        <h2 className="text-lg font-bold text-white">{drill?.name}</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={restart}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
        >
          <RotateCcw size={14} />
          Restart
        </motion.button>
      </div>

      {phase === 'summary' ? (
        <SessionSummary summary={summary} onRestart={restart} onBack={onBack} />
      ) : (
        <>
          {/* HUD */}
          <div className="mb-5">
            <StatsBar
              score={score}
              streak={streak}
              accuracy={accuracy}
              currentIndex={currentIndex}
              scenarioCount={scenarioCount}
              handsPlayed={stats.handsPlayed}
            />
          </div>

          {/* Table */}
          <div className="mb-5">
            <TableView
              scenario={currentScenario}
              strategy={strategy}
              onAction={handleAction}
              disabled={phase !== 'acting'}
            />
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {phase === 'feedback' && (
              <div className="mb-6">
                <StrategyFeedback feedback={feedback} onNext={nextHand} />
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
