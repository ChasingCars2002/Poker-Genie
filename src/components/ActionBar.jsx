import { motion } from 'framer-motion';
import { Ban, Check, TrendingUp } from 'lucide-react';

const ACTION_CONFIG = {
  fold: { label: 'Fold', color: 'bg-accent-red', hoverColor: 'hover:bg-red-500', icon: Ban, textColor: 'text-white' },
  check: { label: 'Check', color: 'bg-accent-green', hoverColor: 'hover:bg-green-500', icon: Check, textColor: 'text-white' },
  call: { label: 'Call', color: 'bg-accent-green', hoverColor: 'hover:bg-green-500', icon: Check, textColor: 'text-white' },
  bet33: { label: 'Bet 33%', color: 'bg-accent-blue', hoverColor: 'hover:bg-blue-500', icon: TrendingUp, textColor: 'text-white' },
  bet66: { label: 'Bet 66%', color: 'bg-accent-purple', hoverColor: 'hover:bg-purple-500', icon: TrendingUp, textColor: 'text-white' },
  bet75: { label: 'Bet 75%', color: 'bg-purple-700', hoverColor: 'hover:bg-purple-600', icon: TrendingUp, textColor: 'text-white' },
  betPot: { label: 'Bet Pot', color: 'bg-amber-600', hoverColor: 'hover:bg-amber-500', icon: TrendingUp, textColor: 'text-white' },
};

export default function ActionBar({ actions, onAction, disabled, potSize }) {
  const displayActions = actions.map(a => ({
    ...a,
    ...(ACTION_CONFIG[a.action] || ACTION_CONFIG.check),
  }));

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-1 mb-3 text-sm text-gray-400">
        <span>Pot:</span>
        <span className="text-gold font-semibold">{potSize?.toFixed(1)} BB</span>
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        {displayActions.map((a, i) => {
          const Icon = a.icon || Check;
          const betAmount = a.size ? `(${a.size.toFixed(1)} BB)` : '';
          return (
            <motion.button
              key={a.action}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={disabled}
              onClick={() => onAction(a.action)}
              className={`
                ${a.color} ${a.hoverColor} ${a.textColor}
                px-4 py-3 rounded-xl font-semibold text-sm
                flex flex-col items-center gap-0.5 min-w-[85px]
                transition-all duration-150 shadow-lg
                disabled:opacity-40 disabled:cursor-not-allowed
                cursor-pointer
              `}
            >
              <Icon size={18} />
              <span>{a.label}</span>
              {betAmount && <span className="text-xs opacity-80">{betAmount}</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
