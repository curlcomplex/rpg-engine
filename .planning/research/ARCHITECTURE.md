# Architecture Patterns

**Domain:** AI-narrated RPG web app (wrapping existing TypeScript game engine)
**Researched:** 2026-04-03

## Recommended Architecture

```
Browser (React)                       VPS (Next.js on Node.js)
+------------------+                  +---------------------------------------------------+
| ChatPanel        |   SSE stream     | app/api/chat/route.ts                             |
| SidebarPanel     |<-----------------| (SSE endpoint)                                    |
| SettingsPanel    |                  |   |                                                |
| WorldPicker      |   POST/fetch     |   v                                                |
+------------------+----------------->| TurnOrchestrator                                  |
                                      |   |-- Anthropic SDK (.stream())                    |
                                      |   |-- Tool Executor (dispatches tool_use blocks)   |
                                      |   |     |-- packages/engine/ (shared game engine)  |
                                      |   |     |     |-- store.ts (WorldStore per user)   |
                                      |   |     |     |-- dice.ts                          |
                                      |   |     |     |-- narrative.ts                     |
                                      |   |     |     |-- queries.ts                       |
                                      |   |     |     +-- types.ts                         |
                                      |   |     +-- WorldStore(userFilePath)                |
                                      |   +-- SSE encoder -> ReadableStream -> Response     |
                                      |                                                    |
                                      | app/api/auth/   (invite codes, sessions)            |
                                      | app/api/worlds/ (list, create, delete worlds)       |
                                      |                                                    |
                                      | /data/users/{id}/                                   |
                                      |   profile.json                                      |
                                      |   api_key.enc                                       |
                                      |   worlds/*.rpg                                      |
                                      +---------------------------------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Location |
|-----------|---------------|-------------------|----------|
| **packages/engine/** | All game logic: dice, narrative, queries, store, types. Zero protocol knowledge. | Nothing external -- pure library | `packages/engine/src/` |
| **mcp-server/** | Thin MCP protocol adapter. Translates MCP `CallToolRequest` to engine function calls. | packages/engine, MCP SDK | `mcp-server/src/` |
| **TurnOrchestrator** | Manages the Claude API tool-use loop for one player turn. Streams text to client, executes tools server-side, feeds results back to Claude. | Anthropic SDK, packages/engine, SSE encoder | `web/src/lib/orchestrator.ts` |
| **Tool Executor** | Registry mapping 25 tool names to engine functions. Receives `tool_use` blocks from Claude, calls engine, returns `tool_result`. | packages/engine (WorldStore instance) | `web/src/lib/tool-executor.ts` |
| **System Prompt Builder** | Constructs narrator system prompt from world state: scene context, NPC voices, rules, onboarding state. | packages/engine (read-only queries) | `web/src/lib/system-prompt.ts` |
| **SSE Encoder** | Translates orchestrator events into SSE `data:` lines over a `ReadableStream`. Emits `text`, `tool_call`, `scene_update`, `error`, `done` event types. | TurnOrchestrator output | `web/src/lib/sse.ts` |
| **Auth Layer** | Invite code validation, user registration, session cookie management. | iron-session, user profile files | `web/src/lib/auth.ts` |
| **API Key Vault** | Encrypts/decrypts user Anthropic API keys at rest using AES-256-GCM. Server-side only. | Node.js crypto, user files | `web/src/lib/vault.ts` |
| **Chat UI** | Dumb terminal. Sends player messages, renders SSE stream (text + formatted dice rolls). No game logic. | SSE client, REST endpoints | `web/src/app/` React components |
| **Sidebar UI** | Renders `get_scene_context()` output: stats, inventory, NPCs, location, tension. Read-only. | REST endpoint (scene data) | `web/src/components/Sidebar.tsx` |

### Data Flow

#### Player Turn (the critical path)

```
1. Player types "I search the alchemist's shop for hidden compartments"
       |
       v
2. POST /api/chat  { message, worldId }
   - Auth: validate session cookie, load userId
   - Load: decrypt API key, resolve world file path
       |
       v
3. TurnOrchestrator.executeTurn()
   a. Build system prompt from world state (get_scene_context + rules + NPC voices)
   b. Append player message to conversation history
   c. Call Anthropic SDK:
      anthropic.messages.stream({
        model: 'claude-sonnet-4-5-20250929',
        system: systemPrompt,
        messages: conversationHistory,
        tools: TOOL_DEFINITIONS,  // 25 tools, same schemas as MCP
        max_tokens: 4096,
      })
       |
       v
