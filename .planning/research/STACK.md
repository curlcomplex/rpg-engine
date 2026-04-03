# Technology Stack

**Project:** RPG Web MVP -- AI Chat Web App with Game Engine
**Researched:** 2026-04-03
**Overall confidence:** HIGH (all versions verified via npm registry)

## Decision: Direct Anthropic SDK, Not Vercel AI SDK

The most consequential stack decision for this project. Use `@anthropic-ai/sdk` directly instead of Vercel AI SDK.

**Why:**
1. **Tool execution control matters.** The RPG engine has 25 tools with interdependencies (e.g., `attempt_action` results feed into `log_event`, `interview_npc` must respect `do_not_reference` lists). Reports exist of AI SDK causing tool execution order deviations when using custom workflow prompts -- the agent calls tools out of order or skips steps. This is fatal for a game engine where `therefore/but` causal chains must be preserved.
2. **No provider-switching needed.** The game is built specifically around Claude's instruction-following capabilities. Provider abstraction adds complexity with zero benefit.
3. **The tool loop is the product.** The server needs to intercept every tool call, execute it against the user's world file, stream intermediate narration, and control the conversation flow. AI SDK's automatic tool loop hides this control surface.
4. **Prompt caching.** Anthropic's SDK gives direct access to prompt caching (`cache_control` blocks), which is critical when the system prompt includes NPC voice guides and scene context that repeat across turns. AI SDK's abstraction makes this harder to control.
5. **Fewer dependencies.** Direct SDK = one dependency instead of `ai` + `@ai-sdk/anthropic` + framework-specific wrappers.

**Confidence:** HIGH -- based on project requirements analysis and SDK documentation review.

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | ^16.2 | Full-stack framework (frontend + API routes) | Single deployable unit. App Router is stable and production-ready. Route Handlers support SSE via ReadableStream. Standalone output mode produces ~100-200MB Docker images for Railway. The project already chose Next.js -- this validates it. |
| React | ^19.2 | UI rendering | Ships with Next.js 16. React 19 adds server components, `use()` hook, and improved streaming support. |
| TypeScript | ^5.8 | Type safety across entire stack | Already used in the MCP server. TypeScript 5.8+ for satisfies operator and const type parameters. Match the existing codebase. |

### AI Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @anthropic-ai/sdk | ^0.82 | Claude API calls with tool_use and streaming | Direct SDK gives full control over the tool execution loop. `messages.create({ stream: true })` returns async iterable of SSE events. `messages.stream()` provides higher-level helpers with `.on('contentBlock')` event emitters. The SDK's built-in `toolRunner()` can handle automatic tool execution when desired, but the manual loop is preferred here for streaming intermediate results. |

### Authentication and Security

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| iron-session | ^8.0 | Stateless encrypted cookie sessions | No database needed. Session data encrypted in the cookie itself using `@hapi/iron` sealing. Single `getIronSession()` API works with Next.js App Router route handlers and server actions. Recommended by Next.js docs. For 10 users with invite-code auth, this is the simplest correct choice. |
| argon2 | ^0.44 | Password hashing | Argon2id is the 2025/2026 gold standard (PHC winner). Memory-hard -- resists GPU/ASIC attacks better than bcrypt. Use with `type: argon2id`, memoryCost: 19456, timeCost: 2, parallelism: 1. NOTE: If Node.js ABI issues arise (reported with Node 23), fall back to `@node-rs/argon2` which has an identical API via N-API. |
| Node.js crypto (built-in) | N/A (Node 20+) | AES-256-GCM encryption for API keys | Zero-dependency. `crypto.createCipheriv('aes-256-gcm', key, iv)` with random 12-byte IV per encryption. Store encrypted blob + IV + auth tag together in the `.enc` file. Encryption key from `ENCRYPTION_KEY` env var. No external library needed. |

