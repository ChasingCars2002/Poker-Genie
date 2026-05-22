import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

const GRADE_COLORS = {
  perfect: '#22c55e',
  acceptable: '#3b82f6',
  inaccuracy: '#f59e0b',
  blunder: '#ef4444',
};

export default function ScorePopup({ data }) {
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key={data.id}
          initial={{ opacity: 0, y: 14, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 pointer-events-none"
        >
          <div className="text-4xl font-extrabold" style={{ color: GRADE_COLORS[data.grade] }}>
            +{data.points}
          </div>
          {data.xp > 0 && (
            <div className="text-sm font-semibold text-purple-400">+{data.xp} XP</div>
          )}
          {data.streak >= 3 && (
            <div className="flex items-center gap-1 text-orange-400 font-bold text-sm">
              <Flame size={16} /> {data.streak}x Streak!
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
