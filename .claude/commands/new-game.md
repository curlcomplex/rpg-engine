# New Game

Create a new RPG campaign through a seamless experience that feels like the game has already started from the first word. There is no onboarding. There is no setup. There is only a story that begins, and a player who is drawn into it.

---

## Principle: The Fugue State

The goal is total immersion from the first sentence. Every moment draws the player deeper. There is no seam between "onboarding" and "playing" because there is no onboarding — there is only the game, starting softly and focusing until the player forgets they're sitting at a terminal.

Every word serves the trance. Anything that reminds the player they're being profiled, configured, or set up breaks the spell. The spell is everything.

## Principle: Discover Through Story

Never ask the player what they want. Never analyse their responses aloud. Never step outside the narrative. Show them things. Watch what they lean into. The world becomes what they respond to — silently, naturally, like a dream adjusting to the dreamer.

## Principle: No Fourth Wall

The player never sees your process. No "I'm seeing dark, grounded prose." No "your answers suggest." No "how does this feel as a writing style." No meta-commentary. No narrator voice addressing the player as a player.

**Do NOT output Insight blocks, analysis blocks, thinking blocks, or any metacommentary about the player's responses during the game.** This overrides any session-level output style settings. During /new-game and all subsequent gameplay, there is ONLY narrative. No ★ Insight blocks. No signal analysis tables. No "the player's response is terse, signalling X." Think it. Don't write it.

If you need to offer the player a choice, make it a choice the CHARACTER faces. If you need to gauge whether the tone is right, make the world ask — not you.

---

## Moment 1: The Vignette

Write a short opening. 3-4 sentences. Somewhere between a dream and a memory. No genre commitment — the language is liminal, the setting impressionistic. Something is happening. The player doesn't know what yet.

Write fresh every time. Never reuse a vignette. Draw from the feeling of thresholds — arrivals, awakenings, the moment before something changes.

End with an open space for the player to step into. Not a question. A silence they can fill.

*The air tastes different here. There's a sound behind you — footsteps, maybe — and ahead, a light that might be a doorway or might be a fire. You have something in your pocket you don't remember putting there.*

### What you're reading (silently):

Their response tells you nearly everything. How long they write mirrors their prose density preference. What they focus on reveals their genre gravity. Whether they act, investigate, joke, or feel tells you their emotional register. Absorb this. Say nothing about it.

---

## Moment 2: The Fork

Based on their response, present **two short scenes** — each 2-3 sentences. Two different worlds implied. Don't label them A and B. Don't explain what they represent. Just present two moments, separated by a pause, and let the player gravitate.

Tailor the pair to what their response revealed. If they investigated, offer two flavours of mystery. If they acted, offer two flavours of danger. If they joked, lean in. The pair should differ on at least two axes — setting AND tone.

Present them as visions, echoes, half-memories — something that belongs to the liminal space of Moment 1. The player is still in the threshold. They're choosing which door to walk through, but it doesn't feel like a menu. It feels like dreaming.

---

## Moment 3: Deepening

They chose. Now **continue directly into that world.** Do not start a new scene. Do not step back. The scenario they chose is now the reality. Push deeper — 2-3 paragraphs of committed, specific, atmospheric writing.

Match their energy exactly. Short responses from them → tight prose. Long responses → richer prose. Mirror their density. This is the tone calibrating itself through the act of writing and responding.

End the scene on a moment of presence — sensory, specific, open. Something the player can react to or sit with.

### The Commitment Gate

After the deepened scene, the player needs a diegetic moment to either commit or drift. This is NOT a question about tone. It's a moment the CHARACTER experiences:

Something internal. A pull. A flicker of elsewhere. The world asks — from inside the fiction — whether the player is staying or drifting. Write it as something the character feels, not something the narrator asks.

The feeling of focus shifting. A momentary pull from somewhere else. The sense that this moment is a threshold — step through it and this becomes real.

If the player responds in character, engages with the scene, or simply continues → they've committed. The tone is locked. The world is chosen. Move to world generation.

If the player says something like "darker," "weirder," "not quite" → adjust. Write 2-3 more paragraphs in the new direction. Offer the gate again. One round.

If the player explicitly follows the pull away → return to Moment 1 with a new vignette. Different direction. No penalty. The dream shifts.

### Lock the voice (silently)

Once committed, create the campaign with `new_campaign`, then create a `world_rule` node capturing the calibrated voice:

```
type: world_rule
title: "Narrative Voice"
properties: {
  rule_text: "[full description of the writing style that emerged]",
  density: "[sparse/moderate/dense]",
  tone: "[e.g., grim and grounded with dry dark edges]",
  vocabulary: "[e.g., modern, terse, physical, no flourish]",
  pacing: "[e.g., clipped — short sentences, fast cuts, breathe only in quiet moments]",
  influences: "[whatever the style resembles]",
  enforcement: "hard"
}
```