### Styling and UI

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | ^4.2 | Utility-first CSS | v4 is CSS-first (no `tailwind.config.js`), 70% smaller output than v3, 5x faster builds. `create-next-app --tailwind` scaffolds v4 automatically. Perfect for rapid iteration on a chat UI. |
| shadcn/ui | latest (copy-paste) | UI component primitives | Not a package -- copy-paste components built on Radix UI + Tailwind. Use for: ScrollArea (chat container), Button, Input, Dialog (settings modal), Sheet (sidebar on mobile). Only copy what you need. |

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| zustand | ^5.0 | Client-side state | Minimal API, no boilerplate, works with React 19. Use for: chat messages array, streaming state, sidebar data, connection status. One store, simple selectors. The chat app state is essentially one object (messages + sidebar + settings) -- zustand handles this in ~30 lines. Jotai's atomic model is overkill for this shape. |

### ID Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| nanoid | ^5.1 | Unique IDs for users, invite codes, sessions | Already used in the MCP server. 21-char URL-safe IDs, 118 bytes, cryptographically secure. Consistent with existing codebase. |

### Build and Dev Tools

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| tsup | ^8.5 | Build shared engine package | Already used for MCP server. Fast esbuild-based bundler. Use for `packages/engine/` to produce ESM that both MCP and web import. |
| TypeScript | ^5.8 | Shared type checking | Same version across all packages in the monorepo. |

### Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Railway | N/A | Hosting platform | Simplest path from git push to running app. Auto-detects Next.js, builds via Railpack. Persistent volumes for `/data/users/` at $0.25/GB/month. Hobby plan = $5/month base. No Dockerfile required (though supported). Domain + SSL included. The developer is new to web infra -- Railway's DX is the most forgiving. |

## Architecture-Critical: SSE Streaming Pattern

The streaming architecture deserves explicit stack documentation because it's the most technically complex part.

### Server Side (Next.js Route Handler)

```typescript
// app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  // 1. Parse user message, load world file, build system prompt
  // 2. Create ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // 3. Call Anthropic with streaming
      const client = new Anthropic({ apiKey: userApiKey });
      let messages = [...conversationHistory, { role: 'user', content: userMessage }];

      // 4. Tool loop -- keep going until stop_reason is 'end_turn'
      while (true) {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4096,
          system: systemPrompt,
          messages,
          tools: gameToolDefinitions,
          stream: true,
        });

        let currentText = '';
        let toolUseBlocks = [];

        for await (const event of response) {
          if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              currentText += event.delta.text;
              send('text', { text: event.delta.text }); // Stream to client
            }
          }
          if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
            // Accumulate tool call
          }
          if (event.type === 'message_stop') {
            // Check stop_reason
          }
        }

        // 5. If tool_use, execute tools against world file, continue loop
        // 6. If end_turn, send sidebar update and close stream
        if (stopReason !== 'tool_use') break;

        // Execute tools, append results, loop back
        messages.push({ role: 'assistant', content: assistantContent });
        messages.push({ role: 'user', content: toolResults });
      }

      send('sidebar', { sceneContext: await getSceneContext(worldStore) });
      send('done', {});
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
```

### Client Side

```typescript
// Use native EventSource or fetch + ReadableStream reader
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ message, worldId }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Parse SSE events, update zustand store
}
```

**Why not WebSocket:** SSE is sufficient because streaming is server-to-client only. The client sends messages via POST. WebSocket adds connection management complexity (reconnection, heartbeats, state sync) with zero benefit for this pattern. SSE reconnects automatically via the browser's EventSource API.

