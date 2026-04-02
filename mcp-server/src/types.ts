export const VERSION = '0.1.0';

// --- Node types (14) ---

export const NODE_TYPES = [
  'character', 'location', 'item', 'clue', 'event', 'objective',
  'faction', 'trait', 'storylet', 'skill', 'macguffin', 'scene',
  'thought', 'world_rule',
] as const;
export type NodeType = (typeof NODE_TYPES)[number];

// --- Edge types (18) ---

export const EDGE_TYPES = [
  'therefore', 'but', 'blocks', 'resolves', 'desires', 'fears',
  'believes', 'knows', 'suspects', 'opinion', 'has_trait',
  'located_at', 'belongs_to', 'carries', 'requires', 'threatens',
  'serves', 'witnessed',
] as const;
export type EdgeType = (typeof EDGE_TYPES)[number];

// --- Edge type inference defaults (source_type:target_type → edge_type) ---

export const EDGE_TYPE_DEFAULTS: Record<string, EdgeType> = {
  'event:event': 'therefore',
  'character:objective': 'desires',
  'character:trait': 'has_trait',
  'character:faction': 'belongs_to',
  'character:item': 'carries',
  'character:location': 'located_at',
  'character:clue': 'knows',
  'character:event': 'witnessed',
  'character:thought': 'believes',
  'storylet:clue': 'requires',
  'event:objective': 'serves',
  'item:location': 'located_at',
};

// --- Stats ---

export const STAT_NAMES = [
  'physique', 'agility', 'intellect', 'social', 'perception', 'resolve',
] as const;
export type StatName = (typeof STAT_NAMES)[number];

// --- Statuses ---

export const ACTIVE_STATUSES = ['active', 'in_progress', 'alive', 'ongoing'];
export const DONE_STATUSES = ['done', 'completed', 'dead', 'resolved', 'destroyed'];

// --- Data structures ---

export interface GameNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  tags?: string[];
  status?: string;
  properties?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GameEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  properties?: Record<string, unknown>;
  created_at: string;
}

export interface WorldDocument {
  rpg_engine_version: string;
  created_at: string;
  exported_at: string;
  source: {
    tool: string;
    tool_version: string;
  };
  world: {
    id: string;
    title: string;
    genre?: string;
    setting?: string;
    tone?: string;
  };
  player: {
    character_id: string;
    session_count: number;
    current_act: number;
    current_beat: string;
  };
  nodes: GameNode[];
  edges: GameEdge[];
}
