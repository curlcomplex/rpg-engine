# Phase 1: Engine Extraction - Research

**Researched:** 2026-04-03
**Domain:** TypeScript monorepo refactoring, game engine extraction, NPC system enhancement, bug fixes
**Confidence:** HIGH

## Summary

Phase 1 is a surgical extraction of existing game logic from `mcp-server/src/` into `packages/engine/`, plus three targeted code changes (NPC document system, duplicate KNOWS edge fix, opinion edge creation fix). The codebase is already well-separated -- `server.ts` is a dispatch table and all logic lives in `store.ts`, `dice.ts`, `narrative.ts`, `queries.ts`, and `types.ts`. This is a move-and-re-export refactor, not a rewrite.

The project already uses `packages/` for `upg-core` and `upg-mcp-server`, with `file:` references between them. The same pattern applies here: `packages/engine/` becomes a standalone package, and `mcp-server/` imports from it via `file:../packages/engine`. No root-level npm workspaces exist yet; the existing packages use direct `file:` references. The MCP server uses `tsup` for bundling, which resolves `file:` dependencies at build time.

The NPC enhancements (ENG-04 through ENG-08) are code changes within the engine files before or after extraction -- they touch `narrative.ts` and `types.ts`. These should be done as part of the extraction since the engine package is where the fixed code will live permanently.

**Primary recommendation:** Extract the 5 core files into `packages/engine/` with a barrel `index.ts`, update `mcp-server/` imports to reference the package, add `tool-definitions.ts` to the engine package (schema-only, no handlers), then make the NPC/bug-fix changes in the new location. Verify by rebuilding and testing the MCP server.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ENG-01 | Game engine functions extracted into `packages/engine/` as shared TypeScript package | Core extraction pattern documented below -- move `dice.ts`, `narrative.ts`, `queries.ts`, `store.ts`, `types.ts` into `packages/engine/src/`, add `index.ts` barrel export and `tool-definitions.ts` |
| ENG-02 | MCP server refactored as thin adapter importing from shared engine package | MCP server `server.ts` already IS a thin adapter (dispatch table + `text()` helper). Change imports from `./store.js` to `@rpg-engine/core`. Campaign management handlers stay in `server.ts` since they use `node:fs` and `node:path` directly. |
| ENG-03 | MCP server passes all existing functionality after refactor (regression verified) | No automated tests exist. Regression verified by: (1) rebuild succeeds, (2) MCP server starts without error, (3) manual tool calls via Claude Code match pre-refactor behavior. Document a manual smoke test checklist. |
| ENG-04 | NPC character nodes support structured properties: backstory, voice guide, arc, interaction_history | Add TypeScript interfaces (`NpcVoice`, `NpcArc`, `InteractionRecord`, `NpcProperties`) to `types.ts`. These are type-level additions -- existing NPC nodes continue working since `properties` is `Record<string, unknown>`. |
| ENG-05 | `interview_npc` creates bidirectional KNOWS edges | Modify `interviewNpc()` in `narrative.ts`: after creating KNOWS edges for the player, also create KNOWS edges from NPC to topics the player shared (new `player_shared` parameter or inferred from context). |
| ENG-06 | `interview_npc` appends to NPC's interaction_history | Modify `interviewNpc()` in `narrative.ts`: after the interview resolves, call `store.updateNode()` on the NPC to append an `InteractionRecord` to `properties.interaction_history`. |
| ENG-07 | `investigate` guards against duplicate KNOWS edges | Bug fix in `narrative.ts` line 183-194: add the same `alreadyKnows` check that `interviewNpc` uses (line 317-329) before creating KNOWS edges in `investigate()`. |
| ENG-08 | Opinion edge created for new NPCs on first interaction | Bug fix in `narrative.ts` line 349: remove the `&& opinionEdge` guard. When `opinionEdge` is null, create a new opinion edge with `opinion_change` as the initial weight instead of silently discarding. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ^5.8.0 | Type safety across engine package | Already in use, same version |
| tsup | ^8.5.1 | Bundle engine package (ESM + DTS) | Already used by `mcp-server`, fast, zero-config |
| nanoid | ^5.1.0 | ID generation for nodes/edges | Already in use, must be a dependency of engine package (not mcp-server) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @modelcontextprotocol/sdk | ^1.27.0 | MCP protocol types | Stays in `mcp-server/` only -- NOT in engine package |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| tsup | tsc only | tsc works but tsup already handles ESM bundling, DTS generation, and is already a dev dependency. No reason to switch. |
| npm workspaces | file: references | The project already uses `file:` references (upg-mcp-server -> upg-core). Consistent to use the same pattern. npm workspaces would add a root package.json change. Either works; `file:` is simpler for now and matches existing convention. |

