import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import TableView from './TableView';
import StrategyFeedback from './StrategyFeedback';
import StatsBar from './StatsBar';
import ExploitToggle from './ExploitToggle';
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
    exploit,
    handleAction,
    nextHand,
    resetDrill,
    toggleExploit,
    scenarioCount,
    currentIndex,
  } = useTrainer(drillId);

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
          Back to Drills
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

      {/* Stats */}
      <div className="mb-5">
        <StatsBar stats={stats} />
      </div>

      {/* Exploit Toggle */}
      <div className="mb-5">
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
          <StrategyFeedback feedback={feedback} onNext={nextHand} />
        </div>
      )}
    </div>
  );
}
