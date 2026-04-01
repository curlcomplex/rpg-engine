import type { WorldDocument, GameNode, GameEdge, EdgeType } from './types.js';
import { ACTIVE_STATUSES } from './types.js';
import { WorldStore } from './store.js';
import { resolveCheck, rollD20, getSkillModifier } from './dice.js';

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

// ─── 2. Investigate ────────────────────────────────────────────────────

export interface InvestigateParams {
  character_id: string;
  location_id: string;
  focus?: string;
  situational_modifier?: number;
}

export interface InvestigateResult {
  dice: ReturnType<typeof resolveCheck>;
  clues_found: GameNode[];
  new_edges: GameEdge[];
  narrative_hint: string;
}

/**
 * Search a location for clues. Perception check determines quality of findings.
 * On success, reveals CLUE nodes that are LOCATED_AT the target location.
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

  let revealCount: number;
  let narrative_hint: string;

  switch (dice.outcome) {
    case 'critical_success':
      revealCount = relevantClues.length;
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
  dice: ReturnType<typeof resolveCheck>;
  npc_title: string;
  npc_opinion: number;
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

  // DC based on NPC's willingness (positive opinion = easier)
  const baseDc = 12;
  const opinionModifier = Math.floor(npc_opinion / 20);
  const dc = Math.max(5, Math.min(20, baseDc - opinionModifier));

  // Choose skill based on approach
  const skillMap: Record<string, string> = {
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

  // Update NPC opinion via remove + re-add
  if (opinion_change !== 0 && opinionEdge) {
    const newWeight = Math.max(-100, Math.min(100, npc_opinion + opinion_change));
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
  dice: ReturnType<typeof resolveCheck>;
  findings: Array<{ id: string; title: string; type: string }>;
  new_edges: GameEdge[];
  narrative_hint: string;
}

/**
 * Research a topic via records, archives, or databases.
 * Intellect/research check. Searches all CLUE/MACGUFFIN nodes matching the topic.
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
 * Advance game time. Checks for NPC reactions to player progress,
 * NPCs aware of things the player knows, and increments session count.
 */
export async function advanceTime(
  store: WorldStore,
): Promise<AdvanceTimeResult> {
  const doc = await store.getDocument();
  const events_triggered: string[] = [];
  const npc_movements: AdvanceTimeResult['npc_movements'] = [];
  const blocks_resolved: string[] = [];

  // Check for NPCs with DESIRES edges to objectives that have SERVES progress
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

  // Increment session count via the store's proper write path
  await store.updatePlayer({ session_count: doc.player.session_count + 1 });

  return { events_triggered, npc_movements, blocks_resolved };
}