**Installation:**
```bash
# No new packages needed -- all dependencies already exist in the project
# Engine package will use: nanoid (moved from mcp-server deps)
# MCP server will add: file:../packages/engine (new dep)
```

## Architecture Patterns

### Recommended Project Structure
```
packages/engine/
  src/
    index.ts              # Barrel export -- public API surface
    types.ts              # GameNode, GameEdge, WorldDocument, constants, NPC interfaces (moved)
    store.ts              # WorldStore class (moved)
    dice.ts               # rollD20, resolveCheck, resolveAction (moved)
    narrative.ts           # logEvent, investigate, interviewNpc, etc. (moved + enhanced)
    queries.ts            # getSceneContext, traceBlocks, etc. (moved)
    tool-definitions.ts   # NEW: TOOLS array (schemas only, no handlers)
  package.json            # name: "@rpg-engine/core"
  tsconfig.json

mcp-server/
  src/
    index.ts              # Entry point (unchanged)
    server.ts             # Thin adapter -- imports from @rpg-engine/core, dispatch only
  package.json            # depends on @rpg-engine/core via file:
  tsconfig.json
```

### Pattern 1: Barrel Export from Engine Package
**What:** `packages/engine/src/index.ts` re-exports everything consumers need. Consumers import only from `@rpg-engine/core`, never from deep paths.
**When to use:** Always. This is the public API boundary.
**Example:**
```typescript
// packages/engine/src/index.ts
export { VERSION, NODE_TYPES, EDGE_TYPES, EDGE_TYPE_DEFAULTS, STAT_NAMES, ACTIVE_STATUSES, DONE_STATUSES } from './types.js';
export type { NodeType, EdgeType, StatName, GameNode, GameEdge, WorldDocument, NpcVoice, NpcArc, InteractionRecord } from './types.js';
export { WorldStore } from './store.js';
export { rollD20, resolveCheck, resolveAction, getStatValue, getSkillModifier } from './dice.js';
export type { DiceResult, ActionResult } from './dice.js';
export { logEvent, investigate, interviewNpc, research, moveToLocation, advanceTime } from './narrative.js';
export type { LogEventParams, LogEventResult, InvestigateParams, InvestigateResult, InterviewParams, InterviewResult, ResearchParams, ResearchResult, MoveResult, AdvanceTimeResult } from './narrative.js';
export { traceBlocks, detectNeglect, findConflicts, getSceneContext, checkNarrativeHealth, getNpcAgendas, getAvailableStorylets } from './queries.js';
export type { BlockChain, SceneContext, NarrativeHealth, NpcAgenda, AvailableStorylet } from './queries.js';
export { TOOL_DEFINITIONS } from './tool-definitions.js';
```

### Pattern 2: file: Dependency Reference
**What:** `mcp-server/package.json` references engine via `"@rpg-engine/core": "file:../packages/engine"`.
**When to use:** For local inter-package dependencies. Already established pattern in the project (`@upg/core` -> `upg-core`).
**Example:**
```json
{
  "dependencies": {
    "@rpg-engine/core": "file:../packages/engine",
    "@modelcontextprotocol/sdk": "^1.27.0"
  }
}
```

### Pattern 3: Tool Definitions Separated from Handlers
**What:** The TOOLS schema array (currently in `server.ts` lines 26-327) moves to `packages/engine/src/tool-definitions.ts`. The MCP server imports it. The future web app will also import it for Claude API `tools` parameter.
**When to use:** The schema array is pure data (no runtime dependencies). It belongs in the shared engine because both adapters need identical tool definitions for Claude.
**Example:**
```typescript
// packages/engine/src/tool-definitions.ts
import { NODE_TYPES, EDGE_TYPES } from './types.js';

export const TOOL_DEFINITIONS = [
  {
    name: 'create_node',
    description: `Create a game entity. Types: ${NODE_TYPES.join(', ')}.`,
    inputSchema: { /* ... same as current TOOLS array ... */ },
  },
  // ... all 25 tools
];
```

### Pattern 4: MCP Server as Pure Dispatcher
**What:** After extraction, `server.ts` contains only: imports from `@rpg-engine/core`, the `createServer()` factory, the `text()` helper, the switch/case dispatcher, and campaign management handlers.
**When to use:** This IS the existing pattern -- the extraction just moves the imports.
**Key detail:** Campaign management tools (`list_campaigns`, `new_campaign`, `load_campaign`) use `node:fs` and `node:path` directly in the handler. These stay in `server.ts` because they are MCP-server-specific (the web app will have its own campaign/world management via API routes with user-scoped paths). The engine package should NOT contain filesystem-aware campaign logic.

