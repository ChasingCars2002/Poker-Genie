import Card from './Card';
import ActionBar from './ActionBar';
import { POSITIONS } from '../data/gtoData';

function EmptySlot({ label }) {
  return (
    <div className="w-18 h-26 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

export default function TableView({ scenario, strategy, onAction, disabled }) {
  if (!scenario) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No scenario loaded</div>;
  }

  const { board, heroHand, heroPosition, villainPosition, potSize, effectiveStack, street } = scenario;
  const boardCards = [board.flop, board.turn, board.river].filter(Boolean).flat();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative bg-gradient-to-b from-felt-700 to-felt-900 rounded-3xl border border-felt-600/50 p-6 mb-6 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

        <div className="relative flex flex-col items-center mb-8">
          <div className="bg-surface-800/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-gray-300 border border-white/10 mb-3">
            {POSITIONS[villainPosition]} ({villainPosition})
          </div>
          <div className="flex gap-2">
            <Card card="Xx" faceDown size="sm" />
            <Card card="Xx" faceDown size="sm" delay={0.03} />
          </div>
        </div>

        <div className="flex flex-col items-center mb-8">
          <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{street}</span>
          <div className="flex gap-2">
            {boardCards.map((card, i) => (
              <Card key={card + i} card={card} size="lg" delay={i * 0.04} />
            ))}
            {!board.turn && <EmptySlot label="Turn" />}
            {!board.river && <EmptySlot label="River" />}
          </div>
          <div className="mt-3 bg-gold/10 border border-gold/20 px-4 py-1 rounded-full">
            <span className="text-gold font-bold text-sm">{potSize.toFixed(1)} BB</span>
          </div>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="flex gap-2 mb-3">
            {heroHand.map((card, i) => (
              <Card key={card} card={card} size="lg" delay={0.08 + i * 0.04} />
            ))}
          </div>
          <div className="bg-accent-blue/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold text-blue-300 border border-blue-500/30">
            Hero - {POSITIONS[heroPosition]} ({heroPosition})
          </div>
        </div>

        <div className="absolute top-4 right-4 text-xs text-gray-500">Eff: {effectiveStack} BB</div>
      </div>

      {strategy && <ActionBar actions={strategy.actions} onAction={onAction} disabled={disabled} potSize={potSize} />}
    </div>
  );
}
