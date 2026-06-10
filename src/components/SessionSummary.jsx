import { motion } from 'framer-motion';
import { RotateCcw, ArrowLeft, Flame, Trophy, TrendingDown, Sparkles, Target } from 'lucide-react';
import { letterGrade } from '../data/gtoData';

export default function SessionSummary({ summary, onRestart, onBack }) {
  if (!summary) return null;

  const { stats, score, bestStreak, accuracy, newRecord } = summary;
  const grade = letterGrade(accuracy);

  const breakdown = [
    { label: 'Perfect', value: stats.perfect, color: 'text-green-400' },
    { label: 'Good', value: stats.good, color: 'text-blue-400' },
    { label: 'Inaccuracies', value: stats.inaccuracies, color: 'text-amber-400' },
    { label: 'Blunders', value: stats.blunders, color: 'text-red-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="w-full max-w-2xl mx-auto bg-surface-800 rounded-3xl border border-white/10 p-8 shadow-2xl text-center"
    >
      <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-4">Session Complete</p>

      {/* Letter grade */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.15 }}
        className="mx-auto w-28 h-28 rounded-3xl flex items-center justify-center mb-3 border-2"
        style={{ borderColor: grade.color + '60', backgroundColor: grade.color + '15' }}
      >
        <span className="text-6xl font-extrabold" style={{ color: grade.color }}>{grade.letter}</span>
      </motion.div>
      <p className="text-gray-400 mb-6">{grade.blurb}</p>

      {newRecord && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
          className="inline-flex items-center gap-2 bg-gold/15 border border-gold/40 text-gold px-4 py-1.5 rounded-full text-sm font-bold mb-6"
        >
          <Sparkles size={15} /> New High Score!
        </motion.div>
      )}

      {/* Headline numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface-900/60 rounded-xl p-3 border border-white/5">
          <Trophy size={16} className="text-gold mx-auto mb-1" />
          <div className="text-xl font-bold font-mono text-white">{score.toLocaleString()}</div>
          <div className="text-[11px] text-gray-500">Score</div>
        </div>
        <div className="bg-surface-900/60 rounded-xl p-3 border border-white/5">
          <Target size={16} className="mx-auto mb-1" style={{ color: grade.color }} />
          <div className="text-xl font-bold font-mono" style={{ color: grade.color }}>{accuracy}%</div>
          <div className="text-[11px] text-gray-500">Accuracy</div>
        </div>
        <div className="bg-surface-900/60 rounded-xl p-3 border border-white/5">
          <Flame size={16} className="text-orange-400 mx-auto mb-1" />
          <div className="text-xl font-bold font-mono text-orange-300">{bestStreak}</div>
          <div className="text-[11px] text-gray-500">Best Streak</div>
        </div>
        <div className="bg-surface-900/60 rounded-xl p-3 border border-white/5">
          <TrendingDown size={16} className="text-red-400 mx-auto mb-1" />
          <div className="text-xl font-bold font-mono text-red-300">{stats.totalEVLoss.toFixed(2)}</div>
          <div className="text-[11px] text-gray-500">BB Lost vs GTO</div>
        </div>
      </div>

      {/* Grade breakdown */}
      <div className="flex items-center justify-center gap-5 mb-8">
        {breakdown.map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div className={`text-lg font-bold font-mono ${color}`}>{value}</div>
            <div className="text-[11px] text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="flex items-center gap-2 bg-gold text-surface-900 hover:bg-amber-400 px-6 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer"
        >
          <RotateCcw size={16} /> Run It Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> All Drills
        </motion.button>
      </div>
    </motion.div>
  );
}
