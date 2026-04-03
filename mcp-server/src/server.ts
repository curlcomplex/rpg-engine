import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  WorldStore, VERSION, NODE_TYPES, EDGE_TYPES, EDGE_TYPE_DEFAULTS,
  resolveAction,
  traceBlocks, detectNeglect, findConflicts, getSceneContext,
  checkNarrativeHealth, getNpcAgendas, getAvailableStorylets,
  logEvent, investigate, interviewNpc, research, moveToLocation, advanceTime,
  TOOL_DEFINITIONS,
} from '@rpg-engine/core';
import type { NodeType, EdgeType } from '@rpg-engine/core';
import { promises as fs } from 'node:fs';
import { resolve, basename } from 'node:path';

function text(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function createServer(store: WorldStore) {
  const server = new Server(
    { name: 'rpg-engine', version: VERSION },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOL_DEFINITIONS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
    switch (name) {

      // --- CRUD ---

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

      // --- Edges ---

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

      // --- Game Mechanics ---

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

      // --- Scene Context ---

      case 'get_scene_context': {
        const doc = await store.getDocument();
        const context = getSceneContext(doc);
        return text(context);
      }

      // --- Cascade Queries ---

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

      // --- Narrative Tools ---

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

      // --- Drama Manager ---

      case 'check_narrative_health': {
        const doc = await store.getDocument();
        const result = checkNarrativeHealth(doc);
        return text(result);
      }

      case 'get_npc_agendas': {
        const doc = await store.getDocument();
        const result = getNpcAgendas(doc);
        return text({ npcs: result });
      }

      case 'get_available_storylets': {
        const doc = await store.getDocument();
        const result = getAvailableStorylets(doc);
        return text({ available: result, count: result.length });
      }

      // --- Campaign Management ---

      case 'list_campaigns': {
        const dir = store.getCampaignsDir();
        try {
          const files = await fs.readdir(dir);
          const campaigns = [];
          for (const file of files) {
            if (!file.endsWith('.rpg')) continue;
            const filePath = resolve(dir, file);
            const raw = await fs.readFile(filePath, 'utf-8');
            const doc = JSON.parse(raw);
            const stat = await fs.stat(filePath);
            campaigns.push({
              name: file.replace('.rpg', ''),
              title: doc.world?.title || 'Untitled',
              genre: doc.world?.genre || 'unknown',
              nodes: doc.nodes?.length || 0,
              edges: doc.edges?.length || 0,
              last_modified: stat.mtime.toISOString(),
              is_active: filePath === store.getFilePath(),
            });
          }
          return text({ campaigns, active: basename(store.getFilePath(), '.rpg') });
        } catch {
          return text({ campaigns: [], active: basename(store.getFilePath(), '.rpg') });
        }
      }

      case 'new_campaign': {
        if (!args.name) return text({ error: 'name is required' });
        const campaignName = (args.name as string).toLowerCase().replace(/[^a-z0-9-_]/g, '-');
        const dir = store.getCampaignsDir();
        const newPath = resolve(dir, `${campaignName}.rpg`);

        // Check if already exists
        try {
          await fs.access(newPath);
          return text({ error: `Campaign "${campaignName}" already exists. Use load_campaign to switch to it.` });
        } catch {
          // Good — doesn't exist yet
        }

        // Save current campaign to campaigns dir before switching
        const currentDoc = await store.getDocument();
        const currentName = basename(store.getFilePath(), '.rpg');
        const savePath = resolve(dir, `${currentName}.rpg`);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(savePath, JSON.stringify(currentDoc, null, 2), 'utf-8');

        // Create new world
        const { nanoid } = await import('nanoid');
        const newDoc = {
          rpg_engine_version: VERSION,
          created_at: new Date().toISOString(),
          exported_at: new Date().toISOString(),
          source: { tool: 'rpg-engine-mcp', tool_version: VERSION },
          world: {
            id: `w_${nanoid(16)}`,
            title: (args.title as string) || 'New World',
            genre: (args.genre as string) || undefined,
            setting: (args.setting as string) || undefined,
            tone: (args.tone as string) || undefined,
          },
          player: { character_id: '', session_count: 0, current_act: 1, current_beat: 'opening' },
          nodes: [] as any[],
          edges: [] as any[],
        };

        await fs.writeFile(newPath, JSON.stringify(newDoc, null, 2), 'utf-8');
        store.switchTo(newPath);

        return text({
          created: campaignName,
          world: newDoc.world,
          previous_campaign_saved: currentName,
          message: `New campaign "${campaignName}" created and active. Previous campaign "${currentName}" saved. The world is empty — start building!`,
        });
      }

      case 'load_campaign': {
        if (!args.name) return text({ error: 'name is required' });
        const campaignName = args.name as string;
        const dir = store.getCampaignsDir();
        const loadPath = resolve(dir, `${campaignName}.rpg`);

        // Check it exists
        try {
          await fs.access(loadPath);
        } catch {
          return text({ error: `Campaign "${campaignName}" not found. Use list_campaigns to see available campaigns.` });
        }

        // Save current campaign first
        const currentDoc = await store.getDocument();
        const currentName = basename(store.getFilePath(), '.rpg');
        const savePath = resolve(dir, `${currentName}.rpg`);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(savePath, JSON.stringify(currentDoc, null, 2), 'utf-8');

        // Switch
        store.switchTo(loadPath);
        const loadedDoc = await store.getDocument();

        return text({
          loaded: campaignName,
          world: loadedDoc.world,
          nodes: loadedDoc.nodes.length,
          edges: loadedDoc.edges.length,
          player: loadedDoc.player,
          previous_campaign_saved: currentName,
        });
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
