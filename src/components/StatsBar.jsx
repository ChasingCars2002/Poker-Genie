import { Target, AlertTriangle, XCircle, TrendingDown } from 'lucide-react';

export default function StatsBar({ stats }) {
  const accuracy = stats.handsPlayed > 0
    ? Math.round((stats.perfectPlays / stats.handsPlayed) * 100)
    : 0;

  const items = [
    { label: 'Hands', value: stats.handsPlayed, icon: Target, color: 'text-gray-300' },
    { label: 'Accurate', value: `${accuracy}%`, icon: Target, color: 'text-green-400' },
    { label: 'Inaccuracies', value: stats.inaccuracies, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Blunders', value: stats.blunders, icon: XCircle, color: 'text-red-400' },
    { label: 'EV Lost', value: `${stats.totalEVLoss.toFixed(1)} BB`, icon: TrendingDown, color: 'text-red-300' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-3 px-4 bg-surface-800/50 backdrop-blur-sm rounded-xl border border-white/5">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon size={14} className={color} />
          <span className="text-xs text-gray-500">{label}</span>
          <span className={`text-sm font-semibold ${color}`}>{value}</span>
        </div>
      ))}
    </div>
  );
}
