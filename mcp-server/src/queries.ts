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