4. Stream processing (inner loop):
   FOR EACH content block in stream:
     IF text_delta:
       -> Encode as SSE: `event: text\ndata: {"delta":"..."}\n\n`
       -> Enqueue to ReadableStream (streams to client immediately)
     IF tool_use block complete:
       -> Encode as SSE: `event: tool_call\ndata: {"name":"investigate","input":{...}}\n\n`
       -> Execute tool via ToolExecutor against user's WorldStore
       -> Collect tool_result
       |
       v
5. IF response.stop_reason === 'tool_use':
   - Append assistant message + tool_results to conversation
   - GOTO step 3c (re-call Claude with tool results)
   - This loop repeats until stop_reason === 'end_turn'
       |
       v
6. After final text streamed:
   - Encode SSE: `event: scene_update\ndata: {sceneContext}\n\n`
   - Encode SSE: `event: done\ndata: {}\n\n`
   - World file already persisted (WorldStore writes atomically per tool call)
```

#### Session Restoration

```
1. Player opens app, has session cookie
       |
       v
2. GET /api/worlds/{worldId}/context
   - Load user's world file
   - Call getSceneContext(doc) from packages/engine
   - Call recent events query for "Previously on..." summary
       |
       v
3. Client renders sidebar from scene context
4. System prompt builder includes restoration context
5. First Claude call gets full world state -- no chat history needed
```

## Patterns to Follow

### Pattern 1: Shared Engine Package with Two Adapters

**What:** Extract all game logic from `mcp-server/src/` into `packages/engine/`. Both MCP server and web app import the same functions. Neither adapter contains game logic.

**Why:** Single source of truth for game mechanics. Bug fixes and new features automatically available to both MCP (for dev/testing in Claude Code) and web (for players). The MCP server already has clean separation -- `server.ts` is essentially a dispatch table mapping tool names to function calls.

**Structure:**
```
packages/engine/
  src/
    index.ts          # Public API: re-exports everything
    types.ts          # GameNode, GameEdge, WorldDocument, constants (moved from mcp-server)
    store.ts          # WorldStore class (moved from mcp-server)
    dice.ts           # resolveAction, rollD20 (moved from mcp-server)
    narrative.ts      # logEvent, investigate, interviewNpc, etc. (moved from mcp-server)
    queries.ts        # getSceneContext, traceBlocks, etc. (moved from mcp-server)
    tool-definitions.ts  # NEW: TOOLS array (schema only, no handlers) for Claude API
  package.json        # name: "@rpg-engine/core"
  tsconfig.json
```

**How the MCP adapter shrinks:**
```typescript
// mcp-server/src/server.ts becomes ~50 lines
import { WorldStore, resolveAction, logEvent, investigate, ... } from '@rpg-engine/core';

// Same switch/case dispatch, but all logic lives in packages/engine
```

**How the web adapter uses it:**
```typescript
// web/src/lib/tool-executor.ts
import { WorldStore, resolveAction, logEvent, investigate, ... } from '@rpg-engine/core';
import { TOOL_DEFINITIONS } from '@rpg-engine/core';

