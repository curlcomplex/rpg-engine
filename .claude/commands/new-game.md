# New Game

Create a new RPG campaign. Guide the player through world creation, character creation (if they want it), and drop them into an opening scene where they know who they are, where they are, and what's about to go wrong.

---

## Step 1: The Fork

Ask one question:

**"Do you want to just play, or do you want to build your character first?"**

Phrase it naturally — not like a menu. Something like: "Before we start — do you want me to throw you into something and see what happens, or would you rather have a hand in building who you are first?"

- **"Just play"** → Path A (quick start)
- **"Build my character"** → Path B (involved start)

Both paths converge at the Grounding Scene (Step 6). Both paths get tone calibration. The difference is how much input the player has over their character.

---

## Step 2: Discover the Player (both paths)

Ask 2-3 open-ended questions. NOT canned. NOT multiple choice. NOT the same every time. These are open prompts that reveal who the player is as a reader — their emotional register, genre gravity, and writing density preference.

**Ask ONE question at a time. Wait for the answer. Let the next question be informed by what they said.**

Draw from prompts like these, but adapt and improvise — don't use the same ones every session:

- "Tell me about a moment in a game, book, or film that genuinely stuck with you."
- "What kind of world do you find yourself wanting to get lost in?"
- "When you imagine yourself in a story, who are you? Not a class or a build — who are you?"
- "What's the difference between a world that feels real and one that doesn't?"
- "What bores you in a story?"

The point is NOT to determine genre. The point is to understand:
1. **Emotional register** — What makes this player feel something? Dread, wonder, comedy, melancholy?
2. **Writing density** — Do they want prose they savour or prose that gets out of the way?
3. **World texture** — What kind of place feels real to them?
4. **Agency style** — Do they want to be guided or dropped in a sandbox?

Read their answers carefully. How they write tells you as much as what they write. Someone who gives one-word answers wants a different game than someone who writes a paragraph.

---

## Step 3: Tone Calibration (both paths)

Based on what you've learned, propose a world concept in 2-3 sentences. Then write a **sample scene** — 2-3 paragraphs showing what the game would actually feel like. Not a description of the tone. The tone itself. Write it as if the game has already started.

Then ask: **"How does this feel? Too much? Not enough? What would you change about how I'm writing to you?"**

If they give feedback, adjust and write another short sample. One round of this should be enough. Two at most.

Once they're happy, capture the writing style as a `world_rule` node after the campaign is created:

```
type: world_rule
title: "Narrative Voice"
properties: {
  rule_text: "[captured style description]",
  density: "[sparse/moderate/dense]",
  tone: "[e.g., dry dark comedy, earnest and atmospheric, terse and brutal]",
  vocabulary: "[e.g., modern vernacular, archaic, literary, conversational]",
  pacing: "[e.g., fast and clipped, slow and immersive, varies with tension]",
  influences: "[whatever the player referenced or the style resembles]",
  enforcement: "hard"
}
```

This node gets loaded every session via `get_scene_context`. It is the law. Follow it.

---

## Step 4: Create the Campaign (both paths)

Call `new_campaign` with:
- **name**: a slug derived from the world concept
- **title**: an evocative title
- **genre**: derived from conversation
- **setting**: 1-2 sentence setting description
- **tone**: from the calibration step

---

## Step 5: Generate the World (both paths)

Using the MCP tools, generate the full world graph.

### Factions (2-4)
Each with: power_level, agenda, public_stance, real_stance. At least one faction should have a hidden agenda that contradicts their public stance.

### Locations (6-8)
Each with: atmosphere, danger_level, district/region. Include safe spaces, social hubs, dangerous areas, and restricted zones. Every location should feel distinct and serve a narrative purpose.

### NPCs (5-7)
**Each NPC MUST have:**
- Stats (physique, agility, intellect, social, perception, resolve)
- Voice guide in properties: cadence, vocabulary, tics, formality — specific enough that two NPCs never sound the same
- Lie (false belief), wound (backstory trauma), truth (what they need to learn)
- Tags including "key_npc"

