import { motion } from 'framer-motion';
import { Check, TrendingUp, Zap, RotateCcw } from 'lucide-react';

const ACTION_CONFIG = {
  fold:    { label: 'Fold',     color: 'bg-red-600',    hover: 'hover:bg-red-500',    icon: RotateCcw },
  check:   { label: 'Check',   color: 'bg-green-600',  hover: 'hover:bg-green-500',  icon: Check },
  call:    { label: 'Call',    color: 'bg-green-600',  hover: 'hover:bg-green-500',  icon: Check },
  bet33:   { label: 'Bet 33%', color: 'bg-blue-600',   hover: 'hover:bg-blue-500',   icon: TrendingUp },
  bet75:   { label: 'Bet 75%', color: 'bg-purple-600', hover: 'hover:bg-purple-500', icon: TrendingUp },
  betPot:  { label: 'Bet Pot', color: 'bg-amber-600',  hover: 'hover:bg-amber-500',  icon: Zap },
};

export default function ActionBar({ actions, onAction, disabled, potSize }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-1 mb-3 text-sm text-gray-400">
        <span>Pot:</span>
        <span className="text-yellow-400 font-semibold">{potSize?.toFixed(1)} BB</span>
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        {actions.map((a, i) => {
          const cfg = ACTION_CONFIG[a.action] || ACTION_CONFIG.check;
          const Icon = cfg.icon;
          return (
            <motion.button
              key={a.action}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={disabled}
              onClick={() => onAction(a.action)}
              className={`
                ${cfg.color} ${cfg.hover} text-white
                px-4 py-3 rounded-xl font-semibold text-sm
                flex flex-col items-center gap-1 min-w-[82px]
                transition-colors duration-150 shadow-lg
                disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
              `}
            >
              <Icon size={17} />
              <span>{cfg.label}</span>
              {a.size != null && <span className="text-xs opacity-75">{a.size.toFixed(1)} BB</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
