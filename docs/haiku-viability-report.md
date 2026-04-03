# Haiku 4.5 Viability Report — RPG Engine

**Date:** 2026-04-03
**Test:** /new-game onboarding flow (Moments 1-6)
**Model:** claude-haiku-4-5-20251001
**Tester:** Felix

---

## Summary

Haiku 4.5 is not viable as the primary model for the RPG Engine's onboarding flow. It produces acceptable atmospheric prose but fails to follow the structured protocol, breaks the fourth wall, and never engages the MCP engine. The game world is never actually created.

---

## Test Results

### What Haiku did well

- **Moment 1 (Vignette):** Adequate. Wrote a liminal, atmospheric opening. Correct length, correct tone, no genre commitment. The vignette was original and evocative.
- **Moment 2 (Fork):** Adequate. Presented two distinct scenarios separated by a pause. Correctly read the player's "knock" action as engagement-oriented and offered two tension-flavoured options.
- **Prose quality:** The raw writing was competent — short sentences, physical detail, appropriate mood. Haiku can narrate.

### What Haiku failed at

#### 1. Fourth wall broken (critical)

The /new-game skill states in bold:

> *"Do NOT output Insight blocks, analysis blocks, thinking blocks, or any metacommentary about the player's responses during the game."*

And separately:

> *"Never analyse their responses aloud. Never step outside the narrative."*

Haiku wrote:

> "You've been terse and sure — you knocked, you chose darkness over bureaucracy, you stood firm when pressure came. You commit fast. You trust your instincts."

This is a direct analysis of the player's responses, presented to the player. It breaks the central design principle of the onboarding — the fugue state. The player is now aware they are being profiled. The spell is broken.

#### 2. Protocol sequencing lost (critical)

The skill defines 6 Moments in strict order with specific gates between them:

| Moment | Status | Notes |
|--------|--------|-------|
| 1. Vignette | Pass | Original, atmospheric, correct length |
| 2. Fork | Pass | Two distinct options, correctly tailored |
| 3. Deepening + Commitment Gate | Partial | Wrote the deepening scene but bungled the gate — jumped ahead without locking voice or creating campaign |
| 4. World Generation | Skipped | Never executed |
| 5. Character Grounding | Attempted | Broke fourth wall, never completed |
| 6. Catalyst | Never reached | — |

Haiku absorbed the *vibe* of the protocol (atmospheric, immersive) but lost the *structure* (do this, then this, then this). It pattern-matched the creative task and dropped the mechanical obligations.

#### 3. MCP tools never called (critical)

Haiku did not call a single MCP tool during the entire session:

- No `new_campaign` — the campaign was never created
- No `create_node` — no world nodes exist
- No `create_edge` — no relationships wired
- No world generation at all
- The game engine was completely bypassed

The player received an interactive fiction experience with no underlying game state. There is no world to save, load, or interact with mechanically. The "game" is pure hallucination with no persistence.

#### 4. Instruction density ceiling

The /new-game skill is ~2,000 words of interlocking constraints: sequencing rules, prohibitions (no fourth wall), tool call requirements, silent profiling, voice calibration, and specific graph structures to create. Haiku appears to have a ceiling for how many simultaneous constraints it can hold:

- **Creative constraints** (write atmospheric prose, match player energy): Followed
- **Prohibitive constraints** (don't break fourth wall, don't analyze aloud): Violated
- **Procedural constraints** (call these tools in this order): Ignored
- **Structural constraints** (create nodes with these specific fields): Never attempted

The model prioritized the most salient task (write good prose) and shed the rest.

---

## Cost Analysis

If Haiku can't run the game, the question is which model can, and at what cost.

| Model | Input/1M tokens | Output/1M tokens | Est. /new-game cost | Est. 1hr session cost |
|-------|-----------------|-------------------|---------------------|-----------------------|
| Haiku 4.5 | $0.80 | $4.00 | $0.02–0.05 | $0.10–0.30 |
| Sonnet 4.6 | $3.00 | $15.00 | $0.08–0.20 | $0.40–1.20 |
| Opus 4.6 | $15.00 | $75.00 | $0.40–1.00 | $2.00–5.00 |

A regular player doing 2-3 sessions per week on Opus would cost $15-60/month in API tokens alone. This is viable for a premium product but not for casual or free-tier usage.

---

## Root Cause Analysis

This is both a model problem and a protocol problem.

### Model limitations

Haiku 4.5 has a constraint-juggling ceiling. When given a complex protocol with creative, prohibitive, procedural, and structural requirements simultaneously, it prioritizes the most pattern-matchable task (creative writing) and drops the rest. This is consistent with Haiku's positioning as a fast, efficient model — not a deep reasoning one.

### Protocol design issues

The /new-game skill was designed for a model that can internalize a 2,000-word protocol and execute it faithfully while being creative. That assumption holds for Opus and likely Sonnet, but fails for Haiku. The protocol could be made more Haiku-friendly:

1. **Monolithic instruction block.** The entire 6-Moment protocol is delivered as one prompt. Haiku works better with shorter, focused instructions.
2. **Silent constraints are the first to drop.** "Absorb this but say nothing" is the hardest type of instruction for a smaller model. Haiku leaked its analysis because the prohibition was passive (don't do X) rather than active (do Y instead).
3. **Tool calls compete with prose.** The skill asks the model to simultaneously write immersive fiction AND make structured API calls. These are cognitively different tasks. Haiku can do either; it struggles to interleave both.

---

## Recommendations

### Short-term: Test Sonnet 4.6

Run the identical /new-game flow with Sonnet. Sonnet is 5x cheaper than Opus and generally handles structured multi-step protocols. Key things to validate:
- Does it call MCP tools?
- Does it respect the fourth wall?
- Does it follow the Moment sequencing?
- Is the prose quality acceptable?

### Medium-term: Refactor the protocol for model tiering

Break the monolithic /new-game skill into a state machine:

```
Moment 1 (Vignette)    → small, focused prompt → any model
Moment 2 (Fork)        → small, focused prompt → any model
Moment 3 (Deepening)   → small, focused prompt → any model
Moment 4 (World Gen)   → structured tool calls → Sonnet minimum
Moment 5 (Character)   → mixed prose + tools   → Sonnet minimum
Moment 6 (Catalyst)    → creative prose         → any model
```

Each Moment gets its own instruction set. The engine enforces sequencing rather than trusting the LLM. This lets smaller models handle the moments they're good at.

### Long-term: Hybrid model routing

Use different models for different tasks within a session:
- **Haiku:** In-game narration, simple NPC dialogue, scene descriptions
- **Sonnet:** Complex protocol execution, world generation, NPC interviews with knowledge isolation
- **Opus:** Reserved for critical moments — onboarding, major plot pivots, adversarial NPCs

This maps to the Phase 4 NPC sub-agent architecture already planned (Haiku for minor NPCs, Sonnet for key characters). Extend the same principle to all engine operations.

---

## Conclusion

Haiku 4.5 writes well but cannot run the RPG Engine. The gap is not in creativity — it's in protocol adherence, tool orchestration, and constraint management. The engine needs a model that can hold multiple types of instructions simultaneously while remaining creative.

Sonnet 4.6 is the most likely viable default. The protocol should also be refactored to reduce the cognitive load on any single model call, which would improve reliability across all tiers and potentially open Haiku up for simpler in-game operations.
