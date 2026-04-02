/**
 * UPG Benchmarks — Product management wisdom as structured data.
 *
 * Encodes expected entity counts, relationships, ratios, and domain activation
 * thresholds per product stage. Used by /upg-intel, /upg-gaps, and the
 * proactive intelligence layer in /upg-context.
 *
 * Sources: Lean Startup (Ries), JTBD (Christensen), Continuous Discovery (Torres),
 * BMC (Osterwalder), Shape Up (Basecamp), Lean Analytics (Croll & Yoskovitz),
 * Inspired (Cagan), Crossing the Chasm (Moore), The Mom Test (Fitzpatrick)
 */
/** Ordered stages from earliest to latest */
export const PRODUCT_STAGES = ['idea', 'mvp', 'growth', 'scale'];
// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════
// ── Count Benchmarks ─────────────────────────────────────────────────────────
export const COUNT_BENCHMARKS = [
    // ── Strategic ──────────────────────────────────────────────────────────────
    {
        type: 'product',
        domain: 'strategic',
        idea: { min: 1, max: 1 },
        mvp: { min: 1, max: 1 },
        growth: { min: 1, max: 1 },
        scale: { min: 1, max: 3 },
        source: 'Fundamental',
        rationale: 'Every graph needs exactly one product (or one per product area at scale).',
    },
    {
        type: 'outcome',
        domain: 'strategic',
        idea: { min: 1, max: 3 },
        mvp: { min: 2, max: 5 },
        growth: { min: 3, max: 8 },
        scale: { min: 5, max: 15 },
        source: 'OKR (Doerr)',
        rationale: 'Outcomes are the "why" behind everything. Too few = unclear direction. Too many = diluted focus.',
    },
    {
        type: 'objective',
        domain: 'strategic',
        idea: null,
        mvp: { min: 1, max: 3 },
        growth: { min: 2, max: 5 },
        scale: { min: 3, max: 10 },
        source: 'OKR (Doerr)',
        rationale: 'Objectives give teams direction. Not needed at idea stage — outcomes suffice.',
    },
    {
        type: 'key_result',
        domain: 'strategic',
        idea: null,
        mvp: { min: 2, max: 6 },
        growth: { min: 4, max: 15 },
        scale: { min: 8, max: 30 },
        source: 'OKR (Doerr)',
        rationale: '2-4 key results per objective is the sweet spot.',
    },
    {
        type: 'kpi',
        domain: 'strategic',
        idea: null,
        mvp: { min: 2, max: 5 },
        growth: { min: 5, max: 15 },
        scale: { min: 10, max: 30 },
        source: 'Lean Analytics (Croll)',
        rationale: 'Track what matters. At MVP, focus on 1 metric that matters (OMTM).',
    },
    {
        type: 'vision',
        domain: 'strategic',
        idea: { min: 1, max: 1 },
        mvp: { min: 1, max: 1 },
        growth: { min: 1, max: 1 },
        scale: { min: 1, max: 1 },
        source: 'Inspired (Cagan)',
        rationale: 'One vision. Clear and unchanging (the mission may evolve, the vision stays).',
    },
    {
        type: 'mission',
        domain: 'strategic',
        idea: { min: 0, max: 1 },
        mvp: { min: 1, max: 1 },
        growth: { min: 1, max: 1 },
        scale: { min: 1, max: 1 },
        source: 'Inspired (Cagan)',
        rationale: 'Mission articulates how you pursue the vision.',
    },
    {
        type: 'strategic_theme',
        domain: 'strategic',
        idea: null,
        mvp: null,
        growth: { min: 2, max: 5 },
        scale: { min: 3, max: 8 },
        source: 'Cascading strategy',
        rationale: 'Themes organize initiatives. Premature before growth stage.',
    },
    {
        type: 'initiative',
        domain: 'strategic',
        idea: null,
        mvp: { min: 1, max: 3 },
        growth: { min: 3, max: 10 },
        scale: { min: 5, max: 20 },
        source: 'SAFe / Teresa Torres',
        rationale: 'Initiatives are the big bets. 1-3 at MVP keeps focus.',
    },
    {
        type: 'assumption',
        domain: 'strategic',
        idea: { min: 3, max: 10 },
        mvp: { min: 5, max: 15 },
        growth: { min: 3, max: 10 },
        scale: { min: 2, max: 5 },
        source: 'Lean Startup (Ries)',
        rationale: 'Early stage should have MORE assumptions — they decrease as you validate.',
    },
    {
        type: 'decision',
        domain: 'strategic',
        idea: { min: 0, max: 3 },
        mvp: { min: 2, max: 10 },
        growth: { min: 5, max: 20 },
        scale: { min: 10, max: 50 },
        source: 'ADR pattern',
        rationale: 'Decisions accumulate. Recording them creates institutional memory.',
    },
    // ── User ───────────────────────────────────────────────────────────────────
    {
        type: 'persona',
        domain: 'user',
        idea: { min: 1, max: 3 },
        mvp: { min: 2, max: 4 },
        growth: { min: 3, max: 6 },
        scale: { min: 4, max: 10 },
        source: 'Crossing the Chasm (Moore)',
        rationale: 'Start narrow (1 beachhead persona). Expand as you find fit.',
    },
    {
        type: 'jtbd',
        domain: 'user',
        idea: { min: 2, max: 6 },
        mvp: { min: 4, max: 12 },
        growth: { min: 8, max: 25 },
        scale: { min: 15, max: 50 },
        source: 'JTBD (Christensen)',
        rationale: '2-4 JTBDs per persona. Jobs are the demand side — they drive everything.',
    },
    {
        type: 'pain_point',
        domain: 'user',
        idea: { min: 2, max: 8 },
        mvp: { min: 4, max: 15 },
        growth: { min: 8, max: 25 },
        scale: { min: 10, max: 40 },
        source: 'Design Thinking',
        rationale: 'Pain points surface opportunities. More pain = more signal.',
    },
    {
        type: 'need',
        domain: 'user',
        idea: { min: 1, max: 5 },
        mvp: { min: 3, max: 10 },
        growth: { min: 5, max: 20 },
        scale: { min: 8, max: 30 },
        source: 'UPG v0.2 (need replaces pain_point)',
        rationale: 'Needs have valence (pain, gap, desire, constraint). Richer than pain points alone.',
    },
    {
        type: 'desired_outcome',
        domain: 'user',
        idea: { min: 1, max: 4 },
        mvp: { min: 2, max: 8 },
        growth: { min: 4, max: 15 },
        scale: { min: 6, max: 25 },
        source: 'JTBD / ODI (Ulwick)',
        rationale: 'Desired outcomes are what users measure success by.',
    },
    // ── Discovery ──────────────────────────────────────────────────────────────
    {
        type: 'opportunity',
        domain: 'discovery',
        idea: { min: 1, max: 5 },
        mvp: { min: 3, max: 10 },
        growth: { min: 5, max: 20 },
        scale: { min: 8, max: 30 },
        source: 'OST (Torres)',
        rationale: 'Opportunities are the bridge between user needs and solutions. Core of continuous discovery.',
    },
    {
        type: 'solution',
        domain: 'discovery',
        idea: { min: 1, max: 3 },
        mvp: { min: 2, max: 8 },
        growth: { min: 5, max: 15 },
        scale: { min: 8, max: 25 },
        source: 'OST (Torres)',
        rationale: 'Multiple solutions per opportunity. Explore before committing.',
    },
    // ── Validation ─────────────────────────────────────────────────────────────
    {
        type: 'hypothesis',
        domain: 'validation',
        idea: { min: 2, max: 8 },
        mvp: { min: 4, max: 15 },
        growth: { min: 8, max: 25 },
        scale: { min: 5, max: 15 },
        source: 'Lean Startup (Ries)',
        rationale: 'Everything is a hypothesis until tested. More at early stages, fewer (but bigger) at scale.',
    },
    {
        type: 'experiment',
        domain: 'validation',
        idea: { min: 1, max: 5 },
        mvp: { min: 3, max: 10 },
        growth: { min: 5, max: 15 },
        scale: { min: 3, max: 10 },
        source: 'Lean Startup (Ries)',
        rationale: 'Each hypothesis needs an experiment. Speed of learning = speed of progress.',
    },
    {
        type: 'learning',
        domain: 'validation',
        idea: { min: 1, max: 5 },
        mvp: { min: 3, max: 10 },
        growth: { min: 8, max: 20 },
        scale: { min: 10, max: 30 },
        source: 'Lean Startup (Ries)',
        rationale: 'Learnings are the output of experiments. They should accumulate over time.',
    },
    // ── Market Intelligence ────────────────────────────────────────────────────
    {
        type: 'competitor',
        domain: 'market_intelligence',
        idea: { min: 2, max: 5 },
        mvp: { min: 3, max: 8 },
        growth: { min: 5, max: 12 },
        scale: { min: 5, max: 15 },
        source: 'Competitive analysis',
        rationale: 'Know your landscape. 2-5 direct competitors minimum.',
    },
    // ── UX Research ────────────────────────────────────────────────────────────
    {
        type: 'research_study',
        domain: 'ux_research',
        idea: { min: 0, max: 2 },
        mvp: { min: 1, max: 5 },
        growth: { min: 3, max: 10 },
        scale: { min: 5, max: 20 },
        source: 'The Mom Test (Fitzpatrick)',
        rationale: 'Talk to users. Even 5 interviews surface 80% of issues.',
    },
    {
        type: 'research_insight',
        domain: 'ux_research',
        idea: { min: 0, max: 5 },
        mvp: { min: 3, max: 15 },
        growth: { min: 10, max: 30 },
        scale: { min: 15, max: 50 },
        source: 'UX Research best practice',
        rationale: 'Insights are the refined output of research. They inform everything.',
    },
    // ── Design ─────────────────────────────────────────────────────────────────
    {
        type: 'user_journey',
        domain: 'design',
        idea: { min: 0, max: 1 },
        mvp: { min: 1, max: 3 },
        growth: { min: 2, max: 5 },
        scale: { min: 3, max: 10 },
        source: 'Service Design',
        rationale: 'Map the emotional experience. One per persona is ideal.',
    },
    {
        type: 'user_flow',
        domain: 'design',
        idea: null,
        mvp: { min: 1, max: 5 },
        growth: { min: 3, max: 15 },
        scale: { min: 10, max: 40 },
        source: 'IA best practice',
        rationale: 'Task-level paths through the product. Critical for UX quality.',
    },
    {
        type: 'screen',
        domain: 'design',
        idea: null,
        mvp: { min: 3, max: 15 },
        growth: { min: 10, max: 50 },
        scale: { min: 30, max: 200 },
        source: 'IA/UX',
        rationale: 'Every distinct UI surface. Grows with product complexity.',
    },
    {
        type: 'design_component',
        domain: 'design',
        idea: null,
        mvp: { min: 0, max: 10 },
        growth: { min: 10, max: 50 },
        scale: { min: 30, max: 200 },
        source: 'Atomic Design (Frost)',
        rationale: 'Design system components. Build a system, not one-offs.',
    },
    // ── Product Spec ───────────────────────────────────────────────────────────
    {
        type: 'feature',
        domain: 'product_spec',
        idea: { min: 1, max: 5 },
        mvp: { min: 3, max: 10 },
        growth: { min: 8, max: 30 },
        scale: { min: 20, max: 100 },
        source: 'Product management',
        rationale: 'Features are the user-facing capabilities. MVP = minimum set.',
    },
    {
        type: 'epic',
        domain: 'product_spec',
        idea: null,
        mvp: { min: 1, max: 5 },
        growth: { min: 3, max: 15 },
        scale: { min: 10, max: 40 },
        source: 'Agile',
        rationale: 'Epics group related stories. Not needed at idea stage.',
    },
    {
        type: 'user_story',
        domain: 'product_spec',
        idea: null,
        mvp: { min: 3, max: 15 },
        growth: { min: 10, max: 50 },
        scale: { min: 30, max: 200 },
        source: 'Agile',
        rationale: 'Stories are the unit of delivery. 3-5 per feature is typical.',
    },
    {
        type: 'release',
        domain: 'product_spec',
        idea: null,
        mvp: { min: 1, max: 2 },
        growth: { min: 2, max: 10 },
        scale: { min: 5, max: 25 },
        source: 'Release management',
        rationale: 'Ship frequently. Releases track what went out and when.',
    },
    // ── Engineering ────────────────────────────────────────────────────────────
    {
        type: 'bounded_context',
        domain: 'engineering',
        idea: null,
        mvp: { min: 1, max: 3 },
        growth: { min: 2, max: 6 },
        scale: { min: 4, max: 15 },
        source: 'DDD (Evans)',
        rationale: 'Bounded contexts define system boundaries. Start simple.',
    },
    {
        type: 'service',
        domain: 'engineering',
        idea: null,
        mvp: { min: 1, max: 3 },
        growth: { min: 2, max: 8 },
        scale: { min: 5, max: 25 },
        source: 'Microservices / modular monolith',
        rationale: 'Services are runtime components. Monolith first, split later.',
    },
    {
        type: 'architecture_decision',
        domain: 'engineering',
        idea: { min: 0, max: 2 },
        mvp: { min: 2, max: 8 },
        growth: { min: 5, max: 20 },
        scale: { min: 10, max: 50 },
        source: 'ADR (Nygard)',
        rationale: 'Document why you chose X over Y. Prevents relitigating decisions.',
    },
    {
        type: 'technical_debt_item',
        domain: 'engineering',
        idea: null,
        mvp: { min: 0, max: 5 },
        growth: { min: 3, max: 15 },
        scale: { min: 5, max: 30 },
        source: 'Engineering practice',
        rationale: 'Track debt explicitly. It compounds if invisible.',
    },
    // ── Growth ─────────────────────────────────────────────────────────────────
    {
        type: 'north_star_metric',
        domain: 'growth',
        idea: null,
        mvp: { min: 1, max: 1 },
        growth: { min: 1, max: 1 },
        scale: { min: 1, max: 2 },
        source: 'Lean Analytics (Croll)',
        rationale: 'One metric that matters. Maybe two at scale (leading + lagging).',
    },
    {
        type: 'funnel',
        domain: 'growth',
        idea: null,
        mvp: { min: 1, max: 2 },
        growth: { min: 1, max: 3 },
        scale: { min: 2, max: 5 },
        source: 'AARRR (McClure)',
        rationale: 'At least one acquisition funnel. Add retention/referral funnels at growth.',
    },
    {
        type: 'acquisition_channel',
        domain: 'growth',
        idea: { min: 1, max: 3 },
        mvp: { min: 1, max: 5 },
        growth: { min: 3, max: 8 },
        scale: { min: 5, max: 15 },
        source: 'Traction (Weinberg)',
        rationale: 'Start with 1-2 channels, expand as you find what works.',
    },
    // ── Business Model ─────────────────────────────────────────────────────────
    {
        type: 'business_model',
        domain: 'business_model',
        idea: { min: 0, max: 1 },
        mvp: { min: 1, max: 1 },
        growth: { min: 1, max: 2 },
        scale: { min: 1, max: 3 },
        source: 'BMC (Osterwalder)',
        rationale: 'One business model per product. Maybe 2 at scale (freemium + enterprise).',
    },
    {
        type: 'value_proposition',
        domain: 'business_model',
        idea: { min: 1, max: 2 },
        mvp: { min: 1, max: 3 },
        growth: { min: 2, max: 5 },
        scale: { min: 3, max: 8 },
        source: 'BMC (Osterwalder)',
        rationale: 'What unique value do you deliver? One per segment.',
    },
    {
        type: 'revenue_stream',
        domain: 'business_model',
        idea: { min: 0, max: 1 },
        mvp: { min: 1, max: 2 },
        growth: { min: 1, max: 3 },
        scale: { min: 2, max: 5 },
        source: 'BMC (Osterwalder)',
        rationale: 'How money comes in. At least one by MVP.',
    },
    {
        type: 'pricing_strategy',
        domain: 'pricing',
        idea: null,
        mvp: { min: 0, max: 1 },
        growth: { min: 1, max: 1 },
        scale: { min: 1, max: 2 },
        source: 'Pricing (Nagle)',
        rationale: 'Deliberate pricing. By growth stage this must be explicit.',
    },
    // ── Go-To-Market ───────────────────────────────────────────────────────────
    {
        type: 'positioning',
        domain: 'go_to_market',
        idea: { min: 0, max: 1 },
        mvp: { min: 1, max: 1 },
        growth: { min: 1, max: 2 },
        scale: { min: 1, max: 3 },
        source: 'Obviously Awesome (Dunford)',
        rationale: 'How are you different? One positioning statement minimum.',
    },
    {
        type: 'ideal_customer_profile',
        domain: 'go_to_market',
        idea: null,
        mvp: { min: 0, max: 1 },
        growth: { min: 1, max: 2 },
        scale: { min: 1, max: 3 },
        source: 'GTM strategy',
        rationale: 'Who are you selling to? Tighter ICP = better conversion.',
    },
    {
        type: 'messaging',
        domain: 'go_to_market',
        idea: null,
        mvp: { min: 0, max: 1 },
        growth: { min: 1, max: 3 },
        scale: { min: 2, max: 5 },
        source: 'StoryBrand (Miller)',
        rationale: 'How you talk about your product. Persona-specific messaging at scale.',
    },
    {
        type: 'content_strategy',
        domain: 'content',
        idea: null,
        mvp: null,
        growth: { min: 1, max: 1 },
        scale: { min: 1, max: 2 },
        source: 'Content marketing',
        rationale: 'Systematic content by growth stage. Premature before product-market fit.',
    },
    // ── Feedback ───────────────────────────────────────────────────────────────
    {
        type: 'feature_request',
        domain: 'feedback_voc',
        idea: null,
        mvp: { min: 0, max: 10 },
        growth: { min: 5, max: 30 },
        scale: { min: 10, max: 100 },
        source: 'Voice of Customer',
        rationale: 'Feature requests signal demand. Track them to spot patterns.',
    },
];
// ── Relationship Benchmarks ──────────────────────────────────────────────────
export const RELATIONSHIP_BENCHMARKS = [
    // User domain
    {
        parent_type: 'persona',
        child_type: 'jtbd',
        min_per_parent: 2,
        stages: ['idea', 'mvp', 'growth', 'scale'],
        source: 'JTBD (Christensen)',
        rationale: 'Each persona should have at least 2 jobs. One job = shallow understanding.',
    },
    {
        parent_type: 'persona',
        child_type: 'pain_point',
        min_per_parent: 1,
        stages: ['idea', 'mvp', 'growth', 'scale'],
        source: 'Design Thinking',
        rationale: 'No pain = no urgency to switch. Every persona needs at least one pain point.',
    },
    {
        parent_type: 'persona',
        child_type: 'desired_outcome',
        min_per_parent: 1,
        stages: ['mvp', 'growth', 'scale'],
        source: 'ODI (Ulwick)',
        rationale: 'What does success look like for this persona?',
    },
    {
        parent_type: 'jtbd',
        child_type: 'pain_point',
        min_per_parent: 1,
        stages: ['idea', 'mvp', 'growth', 'scale'],
        source: 'JTBD framework',
        rationale: 'Every job has friction. Surface it.',
    },
    // Discovery
    {
        parent_type: 'opportunity',
        child_type: 'solution',
        min_per_parent: 1,
        stages: ['idea', 'mvp', 'growth', 'scale'],
        source: 'OST (Torres)',
        rationale: 'Every opportunity needs at least one solution explored.',
    },
    {
        parent_type: 'pain_point',
        child_type: 'opportunity',
        min_per_parent: 0,
        stages: ['mvp', 'growth', 'scale'],
        source: 'OST (Torres)',
        rationale: 'Pain should surface opportunities. 0 is the minimum — but flag if many pains have no opportunities.',
    },
    // Validation
    {
        parent_type: 'solution',
        child_type: 'hypothesis',
        min_per_parent: 1,
        stages: ['idea', 'mvp', 'growth', 'scale'],
        source: 'Lean Startup (Ries)',
        rationale: 'Every solution is a bet. Make the bet explicit.',
    },
    {
        parent_type: 'hypothesis',
        child_type: 'experiment',
        min_per_parent: 1,
        stages: ['mvp', 'growth', 'scale'],
        source: 'Lean Startup (Ries)',
        rationale: 'Test your bets. No experiment = no learning.',
    },
    // Product Spec
    {
        parent_type: 'feature',
        child_type: 'user_story',
        min_per_parent: 1,
        stages: ['mvp', 'growth', 'scale'],
        source: 'Agile',
        rationale: 'Features should be broken into stories for delivery.',
    },
    {
        parent_type: 'feature',
        child_type: 'epic',
        min_per_parent: 0,
        stages: ['growth', 'scale'],
        source: 'Agile',
        rationale: 'Large features become epics at scale.',
    },
    // Engineering
    {
        parent_type: 'bounded_context',
        child_type: 'service',
        min_per_parent: 1,
        stages: ['mvp', 'growth', 'scale'],
        source: 'DDD (Evans)',
        rationale: 'Each bounded context should have at least one service.',
    },
    // Growth
    {
        parent_type: 'funnel',
        child_type: 'funnel_step',
        min_per_parent: 3,
        stages: ['mvp', 'growth', 'scale'],
        source: 'AARRR (McClure)',
        rationale: 'A funnel needs at least 3 steps to be meaningful.',
    },
    // Business Model
    {
        parent_type: 'business_model',
        child_type: 'value_proposition',
        min_per_parent: 1,
        stages: ['mvp', 'growth', 'scale'],
        source: 'BMC (Osterwalder)',
        rationale: 'No value prop = no business model.',
    },
    {
        parent_type: 'business_model',
        child_type: 'revenue_stream',
        min_per_parent: 1,
        stages: ['mvp', 'growth', 'scale'],
        source: 'BMC (Osterwalder)',
        rationale: 'How does money come in? Must be explicit.',
    },
    // Cross-domain (the most important ones)
    {
        parent_type: 'feature',
        child_type: 'persona',
        min_per_parent: 1,
        stages: ['mvp', 'growth', 'scale'],
        source: 'Inspired (Cagan)',
        rationale: 'Every feature should serve at least one persona. Otherwise: who is this for?',
    },
    {
        parent_type: 'persona',
        child_type: 'research_study',
        min_per_parent: 0,
        stages: ['mvp', 'growth', 'scale'],
        source: 'The Mom Test (Fitzpatrick)',
        rationale: 'Personas without research are fiction. Flag but do not block.',
    },
    {
        parent_type: 'outcome',
        child_type: 'kpi',
        min_per_parent: 1,
        stages: ['mvp', 'growth', 'scale'],
        source: 'OKR (Doerr)',
        rationale: 'Every outcome needs a measurable indicator.',
    },
];
// ── Ratio Benchmarks ─────────────────────────────────────────────────────────
export const RATIO_BENCHMARKS = [
    {
        name: 'Hypothesis-to-Learning ratio',
        numerator_type: 'learning',
        denominator_type: 'hypothesis',
        expected_min: 1.0,
        stages: ['mvp', 'growth', 'scale'],
        source: 'Lean Startup (Ries)',
        rationale: 'Each hypothesis should produce at least one learning. If ratio <1, you have untested assumptions.',
    },
    {
        name: 'Evidence density',
        numerator_type: ['learning', 'research_insight'],
        denominator_type: 'hypothesis',
        expected_min: 0.5,
        stages: ['mvp', 'growth', 'scale'],
        source: 'Discovery best practice',
        rationale: 'Decisions should be backed by evidence, not intuition.',
    },
    {
        name: 'Experiment rate',
        numerator_type: 'experiment',
        denominator_type: 'hypothesis',
        expected_min: 0.8,
        stages: ['mvp', 'growth', 'scale'],
        source: 'Lean Startup',
        rationale: 'Most hypotheses should have experiments. 80%+ means you test your bets.',
    },
    {
        name: 'Solution breadth',
        numerator_type: 'solution',
        denominator_type: 'opportunity',
        expected_min: 1.5,
        stages: ['idea', 'mvp', 'growth', 'scale'],
        source: 'OST (Torres)',
        rationale: 'Explore multiple solutions per opportunity. 1:1 means you jumped to the first idea.',
    },
    {
        name: 'Story coverage',
        numerator_type: 'user_story',
        denominator_type: 'feature',
        expected_min: 2.0,
        stages: ['mvp', 'growth', 'scale'],
        source: 'Agile',
        rationale: 'Features need decomposition. 2+ stories per feature means proper breakdown.',
    },
    {
        name: 'Research throughput',
        numerator_type: 'research_insight',
        denominator_type: 'research_study',
        expected_min: 3.0,
        stages: ['mvp', 'growth', 'scale'],
        source: 'UX Research',
        rationale: 'Each study should yield 3+ insights. Less means shallow research or poor synthesis.',
    },
    {
        name: 'Pain-to-opportunity conversion',
        numerator_type: 'opportunity',
        denominator_type: 'pain_point',
        expected_min: 0.3,
        stages: ['mvp', 'growth', 'scale'],
        source: 'OST',
        rationale: 'At least 30% of pain points should surface opportunities. Lower = pain is documented but not acted on.',
    },
    {
        name: 'Feature-to-persona ratio',
        numerator_type: 'feature',
        denominator_type: 'persona',
        expected_min: 2.0,
        stages: ['mvp', 'growth', 'scale'],
        source: 'Product management',
        rationale: 'Each persona should drive at least 2 features. Less = underserved personas.',
    },
    {
        name: 'Decision documentation rate',
        numerator_type: 'decision',
        denominator_type: 'initiative',
        expected_min: 1.0,
        stages: ['growth', 'scale'],
        source: 'ADR (Nygard)',
        rationale: 'Each initiative should have at least one documented decision.',
    },
    {
        name: 'Tech debt visibility',
        numerator_type: 'technical_debt_item',
        denominator_type: 'service',
        expected_min: 0.5,
        stages: ['growth', 'scale'],
        source: 'Engineering practice',
        rationale: 'If you have services but zero documented debt, debt is invisible — not absent.',
    },
];
// ── Domain Activation ────────────────────────────────────────────────────────
export const DOMAIN_ACTIVATION = [
    // Must-have from the start
    {
        domain_id: 'strategic',
        expected_from: 'idea',
        expected_mature: 'growth',
        source: 'Fundamental',
        rationale: 'Product identity is step zero.',
    },
    {
        domain_id: 'user',
        expected_from: 'idea',
        expected_mature: 'mvp',
        source: 'JTBD / Design Thinking',
        rationale: 'Understanding users is foundational. Cannot be deferred.',
    },
    // Expected by MVP
    {
        domain_id: 'discovery',
        expected_from: 'idea',
        expected_mature: 'mvp',
        source: 'OST (Torres)',
        rationale: 'Opportunities should be identified before building.',
    },
    {
        domain_id: 'validation',
        expected_from: 'idea',
        expected_mature: 'mvp',
        source: 'Lean Startup (Ries)',
        rationale: 'Test assumptions before investing in features.',
    },
    {
        domain_id: 'product_spec',
        expected_from: 'mvp',
        expected_mature: 'growth',
        source: 'Agile',
        rationale: 'Feature specs emerge when building starts.',
    },
    {
        domain_id: 'market_intelligence',
        expected_from: 'idea',
        expected_mature: 'growth',
        source: 'Competitive strategy',
        rationale: 'Know your landscape early. Deepen as you grow.',
    },
    // Expected by Growth
    {
        domain_id: 'business_model',
        expected_from: 'mvp',
        expected_mature: 'growth',
        source: 'BMC (Osterwalder)',
        rationale: 'Revenue model must be clear before scaling.',
    },
    {
        domain_id: 'growth',
        expected_from: 'mvp',
        expected_mature: 'growth',
        source: 'Lean Analytics (Croll)',
        rationale: 'Growth metrics and funnels enable scaling decisions.',
    },
    {
        domain_id: 'go_to_market',
        expected_from: 'mvp',
        expected_mature: 'growth',
        source: 'GTM strategy',
        rationale: 'How you reach customers. Must be systematic by growth.',
    },
    {
        domain_id: 'ux_research',
        expected_from: 'mvp',
        expected_mature: 'growth',
        source: 'The Mom Test',
        rationale: 'Continuous research keeps you honest.',
    },
    {
        domain_id: 'design',
        expected_from: 'mvp',
        expected_mature: 'growth',
        source: 'Atomic Design',
        rationale: 'Design system and IA emerge as product matures.',
    },
    {
        domain_id: 'engineering',
        expected_from: 'mvp',
        expected_mature: 'growth',
        source: 'DDD (Evans)',
        rationale: 'Architecture becomes explicit as complexity grows.',
    },
    {
        domain_id: 'pricing',
        expected_from: 'mvp',
        expected_mature: 'growth',
        source: 'Pricing strategy',
        rationale: 'Deliberate pricing by growth stage.',
    },
    {
        domain_id: 'content',
        expected_from: 'growth',
        expected_mature: 'scale',
        source: 'Content marketing',
        rationale: 'Systematic content after product-market fit.',
    },
    {
        domain_id: 'feedback_voc',
        expected_from: 'mvp',
        expected_mature: 'growth',
        source: 'Voice of Customer',
        rationale: 'Listen to users once you have them.',
    },
    // Expected by Scale
    {
        domain_id: 'team_org',
        expected_from: 'growth',
        expected_mature: 'scale',
        source: 'Team Topologies',
        rationale: 'Org structure matters when the team grows.',
    },
    {
        domain_id: 'data_analytics',
        expected_from: 'growth',
        expected_mature: 'scale',
        source: 'Data-driven culture',
        rationale: 'Data infrastructure for decision-making at scale.',
    },
    {
        domain_id: 'legal_compliance',
        expected_from: 'growth',
        expected_mature: 'scale',
        source: 'Regulatory',
        rationale: 'Compliance becomes critical as you scale and attract scrutiny.',
    },
    {
        domain_id: 'devops',
        expected_from: 'growth',
        expected_mature: 'scale',
        source: 'SRE (Google)',
        rationale: 'Reliability engineering for production systems.',
    },
    {
        domain_id: 'security',
        expected_from: 'growth',
        expected_mature: 'scale',
        source: 'Security best practice',
        rationale: 'Security posture must formalize as the product handles real user data.',
    },
    {
        domain_id: 'qa_testing',
        expected_from: 'mvp',
        expected_mature: 'scale',
        source: 'QA',
        rationale: 'Testing discipline scales with the codebase.',
    },
    {
        domain_id: 'accessibility',
        expected_from: 'growth',
        expected_mature: 'scale',
        source: 'WCAG',
        rationale: 'Accessibility should be considered early but formalized at growth.',
    },
    {
        domain_id: 'ai_ml',
        expected_from: 'mvp',
        expected_mature: 'scale',
        source: 'AI Ops',
        rationale: 'Only if the product uses AI. Track models, costs, and quality.',
    },
    {
        domain_id: 'agentic',
        expected_from: 'growth',
        expected_mature: 'scale',
        source: 'Automation',
        rationale: 'Workflow automation at scale.',
    },
    {
        domain_id: 'portfolio',
        expected_from: 'scale',
        expected_mature: 'scale',
        source: 'Portfolio management',
        rationale: 'Multi-product management. Only relevant at scale.',
    },
];
// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════
/** Get count benchmarks for a given stage */
export function getBenchmarksForStage(stage) {
    return COUNT_BENCHMARKS.filter((b) => b[stage] !== null);
}
/** Get relationship benchmarks applicable at a given stage */
export function getRelationshipBenchmarksForStage(stage) {
    return RELATIONSHIP_BENCHMARKS.filter((b) => b.stages.includes(stage));
}
/** Get ratio benchmarks applicable at a given stage */
export function getRatioBenchmarksForStage(stage) {
    return RATIO_BENCHMARKS.filter((b) => b.stages.includes(stage));
}
/** Get domains expected to be activated at a given stage */
export function getExpectedDomainsForStage(stage) {
    const stageIdx = PRODUCT_STAGES.indexOf(stage);
    return DOMAIN_ACTIVATION.filter((d) => PRODUCT_STAGES.indexOf(d.expected_from) <= stageIdx);
}
/**
 * Score a graph against benchmarks — returns 0-100.
 *
 * Scores each entity type's count against the expected range for the given stage.
 * Within range = full credit. Over range = half credit (over is better than under).
 * Under range or missing = zero credit.
 */
export function computeBenchmarkScore(stage, entityCounts, _relationshipCounts) {
    const benchmarks = getBenchmarksForStage(stage);
    let passed = 0;
    let total = 0;
    for (const b of benchmarks) {
        const range = b[stage];
        if (!range)
            continue;
        total++;
        const count = entityCounts[b.type] ?? 0;
        if (count >= range.min && count <= range.max) {
            passed++;
        }
        else if (count > range.max) {
            passed += 0.5; // over is better than under
        }
    }
    return total > 0 ? Math.round((passed / total) * 100) : 0;
}
//# sourceMappingURL=benchmarks.js.map