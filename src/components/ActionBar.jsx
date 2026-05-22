import { Ban, Check, TrendingUp } from 'lucide-react';

const ACTION_CONFIG = {
  fold:   { label: 'Fold',    color: 'bg-accent-red hover:bg-red-500',       icon: Ban },
  check:  { label: 'Check',   color: 'bg-accent-green hover:bg-green-500',   icon: Check },
  call:   { label: 'Call',    color: 'bg-accent-green hover:bg-green-500',   icon: Check },
  bet33:  { label: 'Bet 33%', color: 'bg-accent-blue hover:bg-blue-500',     icon: TrendingUp },
  bet75:  { label: 'Bet 75%', color: 'bg-accent-purple hover:bg-purple-500', icon: TrendingUp },
  betPot: { label: 'Bet Pot', color: 'bg-amber-600 hover:bg-amber-500',      icon: TrendingUp },
};

export default function ActionBar({ actions, onAction, disabled, potSize }) {
  const available = actions.filter(a => a.frequency > 0 || a.action === 'check' || a.action === 'fold');
  const hasFold = available.some(a => a.action === 'fold');
  const display = hasFold ? available : [{ action: 'fold', frequency: 0, ev: 0 }, ...available];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-1 mb-3 text-sm text-gray-400">
        <span>Pot:</span>
        <span className="text-gold font-semibold">{potSize?.toFixed(1)} BB</span>
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        {display.map(a => {
          const cfg = ACTION_CONFIG[a.action] || ACTION_CONFIG.check;
          const Icon = cfg.icon;
          return (
            <button
              key={a.action}
              disabled={disabled}
              onClick={() => onAction(a.action)}
              className={`${cfg.color} text-white px-6 py-4 rounded-xl font-semibold text-base flex flex-col items-center gap-1 min-w-[100px] shadow-lg transition-transform duration-100 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
            >
              <Icon size={20} />
              <span>{cfg.label}</span>
              {a.size && <span className="text-xs opacity-80">({a.size.toFixed(1)} BB)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
