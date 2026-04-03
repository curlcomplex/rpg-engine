# Domain Pitfalls

**Domain:** AI RPG web app with Claude API tool_use streaming, file-based persistence, SSE delivery
**Researched:** 2026-04-03
**Overall confidence:** HIGH (critical pitfalls verified against official Anthropic docs, Next.js issue trackers, and platform docs)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or broken core UX.

### Pitfall 1: Agentic Loop Without a Hard Step Limit (Cost Explosion)

**What goes wrong:** Claude calls tools in a `while (stop_reason === "tool_use")` loop. A complex scene could trigger 15-20+ tool calls (get_scene_context, attempt_action, interview_npc, log_event, get_npc_agendas, etc.). Without a cap, a single player turn could consume thousands of tokens and cost dollars. Worse, Claude could enter a semantic loop -- calling the same tools repeatedly because it thinks it is making progress but never reaches a terminal state. Since users bring their own API keys, a runaway loop burns their money, not yours, which is worse for trust.

**Why it happens:** The agentic loop pattern (`while stop_reason !== "end_turn"`) has no inherent termination beyond Claude deciding it is done. Claude cannot self-diagnose that it is stuck. RPG contexts are open-ended -- there is always another NPC to check, another clue to investigate, another piece of context to gather.

**Consequences:** A single player message could cost $2-5+ if the loop spirals. User's Anthropic key gets rate-limited. Player sees no response for 30+ seconds while tool calls pile up server-side.

**Warning signs:**
- Average tool calls per turn exceeding 8-10 during development testing
- Same tool called twice in a row with identical parameters
- Total loop time exceeding 15 seconds without producing user-visible text

**Prevention:**
1. Hard cap: `MAX_TOOL_ROUNDS = 10` (configurable). After reaching the limit, inject a system message: "You have used all available tool calls for this turn. Narrate based on what you have gathered."
2. Deduplication guard: If Claude calls the same tool with identical args twice in a row, return a cached result without re-executing.
3. Token budget per turn: Track cumulative input+output tokens. Abort at a threshold (e.g., 30,000 tokens per turn).
4. Expose tool call count to the player: "Thinking... (5/10 actions)" so they know something is happening.

**Detection:** Log tool call counts per turn. Alert if any turn exceeds 8 rounds. Track per-user daily token consumption.

**Phase:** Must be in place before the first Claude API call ships. Build into the core chat route from day one.

