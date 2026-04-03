// @rpg-engine/core — barrel export

// --- Types & Constants ---
export {
  VERSION,
  NODE_TYPES,
  EDGE_TYPES,
  EDGE_TYPE_DEFAULTS,
  STAT_NAMES,
  ACTIVE_STATUSES,
  DONE_STATUSES,
} from './types.js';
export type {
  NodeType,
  EdgeType,
  StatName,
  GameNode,
  GameEdge,
  WorldDocument,
  NpcVoice,
  NpcArc,
  InteractionRecord,
  NpcProperties,
} from './types.js';

// --- Store ---
export { WorldStore } from './store.js';

// --- Dice ---
export {
  rollD20,
  getStatValue,
  getSkillModifier,
  resolveCheck,
  resolveAction,
} from './dice.js';
export type { DiceResult, ActionResult } from './dice.js';

// --- Narrative ---
export {
  logEvent,
  investigate,
  interviewNpc,
  research,
  moveToLocation,
  advanceTime,
} from './narrative.js';
export type {
  LogEventParams,
  LogEventResult,
  InvestigateParams,
  InvestigateResult,
  InterviewParams,
  InterviewResult,
  ResearchParams,
  ResearchResult,
  MoveResult,
  AdvanceTimeResult,
} from './narrative.js';

// --- Queries ---
export {
  traceBlocks,
  detectNeglect,
  findConflicts,
  getSceneContext,
  checkNarrativeHealth,
  getNpcAgendas,
  getAvailableStorylets,
} from './queries.js';
export type {
  BlockChain,
  SceneContext,
  NarrativeHealth,
  NpcAgenda,
  AvailableStorylet,
} from './queries.js';

// --- Tool Definitions ---
export { TOOL_DEFINITIONS } from './tool-definitions.js';
