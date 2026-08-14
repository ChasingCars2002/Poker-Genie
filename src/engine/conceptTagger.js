import { classifyHand } from './handEvaluator';
import { getBoardTexture } from './boardGenerator';
import { handClassOf, textureConceptOf } from '../data/concepts';

/**
 * The concepts a scenario exercises, for any scenario — generated or
 * handwritten.
 *
 * Generated scenarios already carry their tags from the template. Handwritten
 * ones are read off the cards, so both kinds feed the same mastery model.
 */
export function conceptsForScenario(scenario) {
  if (scenario?.concepts) return scenario.concepts;

  const { heroHand, board, street, decisionMode } = scenario;

  // Preflop scenarios carry their own tags and never reach here, but an
  // untagged one would previously crash on board.flop.map — and an exception in
  // concept tagging blanks the whole screen.
  if (!board?.flop?.length) {
    return { primary: `${street || 'preflop'}-untagged`, secondary: 'position-blinds' };
  }

  const { category } = classifyHand(heroHand, board);
  const texture = getBoardTexture(board.flop);

  const textureType = texture.isMonotone ? 'monotone'
    : texture.isPaired ? 'paired'
    : (texture.isConnected || texture.isTwoTone) ? 'wet'
    : 'dry-high';

  const mode = decisionMode === 'defend' ? 'defend' : 'bet';

  return {
    primary: `${mode}-${street}-${handClassOf(category)}`,
    secondary: textureConceptOf(textureType),
  };
}
