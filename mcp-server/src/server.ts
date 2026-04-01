import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { WorldStore } from './store.js';
import {
  VERSION, NODE_TYPES, EDGE_TYPES, EDGE_TYPE_DEFAULTS,
} from './types.js';
import type { NodeType, EdgeType } from './types.js';
import { resolveAction } from './dice.js';
import { traceBlocks, detectNeglect, findConflicts, getSceneContext } from './queries.js';
import {
  logEvent, investigate, interviewNpc, research, moveToLocation, advanceTime,
} from './narrative.js';

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
];

export function createServer(store: WorldStore) {
  const server = new Server(
    { name: 'rpg-engine', version: VERSION },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
    switch (name) {

      // ─── CRUD ───────────────────────────────────────────────────

      case 'create_node': {
        if (!args.type || !NODE_TYPES.includes(args.type as any))
          return text({ error: `Invalid type. Valid: ${NODE_TYPES.join(', ')}` });
        if (!args.title) return text({ error: 'title is required' });

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
        const doc = await store.getDocument();
        const node = doc.nodes.find(n => n.id === args.node_id);
        if (!node) return text({ error: 'Node not found' });

        const edges = doc.edges.filter(e => e.source === node.id || e.target === node.id);
        const enrichedEdges = edges.map(e => {
          const neighborId = e.source === node.id ? e.target : e.source;
          const neighbor = WorldStore.findNode(doc, neighborId);
          return {
            ...e,
            neighbor_title: neighbor?.title || 'unknown',
            neighbor_type: neighbor?.type || 'unknown',
            direction: e.source === node.id ? 'outgoing' : 'incoming',
          };
        });

        return text({ node, edges: enrichedEdges });
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
        const doc = await store.getDocument();
        const sourceNode = doc.nodes.find(n => n.id === args.source_id);
        const targetNode = doc.nodes.find(n => n.id === args.target_id);
        if (!sourceNode) return text({ error: `Source node ${args.source_id} not found` });
        if (!targetNode) return text({ error: `Target node ${args.target_id} not found` });

        let edgeType = args.type as EdgeType | undefined;
        if (edgeType && !EDGE_TYPES.includes(edgeType as any)) {
          return text({ error: `Invalid edge type. Valid: ${EDGE_TYPES.join(', ')}` });
        }
        if (!edgeType) {
          const key = `${sourceNode.type}:${targetNode.type}`;
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

      default:
        return text({ error: `Unknown tool: ${name}` });
    }
    } catch (err) {
      return text({ error: String(err) });
    }
  });

  return server;
}
