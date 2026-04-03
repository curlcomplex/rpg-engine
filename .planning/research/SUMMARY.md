# Project Research Summary

**Project:** RPG Web MVP — AI Chat Web App with Game Engine
**Domain:** AI-narrated text RPG web application (chat interface + persistent graph world)
**Researched:** 2026-04-03
**Confidence:** HIGH

## Executive Summary

This product is a streaming AI RPG where a proven TypeScript game engine (25 MCP tools, graph-based world persistence, dice mechanics) gets a web frontend so players can access it via browser instead of Claude Code. The recommended approach is a Next.js 16 monorepo with three packages: a shared engine core (extracted from the existing MCP server), a thinned-down MCP adapter, and a new web app. The single most consequential technical decision is to use `@anthropic-ai/sdk` directly — not Vercel AI SDK — because the product requires manual control over the tool-use loop, SSE streaming of intermediate narration, and prompt caching of NPC voice guides. Everything else follows from that choice: file-based storage (no database for 10 users), iron-session (no OAuth for invite-code auth), Railway (no Dockerfile needed for a solo developer).

The competitive landscape is clear: every major AI RPG competitor (AI Dungeon, NovelAI, Character.AI) fails on structured world persistence. They use chat history or lorebooks as memory, which degrades across sessions. This product's graph-backed persistence, NPC knowledge isolation, THEREFORE/BUT causal chains, and drama manager are architecturally unprecedented in the consumer AI RPG space. The live game-state sidebar is the single largest visible differentiator — no major competitor shows real-time structured game state alongside the chat. The recommended feature scope for MVP is tight: auth + API key entry, streaming chat, Claude API integration with tool_use, the sidebar, and auto-save session persistence. Everything else is Phase 2.

The key risks are infrastructure-level, not product-level. The game engine already works — the 20-year DM playtest validated it. What can fail is the plumbing: SSE buffering that silently kills the streaming UX, an unbounded agentic loop that burns users' API keys, WorldStore concurrency corruption from multiple browser tabs hitting the same world file, and API key encryption done carelessly. All of these have documented prevention strategies with concrete code patterns. None are novel problems; all must be addressed from day one.

## Key Findings

### Recommended Stack

The stack is lean and deliberate. Next.js 16 provides the full-stack framework with native SSE support via ReadableStream. The Anthropic SDK is used directly (not through an abstraction layer) to give exact control over tool-call streaming and the tool-use loop. Authentication uses iron-session (stateless encrypted cookies — no database) and argon2 for passwords. User API keys are encrypted at rest with Node.js built-in AES-256-GCM. State management is zustand for the frontend. Deployment is Railway — it auto-detects Next.js, provides persistent volumes for world files at $0.25/GB/month, and has the most forgiving DX for a developer new to web infrastructure. All versions verified via npm registry on 2026-04-03.

No database, no Redis, no WebSocket, no LangChain, no NextAuth, no tRPC. Every excluded technology has a specific and documented reason. The "What NOT to Use" list from STACK.md is as important as the "What to Use" list.

**Core technologies:**
- `next@16.2.2`: Full-stack framework — native App Router SSE, single deployable unit, standalone Docker output
- `@anthropic-ai/sdk@0.82.0`: Direct Claude API — preserves tool loop control, prompt caching, streaming fidelity; reports of AI SDK causing tool execution order deviations make it a hard no
- `iron-session@8.0.4`: Stateless sessions — no database needed, works with App Router, recommended by Next.js docs
- `argon2@0.44.0`: Password hashing — Argon2id is the 2025/2026 gold standard (memory-hard, PHC winner); note potential ABI issue with Node 23, fallback is `@node-rs/argon2`
- `zustand@5.0.12`: Client state — chat + sidebar in ~30 lines, no Redux overhead
- `tailwindcss@4.2.2`: CSS — CSS-first config (no `tailwind.config.js`), 5x faster builds, dark theme iteration speed
- `railway`: Deployment — persistent volumes, auto-build from git push, no Dockerfile required
- `shadcn/ui` (copy-paste): UI primitives — ScrollArea, Button, Input, Dialog; source code ownership, no runtime dependency

### Expected Features

Competitive research against AI Dungeon, NovelAI, Character.AI, Friends & Fables, RPGGO, and others produced a clear picture of the feature landscape.