NPCs should have conflicting goals. At least two NPCs should desire the same objective.

### Objectives (2-3)
- One primary objective the player will know from the start (visibility: "known")
- One hidden objective that emerges through play (visibility: "hidden")  
- One secondary objective already in motion (visibility: "discovered")

### MacGuffins (3-5)
Each with alternate_paths (2-4 ways to obtain). Must form a BLOCKS chain with at least 2 levels of depth, ultimately gating the hidden objective.

### Wire All Edges
- `located_at` — place every character at a location
- `belongs_to` — faction memberships
- `desires` / `fears` — NPC motivations (at least 2 per NPC)
- `opinion` — every NPC has an opinion of the player (-100 to +100)
- `knows` / `suspects` — NPC knowledge (specific, not vague)
- `blocks` — MacGuffin chain
- `threatens` — at least one active threat to the player

### Present the World (narratively, not as a data dump)

After generating, describe the world to the player in 1-2 paragraphs. Factions, tensions, geography, what's happening right now. This is the tourist brochure from hell — make them curious.

---

## Step 5A: Path A (Quick Start) — Assign Character

Generate a player character that fits the world and the player's emotional profile. Choose a role that's positioned for action — not a barmaid, not the king, but someone in between who's about to have a very bad week.

Give them:
- Stats weighted toward the role (base 2-6 per stat, total ~28)
- Skills at 1-3 (6-8 skills relevant to the role)
- 2-3 starting items they'd reasonably carry
- A position in the world (job, affiliation, reputation)

Create the character node, starting items, and all edges (carries, located_at, belongs_to, opinion edges from NPCs).

**Do NOT skip straight to the opening scene.** After creating the character, briefly tell the player who they are: "You're a harbour inspector, two years on the job. You carry a logbook and a badge that gets you past most doors on the waterfront." Give them a chance to react before the story starts.

→ Proceed to Step 6.

## Step 5B: Path B (Involved Start) — Player Builds Character

Present 3-4 character options that make sense in the world. Not classes — **positions**:

*"Given this world, you could be:*
*1. A harbour inspector assigned to a case nobody wants*
*2. A Temple acolyte who overheard something before the festival*
*3. A Dock Rat courier asked to deliver something unusual*
*4. Someone else — tell me who you want to be"*

Each option comes with suggested stats and starting gear. The player picks one or proposes their own (option 4). If they propose their own, work with them to fit it into the world — the character must have a reason to be involved in the central conflict.

Let them adjust stats if they want. Let them choose their starting items from a reasonable set. Let them name themselves.

Create the character node, items, and all edges.

→ Proceed to Step 6.

---

## Step 6: Grounding Scene (both paths converge here)

Set the player's character_id in the world document:
```
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('world.rpg','utf-8')); d.player.character_id='PLAYER_NODE_ID'; d.player.current_beat='catalyst'; fs.writeFileSync('world.rpg', JSON.stringify(d,null,2))"
```

Now write a **grounding scene**. This is NOT the opening action — it's the moment before. It establishes:

1. **Who you are** — role, daily life, how you feel about it
2. **What you carry** — mention inventory items naturally, not as a list
3. **Where you are** — the location, the atmosphere, sensory details
4. **What's normal** — so the player knows when normal breaks
5. **The catalyst** — the last sentence introduces something that changes everything. A file on your desk. A stranger at the door. A sound that shouldn't be there.

End on a question or a choice. "Do you open the file?" / "The stranger is looking at you. What do you do?" / "The sound comes again — closer this time."

The game has begun.

---

## Rules

- Every NPC must have a full voice guide. No exceptions.
- Every NPC must have lie/wound/truth. No exceptions.
- The BLOCKS chain must have at least 2 levels of depth.
- At least one pair of NPCs must desire the same objective.
- The Narrative Voice world_rule node must be created and followed.
- Generate everything with the MCP tools — do not describe what you "would" create. Actually create it.
- The grounding scene must mention the player's inventory, location, and role naturally — no amnesia.
- Never present the world as a list of nodes. Always narrate.
