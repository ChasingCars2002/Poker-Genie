import { describe, it, expect } from 'vitest';
import {
  recordAttempt, emptyConcept, getDueConcepts, getLeaks, getMasteredConcepts,
  updateRating, nextDifficulty, difficultyToRating, ratingToDifficulty,
  RATING_FLOOR, RATING_CEILING, _internals,
} from '../masteryModel';

const correct = (handCounter) => ({ isCorrect: true, evLoss: 0, handCounter });
const missed = (handCounter, evLoss = 1.5) => ({ isCorrect: false, evLoss, handCounter });

describe('recordAttempt', () => {
  it('promotes a box on a correct answer and schedules further out', () => {
    const first = recordAttempt(undefined, correct(1));
    const second = recordAttempt(first, correct(2));

    expect(second.box).toBeGreaterThan(first.box);
    expect(second.dueAtHand - 2).toBeGreaterThan(first.dueAtHand - 1);
  });

  it('demotes on a miss without wiping out a long history', () => {
    let concept = emptyConcept();
    for (let i = 1; i <= 10; i++) concept = recordAttempt(concept, correct(i));
    const beforeMiss = concept.box;

    concept = recordAttempt(concept, missed(11));

    expect(concept.box).toBeLessThan(beforeMiss);
    expect(concept.box).toBe(beforeMiss - _internals.DEMOTION);
  });

  it('brings a missed concept back soon', () => {
    const concept = recordAttempt(emptyConcept(), missed(100));
    expect(concept.dueAtHand - 100).toBeLessThanOrEqual(5);
  });

  it('never lets the box go negative', () => {
    let concept = emptyConcept();
    for (let i = 1; i <= 5; i++) concept = recordAttempt(concept, missed(i));
    expect(concept.box).toBe(0);
  });

  it('accumulates attempts, correct answers and EV bled', () => {
    let concept = recordAttempt(undefined, correct(1));
    concept = recordAttempt(concept, missed(2, 2.0));

    expect(concept.attempts).toBe(2);
    expect(concept.correct).toBe(1);
    expect(concept.evLossSum).toBe(2.0);
  });

  it('leaves an untried concept without a fabricated accuracy', () => {
    // A null EMA distinguishes "never seen" from "always wrong" — otherwise
    // untouched concepts would dominate the leak board at 0%.
    expect(emptyConcept().accuracyEMA).toBeNull();
    expect(recordAttempt(undefined, correct(1)).accuracyEMA).toBe(1);
  });
});

describe('getDueConcepts', () => {
  it('returns only concepts past their interval', () => {
    const fresh = recordAttempt(undefined, correct(100)); // promoted, long interval
    const stale = recordAttempt(undefined, missed(1));     // demoted, short interval
    const now = 103;

    expect(fresh.dueAtHand).toBeGreaterThan(now);
    expect(stale.dueAtHand).toBeLessThanOrEqual(now);

    const due = getDueConcepts({ fresh, stale }, now);
    expect(due).toContain('stale');
    expect(due).not.toContain('fresh');
  });

  it('puts the most overdue concept first', () => {
    const concepts = {
      slightly: recordAttempt(undefined, missed(98)),
      badly: recordAttempt(undefined, missed(10)),
    };
    expect(getDueConcepts(concepts, 100)[0]).toBe('badly');
  });

  it('ignores concepts never attempted', () => {
    expect(getDueConcepts({ untried: emptyConcept() }, 1000)).toHaveLength(0);
  });

  it('respects the limit', () => {
    const concepts = {};
    for (let i = 0; i < 20; i++) concepts[`c${i}`] = recordAttempt(undefined, missed(1));
    expect(getDueConcepts(concepts, 500, 3)).toHaveLength(3);
  });
});