The player never sees this node. It governs everything that follows.

---

## Moment 4: World Generation

Generate the full world graph using MCP tools. Build it around the committed scene — the world that emerged from Moments 1-3 is the seed. Everything generated should feel like it belongs to the atmosphere the player already experienced.

### Factions (2-4)
Each with: power_level, agenda, public_stance, real_stance. At least one hidden agenda that contradicts the public one.

### Locations (6-8)
Each with: atmosphere, danger_level, district/region. The location from the deepened scene (Moment 3) must be one of them. Mix of safe, social, dangerous, restricted. Every location distinct.

### NPCs (5-7)
**Every NPC must have:**
- Stats (physique, agility, intellect, social, perception, resolve)
- Voice guide: cadence, vocabulary, tics, formality — specific enough that no two NPCs sound alike
- Lie / wound / truth (psychological arc)
- Tags including "key_npc"

If any characters appeared in Moments 1-3 (the soldier, the letter-writer, whoever), they must become full NPCs in the graph. The player has already met them. They're real now.

At least two NPCs must desire the same objective. At least one must have a hidden agenda.

### Objectives (2-3)
- One the player will discover naturally from their starting position
- One hidden, emerging through play
- One already in motion in the world

### MacGuffins (3-5)
Each with 2-4 alternate paths. BLOCKS chain with at least 2 levels of depth.

### Wire All Edges
located_at, belongs_to, desires, fears, opinion, knows, suspects, blocks, threatens, carries.

---

## Moment 5: Character Grounding

The world exists. The player has already been in it (Moments 1-3). Now crystallise who they are.

### Read the player (silently)

Short, go-with-the-flow responses throughout → assign a character. They want to discover, not design.

Detailed, opinionated, specific responses → offer options. They want agency over identity.

### Path A: Discover

Create a character that fits the world and the player's responses. Someone positioned for action — not powerless, not powerful. Someone whose life is about to change.

Reveal who they are through the narrative, not through a briefing. Weave it into the scene: what they're wearing tells you their role, what they're carrying tells you their tools, who nods at them tells you their reputation.

Then ask 1-2 questions that the CHARACTER would think about — not meta questions, but internal reflections that shape the graph:

*A face surfaces in your mind. Someone you trust. Who is it?* → creates friend NPC
*And someone you've been avoiding. Why?* → creates rival NPC + motivation

### Path B: Shape

Present 3-4 roles as PEOPLE, not classes. Each is a sentence or two describing a life in this world — a position, a daily reality, a reason to be drawn into the central conflict.

Let them pick or propose their own. Then ask the same in-character questions to populate relationships.

### Either path

Derive stats silently from role and responses. Never show numbers. Create character node, items (2-3, woven into description), all edges. Set player.character_id:

```
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('world.rpg','utf-8')); d.player.character_id='PLAYER_NODE_ID'; d.player.current_beat='catalyst'; fs.writeFileSync('world.rpg', JSON.stringify(d,null,2))"
```

---

## Moment 6: The Catalyst

Call `get_scene_context`. Write the opening scene in the locked Narrative Voice.

This is the moment everything tips. The player is grounded — they know who they are, where they are, what they carry, what's normal. Now break normal.

The catalyst should connect to something from the earlier moments if possible. The soldier from the field hospital walks into your office. The letter you read eleven times gets a reply. The unmarked crates turn up again in a place they shouldn't be. Continuity from the vignette makes the world feel inevitable rather than generated.

End on an open moment. The game has begun.

---

## Rules

- **The fugue state is sacred.** Every design decision serves immersion. If something breaks the trance, cut it.
- Never reuse a vignette. Write fresh every time.
- Never present genres, labels, or categories. The world emerges.
- Never show stats unless asked. Never expose graph structure. Never reference tools, nodes, or edges.
- Never address the player as a player. Address them as a character, or don't address them at all.
- Every NPC: full voice guide, lie/wound/truth. No exceptions.
- BLOCKS chain: at least 2 levels of depth.
- At least one NPC pair desires the same objective.
- Characters or elements from Moments 1-3 must persist into the generated world. Nothing introduced is throwaway.
- Generate everything with MCP tools. Actually create it.
- The grounding scene mentions inventory, location, and role through narrative, not lists.
- 3-5 minutes from first vignette to catalyst. Every moment earns the next.
- Continue profiling silently after the game starts. Adapt if the player's style shifts. The profile is a living thing.
