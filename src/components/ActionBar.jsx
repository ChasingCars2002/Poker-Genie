import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Ban, Check, TrendingUp, Zap, ArrowUp } from 'lucide-react';

// Visual config per action key. `bet33`/`bet75` keep their legacy keys but
// render with the simplified labels the user asked for.
const ACTION_CONFIG = {
  fold:  { label: 'Fold',    color: 'bg-accent-red',    hoverColor: 'hover:bg-red-500',    icon: Ban,         textColor: 'text-white',  shortcut: 'F' },
  check: { label: 'Check',   color: 'bg-accent-blue',   hoverColor: 'hover:bg-blue-500',   icon: Check,       textColor: 'text-white',  shortcut: 'C' },
  call:  { label: 'Call',    color: 'bg-accent-green',  hoverColor: 'hover:bg-green-500',  icon: Check,       textColor: 'text-white',  shortcut: 'C' },
  bet33: { label: 'Bet',     color: 'bg-amber-600',     hoverColor: 'hover:bg-amber-500',  icon: TrendingUp,  textColor: 'text-white',  shortcut: 'B' },
  bet75: { label: 'Bet Big', color: 'bg-orange-600',    hoverColor: 'hover:bg-orange-500', icon: TrendingUp,  textColor: 'text-white',  shortcut: 'R' },
  betPot:{ label: 'Pot',     color: 'bg-rose-600',      hoverColor: 'hover:bg-rose-500',   icon: ArrowUp,     textColor: 'text-white',  shortcut: 'R' },
  raise: { label: 'Raise',   color: 'bg-orange-600',    hoverColor: 'hover:bg-orange-500', icon: ArrowUp,     textColor: 'text-white',  shortcut: 'R' },
  shove: { label: 'Shove',   color: 'bg-red-700',       hoverColor: 'hover:bg-red-600',    icon: Zap,         textColor: 'text-white',  shortcut: 'S' },
};

// Preferred render order based on context
const ORDER_FACING_BET = ['fold', 'call', 'raise', 'shove'];
const ORDER_OPEN_ACTION = ['check', 'bet33', 'bet75', 'betPot', 'shove'];
const ORDER_PREFLOP_PUSHFOLD = ['fold', 'call', 'shove'];

export default function ActionBar({ actions, onAction, disabled, potSize }) {
  // What does the scenario actually offer? Only render those buttons.
  const offered = useMemo(() => new Set(actions.map(a => a.action)), [actions]);
  const facingBet = offered.has('call') || offered.has('raise') || offered.has('fold') && !offered.has('check');

  const order = facingBet
    ? (offered.has('shove') && !offered.has('raise') ? ORDER_PREFLOP_PUSHFOLD : ORDER_FACING_BET)
    : ORDER_OPEN_ACTION;

  const displayActions = order
    .filter(k => offered.has(k))
    .map(k => {
      const data = actions.find(a => a.action === k);
      return { ...data, ...ACTION_CONFIG[k] };
    });

  // Keyboard shortcuts — only bind keys for actions actually on screen.
  useEffect(() => {
    if (disabled) return;
    const keyMap = {};
    displayActions.forEach(a => {
      const key = (a.shortcut || '').toLowerCase();
      if (!key) return;
      // If two buttons share a shortcut (e.g. C for Check and Call), the
      // contextual filter above means only one is on screen at a time, so
      // last-write wins is fine.
      keyMap[key] = a.action;
    });
    const handler = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (keyMap[k]) {
        e.preventDefault();
        onAction(keyMap[k]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [displayActions, onAction, disabled]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-1 mb-3 text-sm text-gray-400">
        <span>Pot:</span>
        <span className="text-gold font-semibold">{potSize?.toFixed(1)} BB</span>
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        {displayActions.map((a, i) => {
          const Icon = a.icon || Check;
          const betAmount = a.size ? `${a.size.toFixed(1)} BB` : '';
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
                relative ${a.color} ${a.hoverColor} ${a.textColor}
                px-6 py-4 rounded-xl font-semibold text-base
                flex flex-col items-center gap-1 min-w-[100px]
                transition-all duration-150 shadow-lg
                disabled:opacity-40 disabled:cursor-not-allowed
                cursor-pointer
              `}
            >
              <span className="absolute top-1.5 right-2 text-[10px] font-mono opacity-60">
                {a.shortcut}
              </span>
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
