# Phase 2: Narrative Tools — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the gameplay loop tools that make the RPG self-documenting — every action records itself in the graph as EVENT nodes with causal THEREFORE/BUT edges, and dedicated tools handle investigation, NPC interviews, research, movement, and time advancement.

**Architecture:** Six new MCP tools added to the existing server.ts, plus a new `narrative.ts` module for the gameplay logic (keeps server.ts from growing too large). Each tool reads the graph, performs game logic (often including a dice roll), writes results back (new nodes + edges), and returns structured data for Claude to narrate. The existing store, types, and dice modules are unchanged.

**Tech Stack:** TypeScript, same MCP server pattern. No new dependencies.

**Existing codebase:** `/Users/f.god/Work/RPG/mcp-server/src/` — types.ts, store.ts, dice.ts, queries.ts, server.ts, index.ts. All on branch `feat/phase1-mcp-server`.

**CRITICAL:** The game world file `world.rpg` contains an active Raccoon City playthrough. Do NOT delete, overwrite, or modify it. Only the server code changes.

---

## File Structure

```
mcp-server/src/
├── types.ts       — unchanged
├── store.ts       — unchanged
├── dice.ts        — unchanged
├── queries.ts     — unchanged
├── narrative.ts   — NEW: gameplay logic for log_event, investigate, interview, research, move, advance_time
├── server.ts      — MODIFY: add 6 new tool definitions + handlers that call narrative.ts
└── index.ts       — unchanged
```

---

### Task 1: Create narrative.ts — log_event

**Files:**
- Create: `mcp-server/src/narrative.ts`

This is the most important function in Phase 2. It creates an EVENT node and connects it to the causal chain with THEREFORE or BUT edges. It also connects the event to participants via WITNESSED edges.

- [ ] **Step 1: Create narrative.ts with logEvent function**

```typescript
import type { WorldDocument, GameNode, GameEdge, EdgeType } from './types.js';
import { ACTIVE_STATUSES } from './types.js';
import { WorldStore } from './store.js';
import { resolveAction, resolveCheck, rollD20, getSkillModifier } from './dice.js';

function isActive(node: GameNode): boolean {
  if (!node.status) return true;
  return ACTIVE_STATUSES.includes(node.status.toLowerCase());
}

// ─── 1. Log Event ──────────────────────────────────────────────────────

export interface LogEventParams {
  title: string;
  description: string;
  causal_type: 'therefore' | 'but';
  caused_by_event_id?: string;
  participant_ids?: string[];
  tags?: string[];
}

export interface LogEventResult {
  event: GameNode;
  causal_edge: GameEdge | null;
  witnessed_edges: GameEdge[];
}

/**
 * Record a narrative event in the graph.
 * Creates an EVENT node, a THEREFORE or BUT edge from the causing event,
 * and WITNESSED edges for all participants.
 */
export async function logEvent(
  store: WorldStore,
  params: LogEventParams,
): Promise<LogEventResult> {
  const now = new Date().toISOString();
  const eventId = store.nodeId();

  const event: GameNode = {
    id: eventId,
    type: 'event',
    title: params.title,
    description: params.description,
    tags: params.tags,
    status: 'active',
    properties: {
      causal_type: params.causal_type,
      timestamp: now,
    },
    created_at: now,
    updated_at: now,
  };

  await store.addNode(event);

  // Create causal edge from previous event
  let causal_edge: GameEdge | null = null;
  if (params.caused_by_event_id) {
    const causeNode = await store.getNode(params.caused_by_event_id);
    if (causeNode) {
      causal_edge = {
        id: store.edgeId(),
        source: params.caused_by_event_id,
        target: eventId,
        type: params.causal_type,
        created_at: now,
      };
      await store.addEdge(causal_edge);
    }
  }

  // Create WITNESSED edges for participants
  const witnessed_edges: GameEdge[] = [];
  if (params.participant_ids) {
    for (const pid of params.participant_ids) {
      const participant = await store.getNode(pid);
      if (participant) {
        const edge: GameEdge = {
          id: store.edgeId(),
          source: pid,
          target: eventId,
          type: 'witnessed',
          created_at: now,
        };
        await store.addEdge(edge);
        witnessed_edges.push(edge);
      }
    }
  }

  return { event, causal_edge, witnessed_edges };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/f.god/Work/RPG
git add mcp-server/src/narrative.ts
git commit -m "feat: narrative.ts with logEvent — records events with THEREFORE/BUT causal edges"
```

