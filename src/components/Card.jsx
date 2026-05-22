import { motion } from 'framer-motion';
import { SUIT_SYMBOLS, SUIT_COLORS, parseCard } from '../data/gtoData';

const SIZES = {
  sm: 'w-10 h-14 text-sm',
  md: 'w-14 h-20 text-lg',
  lg: 'w-18 h-26 text-2xl',
};

export default function Card({ card, faceDown = false, size = 'md', delay = 0 }) {
  const { rank, suit } = parseCard(card);
  const color = SUIT_COLORS[suit];

  if (faceDown) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, delay }}
        className={`${SIZES[size]} rounded-lg bg-gradient-to-br from-blue-800 to-blue-950 border border-blue-600/30 flex items-center justify-center shadow-lg`}
      >
        <div className="w-[70%] h-[80%] rounded border border-blue-500/20 bg-blue-900/50 flex items-center justify-center">
          <span className="text-blue-400/40 text-xs font-bold">PG</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, delay }}
      className={`${SIZES[size]} rounded-lg bg-white border border-gray-200 flex flex-col items-center justify-center shadow-lg`}
    >
      <span className="font-bold leading-none" style={{ color }}>{rank}</span>
      <span className="leading-none -mt-0.5" style={{ color, fontSize: size === 'sm' ? '0.7rem' : '1rem' }}>
        {SUIT_SYMBOLS[suit]}
      </span>
    </motion.div>
  );
}
