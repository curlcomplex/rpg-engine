# Roadmap: RPG Web MVP

## Overview

Transform the proven RPG graph engine (25 MCP tools, graph persistence, dice mechanics) into a web application where invited players access it through a streaming chat interface. The journey: extract the engine into a shared package, add auth and API key management, wire up Claude API integration with the tool-use loop, build the chat UI and game-state sidebar, then polish onboarding/sessions and deploy. Five phases, each delivering a verifiable capability that unblocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Engine Extraction** - Extract game logic into shared package, refactor MCP server as thin adapter, fix NPC bugs
- [ ] **Phase 2: Auth and Storage** - Invite-code registration, login/logout, API key vault, per-user file storage
- [ ] **Phase 3: Claude API Integration** - TurnOrchestrator, tool-use loop, SSE streaming, system prompt builder
- [ ] **Phase 4: Chat UI and Sidebar** - Streaming chat interface, game-state sidebar, world picker, dark theme
- [ ] **Phase 5: Onboarding, Sessions, and Deployment** - Fugue state onboarding, session restoration, multi-world support, Railway deployment

## Phase Details

### Phase 1: Engine Extraction
**Goal**: Game engine is a standalone package that both MCP server and web app can import, with NPC enhancements and bug fixes included
**Depends on**: Nothing (first phase)
**Requirements**: ENG-01, ENG-02, ENG-03, ENG-04, ENG-05, ENG-06, ENG-07, ENG-08
**Success Criteria** (what must be TRUE):
  1. `packages/engine/` exports all game functions (dice, narrative, queries, store, types) and can be imported by external consumers
  2. MCP server imports from the shared engine package and passes all existing functionality (regression verified by running existing playtest scenarios)
  3. NPC character nodes store structured backstory, voice guide, arc, and interaction_history -- and `interview_npc` updates both sides of a conversation (bidirectional KNOWS edges, interaction_history append)
  4. `investigate` no longer creates duplicate KNOWS edges, and opinion edges are created for new NPCs on first interaction
**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md -- Extract engine into packages/engine/, rewire MCP server as thin adapter
- [ ] 01-02-PLAN.md -- NPC type interfaces, bug fixes (investigate duplicates, opinion edge), bidirectional KNOWS, interaction_history

### Phase 2: Auth and Storage
**Goal**: Users can register with an invite code, log in securely, store their Anthropic API key, and have a personal data directory ready for world files
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, KEY-01, KEY-02, KEY-03, KEY-04
**Success Criteria** (what must be TRUE):
  1. User can register with a valid invite code + username + password, and is rejected with a clear error for invalid or already-used invite codes
  2. User can log in, stay logged in across browser refreshes (HTTP-only cookie), and log out
  3. User can enter their Anthropic API key on a settings page, key is validated via test API call, and stored encrypted (AES-256-GCM) on the server
  4. User without a valid API key sees a clear error directing them to settings when they try to start a game
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Claude API Integration
**Goal**: Server can run a complete RPG turn -- take player input, call Claude with the system prompt and all 25 game tools, execute the tool-use loop, and stream narration back via SSE
**Depends on**: Phase 2
**Requirements**: API-01, API-02, API-03, API-04, API-05, API-06
**Success Criteria** (what must be TRUE):
  1. Server calls Claude API with the user's decrypted API key, a system prompt constructed from world state (narrator rules, NPC voice guides, scene context, world rules), conversation history, and all 25 game tool definitions
  2. Claude's tool_use calls are executed against the shared engine and results fed back, with the loop hard-capped at a maximum round limit to prevent runaway API costs
  3. Streaming narration is forwarded to the client via SSE as tokens arrive (not wait-for-complete), with all game logic, prompts, and tool definitions remaining server-side only
  4. All stop_reason cases are handled (end_turn, tool_use, max_tokens, refusal, empty responses) and errors produce clear recoverable responses
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Chat UI and Sidebar
**Goal**: Players interact with the game through a polished dark-themed chat interface with streaming narration and a live game-state sidebar showing their character, inventory, location, NPCs, objectives, and tension
**Depends on**: Phase 3
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, CHAT-08, CHAT-09, SIDE-01, SIDE-02, SIDE-03, SIDE-04, SIDE-05, SIDE-06, SIDE-07
**Success Criteria** (what must be TRUE):
  1. User can type a message (Enter to send, Shift+Enter for newline) and see narrator responses stream in token-by-token with visual distinction between player and narrator messages
  2. Dice rolls and skill checks render with distinct formatting, and failure-to-choice options appear as clickable buttons
  3. Sidebar displays character stats, inventory, current location, NPCs present with opinion indicators, active objectives, and tension meter -- all refreshing after every turn
  4. Loading indicator shows during API calls, errors display clearly with retry option preserving user input, and user can regenerate the last narrator response
  5. Interface uses a dark RPG-appropriate theme
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Onboarding, Sessions, and Deployment
**Goal**: New players experience diegetic onboarding, returning players get "Previously on..." recaps, players can manage multiple worlds, and the whole app is live on a public URL
**Depends on**: Phase 4
**Requirements**: ONB-01, ONB-02, ONB-03, ONB-04, PERS-01, PERS-02, PERS-03, PERS-04, PERS-05, PERS-06, DEP-01, DEP-02, DEP-03, DEP-04
**Success Criteria** (what must be TRUE):
  1. New game starts the fugue state onboarding (vignette, fork, deepening, world gen, character grounding, catalyst) with no fourth wall breaks -- onboarding creates NPCs with full structured properties and all logic lives server-side in the system prompt
  2. User can close browser, return later, and find their world intact -- session restoration generates a "Previously on..." summary from graph event nodes
  3. User can have multiple worlds/campaigns and choose between them on a world picker screen
  4. App auto-saves after each turn with atomic writes, and each user has their own directory with world files stored as .rpg JSON
  5. App is deployed to Railway with persistent volume for user data, SSL/HTTPS, and accessible via platform-provided URL or custom domain

**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Engine Extraction | 0/2 | Not started | - |
| 2. Auth and Storage | 0/2 | Not started | - |
| 3. Claude API Integration | 0/2 | Not started | - |
| 4. Chat UI and Sidebar | 0/2 | Not started | - |
| 5. Onboarding, Sessions, and Deployment | 0/3 | Not started | - |