**Confidence:** HIGH -- verified against [Anthropic's handling stop reasons docs](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons), [Agentic Resource Exhaustion analysis](https://medium.com/@instatunnel/agentic-resource-exhaustion-the-infinite-loop-attack-of-the-ai-era-76a3f58c62e3), and [AI SDK loop control docs](https://ai-sdk.dev/docs/agents/loop-control).

---

### Pitfall 2: Next.js Response Buffering Kills SSE Streaming

**What goes wrong:** Player types a message. Server calls Claude API, which streams tokens back. Server tries to relay those tokens to the browser via SSE. But the player sees nothing for 10-30 seconds, then the entire response dumps at once. The "streaming" experience is indistinguishable from a loading spinner.

**Why it happens:** Three separate buffering layers conspire against you:

1. **Next.js compression:** Enabled by default, buffers the entire response before compressing and sending. Tokens accumulate server-side and flush only on `res.end()`.
2. **App Router handler pattern:** Next.js waits for the route handler function to complete before sending the Response. If you `await` the Claude stream inside the handler before returning the Response object, everything buffers.
3. **Reverse proxy buffering:** nginx (common on Railway/Fly.io) defaults to buffering responses. SSE events pile up in the proxy layer.

**Consequences:** Core UX is broken. The entire pitch of a streaming RPG narrative falls flat. Players will think the app is frozen.

**Warning signs:**
- "Works in development, broken in production" (dev mode may not compress)
- SSE events arrive in bursts rather than character-by-character
- Long Time to First Byte (TTFB) on streaming routes despite Claude responding quickly

**Prevention:**
1. **Disable compression** in `next.config.js`: `compress: false`. Let the reverse proxy handle compression of non-streaming routes.
2. **Use the TransformStream pattern in App Router:** Return the `Response` immediately with the readable side of a `TransformStream`. Write to the writable side asynchronously AFTER the return. Never `await` the full stream before returning.
3. **Set anti-buffering headers:**
   ```
   Content-Type: text/event-stream; charset=utf-8
   Cache-Control: no-cache, no-transform
   Connection: keep-alive
   X-Accel-Buffering: no          // nginx
   ```
4. **Configure proxy timeout:** If using nginx, set `proxy_buffering off` and `proxy_read_timeout 86400`.
5. **Test in production-like environment early** -- local dev with `next dev` does not reproduce this bug.

**Detection:** Measure TTFB in the browser on the SSE endpoint. If TTFB > 2s when Claude's first token arrives in < 500ms, you have a buffering problem.

**Phase:** Must be addressed in the first streaming implementation. Test with a deployed environment (Railway/Fly.io) in the same phase as the chat route, not later.

**Confidence:** HIGH -- this is the [most reported Next.js SSE issue](https://github.com/vercel/next.js/discussions/48427), with 200+ comments. The compression fix is documented in [multiple](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996) [sources](https://github.com/vercel/next.js/discussions/67026).

---

### Pitfall 3: Truncated Tool Call from max_tokens Hit

**What goes wrong:** Claude is mid-way through generating a `tool_use` content block (e.g., building the JSON input for `create_node` with a long description) and hits the `max_tokens` limit. The response arrives with `stop_reason: "max_tokens"` and the last content block is an incomplete `tool_use` with truncated/invalid JSON input.

**Why it happens:** RPG narration + tool calls can be verbose. A single turn might include 500 tokens of narration text PLUS a `tool_use` block. If `max_tokens` is set too low (e.g., 1024), the tool call input gets chopped. With fine-grained streaming, the `input_json_delta` events arrive without buffering or JSON validation, so the accumulated JSON is invalid.

**Consequences:** If you naively try to `JSON.parse()` the tool input, the server crashes or returns an error. The player sees either a blank response or a broken error message. The turn is lost.

**Warning signs:**
- `stop_reason === "max_tokens"` appearing in production logs
- JSON parse errors on tool call inputs
- Responses that end abruptly mid-sentence

**Prevention:**
1. **Set max_tokens generously:** Use 4096 minimum for RPG narration (which is verbose by nature). The system prompt + 25 tool definitions already consume significant context, so be generous with output.
2. **Always check stop_reason before processing tool calls:** If `stop_reason === "max_tokens"` and the last content block is `type: "tool_use"`, retry with higher max_tokens (Anthropic's official recommendation). Do NOT attempt to parse the truncated input.
3. **Handle ALL stop_reasons explicitly:** `end_turn`, `tool_use`, `max_tokens`, `stop_sequence`, `pause_turn`, `refusal`, `model_context_window_exceeded`. Unhandled stop_reasons should log a warning, not crash.
4. **Accumulate input_json_delta carefully** when using fine-grained streaming. Wrap the final `JSON.parse` in try/catch and handle failure gracefully.

**Detection:** Monitor for `max_tokens` stop_reason occurrences. If it happens more than 1% of turns, raise the limit.

**Phase:** Implement in the same phase as the Claude API integration. This is not a polish item.

**Confidence:** HIGH -- explicitly documented in [Anthropic's stop reason handling docs](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons) and the [streaming docs](https://platform.claude.com/docs/en/build-with-claude/streaming).

---

### Pitfall 4: Per-User WorldStore Concurrency (Multiple Tabs / Rapid Requests)

**What goes wrong:** A player has two browser tabs open. Tab A sends a message; the agentic loop reads the world file, calls 5 tools (each reading/writing the file), and is mid-way through tool 3. Tab B sends a message; its agentic loop reads the world file (which is now stale because Tab A has written 2 tools but not finished). Tab B's tool calls overwrite Tab A's changes. Nodes and edges are silently lost.

**Why it happens:** The existing `WorldStore` uses a per-instance promise-based mutex (`lockQueue`). This protects individual tool calls within a single request from interleaving, but does NOT protect against concurrent requests from the same user. In the web app, each API request creates a new handler invocation -- they do not share a mutex instance unless explicitly architected to do so.

**Consequences:** Game state corruption. Nodes created by one turn vanish in the next. Edges go missing. The "persistence is the pitch" core value is undermined. This is the same class of bug as the [existing playtest file contention issue](/.planning/codebase/CONCERNS.md) but now it affects real players.

**Warning signs:**
- Player reports "my inventory changed" or "NPC forgot what I said"
- Write guard triggers: "WRITE BLOCKED: would drop N nodes"
- Different responses in different tabs for the same world

**Prevention:**
1. **Per-user request queue:** Do not allow concurrent Claude API calls for the same user. Queue incoming requests at the API route level. If a turn is in progress, hold the new request (or return "still thinking..."). This is the simplest and most correct solution for 10 users.
2. **Singleton WorldStore per user:** Keep a `Map<userId, WorldStore>` in a module-level singleton. All requests for the same user share the same instance (and therefore the same mutex). This only works in a single-process Node.js deployment (which Railway/Fly.io single-instance is).
3. **In-memory cache with write-through:** Load the world file into memory on session start. All tool calls operate on the in-memory copy. Write to disk atomically after each turn completes (not after each tool call). This eliminates the per-tool-call disk I/O and makes the mutex simpler.
4. **Extend the write guard to edges** (currently only checks node count -- documented in CONCERNS.md).

**Detection:** Add a request counter per user. If a second request arrives while one is active, log a warning. Never silently allow concurrent world file access.

**Phase:** Must be solved in the engine extraction phase, before the web API routes are built. The architecture of "one WorldStore instance per user, shared across requests" must be established early.

**Confidence:** HIGH -- the existing codebase already documents this as a known fragility (CONCERNS.md: "Promise-Based Mutex is Per-Instance Only").

---

### Pitfall 5: Exposing Game Logic to the Frontend

**What goes wrong:** Game engine functions, graph schema, NPC voice guides, system prompts, or dice mechanics leak to the browser. A tech-savvy player inspects network requests and sees the entire game engine.

**Why it happens:** Convenience. It is easier to call engine functions from React than to proxy through API routes. SSE events might include raw tool results (tool_use blocks, tool_result blocks with full graph data).

**Consequences:** IP exposure. Players can see NPC secrets, upcoming storylets, dice probabilities, and narrative health scores. The magic is gone. For a product with 10 engineer playtesters, they WILL inspect the network tab.

**Warning signs:**
- Tool call names visible in SSE event data
- NPC knowledge edges or voice guides in network responses
- System prompt or dice roll details in browser DevTools

**Prevention:**
1. Frontend is a dumb terminal. It sends player messages and receives narrated text + sidebar state. All tool calls, system prompts, and engine functions stay server-side.
2. SSE streams ONLY the narrator's text output, not intermediate tool_use/tool_result blocks.
3. Sidebar data comes from a separate REST endpoint that returns a sanitized view of `get_scene_context()` -- NPC opinion weights and knowledge edges are not exposed.
4. Never send tool call names, parameters, or results to the client.

**Detection:** Open browser DevTools on any page. If you can see tool call names, dice results, or NPC knowledge edges in the network tab, the architecture is wrong.

**Phase:** Enforce from the first API route. Define the SSE event format (text-only) and sidebar response format (sanitized) before writing any frontend code.

**Confidence:** HIGH -- the PROJECT.md explicitly lists "All game logic server-side. Frontend sees only chat messages and rendered scene context" as a constraint.

---

### Pitfall 6: API Key Encryption with Hardcoded or Leaked Encryption Key

**What goes wrong:** You encrypt user API keys with AES-256-GCM (good). But the encryption key is stored in an environment variable that gets committed to git, or is the same key for all users, or is derived from a weak source. An attacker who gains read access to the server (or the volume) can decrypt every user's Anthropic API key.

**Why it happens:** Encryption is easy. Key management is hard. Developers new to encryption often hardcode the key, use a predictable derivation, or store it alongside the encrypted data.

**Consequences:** All 10 users' Anthropic API keys are compromised. Attacker can use them to run arbitrary Claude API calls at the users' expense. Trust with your DM friend's Silicon Valley network is destroyed.

**Warning signs:**
- Encryption key is in `.env` file that was accidentally committed in an earlier commit
- Same IV used for multiple encryptions (deterministic ciphertext)
- `api_key.enc` files are identical for the same key entered by different users (indicates no per-user salt)

**Prevention:**
1. **Per-user encryption:** Generate a unique encryption key per user derived from a master key + user ID using scrypt or HKDF. Even if one user's key is compromised, it does not reveal others.
2. **Master key in environment variable ONLY:** Never in code, never in a file on the volume. Set via Railway/Fly.io secrets management (both support this).
3. **Unique IV per encryption:** Use `crypto.randomBytes(16)` for every encryption operation. Store the IV alongside the ciphertext (this is standard and safe).
4. **GCM mode with authentication tag:** AES-256-GCM provides both encryption and tamper detection. If someone modifies the encrypted file, decryption fails rather than producing garbage.
5. **Validate the decrypted key:** After decryption, make a lightweight Anthropic API call to verify the key works before using it for a game turn.

**Detection:** Automated test that encrypting the same plaintext twice produces different ciphertexts. Code review checkpoint for any PR that touches encryption.

**Phase:** Build in the auth/settings phase. Get it right the first time -- retrofitting encryption is painful.

**Confidence:** HIGH -- standard cryptographic best practices, verified against [Node.js crypto docs](https://nodejs.org/api/crypto.html) and [AES-GCM encryption guides](https://medium.com/@jballo/building-server-side-api-key-encryption-with-convex-and-node-js-crypto-29f69e0de8c6).

---

### Pitfall 7: Chat History as Memory (Architecture Regression)

**What goes wrong:** Using conversation history as the source of truth for what happened in the game. When sessions get long, the context window fills, old messages get truncated, and the AI "forgets" earlier events. This is the number one complaint about AI Dungeon and Character.AI.

**Why it happens:** Chat history is the obvious first implementation. It is what ChatGPT does. The temptation is strong to append everything to a messages array and let the context window be the "memory."

**Consequences:** NPCs forget critical plot points. The world contradicts itself. The "persistence" promise breaks. This is literally the failure mode of every competitor, and the graph architecture exists to prevent it.

**Warning signs:**
- Implementing chat history summarization or "memory banks"
- Conversation history growing beyond 10 message pairs
- Claude referencing events from early in the conversation that are no longer in the context window

**Prevention:**
1. The graph IS the memory. Each new session starts with a fresh conversation. `get_scene_context()` and the system prompt reconstruct narrator state from the graph, not from chat history.
2. The "Previously on..." recap is generated from EVENT nodes, not from summarizing old messages.
3. Within a session, keep a sliding window of the last 5-8 message pairs. Strip tool_use/tool_result blocks from history (keep only final narration text).

**Detection:** If you are implementing chat history summarization or persistent message storage beyond the current session, you have drifted from the architecture.

**Phase:** The conversation management strategy must be defined in the same phase as the Claude API integration.

**Confidence:** HIGH -- this is the core architectural insight of the existing RPG engine, validated by the 20-year DM playtest.

---

## Moderate Pitfalls

### Pitfall 8: SSE Connection Drops and Lost Narration

**What goes wrong:** A player's SSE connection drops mid-narration (network hiccup, laptop sleep, tab switching on mobile). The browser's native `EventSource` auto-reconnects after ~3 seconds. But the server has already finished the Claude API call and closed the stream. The reconnected EventSource receives nothing -- the rest of the narration is lost.

**Why it happens:** SSE auto-reconnection is designed for persistent event streams (stock tickers, notifications), not for request-response patterns like "stream this one Claude response." The reconnection mechanism has no way to resume a completed Claude call.

Additionally, browsers limit SSE connections to 6 per domain under HTTP/1.1. If a player opens multiple tabs, they exhaust the connection pool and all tabs hang.

**Prevention:**
1. **Use `fetch()` with `ReadableStream`, not `EventSource`:** For request-scoped streaming (one Claude response per request), use `fetch()` and read the response body as a stream. This gives explicit control over the lifecycle -- no surprise auto-reconnects, no connection pool limits.
2. **Persist the completed turn server-side.** If the SSE connection drops after Claude finishes but before the client receives all tokens, the client can fetch the complete response on reconnect via a REST endpoint.
3. **HTTP/2:** Deploy behind an HTTP/2-capable proxy (Railway and Fly.io both support this). HTTP/2 multiplexes connections, eliminating the 6-connection limit.
4. **Heartbeat comments:** Send `: keepalive\n\n` every 15 seconds on long-running connections to prevent intermediate proxies from closing idle connections.

**Detection:** Track "connection_close" events server-side. If a stream closes before the turn completes, the client did not receive the full response.

**Phase:** Address when building the SSE streaming layer. The choice between `EventSource` and `fetch()` must be made upfront.

**Confidence:** HIGH -- [MDN EventSource docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events), [SSE production-readiness critique](https://dev.to/miketalbot/server-sent-events-are-still-not-production-ready-after-a-decade-a-lesson-for-me-a-warning-for-you-2gie).

---

### Pitfall 9: Empty Responses After Tool Results (Claude Ends Turn Prematurely)

**What goes wrong:** After executing a tool call and sending the `tool_result` back to Claude, Claude responds with an empty message (`stop_reason: "end_turn"`, zero content). The player sees nothing. The narration never arrives.

**Why it happens:** This is a documented Claude API behavior. If you add extra text blocks alongside `tool_result` messages, Claude learns to expect user input after tool execution and ends its turn to "let the user speak." This is especially likely in multi-turn agentic loops.

**Consequences:** The player's action completes mechanically (dice rolled, nodes created) but they get no narrative response. The game feels broken.

**Warning signs:**
- Empty assistant messages after tool calls in logs
- Players reporting "nothing happened" after actions
- `stop_reason === "end_turn"` with `content.length === 0`

**Prevention:**
1. **Never add text blocks alongside tool_result blocks.** Send tool results as-is, without "Here's the result" wrapper text.
2. **Detect empty responses:** If `stop_reason === "end_turn"` and `content` is empty, append a new user message ("Please narrate the outcome of the action") and make one retry API call.
3. **Do not send the empty response back as-is.** Claude will stay "done" if you just append it to the conversation. You must add a new user turn to prompt continuation.

**Detection:** Check `response.content.length === 0` after every Claude API call in the agentic loop. Log it as a warning.

**Phase:** Build into the agentic loop from the start.

**Confidence:** HIGH -- explicitly documented in [Anthropic's stop reason handling docs](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons) under "Empty responses with end_turn."

---

### Pitfall 10: Railway Volume Causes Deployment Downtime

**What goes wrong:** You push a code update. Railway deploys the new version. But because a persistent volume is attached, Railway cannot run the old and new version simultaneously (both would need the volume mounted). So it stops the old version first, then starts the new one. During this window (10-60 seconds), the app is completely down. Players in mid-game get disconnected.

**Why it happens:** Railway explicitly prevents multiple deployments from mounting the same volume to avoid data corruption. This is by design, not a bug. Fly.io has the same limitation -- volumes are provisioned 1:1 with instances, and apps with volumes get rolling deploys instead of canary deploys.

**Consequences:** Every `git push` causes downtime. During rapid iteration in the first weeks, this means the app goes down multiple times per day.

**Prevention:**
1. **Accept it for MVP.** For 10 users, brief downtime on deploy is tolerable. Warn users in Discord: "Deploying update, back in 30 seconds."
2. **Deploy during off-hours.** Batch deploys to times when users are unlikely to be playing.
3. **Graceful shutdown:** Handle SIGTERM in the Node.js process. Save any in-flight game state, close SSE connections with a "server restarting" event, and exit cleanly.
4. **For future scale:** Decouple storage from the app process. Use an external store or database.

**Detection:** Monitor deployment duration. Set up uptime monitoring.

**Phase:** Acceptable during initial deployment. Revisit if deploy frequency is high or user count grows.

**Confidence:** HIGH -- [Railway volume docs](https://docs.railway.com/volumes/reference) explicitly state this limitation.

---

### Pitfall 11: System Prompt + 25 Tool Definitions = Context Window Bloat

**What goes wrong:** The narrator system prompt (separation of powers, therefore/but rules, NPC voice guides, scene context) is 2,000-4,000 tokens. The 25 tool definitions with detailed descriptions add another 3,000-5,000 tokens. Plus conversation history. A mid-session turn can start at 10,000+ input tokens before the player types. Context fills up fast, and per-turn costs add up for BYO-key users.

**Why it happens:** Good tool definitions are verbose (Anthropic recommends "at least 3-4 sentences per tool description"). The RPG system prompt is necessarily complex. Conversation history grows linearly with turns.

**Consequences:** At roughly 8,000 input tokens per turn with Sonnet-class pricing ($3/Mtok input, $15/Mtok output), each turn costs approximately $0.07-0.10. A 30-minute session (20 turns) costs $1.40-2.00 per player. Users may balk at the API costs.

**Prevention:**
1. **Use `defer_loading: true` for rarely-used tools.** Tools like `delete_node`, `trace_blocks`, `find_conflicts` are called rarely. Mark them as deferred so Claude loads them on demand via tool search. This is a GA feature in Claude 4+ models.
2. **Trim conversation history aggressively.** Keep the last 5-8 message pairs max. Strip tool_use/tool_result blocks -- they are execution artifacts.
3. **Dynamic system prompt:** Only inject NPC voice guides for NPCs in the current scene, not all NPCs in the world.
4. **Use prompt caching** for the system prompt and tool definitions (identical across turns within a session).

**Detection:** Log input_tokens and output_tokens for every API call. Dashboard showing average cost per turn, per session, per user.

**Phase:** Make architectural decisions (defer_loading, history trimming) during the engine extraction phase. Token monitoring in the first deployed phase.

**Confidence:** MEDIUM -- token counts are estimates. Actual numbers depend on implementation.

---

### Pitfall 12: Disk I/O During Agentic Loop Multiplies Latency

**What goes wrong:** Each tool call in the agentic loop reads the world file from disk, performs a linear scan, optionally writes back, and returns. With 5-8 tool calls per turn, that is 5-8 disk reads and 2-4 disk writes. On a cheap VPS with networked storage (Railway/Fly.io volumes are network-attached), each operation can take 5-20ms. Total added latency: 50-200ms per turn.

**Why it happens:** The existing `WorldStore` is intentionally stateless -- each call reads fresh from disk. This was fine for the MCP server (one user, local SSD), but becomes a bottleneck on networked storage.

**Prevention:**
1. **In-memory cache per user.** Load the world file into memory on session start. All tool calls operate on the in-memory copy. Write to disk once per completed turn, not per tool call.
2. **Lazy-write / write-behind:** Buffer writes and flush periodically or on turn completion. Use `writeFile` with atomic rename (the existing pattern) for crash safety.
3. **Keep per-user files small.** A 100-node world should be < 50KB. At this size, even cold reads are < 5ms.

**Detection:** Instrument tool call execution time separately from Claude API call time.

**Phase:** Address during engine extraction. The in-memory cache is the natural evolution of the existing `WorldStore.read()` pattern.

**Confidence:** HIGH -- the existing codebase documents this as a scaling concern (CONCERNS.md: "Linear Scan on Every Tool Call").

---

## Minor Pitfalls

### Pitfall 13: No Request Abort Handling (Leaked Server Resources)

**What goes wrong:** Player navigates away or closes the tab while Claude is mid-response. The SSE connection closes, but the server-side Claude API call keeps running (and burning tokens). Tool calls continue executing against the world file.

**Prevention:**
1. Listen to `req.signal` (AbortSignal) in the API route handler.
2. On abort, cancel the Anthropic SDK stream.
3. Log the abort so you know it happened. In-progress world changes are acceptable (the world evolved; the player sees results next time).

**Phase:** Add when implementing the SSE streaming route.

---

### Pitfall 14: Claude Refuses RPG Content (Safety Filter False Positives)

**What goes wrong:** A player's RPG scenario involves combat, threats, morally grey NPCs, or dark fantasy themes. Claude's safety filter triggers a `refusal` stop_reason. The game halts.

**Prevention:**
1. Handle `stop_reason === "refusal"` explicitly. Show a graceful in-world message: "The story shifts..." and redirect the narrative.
2. Craft the system prompt to set the RPG context clearly.
3. Keep the tone at PG-13 action/adventure level.
4. The `refusal` stop_reason is standard in Claude 4+ models. Your code must handle it -- it is not an error.

**Phase:** Handle in the agentic loop from the start (same as other stop_reasons).

---

### Pitfall 15: Volume Data Not Available During Build or Pre-deploy

**What goes wrong:** Initialization logic (creating invite codes, seeding default data) runs in a build step or pre-deploy hook. It writes to `/data/users/`. On Railway and Fly.io, volumes are NOT mounted during build time. The data vanishes.

**Prevention:**
1. All data initialization must happen at runtime, not build time. Use the app's startup sequence to check for and create required directories/files.
2. Mount paths must use absolute paths matching the volume mount point.

**Phase:** Address in the deployment phase. Test with a real deploy, not just `next dev`.

**Confidence:** HIGH -- [Railway volume docs](https://docs.railway.com/volumes) and [Fly.io volume docs](https://fly.io/docs/volumes/overview/) both state this.

---

### Pitfall 16: switchTo() Race Condition During Campaign Switching

**What goes wrong:** Player loads a different world via the world picker. `switchTo()` changes the WorldStore's file path immediately. But an in-flight write from the previous world is still pending. The pending write completes and writes old world data to the new world's file path.

**Prevention:**
1. **Do not use `switchTo()` in the web app.** Create separate WorldStore instances per world file. The user's active world is determined by which instance is used, not by mutating a file path on a shared instance.
2. Alternatively, make `switchTo()` async and await the lock queue before changing the path.

**Phase:** Address during engine extraction when refactoring WorldStore for web use.

**Confidence:** HIGH -- documented in CONCERNS.md as a fragile area.

---

### Pitfall 17: Onboarding Breaks When Ported from MCP to Web

**What goes wrong:** The fugue state onboarding works perfectly in Claude Code (where the developer controls the entire experience) but breaks in the web app because the system prompt is constructed differently, tool calls fail silently, or the multi-step onboarding flow is harder to manage via API.

**Prevention:**
1. Port the onboarding as the FIRST integration test, not the last. The onboarding exercises every system: Claude API, tool_use, world creation, character creation, event logging.
2. If onboarding works end-to-end, every other feature is mechanically viable.

**Phase:** Test onboarding in the same phase as the Claude API integration. Do not defer.

---

### Pitfall 18: Streaming Markdown Rendering Breaks Mid-Token

**What goes wrong:** Narrator responses contain markdown (bold, italic, headers). During streaming, partial markdown tokens break rendering -- half-open bold tags (`**partial`), incomplete code fences, broken lists.

**Prevention:** Buffer incomplete markdown before rendering. Use a streaming-aware markdown renderer. Test with real Claude responses that contain formatting mid-stream.

**Phase:** Address when building the chat UI component.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Engine extraction | WorldStore concurrency model breaks in multi-request context (#4), switchTo() race (#16) | Per-user singleton pattern, in-memory cache, separate instances per world |
| Claude API integration | Agentic loop cost explosion (#1), truncated tool calls (#3), empty responses (#9), refusals (#14) | Hard step limit, max_tokens >= 4096, empty response retry, refusal handler |
| SSE streaming | Response buffering (#2), connection drops (#8), resource leaks (#13) | Disable compression, TransformStream pattern, fetch() over EventSource, abort handling |
| Auth & API key storage | Weak encryption (#6) | AES-256-GCM, per-user key derivation, unique IV per encryption |
| Frontend | IP exposure (#5), markdown rendering (#18) | Dumb terminal architecture, streaming-aware renderer |
| Deployment | Volume downtime (#10), build-time data loss (#15) | Accept for MVP, runtime-only initialization |
| Session management | Chat history as memory (#7), context bloat (#11), history growth | Graph is the truth, trim to 5-8 turns, defer_loading for rare tools |
| Performance | Disk I/O latency (#12) | In-memory cache, write-through on turn completion |
| Onboarding | Fugue state breaks when ported (#17) | Port as first integration test |

---

## Sources

### Official Anthropic Documentation (HIGH confidence)
- [Handling Stop Reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons) -- all stop_reason values, empty response behavior, truncated tool calls
- [Streaming Messages](https://platform.claude.com/docs/en/build-with-claude/streaming) -- SSE event types, content_block_delta, fine-grained tool streaming
- [How to Implement Tool Use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use) -- tool definitions, best practices, tool_choice
- [Tool Use Overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) -- agentic loop pattern, stop_reason handling
- [How the Agent Loop Works](https://platform.claude.com/docs/en/agent-sdk/agent-loop) -- SDK-level loop implementation

### Platform Documentation (HIGH confidence)
- [Railway Volumes Reference](https://docs.railway.com/volumes/reference) -- volume deployment downtime, mount limitations
- [Railway Using Volumes](https://docs.railway.com/volumes) -- build-time vs runtime data, mount paths
- [Fly.io Volumes Overview](https://fly.io/docs/volumes/overview/) -- 1:1 volume-instance binding, rolling deploys
- [Next.js Self-Hosting Guide](https://nextjs.org/docs/app/guides/self-hosting) -- standalone output, custom server considerations
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html) -- AES-256-GCM, scrypt, randomBytes
- [MDN Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) -- EventSource behavior, 6-connection limit, auto-reconnection

### Community / Issue Trackers (MEDIUM confidence)
- [Next.js SSE Discussion #48427](https://github.com/vercel/next.js/discussions/48427) -- res.write buffering, compression issue
- [Next.js Streaming Discussion #67026](https://github.com/vercel/next.js/discussions/67026) -- App Router streaming patterns
- [Fixing Slow SSE in Next.js (Medium)](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996) -- compression fix, TransformStream pattern
- [SSE Production Readiness (DEV.to)](https://dev.to/miketalbot/server-sent-events-are-still-not-production-ready-after-a-decade-a-lesson-for-me-a-warning-for-you-2gie) -- connection management pitfalls
- [Agentic Resource Exhaustion (Medium)](https://medium.com/@instatunnel/agentic-resource-exhaustion-the-infinite-loop-attack-of-the-ai-era-76a3f58c62e3) -- runaway loop costs
- [AI SDK Loop Control](https://ai-sdk.dev/docs/agents/loop-control) -- step limits, token budgets
- [Node.js writeFile Corruption](https://github.com/nodejs/help/issues/2346) -- concurrent write issues
- [AES-256-GCM in Node.js (Medium)](https://medium.com/@jballo/building-server-side-api-key-encryption-with-convex-and-node-js-crypto-29f69e0de8c6) -- encryption patterns

### Project-Internal (HIGH confidence)
- `.planning/codebase/CONCERNS.md` -- WorldStore mutex limitations, write guard gaps, switchTo() race condition, linear scan latency
- `mcp-server/src/store.ts` -- current concurrency model: per-instance lockQueue, atomic write via tmp+rename
- `docs/superpowers/specs/2026-04-03-rpg-web-mvp-design.md` -- architecture constraints, SSE choice, BYO API key model

---

*Pitfalls audit: 2026-04-03*
