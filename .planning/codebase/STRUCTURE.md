# Codebase Structure

**Analysis Date:** 2026-04-03

## Directory Layout

```
RPG/
├── mcp-server/             # Game engine — the core MCP server
│   ├── src/                # TypeScript source (6 files)
│   │   ├── index.ts        # Entry point — CLI args, bootstrap, stdio transport
│   │   ├── server.ts       # Tool definitions + request dispatcher (25 tools)
│   │   ├── store.ts        # Persistence layer — WorldStore class, mutex writes
│   │   ├── types.ts        # Schema — node/edge types, interfaces, constants
│   │   ├── dice.ts         # Dice mechanics — d20, skill checks, outcomes
│   │   ├── narrative.ts    # Composite narrative actions (6 functions)
│   │   └── queries.ts      # Read-only graph analysis (7 functions)
│   ├── dist/               # Compiled output (ESM, generated — do not edit)
│   ├── node_modules/       # Dependencies
│   ├── package.json        # Package manifest (tsup build, nanoid, MCP SDK)
│   └── tsconfig.json       # TypeScript config (ES2022, ESNext modules, bundler resolution)
│
├── packages/               # Supporting MCP servers (vendored/embedded)
│   ├── upg-core/           # UPG core library (dist only — compiled package)
│   └── upg-mcp-server/     # Product graph MCP server (dist + package.json)
│
├── campaigns/              # Saved campaign files (JSON graph snapshots)
│   ├── raccoon-city.rpg    # Active campaigns — full WorldDocument JSON
│   ├── the-binding.rpg
│   └── *.rpg               # One file per campaign
│
├── tests/                  # Playtest infrastructure
│   ├── personas/           # Persona definition files for automated playtests
│   │   ├── the-grunt.md    # 5 persona files (grunt, novelist, comedian, breaker, dm)
│   │   ├── the-novelist.md
│   │   └── *.md
│   ├── reports/            # Generated playtest output (gitignored during runs)
│   ├── run-playtests.sh    # Parallel playtest runner (5 personas via claude CLI)
│   └── run-playtests.md    # Playtest instructions
│
├── docs/                   # Project documentation and debug logs
│   ├── debug-log.md        # Runtime debug findings
│   ├── haiku-viability-report.md
│   └── superpowers/        # Auto-generated spec/plan docs
│
├── .claude/                # Claude Code configuration
│   ├── commands/           # Slash command definitions (/new-game, /load-game, /save-game)
│   └── skills/             # UPG skill files (upg-status, upg-capture, etc.)
│
├── .planning/              # GSD planning documents
│   ├── codebase/           # Codebase analysis docs (ARCHITECTURE.md, STRUCTURE.md, etc.)
│   └── phases/             # Phase plan files
│
├── world.rpg               # Active game state — current WorldDocument JSON
├── rpg-engine.upg          # Product graph — features, bugs, ideas, roadmap
├── .mcp.json               # MCP server config (rpg-engine + upg-local)
├── CLAUDE.md               # Project instructions for Claude
└── STATE.md                # Session state log — read first each session
```

## Directory Purposes

**`mcp-server/src/`:**
- Purpose: All game engine source code
- Contains: 6 TypeScript modules — each has a single clear responsibility
- Key files: `server.ts` (tool surface), `store.ts` (persistence), `types.ts` (schema)

**`mcp-server/dist/`:**
- Purpose: Compiled ESM output — what actually runs
- Contains: `index.js` (bundled by tsup), source maps, `.d.ts` files
- Generated: Yes — run `npm run build` in `mcp-server/`
- Committed: Yes (required for MCP server to load without build step)

**`campaigns/`:**
- Purpose: Saved campaign snapshots — each is a complete `WorldDocument` JSON
- Contains: One `.rpg` file per campaign, plus `world.rpg` (active game alias copy)
- Pattern: `new_campaign` and `load_campaign` tools read/write this directory. The active world is always `world.rpg` at the project root; `campaigns/` holds all named saves.

**`tests/personas/`:**
- Purpose: Personas for automated AI playtesting
- Contains: One `.md` file per persona with role, play style, and evaluation criteria
- Used by: `tests/run-playtests.sh` which spawns parallel `claude` CLI sessions

**`packages/`:**
- Purpose: Vendored/embedded secondary MCP server for the UPG product graph
- Contains: `upg-core/` (core library) and `upg-mcp-server/` (MCP wrapper)
- Key: These are separate packages with their own `dist/` and dependencies — not part of the game engine

**`.claude/commands/`:**
- Purpose: Slash command implementations for game operations
- Contains: `/new-game`, `/load-game`, `/save-game` command files
- Pattern: Invoked as `/new-game` etc. in Claude chat

## Key File Locations

**Entry Points:**
- `mcp-server/src/index.ts`: Server bootstrap — CLI arg parsing, `WorldStore` instantiation, MCP transport binding
- `mcp-server/dist/index.js`: Compiled binary invoked by `.mcp.json`
- `.mcp.json`: MCP server registration — defines how Claude loads both servers