### Anti-Patterns to Avoid
- **Moving campaign management into the engine:** Campaign I/O is adapter-specific. The MCP server saves to `./campaigns/`. The web app saves to `/data/users/{id}/worlds/`. Keep campaign management in each adapter.
- **Changing internal module structure during extraction:** Move files first, fix bugs second. If both happen simultaneously, it is impossible to verify extraction correctness.
- **Removing `nanoid` from mcp-server without adding it to engine:** `nanoid` is used by `WorldStore.nodeId()` and `WorldStore.edgeId()`. It must move to the engine package's dependencies.
- **Breaking `.js` extension imports:** The engine source files use `./types.js` style imports (ESM with explicit extensions). Preserve these -- tsup resolves them at build time.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Module bundling | Custom build scripts | tsup | Already proven in this project, handles ESM + DTS in one command |
| ID generation | Custom ID functions | nanoid | Already in use, collision-resistant, URL-safe |
| Type validation for NPC properties | Runtime schema validation | TypeScript interfaces + existing `properties: Record<string, unknown>` pattern | The existing pattern is unvalidated at runtime by design. Adding runtime validation is a separate concern (future). Type interfaces help Claude and developers, not runtime. |

**Key insight:** This phase is a refactoring phase, not a feature-building phase. The primary risk is breaking existing functionality, not building something wrong. Every decision should minimize the diff.

## Common Pitfalls

### Pitfall 1: Import Path Extension Mismatch
**What goes wrong:** After moving files, imports break because TypeScript ESM requires `.js` extensions in import paths, but the actual files are `.ts`.
**Why it happens:** The project uses `"module": "ESNext"` and `"moduleResolution": "bundler"` in tsconfig. tsup resolves `.js` extensions to `.ts` files. But if tsconfig or module settings change, imports break silently.
**How to avoid:** Keep the same tsconfig settings in the engine package as the MCP server. Copy the tsconfig pattern exactly. Use `.js` extensions in all imports within the engine package.
**Warning signs:** Build errors saying "Cannot find module './types.js'" when the file is `types.ts`.

### Pitfall 2: Circular Dependency Between narrative.ts and store.ts
**What goes wrong:** `narrative.ts` imports from `store.ts` (uses `WorldStore` instance). `store.ts` imports from `types.ts`. If any change creates a circular reference, the build succeeds but runtime crashes with undefined imports.
**Why it happens:** In the current codebase, the dependency graph is clean: `types.ts` <- `store.ts` <- `narrative.ts`. But adding NPC types to `types.ts` that reference `WorldStore` methods could create a cycle.
**How to avoid:** NPC interfaces go in `types.ts` (they are pure data types). All `WorldStore` method changes go in `store.ts`. `narrative.ts` uses both but neither depends on it.
**Warning signs:** Runtime `undefined` errors when calling engine functions.

### Pitfall 3: nanoid Not Bundled into Engine Package
**What goes wrong:** After extraction, `mcp-server` builds but `packages/engine` fails because `nanoid` is not in its `package.json`.
**Why it happens:** `nanoid` is currently a dependency of `mcp-server/package.json`. When `store.ts` moves to the engine, it takes the `nanoid` import with it.
**How to avoid:** Add `nanoid: "^5.1.0"` to `packages/engine/package.json` dependencies. Remove it from `mcp-server/package.json` (it is no longer directly used there).
**Warning signs:** Build or runtime error: "Cannot find module 'nanoid'".

### Pitfall 4: Regression in MCP Server After Import Change
**What goes wrong:** MCP server compiles and starts, but a specific tool returns wrong results because the import path resolved to a stale build artifact.
**Why it happens:** tsup output goes to `dist/`. If the engine package is not rebuilt before the MCP server, the MCP server's `file:` reference may resolve to old `dist/` output.
**How to avoid:** Establish a build order: `cd packages/engine && npm run build` THEN `cd mcp-server && npm run build`. Consider a root-level script that runs both in order.
**Warning signs:** Tool outputs that do not match expectations despite correct source code.

### Pitfall 5: opinion_change Applied but Not Persisted for New NPCs
**What goes wrong:** ENG-08 fix creates the opinion edge, but the returned `npc_opinion` value does not reflect the new edge because the function returns early.
**Why it happens:** The current code at line 349 has `if (opinion_change !== 0 && opinionEdge)`. Removing `&& opinionEdge` is only half the fix -- the creation path must also handle the case where `opinionEdge` is null (no edge to remove, just create a new one).
**How to avoid:** The fix should be: if `opinionEdge` exists, remove and re-create. If `opinionEdge` does NOT exist and `opinion_change !== 0`, create a new opinion edge from scratch with `weight: opinion_change`.
**Warning signs:** NPC opinion on first meeting returns 0 + opinion_change in the result but the edge was not written to disk.

