# RPG Web MVP — Design Spec

## Vision

A web app where invited players can play the RPG graph engine through a chat interface with a persistent game world. The goal is to get ~10 tech-savvy D&D players (Silicon Valley engineers, via a trusted DM friend) hooked on the experience and excited about the product.

The competitive pitch: NPCs remember everything, every action has consequences, the world never forgets your progress, and the game has real narrative structure — not just "prompt wrapper around an LLM."

## Constraints

- **Timeline:** Days to ~2 weeks. Move fast, don't gold-plate.
- **Audience:** ~10 tech-savvy D&D/RPG enthusiasts. Engineers who can get their own Anthropic API keys.
- **IP protection:** All game logic, graph schema, prompts, and NPC systems must be server-side only. The frontend is a dumb terminal.
- **Cost:** BYO API key. Zero billing infrastructure.
- **Deployment:** Single VPS. User is new to web infrastructure — deployment must be simple and explicit.

## Architecture

```
Browser (React)                    VPS (Next.js)
┌─────────────────┐               ┌──────────────────────────────┐
│ Chat messages    │◄──WebSocket──►│ API Routes                   │
│ Sidebar (stats,  │               │  ├── Auth (invite codes)     │
│  inventory, etc) │               │  ├── Chat (Claude API proxy) │
│ Settings (API    │               │  ├── Game Engine (25 tools)  │
│  key entry)      │               │  └── World file I/O          │
└─────────────────┘               │                              │
                                  │ /data/users/{id}/            │
                                  │  └── worlds/*.rpg            │
                                  └──────────────────────────────┘
```

### Stack

- **Framework:** Next.js (frontend + API in one deployable unit)
- **Frontend:** React, minimal UI library (chat + sidebar)
- **Backend:** Next.js API routes, calling game engine functions directly
- **AI:** Anthropic Claude API with `tool_use` — the 25 game tools registered as tool definitions
- **Storage:** Per-user world files on disk (JSON, same format as current `world.rpg`)
- **Auth:** Invite codes → username/password → session cookie
- **Deployment:** Railway or Fly.io (~$5/month, deploy via git push)
- **Streaming:** Server-Sent Events for real-time narration (simpler than WebSocket, sufficient for server→client streaming)

### Shared Engine, Two Adapters

The game engine is extracted into a shared package (`packages/engine/`) that both the MCP server and the web app import. Neither presentation layer contains game logic.

```
packages/engine/           ← core game logic (dice, narrative, queries, store, types)
mcp-server/                ← MCP protocol adapter (imports engine)
web/                       ← Next.js web adapter (imports engine)
```

- **MCP server** stays functional — Claude Code development and testing continues as before
- **Web app** imports the same engine functions and calls them when Claude API returns `tool_use` blocks
- New features are built in `packages/engine/` and immediately available to both adapters
- The MCP server becomes a thin translation layer: MCP request → engine function → MCP response
- The web API routes are the same pattern: HTTP request → engine function → HTTP response

## How a Turn Works

1. Player types a message in the chat interface
2. Server receives the message via WebSocket/API call
3. Server calls Anthropic Claude API with:
   - System prompt (narrator rules, separation of powers, therefore/but, NPC voice rules)
   - Conversation history (current session)
   - 25 game tools as tool definitions
   - User's Anthropic API key (stored server-side, encrypted)
4. Claude responds — may include `tool_use` blocks (e.g., `attempt_action`, `interview_npc`)
5. Server executes each tool call against the user's world file
6. Server sends tool results back to Claude for the next response
7. Claude produces the final narration
8. Response streams back to the browser in real-time
9. Sidebar updates with fresh `get_scene_context()` data

## Feature Spec

### 1. Chat Interface

The primary interaction surface. Left panel of the layout.

- Text input at the bottom, messages scroll up
- Player messages styled differently from narrator responses
- Narrator responses stream in token-by-token (not wait-for-complete)
- Dice rolls, skill checks, and mechanical outcomes rendered distinctly (e.g., subtle formatting or a different text style — not breaking the fourth wall, but visually parseable)
- Choice prompts (from failure-to-choice pattern) rendered as clickable options

### 2. Sidebar

Right panel. Read-only display of `get_scene_context()` output, refreshed after every turn.

**Sections:**
- **Character:** Name, stats (physique, agility, intellect, social, perception, resolve), current status
- **Inventory:** Items the character CARRIES (from CARRIES edges)
- **Location:** Current location name, atmosphere, danger level
- **NPCs Present:** Characters at the same location, with opinion indicators (friendly/neutral/hostile)
- **Active Objectives:** Current goals with status
- **Tension:** Visual indicator (0-10) computed from threats + opinions + blocks

The sidebar is a rendering of graph state, not AI-generated content. It reads directly from the world file — tamper-resistant and always accurate.

### 3. NPC Document System (filling the spec gap)

Every NPC character node gets structured properties:

```json
{
  "backstory": "Full history, how they got here, what shaped them",
  "voice": {
    "cadence": "How they pace their speech",
    "vocabulary": "Word choices, education level, regional flavor",
    "tics": "Verbal habits, repeated phrases, physical mannerisms",
    "formality": "How they address the player and others"
  },
  "arc": {
    "lie": "The false belief they operate under",
    "wound": "The past event that created the lie",
    "truth": "What they need to learn or accept"
  },
  "interaction_history": [
    {
      "session": 1,
      "summary": "What happened in this interaction",
      "info_shared_by_npc": ["clue_id_1"],
      "info_shared_by_player": ["topic or clue_id"],
      "opinion_shift": 5,
      "emotional_state": "guarded but curious"
    }
  ]
}
```

