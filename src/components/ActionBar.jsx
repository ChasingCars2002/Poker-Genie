import { motion } from 'framer-motion';
import { Ban, Check, TrendingUp } from 'lucide-react';

const ACTION_CONFIG = {
  fold: { label: 'Fold', color: 'bg-accent-red', hoverColor: 'hover:bg-red-500', icon: Ban, textColor: 'text-white' },
  check: { label: 'Check', color: 'bg-accent-green', hoverColor: 'hover:bg-green-500', icon: Check, textColor: 'text-white' },
  call: { label: 'Call', color: 'bg-accent-green', hoverColor: 'hover:bg-green-500', icon: Check, textColor: 'text-white' },
  bet33: { label: 'Bet 33%', color: 'bg-accent-blue', hoverColor: 'hover:bg-blue-500', icon: TrendingUp, textColor: 'text-white' },
  bet75: { label: 'Bet 75%', color: 'bg-accent-purple', hoverColor: 'hover:bg-purple-500', icon: TrendingUp, textColor: 'text-white' },
  betPot: { label: 'Bet Pot', color: 'bg-amber-600', hoverColor: 'hover:bg-amber-500', icon: TrendingUp, textColor: 'text-white' },
};

export default function ActionBar({ actions, onAction, disabled, potSize }) {
  const availableActions = actions
    .filter(a => a.frequency > 0 || a.action === 'check' || a.action === 'fold')
    .map(a => ({
      ...a,
      ...(ACTION_CONFIG[a.action] || ACTION_CONFIG.check),
    }));

  // Always include fold if not already present
  const hasCheck = availableActions.some(a => a.action === 'check');
  const hasFold = availableActions.some(a => a.action === 'fold');

  const displayActions = [];
  if (!hasFold) displayActions.push({ action: 'fold', frequency: 0, ev: 0, ...ACTION_CONFIG.fold });
  displayActions.push(...availableActions);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-1 mb-3 text-sm text-gray-400">
        <span>Pot:</span>
        <span className="text-gold font-semibold">{potSize?.toFixed(1)} BB</span>
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        {displayActions.map((a, i) => {
          const Icon = a.icon || Check;
          const betAmount = a.size ? `(${a.size.toFixed(1)} BB)` : '';
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
                ${a.color} ${a.hoverColor} ${a.textColor}
                px-6 py-4 rounded-xl font-semibold text-base
                flex flex-col items-center gap-1 min-w-[100px]
                transition-all duration-150 shadow-lg
                disabled:opacity-40 disabled:cursor-not-allowed
                cursor-pointer
              `}
            >
              <Icon size={20} />
              <span>{a.label}</span>
              {betAmount && <span className="text-xs opacity-80">{betAmount}</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
