import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, ArrowRight, BarChart3, Trophy, GraduationCap } from 'lucide-react';
import { LOGIC_TAGS, simplifyFrequency } from '../data/gtoData';
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

function FrequencyBar({ action, frequency, ev, isChosen, isBest }) {
  const simplified = simplifyFrequency(frequency);
  return (
    <div className={`flex items-center gap-3 py-2 px-3 rounded-lg ${isChosen ? 'bg-white/5 ring-1 ring-white/10' : ''}`}>
      <div className="w-24 text-sm font-medium text-gray-300 shrink-0">
        {action.label || action.action}
        {isBest && <span className="ml-1 text-xs text-green-400">*</span>}
      </div>
      <div className="flex-1 h-3 bg-surface-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${simplified}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            simplified >= 75 ? 'bg-green-500' :
            simplified >= 50 ? 'bg-blue-500' :
            simplified >= 25 ? 'bg-amber-500' :
            'bg-gray-600'
          }`}
        />
      </div>
      <span className="w-10 text-right text-sm font-mono text-gray-400">{simplified}%</span>
      <span className="w-20 text-right text-xs text-gray-500">EV: {ev >= 0 ? '+' : ''}{ev.toFixed(2)}</span>
      {isChosen && <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">You</span>}
    </div>
  );
}

export default function StrategyFeedback({ feedback, onNext, isLastHand = false }) {
  if (!feedback) return null;

  const { chosenAction, bestAction, evLoss, classification, strategy, score, xpGained, concepts } = feedback;
  const GradeIcon = GRADE_ICONS[classification.grade];
  const bgClass = GRADE_BG[classification.grade];

  const mixedActions = strategy.actions.filter(a => a.frequency > 0);
  const isMixed = mixedActions.length > 1;
  const playedTheMix = mixedActions.some(a => a.action === chosenAction);

  // Only surface a coaching tip when there is something to fix. Reading why
  // you were wrong is where the learning is; reading it after a correct answer
  // just trains people to skip the box.
  const tipConcept = classification.grade === 'inaccuracy' || classification.grade === 'blunder'
    ? concepts?.primary
    : null;
  const tip = tipConcept ? conceptTip(tipConcept) : '';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`w-full max-w-2xl mx-auto rounded-2xl border bg-gradient-to-b ${bgClass} p-6 shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <GradeIcon size={28} style={{ color: classification.color }} />
            <div>
              <h3 className="text-xl font-bold" style={{ color: classification.color }}>
                {classification.label}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>EV Loss: <span className="font-mono font-semibold" style={{ color: classification.color }}>
                  {evLoss.toFixed(2)} BB
                </span></span>
                {score !== undefined && (
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded font-semibold">
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
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
          >
            {isLastHand ? 'Finish Drill' : 'Next Hand'} {isLastHand ? <Trophy size={16} /> : <ArrowRight size={16} />}
          </motion.button>
        </div>

        {/* Strategy Breakdown */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-gray-400" />
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Strategy Breakdown</h4>
          </div>
          {isMixed && (
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              This is a mixed spot — every line below with a non-zero frequency is part of the
              equilibrium, so {playedTheMix ? 'your choice was one of them' : 'any of them would have been fine'}.
              The lines at 0% are the ones that actually cost you.
            </p>
          )}
          <div className="space-y-1">
            {strategy.actions.map(a => (
              <FrequencyBar
                key={a.action}
                action={a}
                frequency={a.frequency}
                ev={a.ev}
                isChosen={a.action === chosenAction}
                isBest={a.action === bestAction}
              />
            ))}
          </div>
        </div>

        {/* Logic Tags */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {strategy.logicTags.map(tagId => {
              const tag = LOGIC_TAGS[tagId];
              if (!tag) return null;
              return (
                <motion.span
                  key={tagId}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                  style={{ borderColor: tag.color + '40', color: tag.color, backgroundColor: tag.color + '15' }}
                  title={tag.description}
                >
                  <Info size={12} />
                  {tag.label}
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-surface-900/50 rounded-xl p-4 border border-white/5">
          <p className="text-sm text-gray-300 leading-relaxed">{strategy.explanation}</p>
        </div>

        {/* Coaching tip — only on mistakes, tied to the concept being tracked */}
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
                {conceptLabel(tipConcept)}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
            <p className="mt-2 text-xs text-gray-500">
              Queued for review — this spot will come back.
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
