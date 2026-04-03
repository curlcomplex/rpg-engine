import { NODE_TYPES, EDGE_TYPES } from './types.js';

export const TOOL_DEFINITIONS: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }> = [
  // --- CRUD ---
  {
    name: 'create_node',
    description: `Create a game entity. Types: ${NODE_TYPES.join(', ')}. Set parent_id to auto-create an edge to parent.`,
    inputSchema: {
      type: 'object',
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
      type: 'object',
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
      type: 'object',
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
      type: 'object',
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
      type: 'object',
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
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        type: { type: 'string', enum: [...NODE_TYPES], description: 'Filter by type' },
        limit: { type: 'number', description: 'Max results (default 20)' },
      },
      required: ['query'],
    },
  },
  // --- Edges ---
  {
    name: 'create_edge',
    description: `Create a relationship. Types: ${EDGE_TYPES.join(', ')}. If type omitted, inferred from node types.`,
    inputSchema: {
      type: 'object',
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
      type: 'object',
      properties: {
        edge_id: { type: 'string', description: 'Edge ID' },
      },
      required: ['edge_id'],
    },
  },
  // --- Game Mechanics ---
  {
    name: 'attempt_action',
    description: 'Resolve an action with a dice roll. Returns success/failure, margin, narrative hint, and choices on failure. Claude MUST narrate the result — cannot override the outcome.',
    inputSchema: {
      type: 'object',
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
  // --- Scene Context ---
  {
    name: 'get_scene_context',
    description: 'Get everything the narrator needs: player state, location, NPCs present, inventory, active objectives, threats, tension level, current story beat. Call this at the start of each interaction.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  // --- Cascade Queries ---
  {
    name: 'trace_blocks',
    description: 'Trace what a node blocks downstream and what blocks it upstream. Shows the full cascade chain.',
    inputSchema: {
      type: 'object',
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
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'find_conflicts',
    description: 'Find NPCs with competing desires for the same objectives, plus their opinions of each other.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  // --- Narrative Tools ---
  {
    name: 'log_event',
    description: 'Record a narrative event. Creates an EVENT node with a THEREFORE or BUT edge from the causing event. All participants get WITNESSED edges. Call this after every significant action to build the causal chain.',
    inputSchema: {
      type: 'object',
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
      type: 'object',
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
      type: 'object',
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
      type: 'object',
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
      type: 'object',
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
      type: 'object',
      properties: {},
    },
  },
  // --- Campaign Management ---
  {
    name: 'list_campaigns',
    description: 'List all saved campaign files in the campaigns directory.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'new_campaign',
    description: 'Create a new campaign. Saves current campaign first, then creates a fresh world file.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Campaign name (used as filename, e.g., "morrowind-adventure")' },
        title: { type: 'string', description: 'Display title for the world (e.g., "Vvardenfell Chronicles")' },
        genre: { type: 'string', description: 'Genre (e.g., "fantasy", "noir_horror", "sci_fi")' },
        setting: { type: 'string', description: 'Setting description (e.g., "The island of Vvardenfell, Third Era")' },
        tone: { type: 'string', description: 'Narrative tone (e.g., "alien, political, mystical")' },
      },
      required: ['name', 'title'],
    },
  },
  {
    name: 'load_campaign',
    description: 'Switch to an existing campaign. Saves current campaign first.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Campaign name (filename without .rpg extension)' },
      },
      required: ['name'],
    },
  },
  // --- Drama Manager ---
  {
    name: 'check_narrative_health',
    description: 'Analyse narrative health: therefore/but balance, causal chain integrity, tension trends, neglected plotlines, orphan events, unresolved threats. Returns diagnosis with specific recommendations. Call between scenes or when the story feels flat.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_npc_agendas',
    description: 'Get what every active NPC is pursuing, afraid of, knows, and where they are. The drama manager\'s view — what\'s in motion independent of the player. Use to decide NPC actions during advance_time or when the player enters a new location.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_available_storylets',
    description: 'Find storylets whose requirements are satisfied by the player\'s current knowledge and inventory. Quality-based narrative — content surfaces when the player is ready. Use to discover what narrative beats are available right now.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];
