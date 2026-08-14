# Poker Genie

An endless NLHE trainer built around one question: **are you better this week than last week?**

Every drill generates hands forever, difficulty tracks your measured skill, spots you get wrong
come back on a spaced-repetition schedule, and the app reports your week-over-week change in the
only metric that maps to money — **EV lost per hand**.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # engine test suite
npm run lint
npm run build
```

---

## Read this before you trust a close spot

**The strategies here are a heuristic model, not solver output.** No CFR solve runs anywhere in this
codebase. Frequencies come from hand-authored templates encoding well-established heuristics
("small c-bet on dry boards where you hold the range advantage"), and the concrete cards, board
textures and EV numbers are generated around those templates at runtime.

What that means in practice:

- **Directionally, it is sound.** Bet big on wet boards with strong made hands, give up with air on
  turns that improve the caller's range, fold busted draws to river bets — this trains those
  reflexes correctly, and those reflexes are where most of the money is at low and mid stakes.
- **Precisely, it is not.** The BB figures are model output, not equilibrium values. Do not read
  "EV loss 0.31 BB" as a real number, and do not use this to settle a close spot. Use a real solver
  for that.

The app is honest about this on screen rather than only here.

---

## What "endless" means

Drills used to be fixed arrays of six to thirteen handwritten scenarios, shuffled once and then
exhausted. Two passes and you were recognising hands rather than reading boards.

Now every drill runs indefinitely:

- **Handwritten scenarios stay in rotation** (~25% of hands) as anchors — they are more carefully
  reasoned than anything generated. They reshuffle when the deck runs out.
- **The rest is generated** to the drill's profile (`src/data/drillProfiles.js`): position, street,
  board texture and pot type all constrained so a monotone drill deals monotone flops.
- **Difficulty adapts.** An Elo-style rating moves with every graded hand and difficulty is aimed
  slightly below it, which settles around 75-80% correct — hard enough to learn from, not hard
  enough to quit over.
- **You choose when to stop.** "Summary" shows how the session went; "Keep Playing" resumes.

## How it decides you are improving

`src/engine/weeklyStats.js` buckets hands into ISO weeks and compares this week to last.

The headline metric is **EV lost per hand**, chosen deliberately over accuracy and volume:

- **Volume is not progress.** Playing 400 hands at the same quality as last week's 40 is not
  improvement, and the report says so.
- **Accuracy can mislead.** It can rise while EV loss also rises, if the errors you still make get
  more expensive. EV per hand cannot hide that.
- **Comparisons need 25+ hands in both weeks.** Below that the numbers move on variance, and a
  trainer that congratulates you for noise is worse than no trainer.

### The leak board

`src/engine/masteryModel.js` tracks mastery per concept. Every hand is tagged with two:
a **decision** concept (`bet-turn-air`, `defend-river-marginal`, …) and a **board texture** concept
(`texture-monotone`, `texture-paired`, …). They are tracked separately because they fail
independently — plenty of players barrel turns competently and have no idea what to do on a
monotone flop.

The leak board ranks concepts by **total EV bled, not by error rate**. A spot you butcher twice a
session costs more than one you get slightly wrong constantly. Each leak comes with a specific
instruction, not a restatement of the mistake.

Missed concepts enter a Leitner-style review queue and the generator preferentially deals them.
Intervals are counted in **hands played, not days** — study sessions are bursty, and "see this again
in three days" is useless if your next session is twenty minutes long.

## Getting marginally better each week

1. Open **This Week**. Read the top item on the leak board.
2. Play the drill covering it. Missed spots are already queued to come back.
3. Aim for 25+ hands across two or three days rather than one long session — spacing is most of
   the effect.
4. Check back next week. If EV lost per hand went down, that is real.

---

## Architecture

```
src/
├── engine/                 pure logic, no React, all unit-tested
│   ├── strategyCalculator  turns a template shape into frequencies + EVs
│   ├── scenarioGenerator   assembles board + hand + strategy into a scenario
│   ├── boardGenerator      board textures
│   ├── handGenerator       deals a hand of a requested category
│   ├── handEvaluator       reads a holding off the cards
│   ├── conceptTagger       tags any scenario, generated or handwritten
│   ├── masteryModel        per-concept mastery, spaced repetition, difficulty
│   ├── weeklyStats         ISO-week buckets and week-over-week deltas
│   └── sessionRecorder     folds one graded hand into the stored profile
├── state/progressStore     single versioned source of truth, debounced writes
├── data/                   templates, drills, concept taxonomy
├── hooks/                  useTrainer (endless drills), useArena, useProgress
└── components/             presentation
```

### The invariant that matters

In an equilibrium strategy, every action played with non-zero frequency has near-equal EV — that is
*why* the solver mixes. `strategyCalculator` derives EVs from frequencies to enforce this:

- actions **in the mix** get EVs within a hair of each other, and all grade as correct
- actions at **0%** get a real EV gap, and grade as mistakes
- the gap narrows as difficulty rises, but never below the inaccuracy threshold

So a mixed spot no longer has one "right" answer. Marking a 50%-frequency check wrong because the
50%-frequency bet scored 0.01 BB higher teaches a precision that does not exist.

This is enforced by tests across every template at multiple seeds — see
`src/engine/__tests__/strategyCalculator.test.js`.

## Known gaps

- **Multiway pots are not generated.** The engine models heads-up only. The multiway drill cycles
  its handwritten multiway scenarios instead of dealing heads-up hands under a multiway label, so
  its pool is genuinely multiway but smaller and will repeat. It is labelled *approximated* in the
  UI.
- **No preflop training.** Range construction and preflop decisions are not covered at all, and
  they are the highest-frequency decisions in the game. This is the biggest single gap.
- **Facing-bet coverage is thinner than betting coverage** — 14 defend templates against 44 betting
  ones, and all defend templates are out of position.
- **Exploit adjustments are coarse.** The "leaky opponent" toggles shift frequencies by fixed
  amounts rather than modelling a range.
- **Progress is local to the browser.** `localStorage` only — no sync, and clearing site data wipes
  it.
