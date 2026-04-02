# Phase 1: MCP Server + Graph + Dice Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundational MCP server that stores an RPG world as a typed node/edge graph, with CRUD tools, a dice resolution engine, and a `get_scene_context` tool — enough to start playing immediately with Claude as narrator.

**Architecture:** TypeScript MCP server following the exact LifeGraph pattern (`/Users/f.god/Work/Development/Products/LifeGraph/mcp-server/`). Single JSON file persistence (`world.rpg`), stateless read-modify-write with mutex locking, atomic file writes. 14 node types, 18 edge types, d20 dice resolution. The server is the game engine; Claude is the narrator.

**Tech Stack:** TypeScript, `@modelcontextprotocol/sdk` ^1.27.0, `nanoid` ^5.1.0, `tsup` for build, Node 20+.

**Reference implementation:** All patterns replicated from LifeGraph at `/Users/f.god/Work/Development/Products/LifeGraph/mcp-server/src/`. When in doubt, check that codebase.

---

## File Structure

```
/Users/f.god/Work/RPG/
├── mcp-server/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts          — Entry point, CLI args, stdio transport
│       ├── types.ts          — Node types, edge types, interfaces, constants
│       ├── store.ts          — File I/O, locking, CRUD operations
│       ├── dice.ts           — d20 resolution engine, skill checks
│       ├── queries.ts        — Cascade queries (trace_blocks, detect_neglect, scene context)
│       └── server.ts         — MCP tool definitions + handlers
├── world.rpg                 — Game state file (JSON, created on first run)
└── .mcp.json                 — MCP server configuration
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `mcp-server/package.json`
- Create: `mcp-server/tsconfig.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "rpg-engine-mcp-server",
  "version": "0.1.0",
  "description": "MCP server for a graph-based RPG engine — the world is a graph",
  "type": "module",
  "bin": {
    "rpg-engine-mcp-server": "dist/index.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean --target node20",
    "dev": "tsup src/index.ts --format esm --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.27.0",
    "nanoid": "^5.1.0"
  },
  "devDependencies": {
    "tsup": "^8.5.1",
    "typescript": "^5.8.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Install dependencies**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npm install`
Expected: `node_modules` created, no errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/f.god/Work/RPG
git add mcp-server/package.json mcp-server/tsconfig.json mcp-server/package-lock.json
git commit -m "chore: scaffold RPG engine MCP server project"
```

---

### Task 2: Type Definitions

**Files:**
- Create: `mcp-server/src/types.ts`

- [ ] **Step 1: Write types.ts with all node types, edge types, and interfaces**

```typescript
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
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npx tsc --noEmit src/types.ts`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/f.god/Work/RPG
git add mcp-server/src/types.ts
git commit -m "feat: define RPG graph schema — 14 node types, 18 edge types"
```

---

### Task 3: Store (File I/O + Locking + CRUD)

**Files:**
- Create: `mcp-server/src/store.ts`

This replicates the LifeGraph store pattern exactly: stateless read-modify-write with mutex locking and atomic file writes.

- [ ] **Step 1: Write store.ts**

```typescript
import { promises as fs } from 'node:fs';
import { nanoid } from 'nanoid';
import type { WorldDocument, GameNode, GameEdge, NodeType, EdgeType } from './types.js';
import { VERSION } from './types.js';

export class WorldStore {
  private filePath: string;
  private lockQueue: Promise<void> = Promise.resolve();

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /** Acquire exclusive access for a read-modify-write cycle. */
  private async withLock<T>(fn: () => Promise<T>): Promise<T> {
    let release: () => void;
    const next = new Promise<void>(resolve => { release = resolve; });
    const prev = this.lockQueue;
    this.lockQueue = next;
    await prev;
    try {
      return await fn();
    } finally {
      release!();
    }
  }

  // --- Disk I/O ---

  async read(): Promise<WorldDocument> {
    const raw = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(raw) as WorldDocument;
  }

  async write(doc: WorldDocument): Promise<void> {
    try {
      const current = await this.read();
      if (doc.nodes.length < current.nodes.length) {
        const lost = current.nodes.length - doc.nodes.length;
        throw new Error(
          `WRITE BLOCKED: would drop ${lost} nodes ` +
          `(disk has ${current.nodes.length}, writing ${doc.nodes.length}). ` +
          `Stale read detected. Aborting to protect data.`
        );
      }
    } catch (e: any) {
      if (e.message?.startsWith('WRITE BLOCKED')) throw e;
    }

    doc.exported_at = new Date().toISOString();
    doc.source.tool_version = VERSION;
    const json = JSON.stringify(doc, null, 2);
    const tmpPath = this.filePath + '.tmp';
    await fs.writeFile(tmpPath, json, 'utf-8');
    await fs.rename(tmpPath, this.filePath);
  }

  async ensureFile(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      const doc: WorldDocument = {
        rpg_engine_version: VERSION,
        created_at: new Date().toISOString(),
        exported_at: new Date().toISOString(),
        source: { tool: 'rpg-engine-mcp', tool_version: VERSION },
        world: { id: `w_${nanoid(16)}`, title: 'New World' },
        player: { character_id: '', session_count: 0, current_act: 1, current_beat: 'opening' },
        nodes: [],
        edges: [],
      };
      await this.write(doc);
    }
  }

  // --- ID generation ---

  nodeId(): string { return `n_${nanoid(16)}`; }
  edgeId(): string { return `e_${nanoid(16)}`; }

  // --- Node operations ---

  async addNode(node: GameNode): Promise<GameNode> {
    return this.withLock(async () => {
      const doc = await this.read();
      doc.nodes.push(node);
      await this.write(doc);
      return node;
    });
  }

  async getNode(id: string): Promise<{ node: GameNode; edges: GameEdge[] } | undefined> {
    const doc = await this.read();
    const node = doc.nodes.find(n => n.id === id);
    if (!node) return undefined;
    const edges = doc.edges.filter(e => e.source === id || e.target === id);
    return { node, edges };
  }

  async updateNode(
    id: string,
    patch: Partial<Pick<GameNode, 'title' | 'description' | 'tags' | 'status' | 'properties'>>,
  ): Promise<GameNode | undefined> {
    return this.withLock(async () => {
      const doc = await this.read();
      const node = doc.nodes.find(n => n.id === id);
      if (!node) return undefined;

      if (patch.title !== undefined) node.title = patch.title;
      if (patch.description !== undefined) node.description = patch.description;
      if (patch.tags !== undefined) node.tags = patch.tags;
      if (patch.status !== undefined) node.status = patch.status;
      if (patch.properties !== undefined) {
        node.properties = { ...node.properties, ...patch.properties };
      }
      node.updated_at = new Date().toISOString();

      await this.write(doc);
      return node;
    });
  }

  async removeNode(id: string): Promise<{ node: GameNode; removedEdgeIds: string[] } | undefined> {
    return this.withLock(async () => {
      const doc = await this.read();
      const nodeIdx = doc.nodes.findIndex(n => n.id === id);
      if (nodeIdx === -1) return undefined;

      const node = doc.nodes[nodeIdx];
      const removedEdgeIds = doc.edges.filter(e => e.source === id || e.target === id).map(e => e.id);

      doc.nodes.splice(nodeIdx, 1);
      doc.edges = doc.edges.filter(e => e.source !== id && e.target !== id);

      // Bypass node count safety check for intentional deletes
      doc.exported_at = new Date().toISOString();
      doc.source.tool_version = VERSION;
      const json = JSON.stringify(doc, null, 2);
      const tmpPath = this.filePath + '.tmp';
      await fs.writeFile(tmpPath, json, 'utf-8');
      await fs.rename(tmpPath, this.filePath);

      return { node, removedEdgeIds };
    });
  }

  // --- Edge operations ---

  async addEdge(edge: GameEdge): Promise<GameEdge> {
    return this.withLock(async () => {
      const doc = await this.read();
      if (!doc.nodes.find(n => n.id === edge.source)) throw new Error(`Source node ${edge.source} not found`);
      if (!doc.nodes.find(n => n.id === edge.target)) throw new Error(`Target node ${edge.target} not found`);
      doc.edges.push(edge);
      await this.write(doc);
      return edge;
    });
  }

  async removeEdge(id: string): Promise<GameEdge | undefined> {
    return this.withLock(async () => {
      const doc = await this.read();
      const idx = doc.edges.findIndex(e => e.id === id);
      if (idx === -1) return undefined;
      const edge = doc.edges[idx];
      doc.edges.splice(idx, 1);
      await this.write(doc);
      return edge;
    });
  }

  // --- Read-only query helpers ---

  async getDocument(): Promise<WorldDocument> {
    return this.read();
  }

  async getNodesByType(type: NodeType): Promise<GameNode[]> {
    const doc = await this.read();
    return doc.nodes.filter(n => n.type === type);
  }

  async getEdgesForNode(nodeId: string): Promise<GameEdge[]> {
    const doc = await this.read();
    return doc.edges.filter(e => e.source === nodeId || e.target === nodeId);
  }

  static findNode(doc: WorldDocument, id: string): GameNode | undefined {
    return doc.nodes.find(n => n.id === id);
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/f.god/Work/RPG
git add mcp-server/src/store.ts
git commit -m "feat: WorldStore with mutex locking, atomic writes, CRUD ops"
```

---

### Task 4: Dice Resolution Engine

**Files:**
- Create: `mcp-server/src/dice.ts`

- [ ] **Step 1: Write dice.ts**

```typescript
import type { GameNode, WorldDocument, StatName } from './types.js';

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
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/f.god/Work/RPG
git add mcp-server/src/dice.ts
git commit -m "feat: d20 dice resolution engine with skill checks and failure choices"
```

---

### Task 5: Cascade Queries (trace_blocks, detect_neglect, scene context)

**Files:**
- Create: `mcp-server/src/queries.ts`

- [ ] **Step 1: Write queries.ts**

```typescript
import type { WorldDocument, GameNode, GameEdge } from './types.js';
import { ACTIVE_STATUSES } from './types.js';

function isActive(node: GameNode): boolean {
  if (!node.status) return true;
  return ACTIVE_STATUSES.includes(node.status.toLowerCase());
}

function findNode(doc: WorldDocument, id: string): GameNode | undefined {
  return doc.nodes.find(n => n.id === id);
}

// ─── 1. Trace Blocks (cascade query) ───────────────────────────────────

export interface BlockChain {
  node: { id: string; title: string; type: string };
  depth: number;
}

export function traceBlocks(doc: WorldDocument, startNodeId: string): {
  node: { id: string; title: string; type: string } | undefined;
  downstream: BlockChain[];
  upstream: BlockChain[];
} {
  const startNode = findNode(doc, startNodeId);

  // Downstream: what does this node block?
  const downstream: BlockChain[] = [];
  const visitedDown = new Set<string>();

  function walkDown(nodeId: string, depth: number) {
    for (const edge of doc.edges) {
      if (edge.type === 'blocks' && edge.source === nodeId && !visitedDown.has(edge.target)) {
        visitedDown.add(edge.target);
        const target = findNode(doc, edge.target);
        if (target) {
          downstream.push({ node: { id: target.id, title: target.title, type: target.type }, depth });
          walkDown(edge.target, depth + 1);
        }
      }
    }
  }

  // Upstream: what blocks this node?
  const upstream: BlockChain[] = [];
  const visitedUp = new Set<string>();

  function walkUp(nodeId: string, depth: number) {
    for (const edge of doc.edges) {
      if (edge.type === 'blocks' && edge.target === nodeId && !visitedUp.has(edge.source)) {
        visitedUp.add(edge.source);
        const source = findNode(doc, edge.source);
        if (source) {
          upstream.push({ node: { id: source.id, title: source.title, type: source.type }, depth });
          walkUp(edge.source, depth + 1);
        }
      }
    }
  }

  walkDown(startNodeId, 1);
  walkUp(startNodeId, 1);

  return {
    node: startNode ? { id: startNode.id, title: startNode.title, type: startNode.type } : undefined,
    downstream,
    upstream,
  };
}

// ─── 2. Detect Neglect ─────────────────────────────────────────────────

export function detectNeglect(doc: WorldDocument): {
  orphan_objectives: Array<{ id: string; title: string }>;
  unblocked_macguffins: Array<{ id: string; title: string }>;
  disconnected_npcs: Array<{ id: string; title: string }>;
} {
  // Objectives with no SERVES edges pointing at them
  const objectivesWithProgress = new Set<string>();
  for (const edge of doc.edges) {
    if (edge.type === 'serves') objectivesWithProgress.add(edge.target);
  }
  const orphan_objectives = doc.nodes
    .filter(n => n.type === 'objective' && isActive(n) && !objectivesWithProgress.has(n.id))
    .map(n => ({ id: n.id, title: n.title }));

  // MacGuffins that nothing currently blocks (already accessible but not obtained)
  const blockedThings = new Set<string>();
  for (const edge of doc.edges) {
    if (edge.type === 'blocks') blockedThings.add(edge.target);
  }
  const unblocked_macguffins = doc.nodes
    .filter(n => n.type === 'macguffin' && isActive(n) && !blockedThings.has(n.id))
    .map(n => ({ id: n.id, title: n.title }));

  // Characters with no edges at all
  const connectedNodes = new Set<string>();
  for (const edge of doc.edges) {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  }
  const disconnected_npcs = doc.nodes
    .filter(n => n.type === 'character' && isActive(n) && !connectedNodes.has(n.id))
    .map(n => ({ id: n.id, title: n.title }));

  return { orphan_objectives, unblocked_macguffins, disconnected_npcs };
}

// ─── 3. Find Conflicts ─────────────────────────────────────────────────

export function findConflicts(doc: WorldDocument): Array<{
  character_a: { id: string; title: string };
  character_b: { id: string; title: string };
  shared_objective: { id: string; title: string } | null;
  opinion_a_to_b: number | null;
  opinion_b_to_a: number | null;
}> {
  const conflicts: Array<{
    character_a: { id: string; title: string };
    character_b: { id: string; title: string };
    shared_objective: { id: string; title: string } | null;
    opinion_a_to_b: number | null;
    opinion_b_to_a: number | null;
  }> = [];

  // Find characters with competing DESIRES edges to the same objective
  const desiresByObjective = new Map<string, string[]>();
  for (const edge of doc.edges) {
    if (edge.type === 'desires') {
      const list = desiresByObjective.get(edge.target) || [];
      list.push(edge.source);
      desiresByObjective.set(edge.target, list);
    }
  }

  const seen = new Set<string>();
  for (const [objId, characterIds] of desiresByObjective) {
    if (characterIds.length < 2) continue;
    const obj = findNode(doc, objId);
    for (let i = 0; i < characterIds.length; i++) {
      for (let j = i + 1; j < characterIds.length; j++) {
        const key = [characterIds[i], characterIds[j]].sort().join(':');
        if (seen.has(key)) continue;
        seen.add(key);

        const a = findNode(doc, characterIds[i]);
        const b = findNode(doc, characterIds[j]);
        if (!a || !b) continue;

        const opAB = doc.edges.find(e => e.type === 'opinion' && e.source === a.id && e.target === b.id);
        const opBA = doc.edges.find(e => e.type === 'opinion' && e.source === b.id && e.target === a.id);

        conflicts.push({
          character_a: { id: a.id, title: a.title },
          character_b: { id: b.id, title: b.title },
          shared_objective: obj ? { id: obj.id, title: obj.title } : null,
          opinion_a_to_b: (opAB?.properties?.weight as number) ?? null,
          opinion_b_to_a: (opBA?.properties?.weight as number) ?? null,
        });
      }
    }
  }

  return conflicts;
}

// ─── 4. Get Scene Context ──────────────────────────────────────────────

export interface SceneContext {
  player: {
    id: string;
    title: string;
    stats: Record<string, unknown>;
    status: string | undefined;
    inventory: Array<{ id: string; title: string; type: string }>;
  } | null;
  location: {
    id: string;
    title: string;
    description: string | undefined;
    atmosphere: unknown;
    danger_level: unknown;
  } | null;
  npcs_present: Array<{
    id: string;
    title: string;
    opinion_of_player: number | null;
    desires: string[];
    fears: string[];
  }>;
  active_objectives: Array<{ id: string; title: string; status: string | undefined }>;
  active_threats: Array<{ id: string; source_title: string; target_title: string }>;
  tension_level: number;
  current_act: number;
  current_beat: string;
}

export function getSceneContext(doc: WorldDocument): SceneContext {
  const playerId = doc.player.character_id;
  const playerNode = findNode(doc, playerId);

  // Player info
  let player: SceneContext['player'] = null;
  if (playerNode) {
    const inventory = doc.edges
      .filter(e => e.type === 'carries' && e.source === playerId)
      .map(e => findNode(doc, e.target))
      .filter((n): n is GameNode => n !== undefined)
      .map(n => ({ id: n.id, title: n.title, type: n.properties?.type as string || n.type }));

    player = {
      id: playerNode.id,
      title: playerNode.title,
      stats: (playerNode.properties?.stats as Record<string, unknown>) || {},
      status: playerNode.status,
      inventory,
    };
  }

  // Current location
  const locationEdge = doc.edges.find(e => e.type === 'located_at' && e.source === playerId);
  const locationNode = locationEdge ? findNode(doc, locationEdge.target) : undefined;
  let location: SceneContext['location'] = null;
  if (locationNode) {
    location = {
      id: locationNode.id,
      title: locationNode.title,
      description: locationNode.description,
      atmosphere: locationNode.properties?.atmosphere,
      danger_level: locationNode.properties?.danger_level,
    };
  }

  // NPCs at same location
  const npcs_present: SceneContext['npcs_present'] = [];
  if (locationNode) {
    const npcEdges = doc.edges.filter(e => e.type === 'located_at' && e.target === locationNode.id && e.source !== playerId);
    for (const npcEdge of npcEdges) {
      const npc = findNode(doc, npcEdge.source);
      if (!npc || npc.type !== 'character' || !isActive(npc)) continue;

      const opinionEdge = doc.edges.find(e => e.type === 'opinion' && e.source === npc.id && e.target === playerId);
      const desires = doc.edges
        .filter(e => e.type === 'desires' && e.source === npc.id)
        .map(e => findNode(doc, e.target)?.title || 'unknown');
      const fears = doc.edges
        .filter(e => e.type === 'fears' && e.source === npc.id)
        .map(e => findNode(doc, e.target)?.title || 'unknown');

      npcs_present.push({
        id: npc.id,
        title: npc.title,
        opinion_of_player: (opinionEdge?.properties?.weight as number) ?? null,
        desires,
        fears,
      });
    }
  }

  // Active objectives
  const active_objectives = doc.nodes
    .filter(n => n.type === 'objective' && isActive(n))
    .map(n => ({ id: n.id, title: n.title, status: n.status }));

  // Active threats to player or current location
  const active_threats: SceneContext['active_threats'] = [];
  const threatTargets = new Set([playerId, locationNode?.id].filter(Boolean) as string[]);
  for (const edge of doc.edges) {
    if (edge.type === 'threatens') {
      if (threatTargets.has(edge.target)) {
        const source = findNode(doc, edge.source);
        const target = findNode(doc, edge.target);
        if (source && target) {
          active_threats.push({ id: edge.id, source_title: source.title, target_title: target.title });
        }
      }
    }
  }

  // Tension: count active threats + negative opinions + unresolved blocks on player
  const negativeOpinions = doc.edges.filter(
    e => e.type === 'opinion' && e.target === playerId && ((e.properties?.weight as number) ?? 0) < -20
  ).length;
  const playerBlocks = doc.edges.filter(e => e.type === 'blocks' && e.target === playerId).length;
  const tension_level = Math.min(10, active_threats.length * 2 + negativeOpinions + playerBlocks);

  return {
    player,
    location,
    npcs_present,
    active_objectives,
    active_threats,
    tension_level,
    current_act: doc.player.current_act,
    current_beat: doc.player.current_beat,
  };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/f.god/Work/RPG
git add mcp-server/src/queries.ts
git commit -m "feat: cascade queries — trace_blocks, detect_neglect, find_conflicts, get_scene_context"
```

---

### Task 6: MCP Server — Tool Definitions + Handlers

**Files:**
- Create: `mcp-server/src/server.ts`

This is the largest file. It defines all Phase 1 MCP tools and their handlers. Phase 1 tools: CRUD (6), search (2), dice (1), scene context (1) = 10 tools.

- [ ] **Step 1: Write server.ts**

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { WorldStore } from './store.js';
import {
  VERSION, NODE_TYPES, EDGE_TYPES, EDGE_TYPE_DEFAULTS, STAT_NAMES,
} from './types.js';
import type { NodeType, EdgeType } from './types.js';
import { resolveAction } from './dice.js';
import { traceBlocks, detectNeglect, findConflicts, getSceneContext } from './queries.js';

function text(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

const TOOLS = [
  // ─── CRUD ─────────────────────────────────────────────────────────
  {
    name: 'create_node',
    description: `Create a game entity. Types: ${NODE_TYPES.join(', ')}. Set parent_id to auto-create an edge to parent.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', enum: [...NODE_TYPES], description: 'Node type' },
        title: { type: 'string', description: 'Title' },
        description: { type: 'string', description: 'Description' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags' },
        status: { type: 'string', description: 'Status (active, dead, done, etc.)' },
        properties: { type: 'object', description: 'Type-specific properties (stats, voice_doc_ref, atmosphere, etc.)' },
        parent_id: { type: 'string', description: 'Parent node ID — auto-creates an edge' },
      },
      required: ['type', 'title'],
    },
  },
  {
    name: 'get_node',
    description: 'Get a node with all connected edges and neighbor titles.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        node_id: { type: 'string', description: 'Node ID' },
      },
      required: ['node_id'],
    },
  },
  {
    name: 'update_node',
    description: 'Update a node. Only specified fields change.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        node_id: { type: 'string', description: 'Node ID' },
        title: { type: 'string' },
        description: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        status: { type: 'string' },
        properties: { type: 'object' },
      },
      required: ['node_id'],
    },
  },
  {
    name: 'delete_node',
    description: 'Delete a node and all connected edges.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        node_id: { type: 'string', description: 'Node ID' },
      },
      required: ['node_id'],
    },
  },
  {
    name: 'list_nodes',
    description: 'List nodes with optional filters. Paginated.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        type: { type: 'string', enum: [...NODE_TYPES], description: 'Filter by node type' },
        status: { type: 'string', description: 'Filter by status' },
        offset: { type: 'number', description: 'Skip N results (default 0)' },
        limit: { type: 'number', description: 'Max results (default 50, max 200)' },
      },
    },
  },
  {
    name: 'search_nodes',
    description: 'Full-text search across node titles and descriptions. Title matches score 2x.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query' },
        type: { type: 'string', enum: [...NODE_TYPES], description: 'Filter by type' },
        limit: { type: 'number', description: 'Max results (default 20)' },
      },
      required: ['query'],
    },
  },
  // ─── Edges ────────────────────────────────────────────────────────
  {
    name: 'create_edge',
    description: `Create a relationship. Types: ${EDGE_TYPES.join(', ')}. If type omitted, inferred from node types.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        source_id: { type: 'string', description: 'Source node ID' },
        target_id: { type: 'string', description: 'Target node ID' },
        type: { type: 'string', enum: [...EDGE_TYPES], description: 'Edge type (inferred if omitted)' },
        properties: { type: 'object', description: 'Edge properties (weight, magnitude, etc.)' },
      },
      required: ['source_id', 'target_id'],
    },
  },
  {
    name: 'delete_edge',
    description: 'Delete a relationship.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        edge_id: { type: 'string', description: 'Edge ID' },
      },
      required: ['edge_id'],
    },
  },
  // ─── Game Mechanics ───────────────────────────────────────────────
  {
    name: 'attempt_action',
    description: 'Resolve an action with a dice roll. Returns success/failure, margin, narrative hint, and choices on failure. Claude MUST narrate the result — cannot override the outcome.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        character_id: { type: 'string', description: 'Character attempting the action' },
        skill: { type: 'string', description: 'Skill to check (e.g., stealth, investigation, persuasion)' },
        dc: { type: 'number', description: 'Difficulty class (easy=8, medium=12, hard=16, extreme=20)' },
        action_description: { type: 'string', description: 'What the character is trying to do' },
        situational_modifier: { type: 'number', description: 'Bonus/penalty from circumstances (default 0)' },
      },
      required: ['character_id', 'skill', 'dc', 'action_description'],
    },
  },
  // ─── Scene Context ────────────────────────────────────────────────
  {
    name: 'get_scene_context',
    description: 'Get everything the narrator needs: player state, location, NPCs present, inventory, active objectives, threats, tension level, current story beat. Call this at the start of each interaction.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  // ─── Cascade Queries ──────────────────────────────────────────────
  {
    name: 'trace_blocks',
    description: 'Trace what a node blocks downstream and what blocks it upstream. Shows the full cascade chain.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        node_id: { type: 'string', description: 'Node ID to trace from' },
      },
      required: ['node_id'],
    },
  },
  {
    name: 'detect_neglect',
    description: 'Find forgotten plotlines: objectives with no progress, accessible MacGuffins not obtained, disconnected NPCs.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'find_conflicts',
    description: 'Find NPCs with competing desires for the same objectives, plus their opinions of each other.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
];

