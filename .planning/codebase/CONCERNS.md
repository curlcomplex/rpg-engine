# Codebase Concerns

**Analysis Date:** 2026-04-03

## Tech Debt

**NPC Document System Unimplemented:**
- Issue: The design spec (`docs/superpowers/specs/2026-04-01-rpg-graph-engine-design.md`) defined a dedicated document system for NPC backstories, voice guides, and lie/wound/truth arcs — stored as separate referenced files. Instead, all NPC data is stored inline as `properties` on CHARACTER nodes, with no enforcement of structure or schema.
- Files: `mcp-server/src/types.ts`, `mcp-server/src/server.ts` (line 39 mentions `voice_doc_ref` only in a comment)
- Impact: Voice guides and arc data are present in some campaigns (e.g., `campaigns/raccoon-city.rpg`) but only because Claude manually put them there — there is no tool, schema enforcement, or system prompt that ensures this structure exists. A newly created NPC has no voice guide unless the session explicitly creates one. The `interview_npc` tool has no awareness of the voice object in character properties.
- Fix approach: Add a dedicated `create_npc` tool (or extend `create_node` for `character` type) that enforces the voice/arc structure. Alternatively, add a Phase 4 step that injects active NPC voice properties into the narrator context during `interview_npc`.

**No `updateEdge` Operation:**
- Issue: There is no edge mutation primitive. Updating an edge property (e.g., shifting NPC opinion weight) requires remove + re-add with a new ID, losing the original creation timestamp and edge identity.
- Files: `mcp-server/src/store.ts`, `mcp-server/src/narrative.ts` (lines 349–360)
- Impact: Opinion edge history is not preserved. The edge ID changes on every opinion shift, making it impossible to trace opinion change over time without scanning event nodes. The remove-then-add operation is also two separate mutex-protected writes — a server crash between them would leave the opinion edge deleted with no replacement.
- Fix approach: Add `updateEdge(id, patch)` to `WorldStore` that mutates `properties` in place, same pattern as `updateNode`.

**`investigate` Does Not Guard Duplicate KNOWS Edges:**
- Issue: `interview_npc` has an `alreadyKnows` check before creating a KNOWS edge. `investigate` does not — it creates a KNOWS edge unconditionally for every clue found.
- Files: `mcp-server/src/narrative.ts` (lines 183–194 vs lines 317–329)
- Impact: If a player investigates the same location multiple times, they accumulate duplicate KNOWS edges for clues they already discovered. This pollutes `get_scene_context` and `get_npc_agendas` with duplicate entries and inflates the graph.
- Fix approach: Mirror the `alreadyKnows` guard from `interviewNpc` into `investigate` before `addEdge`.

**Opinion Update Is No-Op When NPC Has No Existing Opinion Edge:**
- Issue: In `interviewNpc`, the opinion update block is gated on `&& opinionEdge`. If no opinion edge exists between the NPC and the player (a freshly created NPC, or one whose opinion edge was never initialized), opinion changes from interviews are silently discarded.
- Files: `mcp-server/src/narrative.ts` (line 349)
- Impact: First impressions are never recorded. An NPC who meets the player for the first time cannot form an opinion. Successive interviews on a new NPC always start at the default opinion of 0.
- Fix approach: Remove the `&& opinionEdge` guard and create the opinion edge if it does not exist, using the `opinion_change` as the initial weight.

**Write Guard Only Protects Nodes, Not Edges:**
- Issue: The write safety check in `WorldStore.write()` compares `doc.nodes.length < current.nodes.length` and blocks if nodes would be lost. There is no equivalent protection for edges.
- Files: `mcp-server/src/store.ts` (lines 54–65)
- Impact: A stale-read scenario that drops edges (e.g., due to a concurrency bug in a future multi-process context) would not be caught. The guard was designed for the playtest shared-world contention problem, but it only half-solves it.
- Fix approach: Extend the guard to also check edge count. Or note explicitly that this guard is intentionally node-only.

**Monolithic `server.ts`:**
- Issue: All 25 tool definitions and all 25 tool handler cases live in a single 776-line `server.ts`. The tool definition array (TOOLS) and the switch statement are tightly coupled with no abstraction.
- Files: `mcp-server/src/server.ts`
- Impact: Adding new tools requires editing the same file in two separate locations (array + switch). The file will grow linearly with each phase. As of Phase 3, it is already the largest source file.
- Fix approach: Extract tool definitions and handlers into per-module files (e.g., `tools/crud.ts`, `tools/narrative.ts`, `tools/drama.ts`) and compose them in `server.ts`.