**Must have (table stakes):**
- Streaming narration — token-by-token rendering is the 2026 baseline; waiting for full responses feels broken
- Dark mode / RPG-appropriate theme — every competitor uses dark themes; bright UI kills immersion
- Message differentiation — player input vs narrator output requires distinct visual treatment
- Auto-save after every turn — competitors all do this; losing progress is unacceptable
- Session persistence and resume — the core value prop; the graph IS the memory
- Multiple campaigns and world picker — expected from every AI RPG with persistent state
- Typing / loading indicator — users assume the app crashed without one
- Input affordances — auto-resize textarea, Enter to send, Shift+Enter for newline (muscle memory from ChatGPT/Claude.ai)
- Error recovery — clear messages, preserve input on failure, retry option
- API key entry and validation — required for the BYO-key model; test key on entry
- Invite-code gated signup — simplest gate for the closed 10-user playtest

**Should have (Phase 2 differentiators):**
- Game state sidebar (live) — no major competitor shows real-time structured game state; THE biggest visible differentiator
- "Previously on..." session recap — graph-generated (from EVENT nodes), not chat-history summarization; uniquely reliable
- Clickable choice prompts — renders failure-to-choice options as buttons at dramatic moments
- Dice roll visual treatment — distinct rendering of 5-tier mechanical outcomes in chat
- Tension meter in sidebar — quantified metric computed from graph threats/opinions/blocks; no competitor has this
- Regenerate last response — re-narrate same outcome; low effort, high value safety valve

**Already built (engine provides these for free):**
- NPC knowledge isolation with `do_not_reference` lists
- Graph-backed world persistence with causal chains
- Dice mechanics with 5-tier outcomes (triumph/success/mixed/failure/catastrophe)
- Drama manager (narrative health, NPC agendas, available storylets)
- THEREFORE/BUT enforced causal chains via `log_event`

**Explicit anti-features (do not build):**
- Multiplayer, model switching, character creation menus, content filter UI, lorebook editor, chat history search, image generation, voice input/output, mobile-responsive design, admin dashboard, NPC sub-agents, undo/full rollback

### Architecture Approach

The architecture is a monorepo with three packages sharing a single engine core. All game logic lives in `packages/engine/` (extracted from the existing MCP server with minimal changes — it is largely a move-and-export refactor). The MCP server becomes a thin ~50-line protocol adapter. The web app adds a `TurnOrchestrator` that manages the Claude API streaming tool-use loop, a `ToolExecutor` that dispatches the 25 game tools against the user's WorldStore instance, a `SystemPromptBuilder` that constructs narrator context from world state, and an SSE encoder. The frontend is a dumb terminal: it sends player messages and receives narrator text plus sidebar state. No game logic, no system prompts, no tool schemas, no tool results ever reach the browser.

Data model is file-based: each user gets `/data/users/{id}/` with their profile, encrypted API key, and one `.rpg` file per campaign. No database. Conversation history is ephemeral (lives in React state, sent with each POST) — the ground truth is always the graph, not the chat log. Per-user WorldStore instances are created fresh per request (or held as a module-level singleton per user — either works at 10 users).

**Major components:**
1. `packages/engine/` — all game logic: WorldStore, dice, narrative, queries, drama, types; zero protocol knowledge
2. `TurnOrchestrator` — manages Claude API tool-use loop, streams text to client, feeds tool results back; lives in `web/src/lib/orchestrator.ts`
3. `ToolExecutor` — dispatches 25 tool calls to engine functions; the registry between Claude and the game; lives in `web/src/lib/tool-executor.ts`
4. `SystemPromptBuilder` — constructs narrator system prompt from world state including per-scene NPC voice guides; lives in `web/src/lib/system-prompt.ts`
5. `SSE Encoder` — translates orchestrator events (`text`, `tool_call`, `scene_update`, `error`, `done`) to SSE data lines over ReadableStream; lives in `web/src/lib/sse.ts`
6. `Auth Layer` — iron-session + argon2, invite-code registration, session cookie management
7. `API Key Vault` — AES-256-GCM encryption/decryption of user Anthropic keys, server-side only, never sent to client
8. `Chat UI / Sidebar` — dumb terminal; sends messages via POST, reads SSE stream; sidebar renders sanitized `get_scene_context()` output

### Critical Pitfalls

Research identified 18 pitfalls across 7 phases. The 5 that cause rewrites or data loss if ignored:

1. **Agentic loop without a hard step limit** — a single RPG turn can trigger 15-20+ tool calls and enter a semantic loop burning the user's API key. Prevention: `MAX_TOOL_ROUNDS = 10` hard cap, deduplication guard for identical back-to-back calls, token budget per turn. Must be in place before the first Claude API call ships.

