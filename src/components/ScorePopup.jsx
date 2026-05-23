import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Heart, HeartCrack } from 'lucide-react';

const GRADE_COLORS = {
  perfect: '#22c55e',
  acceptable: '#3b82f6',
  inaccuracy: '#f59e0b',
  blunder: '#ef4444',
};

export default function ScorePopup({ data }) {
  if (!data) return null;

  const showMultiplier = data.multiplier && data.multiplier > 1;
  const isMaxMultiplier = data.multiplier >= 5;

  return (
    <AnimatePresence>
      <motion.div
        key={data.points + '-' + data.xp + '-' + Math.random()}
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 pointer-events-none"
      >
        {/* Points */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.4 }}
          className="text-4xl font-extrabold"
          style={{ color: GRADE_COLORS[data.grade] }}
        >
          +{data.points}
        </motion.div>

        {/* Multiplier */}
        {showMultiplier && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className={`text-xs font-extrabold flex items-center gap-1 ${isMaxMultiplier ? 'text-gold' : 'text-purple-400'}`}
          >
            {data.multiplier >= 3 && <Flame size={12} className="fill-current" />}
            {isMaxMultiplier && <Zap size={12} className="fill-current" />}
            {data.multiplier}x Multiplier
          </motion.div>
        )}

        {/* XP */}
        {data.xp > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-semibold text-purple-400"
          >
            +{data.xp} XP
          </motion.div>
        )}

        {/* Streak */}
        {data.streak >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex items-center gap-1 text-orange-400 font-bold text-sm"
          >
            <Flame size={16} />
            {data.streak}x Streak!
          </motion.div>
        )}

        {/* Life events */}
        {data.lostLife && (
          <motion.div
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="flex items-center gap-1 text-red-400 font-bold text-sm mt-1"
          >
            <HeartCrack size={16} />
            Life Lost!
          </motion.div>
        )}
        {data.gainedLife && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, type: 'spring' }}
            className="flex items-center gap-1 text-green-400 font-bold text-sm mt-1"
          >
            <Heart size={16} className="fill-green-400" />
            +1 Life!
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
