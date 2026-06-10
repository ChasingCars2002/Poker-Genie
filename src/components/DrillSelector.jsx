import { motion } from 'framer-motion';
import { Target, Shield, Layers, TrendingUp, Swords, Zap, Sparkles, ChevronRight, Trophy, Flame } from 'lucide-react';
import { loadProgress } from '../data/gtoData';

const ICONS = {
  target: Target,
  shield: Shield,
  layers: Layers,
  'trending-up': TrendingUp,
  swords: Swords,
  zap: Zap,
};

const DIFFICULTY_COLORS = {
  Beginner: 'text-green-400 bg-green-400/10 border-green-400/20',
  Intermediate: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Advanced: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function DrillSelector({ drills, onSelect }) {
  const progress = loadProgress();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <Sparkles className="text-gold" size={32} />
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-gold via-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Poker Genie
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-md mx-auto mb-4">
          GTO Trainer — pick a drill, beat your best
        </p>
        {(progress.totalXP > 0 || progress.bestStreak > 0) && (
          <div className="flex items-center justify-center gap-5 text-sm">
            <span className="flex items-center gap-1.5 text-gold">
              <Trophy size={14} /> <span className="font-mono font-bold">{progress.totalXP.toLocaleString()}</span>
              <span className="text-gray-500 text-xs">XP</span>
            </span>
            <span className="flex items-center gap-1.5 text-orange-300">
              <Flame size={14} /> <span className="font-mono font-bold">{progress.bestStreak}</span>
              <span className="text-gray-500 text-xs">best streak</span>
            </span>
          </div>
        )}
      </motion.div>

      {/* Drill Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {drills.map((drill, i) => {
          const Icon = ICONS[drill.icon] || Target;
          const diffClass = DIFFICULTY_COLORS[drill.difficulty] || DIFFICULTY_COLORS.Beginner;
          const best = progress.drills[drill.id];

          return (
            <motion.button
              key={drill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(drill.id)}
              className="group text-left bg-surface-800 hover:bg-surface-700 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-surface-700 group-hover:bg-surface-600 transition-colors">
                  <Icon size={22} className="text-gold" />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${diffClass}`}>
                  {drill.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-100 mb-1.5 group-hover:text-white transition-colors">
                {drill.name}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                {drill.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {best
                    ? <span className="text-gray-500">Best: <span className="text-gold font-mono">{best.bestScore.toLocaleString()}</span> · <span className="font-mono">{best.bestAccuracy}%</span></span>
                    : `${drill.heroPosition} vs ${drill.villainPosition} • ${drill.potType}`}
                </span>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gold group-hover:translate-x-1 transition-all" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-xs text-gray-600 text-center max-w-md"
      >
        Frequencies simplified to 0/25/50/75/100%. Any action the solver actually mixes counts as correct — that&apos;s how GTO works.
      </motion.p>
    </div>
  );
}
