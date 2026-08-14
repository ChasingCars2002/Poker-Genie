import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Skull, Flame, Swords, Zap } from 'lucide-react';

const MULTIPLIER_COLORS = {
  1: 'text-gray-400',
  1.5: 'text-green-400',
  2: 'text-blue-400',
  3: 'text-purple-400',
  4: 'text-orange-400',
  5: 'text-gold',
};

export default function ArenaHUD({ lives, floor, handOnFloor, handsPerFloor, multiplier, runScore, isBossHand }) {
  const multiplierColor = MULTIPLIER_COLORS[multiplier] || 'text-gray-400';
  const isMaxMultiplier = multiplier >= 5;

  return (
    <div className="w-full">
      {/* Lives + Floor Row */}
      <div className="flex items-center justify-between mb-2">
        {/* Lives */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <AnimatePresence key={i} mode="wait">
              {i < lives ? (
                <motion.div
                  key={`heart-${i}-full`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, rotate: -30 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Heart size={18} className="text-red-500 fill-red-500" />
                </motion.div>
              ) : (
                <motion.div
                  key={`heart-${i}-empty`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, opacity: 0.2 }}
                >
                  <Heart size={18} className="text-gray-600" />
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Floor */}
        <div className="flex items-center gap-2">
          <Swords size={14} className="text-gray-400" />
          <span className="text-sm font-bold text-gray-300">
            Floor {floor}
          </span>
          <span className="text-xs text-gray-500">
            {isBossHand ? (
              <span className="flex items-center gap-1 text-red-400 font-bold">
                <Skull size={12} /> BOSS
              </span>
            ) : (
              `Hand ${handOnFloor + 1}/${handsPerFloor}`
            )}
          </span>
        </div>
      </div>

      {/* Multiplier + Score Row */}
      <div className="flex items-center justify-between">
        {/* Multiplier */}
        <motion.div
          animate={isMaxMultiplier ? {
            scale: [1, 1.05, 1],
            transition: { repeat: Infinity, duration: 1.5 },
          } : {}}
          className={`flex items-center gap-1.5 ${multiplierColor}`}
        >
          {multiplier >= 2 && <Flame size={16} className={multiplier >= 3 ? 'fill-current' : ''} />}
          {multiplier >= 4 && <Zap size={14} className="fill-current" />}
          <span className={`text-sm font-extrabold ${isMaxMultiplier ? 'text-gold' : ''}`}>
            {multiplier}x
          </span>
          {isMaxMultiplier && (
            <span className="text-xs font-bold text-gold/70 uppercase tracking-wider">MAX</span>
          )}
        </motion.div>

        {/* Score */}
        <div className="text-sm font-bold text-gold">
          Score: {runScore.toLocaleString()}
        </div>
      </div>

      {/* Boss Hand Indicator Bar */}
      <AnimatePresence>
        {isBossHand && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 overflow-hidden"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 flex items-center justify-center gap-2">
              <Skull size={16} className="text-red-400" />
              <span className="text-sm font-bold text-red-400">Boss Battle — 3x Points, 2x XP</span>
              <Skull size={16} className="text-red-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
