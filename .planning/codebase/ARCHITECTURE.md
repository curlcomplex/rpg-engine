# Architecture

**Analysis Date:** 2026-04-03

## Pattern Overview

**Overall:** Graph-native MCP server — a single flat JSON graph (nodes + edges) stored on disk, exposed as a stateless Model Context Protocol server. Claude acts as the narrator/orchestrator; the server handles all mechanics, persistence, and world state queries.

**Key Characteristics:**
- All game state lives as typed nodes and edges in a single `WorldDocument` JSON file
- Stateless server — every request reads from disk; write operations use a promise-queue mutex
- Separation of powers: the engine decides outcomes (dice, queries, graph mutations), Claude decides narration
- No in-memory cache — `getDocument()` always reads from disk, making the graph the single source of truth
- Atomic writes via tmp-file + rename; node-count safety guard prevents stale-read overwrites

## Layers

**Entry Point:**
- Purpose: Parse CLI args, instantiate `WorldStore`, wire MCP transport
- Location: `mcp-server/src/index.ts`
- Contains: `main()` bootstrap, arg parsing, `StdioServerTransport` setup
- Depends on: `store.ts`, `server.ts`, `@modelcontextprotocol/sdk`
- Used by: Process invocation via `node dist/index.js --file world.rpg --campaigns ./campaigns`

**Server (Tool Registry + Dispatcher):**
- Purpose: Declare all 25 MCP tools and dispatch `CallToolRequest` to the appropriate handler
- Location: `mcp-server/src/server.ts`
- Contains: `TOOLS` array (tool definitions with JSON schemas), `createServer()` factory, `switch` dispatcher, `text()` response helper
- Depends on: `store.ts`, `types.ts`, `dice.ts`, `queries.ts`, `narrative.ts`
- Used by: `index.ts`

**Persistence (WorldStore):**
- Purpose: All disk I/O and node/edge mutation with mutex-serialized read-modify-write cycles
- Location: `mcp-server/src/store.ts`
- Contains: `WorldStore` class — `read()`, `write()`, `addNode()`, `updateNode()`, `removeNode()`, `addEdge()`, `removeEdge()`, `getDocument()`, `updatePlayer()`, `switchTo()`
- Depends on: `types.ts`, `nanoid`
- Used by: `server.ts`, `narrative.ts`

**Schema / Constants:**
- Purpose: All type definitions, enum constants, and edge inference defaults
- Location: `mcp-server/src/types.ts`
- Contains: `NODE_TYPES` (14), `EDGE_TYPES` (18), `EDGE_TYPE_DEFAULTS` (infer edge from source:target pair), `GameNode`, `GameEdge`, `WorldDocument` interfaces, `STAT_NAMES`, status constants
- Depends on: nothing
- Used by: all other modules

**Dice / Mechanics:**
- Purpose: Pure dice rolling and skill check resolution — no I/O
- Location: `mcp-server/src/dice.ts`
- Contains: `rollD20()`, `resolveCheck()`, `resolveAction()`, `getStatValue()`, `getSkillModifier()`, `DiceResult`, `ActionResult`
- Depends on: `types.ts`
- Used by: `server.ts`, `narrative.ts`

**Narrative Tools:**
- Purpose: Composite operations that combine graph mutations with dice rolls — each is a named gameplay action
- Location: `mcp-server/src/narrative.ts`
- Contains: `logEvent()`, `investigate()`, `interviewNpc()`, `research()`, `moveToLocation()`, `advanceTime()`
- Depends on: `store.ts`, `types.ts`, `dice.ts`
- Used by: `server.ts`

**Query Engine:**
- Purpose: Read-only graph analysis — pure functions over `WorldDocument`, no I/O
- Location: `mcp-server/src/queries.ts`
- Contains: `traceBlocks()`, `detectNeglect()`, `findConflicts()`, `getSceneContext()`, `checkNarrativeHealth()`, `getNpcAgendas()`, `getAvailableStorylets()`
- Depends on: `types.ts`
- Used by: `server.ts`

## Data Flow

**Typical Read Query (e.g., `get_scene_context`):**

1. Claude calls `get_scene_context` via MCP
2. `server.ts` dispatcher routes to `get_scene_context` case
3. `store.getDocument()` reads `world.rpg` from disk (fresh parse each time)
4. `getSceneContext(doc)` in `queries.ts` performs pure in-memory graph traversal
5. Result JSON-serialized and returned as MCP text content

**Mutation Operation (e.g., `create_node`):**

