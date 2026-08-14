import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingDown, TrendingUp, Minus, Target, Flame,
  AlertTriangle, CalendarDays, Gauge,
} from 'lucide-react';
import { weekOverWeek, weekSeries, currentDayStreak, MIN_HANDS_FOR_COMPARISON } from '../engine/weeklyStats';
import { getLeaks } from '../engine/masteryModel';
import { conceptLabel, conceptTip } from '../data/concepts';
import { useProgress } from '../hooks/useProgress';

function pct(value) {
  return `${Math.round(value * 100)}%`;
}

function signed(value, digits = 2) {
  const rounded = value.toFixed(digits);
  return value > 0 ? `+${rounded}` : rounded;
}

function DeltaPill({ value, goodDirection = 'up', format = signed, suffix = '' }) {
  const isFlat = Math.abs(value) < 1e-9;
  const isGood = goodDirection === 'up' ? value > 0 : value < 0;

  const Icon = isFlat ? Minus : (value > 0 ? TrendingUp : TrendingDown);
  const colour = isFlat
    ? 'text-gray-400 bg-white/5 border-white/10'
    : isGood
      ? 'text-green-400 bg-green-400/10 border-green-400/25'
      : 'text-red-400 bg-red-400/10 border-red-400/25';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${colour}`}>
      <Icon size={11} />
      {format(value)}{suffix}
    </span>
  );
}

function StatRow({ label, current, previous, delta, goodDirection, format, suffix }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-600 tabular-nums">was {previous}</span>
        <span className="text-base font-bold text-gray-100 tabular-nums w-16 text-right">{current}</span>
        {delta !== undefined && (
          <DeltaPill value={delta} goodDirection={goodDirection} format={format} suffix={suffix} />
        )}
      </div>
    </div>
  );
}

function TrendBars({ series }) {
  if (series.length < 2) return null;

  // EV lost per hand, lower is better — so the bars are drawn as "how much
  // room is left", making a shrinking bar unambiguously good.
  const max = Math.max(...series.map(w => w.evLossPerHand), 0.1);

  return (
    <div className="bg-surface-800 rounded-2xl p-5 border border-white/5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        EV lost per hand, by week — lower is better
      </h3>
      <div className="flex items-end gap-1.5 h-28" role="img" aria-label="Weekly EV loss trend">
        {series.map((week) => {
          const height = Math.max(4, (week.evLossPerHand / max) * 100);
          return (
            <div key={week.key} className="flex-1 flex flex-col items-center gap-1.5 group">
              <span className="text-[10px] text-gray-600 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                {week.evLossPerHand.toFixed(2)}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full rounded-t bg-gradient-to-t from-amber-600/70 to-amber-400/70 group-hover:from-amber-500 group-hover:to-amber-300 transition-colors"
                title={`${week.key}: ${week.evLossPerHand.toFixed(2)} BB/hand over ${week.hands} hands`}
              />
              <span className="text-[9px] text-gray-600">{week.key.slice(-3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WeeklyReport({ onBack }) {
  const progress = useProgress();

  const report = useMemo(() => weekOverWeek(progress.weeks), [progress.weeks]);
  const series = useMemo(() => weekSeries(progress.weeks), [progress.weeks]);
  const leaks = useMemo(() => getLeaks(progress.concepts, 3), [progress.concepts]);
  const dayStreak = useMemo(() => currentDayStreak(progress.weeks), [progress.weeks]);

  const { current, previous, comparable, handsNeeded, deltas, improved } = report;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 max-w-2xl mx-auto w-full">
      <div className="w-full flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>
        <h2 className="text-lg font-bold text-white">This Week</h2>
        <div className="w-14" />
      </div>

      {/* Headline verdict */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full rounded-2xl border p-6 mb-4 ${
          !comparable
            ? 'bg-surface-800 border-white/10'
            : improved
              ? 'bg-gradient-to-br from-green-950/60 to-emerald-950/30 border-green-500/25'
              : 'bg-gradient-to-br from-amber-950/60 to-orange-950/30 border-amber-500/25'
        }`}
      >
        {!comparable ? (
          <>
            <h3 className="text-xl font-bold text-gray-100 mb-2">Building your baseline</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {current
                ? <>You have played <span className="font-bold text-gray-200">{current.hands}</span> hands this week.
                    {handsNeeded > 0 && <> Another <span className="font-bold text-gold">{handsNeeded}</span> makes the
                    week-over-week comparison meaningful.</>}</>
                : <>No hands logged this week yet. {MIN_HANDS_FOR_COMPARISON} hands in a week is enough to start
                    measuring whether you are actually improving.</>}
            </p>
            <p className="text-xs text-gray-600 mt-3 leading-relaxed">
              Comparisons need {MIN_HANDS_FOR_COMPARISON}+ hands in both weeks. Below that the numbers move on
              variance rather than on skill, and a trainer that congratulates you for noise is worse than no trainer.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-100 mb-2">
              {improved ? 'You leaked less this week.' : 'You leaked more this week.'}
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {Math.abs(deltas.evLossPerHand).toFixed(3)} BB per hand {improved ? 'better' : 'worse'} than last
              week, over {current.hands} hands. {improved
                ? 'That is the number that matters — it is the one that maps to money at a real table.'
                : 'One week is not a trend, but check the leak board below before your next session.'}
            </p>
          </>
        )}
      </motion.div>

      {/* Week comparison */}
      {comparable && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="w-full bg-surface-800 rounded-2xl p-5 border border-white/5 mb-4"
        >
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            This week vs last week
          </h3>
          <StatRow
            label="EV lost per hand"
            current={current.evLossPerHand.toFixed(3)}
            previous={previous.evLossPerHand.toFixed(3)}
            delta={-deltas.evLossPerHand}
            goodDirection="down"
            format={(v) => signed(v, 3)}
          />
          <StatRow
            label="Accuracy"
            current={pct(current.accuracy)}
            previous={pct(previous.accuracy)}
            delta={deltas.accuracy * 100}
            goodDirection="up"
            format={(v) => signed(v, 1)}
            suffix="pp"
          />
          <StatRow
            label="Blunder rate"
            current={pct(current.blunderRate)}
            previous={pct(previous.blunderRate)}
            delta={deltas.blunderRate * 100}
            goodDirection="down"
            format={(v) => signed(v, 1)}
            suffix="pp"
          />
          <StatRow
            label="Skill rating"
            current={current.ratingEnd ?? '—'}
            previous={previous.ratingEnd ?? '—'}
            delta={deltas.rating}
            goodDirection="up"
            format={(v) => signed(v, 0)}
          />
          <StatRow
            label="Hands played"
            current={current.hands}
            previous={previous.hands}
            delta={deltas.hands}
            goodDirection="up"
            format={(v) => signed(v, 0)}
          />
        </motion.div>
      )}

      {/* Consistency */}
      <div className="w-full grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: CalendarDays, label: 'Days this week', value: current?.daysPlayed ?? 0, colour: 'text-blue-400' },
          { icon: Flame, label: 'Day streak', value: dayStreak, colour: 'text-orange-400' },
          { icon: Gauge, label: 'Skill rating', value: progress.skillRating, colour: 'text-gold' },
        ].map(({ icon: Icon, label, value, colour }) => (
          <div key={label} className="bg-surface-800 rounded-xl p-4 border border-white/5 text-center">
            <Icon size={16} className={`${colour} mx-auto mb-1.5`} />
            <div className="text-xl font-bold text-gray-100 tabular-nums">{value}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Leak board */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full bg-surface-800 rounded-2xl p-5 border border-white/5 mb-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={15} className="text-amber-400" />
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Work on this week
          </h3>
        </div>

        {leaks.length === 0 ? (
          <p className="text-sm text-gray-500 leading-relaxed mt-3">
            Not enough data yet. Once you have played a few hands in each kind of spot, the three costing you the
            most EV show up here — ranked by BB bled, not by how often you get them wrong.
          </p>
        ) : (
          <div className="space-y-3 mt-3">
            {leaks.map((leak, i) => (
              <div key={leak.conceptId} className="bg-surface-900/60 rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-200 truncate">
                      {conceptLabel(leak.conceptId)}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs font-mono text-amber-400">
                    −{leak.evLossPerHand.toFixed(2)} BB/hand
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">{conceptTip(leak.conceptId)}</p>
                <p className="text-[10px] text-gray-600">
                  {pct(leak.accuracy)} correct over {leak.attempts} hands
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Trend */}
      {series.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full mb-4"
        >
          <TrendBars series={series} />
        </motion.div>
      )}

      <p className="text-xs text-gray-600 text-center leading-relaxed max-w-md mt-2">
        <Target size={11} className="inline mr-1 mb-0.5" />
        Marginal weekly gains come from the leak board, not from volume. Pick the top item, play the drill that
        covers it, and check back next week.
      </p>
    </div>
  );
}
