# Feature Landscape

**Domain:** AI-narrated text RPG web application (chat interface + persistent graph world)
**Researched:** 2026-04-03
**Competitors analyzed:** AI Dungeon, NovelAI, Character.AI, Friends & Fables, RPGGO, Deep Realms, DreamGen, Jenova, Feelin
**Confidence:** HIGH (multiple sources cross-referenced; competitive landscape is well-documented)

---

## Table Stakes

Features users expect from an AI RPG chat app. Missing any of these and the product feels broken or amateur.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Streaming narration** | Token-by-token rendering is the 2026 baseline for all AI chat. Waiting for complete responses feels broken. | Medium | SSE is planned. Must handle markdown mid-stream, graceful error states, and stop button. |
| **Dark mode / RPG-appropriate theme** | Every competitor uses dark themes. Bright white UI kills immersion for a fantasy text RPG. RPG players expect atmospheric presentation. | Low | Dark grey (#121212) backgrounds, not pure black. High-contrast text (#E0E0E0). Ship dark-only for MVP -- no toggle needed for 10 engineers. |
| **Message differentiation** | Players need to instantly distinguish their input from narrator output. AI Dungeon, NovelAI, Character.AI all do this. | Low | Different styling for player messages vs narrator responses. Subtle, not garish. |
| **Auto-save** | Every competitor auto-saves. Losing progress to a browser crash is unacceptable. | Low | Already planned (atomic writes after each turn). Non-negotiable. |
| **Session persistence / resume** | Core value prop: "come back tomorrow, world remembers." AI Dungeon, Jenova, Friends & Fables all support this. Feelin won "best memory" comparisons specifically for this. | Medium | Graph IS the memory. "Previously on..." recap from graph state is the implementation. This is where the RPG Engine is already ahead of competitors. |
| **Multiple campaigns / worlds** | AI Dungeon supports multiple adventures. Friends & Fables supports multiple campaigns. Users expect to run more than one story. | Low | World picker screen. Already in the design spec. |
| **Typing / loading indicator** | Users assume the system crashed without one. Every AI chat app shows "AI is thinking..." or similar. | Low | Show indicator during Claude API call + tool execution. Animate during streaming. |
| **Input affordances** | Text area that auto-resizes, Enter to send, Shift+Enter for newline. Standard chat UX. | Low | Match ChatGPT/Claude.ai conventions. Users will have muscle memory. |
| **Error recovery** | When API calls fail, stream breaks, or key is invalid -- clear error messages with retry option. Preserve user input on failure. | Low | Never clear the input field on error. Show what went wrong and what to do. |
| **Regenerate / retry last response** | AI Dungeon has this (regenerate button + Ctrl+Z). ChatGPT has this. Character.AI has this. Users expect to "reroll" a bad response. | Medium | Store conversation state to allow re-requesting the last turn. In RPG context, this is "the DM re-narrates." |
| **API key entry + validation** | BYO-key pattern requires clear key entry, instant validation (test API call), and confirmation. | Low | Settings page. Test key on entry. Show clear success/failure. |
| **Invite-code gated signup** | Auth is table stakes for any multi-user app. Invite codes are the simplest mechanism for a closed playtest. | Low | Already designed. Keep it dead simple. |

## Differentiators

Features that set this product apart from AI Dungeon, NovelAI, Character.AI, and other competitors. These are not expected but create the "wow" moments.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Game state sidebar (live)** | No major competitor shows structured, real-time game state alongside chat. AI Dungeon explicitly does NOT have inventory/stats UI. Friends & Fables is the only one with a similar sidebar, but it is D&D 5e-specific. This is a massive differentiator. | Medium | Sidebar renders `get_scene_context()` output: character stats, inventory, location, NPCs present, objectives, tension meter. Refreshed after every turn. Read-only, tamper-resistant, always accurate. |
| **NPC knowledge isolation** | Competitors treat NPC knowledge as vibes. AI Dungeon NPCs "forget" or share info they shouldn't. The graph-enforced KNOWS/SUSPECTS edges with `do_not_reference` lists are technically unprecedented in consumer AI RPGs. | Already built | The engine already does this. The web app just needs to not break it. This is a key talking point for the playtest audience (engineers who will appreciate the technical rigor). |
| **Graph-backed world persistence** | Competitors use unstructured text (AI Dungeon), lorebooks (NovelAI), or summarization (Character.AI). Friends & Fables uses a structured DB but is locked to D&D 5e. A typed node/edge graph that persists everything with causal chains is architecturally superior. | Already built | This is the core engine. The web app surfaces it. The "Previously on..." recap is generated FROM the graph, not from chat history summarization. |
| **Dice mechanics with 5-tier outcomes** | AI Dungeon has no mechanics. NovelAI has no mechanics. Character.AI has no mechanics. Deep Realms has basic HP/EXP. Friends & Fables has D&D 5e rules. A custom d20 system with triumph/success/mixed/failure/catastrophe tiers and failure-to-choice pattern is unique. | Already built | Render dice results distinctly in chat. The mechanical outcomes create real stakes that pure narrative AI RPGs lack. |
| **Diegetic onboarding (fugue state)** | Every competitor starts with menus: pick genre, pick class, pick setting. The fugue state onboarding where the world discovers itself through play is a radical differentiator. No fourth wall breaks. | Medium | Port from slash command to server-side system prompt. The onboarding IS the first play session. |
| **Drama manager** | No consumer competitor has a drama manager that tracks narrative health, NPC agendas, and available storylets. This creates paced, structured stories vs. the random meandering of AI Dungeon. | Already built | `check_narrative_health`, `get_npc_agendas`, `get_available_storylets` already exist. Claude uses them to pace the story. |
| **THEREFORE/BUT causal chains** | Competitors generate "and then" narratives. The enforced causal chain (therefore = consequence, but = complication) creates story structure that feels authored, not random. | Already built | `log_event` with causal enforcement. This is what made the 20-year DM say it was the best RPG experience he'd had. |
| **"Previously on..." session recap** | Competitors either lose context between sessions or require users to manually recap. Graph-generated narrative summaries that catch the player up are a delight feature. | Medium | Generate from recent EVENT nodes in the graph. Not summarizing chat -- summarizing what actually happened in the world. Fundamentally more reliable than chat-history summarization. |
| **Tension meter** | Visual indicator (0-10) computed from threats, opinions, blocks in the graph. No competitor shows narrative tension as a quantified, visible metric. | Low | Render in sidebar. Computed from graph state, not AI hallucination. Players will watch it rise and feel dread. |
| **Clickable choice prompts** | When the failure-to-choice pattern fires, render the options as clickable buttons instead of requiring the player to type. Reduces friction at dramatic moments. | Low | Parse choice blocks from Claude's response. Render as styled buttons that submit the choice as a message. |

## Anti-Features

Features to explicitly NOT build. These are tempting but wrong for this product at this stage.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Multiplayer / co-op** | AI Dungeon tried this. It's a massive complexity multiplier (turn order, shared world state, conflict resolution, real-time sync). Friends & Fables does it but their entire architecture is built around it. For 10-user playtest, single-player is the right scope. | Single-player. Multiplayer is a future milestone after single-player is validated. |
| **Model switching (Haiku for cheap ops)** | Premature optimization. Don't know yet which operations are expensive or frequent. BYO-key means users eat their own costs anyway. Adding model routing adds complexity with no proven benefit. | Use Claude Sonnet for everything. Optimize from real usage data later. |
| **Character creation screen / menus** | Competitors do this and it's boring. The fugue state onboarding is a differentiator precisely because it avoids menus. A character creation screen would undermine the product's identity. | Diegetic onboarding. The world discovers the character. |
| **Content filters / safety guardrails UI** | Character.AI has extensive filters and it's their most-complained-about feature. For a closed playtest with 10 trusted engineers using their own API keys, content moderation UI is wasted effort. Anthropic's API already has safety built in. | Rely on Anthropic's built-in safety. Address if/when expanding beyond trusted playtest. |
| **User-facing lorebook / world info editor** | NovelAI's lorebook is powerful but complex. AI Dungeon's Story Cards require manual authoring. The graph engine automates world info management. Exposing raw graph editing to players breaks immersion and adds massive UI complexity. | The graph manages itself through gameplay. Players interact through the narrative, not through an editor. Advanced users can see the sidebar for state. |
| **Chat history search / full conversation log** | The graph IS the memory, not the chat. Searching old chat messages encourages the wrong mental model. Players should trust the "Previously on..." and the sidebar, not scroll through old conversations. | "Previously on..." recap + sidebar state. New session = fresh conversation, graph carries forward. |
| **Image generation** | NovelAI and Character.AI have this. It's expensive, slow, and tangential to the core experience of a text RPG with mechanical depth. The text IS the product. | Text only. Let the imagination do the rendering. If players want images, they can use separate tools. |
| **Voice input / output** | Character.AI has voice. It's a novelty, not core. Text input is faster, more precise, and matches the RPG/D&D tradition. | Text only. Voice is a future experiment, not MVP. |
| **Mobile-responsive design** | Audience is engineers on desktops/laptops. Mobile RPG play sessions are short and unsatisfying. The sidebar needs screen width. | Desktop-first. If someone plays on mobile, it works but isn't optimized. Don't spend time on responsive breakpoints. |
| **Admin dashboard / analytics** | 10 users. Check the server logs. An admin UI is wasted effort at this scale. | Server logs + direct file system access for admin tasks. |
| **NPC sub-agents** | Running separate AI instances per NPC sounds cool but is expensive, complex, and already unnecessary -- single Claude with tools impressed a 20-year DM. | Single Claude instance with tool_use. NPC differentiation comes from voice guides and knowledge isolation in the graph, not from separate model instances. |
| **Undo / full rollback** | AI Dungeon allows Ctrl+Z to roll back the story. This is tempting but undermines the core design: actions have consequences. If players can undo, the stakes collapse. Regenerate (re-narrate same outcome) is fine; undo (reverse what happened) is not. | Regenerate last response only (re-narrate). Do NOT allow rewinding the world state. The graph moves forward. |

## Feature Dependencies

```
Auth (invite codes, login) --> API Key Entry --> Chat Interface
                                                      |
                                                      v
Chat Interface --> Streaming Narration
              --> Message Differentiation
              --> Typing Indicator
              --> Error Recovery
              --> Input Affordances
              |
              v
Claude API Integration (tool_use) --> Game Engine (25 tools)
                                  --> Server-side System Prompt
                                  |
                                  v
                            Sidebar (get_scene_context)
                            Dice Roll Display
                            Choice Prompts (failure-to-choice)
                            Auto-save (after each turn)
                            |
                            v
                      Session Persistence --> "Previously on..." Recap
                      Multiple Worlds --> World Picker

Onboarding (fugue state) --> depends on: Chat Interface + Claude API Integration + Game Engine
                         --> must work before: Multiple Worlds (first world must be created)
```

**Critical path:** Auth --> API Key --> Chat + Streaming --> Claude API + Tools --> Sidebar + Persistence

**Independent of critical path (can be built in parallel):**
- Dark theme (CSS, no backend dependency)
- World picker UI (after persistence works)
- Tension meter (after sidebar works)

## MVP Recommendation

### Must Ship (Phase 1 of web MVP)

1. **Auth + API key entry** -- Gate to everything. Without this, nothing works.
2. **Chat interface with streaming** -- Core interaction surface. Dark theme. Message differentiation. Typing indicator. Error recovery.
3. **Claude API integration with tool_use** -- The 25 game tools as tool definitions. Server-side system prompt construction.
4. **Game state sidebar** -- THE differentiator. Live character stats, inventory, location, NPCs, objectives, tension.
5. **Auto-save + session persistence** -- Core value prop. Come back tomorrow, world remembers.
6. **Diegetic onboarding** -- First impression. The fugue state must work server-side.
7. **Regenerate last response** -- Safety valve for bad narration rolls. Low effort, high value.

### Should Ship (Phase 2, quick follow)

8. **"Previously on..." recap** -- Completes the session persistence story. Without it, returning players are disoriented.
9. **Multiple worlds + world picker** -- Players will want to try different genres/scenarios.
10. **Clickable choice prompts** -- Polish that reduces friction at dramatic moments.
11. **Dice roll visual treatment** -- Distinct rendering of mechanical outcomes in chat.

### Defer

- Tension meter visualization (nice but not blocking)
- Mobile responsiveness (audience is desktop)
- Any social/sharing features
- Analytics or admin tools

## Sources

- [AI Dungeon Features & Memory System](https://help.aidungeon.com/faq/the-memory-system) -- HIGH confidence
- [AI Dungeon Story Cards](https://help.aidungeon.com/faq/story-cards) -- HIGH confidence
- [AI Dungeon Alternatives Comparison 2026](https://exeleonmagazine.com/compare-ai-dungeon-alternatives-2026/) -- MEDIUM confidence
- [NovelAI Lorebook Documentation](https://docs.novelai.net/en/text/lorebook/) -- HIGH confidence
- [NovelAI Text Adventure Mode](https://docs.novelai.net/en/text/textadventure/) -- HIGH confidence
- [Character.AI Features 2026](https://autoppt.com/blog/character-ai-evolution-complete-guide/) -- MEDIUM confidence
- [Friends & Fables vs Competitors](https://fables.gg/blog/how-is-friends-and-fables-different-from-chatgpt-ai-dungeon-or-novelai) -- HIGH confidence
- [Friends & Fables Features](https://fables.gg/) -- HIGH confidence
- [RPGGO Technical Framework](https://blog.rpggo.ai/2025/02/21/technical-overview-rpggos-text-to-game-framework-for-ai-rpg/) -- MEDIUM confidence
- [AI Chat UI Best Practices 2026](https://thefrontkit.com/blogs/ai-chat-ui-best-practices) -- HIGH confidence
- [AI UI Patterns](https://www.patterns.dev/react/ai-ui-patterns/) -- HIGH confidence
- [Jenova AI RPG Storytelling](https://www.jenova.ai/en/resources/ai-rpg-storytelling) -- MEDIUM confidence
- [Feelin AI Dungeon Alternatives by Memory](https://feelin.ai/blog/home/deep-dive-audits-and-comparisons/ai-dungeon-alternatives) -- MEDIUM confidence
- [AI RPG Market Analysis](https://www.jenova.ai/en/resources/ai-rpg-roleplay) -- LOW confidence (single source, marketing content)
