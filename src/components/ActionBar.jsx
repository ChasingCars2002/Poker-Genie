import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hand, Check, TrendingUp, Flame } from 'lucide-react';
import { CANONICAL_ACTIONS } from '../engine/gtoEngine';

const ACTION_CONFIG = {
  check: { label: 'Check', color: 'bg-emerald-600', hoverColor: 'hover:bg-emerald-500', ring: 'ring-emerald-400', icon: Check },
  call: { label: 'Call', color: 'bg-emerald-600', hoverColor: 'hover:bg-emerald-500', ring: 'ring-emerald-400', icon: Check },
  bet33: { label: 'Bet 33%', color: 'bg-sky-600', hoverColor: 'hover:bg-sky-500', ring: 'ring-sky-400', icon: TrendingUp },
  bet75: { label: 'Bet 75%', color: 'bg-violet-600', hoverColor: 'hover:bg-violet-500', ring: 'ring-violet-400', icon: TrendingUp },
  betPot: { label: 'Overbet', color: 'bg-orange-600', hoverColor: 'hover:bg-orange-500', ring: 'ring-orange-400', icon: Flame },
  fold: { label: 'Fold', color: 'bg-rose-700', hoverColor: 'hover:bg-rose-600', ring: 'ring-rose-400', icon: Hand },
};

export default function ActionBar({ actions, onAction, disabled, potSize }) {
  // Always present the four canonical options in a stable order so the
  // 1–4 hotkeys never move under the player's fingers.
  const byAction = {};
  for (const a of actions || []) byAction[a.action] = a;

  const displayActions = CANONICAL_ACTIONS.map((act) => {
    const a = byAction[act] || { action: act, frequency: 0 };
    const cfg = ACTION_CONFIG[act] || ACTION_CONFIG.check;
    return { ...a, ...cfg, label: a.label || cfg.label };
  });

  // Keyboard shortcuts: 1–4 fire the matching action.
  useEffect(() => {
    if (disabled) return;
    const onKey = (e) => {
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < displayActions.length) {
        e.preventDefault();
        onAction(displayActions[idx].action);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled, displayActions, onAction]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-3 text-sm text-gray-400">
        <span>Pot:</span>
        <span className="text-gold font-semibold">{potSize?.toFixed(1)} BB</span>
        <span className="text-gray-600">•</span>
        <span className="text-xs text-gray-500">press 1–4</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {displayActions.map((a, i) => {
          const Icon = a.icon || Check;
          const betAmount = a.size ? `${a.size.toFixed(1)} BB` : null;
          return (
            <motion.button
              key={a.action}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 320, damping: 24 }}
              whileHover={{ scale: disabled ? 1 : 1.04 }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              disabled={disabled}
              onClick={() => onAction(a.action)}
              className={`
                relative ${a.color} ${a.hoverColor} text-white
                px-4 py-3.5 rounded-xl font-semibold text-base
                flex flex-col items-center gap-1
                transition-colors duration-150 shadow-lg
                disabled:opacity-40 disabled:cursor-not-allowed
                cursor-pointer focus:outline-none focus-visible:ring-2 ${a.ring}
              `}
            >
              <span className="absolute top-1.5 left-2 text-[0.6rem] font-bold opacity-50">{i + 1}</span>
              <Icon size={18} />
              <span className="leading-tight">{a.label}</span>
              {betAmount && <span className="text-[0.65rem] opacity-80 font-mono">{betAmount}</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
