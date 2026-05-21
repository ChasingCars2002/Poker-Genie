import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';

export default function AchievementToast({ achievement, onDismiss }) {
  useEffect(() => {
    if (!achievement) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-900/90 to-yellow-900/90 backdrop-blur-sm border border-gold/30 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-4 max-w-sm pointer-events-none"
      >
        <div className="p-2 bg-gold/20 rounded-xl">
          <Trophy size={24} className="text-gold" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gold/80 uppercase tracking-wider font-semibold">Achievement Unlocked</p>
          <p className="text-base font-bold text-white">{achievement.name}</p>
          <p className="text-xs text-gray-400">{achievement.description}</p>
        </div>
        <button onClick={onDismiss} className="text-gray-500 hover:text-white cursor-pointer pointer-events-auto">
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
