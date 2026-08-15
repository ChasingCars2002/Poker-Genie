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

  const { board, heroHand, heroPosition, villainPosition, potSize, effectiveStack, street, context, facingBet, facingLabel } = scenario;
  const boardCards = board.flop ? [...board.flop, ...(board.turn ? [board.turn] : []), ...(board.river ? [board.river] : [])] : [];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Action context */}
      {context && (
        <motion.p
          key={scenario.id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-gray-400 mb-3 px-4"
        >
          {context}
        </motion.p>
      )}

      {/* Table felt */}
      <div className="relative bg-gradient-to-b from-felt-700 to-felt-900 rounded-3xl border border-felt-600/50 p-6 mb-5 shadow-2xl overflow-hidden">
        {/* Felt texture overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Villain */}
        <div className="relative flex flex-col items-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-800/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-gray-300 border border-white/10 mb-3"
          >
            {POSITIONS[villainPosition]} ({villainPosition})
          </motion.div>
          <div className="flex gap-2">
            <Card card="Xx" faceDown size="sm" delay={0} />
            <Card card="Xx" faceDown size="sm" delay={0.1} />
          </div>
          {facingBet && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
              className="mt-3 bg-accent-red/20 border border-red-500/40 px-3 py-1 rounded-full"
            >
              <span className="text-red-300 font-bold text-xs">{facingLabel || `Bets ${facingBet.toFixed(1)} BB`}</span>
            </motion.div>
          )}
        </div>

        {/* Board */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{street}</span>
          </div>
          <div className="flex gap-2">
            {boardCards.map((card, i) => (
              <Card key={card + i} card={card} size="lg" delay={i * 0.12} />
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
            transition={{ delay: 0.3 }}
            className="mt-3 bg-gold/10 border border-gold/20 px-4 py-1 rounded-full"
          >
            <span className="text-gold font-bold text-sm">Pot: {potSize.toFixed(1)} BB</span>
          </motion.div>
        </div>

        {/* Hero */}
        <div className="relative flex flex-col items-center">
          <div className="flex gap-2 mb-3">
            {heroHand.map((card, i) => (
              <Card key={card} card={card} size="lg" delay={0.4 + i * 0.15} />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-accent-blue/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-blue-300 border border-blue-500/30"
          >
            Hero — {POSITIONS[heroPosition]} ({heroPosition})
          </motion.div>
        </div>

        {/* Stack info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
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
        />
      )}
    </div>
  );
}
