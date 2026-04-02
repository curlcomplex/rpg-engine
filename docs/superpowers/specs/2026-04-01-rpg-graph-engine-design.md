# RPG Graph Engine — Design Spec

## Vision

A universal RPG engine where the entire game world — characters, locations, quests, items, events, relationships — lives as a typed node/edge graph. The graph is both persistent memory and game logic. Claude narrates; the engine decides outcomes. Any genre, any setting, seeded by player onboarding.

First test world: **Raccoon City, 1998** — an investigative journalist uncovering the Umbrella conspiracy.

## Core Principle: Separation of Powers

- **The MCP Engine** decides WHAT happens (dice rolls, block resolution, NPC goal pursuit, consequence cascades)
- **Claude** decides HOW it's described (narrative voice, NPC dialogue, atmosphere)
- Claude cannot override the engine. The graph is the source of truth.

## Core Narrative Rule: Therefore/But

Every event-to-event connection must be either:
- **THEREFORE** — logical causal consequence
- **BUT** — complication or reversal

Never "AND THEN." This is enforced as a graph validation rule. (Trey Parker / Matt Stone principle.)

## Architecture

```
Player ←→ Claude (Narrator) ←→ MCP Server (Engine) ←→ world.rpg (Graph)
                 ↕                      ↓
          NPC Sub-agents         Companion Screen (HTML)
          (Haiku/Sonnet)
```

### MCP Server (TypeScript, LifeGraph pattern)
- Single JSON file persistence (`world.rpg`)
- Stateless tools — every call reads fresh from disk
- File-level mutex locking (same as LifeGraph)
- ~25 MCP tools across CRUD, mechanics, narrative, and drama management

### Claude (The Narrator)
- System prompt loaded with: world rules, tone, active NPC voice guides, current scene context
- MUST respect tool outcomes — cannot override dice rolls or graph state
- Uses THEREFORE/BUT transitions exclusively
- PreToolUse hook validates action consistency

