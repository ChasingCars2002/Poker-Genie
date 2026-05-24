import { motion } from 'framer-motion';
import { SUIT_SYMBOLS, SUIT_COLORS, parseCard } from '../data/gtoData';

const SUIT_TINT = { s: 'from-slate-50 to-white', h: 'from-rose-50 to-white', d: 'from-sky-50 to-white', c: 'from-emerald-50 to-white' };

const SIZES = {
  sm: { outer: 'w-10 h-14', rank: 'text-[11px]', suit: 'text-[8px]', center: 'text-xl' },
  md: { outer: 'w-14 h-20', rank: 'text-sm',     suit: 'text-[9px]',  center: 'text-3xl' },
  lg: { outer: 'w-18 h-26', rank: 'text-[15px]', suit: 'text-[10px]', center: 'text-4xl' },
};

export default function Card({ card, faceDown = false, size = 'md', delay = 0 }) {
  const s = SIZES[size] || SIZES.md;

  if (faceDown) {
    return (
      <motion.div
        initial={{ rotateY: 180, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay }}
        className={`${s.outer} rounded-lg bg-gradient-to-br from-blue-800 to-blue-950 border border-blue-600/30 flex items-center justify-center shadow-lg`}
      >
        <div className="w-[70%] h-[80%] rounded border border-blue-500/20 bg-blue-900/50 flex items-center justify-center">
          <span className="text-blue-400/40 text-[10px] font-bold">PG</span>
        </div>
      </motion.div>
    );
  }

  const { rank, suit } = parseCard(card);
  const color = SUIT_COLORS[suit];
  const symbol = SUIT_SYMBOLS[suit];
  const tint = SUIT_TINT[suit] || 'from-white to-white';

  return (
    <motion.div
      initial={{ rotateY: -90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay, type: 'spring', stiffness: 200 }}
      className={`${s.outer} rounded-lg bg-gradient-to-br ${tint} border border-gray-200 shadow-lg relative select-none overflow-hidden`}
    >
      {/* Top-left index */}
      <div className="absolute top-0.5 left-1 flex flex-col items-center leading-none" style={{ color }}>
        <span className={`${s.rank} font-black leading-none`}>{rank}</span>
        <span className={`${s.suit} leading-none`}>{symbol}</span>
      </div>

      {/* Center pip */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={s.center} style={{ color }}>{symbol}</span>
      </div>

      {/* Bottom-right index (rotated 180°) */}
      <div className="absolute bottom-0.5 right-1 flex flex-col items-center leading-none rotate-180" style={{ color }}>
        <span className={`${s.rank} font-black leading-none`}>{rank}</span>
        <span className={`${s.suit} leading-none`}>{symbol}</span>
      </div>
    </motion.div>
  );
}
