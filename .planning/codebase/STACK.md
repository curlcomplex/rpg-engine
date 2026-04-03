# Technology Stack

**Analysis Date:** 2026-04-03

## Languages

**Primary:**
- TypeScript 5.9.x (resolved from `^5.8.0`) - All MCP server source code in `mcp-server/src/` and `packages/`

**Secondary:**
- JSON - Game state files (`world.rpg`, `campaigns/*.rpg`, `rpg-engine.upg`)
- Bash - Test runner scripts (`tests/run-playtests.sh`)

## Runtime

**Environment:**
- Node.js v25.x (system; no lockfile constraint — no `.nvmrc` or `.node-version` present)
- Target: ES2022 (configured in `mcp-server/tsconfig.json`)
- Module system: ESM throughout (`"type": "module"` in all `package.json` files)

**Package Manager:**
- npm (each package has `package-lock.json`)
- Lockfiles: present in `mcp-server/package-lock.json` and `packages/upg-mcp-server/package-lock.json`

## Frameworks

**Core:**
- `@modelcontextprotocol/sdk` ^1.27.0 (resolved 1.29.0) - MCP protocol implementation, provides `Server`, `StdioServerTransport`, `ListToolsRequestSchema`, `CallToolRequestSchema`

**Build/Dev:**
- `tsup` ^8.5.1 (resolved 8.5.1) - TypeScript bundler using esbuild under the hood; produces ESM output with declarations
- esbuild 0.27.4 - Underlying bundler used by tsup

## Key Dependencies

**Runtime critical (`mcp-server`):**
- `@modelcontextprotocol/sdk` 1.29.0 - The entire server communication layer. Handles stdio transport, request routing, tool schema validation
- `nanoid` ^5.1.0 (resolved 5.1.7) - ID generation for nodes (`n_<16>`) and edges (`e_<16>`)

**Runtime critical (`packages/upg-mcp-server`):**
- `@modelcontextprotocol/sdk` 1.29.0 - Same MCP SDK for the UPG product graph server
- `@upg/core` file:../upg-core - Local package; TypeScript types and spec for the Unified Product Graph format
- `chokidar` ^4.0.0 (resolved 4.0.3) - File watching (used by upg-mcp-server to watch `.upg` files for changes)
- `nanoid` ^5.1.0 - ID generation

**In lock file but not in direct deps (likely tsup/build-time transitive):**
- `hono` 4.12.9 - Present in lock file; not used by game engine directly
- `express` 5.2.1 - Present in lock file; not used by game engine directly
- `zod` 4.3.6 - Present in lock file; not used by game engine directly

## Configuration

**Build:**
- `mcp-server/tsconfig.json` — target ES2022, moduleResolution bundler, strict mode, outputs to `dist/`
- `mcp-server/package.json` scripts:
  - `build`: `tsup src/index.ts --format esm --dts --clean --target node20`
  - `dev`: `tsup src/index.ts --format esm --watch`
- No root-level `package.json` — each sub-package is self-contained

**Runtime configuration:**
- Server launched with CLI args: `--file <path>` and `--campaigns <dir>`
- Defaults: `./world.rpg` for game state, `./campaigns` for campaign saves
- No environment variables used — all config is file-path-based
- No `.env` files present

**MCP client config:**
- `.mcp.json` — Declares both MCP servers for Claude to discover:
  - `rpg-engine`: `node ./mcp-server/dist/index.js --file ./world.rpg --campaigns ./campaigns`
  - `upg-local`: `node ./packages/upg-mcp-server/dist/index.js --file ./rpg-engine.upg --title "RPG Engine"`

## Platform Requirements

**Development:**
- Node.js (system v25.x in use; `package.json` targets node20 in build but no hard constraint)
- npm for package management
- TypeScript compilation via tsup before running

**Production:**
- Entirely local — no server, no cloud, no network
- Runs as stdio MCP server spawned by Claude Desktop / Claude CLI
- Game state persists to local `.rpg` files (JSON on disk)
- No database, no auth, no HTTP

---

*Stack analysis: 2026-04-03*