export function executeToolCall(store: WorldStore, name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'create_node': { /* same dispatch as MCP server */ }
    // ...
  }
}
```

**Confidence:** HIGH. The existing code already has this separation -- `server.ts` is a dispatcher, and the actual logic lives in `store.ts`, `dice.ts`, `narrative.ts`, `queries.ts`. This is a move-and-export refactor, not a rewrite.

### Pattern 2: Manual Tool-Use Loop with Streaming (not BetaToolRunner)

**What:** Implement the tool-use loop manually rather than using the SDK's `toolRunner` helper. This gives full control over what gets streamed to the client and when.

**Why:** The `BetaToolRunner` is designed for fire-and-forget server-side usage. It handles the loop automatically but does not expose per-delta streaming events in a way that maps cleanly to SSE. For a streaming chat UI, you need to:
1. Stream text deltas to the client as they arrive
2. Show tool call indicators (e.g., "Rolling dice..." or "Searching the room...")
3. Control retry/abort behavior
4. Limit the tool-use loop depth (prevent runaway loops)

**Implementation:**
```typescript
// web/src/lib/orchestrator.ts
async function* executeTurn(
  apiKey: string,
  systemPrompt: string,
  messages: MessageParam[],
  store: WorldStore,
  maxToolRounds: number = 5,
): AsyncGenerator<SSEEvent> {
  let round = 0;

  while (round < maxToolRounds) {
    round++;
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      system: systemPrompt,
      messages,
      tools: TOOL_DEFINITIONS,
      max_tokens: 4096,
    });

    // Stream text deltas to client as they arrive
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield { event: 'text', data: { delta: event.delta.text } };
      }
    }

    const finalMessage = await stream.finalMessage();

    // Check if Claude wants to call tools
    const toolUseBlocks = finalMessage.content.filter(b => b.type === 'tool_use');
    if (toolUseBlocks.length === 0) break; // Done -- Claude finished narrating

    // Execute tools and collect results
    const toolResults = [];
    for (const block of toolUseBlocks) {
      yield { event: 'tool_call', data: { name: block.name, input: block.input } };
      const result = await executeToolCall(store, block.name, block.input);
      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) });
    }

    // Append to conversation and loop
    messages.push({ role: 'assistant', content: finalMessage.content });
    messages.push({ role: 'user', content: toolResults });
  }

  // Send final scene update
  const doc = await store.getDocument();
  const sceneContext = getSceneContext(doc);
  yield { event: 'scene_update', data: sceneContext };
  yield { event: 'done', data: {} };
}
```

**Confidence:** HIGH. The Anthropic SDK `messages.stream()` API is stable and well-documented. The manual loop pattern is the recommended approach for custom UIs per Anthropic's own streaming documentation.

### Pattern 3: SSE via Next.js Route Handler + ReadableStream

**What:** Use the App Router `route.ts` with a `ReadableStream` to stream SSE events. Not WebSocket -- SSE is simpler and sufficient for one-way server-to-client streaming.

**Why:** The design spec calls for SSE. Next.js App Router route handlers natively support returning a `Response` with a `ReadableStream` body. The key gotcha: you must return the Response immediately and push data through the stream asynchronously -- do NOT await the full orchestrator loop before returning.

**Implementation:**
```typescript
// web/src/app/api/chat/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { message, worldId } = await req.json();
  const session = await getSession();
  if (!session.userId) return new Response('Unauthorized', { status: 401 });

  const apiKey = await vault.decrypt(session.userId);
  const store = new WorldStore(worldFilePath(session.userId, worldId));
  const systemPrompt = await buildSystemPrompt(store);

  // Create a ReadableStream that pushes SSE events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of executeTurn(apiKey, systemPrompt, messages, store)) {
          const ssePayload = `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`;
          controller.enqueue(encoder.encode(ssePayload));
        }
      } catch (err) {
        const errPayload = `event: error\ndata: ${JSON.stringify({ error: String(err) })}\n\n`;
        controller.enqueue(encoder.encode(errPayload));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',  // Prevent NGINX buffering
    },
  });
}
```

**Key details:**
- `export const runtime = 'nodejs'` -- required for file system access (WorldStore reads/writes .rpg files)
- `export const dynamic = 'force-dynamic'` -- prevents Next.js from trying to statically optimize the route
- `X-Accel-Buffering: 'no'` -- prevents reverse proxy buffering that would batch the stream
- The Response is returned immediately with the ReadableStream; the `start()` callback runs asynchronously

**Confidence:** HIGH. This pattern is well-documented in Next.js and confirmed working for LLM streaming by multiple sources including the Upstash blog and Next.js GitHub discussions.

### Pattern 4: Per-User WorldStore Instances

**What:** Each API request creates a fresh `WorldStore` instance pointing at the requesting user's world file. No shared state between users. No in-memory caching.

**Why:** The existing `WorldStore` is already stateless-per-request (reads from disk every time, writes atomically). For 10 users on a single VPS, there is zero need for a database, connection pooling, or in-memory state. The mutex (`lockQueue`) serializes writes within a single WorldStore instance, which is sufficient because:
- Each user has their own `.rpg` file (no cross-user contention)
- A single player turn is sequential (Claude calls tools one at a time)
- The promise-chain lock prevents concurrent writes from overlapping `ReadableStream` calls

**File layout:**
```
/data/users/
  {userId}/
    profile.json           # { username, passwordHash, createdAt }
    api_key.enc            # AES-256-GCM encrypted Anthropic API key
    active_world.json      # { worldId: "raccoon-city" }
    worlds/
      raccoon-city.rpg     # WorldDocument JSON (same format as current engine)
      vvardenfell.rpg