**Engine Not Extracted Into Shared Package:**
- Issue: The web MVP design (`docs/superpowers/specs/2026-04-03-rpg-web-mvp-design.md`) calls for extracting the engine into `packages/engine/` so both the MCP server and the future web app share the same logic. This has not been done — all logic still lives in `mcp-server/src/`.
- Files: `mcp-server/src/` (entire directory)
- Impact: Building the web app will require manually copying or restructuring all engine code. Any bug fixed in `mcp-server/` will not automatically apply to the web version, and vice versa.
- Fix approach: Extract `store.ts`, `types.ts`, `dice.ts`, `narrative.ts`, `queries.ts` into `packages/engine/`. Make `mcp-server/` a thin adapter that imports from the package.

---

## Known Bugs

**DBG-001: NPC Knowledge Leak in Narrator Layer:**
- Symptoms: The narrator (LLM) references player-only knowledge when voicing NPC dialogue, even though the NPC has no KNOWS/SUSPECTS edge to that information.
- Files: `mcp-server/src/narrative.ts` (`interviewNpc` returns `do_not_reference` list)
- Trigger: Any `interview_npc` call where the player has discovered clues the NPC does not know about. The LLM has full conversation context including all previously narrated clues, and may accidentally surface them through NPC dialogue.
- Workaround: `interview_npc` returns a `do_not_reference` list. The CLAUDE.md session rules require Claude to respect this list. Enforcement is prompt-based, not structural.
- Status: Partially mitigated. No structural enforcement. A sufficiently complex scene can still produce leaks.

**Automated Playtest File Contention:**
- Symptoms: Running all 5 persona playtests in parallel via `tests/run-playtests.sh` causes all sessions to share the same `world.rpg` file, leading to data corruption and mixed game states.
- Files: `tests/run-playtests.sh`, `mcp-server/src/index.ts`
- Trigger: The `--file ./world.rpg` argument in `.mcp.json` is hardcoded and shared across all Claude Code sessions.
- Workaround: None implemented. Playtest personas are ready but no reports have been collected.
- Fix: Each persona process must receive its own `--file` argument pointing to an isolated `.rpg` file (e.g., `world-grunt.rpg`). This requires either multiple `.mcp.json` configs or a wrapper that launches the MCP server per-persona with a different file argument.

---

## Security Considerations

**No Input Validation on Node/Edge IDs:**
- Risk: All tool handlers cast `args.node_id`, `args.source_id`, etc. directly to `string` with no validation of ID format. The expected format is `n_{nanoid(16)}` for nodes and `e_{nanoid(16)}` for edges, but any string is accepted.
- Files: `mcp-server/src/server.ts` (all handler cases)
- Current mitigation: The only consumer is Claude via MCP — not a public API. IDs that don't match any node simply return `{ error: 'Node not found' }`.
- Recommendations: Low priority in MCP context, but becomes relevant if the engine is exposed via the web API. Add format validation before lookup.

**`.rpg` Campaign Files Excluded From Git But No Encryption:**
- Risk: All world files (player progress, character data, campaign content) are excluded from git via `.gitignore` but stored as plaintext JSON on disk. If the server is the future web deployment, user world files would be plaintext at rest.
- Files: `.gitignore`, `campaigns/*.rpg`, `world.rpg`
- Current mitigation: Not applicable in local development context. The web MVP design spec calls for encrypted API key storage (`api_key.enc`) but does not specify encryption for world files.
- Recommendations: Acceptable for local MCP use. For web deployment, consider whether world file contents need at-rest encryption (likely not, given they contain only game fiction, not PII).

**`--dangerously-skip-permissions` in Playtest Runner:**
- Risk: `tests/run-playtests.sh` runs `claude --dangerously-skip-permissions` for all playtest personas. This gives each persona's Claude instance full filesystem access without permission prompts.
- Files: `tests/run-playtests.sh` (line 24)
- Current mitigation: Personas are controlled prompts run in a development environment. Not exposed externally.
- Recommendations: Acceptable for local adversarial testing. Document this explicitly so it is not copied into production tooling.

---

## Performance Bottlenecks

