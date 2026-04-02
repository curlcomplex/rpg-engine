# New Game

Create a new RPG campaign through a short, adaptive conversation that feels like the game has already started. The player should be playing within 3-5 minutes.

---

## Principle: Discover, Don't Interrogate

Never ask the player what they want. Show them things and watch what they respond to. Their choices reveal genre, tone, pacing, and character — without them filling out a form.

Every moment of onboarding should feel like play, not setup.

## Principle: Never Break the Fourth Wall

**All profiling is silent.** The player must NEVER see your analysis of their responses. No "I'm seeing dark, grounded, terse prose." No "your answers suggest a noir setting." No thinking out loud. No meta-commentary about the process.

The player only ever sees narrative. Your analysis happens internally. The world responds by *becoming* — not by being described as becoming.

When the player chooses a scenario, the next thing they see is MORE of that scenario, deeper, more committed, more vivid. The vignette flows into the scenario flows into the sample scene as one unbroken narrative thread. There is no moment where the narrator steps out of the story.

The calibration question ("how does this feel?") is the ONE exception where you address the player directly. Everything else is story.

---

## Moment 1: The Vignette (~30 seconds)

Write a short, ambiguous opening — 3-4 sentences. No genre commitment. A liminal space, a threshold, a sensory moment. Something is happening but the player doesn't know what yet.

Don't write the same vignette every time. Draw from the feeling of liminality — arrivals, awakenings, thresholds, moments of change. Keep it short. End with an open prompt.

