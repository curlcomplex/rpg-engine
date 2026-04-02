```
  · ·
   ◉
  · ·
```

# Unified Product Graph — CLI Skills

> Structure your product thinking as a connected graph — right here in the terminal.

The Unified Product Graph (UPG) turns scattered product thinking into a structured, connected knowledge graph. It lives as a `.upg` file in your repo — portable, diffable, and version-controlled alongside your code. 28 slash commands guide you from "I have an idea" to a complete product strategy in about an hour.

## Quick Start

```bash
# Install skills into your project
bash packages/upg-mcp-server/scripts/install-skills.sh

# See the welcome screen
/upg

# Bootstrap a new product graph (~5 min guided setup)
/upg-init

# See your graph as a tree
/upg-tree
```

After `/upg-init`, you'll have a product entity, your first persona, an outcome, a KPI, and a hypothesis — all connected. Run `/upg-journey` to see what to build next.

## Skills (28)

### Entry & Navigation

| Command | What it does |
|---------|-------------|
| `/upg` | Welcome screen — graph status + all available commands |
| `/upg-journey` | Guided 7-phase product journey with progress tracking |
| `/upg-context` | Design system reference (emoji mappings, formatting rules) |

### Core Operations

| Command | What it does |
|---------|-------------|
| `/upg-init` | Bootstrap a new product graph — collaborative, ~5 min |
| `/upg-create` | Create any entity (90+ types across 32 domains) |
| `/upg-connect` | Create edges between entities |
| `/upg-capture` | Capture session work into the graph at natural checkpoints |

### Discovery & Validation

| Command | What it does |
|---------|-------------|
| `/upg-persona` | Build personas with JTBDs and pain points |
| `/upg-discover` | Opportunity Solution Tree — outcome → opportunity → solution |
| `/upg-hypothesis` | Structure and test your riskiest bets |
| `/upg-research` | Research studies → insights → opportunities |
| `/upg-compete` | Competitive analysis with positioning |

### Strategy & Business

| Command | What it does |
|---------|-------------|
| `/upg-strategy` | Vision → mission → strategic themes → outcomes |
| `/upg-okr` | Objectives → key results → initiatives |
| `/upg-model` | Business model, value prop, revenue, pricing |
| `/upg-market` | Market sizing, segments, beachhead strategy |

### Go-to-Market & Execution

| Command | What it does |
|---------|-------------|
| `/upg-launch` | Positioning, messaging, channels, launch plan |
| `/upg-plan` | Feature → epic → user story breakdown |
| `/upg-release` | Release planning and status tracking |

### Analytics & Health

| Command | What it does |
|---------|-------------|
| `/upg-status` | Health dashboard with maturity scoring |
| `/upg-gaps` | Gap analysis across 8 business areas |
| `/upg-retro` | Retrospectives → learnings |
| `/upg-tree` | View graph through framework lenses |

### Version Control & Sync

| Command | What it does |
|---------|-------------|
| `/upg-diff` | What changed since last commit |
| `/upg-export` | Markdown snapshot for sharing |
| `/upg-push` | Sync local graph to The Product Creator cloud |
| `/upg-pull` | Pull cloud changes back to local |

### Internal

| Command | What it does |
|---------|-------------|
| `/upg-design-system` | Design system guidelines for skill authors |

## The Journey

Seven phases take you from "I have an idea" to a complete, structured product:

| Phase | Question | Time | Key Skills |
|-------|----------|------|-----------|
| 1. Identity | What is this? | ~10 min | `/upg-init`, `/upg-strategy` |
| 2. Understanding | Who needs this? | ~15 min | `/upg-persona`, `/upg-research` |
| 3. Discovery | What should I build? | ~15 min | `/upg-discover`, `/upg-hypothesis`, `/upg-compete` |
| 4. Business | How is this a business? | ~15 min | `/upg-model`, `/upg-market`, `/upg-okr` |
| 5. Reaching | How do people find this? | ~10 min | `/upg-launch` |
| 6. Building | Ship it | ongoing | `/upg-plan`, `/upg-release`, `/upg-capture` |
| 7. Learning | Is it working? | ongoing | `/upg-retro`, `/upg-gaps`, `/upg-status` |

Run `/upg-journey` at any time to see where you stand and what to work on next.

## The `.upg` File

Your product graph lives in a single `.upg` file at your repo root. It's JSON, human-readable, and git-friendly:

- **Portable** — copy it anywhere, it just works
- **Diffable** — `git diff` shows exactly what changed in your product thinking
- **Version-controlled** — your strategy evolves alongside your code
- **Open format** — no vendor lock-in, no cloud dependency

## Cross-IDE Compatibility

Full experience in Claude Code. Works in any MCP-compatible IDE.

The install script supports six AI coding tools: **Claude Code**, **Cursor**, **Codex CLI**, **Gemini CLI**, **OpenCode**, and **Kiro**. The skill files are identical markdown — they install to each IDE's skill directory.

The UPG MCP server provides `create_node`, `search_nodes`, `get_product_context`, and other tools accessible from any MCP-compatible client. The `/slash-command` syntax is Claude Code specific, but the underlying frameworks, interaction patterns, and product thinking guidance work in any IDE that reads markdown skill files.

```bash
# Install for multiple IDEs
bash install-skills.sh --target=claude,cursor

# Or choose interactively
bash install-skills.sh
```

## The Product Creator

The CLI is where the thinking happens. [The Product Creator](https://graph.theproductcreator.com) is where you see it — an interactive visual canvas that renders your graph as explorable maps, trees, and frameworks.

Run `/upg-push` to sync your local graph to the cloud. Run `/upg-pull` to bring cloud changes back. Work in the terminal, present on the canvas.

## Learn More

- **Spec & format:** [unifiedproductgraph.org](https://unifiedproductgraph.org)
- **Visual tool:** [graph.theproductcreator.com](https://graph.theproductcreator.com)

## License

MIT
