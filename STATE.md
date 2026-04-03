# RPG Engine — Project State

## Last Updated
2026-04-03

## Current Status
Web MVP in progress. Engine extracted into shared package. Auth + API key vault shipped. Phases 3-5 remain (Claude API integration, chat UI + sidebar, onboarding + deploy). UPG product graph (136 nodes). Target: pitchable web app for ~10 Silicon Valley D&D engineers.

## What's Been Built

### Web MVP Phase 1: Engine Extraction (complete)
- Game logic extracted into `packages/engine/` as `@rpg-engine/core`
- MCP server refactored as thin adapter — `mcp-server/src/` is only index.ts + server.ts
- 25 tool definitions exported from engine for reuse by web app
- Ports & adapters architecture — one engine, two presentation layers
- NPC document system: structured backstory, voice guide (cadence/vocabulary/tics/formality), character arc (lie/wound/truth), interaction_history[]
- Bidirectional KNOWS edges — NPCs learn what player tells them
- Bug fixes: duplicate KNOWS in investigate, opinion no-op for new NPCs

### Web MVP Phase 2: Auth & Storage (complete)
- Next.js 16 app scaffolded in `web/` with App Router
- Root monorepo with npm workspaces linking @rpg-engine/core
- Invite-code registration with argon2 password hashing
- iron-session HTTP-only cookies (14-day maxAge)
- AES-256-GCM encrypted API key storage
- Anthropic key validation via models.list()
- Middleware gates: unauthenticated → /login, no API key → /settings
- Per-user data directories on disk
- Dark RPG-themed auth UI pages
- Gap fix: login restores hasApiKey from disk for returning users

### Original Engine (Phases 1-3, pre-extraction)
- 14 node types, 18 edge types, d20 dice engine with 5-tier outcomes
- 25 MCP tools across CRUD, mechanics, narrative, drama, campaigns
- Stateless store with mutex locking, atomic writes
- Drama manager: narrative health, NPC agendas, available storylets
- log_event with THEREFORE/BUT enforcement
- investigate, interview_npc, research, move_to_location, advance_time
- NPC knowledge isolation via do_not_reference exclusion list
- Campaign management: list/new/load campaigns

### Onboarding v2.1 (complete)
- Fugue state design — no fourth wall breaks
- Vignette → scenario fork → deepened scene → diegetic commitment gate
- Revealed preferences (not stated) — different every time
- Two-path character creation (discover vs shape)
- Grounding scene solves amnesiac protagonist problem

### Infrastructure
- GitHub repo: curlcomplex/rpg-engine
- UPG product graph (rpg-engine.upg) — 136 nodes, 183 edges
- Design spec: docs/superpowers/specs/2026-04-03-rpg-web-mvp-design.md
- GSD roadmap: .planning/ROADMAP.md (5 phases, 48 requirements)
- Codebase map: .planning/codebase/ (7 documents)

## Active Playthroughs
- Raccoon City (raccoon-city.rpg) — Alyssa Ashcroft, investigative journalism, 45+ nodes
- 2 other campaigns created during testing

## Bugs Found & Fixed
- DBG-001: Narrator leaked player knowledge into NPC dialogue → fixed with do_not_reference
- DBG-002: investigate created duplicate KNOWS edges → fixed with alreadyKnows guard
- DBG-003: Opinion edges silently discarded for new NPCs → fixed with else branch
- DBG-004: hasApiKey not restored on login → fixed by checking api_key.enc on disk
- Onboarding insight blocks leaking profiling → fixed with explicit suppression
- Amnesiac protagonist → fixed with grounding scene

## User Feedback
- Felix: 2+ hours engaged, most engaging RPG ever played, 3 campaigns created in one session
- Will (DM friend): 20 mins played, said most engaging RPG experience in 20 years of DMing. Wants to share with Silicon Valley connections. MBA + engineer.
- Multiple people: iPhone app requested

## Design Decisions Made
1. Therefore/But rule (Parker/Stone) as core narrative constraint
2. Separation of powers — engine decides what, Claude decides how
3. Blocks as triggers — no event system needed, block removal cascades
4. Fugue state onboarding — no fourth wall, ever
5. NPC knowledge isolation — structural, not prompt-based
6. Character arcs for all NPCs — lie/wound/truth + voice guides
7. Revealed over stated preferences — research-backed
8. Ports & adapters — shared engine, MCP + web adapters
9. BYO API key — users bring their own Anthropic key
10. Next.js monolith — frontend + API in one deployable unit
11. Per-user JSON files on disk — no database for MVP
12. SSE for streaming — simpler than WebSocket for server→client
13. @anthropic-ai/sdk directly — NOT Vercel AI SDK (need tool-use loop control)

## What's Next

### Web MVP Phase 3: Claude API Integration (next)
- TurnOrchestrator: manual tool-use loop with hard step cap
- SSE streaming from server to browser
- System prompt construction from world file (narrator rules, NPC voices, scene context)
- All 25 game tools as Claude API tool definitions
- Critical path — highest risk phase

### Web MVP Phase 4: Chat UI & Sidebar
- Streaming chat interface with dark RPG theme
- Game state sidebar (stats, inventory, location, NPCs, objectives, tension)
- Dice roll formatting, failure-to-choice clickable buttons
- Regenerate/retry, error recovery, loading indicators

### Web MVP Phase 5: Onboarding, Sessions & Deploy
- Fugue state onboarding ported to server-side system prompt
- Session restoration with "Previously on..." from graph events
- Multiple worlds with world picker
- Auto-save after each turn
- Deploy to Railway with persistent volume

### Future (post-MVP)
- Model switching (Haiku for cheap ops)
- NPC sub-agents (separate Claude instances per NPC)
- iPhone app (high user interest)
- Automated playtesting with adversarial sub-agents
- Multi-campaign player profiles
- Background game clock for NPC agenda advancement
