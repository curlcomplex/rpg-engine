# Coding Conventions

**Analysis Date:** 2026-04-03

## Naming Patterns

**Files:**
- `kebab-case` is not used — files are single lowercase words matching their primary export: `store.ts`, `server.ts`, `dice.ts`, `queries.ts`, `narrative.ts`, `types.ts`, `index.ts`
- One module per file, named for its domain responsibility

**Functions:**
- `camelCase` for all functions: `resolveAction`, `getSkillModifier`, `logEvent`, `interviewNpc`, `moveToLocation`, `checkNarrativeHealth`
- Async functions are named as verbs describing the action they perform
- Pure (sync) functions also use verb or verb-noun form: `rollD20`, `resolveCheck`, `findNode`, `isActive`

**Variables:**
- `camelCase` throughout: `skillMod`, `totalModifier`, `opinionEdge`, `npcKnowledge`
- `snake_case` used only in data shapes (JSON-destined objects and interface fields): `node_id`, `causal_type`, `character_id`, `opinion_of_player`
- This split is deliberate: TypeScript internals = camelCase, wire/graph data = snake_case

**Constants:**
- `SCREAMING_SNAKE_CASE` for module-level constants: `NODE_TYPES`, `EDGE_TYPES`, `STAT_NAMES`, `ACTIVE_STATUSES`, `DONE_STATUSES`, `EDGE_TYPE_DEFAULTS`, `VERSION`, `TOOLS`

**Types and Interfaces:**
- `PascalCase` for all: `GameNode`, `GameEdge`, `WorldDocument`, `DiceResult`, `ActionResult`, `LogEventParams`, `LogEventResult`, `SceneContext`, `NarrativeHealth`, `NpcAgenda`
- Params interfaces are `{Verb}{Noun}Params` (e.g., `LogEventParams`, `InvestigateParams`, `InterviewParams`)
- Result interfaces are `{Verb}{Noun}Result` (e.g., `LogEventResult`, `InvestigateResult`, `MoveResult`)
- Derived types use `(typeof CONST)[number]` pattern: `type NodeType = (typeof NODE_TYPES)[number]`

**Parameters:**
- Function parameters accepting domain IDs use `Id` suffix in camelCase: `characterId`, `locationId`, `startNodeId`
- Interface/object fields use snake_case: `character_id`, `location_id`

## Code Style

**Formatting:**
- 2-space indentation throughout
- Single quotes for strings
- No trailing commas visible (consistent omission)
- Opening braces on same line
- No semicolons at end of statements — actually semicolons ARE used consistently

**Linting:**
- No ESLint or Prettier config present — no `.eslintrc`, no `.prettierrc`, no `biome.json`
- TypeScript strict mode is the enforced constraint (`"strict": true` in `mcp-server/tsconfig.json`)
- `tsconfig.json`: `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`

## Import Organization

**Pattern in every source file:**
1. Node built-ins with `node:` prefix: `import { promises as fs } from 'node:fs'`
2. External packages: `import { Server } from '@modelcontextprotocol/sdk/server/index.js'`
3. Internal modules with `.js` extension (required for ESM): `import { WorldStore } from './store.js'`
4. Type-only imports separated with `import type`: `import type { NodeType, EdgeType } from './types.js'`

**Path Aliases:**
- None — relative imports only using `./` prefix with `.js` extension

**ESM requirement:**
- All internal imports must use `.js` extension even for `.ts` source files (ESM + bundler resolution)
- This is enforced by `"moduleResolution": "bundler"` in tsconfig

## Error Handling

**Top-level handler in `mcp-server/src/server.ts`:**
- The entire `switch` block in `CallToolRequestSchema` handler is wrapped in a single `try/catch`
- All caught errors return via `text({ error: String(err) })` — never throw to MCP layer
- Tool-level validation returns early with `return text({ error: '...' })` before any async work

