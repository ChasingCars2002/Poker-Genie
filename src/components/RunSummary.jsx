import { motion } from 'framer-motion';
import { Skull, Target, Flame, Trophy, Star, AlertTriangle, XCircle, TrendingUp, Swords, ArrowLeft, RotateCcw } from 'lucide-react';

export default function RunSummary({ stats, recordsAtRunStart, onReplay, onBack }) {
  // Compared against the records as they were when the run started, not
  // against the store — by the time this screen renders, the store already
  // includes this run's result.
  const previousBest = recordsAtRunStart || { floor: 0, score: 0 };
  const isNewBestFloor = stats.floorsCleared > previousBest.floor;
  const isNewBestScore = stats.runScore > previousBest.score;

  const accuracy = stats.totalHandsPlayed > 0
    ? Math.round((stats.results.filter(r =>
        r.classification.grade === 'perfect' || r.classification.grade === 'acceptable'
      ).length / stats.totalHandsPlayed) * 100)
    : 0;

  const blunders = stats.results.filter(r => r.classification.grade === 'blunder').length;
  const inaccuracies = stats.results.filter(r => r.classification.grade === 'inaccuracy').length;

  const statItems = [
    { label: 'Floors Cleared', value: stats.floorsCleared, icon: Swords, color: 'text-purple-400', isNewBest: isNewBestFloor },
    { label: 'Hands Played', value: stats.totalHandsPlayed, icon: Target, color: 'text-gray-300' },
    { label: 'Accuracy', value: `${accuracy}%`, icon: Star, color: 'text-green-400' },
    { label: 'Final Score', value: stats.runScore.toLocaleString(), icon: Trophy, color: 'text-gold', isNewBest: isNewBestScore },
    { label: 'Best Streak', value: stats.bestStreak, icon: Flame, color: 'text-orange-400' },
    { label: 'Bosses Beaten', value: stats.bossesDefeated, icon: Skull, color: 'text-red-400' },
    { label: 'Inaccuracies', value: inaccuracies, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Blunders', value: blunders, icon: XCircle, color: 'text-red-400' },
    { label: 'XP Earned', value: `+${stats.xpEarned}`, icon: TrendingUp, color: 'text-purple-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 max-w-lg mx-auto"
    >
      {/* Skull Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-28 h-28 rounded-full border-4 border-red-500/50 bg-red-500/10 flex items-center justify-center mb-4"
      >
        <Skull size={48} className="text-red-400" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-extrabold text-white mb-1"
      >
        Run Over
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-400 mb-2"
      >
        You reached Floor {stats.floorsCleared + 1}
      </motion.p>

      {/* New Best Badges */}
      {(isNewBestFloor || isNewBestScore) && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, type: 'spring' }}
          className="flex gap-2 mb-4"
        >
          {isNewBestFloor && (
            <span className="bg-gold/20 text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold/30">
              New Best Floor!
            </span>
          )}
          {isNewBestScore && (
            <span className="bg-gold/20 text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold/30">
              New High Score!
            </span>
          )}
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-3 w-full mb-8"
      >
        {statItems.map(({ label, value, icon: Icon, color, isNewBest }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className="bg-surface-800 rounded-xl p-3 text-center border border-white/5 relative"
          >
            {isNewBest && (
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                NEW
              </span>
            )}
            <Icon size={16} className={`${color} mx-auto mb-1`} />
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Hand Results */}
      {stats.results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full mb-8"
        >
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Hand Results</h4>
          <div className="flex flex-wrap gap-1.5">
            {stats.results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 + i * 0.02, type: 'spring' }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold relative"
                style={{
                  backgroundColor: r.classification.color + '20',
                  color: r.classification.color,
                  border: `1px solid ${r.classification.color}40`,
                }}
                title={`Hand ${i + 1}: ${r.classification.label}${r.isBoss ? ' (Boss)' : ''}`}
              >
                {r.isBoss && <Skull size={8} className="absolute -top-1 -right-1 text-red-400" />}
                {r.score > 0 ? Math.round(r.score / (r.multiplier || 1)) : '0'}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 bg-surface-700 hover:bg-surface-600 px-6 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Menu
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReplay}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 px-6 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
        >
          <RotateCcw size={16} />
          Run Again
        </motion.button>
      </div>
    </motion.div>
  );
}
