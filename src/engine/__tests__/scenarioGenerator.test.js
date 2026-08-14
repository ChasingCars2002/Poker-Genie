import { describe, it, expect } from 'vitest';
import { generateScenario, generateBossScenario, selectTemplatePool } from '../scenarioGenerator';
import { classifyHand } from '../handEvaluator';
import { SCENARIO_TEMPLATES } from '../../data/scenarioTemplates';
import { DRILL_PROFILES, templateMatchesProfile } from '../../data/drillProfiles';
import { CONCEPT_INFO } from '../../data/concepts';
import { SCENARIOS } from '../../data/gtoData';

function allCardsOf(scenario) {
  const { board, heroHand } = scenario;
  return [
    ...board.flop,
    ...(board.turn ? [board.turn] : []),
    ...(board.river ? [board.river] : []),
    ...heroHand,
  ];
}

const VALID_CARD = /^[AKQJT98765432][shdc]$/;

describe('generated scenarios are legal', () => {
  it('never deals the same card twice', () => {
    for (let i = 0; i < 600; i++) {
      const scenario = generateScenario(1 + (i % 10));
      const cards = allCardsOf(scenario);
      expect(new Set(cards).size, `duplicate in ${cards.join(' ')}`).toBe(cards.length);
    }
  });

  it('only ever deals real cards', () => {
    // The flush-draw generator could pick a rank from an empty pool and build a
    // card literally named "undefineds".
    for (let i = 0; i < 600; i++) {
      const scenario = generateScenario(1 + (i % 10));
      for (const card of allCardsOf(scenario)) {
        expect(card, `bad card in scenario ${scenario.id}`).toMatch(VALID_CARD);
      }
    }
  });

  it('deals the right number of board cards for the street', () => {
    const expected = { flop: 3, turn: 4, river: 5 };
    for (let i = 0; i < 300; i++) {
      const scenario = generateScenario(1 + (i % 10));
      const boardCount = allCardsOf(scenario).length - 2;
      expect(boardCount, `street ${scenario.street}`).toBe(expected[scenario.street]);
    }
  });

  it('gives every scenario a strategy summing to 100%', () => {
    for (let i = 0; i < 300; i++) {
      const { gtoStrategy } = generateScenario(1 + (i % 10));
      const total = gtoStrategy.actions.reduce((s, a) => s + a.frequency, 0);
      expect(total).toBe(100);
    }
  });

  it('tags every scenario with concepts that have coaching content', () => {
    for (let i = 0; i < 200; i++) {
      const { concepts } = generateScenario(1 + (i % 10));
      expect(CONCEPT_INFO[concepts.primary], `unknown concept ${concepts.primary}`).toBeDefined();
      expect(CONCEPT_INFO[concepts.texture], `unknown concept ${concepts.texture}`).toBeDefined();
    }
  });
});

describe('facing-bet scenarios', () => {
  const defendTemplates = SCENARIO_TEMPLATES.filter(t => t.decisionMode === 'defend');

  it('exist, so the trainer covers more than betting decisions', () => {
    expect(defendTemplates.length).toBeGreaterThan(0);
  });

  it('always offer a fold, and only they do', () => {
    for (const template of SCENARIO_TEMPLATES) {
      const hasFold = template.strategyShape.actions.some(a => a.action === 'fold');
      expect(hasFold, template.id).toBe(template.decisionMode === 'defend');
    }
  });

  it('expose the bet being faced so the UI is not implying a phantom fold', () => {
    for (const template of defendTemplates) {
      expect(template.facingBetSize, template.id).toBeGreaterThan(0);
    }
  });
});

