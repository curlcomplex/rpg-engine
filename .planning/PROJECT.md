# RPG Web MVP

## What This Is

A web app that lets invited players experience the RPG graph engine through a chat interface with a persistent game world. Players sign up with an invite code, enter their Anthropic API key, and play an AI-narrated RPG where NPCs remember everything, every action has consequences, and the world persists across sessions. The target audience is ~10 tech-savvy D&D players connected through a trusted DM friend with Silicon Valley engineering contacts.

## Core Value

Players come back the next day and their world is exactly where they left it — NPCs remember what was said, consequences have cascaded, and the story has real structure. Persistence + memory is the pitch.

## Requirements

### Validated

<!-- Existing capabilities confirmed in codebase -->

- ✓ Graph-based world state with 14 node types and 18 edge types — existing
- ✓ d20 dice engine with 5-tier outcomes and failure-to-choice pattern — existing
- ✓ 25 MCP tools across CRUD, mechanics, narrative, drama, and campaigns — existing
- ✓ Atomic file persistence with mutex locking and stale-write protection — existing
- ✓ Scene context loading (get_scene_context) for full narrator state — existing
- ✓ NPC knowledge isolation via KNOWS/SUSPECTS edges and do_not_reference lists — existing
- ✓ Cascade queries: trace_blocks, detect_neglect, find_conflicts — existing
- ✓ Drama manager: narrative health, NPC agendas, available storylets — existing
- ✓ Event logging with THEREFORE/BUT causal enforcement — existing
- ✓ Campaign file management (list, new, load, save) — existing
- ✓ Fugue state onboarding (new-game v2.1) — existing as slash command
- ✓ Investigation, interview, research mechanics with dice checks — existing

### Active

<!-- New capabilities for web MVP -->

- [ ] Extract game engine into shared package (packages/engine/) usable by both MCP and web
- [ ] Refactor MCP server as thin adapter importing from shared engine
- [ ] NPC document system: structured backstory, voice guides, lie/wound/truth arcs, interaction history on character nodes
- [ ] Bidirectional NPC knowledge: KNOWS edges created from NPC→info when player shares information
- [ ] Web chat interface with real-time streaming narration
- [ ] Sidebar displaying character stats, inventory, location, NPCs present, objectives, tension
- [ ] Invite-code authentication with username/password registration
- [ ] BYO Anthropic API key entry and encrypted server-side storage
- [ ] Claude API integration with tool_use for all 25 game tools
- [ ] Per-user world file storage on disk with session restoration
- [ ] Onboarding flow ported from slash command to server-side system prompt logic
- [ ] Multiple world support with world picker screen
- [ ] "Previously on..." session restoration from graph state
- [ ] Auto-save after each turn with atomic writes
- [ ] Server-side system prompt construction (narrator rules, NPC voices, scene context)
- [ ] Deployment to single VPS (Railway or Fly.io)

### Out of Scope

- Model switching / Haiku for cheap operations — optimize from real usage data later
- NPC sub-agents — single Claude with tools already impressed a 20-year DM
- Mobile app — desktop-first for engineer audience
- Billing, credits, usage tracking — BYO API key eliminates this
- Social features, multiplayer — single-player first
- Admin dashboard, analytics — not needed for 10-user playtest
- Combat system beyond dice checks — existing mechanics sufficient
- Character creation screen — onboarding handles this diegetically

## Context

- **Origin:** TypeScript MCP server built for Claude Code, now being adapted for web
- **Validation:** 20-year DM played for 20 minutes, called it the most engaging RPG experience he's ever had. 3 campaigns created in one playtest session. Multiple users requested iPhone app.
- **Architecture:** Game engine functions (dice, narrative, queries, store) are pure TypeScript underneath the MCP protocol layer. Extracting into a shared package enables both MCP and web adapters.
- **Known bugs to fix during extraction:** duplicate KNOWS edges in investigate, opinion no-op for new NPCs, no updateEdge primitive, monolithic server.ts
- **IP concern:** All game logic, prompts, graph schema, and NPC systems must be server-side only. Frontend is a dumb terminal.
- **Deployment context:** Developer is new to web infrastructure (audio plugin background). Deployment must be explicit and simple.

## Constraints

- **Timeline:** Days to ~2 weeks. Move fast, don't gold-plate.
- **Audience:** ~10 tech-savvy engineers. They can get their own Anthropic API keys.
- **Cost:** Zero infrastructure cost beyond ~$5/month VPS. BYO API key.
- **Stack:** Next.js (frontend + API in one unit), TypeScript throughout, per-user JSON files on disk
- **IP:** All game logic server-side. Frontend sees only chat messages and rendered scene context.
- **Compatibility:** Must maintain MCP server functionality for Claude Code development/testing

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Strip MCP, keep functions | MCP is a protocol for local AI clients — web app calls functions directly | — Pending |
| Shared engine package | Both MCP and web import same logic — one codebase, two adapters | — Pending |
| Next.js monolith | Frontend + API in one deployable unit, simplest for solo dev | — Pending |
| Per-user JSON files on disk | Matches existing WorldStore, no database needed for 10 users | — Pending |
| BYO API key | Eliminates billing infrastructure, users eat their own costs | — Pending |
| Invite codes for auth | Simplest gating mechanism, exclusive-feeling for playtest | — Pending |
| SSE for streaming | Simpler than WebSocket for one-way server→client narration streaming | — Pending |
| NPC docs in node properties | Keeps everything in the graph — no separate files needed | — Pending |

---
*Last updated: 2026-04-03 after initialization*