1. Claude calls `create_node` with type, title, optional parent_id
2. `server.ts` validates args, generates ID via `store.nodeId()` (nanoid)
3. `store.addNode()` acquires mutex via promise-queue, reads disk, appends node, writes atomically
4. If `parent_id` provided: edge type inferred from `EDGE_TYPE_DEFAULTS` map, `store.addEdge()` called
5. Returns created node JSON

**Composite Narrative Action (e.g., `interview_npc`):**

1. Claude calls `interview_npc` with character_id, npc_id, topic, approach
2. `server.ts` routes to `interviewNpc()` in `narrative.ts`
3. `narrative.ts` reads doc, resolves social skill check via `dice.ts`
4. Filters NPC's `knows`/`suspects` edges by topic and dice outcome
5. Creates `knows` edges for player on discovered information
6. Builds `do_not_reference` exclusion list (player knows but NPC doesn't)
7. Updates NPC opinion edge (remove old, add new with adjusted weight)
8. Returns dice result, information_shared, do_not_reference, narrative_hint

**Campaign Switch (`load_campaign`):**

1. Saves current `WorldDocument` to `campaigns/<name>.rpg`
2. Calls `store.switchTo(newPath)` — updates internal `filePath` pointer
3. All subsequent reads/writes target the new file

## Key Abstractions

**WorldDocument:**
- Purpose: The entire game world — one flat JSON object with `world` metadata, `player` state, `nodes[]`, and `edges[]`
- Examples: `world.rpg`, `campaigns/raccoon-city.rpg`
- Pattern: Read whole doc → mutate in memory → write whole doc (no partial updates)

**GameNode:**
- Purpose: Any entity in the game world — character, location, item, clue, event, objective, faction, trait, storylet, skill, macguffin, scene, thought, world_rule
- Schema: `{ id, type, title, description?, tags?, status?, properties?, created_at, updated_at }`
- Pattern: `properties` is an open `Record<string, unknown>` — type-specific data (stats, voice guides, atmosphere) lives here

**GameEdge:**
- Purpose: A directional relationship between two nodes — encodes game logic (knows, blocks, desires, therefore, etc.)
- Schema: `{ id, source, target, type, properties?, created_at }`
- Pattern: Edges ARE the game logic. NPC knowledge = `knows` edges. Character location = `located_at` edge. Story causality = `therefore`/`but` edges.

**WorldStore (Mutex Queue):**
- Purpose: Serializes concurrent write operations via a promise-chain lock
- Pattern: `private lockQueue: Promise<void>` — each write appends to the chain; no external locking library needed

**EDGE_TYPE_DEFAULTS:**
- Purpose: Infer the correct edge type from source node type + target node type
- Location: `mcp-server/src/types.ts` at `EDGE_TYPE_DEFAULTS`
- Pattern: `'character:location': 'located_at'` — used in `create_node` (parent_id) and `create_edge` (when type omitted)

## Entry Points

**MCP Server Process:**
- Location: `mcp-server/src/index.ts` (compiled to `mcp-server/dist/index.js`)
- Triggers: Claude Desktop / Claude Code loads it via `.mcp.json` on session start
- Responsibilities: Parse `--file` and `--campaigns` args, create `WorldStore`, bind `StdioServerTransport`

**MCP Config:**
- Location: `.mcp.json`
- Defines two servers: `rpg-engine` (game) pointing to `world.rpg` + `campaigns/`, and `upg-local` (product graph) pointing to `rpg-engine.upg`

## Error Handling

**Strategy:** All tool handlers are wrapped in a top-level `try/catch` in `server.ts`. Errors are returned as `text({ error: String(err) })` — never thrown to the MCP transport layer.

**Patterns:**
- Missing required args: early return with `text({ error: 'field is required' })` before any I/O
- Node not found: return `text({ error: 'Node not found' })` — no throw
- Write safety guard: `store.write()` throws if the new doc has fewer nodes than disk (stale-read protection) — this is the one path that can surface as a caught error
- `removeNode()` bypasses the node-count safety check intentionally, writing directly to avoid false positives on legitimate deletes

## Cross-Cutting Concerns

**Logging:** None — this is a stdio MCP server. Errors go to `process.stderr` only at startup failure (`index.ts`). No runtime logging.

**Validation:** Inline in `server.ts` dispatch cases. Types validated against `NODE_TYPES`/`EDGE_TYPES` enums. No schema validation library.

**Authentication:** Not applicable — local process, stdio transport. No network exposure.

**ID Generation:** `nanoid(16)` prefixed with `n_` (nodes) or `e_` (edges). Generated by `WorldStore.nodeId()` and `WorldStore.edgeId()`.

**Timestamps:** ISO 8601 strings. `created_at` set on creation; `updated_at` set on every `updateNode()` call. `exported_at` set on every `write()`.

---

*Architecture analysis: 2026-04-03*
