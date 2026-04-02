# RPG Graph Engine

A universal RPG engine where the entire game world lives as a typed node/edge graph. Claude narrates; the MCP engine decides outcomes.

## Session Protocol

**Every session, do these things:**

1. **Read `STATE.md`** — it contains what was done last, what's in progress, and what's next.
2. **Update `STATE.md` at the end of every session** — log what was accomplished, decisions made, bugs found, and what to do next.
3. **Update the UPG product graph** (`rpg-engine.upg`) — any new features, bugs, ideas, decisions, or feedback must be recorded as nodes with appropriate edges. The UPG is the source of truth for the product roadmap. Use the `upg-local` MCP tools if available, or write directly to the file if not.

## UPG — Universal Product Graph

The file `rpg-engine.upg` is a product graph that tracks every feature, bug, idea, design decision, and piece of user feedback for this project. It uses the UPG MCP server at `packages/upg-mcp-server/`.

**What goes in the UPG:**
- Features (shipped, planned, proposed) with status and phase
- Bugs and issues with severity and resolution
- Ideas and future concepts
- Design decisions with rationale
- User feedback and validation signals
- Dependencies between features
- Everything belongs to a product area

**Node types we use:** vision, product_area, feature, bug, idea, decision, insight
**Edge types we use:** serves, belongs_to, depends_on, relates_to, resolved_by, informs, validates

**MCP server config:** `upg-local` in `.mcp.json`. If unavailable, edit `rpg-engine.upg` directly — it's JSON with nodes[] and edges[].

## Core Rules

- **The engine decides WHAT happens.** Dice rolls, block resolution, NPC knowledge — all mechanical. Call `attempt_action` for risky actions. NEVER override dice results.
- **Claude decides HOW it's described.** Narrative voice, dialogue, atmosphere — all creative.
- **THEREFORE/BUT only.** Every event connects to the next via consequence (therefore) or complication (but). Never "and then." Use `log_event` to record the causal chain.
- **NPCs only know what their edges say.** Check KNOWS/SUSPECTS edges before having an NPC share information. Use `interview_npc` for dialogue that reveals information. When `interview_npc` returns a `do_not_reference` list, the NPC MUST NOT mention, allude to, or obliquely reference ANY item on that list — even if it would make narrative sense. The player connects dots; NPCs don't connect them for the player.
- **Voice NPCs per their voice guides.** Every NPC has cadence, vocabulary, tics, and formality in their properties. Follow them.

## MCP Servers

### rpg-engine (Game Engine)
22 tools for gameplay:
- CRUD: `create_node`, `get_node`, `update_node`, `delete_node`, `list_nodes`, `search_nodes`
- Edges: `create_edge`, `delete_edge`
- Mechanics: `attempt_action`
- Context: `get_scene_context`
- Queries: `trace_blocks`, `detect_neglect`, `find_conflicts`
- Narrative: `log_event`, `investigate`, `interview_npc`, `research`, `move_to_location`, `advance_time`
- Campaigns: `list_campaigns`, `new_campaign`, `load_campaign`

### upg-local (Product Graph)
Product tracking tools for development sessions. Use to query and update features, bugs, ideas, decisions.

## Slash Commands

- `/new-game` — Create a new campaign with guided onboarding (fugue state design)
- `/load-game` — Resume a saved campaign
- `/save-game` — Save current game state with narrative snapshot

## Graph Schema

14 node types: character, location, item, clue, event, objective, faction, trait, storylet, skill, macguffin, scene, thought, world_rule

18 edge types: therefore, but, blocks, resolves, desires, fears, believes, knows, suspects, opinion, has_trait, located_at, belongs_to, carries, requires, threatens, serves, witnessed

## Files

- `world.rpg` — Active game state (JSON graph)
- `rpg-engine.upg` — Product graph (features, bugs, ideas, roadmap)
- `campaigns/` — Saved campaign files
- `mcp-server/` — TypeScript MCP server source
- `packages/` — UPG core + MCP server
- `STATE.md` — Session state log (read first, update last)
- `docs/` — Specs, plans, debug logs