## Code Examples

### Engine Package package.json
```json
{
  "name": "@rpg-engine/core",
  "version": "0.1.0",
  "description": "RPG graph engine -- game logic for the RPG web app and MCP server",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean --target node20",
    "dev": "tsup src/index.ts --format esm --dts --watch"
  },
  "dependencies": {
    "nanoid": "^5.1.0"
  },
  "devDependencies": {
    "tsup": "^8.5.1",
    "typescript": "^5.8.0"
  }
}
```

### Engine Package tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

### Updated MCP Server package.json (dependency change)
```json
{
  "dependencies": {
    "@rpg-engine/core": "file:../packages/engine",
    "@modelcontextprotocol/sdk": "^1.27.0"
  }
}
```

### NPC Type Interfaces (added to types.ts)
```typescript
// Source: Design spec docs/superpowers/specs/2026-04-03-rpg-web-mvp-design.md lines 103-137
export interface NpcVoice {
  cadence: string;
  vocabulary: string;
  tics: string;
  formality: string;
}

export interface NpcArc {
  lie: string;
  wound: string;
  truth: string;
}

export interface InteractionRecord {
  session: number;
  summary: string;
  info_shared_by_npc: string[];
  info_shared_by_player: string[];
  opinion_shift: number;
  emotional_state: string;
}

// Optional structured properties for NPC character nodes.
// These are stored in GameNode.properties and are not enforced at runtime.
export interface NpcProperties {
  backstory?: string;
  voice?: NpcVoice;
  arc?: NpcArc;
  interaction_history?: InteractionRecord[];
  stats?: Record<string, number>;
  skills?: Record<string, number>;
  [key: string]: unknown;
}
```

### investigate() Duplicate KNOWS Edge Fix (ENG-07)
```typescript
// BEFORE (narrative.ts lines 183-194):
for (const clue of clues_found) {
  const edge: GameEdge = {
    id: store.edgeId(),
    source: params.character_id,
    target: clue.id,
    type: 'knows',
    // ... creates unconditionally
  };
  await store.addEdge(edge);
  new_edges.push(edge);
}

// AFTER: Add alreadyKnows guard (mirrors interviewNpc pattern at lines 317-329)
for (const clue of clues_found) {
  const alreadyKnows = doc.edges.some(
    e => e.type === 'knows' && e.source === params.character_id && e.target === clue.id
  );
  if (!alreadyKnows) {
    const edge: GameEdge = {
      id: store.edgeId(),
      source: params.character_id,
      target: clue.id,
      type: 'knows',
      properties: { discovered_via: 'investigation', at_location: params.location_id },
      created_at: new Date().toISOString(),
    };
    await store.addEdge(edge);
    new_edges.push(edge);
  }
}
```

### interviewNpc() Opinion Edge Fix (ENG-08)
```typescript
// BEFORE (narrative.ts line 349):
if (opinion_change !== 0 && opinionEdge) {
  // Only updates existing edge -- silently ignores new NPCs
}

// AFTER:
if (opinion_change !== 0) {
  if (opinionEdge) {
    // Update existing: remove old, add new with adjusted weight
    const newWeight = Math.max(-100, Math.min(100, npc_opinion + opinion_change));
    await store.removeEdge(opinionEdge.id);
    await store.addEdge({
      id: store.edgeId(),
      source: params.npc_id,
      target: params.character_id,
      type: 'opinion',
      properties: { ...opinionEdge.properties, weight: newWeight },
      created_at: new Date().toISOString(),
    });
  } else {
    // Create new opinion edge for first interaction
    await store.addEdge({
      id: store.edgeId(),
      source: params.npc_id,
      target: params.character_id,
      type: 'opinion',
      properties: { weight: opinion_change },
      created_at: new Date().toISOString(),
    });
  }
}
```

