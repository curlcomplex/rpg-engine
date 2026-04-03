# External Integrations

**Analysis Date:** 2026-04-03

## APIs & External Services

**Model Context Protocol (MCP):**
- Anthropic MCP standard - The entire server interface. Claude (or any MCP-compatible client) communicates with the engine via MCP stdio transport.
  - SDK: `@modelcontextprotocol/sdk` 1.29.0
  - Transport: stdio (stdin/stdout) — no HTTP, no ports
  - Protocol flow: client sends `ListToolsRequest` → server returns tool schemas; client sends `CallToolRequest` → server executes and returns text content
  - Configured via `.mcp.json` in the project root

**No other external APIs are used.** The engine is fully offline.

## Data Storage

**Databases:**
- None — no database engine of any kind

**File-based persistence (primary storage):**
- Active game state: `world.rpg` — JSON document, format defined by `WorldDocument` interface in `mcp-server/src/types.ts`
- Campaign saves: `campaigns/*.rpg` — same JSON format, one file per campaign
- Product graph: `rpg-engine.upg` — JSON graph format defined by `@upg/core`
- Write strategy: atomic write-via-rename (`file.rpg.tmp` → `file.rpg`) with mutex locking in `WorldStore.withLock()` at `mcp-server/src/store.ts`
- Safety guard: node count check before writes to prevent stale-read data loss (see `WorldStore.write()`)

**File Storage:**
- Local filesystem only — all data at project root and `campaigns/` subdirectory

**Caching:**
- None — every read goes directly to disk

## Authentication & Identity

**Auth Provider:**
- None — no authentication of any kind
- The server is spawned locally by the MCP client process; trust is implicit via OS process isolation

## Monitoring & Observability

**Error Tracking:**
- None — no external error tracking service

**Logs:**
- `console.error` on startup failure only (`mcp-server/src/index.ts` line 29)
- Runtime errors are returned as JSON error payloads to the MCP client: `{ error: "..." }`
- Playtest logs written to `tests/reports/*.txt` by `tests/run-playtests.sh` (Claude CLI `--output-format text`)
- Debug notes in `docs/debug-log.md`

## CI/CD & Deployment

**Hosting:**
- Local only — no deployment target
- GitHub repo: `curlcomplex/rpg-engine` (referenced in `STATE.md`)

**CI Pipeline:**
- None configured — no GitHub Actions, no CI service

**Build step required before use:**
```bash
cd mcp-server && npm install && npm run build
cd packages/upg-mcp-server && npm install && npm run build
```

## Environment Configuration

**Required env vars:**
- None — the server requires no environment variables

**All configuration is via CLI args at launch:**
- `--file <path>` — path to `.rpg` world file
- `--campaigns <dir>` — path to campaigns directory
- `--title <string>` — display title (upg-mcp-server only)

**Secrets location:**
- No secrets present — `.gitignore` excludes `world.rpg`, `campaigns/*.rpg`, and `.upg` files (game state), and `.superpowers/` directory

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Second MCP Server: upg-local

The `packages/upg-mcp-server/` is a second, independent MCP server for product management. It is not part of game runtime.

- Purpose: Read/write `rpg-engine.upg` — the product knowledge graph tracking features, bugs, ideas
- SDK: `@modelcontextprotocol/sdk` 1.29.0
- File watching: `chokidar` 4.0.3 watches the `.upg` file for external edits
- Data format: defined by `@upg/core` (local package at `packages/upg-core/`)
- Launched: `node ./packages/upg-mcp-server/dist/index.js --file ./rpg-engine.upg --title "RPG Engine"`

The UPG server has no game-runtime role. It is used only during development sessions to track product state.

---

*Integration audit: 2026-04-03*
