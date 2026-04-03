---
phase: 01-engine-extraction
plan: 01
subsystem: infra
tags: [typescript, tsup, monorepo, engine-extraction, mcp]

# Dependency graph
requires: []
provides:
  - "@rpg-engine/core package with all game logic (types, store, dice, narrative, queries)"
  - "TOOL_DEFINITIONS array exported from engine for any adapter to use"
  - "MCP server as thin adapter importing from @rpg-engine/core"
affects: [01-engine-extraction, 02-web-app, 03-turn-orchestrator]

# Tech tracking
tech-stack:
  added: [tsup, "@rpg-engine/core"]
  patterns: ["barrel export from packages/engine/src/index.ts", "file: dependency linking between packages"]

key-files:
  created:
    - packages/engine/package.json
    - packages/engine/tsconfig.json
    - packages/engine/src/index.ts
    - packages/engine/src/types.ts
    - packages/engine/src/store.ts
    - packages/engine/src/dice.ts
    - packages/engine/src/narrative.ts
    - packages/engine/src/queries.ts
    - packages/engine/src/tool-definitions.ts
  modified:
    - mcp-server/package.json
    - mcp-server/src/server.ts
    - mcp-server/src/index.ts

key-decisions:
  - "Used file: dependency link (not npm workspace) to keep mcp-server and engine loosely coupled"
  - "Tool definitions live in engine package so both MCP and future web adapters can share them"
  - "Campaign management handlers (list/new/load) stay in server.ts because they use node:fs directly -- adapter-specific"

patterns-established:
  - "Barrel export: packages/engine/src/index.ts re-exports all public API"
  - "Adapter pattern: MCP server imports game logic from @rpg-engine/core, keeps only protocol dispatch"
  - "Tool definitions as data: TOOL_DEFINITIONS array is importable by any consumer"

requirements-completed: [ENG-01, ENG-02, ENG-03]

# Metrics
duration: 4min
completed: 2026-04-03
---

# Phase 1 Plan 1: Engine Extraction Summary

**Extracted 5 game logic modules into @rpg-engine/core package with barrel export, tool definitions, and rewired MCP server as thin adapter**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-03T19:23:29Z
- **Completed:** 2026-04-03T19:27:38Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Created @rpg-engine/core package (packages/engine/) with types, store, dice, narrative, queries, tool-definitions
- Barrel export exposes all game functions, types, constants, and 25 tool definitions
- MCP server rewired to import everything from @rpg-engine/core -- no local game logic remains
- Both packages build cleanly with tsup, MCP server starts without errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create engine package and move source files** - `f477378` (feat)
2. **Task 2: Rewire MCP server to import from engine package** - `57261d7` (feat)

## Files Created/Modified
- `packages/engine/package.json` - @rpg-engine/core package manifest
- `packages/engine/tsconfig.json` - TypeScript config matching mcp-server
- `packages/engine/src/index.ts` - Barrel export of all engine public API
- `packages/engine/src/types.ts` - Node/edge types, constants, interfaces
- `packages/engine/src/store.ts` - WorldStore class (file-backed graph store)
- `packages/engine/src/dice.ts` - Dice rolling and action resolution
- `packages/engine/src/narrative.ts` - 6 narrative functions (logEvent, investigate, etc.)
- `packages/engine/src/queries.ts` - 7 query functions (traceBlocks, sceneContext, etc.)
- `packages/engine/src/tool-definitions.ts` - 25 MCP tool schemas
- `mcp-server/package.json` - Added @rpg-engine/core dep, removed nanoid
- `mcp-server/src/server.ts` - Replaced local imports with @rpg-engine/core, removed inline TOOLS array
- `mcp-server/src/index.ts` - Switched WorldStore import to @rpg-engine/core

## Decisions Made
- Used file: dependency link rather than npm workspaces to keep packages loosely coupled
- Tool definitions placed in engine package (not MCP server) so web app can also import them
- Campaign management handlers stay in server.ts since they depend on node:fs (adapter-specific I/O)
- Removed `as const` type assertions from tool definition objects -- not needed outside MCP SDK context

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- @rpg-engine/core package is ready for import by the web app (Phase 2+)
- MCP server continues to work identically -- transparent refactor
- Plan 01-02 (workspace setup and root build scripts) can proceed

## Self-Check: PASSED

All 9 created files verified present. All 3 modified files verified present. All 5 deleted files verified absent. Both commits (f477378, 57261d7) found in git log. Build outputs (dist/index.js, dist/index.d.ts) verified present.

---
*Phase: 01-engine-extraction*
*Completed: 2026-04-03*
