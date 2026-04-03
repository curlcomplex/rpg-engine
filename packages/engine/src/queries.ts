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
  const objectivesWithProgress = new Set<string>();
  for (const edge of doc.edges) {
    if (edge.type === 'serves') objectivesWithProgress.add(edge.target);
  }
  const orphan_objectives = doc.nodes
    .filter(n => n.type === 'objective' && isActive(n) && !objectivesWithProgress.has(n.id))
    .map(n => ({ id: n.id, title: n.title }));

  const blockedThings = new Set<string>();
  for (const edge of doc.edges) {
    if (edge.type === 'blocks') blockedThings.add(edge.target);
  }
  const unblocked_macguffins = doc.nodes
    .filter(n => n.type === 'macguffin' && isActive(n) && !blockedThings.has(n.id))
    .map(n => ({ id: n.id, title: n.title }));

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
    knows: string[];
    suspects: string[];
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
      const knows = doc.edges
        .filter(e => e.type === 'knows' && e.source === npc.id)
        .map(e => findNode(doc, e.target)?.title || 'unknown');
      const suspects = doc.edges
        .filter(e => e.type === 'suspects' && e.source === npc.id)
        .map(e => findNode(doc, e.target)?.title || 'unknown');

      npcs_present.push({
        id: npc.id,
        title: npc.title,
        opinion_of_player: (opinionEdge?.properties?.weight as number) ?? null,
        desires,
        fears,
        knows,
        suspects,
      });
    }
  }

  const active_objectives = doc.nodes
    .filter(n => n.type === 'objective' && isActive(n))
    .map(n => ({ id: n.id, title: n.title, status: n.status }));

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

// ─── 5. Check Narrative Health ─────────────────────────────────────────

export interface NarrativeHealth {
  event_count: number;
  therefore_count: number;
  but_count: number;
  therefore_but_ratio: string;
  causal_chain_length: number;
  orphan_events: Array<{ id: string; title: string }>;
  tension_level: number;
  tension_trend: 'rising' | 'falling' | 'stable' | 'no_data';
  current_act: number;
  current_beat: string;
  neglected_objectives: Array<{ id: string; title: string }>;
  unresolved_threats: Array<{ id: string; source: string; target: string }>;
  diagnosis: string[];
}

/**
 * Analyse the narrative health of the current game.
 * Checks therefore/but balance, causal chain integrity, tension trends,
 * neglected plotlines, and unresolved threats. Returns a diagnosis.
 */