**Linear Scan on Every Tool Call:**
- Problem: Every tool call reads the entire world file from disk, then performs linear `Array.find` and `Array.filter` scans over all nodes and edges. The queries module alone has 21 such linear scans; narrative.ts has 21 more.
- Files: `mcp-server/src/queries.ts`, `mcp-server/src/narrative.ts`, `mcp-server/src/server.ts`
- Cause: The store is intentionally stateless — each call reads fresh from disk. There is no in-memory index or cache.
- Improvement path: Acceptable at current scale (the Raccoon City campaign has ~45 nodes and ~70 edges, well under 1ms for scans). Becomes a concern above ~1,000 nodes. For the web MVP, add an in-memory cache that invalidates on write. For the engine package extraction, consider an index layer keyed by node ID and type.

**`advance_time` Returns Empty `npc_movements` and `blocks_resolved`:**
- Problem: The `advance_time` tool returns `npc_movements: []` and `blocks_resolved: []` in every call. These fields are defined in the result interface but never populated. NPCs do not actually move, and blocks are not resolved.
- Files: `mcp-server/src/narrative.ts` (lines 541–586)
- Cause: The implementation only handles the "detect NPC awareness" logic and increments session count. The NPC movement and block resolution logic was planned but not built.
- Improvement path: Phase 4 work item. For now, the DM (Claude) is expected to handle NPC agenda advancement manually after calling `advance_time`.

---

## Fragile Areas

**`removeNode` Bypasses the Write Guard:**
- Files: `mcp-server/src/store.ts` (lines 140–161)
- Why fragile: `removeNode` writes the file directly without going through the `write()` method, bypassing the node-count safety check. The comment says "Bypass node count safety check for intentional deletes" — but this means the guard is silently skipped, not explicitly confirmed as safe.
- Safe modification: Any future change to the write path (e.g., adding audit logging, adding an edge count guard) must be applied to both `write()` and the duplicate write block in `removeNode`. These will drift.
- Fix approach: Extract the raw atomic write into a private `_writeRaw()` method. Both `write()` and `removeNode` call it. The safety guards live only in `write()`.

**Promise-Based Mutex is Per-Instance Only:**
- Files: `mcp-server/src/store.ts` (lines 9, 32–43)
- Why fragile: The mutex (`lockQueue`) is an instance variable. It protects concurrent calls within a single Node process, but provides no protection between separate processes (e.g., running two MCP server instances pointing at the same `world.rpg`). This was the root cause of the automated playtest contention bug.
- Safe modification: Only one MCP server process should point at any given `.rpg` file at a time. The automated playtest setup violated this and caused corruption.
- Test coverage: No tests. The mutex behavior is untested.

**`switchTo` Has No Lock Drain:**
- Files: `mcp-server/src/store.ts` (lines 17–19)
- Why fragile: `switchTo()` changes `this.filePath` immediately, with no wait for in-flight operations on the previous file to complete. If a `new_campaign` or `load_campaign` is called while another write is in progress, the file path could switch mid-operation.
- Safe modification: `switchTo` should only be called after all pending operations resolve. In current usage (called synchronously within a lock-protected handler) this is safe, but it is not enforced.

**`mcp-server/world.rpg` Is an Orphan File:**
- Files: `mcp-server/world.rpg`
- Why fragile: A `world.rpg` exists inside `mcp-server/` with 0 nodes and 0 edges (Title: "New World"). It was created when `ensureFile()` ran with the working directory set to `mcp-server/` during early development. It is gitignored (the pattern `world.rpg` matches all paths). It is not used by the configured MCP server (which points to `./world.rpg` at the project root). Its presence could cause confusion if someone runs the server from within `mcp-server/`.
- Safe modification: Delete `mcp-server/world.rpg`. It contains no data.

**Two Active `world.rpg` References:**
- Files: `.mcp.json` (uses `./world.rpg`), `mcp-server/world.rpg` (orphan)
- Why fragile: The MCP server is configured to use the root-level `./world.rpg`, but that file currently points to "The Last Laugh" campaign (36 nodes). The campaigns directory contains a separate `world.rpg` (in `campaigns/world.rpg`). There are now three files named `world.rpg` in the repo tree. The "active" one is whatever the MCP server was last pointing at when it last wrote.
- Safe modification: Consider renaming the root `world.rpg` to match the campaign it contains, and establishing a convention that `world.rpg` is always the scratch/default empty world.

---

## Scaling Limits