**Why not Vercel AI SDK `useChat()`:** The `useChat()` hook assumes a standard chat pattern. This app needs to intercept tool calls server-side, stream intermediate results, update sidebar state, and manage the tool loop manually. `useChat()` would fight the architecture at every step.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| AI SDK | @anthropic-ai/sdk (direct) | Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) | Abstraction hides tool loop control. Reports of tool execution order deviations. No need for provider switching. Prompt caching control lost. |
| Session mgmt | iron-session | NextAuth.js / Auth.js | Massively over-engineered for invite-code auth with 10 users. Adds OAuth machinery, database adapters, and configuration complexity that serve zero purpose here. |
| Password hash | argon2 | bcrypt | Argon2id is strictly superior (memory-hard). bcrypt is fine but why use 1999 tech when the better option is one `npm install` away. |
| API key encryption | Node.js crypto (AES-256-GCM) | libsodium / tweetnacl | Built-in module, zero dependencies. AES-256-GCM provides authenticated encryption. External crypto libs add supply chain risk for no benefit. |
| CSS | Tailwind v4 | CSS Modules / styled-components | Tailwind is faster to iterate with for chat UI layouts. CSS-in-JS (styled-components) has SSR hydration issues with React 19. CSS Modules are fine but slower for rapid prototyping. |
| State mgmt | zustand | Jotai / Redux Toolkit | Jotai's atomic model is overkill for one chat + sidebar store. Redux Toolkit has too much boilerplate for a 10-user MVP. zustand is the Goldilocks choice. |
| UI components | shadcn/ui (copy-paste) | Material UI / Chakra UI / Ant Design | These are heavy runtime dependencies with opinionated styling. shadcn/ui gives you source code ownership -- copy what you need, style with Tailwind, no dependency. |
| Hosting | Railway | Fly.io / Vercel / Render | Fly.io requires Dockerfiles and more config. Vercel doesn't support persistent volumes (need disk storage for world files). Render is fine but Railway's DX is better for beginners. |
| Streaming | SSE via ReadableStream | WebSocket | One-way server-to-client streaming. WebSocket adds reconnection complexity, heartbeats, and bidirectional state management for zero benefit. |
| ID generation | nanoid | uuid | Already in codebase. Smaller (118B vs 423B), faster, URL-safe by default. |
| Bundler (engine pkg) | tsup | esbuild direct / Rollup | Already in use. tsup wraps esbuild with DTS generation. Consistent tooling. |

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| Prisma / Drizzle / any ORM | No database. World files are JSON on disk. Adding a database for 10 users is pure over-engineering. |
| NextAuth.js / Auth.js | OAuth, magic links, email auth -- none needed. Invite codes + username/password + iron-session is 50 lines of code. |
| Socket.io / ws | WebSocket adds complexity. SSE is simpler and sufficient for server-to-client streaming. |
| LangChain | Abstraction layers on top of abstraction layers. Direct SDK calls are clearer and more debuggable. LangChain's chain/agent abstractions fight the existing game engine architecture. |
| Vercel AI SDK `useChat()` | Assumes standard chatbot pattern. Cannot intercept tool calls, stream intermediate state, or manage custom tool loops. |
| tRPC | The API surface is ~5 endpoints (auth, chat, worlds, settings, scene). Route handlers with TypeScript types are sufficient. tRPC adds build complexity for minimal type safety gain. |
| Docker (for development) | Railway's Railpack auto-builds. Docker is available as escape hatch but not needed on day one. |
| Redis / Memcached | 10 users. In-memory state or file reads are fine. |
| Sentry / DataDog / monitoring | Not for MVP. `console.error` + Railway logs. Add observability when there are real users to observe. |

## Monorepo Structure

```
RPG/
  packages/
    engine/           # Shared game logic (extracted from mcp-server/)
      src/
        store.ts      # WorldStore (already exists, minimal changes)
        dice.ts       # Dice engine
        narrative.ts  # Event logging, investigation, interview
        queries.ts    # trace_blocks, detect_neglect, find_conflicts
        drama.ts      # narrative_health, npc_agendas, storylets
        types.ts      # GameNode, GameEdge, WorldDocument, etc.
      package.json    # "rpg-engine" - tsup builds ESM
  mcp-server/         # MCP adapter (thin wrapper importing engine)
    src/
      server.ts       # MCP protocol translation only
      index.ts        # Stdio transport entry point
  web/                # Next.js web app
    app/
      api/
        auth/         # Login, register, invite code validation
        chat/         # Claude API proxy with tool_use loop + SSE
        worlds/       # List, create, load, delete worlds
        settings/     # API key management
      (app)/          # App routes (layout with sidebar)
        page.tsx      # Chat interface
        worlds/       # World picker
        settings/     # API key entry, profile
      login/          # Auth pages
    lib/
      anthropic.ts    # Claude client factory, tool definitions, prompt builder
      auth.ts         # iron-session config, middleware
      crypto.ts       # AES-256-GCM encrypt/decrypt for API keys
    package.json      # Next.js app with dependencies
```

