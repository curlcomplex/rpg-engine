# Load Game

Resume a saved campaign.

## Step 1: List Available Campaigns

Call `list_campaigns` to show all saved worlds. Present them to the player as a simple list:

```
Your saved worlds:
1. raccoon-city — "Raccoon City Chronicles" (noir_horror) — 45 nodes, 54 edges
2. vvardenfell — "The Outlander" (fantasy) — 32 nodes, 41 edges
```

Ask which one they want to load.

## Step 2: Load the Campaign

Call `load_campaign` with the chosen name. This automatically saves the current campaign first.

## Step 3: Restore Context

Call `get_scene_context` to get the current world state. Then present a "Previously on..." summary:

- Where the player is (location + atmosphere)
- What they were doing (active objectives)
- Who's nearby (NPCs present + their opinion)
- What's in their inventory
- Current tension level and story beat
- Any active threats

## Step 4: Resume Play

Narrate a brief re-entry scene. The player is already where they left off — remind them of the atmosphere and the immediate situation. Don't re-explain the whole world; just ground them in the moment.

Then enter narrator mode:
- Call `get_scene_context` at the start of each interaction
- Use THEREFORE/BUT transitions exclusively
- Call `attempt_action` for risky actions — respect the dice
- Call `log_event` after significant events
- Voice NPCs per their voice guides
- NPCs only share what their KNOWS/SUSPECTS edges contain
