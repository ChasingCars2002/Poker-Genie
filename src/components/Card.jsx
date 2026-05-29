import { motion } from 'framer-motion';
import { SUIT_SYMBOLS, SUIT_COLORS, parseCard } from '../data/gtoData';

// Cards reveal their value instantly — a quick scale/fade-in instead of a
// rotateY flip (which hid the face mid-animation and felt laggy).
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
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.12, delay, ease: 'easeOut' }}
        className={`${sizes[size]} rounded-lg bg-gradient-to-br from-blue-800 to-blue-950 border border-blue-600/30 flex items-center justify-center shadow-lg`}
      >
        <div className="w-[70%] h-[80%] rounded border border-blue-500/20 bg-blue-900/50 flex items-center justify-center">
          <span className="text-blue-400/40 text-xs font-bold">PG</span>
        </div>
      </motion.div>
    );
  }

  const cornerSize = size === 'sm' ? 'text-[0.55rem]' : size === 'md' ? 'text-[0.65rem]' : 'text-xs';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.14, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.12 } }}
      className={`${sizes[size]} rounded-lg bg-gradient-to-b from-white to-gray-100 border border-gray-300 flex flex-col items-center justify-center shadow-lg relative overflow-hidden select-none`}
    >
      {/* Top-left corner pip */}
      <div className={`absolute top-0.5 left-1 leading-none font-bold ${cornerSize}`} style={{ color }}>
        <div>{rank}</div>
        <div className="-mt-0.5">{symbol}</div>
      </div>
      {/* Center */}
      <span className="font-extrabold leading-none" style={{ color }}>{rank}</span>
      <span className="leading-none -mt-0.5" style={{ color, fontSize: size === 'sm' ? '0.7rem' : '1.1rem' }}>{symbol}</span>
    </motion.div>
  );
}
