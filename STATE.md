# RPG Engine — Project State

## Last Updated
2026-04-03

## Current Status
Phases 1-3 complete. 25 MCP tools. Onboarding v2.1 shipped. UPG product graph (108 nodes). Three active playthroughs in progress.

## What's Been Built

### Phase 1: MCP Server + Graph (complete)
- TypeScript MCP server following LifeGraph patterns
- 14 node types, 18 edge types
- Stateless store with mutex locking, atomic writes
- d20 dice engine with 5-tier outcomes + failure-to-choice pattern
- Cascade queries: trace_blocks, detect_neglect, find_conflicts
- get_scene_context for narrator context loading
- 13 initial tools

### Phase 3: Drama Manager (complete)
- check_narrative_health — therefore/but ratio, causal chain length, orphan events, tension trend, diagnosis with recommendations
- get_npc_agendas — what every NPC wants, fears, knows, where they are, what blocks their goals
- get_available_storylets — quality-based narrative, storylets whose requirements the player has met
- 25 total tools

### Phase 2: Narrative Tools (complete)
- log_event with THEREFORE/BUT enforcement
- investigate, interview_npc, research, move_to_location, advance_time
- NPC knowledge isolation via do_not_reference exclusion list (DBG-001 fix)
- Campaign management: list/new/load campaigns
- 22 total tools

### Onboarding v2.1 (complete)
- Fugue state design — no fourth wall breaks
- Vignette → scenario fork → deepened scene → diegetic commitment gate
- Revealed preferences (not stated) — different every time
- Tone calibrates silently through matching player energy
- Two-path character creation (discover vs shape)
- Grounding scene solves amnesiac protagonist problem
- Insight block suppression overrides session output style

### Infrastructure
- GitHub repo: curlcomplex/rpg-engine
- UPG product graph (rpg-engine.upg) — 57 nodes, 60 edges tracking all features/bugs/ideas
- 3 slash commands: /new-game, /load-game, /save-game

## Active Playthroughs
- Raccoon City (raccoon-city.rpg) — Alyssa Ashcroft, investigative journalism, 45+ nodes
- 2 other campaigns created during testing

## Bugs Found & Fixed
- DBG-001: Narrator leaked player knowledge into NPC dialogue → fixed with do_not_reference
- Onboarding insight blocks leaking profiling → fixed with explicit suppression
- Onboarding same questions every time → fixed in v2 with open adaptive questions
- Amnesiac protagonist → fixed with grounding scene
- Tone not established during onboarding → fixed with silent calibration

## User Feedback
- Felix: 2+ hours engaged, most engaging RPG ever played, 3 campaigns created in one session
- Will: Good pacing and theme consistency, wanted character grounding at start, DM perspective on world-first character-second flow
- Multiple people: iPhone app requested

## Design Decisions Made
1. Therefore/But rule (Parker/Stone) as core narrative constraint
2. Separation of powers — engine decides what, Claude decides how
3. Blocks as triggers — no event system needed, block removal cascades
4. Fugue state onboarding — no fourth wall, ever
5. NPC knowledge isolation — structural, not prompt-based
6. Character arcs for all NPCs — lie/wound/truth + voice guides
7. Revealed over stated preferences — research-backed

## What's Next

### Automated Playtesting (attempted, needs fix)
- 5 persona test suite created (grunt, novelist, comedian, breaker, dm)
- Runner script launched all 5 but they shared the same world.rpg — file contention
- Fix needed: each persona needs its own sandbox directory with isolated game files
- No reports collected yet — `-p` mode buffers output until completion, sessions were killed
- Personas and report templates are ready, just need the isolation fix

### Phase 4: NPC Sub-Agents
- Haiku agents for minor NPCs, Sonnet for key characters
- Fed only backstory + voice guide + KNOWS edges
- Structural knowledge isolation (can't leak what they don't have)

### Future
- Companion screen (HTML UI)
- iPhone app (high user interest)
- Automated playtesting with adversarial sub-agents
- Multi-campaign player profiles
- Background game clock for NPC agenda advancement
