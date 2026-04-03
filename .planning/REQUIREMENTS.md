# Requirements: RPG Web MVP

**Defined:** 2026-04-03
**Core Value:** Players come back the next day and their world is exactly where they left it — NPCs remember, consequences cascade, stories have structure.

## v1 Requirements

### Engine Extraction

- [ ] **ENG-01**: Game engine functions (dice, narrative, queries, store, types) extracted into `packages/engine/` as a shared TypeScript package
- [ ] **ENG-02**: MCP server refactored as thin adapter importing from shared engine package
- [ ] **ENG-03**: MCP server passes all existing functionality after refactor (regression verified)
- [ ] **ENG-04**: NPC character nodes support structured properties: backstory, voice guide (cadence, vocabulary, tics, formality), arc (lie, wound, truth), interaction_history[]
- [ ] **ENG-05**: `interview_npc` creates bidirectional KNOWS edges — NPC learns what player shares, not just player learns from NPC
- [ ] **ENG-06**: `interview_npc` appends to NPC's interaction_history after each conversation
- [ ] **ENG-07**: `investigate` guards against duplicate KNOWS edges (existing bug fix)
- [ ] **ENG-08**: Opinion edge created for new NPCs on first interaction (existing bug fix)

### Authentication

- [ ] **AUTH-01**: User can register with an invite code, username, and password
- [ ] **AUTH-02**: Invalid or already-used invite codes are rejected with clear error
- [ ] **AUTH-03**: User can log in with username and password
- [ ] **AUTH-04**: User session persists across browser refresh (HTTP-only cookie)
- [ ] **AUTH-05**: User can log out

### API Key Management

- [ ] **KEY-01**: User can enter their Anthropic API key on a settings page
- [ ] **KEY-02**: API key is encrypted at rest (AES-256-GCM) on the server
- [ ] **KEY-03**: API key is validated on entry (test API call to Anthropic)
- [ ] **KEY-04**: User without a valid API key cannot start a game (clear error directing them to settings)

### Chat Interface

- [ ] **CHAT-01**: User can type a message and send it (Enter to send, Shift+Enter for newline)
- [ ] **CHAT-02**: Narrator responses stream in token-by-token via SSE (not wait-for-complete)
- [ ] **CHAT-03**: Player messages and narrator responses are visually distinct
- [ ] **CHAT-04**: Typing/loading indicator shown during Claude API call and tool execution
- [ ] **CHAT-05**: Dice rolls and skill check results rendered with distinct formatting
- [ ] **CHAT-06**: Failure-to-choice options rendered as clickable buttons
- [ ] **CHAT-07**: User can regenerate/retry the last narrator response
- [ ] **CHAT-08**: Error states show clear messages with retry option, preserving user input
- [ ] **CHAT-09**: Dark theme appropriate for RPG atmosphere

### Game State Sidebar

- [ ] **SIDE-01**: Sidebar displays character name, stats (physique, agility, intellect, social, perception, resolve), and status
- [ ] **SIDE-02**: Sidebar displays inventory (items from CARRIES edges)
- [ ] **SIDE-03**: Sidebar displays current location name, atmosphere, and danger level
- [ ] **SIDE-04**: Sidebar displays NPCs present at current location with opinion indicators
- [ ] **SIDE-05**: Sidebar displays active objectives with status
- [ ] **SIDE-06**: Sidebar displays tension meter (0-10)
- [ ] **SIDE-07**: Sidebar refreshes after every turn with fresh `get_scene_context()` data

### Claude API Integration

- [ ] **API-01**: Server calls Anthropic Claude API with user's API key, system prompt, conversation history, and 25 game tool definitions
- [ ] **API-02**: Server executes tool_use calls against the shared game engine and returns results to Claude
- [ ] **API-03**: Tool-use loop capped at maximum rounds (prevent runaway cost)
- [ ] **API-04**: System prompt constructed server-side from world file: narrator rules, NPC voice guides, scene context, world rules
- [ ] **API-05**: All game logic, prompts, and tool definitions are server-side only (never sent to browser)
- [ ] **API-06**: Streaming responses forwarded to client via SSE as they arrive

### Persistence & Sessions

- [ ] **PERS-01**: Each user has their own directory with world files stored as .rpg JSON
- [ ] **PERS-02**: World auto-saves after each turn (atomic write)
- [ ] **PERS-03**: User can close browser and return later — world state is intact
- [ ] **PERS-04**: Session restoration generates "Previously on..." summary from graph event nodes
- [ ] **PERS-05**: User can have multiple worlds/campaigns
- [ ] **PERS-06**: World picker screen for choosing which world to continue or starting new

