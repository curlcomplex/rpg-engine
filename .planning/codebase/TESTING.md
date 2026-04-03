# Testing Patterns

**Analysis Date:** 2026-04-03

## Test Framework

**Runner:**
- None installed. No jest, vitest, mocha, or any test runner is present in `mcp-server/package.json` dependencies or devDependencies.
- No test config files: no `jest.config.*`, no `vitest.config.*`
- No `test` script in `mcp-server/package.json` scripts

**Assertion Library:**
- Not applicable — no unit test suite exists

**Run Commands:**
- No test commands defined. `mcp-server/package.json` scripts are:
```bash
npm run build    # tsup src/index.ts --format esm --dts --clean --target node20
npm run dev      # tsup src/index.ts --format esm --watch
```

## Test File Organization

**No unit or integration test files exist in `mcp-server/src/` or anywhere in the project.**

The `tests/` directory at the project root contains only playtest infrastructure — not automated code tests:

```
tests/
├── personas/           # 5 persona prompt files for Claude-driven playtests
│   ├── the-grunt.md
│   ├── the-novelist.md
│   ├── the-comedian.md
│   ├── the-breaker.md
│   └── the-dm.md
├── reports/            # Output from playtest runs (generated, not committed)
├── run-playtests.sh    # Shell script that launches 5 parallel claude CLI sessions
└── run-playtests.md    # Manual instructions for running and analysing playtests
```

## Current Testing Approach: Automated Playtests

The only testing mechanism is an LLM-driven playtest harness (`tests/run-playtests.sh`). It works by:

1. Launching 5 `claude --dangerously-skip-permissions` CLI sessions in parallel (one per persona)
2. Each session receives a persona prompt instructing it to play through `/new-game`, take 8-10 actions, then `/save-game`
3. Each session writes a playtest report to `tests/reports/{persona}-report.md`
4. All stdout is captured to `tests/reports/{persona}-log.txt`

**What this tests:**
- End-to-end tool invocation flow (real MCP calls against real `world.rpg` files)
- Narrative coherence under different player archetypes
- Edge case player behaviours (The Breaker refuses hooks, The DM probes system internals)
- NPC knowledge isolation across sessions
- Campaign creation and save/load cycle

**Known limitation** (noted in `docs/debug-log.md`): running playtests in parallel against the same `world.rpg` file causes write contention. Each persona needs an isolated campaign file.

**Persona descriptions:**
- `the-grunt` — minimal responses, stress-tests sparse input handling
- `the-novelist` — verbose and immersive, stress-tests rich narrative generation
- `the-comedian` — absurdist inputs, stress-tests tone flexibility
- `the-breaker` — refuses all story hooks, stress-tests resilience and graceful degradation
- `the-dm` — meta questions and system probing, stress-tests boundary behaviour

## Testable Surface Area

The codebase has a clean separation that makes unit testing straightforward if added:

**Pure functions — zero dependencies, trivially testable:**
- `mcp-server/src/dice.ts`: `resolveCheck(roll, modifier, dc)`, `getStatValue(character, stat)`, `getSkillModifier(character, skill)`
- `mcp-server/src/queries.ts`: all 7 exported functions accept `WorldDocument` (plain object), return typed results, never do I/O

**Functions requiring a stub store:**
- `mcp-server/src/narrative.ts`: all 6 exported functions accept `WorldStore` as first arg — a minimal mock/stub store would be sufficient
- `mcp-server/src/store.ts`: requires temp file I/O — testable with `os.tmpdir()` or an in-memory mock

**MCP integration:**
- `mcp-server/src/server.ts`: `createServer(store)` accepts injected `WorldStore` — integration tests could pass a stub store and call tools directly

## Mocking

**No mocking framework installed.** If tests were added, the injection pattern already supports it:

```typescript
// store.ts constructor accepts filePath — use a temp file in tests
const store = new WorldStore('/tmp/test-world.rpg', '/tmp/test-campaigns');

// queries.ts accepts WorldDocument directly — pass a fixture object
const doc: WorldDocument = { nodes: [...], edges: [...], ... };
const result = getSceneContext(doc);

// dice.ts rollD20() uses Math.random() — no injection point currently
// Would require either dependency injection or module-level mock
```

**What to mock vs not mock:**
- Mock: `WorldStore` when testing narrative functions in isolation
- Mock: `Math.random` when testing deterministic dice outcomes
- Do NOT mock: `WorldDocument` shape — use real fixture objects to catch structural regressions
- Do NOT mock: pure query functions — test them directly with fixture data

## Fixtures and Factories

**No fixture files or factory functions exist.** If added, the natural pattern based on existing code:

```typescript
// Minimal valid WorldDocument for test fixtures
const makeTestDoc = (): WorldDocument => ({
  rpg_engine_version: '0.1.0',
  created_at: new Date().toISOString(),
  exported_at: new Date().toISOString(),
  source: { tool: 'test', tool_version: '0.1.0' },
  world: { id: 'w_test', title: 'Test World' },
  player: { character_id: '', session_count: 0, current_act: 1, current_beat: 'opening' },
  nodes: [],
  edges: [],
});

// GameNode factory
const makeCharacter = (id: string, title: string): GameNode => ({
  id,
  type: 'character',
  title,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
```

**Location for fixtures:** would logically live in `tests/fixtures/` (not yet created)

## Coverage

**Requirements:** None enforced — no coverage tooling configured.

**View Coverage:** Not available without a test runner.

## Test Types

**Unit Tests:**
- Not present. Would cover: `dice.ts` functions, `queries.ts` functions, `store.ts` CRUD methods.

**Integration Tests:**
- Not present. Would cover: full tool invocations via `createServer(store)` with a real temp-file store.

**E2E Tests:**
- Present via `tests/run-playtests.sh` — LLM-driven, not automated CI.
- Run manually or via shell script. Not integrated into any CI pipeline.

## Recommendations for Adding Tests

Given the codebase structure, the lowest-effort highest-value additions would be:

1. **Add vitest** (compatible with ESM + tsup, no config needed for basic usage):
   ```bash
   npm install -D vitest
   # Add to package.json scripts: "test": "vitest run"
   ```

2. **Test `dice.ts` pure functions first** — `resolveCheck` has 5 deterministic branches, all testable by controlling the `roll` input.

3. **Test `queries.ts` functions** — all accept plain `WorldDocument` objects; fixture-driven, no mocking required.

4. **Test `store.ts` with temp files** — `WorldStore` constructor takes a path; use `os.tmpdir()` for isolated test files.

5. **Co-locate test files** with source: `mcp-server/src/dice.test.ts`, `mcp-server/src/queries.test.ts`, etc.

---

*Testing analysis: 2026-04-03*