export function createServer(store: WorldStore) {
  const server = new Server(
    { name: 'rpg-engine', version: VERSION },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    switch (name) {

      // ─── CRUD ───────────────────────────────────────────────────

      case 'create_node': {
        const id = store.nodeId();
        const now = new Date().toISOString();
        const node = await store.addNode({
          id,
          type: args.type as NodeType,
          title: args.title as string,
          description: args.description as string | undefined,
          tags: args.tags as string[] | undefined,
          status: (args.status as string) || 'active',
          properties: args.properties as Record<string, unknown> | undefined,
          created_at: now,
          updated_at: now,
        });

        // Auto-create edge to parent if specified
        if (args.parent_id) {
          const parentNode = await store.getNode(args.parent_id as string);
          if (parentNode) {
            const sourceType = args.type as string;
            const targetType = parentNode.node.type;
            const inferredType = EDGE_TYPE_DEFAULTS[`${sourceType}:${targetType}`] || 'belongs_to';
            await store.addEdge({
              id: store.edgeId(),
              source: id,
              target: args.parent_id as string,
              type: inferredType as EdgeType,
              created_at: now,
            });
          }
        }

        return text({ created: node });
      }

      case 'get_node': {
        const result = await store.getNode(args.node_id as string);
        if (!result) return text({ error: 'Node not found' });

        const doc = await store.getDocument();
        const enrichedEdges = result.edges.map(e => {
          const neighborId = e.source === result.node.id ? e.target : e.source;
          const neighbor = WorldStore.findNode(doc, neighborId);
          return {
            ...e,
            neighbor_title: neighbor?.title || 'unknown',
            neighbor_type: neighbor?.type || 'unknown',
            direction: e.source === result.node.id ? 'outgoing' : 'incoming',
          };
        });

        return text({ node: result.node, edges: enrichedEdges });
      }

      case 'update_node': {
        const updated = await store.updateNode(args.node_id as string, {
          title: args.title as string | undefined,
          description: args.description as string | undefined,
          tags: args.tags as string[] | undefined,
          status: args.status as string | undefined,
          properties: args.properties as Record<string, unknown> | undefined,
        });
        if (!updated) return text({ error: 'Node not found' });
        return text({ updated });
      }

      case 'delete_node': {
        const result = await store.removeNode(args.node_id as string);
        if (!result) return text({ error: 'Node not found' });
        return text({ deleted: result.node.id, removed_edges: result.removedEdgeIds.length });
      }

      case 'list_nodes': {
        const doc = await store.getDocument();
        let nodes = doc.nodes;

        if (args.type) nodes = nodes.filter(n => n.type === args.type);
        if (args.status) nodes = nodes.filter(n => n.status === args.status);

        const offset = Math.max(0, (args.offset as number) || 0);
        const limit = Math.min(200, Math.max(1, (args.limit as number) || 50));
        const page = nodes.slice(offset, offset + limit);

        return text({ total: nodes.length, offset, limit, nodes: page });
      }

      case 'search_nodes': {
        const doc = await store.getDocument();
        const query = (args.query as string).toLowerCase();
        const maxResults = Math.min(50, (args.limit as number) || 20);

        const scored = doc.nodes
          .filter(n => !args.type || n.type === args.type)
          .map(n => {
            let score = 0;
            if (n.title.toLowerCase().includes(query)) score += 2;
            if (n.description?.toLowerCase().includes(query)) score += 1;
            if (n.tags?.some(t => t.toLowerCase().includes(query))) score += 1;
            return { node: n, score };
          })
          .filter(r => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, maxResults);

        return text({ results: scored });
      }

      // ─── Edges ──────────────────────────────────────────────────

      case 'create_edge': {
        const sourceResult = await store.getNode(args.source_id as string);
        const targetResult = await store.getNode(args.target_id as string);
        if (!sourceResult) return text({ error: `Source node ${args.source_id} not found` });
        if (!targetResult) return text({ error: `Target node ${args.target_id} not found` });

        let edgeType = args.type as EdgeType | undefined;
        if (!edgeType) {
          const key = `${sourceResult.node.type}:${targetResult.node.type}`;
          edgeType = EDGE_TYPE_DEFAULTS[key];
          if (!edgeType) return text({ error: `Cannot infer edge type for ${key}. Specify type explicitly.` });
        }

        const edge = await store.addEdge({
          id: store.edgeId(),
          source: args.source_id as string,
          target: args.target_id as string,
          type: edgeType,
          properties: args.properties as Record<string, unknown> | undefined,
          created_at: new Date().toISOString(),
        });

        return text({ created: edge });
      }

      case 'delete_edge': {
        const edge = await store.removeEdge(args.edge_id as string);
        if (!edge) return text({ error: 'Edge not found' });
        return text({ deleted: edge.id });
      }

      // ─── Game Mechanics ─────────────────────────────────────────

      case 'attempt_action': {
        const charResult = await store.getNode(args.character_id as string);
        if (!charResult) return text({ error: 'Character not found' });

        const result = resolveAction(
          charResult.node,
          args.skill as string,
          args.dc as number,
          args.action_description as string,
          (args.situational_modifier as number) || 0,
        );

        return text({
          action: args.action_description,
          skill: args.skill,
          ...result,
        });
      }

      // ─── Scene Context ──────────────────────────────────────────

      case 'get_scene_context': {
        const doc = await store.getDocument();
        const context = getSceneContext(doc);
        return text(context);
      }

      // ─── Cascade Queries ────────────────────────────────────────

      case 'trace_blocks': {
        const doc = await store.getDocument();
        const result = traceBlocks(doc, args.node_id as string);
        return text(result);
      }

      case 'detect_neglect': {
        const doc = await store.getDocument();
        const result = detectNeglect(doc);
        return text(result);
      }

      case 'find_conflicts': {
        const doc = await store.getDocument();
        const result = findConflicts(doc);
        return text({ conflicts: result });
      }

      default:
        return text({ error: `Unknown tool: ${name}` });
    }
  });

  return server;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/f.god/Work/RPG