export function checkNarrativeHealth(doc: WorldDocument): NarrativeHealth {
  const events = doc.nodes.filter(n => n.type === 'event');
  const event_count = events.length;

  // Count causal edge types
  const therefore_count = doc.edges.filter(e => e.type === 'therefore').length;
  const but_count = doc.edges.filter(e => e.type === 'but').length;
  const total_causal = therefore_count + but_count;
  const therefore_but_ratio = total_causal === 0
    ? 'no events yet'
    : `${therefore_count}:${but_count} (${Math.round(but_count / total_causal * 100)}% complications)`;

  // Find longest causal chain (walk THEREFORE/BUT edges from any event without incoming causal edges)
  const hasIncomingCausal = new Set<string>();
  for (const edge of doc.edges) {
    if (edge.type === 'therefore' || edge.type === 'but') {
      hasIncomingCausal.add(edge.target);
    }
  }
  const rootEvents = events.filter(e => !hasIncomingCausal.has(e.id));

  function walkChain(nodeId: string, visited: Set<string>): number {
    let max = 0;
    for (const edge of doc.edges) {
      if ((edge.type === 'therefore' || edge.type === 'but') && edge.source === nodeId && !visited.has(edge.target)) {
        visited.add(edge.target);
        max = Math.max(max, 1 + walkChain(edge.target, visited));
      }
    }
    return max;
  }

  let causal_chain_length = 0;
  for (const root of rootEvents) {
    const visited = new Set([root.id]);
    causal_chain_length = Math.max(causal_chain_length, walkChain(root.id, visited));
  }

  // Orphan events — events with no causal edges in either direction
  const eventsWithCausal = new Set<string>();
  for (const edge of doc.edges) {
    if (edge.type === 'therefore' || edge.type === 'but') {
      eventsWithCausal.add(edge.source);
      eventsWithCausal.add(edge.target);
    }
  }
  const orphan_events = events
    .filter(e => !eventsWithCausal.has(e.id))
    .map(e => ({ id: e.id, title: e.title }));

  // Tension — compute from threats, negative opinions, blocks on player
  const playerId = doc.player.character_id;
  const activeThreats = doc.edges.filter(e => e.type === 'threatens').length;
  const negativeOpinions = doc.edges.filter(
    e => e.type === 'opinion' && e.target === playerId && ((e.properties?.weight as number) ?? 0) < -20
  ).length;
  const playerBlocks = doc.edges.filter(e => e.type === 'blocks' && e.target === playerId).length;
  const tension_level = Math.min(10, activeThreats * 2 + negativeOpinions + playerBlocks);

  // Tension trend — compare recent events' timestamps to see if threats are increasing
  const recentEvents = events
    .filter(e => e.properties?.timestamp)
    .sort((a, b) => (b.properties!.timestamp as string).localeCompare(a.properties!.timestamp as string))
    .slice(0, 5);

  let tension_trend: NarrativeHealth['tension_trend'] = 'no_data';
  if (recentEvents.length >= 3) {
    const recentButs = recentEvents.filter(e => e.properties?.causal_type === 'but').length;
    if (recentButs >= 3) tension_trend = 'rising';
    else if (recentButs >= 1) tension_trend = 'stable';
    else tension_trend = 'falling';
  }

  // Neglected objectives
  const objectivesWithProgress = new Set<string>();
  for (const edge of doc.edges) {
    if (edge.type === 'serves') objectivesWithProgress.add(edge.target);
  }
  const neglected_objectives = doc.nodes
    .filter(n => n.type === 'objective' && isActive(n) && !objectivesWithProgress.has(n.id))
    .map(n => ({ id: n.id, title: n.title }));

  // Unresolved threats
  const unresolved_threats = doc.edges
    .filter(e => e.type === 'threatens')
    .map(e => {
      const source = findNode(doc, e.source);
      const target = findNode(doc, e.target);
      return source && target ? { id: e.id, source: source.title, target: target.title } : null;
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  // Diagnosis
  const diagnosis: string[] = [];
  if (event_count === 0) diagnosis.push('No events logged yet. Use log_event after significant actions to build the causal chain.');
  if (orphan_events.length > 0) diagnosis.push(`${orphan_events.length} orphan event(s) — not connected to any causal chain. Every event should link via THEREFORE or BUT.`);
  if (total_causal > 5 && but_count === 0) diagnosis.push('All consequences, no complications. The story needs a BUT — something that goes wrong, reverses, or complicates.');
  if (total_causal > 5 && therefore_count === 0) diagnosis.push('All complications, no consequences. The story needs THEREFORE — logical outcomes of player actions.');
  if (total_causal > 8 && but_count / total_causal < 0.2) diagnosis.push('Very few complications. Story may feel predictable. Introduce reversals and unexpected consequences.');
  if (total_causal > 8 && but_count / total_causal > 0.7) diagnosis.push('Too many complications. Story may feel chaotic. Let some actions succeed cleanly via THEREFORE.');
  if (neglected_objectives.length > 0) diagnosis.push(`${neglected_objectives.length} objective(s) with no progress. Consider nudging the player or having NPCs advance these plotlines.`);
  if (tension_trend === 'falling' && doc.player.current_act < 3) diagnosis.push('Tension is falling before Act 3. Introduce a threat or complication to maintain momentum.');
  if (tension_level <= 1 && doc.player.current_act >= 2) diagnosis.push('Very low tension for Act 2+. Something should be threatening the player or their objectives.');
  if (diagnosis.length === 0) diagnosis.push('Narrative health looks good. Causal chain is intact, tension is appropriate.');

  return {
    event_count,
    therefore_count,
    but_count,
    therefore_but_ratio,
    causal_chain_length,
    orphan_events,
    tension_level,
    tension_trend,
    current_act: doc.player.current_act,
    current_beat: doc.player.current_beat,
    neglected_objectives,
    unresolved_threats,
    diagnosis,
  };
}

// ─── 6. Get NPC Agendas ───────────────────────────────────────────────

export interface NpcAgenda {
  npc: { id: string; title: string };
  desires: Array<{ id: string; title: string; status?: string }>;
  fears: Array<{ id: string; title: string }>;
  opinion_of_player: number | null;
  knows: Array<{ id: string; title: string }>;
  suspects: Array<{ id: string; title: string }>;
  current_location: string | null;
  blocked_by: Array<{ id: string; title: string }>;
  status_summary: string;
}

/**
 * Get what every active NPC is pursuing, afraid of, and positioned to do.
 * This is the drama manager's view of the world — what's in motion
 * independent of the player.
 */
export function getNpcAgendas(doc: WorldDocument): NpcAgenda[] {
  const playerId = doc.player.character_id;
  const npcs = doc.nodes.filter(n => n.type === 'character' && isActive(n) && n.id !== playerId);

  return npcs.map(npc => {
    const desires = doc.edges
      .filter(e => e.type === 'desires' && e.source === npc.id)
      .map(e => {
        const target = findNode(doc, e.target);
        return target ? { id: target.id, title: target.title, status: target.status } : null;
      })
      .filter((d): d is NonNullable<typeof d> => d !== null);

    const fears = doc.edges
      .filter(e => e.type === 'fears' && e.source === npc.id)
      .map(e => {
        const target = findNode(doc, e.target);
        return target ? { id: target.id, title: target.title } : null;
      })
      .filter((f): f is NonNullable<typeof f> => f !== null);

    const opinionEdge = doc.edges.find(e => e.type === 'opinion' && e.source === npc.id && e.target === playerId);
    const opinion_of_player = (opinionEdge?.properties?.weight as number) ?? null;

    const knows = doc.edges
      .filter(e => e.type === 'knows' && e.source === npc.id)
      .map(e => {
        const target = findNode(doc, e.target);
        return target ? { id: target.id, title: target.title } : null;
      })
      .filter((k): k is NonNullable<typeof k> => k !== null);

    const suspects = doc.edges
      .filter(e => e.type === 'suspects' && e.source === npc.id)
      .map(e => {
        const target = findNode(doc, e.target);
        return target ? { id: target.id, title: target.title } : null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    const locationEdge = doc.edges.find(e => e.type === 'located_at' && e.source === npc.id);
    const locationNode = locationEdge ? findNode(doc, locationEdge.target) : null;
    const current_location = locationNode?.title ?? null;

    // What blocks this NPC's desires?
    const desiredIds = new Set(desires.map(d => d.id));
    const blocked_by = doc.edges
      .filter(e => e.type === 'blocks' && desiredIds.has(e.target))
      .map(e => {
        const blocker = findNode(doc, e.source);
        return blocker ? { id: blocker.id, title: blocker.title } : null;
      })
      .filter((b): b is NonNullable<typeof b> => b !== null);

    // Generate a status summary
    const parts: string[] = [];
    if (desires.length > 0) parts.push(`wants: ${desires.map(d => d.title).join(', ')}`);
    if (fears.length > 0) parts.push(`fears: ${fears.map(f => f.title).join(', ')}`);
    if (opinion_of_player !== null) {
      if (opinion_of_player > 30) parts.push('friendly to player');
      else if (opinion_of_player < -30) parts.push('hostile to player');
      else parts.push('neutral to player');
    }
    if (blocked_by.length > 0) parts.push(`blocked by: ${blocked_by.map(b => b.title).join(', ')}`);
    const status_summary = parts.join(' | ');

    return {
      npc: { id: npc.id, title: npc.title },
      desires,
      fears,
      opinion_of_player,
      knows,
      suspects,
      current_location,
      blocked_by,
      status_summary,
    };
  });
}

// ─── 7. Get Available Storylets ────────────────────────────────────────

export interface AvailableStorylet {
  storylet: { id: string; title: string; description?: string };
  requirements_met: Array<{ id: string; title: string }>;
  priority: number;
  one_shot: boolean;
}

/**
 * Find storylets whose REQUIRES edges are all satisfied by the player's
 * current knowledge (KNOWS edges) and world state. Returns them sorted
 * by priority. This is quality-based narrative — content surfaces
 * when the player is ready for it.
 */
export function getAvailableStorylets(doc: WorldDocument): AvailableStorylet[] {
  const playerId = doc.player.character_id;
  const storylets = doc.nodes.filter(n => n.type === 'storylet' && isActive(n));

  // What the player knows
  const playerKnows = new Set(
    doc.edges.filter(e => e.type === 'knows' && e.source === playerId).map(e => e.target)
  );

  // What the player carries
  const playerCarries = new Set(
    doc.edges.filter(e => e.type === 'carries' && e.source === playerId).map(e => e.target)
  );

  // All player-connected node IDs (broad match for requirements)
  const playerHas = new Set([...playerKnows, ...playerCarries]);

  const available: AvailableStorylet[] = [];

  for (const storylet of storylets) {
    const requiresEdges = doc.edges.filter(e => e.type === 'requires' && e.source === storylet.id);

    // If no requirements, it's always available
    if (requiresEdges.length === 0) {
      available.push({
        storylet: { id: storylet.id, title: storylet.title, description: storylet.description },
        requirements_met: [],
        priority: (storylet.properties?.priority as number) ?? 0,
        one_shot: (storylet.properties?.one_shot as boolean) ?? false,
      });
      continue;
    }

    // Check if ALL requirements are met
    const requirements_met: Array<{ id: string; title: string }> = [];
    let allMet = true;

    for (const reqEdge of requiresEdges) {
      if (playerHas.has(reqEdge.target)) {
        const reqNode = findNode(doc, reqEdge.target);
        if (reqNode) requirements_met.push({ id: reqNode.id, title: reqNode.title });
      } else {
        allMet = false;
        break;
      }
    }

    if (allMet) {
      available.push({
        storylet: { id: storylet.id, title: storylet.title, description: storylet.description },
        requirements_met,
        priority: (storylet.properties?.priority as number) ?? 0,
        one_shot: (storylet.properties?.one_shot as boolean) ?? false,
      });
    }
  }

  // Sort by priority descending
  available.sort((a, b) => b.priority - a.priority);
  return available;
}
