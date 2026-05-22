import { motion } from 'framer-motion';
import { Trophy, Target, AlertTriangle, XCircle, Flame, TrendingDown, Star, ArrowLeft, RotateCcw } from 'lucide-react';

function getGrade(accuracy) {
  if (accuracy >= 90) return { label: 'A+', color: '#22c55e', message: 'GTO Machine! Nearly perfect.' };
  if (accuracy >= 80) return { label: 'A',  color: '#22c55e', message: 'Excellent work. Shark-level play.' };
  if (accuracy >= 70) return { label: 'B+', color: '#3b82f6', message: 'Solid. Keep grinding!' };
  if (accuracy >= 60) return { label: 'B',  color: '#3b82f6', message: 'Good foundation. Review your blunders.' };
  if (accuracy >= 50) return { label: 'C',  color: '#f59e0b', message: 'Room for improvement. Study the logic tags.' };
  return                   { label: 'D',  color: '#ef4444', message: 'Keep practicing — every expert was once a beginner.' };
}

export default function SessionSummary({ stats, drillName, onReplay, onBack }) {
  const accuracy = stats.handsPlayed > 0
    ? Math.round((stats.perfectPlays / stats.handsPlayed) * 100)
    : 0;
  const grade = getGrade(accuracy);
  const avgScore = stats.handsPlayed > 0 ? Math.round(stats.totalScore / stats.handsPlayed) : 0;

  const statItems = [
    { label: 'Hands Played', value: stats.handsPlayed, icon: Target, color: 'text-gray-300' },
    { label: 'Accuracy', value: `${accuracy}%`, icon: Target, color: 'text-green-400' },
    { label: 'Avg Score', value: avgScore, icon: Star, color: 'text-purple-400' },
    { label: 'Total Score', value: stats.totalScore, icon: Trophy, color: 'text-gold' },
    { label: 'Best Streak', value: stats.bestSessionStreak, icon: Flame, color: 'text-orange-400' },
    { label: 'Inaccuracies', value: stats.inaccuracies, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Blunders', value: stats.blunders, icon: XCircle, color: 'text-red-400' },
    { label: 'EV Lost', value: `${stats.totalEVLoss.toFixed(1)} BB`, icon: TrendingDown, color: 'text-red-300' },
    { label: 'XP Earned', value: `+${stats.xpEarned}`, icon: Star, color: 'text-purple-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 max-w-lg mx-auto"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        className="w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4"
        style={{ borderColor: grade.color }}
      >
        <span className="text-5xl font-extrabold" style={{ color: grade.color }}>{grade.label}</span>
      </motion.div>

      <h2 className="text-xl font-bold text-white mb-1">Drill Complete!</h2>
      <p className="text-sm text-gray-400 mb-2">{drillName}</p>
      <p className="text-sm mb-8" style={{ color: grade.color }}>{grade.message}</p>

      <div className="grid grid-cols-3 gap-3 w-full mb-8">
        {statItems.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface-800 rounded-xl p-3 text-center border border-white/5">
            <Icon size={16} className={`${color} mx-auto mb-1`} />
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {stats.results.length > 0 && (
        <div className="w-full mb-8">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Hand Results</h4>
          <div className="flex flex-wrap gap-1.5">
            {stats.results.map((r, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: r.classification.color + '20',
                  color: r.classification.color,
                  border: `1px solid ${r.classification.color}40`,
                }}
                title={`Hand ${i + 1}: ${r.classification.label} (EV Loss: ${r.evLoss} BB)`}
              >
                {r.score > 0 ? r.score : '0'}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-surface-700 hover:bg-surface-600 px-6 py-3 rounded-xl font-semibold text-sm transition-transform duration-100 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={16} /> All Drills
        </button>
        <button
          onClick={onReplay}
          className="flex items-center gap-2 bg-accent-blue hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold text-sm transition-transform duration-100 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <RotateCcw size={16} /> Play Again
        </button>
      </div>
    </motion.div>
  );
}
