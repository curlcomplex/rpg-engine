# RPG Engine — Debug Log

## DBG-001: Narrator leaks player knowledge into NPC dialogue

**Severity:** Medium  
**Component:** Narrator layer (LLM), not engine  
**Date:** 2026-04-01  
**Session:** Alyssa Ashcroft / Raccoon City / Session 1  

### What happened

During an `interview_npc` call with Robert Kendo (friendly approach, topic: "Badge #4477"), the engine correctly returned Kendo's `suspects` edge: *"His brother works Umbrella security. Could probably get a badge if pushed."*

The narrator then had Kendo say: *"if someone needed to get into an Umbrella parking garage, for instance"* — referencing a specific location (Umbrella garage, sublevel 2) that only the player knows about, from Ben's hidden note. Alyssa never shared this information with Kendo.

### Why it's wrong

1. **Information leak:** NPC referenced a clue (`Ben's hidden note — taped under desk drawer`) that has no KNOWS or SUSPECTS edge connecting it to Kendo. The NPC should only vocalize knowledge backed by edges in the graph.
2. **Character break:** Kendo's voice profile says "no wasted words" and "speaks about people with caution." Proactively suggesting a reporter break into a corporate facility is out of character — even for a man who's worried about his town.

### What should have happened

Kendo mentions his brother's Umbrella security badge in general terms — e.g., *"Joe has a keycard, gets him into their buildings."* The player connects the dots to the parking garage lead on their own.

### Root cause

The narrator (LLM) has full context of the player's knowledge and failed to constrain NPC dialogue to only what the NPC's graph edges support. The engine data was clean; the narration layer broke the boundary.

### Suggested fixes

1. **Narrator prompt rule:** When voicing an NPC, cross-check dialogue against the NPC's KNOWS/SUSPECTS edges. If the NPC has no edge to a piece of information, they cannot reference it — even obliquely.
2. **Engine-side guardrail (optional):** `interview_npc` could return a `npc_does_NOT_know` list of recent player-discovered clues, giving the narrator an explicit exclusion list to avoid leaking.
3. **Post-narration validation (aspirational):** A check that scans generated NPC dialogue for references to clue/event nodes the NPC has no edge to, and flags violations before output.