### Onboarding

- [ ] **ONB-01**: New game starts the fugue state onboarding flow (vignette → fork → deepening → world gen → character grounding → catalyst)
- [ ] **ONB-02**: Onboarding creates NPCs with full structured properties (backstory, voice, arc)
- [ ] **ONB-03**: No fourth wall breaks, menus, or character creation screens during onboarding
- [ ] **ONB-04**: Onboarding logic lives server-side in the system prompt (invisible to player)

### Deployment

- [ ] **DEP-01**: App deploys to Railway via git push
- [ ] **DEP-02**: Persistent volume mounted for user data directory
- [ ] **DEP-03**: SSL/HTTPS handled by platform
- [ ] **DEP-04**: App accessible via custom domain or platform-provided URL

## v2 Requirements

### Cost Optimization

- **COST-01**: Model switching — Haiku for backend plumbing, Sonnet/Opus for narration
- **COST-02**: Conversation history sliding window with summarization
- **COST-03**: Prompt caching for tool definitions and system prompt

### Enhanced NPCs

- **NPC-01**: NPC sub-agents — separate Claude instances per NPC with isolated context
- **NPC-02**: NPC emotional state tracking beyond opinion weight

### Mobile & Polish

- **MOB-01**: Responsive design for mobile play
- **MOB-02**: Native mobile app (iOS)

### Social

- **SOC-01**: Share campaign link / invite friends to view
- **SOC-02**: Multiplayer / co-op campaigns

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multiplayer / co-op | Massive complexity, single-player not yet validated |
| Image generation | Expensive, tangential to text RPG core |
| Voice input/output | Novelty, not core |
| User-facing lorebook/graph editor | Breaks immersion, graph manages itself |
| Content filters UI | Closed playtest with trusted engineers, Anthropic API has built-in safety |
| Admin dashboard | 10 users, use server logs |
| Undo/rollback world state | Undermines consequence system — regenerate only |
| Chat history search | Graph is the memory, not chat — wrong mental model |
| Analytics/metrics | Premature for playtest |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENG-01 | Phase 1 | Pending |
| ENG-02 | Phase 1 | Pending |
| ENG-03 | Phase 1 | Pending |
| ENG-04 | Phase 1 | Pending |
| ENG-05 | Phase 1 | Pending |
| ENG-06 | Phase 1 | Pending |
| ENG-07 | Phase 1 | Pending |
| ENG-08 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| KEY-01 | Phase 2 | Pending |
| KEY-02 | Phase 2 | Pending |
| KEY-03 | Phase 2 | Pending |
| KEY-04 | Phase 2 | Pending |
| API-01 | Phase 3 | Pending |
| API-02 | Phase 3 | Pending |
| API-03 | Phase 3 | Pending |
| API-04 | Phase 3 | Pending |
| API-05 | Phase 3 | Pending |
| API-06 | Phase 3 | Pending |
| CHAT-01 | Phase 4 | Pending |
| CHAT-02 | Phase 4 | Pending |
| CHAT-03 | Phase 4 | Pending |
| CHAT-04 | Phase 4 | Pending |
| CHAT-05 | Phase 4 | Pending |
| CHAT-06 | Phase 4 | Pending |
| CHAT-07 | Phase 4 | Pending |
| CHAT-08 | Phase 4 | Pending |
| CHAT-09 | Phase 4 | Pending |
| SIDE-01 | Phase 4 | Pending |
| SIDE-02 | Phase 4 | Pending |
| SIDE-03 | Phase 4 | Pending |
| SIDE-04 | Phase 4 | Pending |
| SIDE-05 | Phase 4 | Pending |
| SIDE-06 | Phase 4 | Pending |
| SIDE-07 | Phase 4 | Pending |
| PERS-01 | Phase 5 | Pending |
| PERS-02 | Phase 5 | Pending |
| PERS-03 | Phase 5 | Pending |
| PERS-04 | Phase 5 | Pending |
| PERS-05 | Phase 5 | Pending |
| PERS-06 | Phase 5 | Pending |
| ONB-01 | Phase 5 | Pending |
| ONB-02 | Phase 5 | Pending |
| ONB-03 | Phase 5 | Pending |
| ONB-04 | Phase 5 | Pending |
| DEP-01 | Phase 6 | Pending |
| DEP-02 | Phase 6 | Pending |
| DEP-03 | Phase 6 | Pending |
| DEP-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: 48
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-03*
*Last updated: 2026-04-03 after initial definition*