### Companion Screen (HTML)
- Local web UI themed to the game's genre
- Reads directly from graph (not from Claude's narration) — tamper-resistant display
- Shows: character stats, inventory, investigation/evidence board, relationship web, quest tracker, known locations
- Updated after each game action via the engine

### NPC Sub-Agents (Haiku/Sonnet)
- Each NPC is a lightweight sub-agent, not Claude narrating in-character
- Fed ONLY: their backstory doc, voice guide, KNOWS/SUSPECTS edges, DESIRES/FEARS, OPINION of player
- Receives NO world state, no other NPCs' knowledge, no plot structure
- Cannot leak information they don't have — enforced structurally, not by prompt
- Haiku for minor NPCs (fast, cheap), Sonnet for key characters (more nuanced)
- The insular knowledge model mirrors real human cognition — NPCs are believable because they genuinely don't know things
- Claude (narrator) receives NPC sub-agent responses and weaves them into the scene description

### Background Game Clock (Optional)
- Background process that periodically checks graph for time-sensitive NPC agendas
- Surfaces interrupts: "While you were doing X, Y happened"
- Creates sense of living world without real-time pressure

## Graph Schema

### Node Types (14)

| Type | Purpose | Key Properties |
|------|---------|----------------|
| `CHARACTER` | Player + NPCs | stats{}, traits[], voice_doc_ref, lie, wound, truth, faction_rank |
| `LOCATION` | Places in the world | atmosphere, accessibility, danger_level, connected_locations[] |
| `ITEM` | Physical objects | type (weapon/tool/evidence/key/consumable), portable, condition |
| `CLUE` | Discoverable information | content, reliability (confirmed/rumor/planted), source_ref |
| `EVENT` | Things that happened | causal_type (therefore/but), timestamp, participants[] |
| `OBJECTIVE` | Goals/quests | status, priority, visibility (known/hidden/discovered), deadline? |
| `FACTION` | Organizations/groups | power_level, agenda, public_stance, real_stance |
| `TRAIT` | Personality attributes | effect_on_behavior, intensity (1-10) |
| `STORYLET` | Available narrative content | requirements[], priority, one_shot?, content_ref |
| `SKILL` | Player abilities | level, xp, governing_stat, check_modifier |
| `MACGUFFIN` | Plot-critical gates | what_it_blocks[], alternate_paths_hint |
| `SCENE` | Current narrative moment | act (1/2/3), beat (from Save the Cat), tension_level (1-10) |
| `THOUGHT` | Internalized ideas | effect_description, source_event_ref |
| `WORLD_RULE` | Genre/setting constraints | rule_text, enforcement (hard/soft) |

### Edge Types (18)

| Edge | Pattern | Purpose |
|------|---------|---------|
| `THEREFORE` | Event → Event | Direct causal consequence |
| `BUT` | Event → Event | Complication/reversal |
| `BLOCKS` | Any → Any | Progress gate (multiple nodes can resolve same block) |
| `RESOLVES` | Event → Block-edge | Records how a block was removed + which path was taken |
| `DESIRES` | Character → Objective | NPC motivation — what they want |
| `FEARS` | Character → Any | NPC avoidance — what they dread |
| `BELIEVES` | Character → Thought/Lie | Current worldview |
| `KNOWS` | Character → Clue/Event | Confirmed knowledge |
| `SUSPECTS` | Character → Any | Unconfirmed belief |
| `OPINION` | Character → Character | Weighted (-100 to +100), shifts based on events |
| `HAS_TRAIT` | Character → Trait | Personality driver |
| `LOCATED_AT` | Any → Location | Spatial position |
| `BELONGS_TO` | Character → Faction | Membership + role |
| `CARRIES` | Character → Item | Inventory |
| `REQUIRES` | Storylet → Clue/Quality | Unlock conditions for content |
| `THREATENS` | Any → Any | Active danger |
| `SERVES` | Event → Objective | Progress toward a goal |
| `WITNESSED` | Character → Event | Who saw what — enables delayed consequences |

### Document System

Extended context stored as separate files, referenced by node properties:

- **Character backstories** — full history, wound, lie/truth arc, motivations
- **Voice guides** — syntax guidelines for how each NPC speaks (cadence, vocabulary, tics, formality level)
- **Location descriptions** — atmosphere, sensory details, hidden elements
- **Event logs** — version-control-like history of what each character did and when
- **World bible** — genre rules, setting details, technology level, social norms

### ID Format
- Nodes: `n_{nanoid(16)}` (same as LifeGraph)
- Edges: `e_{nanoid(16)}`

### File Format
```json
{
  "rpg_engine_version": "0.1.0",
  "created_at": "ISO timestamp",
  "world": {
    "id": "world_id",
    "title": "Raccoon City Chronicles",
    "genre": "noir_horror",
    "setting": "Raccoon City, 1998",
    "tone": "gritty investigative journalism meets survival horror"
  },
  "player": {
    "character_id": "n_xxx",
    "session_count": 0,
    "current_act": 1,
    "current_beat": "catalyst"
  },
  "nodes": [],
  "edges": []
}
```

## Resolution Engine (Dice System)

### Skill Checks
- Roll d20 + skill modifier + situational modifiers vs difficulty threshold (DC)
- **Critical success** (natural 20): exceptional outcome, bonus consequence
- **Success** (meets/exceeds DC): intended outcome
- **Partial success** (within 3 of DC): succeed but with complication (THEREFORE + BUT)
- **Failure** (below DC): fail, consequence triggers
- **Critical failure** (natural 1): catastrophic outcome, major consequence

### Failure → Choice Pattern
On failure, the engine returns 2-3 options (like RE3 live selections):
```json
{
  "success": false,
  "margin": -3,
  "choices": [
    { "id": "hide", "text": "Duck behind the dumpster", "skill": "stealth", "dc": 8 },
    { "id": "force", "text": "Shoulder the door open", "skill": "strength", "dc": 14 },
    { "id": "flee", "text": "Run before they see you", "skill": "athletics", "dc": 10 }
  ],
  "time_pressure": "Someone is coming downstairs. Choose now."
}
```

### Stats (Base 6, genre-expandable)
- **Physique** — strength, endurance, health
- **Agility** — speed, stealth, reflexes
- **Intellect** — reasoning, memory, investigation
- **Social** — persuasion, intimidation, deception
- **Perception** — awareness, intuition, search
- **Resolve** — willpower, courage, stress resistance

Skills branch from stats (e.g., Intellect → Investigation, Forensics, Research).

## MCP Tools (~25)

### CRUD (6)
- `create_node` — with auto-edge creation (same as LifeGraph)
- `get_node` — returns node + all connected edges with neighbor context
- `update_node` — partial updates, auto-tracks timestamps
- `delete_node` — cascade deletes connected edges
- `create_edge` — with type inference from node types
- `delete_edge`

### Search (2)
- `search_nodes` — full-text search with type/tag filters
- `list_nodes` — paginated listing with filters

### Game Mechanics (5)
- `attempt_action` — dice resolution. Takes action, skill, target, modifiers. Returns outcome + choices on failure
- `use_item` — apply item to situation, checks REQUIRES edges
- `move_to_location` — changes LOCATED_AT, triggers location-based storylets
- `advance_time` — progresses NPC agendas, triggers delayed consequences
- `rest` — recover health/stress, but time passes (NPCs advance)

### Investigation (3)
- `investigate` — search a location/object for clues. Perception check determines quality
- `interview_npc` — dialogue interaction. Checks NPC knowledge (KNOWS edges), opinion, trust. Returns what they'll share based on social check
- `research` — library/records search. Intellect check determines depth of discovery

### Narrative (4)
- `get_scene_context` — everything Claude needs: location, present NPCs, available actions, tension level, active storylets, pending threats
- `get_available_storylets` — pattern-match storylets whose REQUIRES edges are all satisfied
- `present_choices` — show player 2-4 options with brief descriptions (for decision points)
- `log_event` — record what just happened as an EVENT node with THEREFORE/BUT edges

### Drama Manager (5)
- `check_narrative_health` — therefore/but validation, tension curve, arc position
- `trace_blocks` — what's blocking what, cascade downstream (from LifeGraph)
- `get_npc_agendas` — what are all active NPCs currently pursuing
- `detect_neglect` — forgotten plotlines, orphan objectives (from LifeGraph)
- `find_conflicts` — NPCs with competing goals, factions at odds

## Onboarding Flow

The onboarding should feel like the game has already started, not like a character creator menu.

### Preferred approach: Oblique profiling
Instead of asking "what genre do you want?", ask evocative abstract questions that seed the world indirectly:
- "Stone or glass?" "Silence or static?" "A locked door or an open window?"
- "Wood, old metal, new metal?" "Fire, ice, or wind?"
- The answers build a psychological profile that maps to genre, tone, and setting without the player explicitly choosing
- The player discovers what world they built by entering it

### Alternative: Direct selection
For players who prefer explicit control, offer a straightforward genre/role/theme picker as a fallback.

### World generation (either path)
1. **Generate World Seed** — create initial graph: 5-8 locations, 8-12 NPCs (with full backstories + voice docs), 3-5 MacGuffins, central conflict, 2-3 faction tensions
2. **Generate Player Character** — stats, starting skills, starting inventory, initial position. Player character is intentionally a blank slate (minimal backstory) so the player can project onto them. NPCs are deeply characterized; the PC is a vessel.
3. **Generate Opening Scene** — drop player into action at the Catalyst beat. Something is already wrong. Stakes are already present.
4. **First session begins** — no menus, no tutorials. You're in the world.

## Raccoon City Test World

### Setting
Raccoon City, summer 1998. A mid-sized Midwestern American city. Umbrella Corporation is the dominant employer. Strange animal attacks in the Arklay Mountains. Missing hikers. The RPD is understaffed and the police chief is acting odd.

### Player Character
Alyssa Ashcroft (or similar) — investigative journalist for a local paper. Smart, resourceful, stubborn. Starting stats favor Intellect, Perception, Social.

### Key NPCs (each with full backstory doc + voice guide)
- **Ben Bertolucci** — freelance journalist, paranoid, has sources inside RPD
- **Chief Brian Irons** — corrupt police chief, in Umbrella's pocket, erratic
- **Annette Birkin** — Umbrella researcher, conflicted, knows too much
- **Robert Kendo** — gun shop owner, connected to RPD, hears things
- **The Coroner** — overworked, noticed anomalies in the attack victims, scared

### MacGuffins
1. **The Arklay Incident Report** — official police report on the mountain attacks (BLOCKS → understanding the cover-up)
2. **Umbrella Employee Badge** — access to restricted areas (BLOCKS → physical access to labs)
3. **Birkin's Research Notes** — proof of bioweapons program (BLOCKS → exposing Umbrella)
4. **Chief Irons' Financial Records** — proof of corruption (BLOCKS → removing police obstruction)
5. **The Spencer Interview** — endgame goal, getting Spencer on record

Each MacGuffin has 2-4 alternate paths to obtain it.

### Three-Act Structure
- **Act 1** (Journalism): Investigating animal attacks, interviewing witnesses, sensing something wrong. Ends when player discovers the attacks aren't natural.
- **Act 2** (Conspiracy): Following the Umbrella connection, navigating corrupt officials, building a case. Midpoint: someone close to the investigation dies or disappears. Ends when player has enough evidence but realizes the scale.
- **Act 3** (Survival Horror): The situation in Raccoon City deteriorates. Investigations become dangerous. The story shifts from "uncover truth" to "survive and expose." Climax: confronting Spencer or his representatives with evidence.

## Build Sequence

### Phase 1: MCP Server + Graph
- TypeScript MCP server (LifeGraph pattern)
- Graph store with all node/edge types
- CRUD tools
- Basic dice engine
- `get_scene_context` tool

### Phase 2: Narrative Tools
- `attempt_action` with failure → choice pattern
- `investigate`, `interview_npc`, `research`
- `log_event` with THEREFORE/BUT enforcement
- `trace_blocks`, `detect_neglect`

### Phase 3: Drama Manager
- `check_narrative_health`
- `get_npc_agendas`
- `get_available_storylets`
- Tension tracking

### Phase 4: NPC Sub-Agent System
- Agent spawning per NPC with isolated context (backstory + voice + knowledge only)
- Haiku for minor NPCs, Sonnet for key characters
- Interview/dialogue routing through sub-agents
- Knowledge isolation enforcement

### Phase 5: Raccoon City World
- Generate initial world graph
- Write NPC backstory + voice docs
- Define MacGuffin block structure
- Create opening scene

### Phase 6: Companion Screen
- HTML UI served locally
- Character stats display
- Investigation/evidence board
- Themed to noir/horror aesthetic

### Phase 7: Onboarding System
- Oblique profiling question flow
- World generation from player profile
- Universal templates for any setting

### Phase 8: Automated Playtesting
- Sub-agent playtesters with different personas (completionist, speedrunner, chaos agent, rule-breaker)
- Ralph loop for stress-testing (play N sessions, report narrative violations)
- Jailbreak testing (agent that tries to override dice results, sweet-talk Claude)
- Metrics: therefore/but violation rate, NPC knowledge leaks, dice override attempts