**Interaction history grows over time.** After every `interview_npc` call, the server appends to the NPC's `interaction_history`. This means:
- NPCs remember what the player told them (bidirectional knowledge)
- NPCs remember how previous conversations went (emotional continuity)
- The narrator can reference past interactions naturally
- KNOWS edges are created in BOTH directions — NPC→clue AND NPC→player-shared-info

**Voice guides are injected into Claude's context** when narrating NPC dialogue. The system prompt includes the active NPC's voice object so Claude matches their speech pattern.

### 4. Onboarding (New Game)

Ported from the existing `/new-game` slash command (fugue state design):

1. **Vignette** — 3-4 sentences, impressionistic opening, reads the player
2. **Scenario fork** — two short scenes, different worlds, based on player response
3. **Deepened scene** — committed prose in the chosen direction + diegetic commitment gate
4. **World generation** — game engine functions build the world (factions, locations, NPCs with full documents, objectives, macguffins)
5. **Character grounding** — two paths: "Discover" (world reveals character) or "Shape" (player defines character)
6. **Catalyst** — opening scene, first `log_event`, game begins

No fourth wall breaks. No menus. No "pick your class." The player discovers their world by entering it.

The system prompt and onboarding logic live server-side — completely invisible to the player.

### 5. Persistence & Session Management

**World files:** Each user's worlds are stored as `.rpg` JSON files in their user directory. Same format as the current engine — `WorldDocument` with nodes, edges, player state.

**Session restoration:** When a player returns:
1. Load their active world file
2. Call `get_scene_context()` to rebuild narrator state
3. Generate a "Previously on..." summary from recent events in the graph
4. Fresh conversation starts — the graph IS the memory, not the chat history

**Save points:** The game auto-saves after each turn (world file written atomically). Explicit save creates a SCENE node with `save_point: true` capturing act, beat, tension, session summary.

**Multiple worlds:** Players can have multiple campaigns. A world picker screen lets them choose which to continue or start a new one.

### 6. Auth & Access Control

- **Invite codes:** Generated by admin (you). 10-15 codes shared via your DM friend.
- **Registration:** Enter invite code → choose username → set password
- **Sessions:** HTTP-only session cookie. Stays logged in.
- **No OAuth, no magic links, no email.** Simplest possible auth for a closed playtest.

### 7. API Key Management

- **Settings page:** User enters their Anthropic API key
- **Storage:** Encrypted at rest on the server
- **Usage:** Server uses the key for all Claude API calls on that user's behalf
- **Validation:** Test the key on entry (simple API call) to catch typos
- **No billing, no metering, no usage tracking in MVP**

## System Prompt (Server-Side)

The narrator system prompt includes:

1. **Separation of powers** — engine decides what, Claude decides how
2. **Therefore/But rule** — every event connects via consequence or complication
3. **NPC knowledge isolation** — only reference KNOWS/SUSPECTS edges, respect `do_not_reference` lists
4. **Active NPC voice guides** — injected per-scene from character node properties
5. **Current scene context** — from `get_scene_context()`
6. **World rules** — genre constraints, tone, setting details

This prompt is constructed server-side from the world file. The player never sees it.

## Data Model

### User

```
/data/users/{user_id}/
    profile.json          # username, hashed password, created_at
    api_key.enc           # encrypted Anthropic API key
    worlds/
        raccoon-city.rpg  # world graph (WorldDocument JSON)
        vvardenfell.rpg
    active_world.json     # which world is currently loaded
```

### World File (unchanged from current engine)

```json
{
  "rpg_engine_version": "0.2.0",
  "created_at": "ISO timestamp",
  "exported_at": "ISO timestamp",
  "world": { "id", "title", "genre", "setting", "tone" },
  "player": { "character_id", "session_count", "current_act", "current_beat" },
  "nodes": [ /* GameNode[] */ ],
  "edges": [ /* GameEdge[] */ ]
}
```

### Invite Code

Simple JSON file or in-memory list on the server:
```json
{
  "codes": {
    "DRAGON-FIRE-2026": { "used_by": null, "created_at": "..." },
    "SHADOW-QUEST-7X": { "used_by": "user_123", "claimed_at": "..." }
  }
}
```

## What's NOT in MVP

- Model switching (Haiku for cheap operations, Sonnet for narration)
- NPC sub-agents (single Claude with tools is sufficient — already impressed a 20-year DM)
- Mobile app / responsive design (nice to have but not required for desktop-using engineers)
- Social features (sharing, multiplayer)
- Billing, credits, usage tracking
- Admin dashboard
- Analytics
- Combat system beyond dice checks
- Character creation screen (onboarding handles this diegetically)

## Deployment

- **Platform:** Railway or Fly.io
- **Process:** `git push` triggers deploy
- **Cost:** ~$5/month for a single instance
- **Domain:** Custom domain or platform-provided URL
- **SSL:** Handled by platform
- **Persistent storage:** Mounted volume for `/data/users/`

## Success Criteria

The MVP succeeds if:
1. A player can sign up with an invite code, enter their API key, and start a new game within 2 minutes
2. The onboarding creates a world that feels unique and engaging
3. NPCs remember what the player told them across sessions
4. The player can close the browser, come back the next day, and continue exactly where they left off
5. The sidebar shows accurate, live game state
6. At least one of the Silicon Valley playtesters says "I want to keep playing this"