**Single-File JSON Store:**
- Current capacity: Works well up to ~500 nodes / ~1,000 edges per campaign (estimated). The Raccoon City campaign has ~45 nodes, well under any practical limit.
- Limit: JSON parse time and linear scan time grow O(n). At ~5,000 nodes the read latency per tool call would become noticeable (>100ms). At ~50,000 nodes it becomes unusable.
- Scaling path: For the web MVP (multiple concurrent users, each with their own `.rpg` file), the single-file model is fine — each user's file is independent. Cross-user scale is a future problem.

---

## Dependencies at Risk

**No Pinned Dependency Versions:**
- Risk: `package.json` uses `^` ranges for `@modelcontextprotocol/sdk` (`^1.27.0`) and `nanoid` (`^5.1.0`). A minor version bump could introduce breaking changes.
- Files: `mcp-server/package.json`
- Impact: Unpredictable `npm install` behavior across environments. The MCP SDK in particular evolves quickly.
- Migration plan: Pin to exact versions after stability testing. Use a lockfile (check `mcp-server/package-lock.json` or `pnpm-lock.yaml` existence in CI).

---

## Missing Critical Features

**No `use_item` Tool:**
- Problem: The design spec listed `use_item` as one of the 5 game mechanics tools. It was never implemented. The TOOLS array and switch statement have no `use_item` case.
- Files: `mcp-server/src/server.ts`, `docs/superpowers/specs/2026-04-01-rpg-graph-engine-design.md` (line 198)
- Blocks: Item-based puzzle resolution. REQUIRES edges on storylets that gate on items are checked correctly in `getAvailableStorylets`, but there is no tool to actually apply an item to a situation.

**No `rest` Tool:**
- Problem: The design spec listed `rest` as a game mechanics tool (recover health/stress at the cost of time passing). Not implemented.
- Files: `mcp-server/src/server.ts`
- Blocks: Health/stress recovery mechanic. Currently there is no way to change a character's health or stress stats via a dedicated tool.

**No `present_choices` Tool:**
- Problem: The design spec listed `present_choices` as a narrative tool. Not implemented. The failure-to-choice pattern in `resolveAction` returns generic hardcoded choices (`retreat`, `persist`, `improvise`), not world-specific player options.
- Files: `mcp-server/src/dice.ts` (lines 122–127)
- Blocks: Dynamic, context-appropriate choice generation on failure. The spec envisioned `present_choices` generating 2-4 meaningful options tailored to the current scene. Instead, the narrator is expected to invent these manually.

**NPC Interaction History Not Tracked:**
- Problem: The web MVP design spec (`docs/superpowers/specs/2026-04-03-rpg-web-mvp-design.md`, lines 103–137) defines an `interaction_history` array in NPC properties that should be appended after every `interview_npc` call. This is not implemented.
- Files: `mcp-server/src/narrative.ts` (`interviewNpc` function)
- Blocks: NPCs cannot remember what the player told them in previous sessions. Knowledge transfer is one-directional (NPC → player via KNOWS edges). Players cannot share information with NPCs in a persistent, queryable way.

**`advance_time` Is Cosmetic:**
- Problem: `advance_time` increments session count and returns text strings about NPC awareness, but takes no graph actions. NPCs do not move. Blocks are not resolved. Storylets do not advance. The "living world" effect requires the DM to manually interpret the output and make changes.
- Files: `mcp-server/src/narrative.ts` (lines 541–586)
- Blocks: Autonomous NPC agenda advancement. The background game clock described in the design spec.

---

## Test Coverage Gaps

**Zero Automated Tests:**
- What's not tested: Every tool handler, the dice engine, the write guard, the mutex, the cascade queries, narrative health scoring, and all edge cases.
- Files: All of `mcp-server/src/`
- Risk: Regressions in any tool are invisible until discovered during a play session. The write guard (which prevents node loss) has never been tested under concurrent conditions.
- Priority: High for the write guard and dice engine. Medium for tool handlers. The playtest persona suite partially covers integration behavior but cannot replace unit tests.

**Playtest Reports Not Collected:**
- What's not tested: End-to-end onboarding flow across 5 player personas. The automated playtest suite exists but was never successfully run due to the world.rpg contention bug.
- Files: `tests/reports/` (all log files are empty), `tests/run-playtests.sh`
- Risk: Onboarding regressions, NPC knowledge leaks, and fourth-wall breaks under adversarial input are undetected.
- Priority: High. The breaker and DM personas specifically test edge cases that real players will hit.

---

*Concerns audit: 2026-04-03*