describe('getLeaks', () => {
  it('ranks by EV bled per hand, not by how often you are wrong', () => {
    // A spot you get wrong constantly but cheaply matters less than one you
    // butcher occasionally — that is where the money goes.
    let frequentlyWrongCheap = emptyConcept();
    let rarelyWrongExpensive = emptyConcept();

    for (let i = 1; i <= 10; i++) {
      frequentlyWrongCheap = recordAttempt(frequentlyWrongCheap, { isCorrect: false, evLoss: 0.3, handCounter: i });
      rarelyWrongExpensive = recordAttempt(rarelyWrongExpensive, {
        isCorrect: i > 2, evLoss: i <= 2 ? 8 : 0, handCounter: i,
      });
    }

    const leaks = getLeaks({ cheap: frequentlyWrongCheap, expensive: rarelyWrongExpensive });
    expect(leaks[0].conceptId).toBe('expensive');
  });

  it('ignores concepts without enough evidence', () => {
    const barelyTried = recordAttempt(undefined, missed(1, 5));
    expect(getLeaks({ barelyTried })).toHaveLength(0);
  });

  it('does not report a clean concept as a leak', () => {
    let clean = emptyConcept();
    for (let i = 1; i <= 10; i++) clean = recordAttempt(clean, correct(i));
    expect(getLeaks({ clean })).toHaveLength(0);
  });
});

describe('getMasteredConcepts', () => {
  it('recognises a consistently correct concept', () => {
    let concept = emptyConcept();
    for (let i = 1; i <= 20; i++) concept = recordAttempt(concept, correct(i));
    expect(getMasteredConcepts({ solid: concept })).toContain('solid');
  });
});

describe('adaptive rating', () => {
  it('rises on a correct answer and falls on a blunder', () => {
    const start = 1000;
    expect(updateRating(start, { difficulty: 5, grade: 'perfect' })).toBeGreaterThan(start);
    expect(updateRating(start, { difficulty: 5, grade: 'blunder' })).toBeLessThan(start);
  });

  it('treats an inaccuracy as less damaging than a blunder', () => {
    const inaccuracy = updateRating(1000, { difficulty: 5, grade: 'inaccuracy' });
    const blunder = updateRating(1000, { difficulty: 5, grade: 'blunder' });
    expect(inaccuracy).toBeGreaterThan(blunder);
  });

  it('rewards a hard hand more than an easy one', () => {
    const hard = updateRating(1000, { difficulty: 10, grade: 'perfect' });
    const easy = updateRating(1000, { difficulty: 1, grade: 'perfect' });
    expect(hard).toBeGreaterThan(easy);
  });

  it('stays inside its bounds under sustained success or failure', () => {
    let high = 1000;
    let low = 1000;
    for (let i = 0; i < 500; i++) {
      high = updateRating(high, { difficulty: 10, grade: 'perfect' });
      low = updateRating(low, { difficulty: 1, grade: 'blunder' });
    }
    expect(high).toBeLessThanOrEqual(RATING_CEILING);
    expect(low).toBeGreaterThanOrEqual(RATING_FLOOR);
  });

  it('converges toward the difficulty a player can actually handle', () => {
    // Simulate someone who reliably handles difficulty 4 and fails above it.
    let rating = 1000;
    for (let i = 0; i < 400; i++) {
      const difficulty = nextDifficulty(rating);
      const grade = difficulty <= 4 ? 'perfect' : 'blunder';
      rating = updateRating(rating, { difficulty, grade });
    }
    expect(ratingToDifficulty(rating)).toBeGreaterThan(2);
    expect(ratingToDifficulty(rating)).toBeLessThan(7);
  });

  it('maps difficulty to rating and back consistently', () => {
    for (let d = 1; d <= 10; d++) {
      expect(ratingToDifficulty(difficultyToRating(d))).toBeCloseTo(d, 5);
    }
  });

  it('only ever proposes a difficulty in range', () => {
    for (const rating of [RATING_FLOOR, 800, 1200, 1600, RATING_CEILING]) {
      for (let i = 0; i < 200; i++) {
        const d = nextDifficulty(rating);
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(10);
        expect(Number.isInteger(d)).toBe(true);
      }
    }
  });
});
