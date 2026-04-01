# Save Game

Save the current game state with a narrative snapshot for context restoration.

## Step 1: Capture Current State

Call `get_scene_context` to get the full current state.

## Step 2: Generate Save Summary

Call `advance_time` to process any pending world reactions.

Then create a SCENE node that captures the current moment as a save point:

Call `create_node` with:
- **type**: `scene`  
- **title**: A brief title for this moment (e.g., "Outside the RPD, night falling")
- **description**: A 2-3 sentence narrative summary of where the player is, what they've accomplished, what's unresolved, and what feels imminent
- **properties**:
  - `save_point`: true
  - `act`: current act number
  - `beat`: current story beat
  - `tension_level`: current tension
  - `timestamp`: current ISO timestamp
  - `session_summary`: a brief paragraph covering key events since last save
- **tags**: `["save_point"]`

## Step 3: Save Campaign File

Copy the current world.rpg to the campaigns directory to ensure it's persisted. Use bash:

```bash
cp world.rpg campaigns/CAMPAIGN_NAME.rpg
```

Where CAMPAIGN_NAME is derived from the world title (slugified).

## Step 4: Confirm to Player

Tell them:
- Campaign saved as [name]
- Summary of what was captured
- How to resume later (`/load-game`)
- Current stats: node count, edge count, session count

Keep it brief. They might be saving before closing, so don't make them wait.
