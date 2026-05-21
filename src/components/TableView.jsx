import { motion } from 'framer-motion';
import Card from './Card';
import ActionBar from './ActionBar';
import { POSITIONS, SEAT_ORDER_9MAX } from '../data/gtoData';

// Seat coordinates around the oval, in % of the table felt's bounding box.
// Index 0 = hero (bottom-center). Index 1..8 = the other 8 seats going
// clockwise around the table, in the same order as SEAT_ORDER_9MAX rotated
// so that the hero's position is at index 0.
const SEAT_COORDS = [
  { left: '50%', top: '92%' },  // 0  hero (bottom-center)
  { left: '82%', top: '83%' },  // 1
  { left: '96%', top: '55%' },  // 2  right
  { left: '88%', top: '22%' },  // 3
  { left: '65%', top: '6%'  },  // 4
  { left: '35%', top: '6%'  },  // 5  top
  { left: '12%', top: '22%' },  // 6
  { left: '4%',  top: '55%' },  // 7  left
  { left: '18%', top: '83%' },  // 8
];

function buildSeatLayout(heroPos, villainPos) {
  const villainSet = new Set((villainPos || '').split('+').map(s => s.trim()).filter(Boolean));
  const heroIdx = SEAT_ORDER_9MAX.indexOf(heroPos);
  // Rotate so hero is at index 0; seats after hero are clockwise around.
  const rotated = heroIdx >= 0
    ? [...SEAT_ORDER_9MAX.slice(heroIdx), ...SEAT_ORDER_9MAX.slice(0, heroIdx)]
    : SEAT_ORDER_9MAX;
  return rotated.map((pos, i) => ({
    pos,
    coords: SEAT_COORDS[i],
    isHero: pos === heroPos,
    isVillain: villainSet.has(pos),
  }));
}

function Seat({ seat, heroHand, delay }) {
  const { pos, coords, isHero, isVillain } = seat;
  const active = isHero || isVillain;
  const positionLabel = POSITIONS[pos] || pos;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: active ? 1 : 0.35, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 24 }}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
      style={{ left: coords.left, top: coords.top }}
    >
      {/* Cards row */}
      <div className="flex gap-0.5 h-9">
        {isHero ? (
          heroHand.map((c, i) => <Card key={c + i} card={c} size="xs" delay={delay + i * 0.05} />)
        ) : isVillain ? (
          <>
            <Card card="Xx" faceDown size="xs" delay={delay} />
            <Card card="Xx" faceDown size="xs" delay={delay + 0.05} />
          </>
        ) : (
          <>
            <div className="w-6 h-9 rounded border border-dashed border-white/10" />
            <div className="w-6 h-9 rounded border border-dashed border-white/10" />
          </>
        )}
      </div>
      {/* Position chip */}
      <div
        className={`
          px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap border backdrop-blur-sm
          ${isHero  ? 'bg-accent-blue/30 text-blue-200 border-blue-400/50'
            : isVillain ? 'bg-red-500/20 text-red-200 border-red-400/40'
            : 'bg-surface-900/60 text-gray-500 border-white/5'}
        `}
        title={positionLabel}
      >
        {isHero ? `Hero · ${pos}` : pos}
      </div>
      {!active && (
        <span className="text-[9px] text-gray-600 uppercase tracking-wider -mt-0.5">folded</span>
      )}
    </motion.div>
  );
}

export default function TableView({ scenario, strategy, onAction, disabled }) {
  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No scenario loaded
      </div>
    );
  }

  const { board, heroHand, heroPosition, villainPosition, potSize, effectiveStack, street } = scenario;
  const boardCards = board?.flop
    ? [...board.flop, ...(board.turn ? [board.turn] : []), ...(board.river ? [board.river] : [])]
    : [];

  const seats = buildSeatLayout(heroPosition, villainPosition);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Oval table felt — taller now to fit 9 seats around */}
      <div
        className="relative bg-gradient-to-b from-felt-700 to-felt-900 border border-felt-600/50 shadow-2xl overflow-hidden mb-6"
        style={{
          borderRadius: '46%/30%',
          aspectRatio: '16 / 11',
          minHeight: '380px',
        }}
      >
        {/* Felt texture */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Inner ring — visually divides the seats from the center area */}
        <div
          className="absolute inset-[10%] rounded-[46%/30%] border border-white/5 pointer-events-none"
        />

        {/* Effective stack (top-left corner) */}
        <div className="absolute top-3 left-4 text-[10px] text-gray-500 uppercase tracking-wider">
          Eff: <span className="text-gray-300 font-semibold">{effectiveStack} BB</span>
        </div>

        {/* Street label (top-right corner) */}
        <div className="absolute top-3 right-4 text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
          {street}
        </div>

        {/* Board + pot — center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="flex gap-1.5">
            {boardCards.map((card, i) => (
              <Card key={card + i} card={card} size="md" delay={i * 0.1} />
            ))}
            {!boardCards.length && (
              <span className="text-xs text-gray-500 uppercase tracking-widest">Preflop</span>
            )}
            {boardCards.length > 0 && !board.turn && (
              <div className="w-14 h-20 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                <span className="text-[10px] text-gray-600">Turn</span>
              </div>
            )}
            {boardCards.length > 0 && !board.river && board.turn && (
              <div className="w-14 h-20 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                <span className="text-[10px] text-gray-600">River</span>
              </div>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gold/10 border border-gold/20 px-3 py-0.5 rounded-full"
          >
            <span className="text-gold font-bold text-sm">{potSize.toFixed(1)} BB</span>
          </motion.div>
        </div>

        {/* 9 seats around the oval */}
        {seats.map((seat, i) => (
          <Seat
            key={seat.pos}
            seat={seat}
            heroHand={heroHand}
            delay={0.05 + i * 0.03}
          />
        ))}
      </div>

      {/* Action Bar */}
      {strategy && (
        <ActionBar
          actions={strategy.actions}
          onAction={onAction}
          disabled={disabled}
          potSize={potSize}
        />
      )}
    </div>
  );
}
