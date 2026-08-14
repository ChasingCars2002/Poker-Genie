import { describe, it, expect } from 'vitest';
import { openingHand } from '../../hooks/useTrainer';
import { emptyProgress } from '../../state/progressStore';
import { SCENARIOS } from '../../data/gtoData';
import { DRILL_PROFILES } from '../../data/drillProfiles';

const progress = emptyProgress();

describe('openingHand', () => {
  it('draws the first hand of a curated-only drill from the curated pool', () => {
    // Regression: the opening hand used to go straight to generateScenario,
    // and since curatedOnly is not a template filter that meant the whole
    // library — so Multiway Pot Navigation opened with a heads-up spot dealt
    // under a multiway label.
    const curated = SCENARIOS['multiway-pots'];
    const curatedIds = new Set(curated.map(s => s.id));

    for (let i = 0; i < 50; i++) {
      const { scenario } = openingHand(DRILL_PROFILES['multiway-pots'], curated, progress);
      expect(curatedIds, `dealt ${scenario.id}`).toContain(scenario.id);
    }
  });

  it('tags the curated opening hand so it reaches the mastery model', () => {
    const curated = SCENARIOS['multiway-pots'];
    const { scenario } = openingHand(DRILL_PROFILES['multiway-pots'], curated, progress);

    expect(scenario.concepts).toBeDefined();
    expect(scenario.concepts.primary).toBeTruthy();
    expect(scenario._meta.curated).toBe(true);
  });

  it('does not leave the opening hand in the deck, so it cannot repeat as hand two', () => {
    const curated = SCENARIOS['multiway-pots'];
    const { scenario, deck } = openingHand(DRILL_PROFILES['multiway-pots'], curated, progress);

    expect(deck.map(s => s.id)).not.toContain(scenario.id);
    expect(deck).toHaveLength(curated.length - 1);
  });

  it('generates procedurally for a normal drill', () => {
    const { scenario } = openingHand(
      DRILL_PROFILES['srp-btn-vs-bb'], SCENARIOS['srp-btn-vs-bb'], progress
    );
    expect(scenario.gtoStrategy).toBeDefined();
    expect(scenario.board.flop).toHaveLength(3);
  });

  it('still hands back a full deck for a normal drill', () => {
    const curated = SCENARIOS['srp-btn-vs-bb'];
    const { deck } = openingHand(DRILL_PROFILES['srp-btn-vs-bb'], curated, progress);
    expect(deck).toHaveLength(curated.length);
  });

  it('falls back to generation when a drill has no curated scenarios', () => {
    const { scenario, deck } = openingHand({ curatedOnly: true }, [], progress);
    expect(scenario).toBeDefined();
    expect(deck).toHaveLength(0);
  });
});
