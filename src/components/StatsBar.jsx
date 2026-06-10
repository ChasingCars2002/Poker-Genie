import { motion } from 'framer-motion';
import { Flame, Target, Trophy } from 'lucide-react';
import { streakMultiplier } from '../data/gtoData';

// Compact session HUD: progress, score, streak, accuracy.
export default function StatsBar({ score, streak, accuracy, currentIndex, scenarioCount, handsPlayed }) {
  const progress = scenarioCount > 0 ? (handsPlayed / scenarioCount) * 100 : 0;
  const multiplier = streakMultiplier(streak);
  const onFire = streak >= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-800/50 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden"
    >
      <div className="flex items-center justify-between gap-4 py-2.5 px-4">
        {/* Score */}
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-gold" />
          <motion.span
            key={score}
            initial={{ scale: 1.35, color: '#fbbf24' }}
            animate={{ scale: 1, color: '#e2e8f0' }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-sm font-bold font-mono"
          >
            {score.toLocaleString()}
          </motion.span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={onFire ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={onFire ? { repeat: Infinity, duration: 1.2 } : {}}
          >
            <Flame size={15} className={onFire ? 'text-orange-400' : streak > 0 ? 'text-amber-500' : 'text-gray-600'} />
          </motion.div>
          <span className={`text-sm font-bold font-mono ${onFire ? 'text-orange-300' : streak > 0 ? 'text-amber-300' : 'text-gray-500'}`}>
            {streak}
          </span>
          {multiplier > 1 && (
            <motion.span
              key={multiplier}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="text-[10px] font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-1.5 py-0.5 rounded-full"
            >
              ×{multiplier.toFixed(1)}
            </motion.span>
          )}
        </div>

        {/* Accuracy */}
        <div className="flex items-center gap-2">
          <Target size={14} className="text-green-400" />
          <span className="text-sm font-semibold text-gray-300 font-mono">
            {accuracy === null ? '—' : `${accuracy}%`}
          </span>
        </div>

        {/* Hand counter */}
        <span className="text-xs text-gray-500 font-mono">
          {Math.min(currentIndex + 1, scenarioCount)}/{scenarioCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface-900">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="h-full bg-gradient-to-r from-gold to-amber-500"
        />
      </div>
    </motion.div>
  );
}