git add mcp-server/src/server.ts
git commit -m "feat: MCP server with 13 tools — CRUD, edges, dice, scene context, cascade queries"
```

---

### Task 7: Entry Point

**Files:**
- Create: `mcp-server/src/index.ts`

- [ ] **Step 1: Write index.ts**

```typescript
#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WorldStore } from './store.js';
import { createServer } from './server.js';

const { values } = parseArgs({
  options: {
    file: { type: 'string', short: 'f' },
  },
  strict: false,
});

const filePath = resolve(typeof values.file === 'string' ? values.file : 'world.rpg');

async function main() {
  const store = new WorldStore(filePath);
  await store.ensureFile();

  const server = createServer(store);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('RPG Engine MCP server failed to start:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/f.god/Work/RPG
git add mcp-server/src/index.ts
git commit -m "feat: MCP server entry point with CLI args"
```

---

### Task 8: Build + MCP Configuration

**Files:**
- Create: `.mcp.json`

- [ ] **Step 1: Build the server**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npm run build`
Expected: `dist/index.js` created with no errors.

- [ ] **Step 2: Create .mcp.json at project root**

```json
{
  "mcpServers": {
    "rpg-engine": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js", "--file", "./world.rpg"]
    }
  }
}
```

- [ ] **Step 3: Test the server starts**

Run: `cd /Users/f.god/Work/RPG && echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node ./mcp-server/dist/index.js --file ./world.rpg`
Expected: JSON response with server info and capabilities. A `world.rpg` file should be created.

- [ ] **Step 4: Verify world.rpg was created**

Run: `cat /Users/f.god/Work/RPG/world.rpg | head -5`
Expected: JSON with `rpg_engine_version`, empty nodes/edges arrays.

- [ ] **Step 5: Add world.rpg to .gitignore**

Add `world.rpg` and `.superpowers/` to `.gitignore` so game state files and brainstorm assets aren't committed:

```
world.rpg
world.rpg.tmp
.superpowers/
```

- [ ] **Step 6: Commit**

```bash
cd /Users/f.god/Work/RPG
git add .mcp.json .gitignore
git commit -m "feat: MCP config + build — RPG engine server is runnable"
```

---

### Task 9: Smoke Test — Create a Mini World and Query It

This is a manual integration test. We use the MCP tools via Claude to create a few nodes/edges and verify the whole system works end-to-end.

**Files:** None (uses existing tools)

- [ ] **Step 1: Rebuild after any fixes**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npm run build`
Expected: Clean build.

- [ ] **Step 2: Verify all 13 tools are listed**

Use the MCP server and call `tools/list`. Verify these tools are present:
`create_node`, `get_node`, `update_node`, `delete_node`, `list_nodes`, `search_nodes`, `create_edge`, `delete_edge`, `attempt_action`, `get_scene_context`, `trace_blocks`, `detect_neglect`, `find_conflicts`

- [ ] **Step 3: Create test nodes via MCP tools**

Using the live MCP tools, create:
1. A player CHARACTER node with stats `{ physique: 3, agility: 4, intellect: 6, social: 5, perception: 5, resolve: 4 }` and skills `{ investigation: 3, stealth: 1, persuasion: 2 }`
2. A LOCATION node "Raccoon City Times — Newsroom"
3. A CHARACTER node "Ben Bertolucci" (NPC journalist)
4. A LOCATED_AT edge placing the player at the newsroom
5. A LOCATED_AT edge placing Ben at the newsroom
6. An OPINION edge from Ben to the player with weight: 15 (slightly positive)
7. An OBJECTIVE node "Investigate the Arklay Mountain attacks"
8. A DESIRES edge from Ben to the objective

Set the player's `character_id` in the world document by updating the player node properties.

- [ ] **Step 4: Test get_scene_context**

Call `get_scene_context`. Verify it returns:
- Player with stats and empty inventory
- Location: newsroom
- NPCs present: Ben with opinion 15 and his desire
- Active objectives: the investigation objective
- Tension level: low (0-2)

- [ ] **Step 5: Test attempt_action**

Call `attempt_action` with the player character, skill "investigation", dc 12, action "Search the newsroom archives for old Arklay Mountain reports". Verify it returns a dice result with roll, modifier, outcome, and narrative hint.

- [ ] **Step 6: Test trace_blocks**

Create a MACGUFFIN node "Arklay Incident Report" and a BLOCKS edge from it to the investigation objective. Then call `trace_blocks` on the MacGuffin. Verify it shows the objective as a downstream block.

- [ ] **Step 7: Commit final state**

```bash
cd /Users/f.god/Work/RPG
git add -A
git commit -m "feat: Phase 1 complete — RPG engine MCP server with graph, dice, and queries"
```
