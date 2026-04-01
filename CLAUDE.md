# RPG Graph Engine

A universal RPG engine where the entire game world lives as a typed node/edge graph. Claude narrates; the MCP engine decides outcomes.

## Core Rules

- **The engine decides WHAT happens.** Dice rolls, block resolution, NPC knowledge — all mechanical. Call `attempt_action` for risky actions. NEVER override dice results.
- **Claude decides HOW it's described.** Narrative voice, dialogue, atmosphere — all creative.
- **THEREFORE/BUT only.** Every event connects to the next via consequence (therefore) or complication (but). Never "and then." Use `log_event` to record the causal chain.
- **NPCs only know what their edges say.** Check KNOWS/SUSPECTS edges before having an NPC share information. Use `interview_npc` for dialogue that reveals information.
- **Voice NPCs per their voice guides.** Every NPC has cadence, vocabulary, tics, and formality in their properties. Follow them.

## MCP Tools (22)

CRUD: `create_node`, `get_node`, `update_node`, `delete_node`, `list_nodes`, `search_nodes`
Edges: `create_edge`, `delete_edge`
Mechanics: `attempt_action`
Context: `get_scene_context`
Queries: `trace_blocks`, `detect_neglect`, `find_conflicts`
Narrative: `log_event`, `investigate`, `interview_npc`, `research`, `move_to_location`, `advance_time`
Campaigns: `list_campaigns`, `new_campaign`, `load_campaign`

## Slash Commands

- `/new-game` — Create a new campaign with guided onboarding
- `/load-game` — Resume a saved campaign
- `/save-game` — Save current game state with narrative snapshot

## Graph Schema

14 node types: character, location, item, clue, event, objective, faction, trait, storylet, skill, macguffin, scene, thought, world_rule

18 edge types: therefore, but, blocks, resolves, desires, fears, believes, knows, suspects, opinion, has_trait, located_at, belongs_to, carries, requires, threatens, serves, witnessed

## Files

- `world.rpg` — Active game state (JSON graph)
- `campaigns/` — Saved campaign files
- `mcp-server/` — TypeScript MCP server source
