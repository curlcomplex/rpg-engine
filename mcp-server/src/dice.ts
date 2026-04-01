import type { GameNode, StatName } from './types.js';

export interface DiceResult {
  roll: number;
  modifier: number;
  total: number;
  dc: number;
  success: boolean;
  outcome: 'critical_success' | 'success' | 'partial_success' | 'failure' | 'critical_failure';
  margin: number;
}

export interface ActionResult {
  dice: DiceResult;
  narrative_hint: string;
  choices?: Array<{
    id: string;
    text: string;
    skill?: string;
    dc?: number;
  }>;
}

/** Roll a d20 (1-20). */
export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/** Get a stat value from a character node's properties. */
export function getStatValue(character: GameNode, stat: StatName): number {
  const stats = character.properties?.stats as Record<string, number> | undefined;
  return stats?.[stat] ?? 0;
}

/** Get a skill modifier from a character node's properties. */
export function getSkillModifier(character: GameNode, skill: string): number {
  const skills = character.properties?.skills as Record<string, number> | undefined;
  return skills?.[skill] ?? 0;
}

/**
 * Resolve a skill check: d20 + skill modifier + situational modifiers vs DC.
 *
 * Outcomes:
 * - Natural 20: critical_success
 * - Total >= DC: success
 * - Total >= DC - 3: partial_success (succeed with complication)
 * - Total < DC - 3: failure
 * - Natural 1: critical_failure
 */
export function resolveCheck(
  roll: number,
  modifier: number,
  dc: number,
): DiceResult {
  const total = roll + modifier;
  const margin = total - dc;

  let outcome: DiceResult['outcome'];
  let success: boolean;

  if (roll === 20) {
    outcome = 'critical_success';
    success = true;
  } else if (roll === 1) {
    outcome = 'critical_failure';
    success = false;
  } else if (total >= dc) {
    outcome = 'success';
    success = true;
  } else if (total >= dc - 3) {
    outcome = 'partial_success';
    success = true;
  } else {
    outcome = 'failure';
    success = false;
  }

  return { roll, modifier, total, dc, success, outcome, margin };
}

/**
 * Full action resolution. Rolls dice, computes outcome, generates narrative hint.
 * On failure, generates 2-3 choice options for the player.
 */
export function resolveAction(
  character: GameNode,
  skill: string,
  dc: number,
  actionDescription: string,
  situationalModifier: number = 0,
): ActionResult {
  const skillMod = getSkillModifier(character, skill);
  const totalModifier = skillMod + situationalModifier;
  const roll = rollD20();
  const dice = resolveCheck(roll, totalModifier, dc);

  let narrative_hint: string;

  switch (dice.outcome) {
    case 'critical_success':
      narrative_hint = `Exceptional success. ${actionDescription} succeeds brilliantly with an unexpected bonus.`;
      break;
    case 'success':
      narrative_hint = `${actionDescription} succeeds as intended.`;
      break;
    case 'partial_success':
      narrative_hint = `${actionDescription} succeeds, but with a complication. Something else goes wrong.`;
      break;
    case 'failure':
      narrative_hint = `${actionDescription} fails. The situation changes — consequences follow.`;
      break;
    case 'critical_failure':
      narrative_hint = `Catastrophic failure. ${actionDescription} goes terribly wrong with major consequences.`;
      break;
  }

  const result: ActionResult = { dice, narrative_hint };

  // On failure or critical failure, generate choice options
  if (!dice.success) {
    result.choices = [
      { id: 'retreat', text: 'Back off and reassess the situation' },
      { id: 'persist', text: 'Try a different approach', skill: skill, dc: dc + 2 },
      { id: 'improvise', text: 'Improvise something unexpected' },
    ];
  }

  return result;
}
