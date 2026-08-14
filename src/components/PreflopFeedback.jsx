import { motion } from 'framer-motion';
import {
  CheckCircle, AlertTriangle, XCircle, ArrowRight, Calculator,
  GraduationCap, Scale, ShieldQuestion,
} from 'lucide-react';
import RangeGrid from './RangeGrid';
import { conceptLabel, conceptTip } from '../data/concepts';

const GRADE_ICONS = {
  perfect: CheckCircle,
  acceptable: CheckCircle,
  inaccuracy: AlertTriangle,
  blunder: XCircle,
};

const GRADE_BG = {
  perfect: 'from-green-900/40 to-green-950/20 border-green-500/30',
  acceptable: 'from-blue-900/40 to-blue-950/20 border-blue-500/30',
  inaccuracy: 'from-amber-900/40 to-amber-950/20 border-amber-500/30',
  blunder: 'from-red-900/40 to-red-950/20 border-red-500/30',
};

const pct = (v) => `${(v * 100).toFixed(1)}%`;

/**
 * The maths, shown as maths.
 *
 * The postflop feedback panel shows frequencies and a paragraph of reasoning.
 * Here the reasoning IS the arithmetic, so it gets shown as a comparison of two
 * numbers you could have worked out at the table — which is the transferable
 * part, unlike the verdict.
 */
function EquityMeter({ required, actual }) {
  const scale = Math.max(required, actual, 0.5) * 1.25;
  const requiredPos = Math.min(100, (required / scale) * 100);
  const actualWidth = Math.min(100, (actual / scale) * 100);
  const clears = actual > required;

  return (
    <div className="relative h-9 bg-surface-900 rounded-lg overflow-hidden border border-white/5">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${actualWidth}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`h-full ${clears ? 'bg-green-500/30' : 'bg-red-500/25'}`}
      />
      {/* The bar you have to clear. */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gold"
        style={{ left: `${requiredPos}%` }}
        title={`Break-even: ${pct(required)}`}
      />
      <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-mono">
        <span className={clears ? 'text-green-300' : 'text-red-300'}>
          you {pct(actual)}
        </span>
        <span className="text-gold">need {pct(required)}</span>
      </div>
    </div>
  );
}

export default function PreflopFeedback({ feedback, onNext }) {
  if (!feedback) return null;

  const { chosenAction, classification, strategy, scenario, analysis, score, xpGained, concepts } = feedback;
  const GradeIcon = GRADE_ICONS[classification.grade];
  const spot = scenario.spot;

  const isMistake = classification.grade === 'inaccuracy' || classification.grade === 'blunder';
  const tip = isMistake ? conceptTip(concepts.primary) : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`w-full max-w-2xl mx-auto rounded-2xl border bg-gradient-to-b ${GRADE_BG[classification.grade]} p-6 shadow-2xl`}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GradeIcon size={28} style={{ color: classification.color }} />
          <div>
            <h3 className="text-xl font-bold" style={{ color: classification.color }}>
              {classification.label}
            </h3>
            <div className="text-sm text-gray-400">
              You {chosenAction === 'fold' ? 'folded' : 'called'} with{' '}
              <span className="font-mono font-semibold text-gray-200">{analysis.handNotation}</span>
              {score !== undefined && (
                <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded font-semibold">
                  +{score} pts {xpGained > 0 && `• +${xpGained} XP`}
                </span>
              )}
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer shrink-0"
        >
          Next Hand <ArrowRight size={16} />
        </motion.button>
      </div>

      {/* The comparison the whole decision reduces to */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Scale size={15} className="text-gray-400" />
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Equity vs the price
          </h4>
        </div>
        <EquityMeter required={analysis.requiredEquity} actual={analysis.equity} />
      </div>

      {/* Worked arithmetic — every figure here is computed, not asserted */}
      <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Pot odds', value: `${analysis.potOdds.toFixed(1)}-to-1` },
          { label: 'Need', value: pct(analysis.requiredEquity) },
          { label: 'You have', value: pct(analysis.equity) },
          {
            label: 'Margin',
            value: `${analysis.margin >= 0 ? '+' : ''}${(analysis.margin * 100).toFixed(1)}pp`,
            emphasis: analysis.margin >= 0 ? 'text-green-400' : 'text-red-400',
          },
        ].map(({ label, value, emphasis }) => (
          <div key={label} className="bg-surface-900/60 rounded-lg p-2.5 text-center border border-white/5">
            <div className={`text-sm font-bold font-mono ${emphasis || 'text-gray-200'}`}>{value}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Villain's assumed range, stated rather than implied */}
      <div className="mb-5 bg-surface-900/50 rounded-xl p-4 border border-white/5">
        <div className="flex items-start gap-2 mb-3">
          <ShieldQuestion size={15} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Assumed range — this is a premise, not a fact
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              The equity above is exact <em>given this range</em>. Against a different opponent the
              answer moves — which is the point. Learn the method, not the verdict.
            </p>
          </div>
        </div>
        <RangeGrid
          range={spot.villainRange}
          highlight={analysis.handNotation}
          subtitle={`${spot.villainPosition} opening range as modelled — ${analysis.villainCombos.toFixed(0)} combos. Your hand is ringed.`}
          compact
        />
      </div>

      {/* Narrative explanation */}
      <div className="bg-surface-900/50 rounded-xl p-4 border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Calculator size={14} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Working</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {strategy.explanation}
        </p>
      </div>

      {tip && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-3 bg-gold/5 rounded-xl p-4 border border-gold/20"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <GraduationCap size={14} className="text-gold" />
            <span className="text-xs font-semibold text-gold uppercase tracking-wider">
              {conceptLabel(concepts.primary)}
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
          <p className="mt-2 text-xs text-gray-500">Queued for review — this spot will come back.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