### interviewNpc() Bidirectional KNOWS + Interaction History (ENG-05, ENG-06)
```typescript
// After existing player-learns-from-NPC KNOWS edge creation...

// ENG-05: Bidirectional -- NPC learns what player shares
// When the player shares information during the interview, the NPC gains KNOWS edges too.
// The player shares info implicitly through the topic they ask about.
// Explicit sharing requires a new optional param: info_shared_by_player: string[]
if (params.info_shared_by_player) {
  for (const infoId of params.info_shared_by_player) {
    const npcAlreadyKnows = doc.edges.some(
      e => e.type === 'knows' && e.source === params.npc_id && e.target === infoId
    );
    if (!npcAlreadyKnows) {
      await store.addEdge({
        id: store.edgeId(),
        source: params.npc_id,
        target: infoId,
        type: 'knows',
        properties: { discovered_via: 'player_shared', during_interview: true },
        created_at: new Date().toISOString(),
      });
    }
  }
}

// ENG-06: Append to interaction_history
const npcProps = (npc.properties || {}) as Record<string, unknown>;
const history = (npcProps.interaction_history as InteractionRecord[] | undefined) || [];
history.push({
  session: doc.player.session_count,
  summary: `Discussed ${params.topic || 'general topics'} via ${params.approach || 'friendly'} approach`,
  info_shared_by_npc: information_shared.map(i => i.id),
  info_shared_by_player: params.info_shared_by_player || [],
  opinion_shift: opinion_change,
  emotional_state: dice.success ? 'cooperative' : 'guarded',
});
await store.updateNode(params.npc_id, {
  properties: { ...npcProps, interaction_history: history },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| All logic in mcp-server/ | Extract to packages/engine/ | This phase | Enables web app to share engine |
| NPC properties unstructured | NPC properties with typed interfaces | This phase | Voice guides, arcs, interaction history become standardized |
| investigate creates duplicate KNOWS | investigate guards against duplicates | This phase (bug fix) | Cleaner graph, no inflated queries |
| Opinion no-op for new NPCs | Opinion edge created on first interaction | This phase (bug fix) | First impressions recorded |
| No bidirectional interview knowledge | interview_npc creates KNOWS in both directions | This phase | NPCs remember what player shares |

**Deprecated/outdated:**
- None in this phase. The current code patterns are valid; this is extraction and enhancement, not modernization.

## Open Questions

1. **How should `info_shared_by_player` work in practice?**
   - What we know: ENG-05 requires bidirectional KNOWS edges. The NPC should learn what the player shares during an interview.
   - What's unclear: Should this be an explicit parameter (array of node IDs the player shares) or inferred from the conversation topic? The design spec says "bidirectional" but does not specify the exact mechanism.
   - Recommendation: Add `info_shared_by_player?: string[]` as an optional parameter to `InterviewParams`. Claude (the narrator) decides what the player shared and passes the relevant node IDs. This matches the existing pattern where Claude decides what to pass to tools. If the parameter is omitted, no NPC KNOWS edges are created (backward-compatible).

2. **Should campaign management tools remain in server.ts or be extracted?**
   - What we know: `list_campaigns`, `new_campaign`, `load_campaign` use `node:fs` and `node:path` directly. The web app will have completely different campaign/world management.
   - What's unclear: Whether any campaign logic (e.g., the new-world creation template) should be shared.
   - Recommendation: Keep campaign management in `server.ts`. The only shared piece is the `WorldDocument` creation template -- but that is already handled by `store.ensureFile()`. No extraction needed.

3. **Build order: should there be a root-level build script?**
   - What we know: The engine package must be built before the MCP server, since the MCP server imports from its `dist/` output via `file:` reference.
   - What's unclear: Whether to add a root `package.json` with workspace scripts or keep it manual.
   - Recommendation: Add a minimal root `package.json` with a `build` script that runs both in order: `cd packages/engine && npm run build && cd ../../mcp-server && npm run build`. This prevents build-order confusion without introducing npm workspaces overhead.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis: `mcp-server/src/` (all 7 source files read and analyzed)
- `.planning/codebase/ARCHITECTURE.md` -- authoritative architecture documentation
- `.planning/codebase/CONCERNS.md` -- documented bugs and tech debt
- `docs/superpowers/specs/2026-04-03-rpg-web-mvp-design.md` -- NPC document system spec
- `.planning/research/ARCHITECTURE.md` -- web MVP architecture patterns (Pattern 1: Shared Engine Package)

### Secondary (MEDIUM confidence)
- Existing `packages/upg-mcp-server/package.json` -- established pattern for `file:` cross-package references in this project
- `mcp-server/package.json` and `tsconfig.json` -- established build configuration pattern

### Tertiary (LOW confidence)
- None. All findings are based on direct codebase analysis.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use, no new dependencies
- Architecture: HIGH -- extraction pattern is a direct application of existing codebase separation
- Pitfalls: HIGH -- bugs are precisely located with line numbers from the source code
- NPC enhancements: MEDIUM -- the `info_shared_by_player` mechanism needs a design decision (see Open Questions)

**Research date:** 2026-04-03
**Valid until:** Indefinitely (this is a codebase-specific refactoring plan, not dependent on external library versions)
