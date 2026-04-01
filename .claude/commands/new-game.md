# New Game

Create a new RPG campaign from scratch. Guide the player through world creation, then drop them into the opening scene.

## Step 1: Onboarding Questions

Ask the player 4-6 evocative questions to profile what kind of world they want. Do NOT ask "what genre?" directly. Instead, use oblique questions that feel like the game has already started:

- "Stone or glass?" → maps to medieval/futuristic
- "Silence or static?" → maps to isolated/urban
- "A locked door or an open window?" → maps to mystery/exploration
- "Old debt or new blood?" → maps to political intrigue/action
- "Candlelight or neon?" → maps to fantasy/cyberpunk
- "The mountain or the sea?" → maps to geography/culture

Ask ONE question at a time. Wait for the answer before asking the next.

After 4-6 questions, tell the player what kind of world their answers suggest. Give them a chance to adjust ("Does this feel right, or do you want to steer it somewhere else?").

## Step 2: Create the Campaign

Call `new_campaign` with:
- **name**: a slug derived from the world concept (e.g., "vvardenfell", "neon-city", "iron-coast")
- **title**: an evocative title for the world
- **genre**: derived from answers
- **setting**: 1-2 sentence setting description
- **tone**: 3-4 adjectives

## Step 3: Generate the World

Using the MCP tools, create the full world graph. Generate ALL of the following:

### Factions (2-4)
Each with: power_level, agenda, public_stance, real_stance. At least one faction should have a hidden agenda that contradicts their public stance.

### Locations (6-8)
Each with: atmosphere, danger_level, district/region. Include a mix of safe spaces, social hubs, dangerous areas, and restricted zones. Every location should feel distinct.

### Characters (5-7 NPCs + 1 player character)
**Player character:** Minimal backstory (blank slate). Stats weighted toward the role the world implies. Starting skills at 1-3. The player is a vessel, not a pre-written character.

**Each NPC MUST have:**
- Stats (physique, agility, intellect, social, perception, resolve)
- Voice guide in properties: cadence, vocabulary, tics, formality
- Lie (false belief they hold), wound (backstory trauma that created it), truth (what they need to learn)
- Tags including "key_npc"

NPCs should have conflicting goals. At least two NPCs should desire the same thing.

### Objectives (2-3)
- One primary objective the player knows about from the start (visibility: "known")
- One hidden objective that emerges through play (visibility: "hidden")
- One secondary objective that's already in motion (visibility: "discovered")

### MacGuffins (3-5)
Each with alternate_paths (2-4 ways to obtain it). MacGuffins should form a BLOCKS chain where early ones gate later ones, ultimately gating the hidden objective.

### Items (2-3 starting items)
Things the player character would reasonably carry given their role.

## Step 4: Wire the Edges

After creating all nodes, connect them:
- `located_at` — place every character at a location
- `belongs_to` — faction memberships
- `carries` — player inventory
- `desires` / `fears` — NPC motivations (at least 2 per NPC)
- `opinion` — every NPC should have an opinion of the player (weight -100 to +100)
- `knows` / `suspects` — NPC knowledge (what each NPC knows about the world)
- `blocks` — MacGuffin chain (what gates what)
- `threatens` — at least one active threat to the player
- `has_trait` — if using trait nodes

## Step 5: Set Player Character

After creating the player character node, update the world document's player.character_id to point to it. Use a bash command:
```
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('world.rpg','utf-8')); d.player.character_id='PLAYER_NODE_ID'; d.player.current_beat='catalyst'; fs.writeFileSync('world.rpg', JSON.stringify(d,null,2))"
```

## Step 6: Opening Scene

Call `get_scene_context` to load the world state, then narrate the opening scene. Drop the player in at the Catalyst beat — something has just happened or is about to happen. No menus, no tutorials. They're in the world.

## Rules for Generation
- Every NPC must have a full voice guide. No exceptions.
- Every NPC must have lie/wound/truth. No exceptions.
- The BLOCKS chain must have at least 2 levels of depth.
- At least one pair of NPCs must desire the same objective (creates natural conflict).
- Generate everything with the MCP tools — do not describe what you "would" create. Actually create it.
