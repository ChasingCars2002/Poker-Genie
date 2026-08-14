import { motion } from 'framer-motion';
import { SUIT_SYMBOLS, SUIT_COLORS, parseCard } from '../data/gtoData';

// The deal animation is charming once and friction three hundred times. In a
// mode built for volume, every hand paid ~1s before the hero could read their
// own cards; this keeps the flourish but gets out of the way.
const DEAL_DURATION = 0.25;

export default function Card({ card, faceDown = false, size = 'md', delay = 0 }) {
  const { rank, suit } = parseCard(card);
  const color = SUIT_COLORS[suit];
  const symbol = SUIT_SYMBOLS[suit];

  const sizes = {
    sm: 'w-10 h-14 text-sm',
    md: 'w-14 h-20 text-lg',
    lg: 'w-18 h-26 text-2xl',
  };

  if (faceDown) {
    return (
      <motion.div
        initial={{ rotateY: 180, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: DEAL_DURATION, delay }}
        className={`${sizes[size]} rounded-lg bg-gradient-to-br from-blue-800 to-blue-950 border border-blue-600/30 flex items-center justify-center shadow-lg`}
      >
        <div className="w-[70%] h-[80%] rounded border border-blue-500/20 bg-blue-900/50 flex items-center justify-center">
          <span className="text-blue-400/40 text-xs font-bold">PG</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ rotateY: -90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: DEAL_DURATION, delay, type: 'spring', stiffness: 260 }}
      className={`${sizes[size]} rounded-lg bg-white border border-gray-200 flex flex-col items-center justify-center shadow-lg relative overflow-hidden`}
      style={{ perspective: '1000px' }}
    >
      <span className="font-bold leading-none" style={{ color }}>{rank}</span>
      <span className="leading-none -mt-0.5" style={{ color, fontSize: size === 'sm' ? '0.7rem' : '1rem' }}>{symbol}</span>
    </motion.div>
  );
}
