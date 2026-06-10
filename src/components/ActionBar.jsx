import { motion } from 'framer-motion';
import { Ban, Check, TrendingUp, ArrowUpCircle, Phone } from 'lucide-react';

const ACTION_CONFIG = {
  fold: { color: 'bg-accent-red', hoverColor: 'hover:bg-red-500', icon: Ban },
  check: { color: 'bg-accent-green', hoverColor: 'hover:bg-green-500', icon: Check },
  call: { color: 'bg-accent-green', hoverColor: 'hover:bg-green-500', icon: Phone },
  bet33: { color: 'bg-accent-blue', hoverColor: 'hover:bg-blue-500', icon: TrendingUp },
  bet75: { color: 'bg-accent-purple', hoverColor: 'hover:bg-purple-500', icon: TrendingUp },
  raise: { color: 'bg-amber-600', hoverColor: 'hover:bg-amber-500', icon: ArrowUpCircle },
};

// Renders every action defined in the scenario — never filtered by frequency,
// so the buttons themselves don't leak the answer.
export default function ActionBar({ actions, onAction, disabled }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3 justify-center flex-wrap">
        {actions.map((a, i) => {
          const config = ACTION_CONFIG[a.action] || ACTION_CONFIG.check;
          const Icon = config.icon;
          const label = a.label || a.action.charAt(0).toUpperCase() + a.action.slice(1);
          const amount = a.action !== 'fold' && a.action !== 'check' && a.size
            ? `${a.size.toFixed(1)} BB`
            : null;
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
                ${config.color} ${config.hoverColor} text-white
                relative px-6 py-4 rounded-xl font-semibold text-base
                flex flex-col items-center gap-1 min-w-[104px]
                transition-all duration-150 shadow-lg
                disabled:opacity-40 disabled:cursor-not-allowed
                cursor-pointer
              `}
            >
              <span className="absolute top-1.5 left-2 text-[10px] font-mono text-white/50">{i + 1}</span>
              <Icon size={20} />
              <span>{label}</span>
              {amount && <span className="text-xs opacity-80">{amount}</span>}
            </motion.button>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-gray-600 mt-3">
        Press <span className="font-mono text-gray-500">1–{actions.length}</span> to act
      </p>
    </div>
  );
}
