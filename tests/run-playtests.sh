#!/bin/bash
# Run all 5 persona playtests in parallel using claude CLI
# Each gets its own session with rpg-engine MCP connected

cd /Users/f.god/Work/RPG

PERSONAS=("the-grunt" "the-novelist" "the-comedian" "the-breaker" "the-dm")

mkdir -p tests/reports

for persona in "${PERSONAS[@]}"; do
  echo "🎮 Starting playtest: $persona"

  PERSONA_CONTENT=$(cat "tests/personas/${persona}.md")

  PROMPT="You are in /Users/f.god/Work/RPG. The rpg-engine MCP server is available.

${PERSONA_CONTENT}

IMPORTANT: You must actually play through this. Start by invoking the /new-game skill. Play through the onboarding responding as the persona. Take 8-10 gameplay actions. Then invoke /save-game. Then write the playtest report and save it to tests/reports/${persona}-report.md

Begin now. Start with /new-game."

  claude --dangerously-skip-permissions -p "$PROMPT" --output-format text > "tests/reports/${persona}-log.txt" 2>&1 &

  echo "  ↳ PID: $! — logging to tests/reports/${persona}-log.txt"
done

echo ""
echo "All 5 playtests launched in parallel."
echo "Monitor with: tail -f tests/reports/*-log.txt"
echo "Wait for all with: wait"
wait
echo ""
echo "All playtests complete. Reports in tests/reports/"
