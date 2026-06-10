import { motion } from 'framer-motion';
import { CheckCircle, ThumbsUp, AlertTriangle, XCircle, Info, ArrowRight, BarChart3 } from 'lucide-react';
import { LOGIC_TAGS, simplifyFrequency } from '../data/gtoData';

const GRADE_ICONS = {
  perfect: CheckCircle,
  good: ThumbsUp,
  inaccuracy: AlertTriangle,
  blunder: XCircle,
};

const GRADE_BG = {
  perfect: 'from-green-900/40 to-green-950/20 border-green-500/30',
  good: 'from-blue-900/40 to-blue-950/20 border-blue-500/30',
  inaccuracy: 'from-amber-900/40 to-amber-950/20 border-amber-500/30',
  blunder: 'from-red-900/40 to-red-950/20 border-red-500/30',
};

const GRADE_SUBTEXT = {
  perfect: 'The solver\'s main line.',
  good: 'A real part of the mix.',
  inaccuracy: 'The solver never takes this line here.',
  blunder: 'Big EV punt — study this one.',
};

function FrequencyBar({ action, frequency, ev, isChosen, isBest }) {
  const simplified = simplifyFrequency(frequency);
  return (
    <div className={`flex items-center gap-3 py-2 px-3 rounded-lg ${isChosen ? 'bg-white/5 ring-1 ring-white/10' : ''}`}>
      <div className="w-24 text-sm font-medium text-gray-300 shrink-0">
        {action.label || action.action.charAt(0).toUpperCase() + action.action.slice(1)}
        {isBest && <span className="ml-1 text-xs text-green-400">★</span>}
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
      <span className="w-20 text-right text-xs text-gray-500 font-mono">EV {ev >= 0 ? '+' : ''}{ev.toFixed(2)}</span>
      {isChosen && <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">You</span>}
    </div>
  );
}

export default function StrategyFeedback({ feedback, onNext }) {
  if (!feedback) return null;

  const { chosenAction, evLoss, points, grade, label, color, strategy } = feedback;
  const GradeIcon = GRADE_ICONS[grade];
  const bgClass = GRADE_BG[grade];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`w-full max-w-2xl mx-auto rounded-2xl border bg-gradient-to-b ${bgClass} p-5 sm:p-6 shadow-2xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <GradeIcon size={30} style={{ color }} />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold leading-tight" style={{ color }}>
              {label}
              {points > 0 && (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="ml-2 text-sm font-mono text-gold"
                >
                  +{points}
                </motion.span>
              )}
            </h3>
            <p className="text-xs text-gray-400">
              {GRADE_SUBTEXT[grade]}
              {evLoss > 0 && (
                <span className="ml-1 font-mono" style={{ color }}>−{evLoss.toFixed(2)} BB</span>
              )}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
        >
          Next Hand <ArrowRight size={16} />
        </motion.button>
      </div>

      {/* Strategy Breakdown */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={16} className="text-gray-400" />
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">GTO Frequencies</h4>
        </div>
        <div className="space-y-1">
          {strategy.actions.map(a => (
            <FrequencyBar
              key={a.action}
              action={a}
              frequency={a.frequency}
              ev={a.ev}
              isChosen={a.action === chosenAction}
              isBest={a.action === strategy.bestAction}
            />
          ))}
        </div>
      </div>

      {/* Logic Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Explanation */}
      <div className="bg-surface-900/50 rounded-xl p-4 border border-white/5">
        <p className="text-sm text-gray-300 leading-relaxed">{strategy.explanation}</p>
      </div>

      <p className="text-center text-[11px] text-gray-600 mt-3">
        Press <span className="font-mono text-gray-500">Enter</span> or <span className="font-mono text-gray-500">Space</span> for next hand
      </p>
    </motion.div>
  );
}