---

### Task 2: Add investigate, interview_npc, research to narrative.ts

**Files:**
- Modify: `mcp-server/src/narrative.ts`

These three tools share a pattern: read the graph for context, make a dice roll, determine what information is revealed based on the result, create appropriate nodes/edges, and return structured data.

- [ ] **Step 1: Add investigate function to narrative.ts**

Append to the end of `mcp-server/src/narrative.ts`:

```typescript
// ─── 2. Investigate ────────────────────────────────────────────────────

export interface InvestigateParams {
  character_id: string;
  location_id: string;
  focus?: string;
  situational_modifier?: number;
}

export interface InvestigateResult {
  dice: import('./dice.js').DiceResult;
  clues_found: GameNode[];
  new_edges: GameEdge[];
  narrative_hint: string;
}

/**
 * Search a location for clues. Perception check determines quality of findings.
 * On success, reveals CLUE nodes that are LOCATED_AT the target location.
 * Better rolls reveal more clues or hidden ones.
 */
export async function investigate(
  store: WorldStore,
  params: InvestigateParams,
): Promise<InvestigateResult> {
  const doc = await store.getDocument();
  const character = doc.nodes.find(n => n.id === params.character_id);
  if (!character) throw new Error('Character not found');

  const location = doc.nodes.find(n => n.id === params.location_id);
  if (!location) throw new Error('Location not found');

  // Roll perception check (DC based on location danger + base 10)
  const dangerLevel = (location.properties?.danger_level as number) ?? 0;
  const dc = 10 + dangerLevel;
  const skillMod = getSkillModifier(character, 'investigation') || getSkillModifier(character, 'perception');
  const roll = rollD20();
  const dice = resolveCheck(roll, skillMod + (params.situational_modifier || 0), dc);

  // Find clues at this location that the player doesn't already KNOW
  const playerKnows = new Set(
    doc.edges.filter(e => e.type === 'knows' && e.source === params.character_id).map(e => e.target)
  );
  const locationClues = doc.nodes.filter(n =>
    (n.type === 'clue' || n.type === 'item') &&
    doc.edges.some(e => e.type === 'located_at' && e.source === n.id && e.target === params.location_id) &&
    !playerKnows.has(n.id)
  );

  // Filter by focus if provided
  let relevantClues = locationClues;
  if (params.focus) {
    const focusLower = params.focus.toLowerCase();
    const focused = locationClues.filter(n =>
      n.title.toLowerCase().includes(focusLower) ||
      n.description?.toLowerCase().includes(focusLower) ||
      n.tags?.some(t => t.toLowerCase().includes(focusLower))
    );
    if (focused.length > 0) relevantClues = focused;
  }

  // Determine how many clues are revealed based on outcome
  let revealCount: number;
  let narrative_hint: string;

  switch (dice.outcome) {
    case 'critical_success':
      revealCount = relevantClues.length; // Reveal everything
      narrative_hint = `Thorough search of ${location.title}. Every detail stands out with crystalline clarity.`;
      break;
    case 'success':
      revealCount = Math.max(1, Math.ceil(relevantClues.length * 0.6));
      narrative_hint = `Careful search of ${location.title} turns up something useful.`;
      break;
    case 'partial_success':
      revealCount = 1;
      narrative_hint = `A quick look around ${location.title} reveals something, but there might be more.`;
      break;
    case 'failure':
      revealCount = 0;
      narrative_hint = `Search of ${location.title} turns up nothing obvious. But something feels off.`;
      break;
    case 'critical_failure':
      revealCount = 0;
      narrative_hint = `Search of ${location.title} is interrupted. Someone may have noticed.`;
      break;
  }

  const clues_found = relevantClues.slice(0, revealCount);
  const new_edges: GameEdge[] = [];

  // Create KNOWS edges for discovered clues
  for (const clue of clues_found) {
    const edge: GameEdge = {
      id: store.edgeId(),
      source: params.character_id,
      target: clue.id,
      type: 'knows',
      properties: { discovered_via: 'investigation', at_location: params.location_id },
      created_at: new Date().toISOString(),
    };
    await store.addEdge(edge);
    new_edges.push(edge);
  }

  return { dice, clues_found, new_edges, narrative_hint };
}

// ─── 3. Interview NPC ──────────────────────────────────────────────────

export interface InterviewParams {
  character_id: string;
  npc_id: string;
  topic?: string;
  approach?: 'friendly' | 'intimidating' | 'deceptive';
}

export interface InterviewResult {
  dice: import('./dice.js').DiceResult;
  npc_title: string;
  npc_opinion: number | null;
  information_shared: Array<{ id: string; title: string; type: string; detail?: string }>;
  opinion_change: number;
  narrative_hint: string;
}

/**
 * Interview an NPC. Social check determines how much they share.
 * Checks NPC's KNOWS and SUSPECTS edges, filtered by topic.
 * NPC opinion affects DC and may shift based on approach.
 */
export async function interviewNpc(
  store: WorldStore,
  params: InterviewParams,
): Promise<InterviewResult> {
  const doc = await store.getDocument();
  const character = doc.nodes.find(n => n.id === params.character_id);
  if (!character) throw new Error('Character not found');

  const npc = doc.nodes.find(n => n.id === params.npc_id);
  if (!npc) throw new Error('NPC not found');

  // Get NPC's opinion of player
  const opinionEdge = doc.edges.find(
    e => e.type === 'opinion' && e.source === params.npc_id && e.target === params.character_id
  );
  const npc_opinion = (opinionEdge?.properties?.weight as number) ?? 0;

  // DC based on NPC's willingness (inverse of opinion, clamped)
  // Positive opinion = easier, negative = harder
  const baseDc = 12;
  const opinionModifier = Math.floor(npc_opinion / 20); // -5 to +5
  const dc = Math.max(5, Math.min(20, baseDc - opinionModifier));

  // Choose skill based on approach
  const skillMap = {
    friendly: 'persuasion',
    intimidating: 'intimidation',
    deceptive: 'deception',
  };
  const skill = skillMap[params.approach || 'friendly'] || 'persuasion';
  const skillMod = getSkillModifier(character, skill);
  const roll = rollD20();
  const dice = resolveCheck(roll, skillMod, dc);

  // Gather NPC's knowledge
  const npcKnowledge = doc.edges
    .filter(e => (e.type === 'knows' || e.type === 'suspects') && e.source === params.npc_id)
    .map(e => {
      const target = doc.nodes.find(n => n.id === e.target);
      return target ? {
        id: target.id,
        title: target.title,
        type: e.type,
        detail: (e.properties?.detail as string) || undefined,
      } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Filter by topic if provided
  let relevantKnowledge = npcKnowledge;
  if (params.topic) {
    const topicLower = params.topic.toLowerCase();
    const filtered = npcKnowledge.filter(k =>
      k.title.toLowerCase().includes(topicLower) ||
      k.detail?.toLowerCase().includes(topicLower)
    );
    if (filtered.length > 0) relevantKnowledge = filtered;
  }

  // Determine what they share based on roll
  let shareCount: number;
  let opinion_change: number;
  let narrative_hint: string;

  switch (dice.outcome) {
    case 'critical_success':
      shareCount = relevantKnowledge.length;
      opinion_change = 10;
      narrative_hint = `${npc.title} opens up completely. Trust has been established.`;
      break;
    case 'success':
      shareCount = Math.max(1, Math.ceil(relevantKnowledge.length * 0.6));
      opinion_change = 5;
      narrative_hint = `${npc.title} shares what they're comfortable with.`;
      break;
    case 'partial_success':
      shareCount = 1;
      opinion_change = 0;
      narrative_hint = `${npc.title} lets something slip, but clams up quickly.`;
      break;
    case 'failure':
      shareCount = 0;
      opinion_change = params.approach === 'intimidating' ? -10 : -5;
      narrative_hint = `${npc.title} isn't talking. This conversation is over.`;
      break;
    case 'critical_failure':
      shareCount = 0;
      opinion_change = -15;
      narrative_hint = `${npc.title} becomes hostile. You've burned this bridge — for now.`;
      break;
  }

  const information_shared = relevantKnowledge.slice(0, shareCount);

  // Create KNOWS edges for information the player learned
  for (const info of information_shared) {
    const alreadyKnows = doc.edges.some(
      e => e.type === 'knows' && e.source === params.character_id && e.target === info.id
    );
    if (!alreadyKnows) {
      await store.addEdge({
        id: store.edgeId(),
        source: params.character_id,
        target: info.id,
        type: 'knows',
        properties: { discovered_via: 'interview', source_npc: params.npc_id },
        created_at: new Date().toISOString(),
      });
    }
  }

  // Update NPC opinion
  if (opinion_change !== 0 && opinionEdge) {
    const newWeight = Math.max(-100, Math.min(100, npc_opinion + opinion_change));
    await store.updateNode(params.npc_id, {
      properties: { ...npc.properties },
    });
    // Update opinion edge weight via remove + re-add (edges don't have updateEdge)
    await store.removeEdge(opinionEdge.id);
    await store.addEdge({
      id: store.edgeId(),
      source: params.npc_id,
      target: params.character_id,
      type: 'opinion',
      properties: { ...opinionEdge.properties, weight: newWeight },
      created_at: new Date().toISOString(),
    });
  }

  return {
    dice,
    npc_title: npc.title,
    npc_opinion: npc_opinion + opinion_change,
    information_shared,
    opinion_change,
    narrative_hint,
  };
}

