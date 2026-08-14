import { motion } from 'framer-motion';
import { ArrowLeft, FlagTriangleRight, Flame, Infinity as InfinityIcon, Ban, Check } from 'lucide-react';
import Card from './Card';
import LevelBar from './LevelBar';
import ScorePopup from './ScorePopup';
import AchievementToast from './AchievementToast';
import SessionSummary from './SessionSummary';
import PreflopFeedback from './PreflopFeedback';
import { usePreflop } from '../hooks/usePreflop';
import { POSITIONS } from '../data/gtoData';

const ACTION_STYLES = {
  fold: { icon: Ban, className: 'bg-accent-red hover:bg-red-500' },
  call: { icon: Check, className: 'bg-accent-green hover:bg-green-500' },
};

export default function PreflopView({ onBack }) {
  const {
    currentScenario, feedback, showFeedback, stats, levelInfo, scorePopup,
    newAchievements, sessionEnded, handleAction, nextHand, endSession,
    resumeSession, dismissAchievement,
  } = usePreflop();

  if (sessionEnded) {
    return (
      <SessionSummary
        stats={stats}
        drillName="Preflop Maths"
        onReplay={resumeSession}
        onBack={onBack}
      />
    );
  }

  if (!currentScenario) return null;

  const { heroHand, heroPosition, villainPosition, potSize, facingBet, spot, effectiveStack } = currentScenario;

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 max-w-3xl mx-auto">
      <ScorePopup data={scorePopup} />
      <AchievementToast achievement={newAchievements[0] || null} onDismiss={dismissAchievement} />

      <div className="flex items-center justify-between mb-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-white">Preflop Maths</h2>
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
            <InfinityIcon size={12} className="text-gold" />
            Hand {stats.handsPlayed + 1} this session
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={endSession}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer"
        >
          <FlagTriangleRight size={14} />
          Summary
        </motion.button>
      </div>

      <div className="mb-3">
        <LevelBar levelInfo={levelInfo} />
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gold">Score: {stats.totalScore}</span>
          {stats.currentStreak >= 2 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-sm font-bold text-orange-400"
            >
              <Flame size={14} /> {stats.currentStreak}x
            </motion.span>
          )}
        </div>
        <span className="text-xs text-gray-500">+{stats.xpEarned} XP this session</span>
      </div>

      {/* The spot */}
      <div className="bg-gradient-to-b from-felt-700 to-felt-900 rounded-3xl border border-felt-600/50 p-6 mb-5 shadow-2xl">
        <div className="text-center mb-5">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-accent-red/15 border border-accent-red/30 text-red-300 mb-2">
            {spot.label}
          </span>
          <p className="text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
            {POSITIONS[villainPosition]} {spot.context === 'vs-jam'
              ? 'moves all in'
              : spot.context === 'vs-3bet'
                ? `3-bets to ${spot.threeBetSize}`
                : `opens to ${spot.openSize}`}
            . You are in the {POSITIONS[heroPosition]}.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="flex gap-2">
            {heroHand.map((card, i) => (
              <Card key={card} card={card} size="lg" delay={0.05 + i * 0.05} />
            ))}
          </div>
          <span className="text-xs font-semibold text-blue-300 bg-accent-blue/20 border border-blue-500/30 px-4 py-1.5 rounded-full">
            Hero — {POSITIONS[heroPosition]} ({heroPosition})
          </span>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="text-center">
            <div className="text-gold font-bold">{potSize.toFixed(1)} BB</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Pot</div>
          </div>
          <div className="text-center">
            <div className="text-red-300 font-bold">{facingBet.toFixed(1)} BB</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">To call</div>
          </div>
          <div className="text-center">
            <div className="text-gray-300 font-bold">{effectiveStack.toFixed(0)} BB</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Behind</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!showFeedback && (
        <div className="flex gap-3 justify-center mb-6">
          {currentScenario.gtoStrategy.actions.map((action, i) => {
            const style = ACTION_STYLES[action.action] || ACTION_STYLES.call;
            const Icon = style.icon;
            return (
              <motion.button
                key={action.action}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction(action.action)}
                className={`${style.className} text-white px-8 py-4 rounded-xl font-semibold text-base
                  flex flex-col items-center gap-1 min-w-[120px] transition-all duration-150
                  shadow-lg cursor-pointer`}
              >
                <Icon size={20} />
                <span>{action.label}</span>
                {action.size ? <span className="text-xs opacity-80">({action.size.toFixed(1)} BB)</span> : null}
              </motion.button>
            );
          })}
        </div>
      )}

      {showFeedback && (
        <div className="mb-6">
          <PreflopFeedback feedback={feedback} onNext={nextHand} />
        </div>
      )}
    </div>
  );
}