2. **Next.js response buffering killing SSE streaming** — three buffering layers conspire: Next.js compression, App Router response handling, and reverse-proxy buffering. The "streaming" experience becomes a 30-second wait then a dump. Prevention: set `compress: false` in `next.config.js`, use the TransformStream pattern (return Response immediately, write asynchronously), set `Cache-Control: no-cache, no-transform` and `X-Accel-Buffering: no` headers. Test against a real Railway deployment — local dev does not reproduce this bug.

3. **Per-user WorldStore concurrency (multiple browser tabs)** — two tabs sharing a world file create silent state corruption; the existing per-instance mutex does not protect across concurrent HTTP requests. Prevention: per-user request queue (queue incoming turns if one is in flight) OR module-level singleton `Map<userId, WorldStore>`. Must be established in engine extraction phase, before any API routes are built.

4. **API key encryption with weak key management** — AES-256-GCM is the right primitive but the master encryption key must never touch git and must be stored only in Railway's secrets management. Require a unique random IV per encryption. Derive a per-user key from a master key + userId via HKDF so a single compromised file does not expose all users' keys.

5. **Chat history as memory (architecture regression)** — using conversation history as the source of world truth is the number one failure mode of every competitor. Prevention: fresh conversation on every session load, `get_scene_context()` reconstructs narrator state from the graph, "Previously on..." comes from EVENT nodes not chat summarization, sliding window of 5-8 message pairs maximum within a session.

## Implications for Roadmap

Research maps cleanly onto 6 phases with clear dependency ordering.