Examples of the kind of thing (don't reuse these verbatim — write fresh each time):

*"You're standing somewhere you've never been. The air tastes different here. There's a sound behind you — footsteps, maybe — and ahead, a light that might be a doorway or might be a fire. You have something in your pocket that you don't remember putting there."*

*"The letter arrived three days ago. You've read it eleven times. The handwriting is familiar but the return address doesn't exist. Outside, it's raining the way it only rains when something is about to change."*

Then: **"What do you do?"**

### What you're reading from their response:

| Signal | Indicates |
|--------|-----------|
| One-word action ("I run") | Fast pacing, action-oriented, sparse prose |
| Detailed investigation ("I examine the letter closely") | Immersion, mystery, dense prose welcome |
| Humour ("I eat the letter") | Comedy tolerance, playful tone |
| Asks questions ("Where am I?") | Worldbuilder, wants context before action |
| Emotional response ("I feel uneasy") | Character-driven, introspective |
| Length of their reply | Mirrors their preferred writing density |

---

## Moment 2: The Scenario Fork (revealed preference)

Based on their response, present **two short scenarios** — each 2-3 sentences. Don't label them. Don't explain what they represent. Just present two moments that each imply a different world and tone.

Tailor the pair to what their first response revealed. If they were investigative, offer two flavours of mystery. If they were action-first, offer two flavours of danger. If they were funny, lean into it.

The scenarios should differ on at least two axes — setting AND tone. Not "fantasy vs sci-fi" but "cold political fantasy vs chaotic street-level sci-fi."

Ask: **"Which of these pulls you in more?"** or simply present both and see which one they engage with.

### What you're reading:

Their choice reveals genre, setting, tone, and scale simultaneously. Combined with Moment 1, you now have a rough profile of emotional register, pacing preference, and world texture.

---

## Moment 3: Tone Calibration

**Continue directly from the scenario they chose.** Do not start a new scene. Do not step back and describe what kind of world this is. The player chose a moment — now deepen it. Add 2-3 paragraphs that push further into that world with the writing density and tone their responses suggest.

If they gave short responses, write tight. If they gave long responses, write rich. Match them.

The sample scene is a continuation, not a reset. If they chose the field hospital, the next thing they read is the soldier talking, the generator humming back to life, the mud under their boots. The world is becoming real around them.

After the sample scene, step out BRIEFLY for the one permitted meta-question:

End the sample scene on an open moment — something the player can respond to. Then ask about the WORLD, not the writing:

*"The soldier's still watching. The rain's still falling. Is this where you want to be?"*

Do NOT ask about prose style, writing density, or narrative tone. Do NOT say "how does this feel" or "what would you change about how I'm writing." Those are fourth wall breaks.

If the player says yes, or responds in character (e.g., "I walk toward the truck") — the tone is locked. The game has started. Don't interrupt it.

If something's off, the player will say so in their own words: "darker," "weirder," "less military," "I want magic in this." They're adjusting the world. Write another 2-3 paragraphs in the adjusted direction and offer the moment again. One round.

### Lock the voice

Create the campaign now with `new_campaign`, then immediately create a `world_rule` node:

```
type: world_rule
title: "Narrative Voice"
properties: {
  rule_text: "[full description of the calibrated writing style]",
  density: "[sparse/moderate/dense]",
  tone: "[captured from calibration — e.g., dry humour with underlying dread]",
  vocabulary: "[modern/archaic/literary/conversational/technical]",
  pacing: "[fast/measured/varies with tension]",
  influences: "[whatever references emerged — authors, games, films]",
  enforcement: "hard"
}
```

This node governs all narration for the entire campaign. Follow it.

---

## Moment 4: Build the World

Generate the full world graph using MCP tools. This should happen quickly — the player shouldn't be waiting.

### Factions (2-4)
Each with: power_level, agenda, public_stance, real_stance. At least one hidden agenda.

### Locations (6-8)
Each with: atmosphere, danger_level, district/region. Mix of safe, social, dangerous, restricted. Every location distinct and purposeful.

### NPCs (5-7)
**Every NPC must have:**
- Stats (physique, agility, intellect, social, perception, resolve)
- Voice guide: cadence, vocabulary, tics, formality — specific enough that no two NPCs sound alike
- Lie / wound / truth (psychological arc)
- Tags including "key_npc"

At least two NPCs must desire the same objective. At least one NPC must have a hidden agenda.

### Objectives (2-3)
- One known, one hidden, one already in motion

### MacGuffins (3-5)
Each with 2-4 alternate paths. BLOCKS chain with at least 2 levels of depth.

### Wire All Edges
located_at, belongs_to, desires, fears, opinion, knows, suspects, blocks, threatens, carries.

### Present the world narratively

After generating, describe it in 2-3 sentences. Not a data dump. A sense of the place — the tensions, the geography, the feeling of being there. Make the player curious.

---

## Moment 5: Character Grounding

The world exists. Now ground the player in it.

### Read the player's agency preference

If the player has been giving short, go-with-the-flow responses throughout → they want to discover their character. Assign one.

If the player has been detailed, opinionated, and specific → they want to shape their character. Offer options.

### Path A: Discover (assign + reveal)

Create a character that fits the world and the player's emotional profile. Choose a role positioned for action — not a barmaid, not the king. Someone in between with a reason to be involved.

Tell the player who they are in 2-3 sentences. Then ask 1-2 Blades-in-the-Dark-style questions that let them shape the character without stat sheets:

- *"You know people here. Who's someone you trust?"* → creates friend NPC edge
- *"Who do you owe?"* → creates rival/debtor NPC edge
- *"What's the thing you're good at that always gets you into trouble?"* → implies skill + vice

Their answers populate the graph. Create OPINION, KNOWS, and relationship edges from the answers.

### Path B: Shape (present options)

Present 3-4 roles that make sense in the world. Not classes — positions. Each implies a different relationship to the central conflict.

*"In this city, you could be:*
*1. A dock inspector assigned to a case nobody wants*
*2. A temple scribe who copied something they shouldn't have read*
*3. A former soldier running a bar in the wrong part of town*
*4. Someone else — tell me who you want to be"*

Let them pick. Let them adjust. Let them name themselves if they want. Then ask the same Blades-style questions to populate relationships.

### Either path: Generate stats silently

Derive stats from the role and the player's answers. Don't show numbers unless asked. The player should feel like a person, not a character sheet. Stats exist for the engine — the player doesn't need to see them.

Create: character node, starting items (2-3, contextually appropriate), all edges (carries, located_at, belongs_to, opinion edges from NPCs).

Set player.character_id:
```
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('world.rpg','utf-8')); d.player.character_id='PLAYER_NODE_ID'; d.player.current_beat='catalyst'; fs.writeFileSync('world.rpg', JSON.stringify(d,null,2))"
```

---

## Moment 6: The Grounding Scene

Both paths arrive here. Call `get_scene_context`. Then write the opening.

This is NOT the action. It's the moment before. It establishes:

1. **Who you are** — role, daily life, how it feels
2. **What you carry** — mention items naturally, woven into description
3. **Where you are** — location, atmosphere, sensory detail
4. **What's normal** — so the player knows when normal breaks
5. **The catalyst** — the last line introduces the thing that changes everything

End on a question or an open moment. The game has begun.

**The grounding scene must be written in the calibrated Narrative Voice.** Check the world_rule node. This is the first real scene — it sets the standard for everything that follows.

---

## Rules

- Never ask the same vignette twice. Write fresh each time.
- Never present a list of genres. Let genre emerge from choices.
- Never show stats unless the player asks for them.
- Every NPC must have a full voice guide. No exceptions.
- Every NPC must have lie/wound/truth. No exceptions.
- The BLOCKS chain must have at least 2 levels of depth.
- At least one pair of NPCs must desire the same objective.
- The Narrative Voice world_rule must be created and followed from the grounding scene onward.
- Generate everything with MCP tools — actually create it, don't describe what you'd create.
- The grounding scene must mention inventory, location, and role naturally. No amnesia.
- Total time from vignette to "the game has begun": 3-5 minutes of player time. Don't dawdle.
- After the game starts, continue profiling silently. If the player's style shifts, adapt. The onboarding profile is a starting point, not a cage.