describe('drill profiles', () => {
  it('every generating profile matches at least one template', () => {
    // A profile that matches nothing silently falls back to the whole library,
    // which would deal heads-up hands under a multiway label. Drills with no
    // procedural equivalent must declare curatedOnly instead.
    for (const [drillId, profile] of Object.entries(DRILL_PROFILES)) {
      if (profile.curatedOnly) continue;
      const matches = SCENARIO_TEMPLATES.filter(t => templateMatchesProfile(t, profile));
      expect(matches.length, `${drillId} has no templates`).toBeGreaterThan(0);
    }
  });

  it('gives every curatedOnly drill a pool of handwritten scenarios', () => {
    for (const [drillId, profile] of Object.entries(DRILL_PROFILES)) {
      if (!profile.curatedOnly) continue;
      expect(SCENARIOS[drillId]?.length, `${drillId} has no curated scenarios`).toBeGreaterThan(0);
    }
  });

  it('cannot satisfy a curatedOnly drill from the procedural pool', () => {
    // curatedOnly is deliberately NOT a template filter, so any code path that
    // reaches generateScenario for such a drill gets the entire library — a
    // heads-up hand under a multiway label. This asserts the property that
    // makes that dangerous, so the guarantee has to live in the caller.
    for (const [drillId, profile] of Object.entries(DRILL_PROFILES)) {
      if (!profile.curatedOnly) continue;
      const matches = SCENARIO_TEMPLATES.filter(t => templateMatchesProfile(t, profile));
      expect(matches.length, `${drillId} unexpectedly filters templates`).toBe(SCENARIO_TEMPLATES.length);
    }
  });

  it('respects the drill constraints when generating', () => {
    const profile = DRILL_PROFILES['cbet-monotone'];
    for (let i = 0; i < 100; i++) {
      const scenario = generateScenario(5, { profile });
      const suits = scenario.board.flop.map(c => c[c.length - 1]);
      expect(new Set(suits).size, `flop ${scenario.board.flop.join(' ')}`).toBe(1);
    }
  });

  it('prefers templates teaching a due concept when one is supplied', () => {
    const pool = selectTemplatePool({ difficulty: 5, concepts: ['defend-river-marginal'] });
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.every(t => t.decisionMode === 'defend' && t.street === 'river')).toBe(true);
  });

  it('falls back rather than returning an empty pool for an impossible request', () => {
    const pool = selectTemplatePool({
      difficulty: 5,
      profile: { streets: ['nonexistent-street'] },
      concepts: ['not-a-real-concept'],
    });
    expect(pool.length).toBeGreaterThan(0);
  });
});

describe('boss scenarios', () => {
  it('are drawn from the hard end of the library', () => {
    for (let floor = 1; floor <= 12; floor++) {
      const scenario = generateBossScenario(floor);
      expect(scenario._meta.isBoss).toBe(true);
      expect(scenario._meta.difficulty).toBeGreaterThanOrEqual(7);
    }
  });

  it('deals legal cards like any other scenario', () => {
    for (let floor = 1; floor <= 30; floor++) {
      const cards = allCardsOf(generateBossScenario(floor));
      expect(new Set(cards).size).toBe(cards.length);
      cards.forEach(c => expect(c).toMatch(VALID_CARD));
    }
  });
});

describe('hand category fidelity', () => {
  // The generator promises the template a hand of a given category, and the
  // explanation text is written on that promise. When they disagree the app
  // narrates a hand the player is not holding.
  it('deals two pair, not a set, for two-pair templates', () => {
    const template = SCENARIO_TEMPLATES.find(t => t.handCategoryType === 'two-pair');
    expect(template).toBeDefined();

    let twoPairCount = 0;
    for (let i = 0; i < 60; i++) {
      const scenario = generateScenario(template.difficultyBase, {
        profile: { streets: [template.street], positions: [template.position] },
      });
      if (scenario._meta.templateId !== template.id) continue;
      const { category } = classifyHand(scenario.heroHand, scenario.board);
      expect(['two-pair', 'monster'], `got ${category}`).toContain(category);
      twoPairCount++;
    }
    expect(twoPairCount).toBeGreaterThan(0);
  });

  it('deals cards above the board for overcards templates', () => {
    const template = SCENARIO_TEMPLATES.find(t => t.handCategoryType === 'overcards');
    expect(template).toBeDefined();

    let checked = 0;
    for (let i = 0; i < 80; i++) {
      const scenario = generateScenario(template.difficultyBase, {
        profile: { streets: [template.street], textures: [template.boardTextureType] },
      });
      if (scenario._meta.templateId !== template.id) continue;
      const { category } = classifyHand(scenario.heroHand, scenario.board);
      // Overcards can incidentally make a draw; what they must never be is the
      // low junk generateAir was previously handing back.
      expect(['overcards', 'gutshot', 'oesd', 'flush-draw'], `got ${category}`).toContain(category);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });
});