### Phase 1: Engine Extraction
**Rationale:** Everything depends on `packages/engine/`. It is the lowest-risk phase — a refactor of working, tested code, not new development. The MCP server should work identically after extraction, providing an immediate regression test.
**Delivers:** `@rpg-engine/core` npm workspace package with all game logic; MCP server refactored to ~50-line adapter; npm workspaces monorepo root with `packages/*`, `mcp-server`, `web`; validated portability of the engine.
**Addresses:** No new features; unblocks all subsequent phases.
**Avoids:** WorldStore concurrency bug (Pitfall #4) — establish per-user singleton pattern and in-memory cache here; switchTo() race condition (Pitfall #16) — eliminate by design by using separate WorldStore instances per world file rather than mutating a shared path.

### Phase 2: Auth and Storage Foundation
**Rationale:** The TurnOrchestrator needs a user context (decrypted API key, world file path) to call Claude. Auth and the API key vault must exist before any Claude calls can be made. Getting crypto right once is far cheaper than retrofitting it.
**Delivers:** Invite-code registration flow, login/logout, iron-session cookie management, AES-256-GCM API key vault with per-user key derivation, per-user file storage layout at `/data/users/{id}/`.
**Implements:** Auth Layer, API Key Vault components.
**Avoids:** API key encryption pitfall (Pitfall #6) — correct key management built from the start.
**Stack used:** `iron-session`, `argon2`, Node.js `crypto`.

### Phase 3: TurnOrchestrator and Claude API Integration
**Rationale:** This is the highest-risk phase and the core innovation. It should receive focused attention without UI distractions. The tool-use loop, SSE streaming, and all stop_reason handling must be solid before UI is layered on top. The onboarding should be ported and exercised here as the first integration test — if it works, every system is mechanically viable.
**Delivers:** Manual tool-use loop with Anthropic SDK streaming, ToolExecutor (25-tool dispatch registry), SystemPromptBuilder, SSE encoder, `/api/chat` route handler, complete stop_reason handling (`end_turn`, `tool_use`, `max_tokens`, `refusal`, `pause_turn`, empty responses).
**Implements:** TurnOrchestrator, ToolExecutor, SSE Encoder, SystemPromptBuilder.
**Avoids:** Agentic loop cost explosion (Pitfall #1) — hard step limit from day one; SSE buffering (Pitfall #2) — disable compression, set anti-buffering headers, test on Railway in this phase not later; truncated tool calls from max_tokens (Pitfall #3) — set max_tokens >= 4096 and check stop_reason before processing; empty responses after tool execution (Pitfall #9) — detect and inject retry prompt; chat history as memory (Pitfall #7) — define conversation management strategy here; request abort handling (Pitfall #13) — listen to `req.signal`, cancel SDK stream on client disconnect.
**Stack used:** `@anthropic-ai/sdk`.

### Phase 4: Chat UI and Game State Sidebar
**Rationale:** UI depends on the orchestrator API being stable and the SSE event format locked down. The sidebar is the product's biggest visible differentiator and must ship with the first UI build.
**Delivers:** Chat component with SSE client using `fetch()` + `ReadableStream` (not `EventSource`), dark RPG theme, message differentiation, typing indicator, error recovery, game state sidebar (live scene context, inventory, NPCs, location, tension), world picker screen, settings page (API key entry and validation).
**Implements:** Chat UI, Sidebar UI components.
**Avoids:** SSE connection drops (Pitfall #8) — use `fetch()` over native `EventSource` to avoid the 6-connection limit and surprise auto-reconnects; IP exposure (Pitfall #5) — enforce dumb terminal contract, no tool names or game logic in SSE stream; streaming markdown rendering breaks (Pitfall #18) — use streaming-aware renderer, test with real Claude responses.
**Stack used:** `zustand`, `tailwindcss`, `shadcn/ui` (ScrollArea, Button, Input, Dialog).

### Phase 5: Onboarding and Session Polish
**Rationale:** Onboarding exercises every system end-to-end and is the true integration test. "Previously on..." completes the session persistence story — without it, returning players are disoriented. Both depend on the full loop working.
**Delivers:** Server-side fugue state onboarding (diegetic, no menus, no character creation screen), "Previously on..." session recap generated from recent EVENT nodes, multi-world support, full session restoration flow.
**Avoids:** Onboarding breaks when ported from MCP to web (Pitfall #17) — treat the onboarding run as the integration test, not a deferred polish item.

### Phase 6: Deployment
**Rationale:** Railway's git-push workflow is simple. The full app should work locally before deployment introduces new variables. Deployment is the last thing that needs to happen.
**Delivers:** Railway service with persistent volume for `/data/users/`, environment secrets (SESSION_SECRET, ENCRYPTION_KEY) set via Railway secrets manager, graceful SIGTERM handler that closes SSE connections with a "server restarting" event, domain + SSL.
**Avoids:** Volume downtime on deploy (Pitfall #10) — accept brief downtime for MVP, deploy off-hours, warn playtesters; build-time data loss (Pitfall #15) — all initialization (invite code seeding, directory creation) at runtime only, never in build steps.

### Phase Ordering Rationale

- Engine extraction must come first because `packages/engine/` is the foundation of everything else, and the refactor is lowest-risk.
- Auth before orchestrator because Claude calls require a decrypted API key and a resolved world file path.
- Orchestrator before UI because the frontend is a dumb terminal — it needs a stable SSE event contract, not the other way around.
- Onboarding in Phase 5 (not Phase 4 with other UI) because it depends on the full loop and functions as an integration test.
- Deployment last because Railway setup is fast once the app works end-to-end locally.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (TurnOrchestrator):** The manual tool-use loop with streaming is the highest-complexity component. The Anthropic SDK streaming API event type details (`input_json_delta` accumulation, `finalMessage()` semantics) and the `defer_loading` feature for rarely-used tools should be reviewed against current SDK docs when the phase plan is written. Token cost per turn also needs empirical measurement with the real system prompt and all 25 tool definitions.
- **Phase 5 (Onboarding):** The fugue state onboarding is a complex multi-turn state machine. The port from slash command to server-side system prompt may surface edge cases. Treat the first onboarding run as a spike.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Engine extraction):** Pure refactor. npm workspaces + Next.js `transpilePackages` are fully documented.
- **Phase 2 (Auth):** iron-session + argon2 is a well-documented stack. STACK.md research covers it fully.
- **Phase 4 (Chat UI):** Standard React SSE client + zustand + Tailwind. No novel patterns.
- **Phase 6 (Deployment):** Railway Next.js deployment is fully documented. Follow the Railway guide.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm registry on 2026-04-03. Alternatives were explicitly considered and rejected with documented rationale. No speculative picks. |
| Features | HIGH | Multiple competitors cross-referenced. Table stakes features converge across all sources. Differentiators are grounded in the existing engine's technical capabilities. |
| Architecture | HIGH | All patterns sourced from official Anthropic SDK docs, Next.js docs, and community-confirmed examples (200+ comment threads on the SSE buffering issue). Engine extraction is low-risk (refactor of working code). |
| Pitfalls | HIGH | Critical pitfalls sourced from official Anthropic stop-reason docs, Next.js issue trackers, Railway volume docs, and the existing codebase's CONCERNS.md. No speculative pitfalls. |

**Overall confidence:** HIGH

### Gaps to Address

- **Token cost per turn:** The estimate of $0.07-0.10 per turn is based on approximation of system prompt + 25 tool definitions + conversation history. Measure actual input/output token counts in Phase 3 before communicating API costs to playtesters. If costs are higher than expected, implement `defer_loading` for rarely-used tools (delete_node, trace_blocks, find_conflicts) in the same phase.
- **Prompt caching ROI:** STACK.md recommends prompt caching for system prompt and tool definitions. The actual cache hit rate and cost savings depend on session duration and turn frequency. Implement from the start but validate the benefit with real session data.
- **Streaming markdown renderer:** No specific library was identified for streaming-aware markdown rendering in the research. This needs a concrete library decision before Phase 4. Options: a custom incremental parser, `marked` with a streaming interface, or `react-markdown` with controlled re-rendering. Spike this at the start of Phase 4 before building the chat component.
- **Conversation history truncation strategy:** Research specifies 5-8 message pairs and stripping tool_use/tool_result blocks, but the exact truncation logic (which messages to drop, whether to keep the first user message as anchor) needs to be codified in Phase 3. This is a correctness decision, not a polish item.
- **TypeScript version pinning:** npm shows TS 6.0.2 as latest, but the existing codebase may target 5.8. Validate engine package builds with TS 6 or pin to 5.8 across all packages during Phase 1 monorepo setup.

## Sources

### Primary (HIGH confidence)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) — streaming API, tool_use loop, messages.stream(), finalMessage()
- [Anthropic Handling Stop Reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons) — all stop_reason values, empty responses, truncated tool calls
- [Anthropic Streaming Messages](https://platform.claude.com/docs/en/build-with-claude/streaming) — SSE event types, content_block_delta, fine-grained streaming
- [Next.js App Router Docs](https://nextjs.org/docs/app) — Route Handlers, ReadableStream, transpilePackages, standalone output
- [Next.js SSE Discussion #48427](https://github.com/vercel/next.js/discussions/48427) — confirmed buffering fix, 200+ comments, `compress: false` + TransformStream pattern
- [iron-session GitHub](https://github.com/vvo/iron-session) — App Router compatibility, getIronSession API
- [Railway Next.js Guide](https://docs.railway.com/guides/nextjs) — deployment, volumes, pricing
- [Railway Volumes Reference](https://docs.railway.com/volumes/reference) — volume deployment downtime limitation documented explicitly
- [Node.js crypto docs](https://nodejs.org/api/crypto.html) — AES-256-GCM, scrypt, randomBytes
- [MDN Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) — EventSource behavior, 6-connection limit
- `.planning/codebase/CONCERNS.md` — WorldStore mutex limitations, write guard gaps, switchTo() race condition, linear scan latency
- `docs/superpowers/specs/2026-04-03-rpg-web-mvp-design.md` — architecture constraints, SSE choice, BYO key model
- [Friends & Fables Features](https://fables.gg/) — closest structural competitor, differentiator analysis
- [NovelAI Lorebook Documentation](https://docs.novelai.net/en/text/lorebook/) — competitor memory system comparison

### Secondary (MEDIUM confidence)
- [AI Dungeon Features & Memory System](https://help.aidungeon.com/faq/the-memory-system) — confirmed lack of structured persistence
- [Upstash SSE Streaming LLM Blog](https://upstash.com/blog/sse-streaming-llm-responses) — ReadableStream + force-dynamic + X-Accel-Buffering pattern confirmed working
- [Password Hashing Guide 2025](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/) — Argon2id recommendation
- [Agentic Resource Exhaustion analysis](https://medium.com/@instatunnel/agentic-resource-exhaustion-the-infinite-loop-attack-of-the-ai-era-76a3f58c62e3) — runaway loop cost patterns
- [AI Chat UI Best Practices 2026](https://thefrontkit.com/blogs/ai-chat-ui-best-practices) — table stakes UI features
- [SSE Production Readiness critique](https://dev.to/miketalbot/server-sent-events-are-still-not-production-ready-after-a-decade-a-lesson-for-me-a-warning-for-you-2gie) — EventSource connection management pitfalls

### Tertiary (LOW confidence)
- [AI RPG Market Analysis](https://www.jenova.ai/en/resources/ai-rpg-roleplay) — single source, marketing content, used only to identify competitive set

---
*Research completed: 2026-04-03*
*Ready for roadmap: yes*
