import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function LevelBar({ levelInfo }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface-800/50 rounded-xl border border-white/5">
      <div className="flex items-center gap-2">
        <Star size={16} style={{ color: levelInfo.color }} />
        <span className="text-sm font-bold" style={{ color: levelInfo.color }}>Lv.{levelInfo.level}</span>
        <span className="text-xs text-gray-400">{levelInfo.title}</span>
      </div>
      <div className="flex-1 h-2 bg-surface-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(levelInfo.progressToNext * 100)}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: levelInfo.color }}
        />
      </div>
      <span className="text-xs text-gray-500 font-mono">{levelInfo.xp} XP</span>
      {levelInfo.next && <span className="text-xs text-gray-600">/ {levelInfo.next.xpRequired}</span>}
    </div>
  );
}