## Installation

```bash
# Core web app dependencies
npm install next@latest react@latest react-dom@latest
npm install @anthropic-ai/sdk@latest
npm install iron-session@latest
npm install argon2@latest
npm install zustand@latest
npm install nanoid@latest

# Dev dependencies
npm install -D typescript@latest @types/react@latest @types/node@latest
npm install -D tailwindcss@latest

# Shared engine package (already has most deps)
# Just needs tsup for building
npm install -D tsup@latest
```

## Environment Variables

```bash
# .env.local (web/)
SESSION_SECRET=<random-32-char-string-for-iron-session>
ENCRYPTION_KEY=<random-32-byte-hex-string-for-aes-256-gcm>
NODE_ENV=production

# No ANTHROPIC_API_KEY -- each user provides their own
# No DATABASE_URL -- files on disk
# No REDIS_URL -- no cache layer
```

## Version Verification

All versions verified via `npm view <package> version` on 2026-04-03:

| Package | Verified Version | Source |
|---------|-----------------|--------|
| next | 16.2.2 | npm registry |
| react | 19.2.4 | npm registry |
| @anthropic-ai/sdk | 0.82.0 | npm registry |
| iron-session | 8.0.4 | npm registry |
| argon2 | 0.44.0 | npm registry |
| zustand | 5.0.12 | npm registry |
| tailwindcss | 4.2.2 | npm registry |
| nanoid | 5.1.7 | npm registry |
| typescript | 6.0.2 | npm registry |
| tsup | 8.5.1 | npm registry |

## Sources

- [Anthropic TypeScript SDK - GitHub](https://github.com/anthropics/anthropic-sdk-typescript) -- streaming, tool_use, toolRunner API
- [Anthropic TypeScript SDK - Official Docs](https://platform.claude.com/docs/en/api/sdks/typescript) -- messages.create, messages.stream
- [Anthropic SDK streaming examples](https://github.com/anthropics/anthropic-sdk-typescript/blob/main/examples/streaming.ts)
- [Anthropic SDK tool helpers](https://github.com/anthropics/anthropic-sdk-typescript/blob/main/helpers.md) -- toolRunner, handleToolCall
- [Next.js App Router Documentation](https://nextjs.org/docs/app) -- Route Handlers, streaming, deployment
- [Next.js Deploying Guide](https://nextjs.org/docs/app/getting-started/deploying) -- standalone output
- [Next.js SSE Discussion #48427](https://github.com/vercel/next.js/discussions/48427) -- ReadableStream pattern for SSE
- [iron-session GitHub](https://github.com/vvo/iron-session) -- App Router compatibility, getIronSession API
- [Railway Next.js Guide](https://docs.railway.com/guides/nextjs) -- deployment, volumes, pricing
- [Railway Volumes Documentation](https://docs.railway.com/reference/volumes) -- persistent storage at $0.25/GB/month
- [Tailwind CSS v4 Announcement](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, performance improvements
- [Password Hashing Guide 2025](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/) -- Argon2id recommendation
- [Node.js crypto AES-256-GCM](https://nodejs.org/api/crypto.html) -- built-in encryption
- [Upstash SSE Streaming LLM Blog](https://upstash.com/blog/sse-streaming-llm-responses) -- SSE pattern for AI streaming
