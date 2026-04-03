---
phase: 01-engine-extraction
plan: 02
subsystem: engine
tags: [typescript, npc, interview, knowledge-graph, game-engine]

# Dependency graph
requires:
  - phase: 01-engine-extraction/01
    provides: "Engine package at packages/engine/src/ with types.ts, narrative.ts, index.ts"
provides:
  - "NPC structured type interfaces (NpcVoice, NpcArc, InteractionRecord, NpcProperties)"
  - "Duplicate KNOWS edge guard in investigate()"
  - "Opinion edge creation for new NPCs in interviewNpc()"
  - "Bidirectional KNOWS edges (NPC learns from player) in interviewNpc()"
  - "Interaction history tracking per NPC"
affects: [02-web-app, 03-turn-orchestrator, 04-narrator-voice]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "alreadyKnows guard pattern for duplicate edge prevention"
    - "NPC structured properties via TypeScript interfaces on GameNode.properties"
    - "Bidirectional knowledge tracking via info_shared_by_player param"

key-files:
  created: []
  modified:
    - "packages/engine/src/types.ts"
    - "packages/engine/src/narrative.ts"
    - "packages/engine/src/index.ts"

key-decisions:
  - "NPC types are optional interfaces, not runtime-validated -- TypeScript guides developers, no schema enforcement"
  - "Interaction history is append-only on the NPC properties object, not a separate node type"
  - "Bidirectional KNOWS uses same edge type with different properties (discovered_via: player_shared)"

patterns-established:
  - "alreadyKnows guard: check doc.edges.some() before creating KNOWS edges to prevent duplicates"
  - "Opinion edge lifecycle: update existing via remove+re-add, create new for first interaction"

requirements-completed: [ENG-04, ENG-05, ENG-06, ENG-07, ENG-08]

# Metrics
duration: 2min
completed: 2026-04-03
---

# Phase 1 Plan 2: NPC Types and Interview Fixes Summary

**NPC structured type interfaces (voice, arc, backstory), duplicate KNOWS edge guard in investigate, bidirectional knowledge and interaction history in interviewNpc, and opinion edge creation for new NPCs**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-03T19:30:33Z
- **Completed:** 2026-04-03T19:32:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added 4 NPC type interfaces (NpcVoice, NpcArc, InteractionRecord, NpcProperties) to engine types
- Fixed investigate() to guard against duplicate KNOWS edges when re-investigating a location
- Fixed interviewNpc() opinion edge bug: now creates opinion edges for NPCs on first interaction
- Added bidirectional KNOWS edges so NPCs learn what the player shares during interviews
- Added interaction_history tracking that appends a record after each NPC conversation

## Task Commits

Each task was committed atomically:

1. **Task 1: Add NPC type interfaces and fix investigate duplicate KNOWS bug** - `ced64db` (feat)
2. **Task 2: Fix opinion edge bug, add bidirectional KNOWS, add interaction_history** - `00216d9` (feat)

## Files Created/Modified
- `packages/engine/src/types.ts` - Added NpcVoice, NpcArc, InteractionRecord, NpcProperties interfaces
- `packages/engine/src/narrative.ts` - Fixed investigate() duplicate guard, fixed opinion edge no-op, added bidirectional KNOWS, added interaction_history append
- `packages/engine/src/index.ts` - Added NPC type exports to barrel

## Decisions Made
- NPC types are optional interfaces on GameNode.properties, not runtime-validated -- guides developers without adding schema enforcement overhead
- Interaction history is append-only on the NPC's properties object rather than separate graph nodes -- keeps the graph clean, history is per-NPC
- Bidirectional KNOWS edges use the same edge type with `discovered_via: 'player_shared'` property to distinguish direction of information flow

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Engine package fully enhanced with NPC types and interview improvements
- Phase 1 (Engine Extraction) is complete: both plans (01-01 and 01-02) finished
- Ready for Phase 2 (Web App) which will consume the enhanced engine package

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 01-engine-extraction*
*Completed: 2026-04-03*