**Configuration:**
- `mcp-server/tsconfig.json`: TypeScript compiler options (ES2022 target, bundler module resolution)
- `mcp-server/package.json`: Build scripts (`npm run build` via tsup), runtime dependencies
- `.mcp.json`: Runtime server config — `--file` and `--campaigns` args passed to the server

**Core Logic:**
- `mcp-server/src/server.ts`: All 25 tool definitions and dispatch logic — the primary surface for adding new tools
- `mcp-server/src/store.ts`: All graph persistence — add/update/delete nodes and edges
- `mcp-server/src/types.ts`: The graph schema — modify here to add node types, edge types, or stats
- `mcp-server/src/queries.ts`: All read-only analysis — add new query tools here
- `mcp-server/src/narrative.ts`: Composite gameplay actions — add new narrative tools here

**Active Game State:**
- `world.rpg`: The active `WorldDocument` JSON — current campaign
- `campaigns/*.rpg`: Saved campaigns — named `<campaign-name>.rpg`

**Product Tracking:**
- `rpg-engine.upg`: UPG product graph — features, bugs, ideas, roadmap (108+ nodes)

**Session Context:**
- `STATE.md`: Session log — what was done, decisions made, what's next. Read at session start; update at session end.
- `CLAUDE.md`: Project rules and protocol for Claude

## Naming Conventions

**Files:**
- Source modules: `camelCase.ts` (`store.ts`, `narrative.ts`, `queries.ts`)
- Campaign saves: `kebab-case.rpg` (`raccoon-city.rpg`, `the-binding.rpg`)
- Test personas: `the-<role>.md` (`the-grunt.md`, `the-novelist.md`)
- Planning docs: `UPPERCASE.md` (`STATE.md`, `CLAUDE.md`, `ARCHITECTURE.md`)

**TypeScript:**
- Interfaces: PascalCase (`WorldDocument`, `GameNode`, `SceneContext`)
- Type aliases: PascalCase (`NodeType`, `EdgeType`, `StatName`)
- Constants: SCREAMING_SNAKE_CASE (`NODE_TYPES`, `EDGE_TYPE_DEFAULTS`, `VERSION`)
- Functions: camelCase (`resolveAction`, `getSceneContext`, `traceBlocks`)
- Classes: PascalCase (`WorldStore`)

**Node/Edge IDs:**
- Node IDs: `n_` prefix + 16-char nanoid (e.g., `n_abc123xyz456def0`)
- Edge IDs: `e_` prefix + 16-char nanoid (e.g., `e_xyz789abc123ghi4`)

## Where to Add New Code

**New MCP Tool:**
1. Add tool definition to the `TOOLS` array in `mcp-server/src/server.ts`
2. Add handler case to the `switch` in `createServer()` in `mcp-server/src/server.ts`
3. If the tool is a pure graph query: implement the function in `mcp-server/src/queries.ts`, import it in `server.ts`
4. If the tool is a composite gameplay action (reads + writes): implement in `mcp-server/src/narrative.ts`, import in `server.ts`
5. If the tool is pure CRUD: handle inline in the `switch` case

**New Node Type:**
1. Add the string literal to `NODE_TYPES` array in `mcp-server/src/types.ts`
2. Add relevant `EDGE_TYPE_DEFAULTS` entries if natural parent relationships exist

**New Edge Type:**
1. Add the string literal to `EDGE_TYPES` array in `mcp-server/src/types.ts`
2. Add to `EDGE_TYPE_DEFAULTS` for any source:target pairs where this should be the default

**New Stat:**
1. Add to `STAT_NAMES` array in `mcp-server/src/types.ts`
2. Update `getStatValue()` / `getSkillModifier()` in `mcp-server/src/dice.ts` if needed

**New Campaign:**
- Runtime only: use `new_campaign` MCP tool — creates file in `campaigns/`
- Files land in `campaigns/<name>.rpg` automatically

**Test Persona:**
- Add `tests/personas/the-<role>.md` following existing persona format
- Reference in `tests/run-playtests.sh`

## Special Directories

**`mcp-server/dist/`:**
- Purpose: Compiled output consumed by `.mcp.json`
- Generated: Yes (via `tsup` — `npm run build` in `mcp-server/`)
- Committed: Yes — required for Claude Code to load server without a build step

**`packages/upg-mcp-server/dist/`:**
- Purpose: Compiled UPG product graph server
- Generated: Yes
- Committed: Yes

**`.planning/`:**
- Purpose: GSD planning artifacts — codebase analysis, phase plans
- Generated: Partially (by GSD commands like `/gsd:map-codebase`)
- Committed: Yes

**`.claude/`:**
- Purpose: Claude Code configuration — slash commands and skill files
- Generated: No (hand-authored)
- Committed: Yes

---

*Structure analysis: 2026-04-03*