// ─── 4. Research ───────────────────────────────────────────────────────

export interface ResearchParams {
  character_id: string;
  topic: string;
  location_id?: string;
  situational_modifier?: number;
}

export interface ResearchResult {
  dice: import('./dice.js').DiceResult;
  findings: Array<{ id: string; title: string; type: string }>;
  new_edges: GameEdge[];
  narrative_hint: string;
}

/**
 * Research a topic via records, archives, or databases.
 * Intellect/research check. Searches all CLUE nodes matching the topic
 * that the player doesn't already KNOW.
 */
export async function research(
  store: WorldStore,
  params: ResearchParams,
): Promise<ResearchResult> {
  const doc = await store.getDocument();
  const character = doc.nodes.find(n => n.id === params.character_id);
  if (!character) throw new Error('Character not found');

  const dc = 12;
  const skillMod = getSkillModifier(character, 'research') || getSkillModifier(character, 'investigation');
  const roll = rollD20();
  const dice = resolveCheck(roll, skillMod + (params.situational_modifier || 0), dc);

  // Find clues/items matching the topic that player doesn't know
  const playerKnows = new Set(
    doc.edges.filter(e => e.type === 'knows' && e.source === params.character_id).map(e => e.target)
  );
  const topicLower = params.topic.toLowerCase();
  const matchingNodes = doc.nodes.filter(n =>
    (n.type === 'clue' || n.type === 'macguffin' || n.type === 'faction' || n.type === 'character') &&
    !playerKnows.has(n.id) &&
    (n.title.toLowerCase().includes(topicLower) ||
     n.description?.toLowerCase().includes(topicLower) ||
     n.tags?.some(t => t.toLowerCase().includes(topicLower)))
  );

  let revealCount: number;
  let narrative_hint: string;

  switch (dice.outcome) {
    case 'critical_success':
      revealCount = matchingNodes.length;
      narrative_hint = `Deep research into "${params.topic}" reveals a wealth of connections.`;
      break;
    case 'success':
      revealCount = Math.max(1, Math.ceil(matchingNodes.length * 0.5));
      narrative_hint = `Research into "${params.topic}" turns up solid leads.`;
      break;
    case 'partial_success':
      revealCount = 1;
      narrative_hint = `Research into "${params.topic}" finds a thread worth pulling.`;
      break;
    case 'failure':
      revealCount = 0;
      narrative_hint = `Research into "${params.topic}" hits dead ends. The records are incomplete — or someone cleaned them.`;
      break;
    case 'critical_failure':
      revealCount = 0;
      narrative_hint = `Research into "${params.topic}" attracts unwanted attention. Someone is monitoring these records.`;
      break;
  }

  const findings = matchingNodes.slice(0, revealCount);
  const new_edges: GameEdge[] = [];

  for (const finding of findings) {
    const edge: GameEdge = {
      id: store.edgeId(),
      source: params.character_id,
      target: finding.id,
      type: 'knows',
      properties: { discovered_via: 'research', topic: params.topic },
      created_at: new Date().toISOString(),
    };
    await store.addEdge(edge);
    new_edges.push(edge);
  }

  return {
    dice,
    findings: findings.map(n => ({ id: n.id, title: n.title, type: n.type })),
    new_edges,
    narrative_hint,
  };
}