```

**Confidence:** HIGH. This is the existing pattern -- just scoped per-user instead of per-project.

### Pattern 5: npm Workspaces Monorepo (no Turborepo needed)

**What:** Use npm workspaces at the repo root to link `packages/engine`, `mcp-server`, and `web`. No Turborepo, no Nx -- the project is small and the overhead is not justified.

**Why:** With 3 packages and a solo developer, the workspace linking is the only thing needed from a monorepo tool. npm workspaces handle that natively. Next.js `transpilePackages` handles TypeScript compilation of the local package.

**Root package.json:**
```json
{
  "private": true,
  "workspaces": ["packages/*", "mcp-server", "web"]
}
```

**Next.js config:**
```javascript
// web/next.config.js
const nextConfig = {
  transpilePackages: ['@rpg-engine/core'],
};
```

**Confidence:** HIGH. npm workspaces are stable since Node 16. Next.js `transpilePackages` replaced the third-party `next-transpile-modules` and is built-in.

### Pattern 6: Conversation History as Server-Side In-Memory Array

**What:** Conversation history for the current session lives in server memory (or is passed with each request). It is NOT persisted to disk. When the player refreshes or returns later, the conversation resets but the world state is intact.

**Why:** The graph IS the memory. The design spec states: "Fresh conversation starts -- the graph IS the memory, not the chat history." This is a fundamental architectural choice:
- Chat history is ephemeral (current browser session only)
- World state is permanent (persisted in .rpg files after every tool call)
- Session restoration works by loading the graph and generating a "Previously on..." summary
- This avoids storing unbounded conversation history per user

**Implementation options (in order of simplicity):**
1. **Client sends full history with each request.** Simple, but exposes conversation to the network. Since the frontend is a "dumb terminal" and all IP is server-side, this is acceptable -- conversation history is just player messages and narrator text (no system prompts, no tool calls).
2. **Server stores history in a Map keyed by sessionId.** Lost on server restart. Fine for MVP since worlds persist independently.

**Recommendation:** Option 1 for MVP. The client accumulates messages in React state and sends them with each POST. The server prepends the system prompt (never sent to client) and tool definitions. If a message exceeds context limits, the server truncates older messages and relies on graph state for continuity.

**Confidence:** HIGH. This follows the design spec's explicit statement about graph-as-memory.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Putting Game Logic in API Routes

**What:** Writing tool dispatch code, dice resolution, or graph queries directly in `route.ts` files.

**Why bad:** Duplicates logic that should live in `packages/engine`. Creates two sources of truth. Makes MCP server and web app diverge over time.

**Instead:** API routes are thin HTTP adapters. They authenticate, resolve the user's WorldStore, call the orchestrator, and stream the response. All game logic lives in `packages/engine/`.

### Anti-Pattern 2: Using the BetaToolRunner for Streaming to Clients

**What:** Using `anthropic.beta.messages.toolRunner()` and trying to pipe its output to SSE.

**Why bad:** The toolRunner handles the loop internally but gives you `BetaMessageStream` objects in a `for await` loop. You get whole message streams, not individual text deltas interleaved with tool call indicators. Mapping this to SSE events that give good UX (character-by-character streaming, tool call progress) requires fighting the abstraction.

**Instead:** Use `messages.stream()` directly in a manual loop. You control the stream events, the tool execution, and the SSE encoding.

### Anti-Pattern 3: WebSocket for Chat

**What:** Using a WebSocket connection for the chat interface.

**Why bad:** WebSocket is bidirectional, but this app is request-response with streaming. The player sends a message (single POST), the server streams back a response (SSE). WebSocket adds connection management, heartbeat, reconnection logic, and state synchronization complexity -- all unnecessary for this pattern.

**Instead:** SSE for server-to-client streaming. Regular POST for client-to-server messages. The design spec explicitly chose SSE for this reason.

### Anti-Pattern 4: Caching WorldStore in Memory

**What:** Keeping a long-lived WorldStore instance per user across requests.

**Why bad:** The current WorldStore is designed to be stateless -- it reads from disk on every operation. Adding in-memory caching introduces staleness bugs, memory leaks for idle users, and complexity around cache invalidation when tools mutate the graph. For 10 users with JSON files under 1MB each, disk reads are sub-millisecond.

**Instead:** Create a fresh WorldStore per request. Let the filesystem be the cache. The mutex is per-instance, which is fine because a single turn's tool calls are sequential.

### Anti-Pattern 5: Sending System Prompts or Tool Definitions to the Client

**What:** Including system prompt text, tool schemas, or internal tool results in the SSE stream.

**Why bad:** IP protection. The design spec states all game logic, prompts, graph schema, and NPC systems must be server-side only. The frontend is a dumb terminal.

**Instead:** The SSE stream contains only: text deltas (narrator prose), tool call indicators (name only, no input/output details unless desired for UX), scene context updates (same data sidebar would show), and done/error signals.

## Scalability Considerations

| Concern | At 10 users (MVP) | At 100 users | At 1,000 users |
|---------|-------------------|--------------|----------------|
| **Storage** | JSON files on disk, <100MB total | Still fine, maybe 1GB | Consider SQLite per-user or a proper DB |
| **Concurrency** | Single Node.js process, no contention | Still fine -- each user hits their own files | Need request queuing or worker threads |
| **API costs** | Users pay own API keys | Same | Same -- BYO key scales naturally |
| **Memory** | Negligible -- stateless per request | ~50MB resident | Monitor WorldStore parse time for large graphs |
| **Streaming** | 1-2 concurrent SSE connections | 10-20 concurrent | Need connection limits or HTTP/2 |
| **Deploy** | Single VPS, $5/mo | Single VPS, $10/mo | Consider horizontal scaling |

**The MVP does not need to worry about scale.** Ten users with BYO API keys on a $5 VPS is well within the comfort zone of a single Node.js process serving JSON files from disk. Optimize only when real usage data demands it.

## Build Order (Dependencies Between Components)

The architecture has clear dependency chains that dictate build order:

```
Phase 1: packages/engine/  (extract from mcp-server, zero new code)
    |
    +-- Refactor mcp-server/ to import from packages/engine (validate extraction)
    |
