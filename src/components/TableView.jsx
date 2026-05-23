import { motion } from 'framer-motion';
import Card from './Card';
import ActionBar from './ActionBar';
import { POSITIONS } from '../data/gtoData';

export default function TableView({ scenario, strategy, onAction, disabled }) {
  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No scenario loaded
      </div>
    );
  }

  const { board, heroHand, heroPosition, villainPosition, potSize, effectiveStack, street } = scenario;
  const boardCards = board.flop ? [...board.flop, ...(board.turn ? [board.turn] : []), ...(board.river ? [board.river] : [])] : [];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Table felt */}
      <div className="relative bg-gradient-to-b from-felt-700 to-felt-900 rounded-3xl border border-felt-600/50 p-6 mb-6 shadow-2xl overflow-hidden">
        {/* Felt texture overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Villain */}
        <div className="relative flex flex-col items-center mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="bg-surface-800/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-gray-300 border border-white/10 mb-3"
          >
            {POSITIONS[villainPosition] || villainPosition} ({villainPosition})
          </motion.div>
          <div className="flex gap-2">
            <Card card="Xx" faceDown size="sm" delay={0} />
            <Card card="Xx" faceDown size="sm" delay={0.05} />
          </div>
        </div>

        {/* Board */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{street}</span>
          </div>
          <div className="flex gap-2">
            {boardCards.map((card, i) => (
              <Card key={card + i} card={card} size="lg" delay={i * 0.04} />
            ))}
            {!board.turn && (
              <div className="w-18 h-26 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                <span className="text-xs text-gray-600">Turn</span>
              </div>
            )}
            {!board.river && (
              <div className="w-18 h-26 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                <span className="text-xs text-gray-600">River</span>
              </div>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.1 }}
            className="mt-3 bg-gold/10 border border-gold/20 px-4 py-1 rounded-full"
          >
            <span className="text-gold font-bold text-sm">{potSize.toFixed(1)} BB</span>
          </motion.div>
        </div>

        {/* Hero */}
        <div className="relative flex flex-col items-center">
          <div className="flex gap-2 mb-3">
            {heroHand.map((card, i) => (
              <Card key={card} card={card} size="lg" delay={i * 0.05} />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.1 }}
            className="bg-accent-blue/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-blue-300 border border-blue-500/30"
          >
            Hero - {POSITIONS[heroPosition] || heroPosition} ({heroPosition})
          </motion.div>
        </div>

        {/* Stack info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="absolute top-4 right-4 text-xs text-gray-500"
        >
          Eff: {effectiveStack} BB
        </motion.div>
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