// ─── 5. Move to Location ──────────────────────────────────────────────

export interface MoveResult {
  previous_location: { id: string; title: string } | null;
  new_location: { id: string; title: string; description?: string; atmosphere?: unknown; danger_level?: unknown };
  npcs_present: Array<{ id: string; title: string }>;
}

/**
 * Move the player to a new location.
 * Removes old LOCATED_AT edge, creates new one, returns new scene info.
 */
export async function moveToLocation(
  store: WorldStore,
  characterId: string,
  locationId: string,
): Promise<MoveResult> {
  const doc = await store.getDocument();
  const location = doc.nodes.find(n => n.id === locationId);
  if (!location) throw new Error('Location not found');
  if (location.type !== 'location') throw new Error(`${location.title} is not a location`);

  // Find and remove current location edge
  const currentEdge = doc.edges.find(e => e.type === 'located_at' && e.source === characterId);
  let previous_location: MoveResult['previous_location'] = null;
  if (currentEdge) {
    const prevLoc = doc.nodes.find(n => n.id === currentEdge.target);
    if (prevLoc) previous_location = { id: prevLoc.id, title: prevLoc.title };
    await store.removeEdge(currentEdge.id);
  }

  // Create new location edge
  await store.addEdge({
    id: store.edgeId(),
    source: characterId,
    target: locationId,
    type: 'located_at',
    created_at: new Date().toISOString(),
  });

  // Find NPCs at the new location
  const refreshedDoc = await store.getDocument();
  const npcs_present = refreshedDoc.edges
    .filter(e => e.type === 'located_at' && e.target === locationId && e.source !== characterId)
    .map(e => refreshedDoc.nodes.find(n => n.id === e.source))
    .filter((n): n is GameNode => n !== undefined && n.type === 'character' && isActive(n))
    .map(n => ({ id: n.id, title: n.title }));

  return {
    previous_location,
    new_location: {
      id: location.id,
      title: location.title,
      description: location.description,
      atmosphere: location.properties?.atmosphere,
      danger_level: location.properties?.danger_level,
    },
    npcs_present,
  };
}