**In store/narrative layer (`store.ts`, `narrative.ts`):**
- Functions throw `new Error('message')` for domain errors (not found, invalid type)
- The server layer catches these and converts to user-facing error text
- Write protection throws explicitly: `throw new Error('WRITE BLOCKED: ...')` with descriptive message
- Data-safety check re-throws its own error: `if (e.message?.startsWith('WRITE BLOCKED')) throw e`

**In queries layer (`queries.ts`):**
- Pure sync functions return structured results — never throw
- Missing nodes produce `undefined` entries that are filtered with type guards: `.filter((n): n is GameNode => n !== undefined)`

**Pattern summary:**
- Store/narrative = throw errors, let server catch
- Server = catch all, return `{ error: string }` to MCP caller
- Queries = pure functions, return structured data, no throws

## Logging

- No logging framework — the server writes nothing to stdout during normal operation (stdout is reserved for MCP protocol transport)
- Only one `console.error` call: in `mcp-server/src/index.ts` main catch block for startup failures
- Runtime errors surface as `{ error: string }` in tool responses, not logs

## Comments

**When to comment:**
- JSDoc-style block comments (`/** ... */`) for all exported functions, describing purpose and key behavior
- Inline section dividers using box-drawing characters: `// ─── Section Name ───────────`
- Short inline comments for non-obvious logic: `// Bypass node count safety check for intentional deletes`
- No commented-out code present

**Comment style:**
- JSDoc blocks describe WHAT + WHY at function level, not parameter-by-parameter
- Section dividers inside large files (`server.ts`, `queries.ts`, `narrative.ts`) group related tools/functions visually

Example from `dice.ts`:
```typescript
/**
 * Resolve a skill check: d20 + skill modifier + situational modifiers vs DC.
 *
 * Outcomes:
 * - Natural 20: critical_success
 * - Total >= DC: success
 * - Total >= DC - 3: partial_success (succeed with complication)
 * - Total < DC - 3: failure
 * - Natural 1: critical_failure
 */
```

## Function Design

**Size:**
- Pure utility functions: 5–15 lines (`rollD20`, `getStatValue`, `isActive`, `findNode`)
- Domain functions: 50–100 lines (`investigate`, `interviewNpc`, `research`)
- Large orchestrators inline all logic: `server.ts` `createServer` function is 450+ lines but broken by section comments

**Parameters:**
- Async domain functions accept a single params interface object: `investigate(store, params: InvestigateParams)`
- Pure query functions accept `doc: WorldDocument` as first arg: `getSceneContext(doc)`, `traceBlocks(doc, startNodeId)`
- Store operations accept primitive IDs: `store.getNode(id: string)`

**Return Values:**
- Always typed via exported interfaces (`LogEventResult`, `InvestigateResult`, etc.)
- Tool handler responses always use the `text()` helper: `return text({ key: value })`
- Undefined returns from store methods signal "not found": `async getNode(...): Promise<... | undefined>`

## Module Design

**Exports:**
- Named exports only — no default exports anywhere
- Each module exports its public interface (types + functions)
- Internal helpers (`isActive`, `findNode`) are unexported module-private functions in `queries.ts` and `narrative.ts`

**Barrel Files:**
- None — each consumer imports directly from the specific module

**Module responsibilities:**
- `types.ts` — constants and type definitions only, no logic
- `store.ts` — file I/O, concurrency locking, CRUD on the JSON graph
- `dice.ts` — pure deterministic mechanics (except `rollD20`), no I/O
- `queries.ts` — pure sync read-only analysis functions over `WorldDocument`
- `narrative.ts` — async narrative actions (mutate store + return results)
- `server.ts` — MCP wiring, tool definitions, request dispatch
- `index.ts` — entry point, CLI arg parsing, startup only

## Type Assertions

- `as` casts used when reading from `properties?: Record<string, unknown>`: `(e.properties?.weight as number) ?? null`
- `as any` appears only once (`as any[]`) for ad-hoc new document construction in campaign management
- Type guards used for filter operations: `.filter((item): item is NonNullable<typeof item> => item !== null)`
- Enum membership checks use `.includes()` with `as any` cast: `NODE_TYPES.includes(args.type as any)`

---

*Convention analysis: 2026-04-03*