Phase 2: web/ scaffold + auth
    |-- Next.js project init
    |-- iron-session auth (invite codes, registration, sessions)
    |-- API key vault (encrypt/decrypt)
    |-- Per-user file storage layout
    |
Phase 3: TurnOrchestrator + Tool Executor (the hard part)
    |-- Tool executor (packages/engine functions called from web context)
    |-- System prompt builder
    |-- Manual tool-use loop with Anthropic SDK streaming
    |-- SSE encoder + route handler
    |
Phase 4: Chat UI + Sidebar
    |-- Chat component with SSE client
    |-- Sidebar rendering scene context
    |-- World picker screen
    |
Phase 5: Onboarding + Polish
    |-- Server-side onboarding flow (fugue state)
    |-- "Previously on..." session restoration
    |-- NPC document system enhancements
    |
Phase 6: Deploy
    |-- Railway/Fly.io config
    |-- Persistent volume for /data/users/
    |-- Environment variables (encryption key, session secret)
```

**Why this order:**
- Phase 1 must come first because everything depends on the shared engine package. It is also the lowest-risk phase -- it is a refactor of working code, not new development.
- Phase 2 (auth + storage) comes next because the orchestrator needs a user context (API key, world file path) to function.
- Phase 3 (orchestrator) is the core innovation and the highest-risk phase. It deserves focused attention without auth or UI distractions.
- Phase 4 (UI) depends on the orchestrator API being stable.
- Phase 5 (onboarding/polish) depends on the full loop working end-to-end.
- Phase 6 (deploy) is last because it is simple (git push to Railway) and benefits from having the full app working locally first.

## Sources

- [Anthropic TypeScript SDK - Streaming helpers](https://github.com/anthropics/anthropic-sdk-typescript/blob/main/helpers.md) -- HIGH confidence. Official SDK documentation for `messages.stream()`, tool-use loop patterns, and event types.
- [Anthropic Streaming Messages API](https://platform.claude.com/docs/en/api/messages-streaming) -- HIGH confidence. Official API documentation for SSE event types: `message_start`, `content_block_start`, `content_block_delta`, `content_block_stop`, `message_delta`, `message_stop`.
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) -- HIGH confidence. Official documentation for App Router route handlers with ReadableStream.
- [Next.js transpilePackages](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages) -- HIGH confidence. Official configuration for importing local monorepo packages.
- [iron-session](https://github.com/vvo/iron-session) -- HIGH confidence. Recommended by Next.js docs for stateless cookie-based sessions.
- [Next.js SSE Streaming for LLMs (Upstash)](https://upstash.com/blog/sse-streaming-llm-responses) -- MEDIUM confidence. Third-party guide confirming `ReadableStream` + `force-dynamic` + `X-Accel-Buffering: no` pattern.
- [Next.js SSE Discussion #48427](https://github.com/vercel/next.js/discussions/48427) -- MEDIUM confidence. Community-confirmed pattern for SSE in App Router, including buffering workarounds.
- [Node.js AES-256-GCM encryption](https://gist.github.com/rjz/15baffeab434b8125ca4d783f4116d81) -- MEDIUM confidence. Standard Node.js crypto pattern for API key encryption at rest.