// ─── 6. Advance Time ──────────────────────────────────────────────────

export interface AdvanceTimeResult {
  events_triggered: string[];
  npc_movements: Array<{ npc: string; from: string | null; to: string }>;
  blocks_resolved: string[];
}

/**
 * Advance game time. Checks for NPC agenda items,
 * pending consequences, and time-sensitive storylets.
 * Returns a summary of what changed in the world.
 */
export async function advanceTime(
  store: WorldStore,
): Promise<AdvanceTimeResult> {
  const doc = await store.getDocument();
  const events_triggered: string[] = [];
  const npc_movements: AdvanceTimeResult['npc_movements'] = [];
  const blocks_resolved: string[] = [];

  // Check for NPCs with DESIRES edges to objectives that have SERVES progress
  // (NPCs react to player progress)
  const objectivesWithProgress = new Set<string>();
  for (const edge of doc.edges) {
    if (edge.type === 'serves') objectivesWithProgress.add(edge.target);
  }

  for (const edge of doc.edges) {
    if (edge.type === 'desires' && objectivesWithProgress.has(edge.target)) {
      const npc = doc.nodes.find(n => n.id === edge.source);
      const obj = doc.nodes.find(n => n.id === edge.target);
      if (npc && obj && npc.type === 'character') {
        events_triggered.push(`${npc.title} is aware of progress toward "${obj.title}"`);
      }
    }
  }

  // Check for NPCs with FEARS edges to things the player now KNOWS
  const playerKnows = new Set(
    doc.edges.filter(e => e.type === 'knows' && e.source === doc.player.character_id).map(e => e.target)
  );

  for (const edge of doc.edges) {
    if (edge.type === 'fears') {
      const npc = doc.nodes.find(n => n.id === edge.source);
      if (npc && npc.type === 'character' && playerKnows.has(edge.target)) {
        const feared = doc.nodes.find(n => n.id === edge.target);
        if (feared) {
          events_triggered.push(`${npc.title} is nervous — the player knows about "${feared.title}"`);
        }
      }
    }
  }

  // Increment session count
  doc.player.session_count += 1;
  const json = JSON.stringify(doc, null, 2);
  const tmpPath = store['filePath'] + '.tmp';
  const fs = await import('node:fs');
  await fs.promises.writeFile(tmpPath, json, 'utf-8');
  await fs.promises.rename(tmpPath, store['filePath']);

  return { events_triggered, npc_movements, blocks_resolved };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/f.god/Work/RPG
git add mcp-server/src/narrative.ts
git commit -m "feat: narrative tools — investigate, interview_npc, research, move_to, advance_time"
```

---

### Task 3: Add tool definitions and handlers to server.ts

**Files:**
- Modify: `mcp-server/src/server.ts`

Add 6 new tool definitions to the TOOLS array and 6 new case handlers in the switch block.

- [ ] **Step 1: Add import for narrative module**

At the top of `server.ts`, after the existing imports, add:

```typescript
import {
  logEvent, investigate, interviewNpc, research, moveToLocation, advanceTime,
} from './narrative.js';
```

- [ ] **Step 2: Add 6 tool definitions to the TOOLS array**

Insert before the closing `];` of the TOOLS array (after the `find_conflicts` tool definition):

```typescript
  // ─── Narrative Tools ──────────────────────────────────────────────
  {
    name: 'log_event',
    description: 'Record a narrative event. Creates an EVENT node with a THEREFORE or BUT edge from the causing event. All participants get WITNESSED edges. Call this after every significant action to build the causal chain.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Short event title (e.g., "Alyssa discovers sealed case files")' },
        description: { type: 'string', description: 'What happened, in narrative terms' },
        causal_type: { type: 'string', enum: ['therefore', 'but'], description: 'THEREFORE = consequence, BUT = complication/reversal. Never AND THEN.' },
        caused_by_event_id: { type: 'string', description: 'ID of the event that caused this one (for causal chain)' },
        participant_ids: { type: 'array', items: { type: 'string' }, description: 'IDs of characters who witnessed this event' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags for categorization' },
      },
      required: ['title', 'description', 'causal_type'],
    },
  },
  {
    name: 'investigate',
    description: 'Search a location for clues and evidence. Makes a Perception/Investigation check. Better rolls reveal more. Creates KNOWS edges for discovered clues.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        character_id: { type: 'string', description: 'Character doing the investigating' },
        location_id: { type: 'string', description: 'Location to search' },
        focus: { type: 'string', description: 'What specifically to look for (narrows results)' },
        situational_modifier: { type: 'number', description: 'Bonus/penalty from circumstances' },
      },
      required: ['character_id', 'location_id'],
    },
  },
  {
    name: 'interview_npc',
    description: 'Talk to an NPC to extract information. Social check vs NPC willingness (modified by opinion). NPC only shares what their KNOWS/SUSPECTS edges contain. Opinion shifts based on outcome and approach.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        character_id: { type: 'string', description: 'Character doing the interviewing' },
        npc_id: { type: 'string', description: 'NPC to interview' },
        topic: { type: 'string', description: 'What to ask about (filters NPC knowledge)' },
        approach: { type: 'string', enum: ['friendly', 'intimidating', 'deceptive'], description: 'Interview approach — affects skill used and opinion change' },
      },
      required: ['character_id', 'npc_id'],
    },
  },
  {
    name: 'research',
    description: 'Research a topic through records, archives, or databases. Intellect/Research check. Searches all clues matching the topic that the player hasn\'t discovered yet.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        character_id: { type: 'string', description: 'Character doing the research' },
        topic: { type: 'string', description: 'What to research (e.g., "Umbrella Corporation", "Arklay attacks")' },
        location_id: { type: 'string', description: 'Where the research happens (optional, for context)' },
        situational_modifier: { type: 'number', description: 'Bonus/penalty from circumstances' },
      },
      required: ['character_id', 'topic'],
    },
  },
  {
    name: 'move_to_location',
    description: 'Move the player to a new location. Updates LOCATED_AT edge. Returns new location details and NPCs present.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        character_id: { type: 'string', description: 'Character to move' },
        location_id: { type: 'string', description: 'Destination location ID' },
      },
      required: ['character_id', 'location_id'],
    },
  },
  {
    name: 'advance_time',
    description: 'Advance game time. Checks NPC agendas, pending consequences, and world reactions to player progress. Call between major scenes or at session boundaries.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
```

- [ ] **Step 3: Add 6 case handlers in the switch block**

Insert before the `default:` case in the switch block:

```typescript
      // ─── Narrative Tools ────────────────────────────────────────────

      case 'log_event': {
        if (!args.title) return text({ error: 'title is required' });
        if (!args.description) return text({ error: 'description is required' });
        if (!args.causal_type || !['therefore', 'but'].includes(args.causal_type as string)) {
          return text({ error: 'causal_type must be "therefore" or "but"' });
        }

        const result = await logEvent(store, {
          title: args.title as string,
          description: args.description as string,
          causal_type: args.causal_type as 'therefore' | 'but',
          caused_by_event_id: args.caused_by_event_id as string | undefined,
          participant_ids: args.participant_ids as string[] | undefined,
          tags: args.tags as string[] | undefined,
        });

        return text({
          event: result.event,
          causal_edge: result.causal_edge,
          witnessed_count: result.witnessed_edges.length,
        });
      }

      case 'investigate': {
        if (!args.character_id) return text({ error: 'character_id is required' });
        if (!args.location_id) return text({ error: 'location_id is required' });

        const result = await investigate(store, {
          character_id: args.character_id as string,
          location_id: args.location_id as string,
          focus: args.focus as string | undefined,
          situational_modifier: args.situational_modifier as number | undefined,
        });

        return text({
          ...result,
          clues_found: result.clues_found.map(c => ({
            id: c.id, title: c.title, description: c.description, type: c.type,
          })),
        });
      }

      case 'interview_npc': {
        if (!args.character_id) return text({ error: 'character_id is required' });
        if (!args.npc_id) return text({ error: 'npc_id is required' });

        const result = await interviewNpc(store, {
          character_id: args.character_id as string,
          npc_id: args.npc_id as string,
          topic: args.topic as string | undefined,
          approach: args.approach as 'friendly' | 'intimidating' | 'deceptive' | undefined,
        });

        return text(result);
      }

      case 'research': {
        if (!args.character_id) return text({ error: 'character_id is required' });
        if (!args.topic) return text({ error: 'topic is required' });

        const result = await research(store, {
          character_id: args.character_id as string,
          topic: args.topic as string,
          location_id: args.location_id as string | undefined,
          situational_modifier: args.situational_modifier as number | undefined,
        });

        return text(result);
      }

      case 'move_to_location': {
        if (!args.character_id) return text({ error: 'character_id is required' });
        if (!args.location_id) return text({ error: 'location_id is required' });

        const result = await moveToLocation(
          store,
          args.character_id as string,
          args.location_id as string,
        );

        return text(result);
      }

      case 'advance_time': {
        const result = await advanceTime(store);
        return text(result);
      }
```

- [ ] **Step 4: Verify it compiles**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/f.god/Work/RPG
git add mcp-server/src/server.ts
git commit -m "feat: add 6 narrative tools — log_event, investigate, interview_npc, research, move_to, advance_time"
```

---

### Task 4: Build and verify

**Files:** None (build step)

- [ ] **Step 1: Build the server**

Run: `cd /Users/f.god/Work/RPG/mcp-server && npm run build`
Expected: `dist/index.js` created, no errors.

- [ ] **Step 2: Test the server starts and lists all 19 tools**

Run: `cd /Users/f.god/Work/RPG && echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node ./mcp-server/dist/index.js --file ./world.rpg 2>/dev/null | head -1`
Expected: JSON response with server info. The `world.rpg` file should NOT be modified (it already exists).

- [ ] **Step 3: Verify world.rpg is intact**

Run: `node -e "const d=JSON.parse(require('fs').readFileSync('world.rpg','utf-8')); console.log('Nodes:', d.nodes.length, 'Edges:', d.edges.length)"`
Expected: Same counts as before (28 nodes, 34 edges). The build must not touch game data.

- [ ] **Step 4: Commit build artifacts note**

```bash
cd /Users/f.god/Work/RPG
git add -A
git commit -m "feat: Phase 2 complete — 19 total MCP tools, narrative loop ready"
```
