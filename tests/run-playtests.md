# Automated Playtest Runner

Run each persona through /new-game + gameplay + /save-game and collect reports.

## How to run

Each persona needs its own Claude Code session (separate campaign file). Run them one at a time or in parallel sessions.

### For each persona:

1. Open a new Claude Code session in `/Users/f.god/Work/RPG`
2. Make sure rpg-engine MCP is connected
3. Paste this prompt (replacing PERSONA_FILE with the persona path):

```
Read the file tests/personas/PERSONA_FILE.md — those are your instructions. You are playtesting this RPG engine by pretending to be that type of player.

Start by running /new-game. Then play through the onboarding and take 8-10 gameplay actions, always responding as the persona describes. After 8-10 actions, run /save-game. Then write your playtest report as specified in the persona file.

Save your report to tests/reports/PERSONA_NAME-report.md
```

### Personas to test:
1. `the-grunt` — minimal responses
2. `the-novelist` — verbose, immersive
3. `the-comedian` — humour, absurdity
4. `the-breaker` — refuses all hooks
5. `the-dm` — meta questions, system probing

### After all runs:

Analyse the reports and campaign files. Check:
- [ ] World variety — are the 5 worlds meaningfully different?
- [ ] Tone matching — did prose density match each persona's energy?
- [ ] Fourth wall — any insight blocks or meta-commentary leaked?
- [ ] Narrative health — run check_narrative_health on each campaign
- [ ] NPC consistency — any knowledge leaks across all sessions?
- [ ] Onboarding timing — how many exchanges before gameplay for each?
- [ ] Breaker resilience — did the story survive The Breaker?
- [ ] Comedy adaptation — did the tone shift for The Comedian?

Save analysis to tests/reports/analysis.md
