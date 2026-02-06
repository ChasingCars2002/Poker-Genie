import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target, Shield, Layers, ShieldAlert, Sparkles, ChevronRight,
  Flame, Zap, Users, Crosshair, Star, Trophy,
} from 'lucide-react';
import { SCENARIOS, getLevelForXP, ACHIEVEMENTS } from '../data/gtoData';
import LevelBar from './LevelBar';

const ICONS = {
  target: Target,
  shield: Shield,
  layers: Layers,
  'shield-alert': ShieldAlert,
  flame: Flame,
  zap: Zap,
  users: Users,
  crosshair: Crosshair,
};

const DIFFICULTY_COLORS = {
  Beginner: 'text-green-400 bg-green-400/10 border-green-400/20',
  Intermediate: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Advanced: 'text-red-400 bg-red-400/10 border-red-400/20',
};

function loadProgress() {
  try {
    const saved = localStorage.getItem('poker-genie-progress');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { xp: 0, totalHands: 0, totalCorrect: 0, bestStreak: 0, unlockedAchievements: [] };
}

export default function DrillSelector({ drills, onSelect }) {
  const [progress, setProgress] = useState(loadProgress);
  const levelInfo = getLevelForXP(progress.xp);
  const accuracy = progress.totalHands > 0
    ? Math.round((progress.totalCorrect / progress.totalHands) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 mt-4"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="text-gold" size={32} />
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-gold via-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Poker Genie
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          GTO Trainer — Master poker strategy with human-centric learning
        </p>
      </motion.div>

      {/* Level & Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl mb-4"
      >
        <LevelBar levelInfo={levelInfo} />
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-center gap-6 mb-6 text-sm"
      >
        <div className="flex items-center gap-2">
          <Target size={14} className="text-gray-400" />
          <span className="text-gray-500">Hands:</span>
          <span className="font-bold text-gray-300">{progress.totalHands}</span>
        </div>
        <div className="flex items-center gap-2">
          <Star size={14} className="text-green-400" />
          <span className="text-gray-500">Accuracy:</span>
          <span className="font-bold text-green-400">{accuracy}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-orange-400" />
          <span className="text-gray-500">Best Streak:</span>
          <span className="font-bold text-orange-400">{progress.bestStreak}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-gold" />
          <span className="text-gray-500">Trophies:</span>
          <span className="font-bold text-gold">{progress.unlockedAchievements?.length || 0}/{ACHIEVEMENTS.length}</span>
        </div>
      </motion.div>

      {/* Drill Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {drills.map((drill, i) => {
          const Icon = ICONS[drill.icon] || Target;
          const diffClass = DIFFICULTY_COLORS[drill.difficulty] || DIFFICULTY_COLORS.Beginner;
          const scenarioCount = (SCENARIOS[drill.id] || []).length;

          return (
            <motion.button
              key={drill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
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
                  {drill.heroPosition} vs {drill.villainPosition} • {scenarioCount} hands
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
        className="mt-8 text-xs text-gray-600 text-center"
      >
        Strategies simplified to human-memorizable frequencies (0/25/50/75/100%)
      </motion.p>
    </div>
  );
}
