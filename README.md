# 🎰 Poker Genie — GTO Trainer

An interactive, gamified No-Limit Hold'em trainer that turns solver theory into
fast, fun reps. Built with React, Vite, Tailwind CSS, and Framer Motion.

## Modes

- **Training Drills** — focused, hand-crafted spots grouped by theme (single
  raised pots, 3-bet pots, monotone boards, turn barrels, polarized rivers, and
  more). Each drill walks you through a curated set of decisions with full
  strategy breakdowns and explanations.
- **Arena Mode** — an endless, roguelike gauntlet. Procedurally generated spots
  escalate in difficulty floor by floor, with boss hands, combo multipliers, and
  a lives system. How deep can you go?

## What makes it good

- **Four sizing options on every decision** — Check, Bet 33%, Bet 75%, and an
  **Overbet** (pot-sized) line. The fourth option unlocks genuinely polarized
  play: overbet your nutted hands and best bluffs, size down for thin value.
- **Ironclad GTO logic.** Every strategy is run through a single normalization
  engine (`src/engine/gtoEngine.js`) that enforces the equilibrium principle:
  actions played with positive frequency share (approximately) equal EV, while
  zero-frequency lines are strictly dominated. Frequencies and EVs can never
  contradict each other, and the "best action" is always unambiguous.
- **Instant, slick UI.** Cards reveal their values immediately — no laggy flip
  animations.
- **Keyboard-first flow.** Press **1–4** to act and **Enter** to advance. Blaze
  through hundreds of hands.
- **Progression that hooks you.** XP, levels, streak multipliers, achievements,
  and persistent stats (saved to `localStorage`).

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build (outputs to dist/)
npm run preview  # preview the production build
```

## Architecture

```
src/
  data/
    gtoData.js           # hand-crafted scenarios, drills, scoring, achievements
    scenarioTemplates.js # strategy "shapes" the Arena randomizes within
  engine/
    gtoEngine.js         # ironclad strategy normalizer (single source of truth)
    strategyCalculator.js# turns a template + board + hand into a strategy
    scenarioGenerator.js  # builds full Arena scenarios
    boardGenerator.js / handGenerator.js / explanationBuilder.js
  hooks/
    useTrainer.js / useArena.js
  components/            # TableView, Card, ActionBar, StrategyFeedback, ...
```

> Frequencies are intentionally simplified to human-memorizable buckets
> (0/25/50/75/100%) so the strategies are actually learnable away from a solver.
