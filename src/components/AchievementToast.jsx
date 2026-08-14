import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';

// Long enough to read, short enough not to be in the way.
const AUTO_DISMISS_MS = 4500;

export default function AchievementToast({ achievement, onDismiss }) {
  // The toast used to wait for a click on its close button, while sitting
  // centred over the action bar and swallowing pointer events. Unlocking an
  // achievement mid-session locked the player out of acting until they found
  // the X — and achievements arrive in bursts, so it happened repeatedly.
  useEffect(() => {
    if (!achievement) return undefined;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={achievement.id}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 200 }}
        // Anchored to the corner rather than the centre so it cannot overlap
        // the action buttons on any viewport width.
        className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-sm z-50 bg-gradient-to-r from-amber-900/95 to-yellow-900/95 backdrop-blur-sm border border-gold/30 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-4"
      >
        <div className="p-2 bg-gold/20 rounded-xl shrink-0">
          <Trophy size={24} className="text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gold/80 uppercase tracking-wider font-semibold">Achievement Unlocked</p>
          <p className="text-base font-bold text-white truncate">{achievement.name}</p>
          <p className="text-xs text-gray-400">{achievement.description}</p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss achievement"
          className="text-gray-500 hover:text-white cursor-pointer shrink-0"
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
