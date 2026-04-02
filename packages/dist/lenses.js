/**
 * UPG Lenses — contextual projections of the product graph.
 *
 * A lens adapts the graph to a specific role, framework, or mode of thinking.
 * It combines vocabulary, visibility, workflow, and intelligence into one
 * coherent context.
 *
 * Four layers:
 * - Vocabulary  → which labels to use (maps to type-labels.ts framework_labels)
 * - Visibility  → which domains/types to show (maps to domains.ts)
 * - Workflow    → what sequence of steps this lens prescribes
 * - Intelligence → which benchmarks and nudges are relevant
 *
 * The .upg file format is lens-unaware. Lenses are a presentation concern,
 * applied on read, never on write. Canonical types are always used in storage.
 *
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
import { UPG_DOMAINS } from './domains.js';
// ─── The 8 Lenses ────────────────────────────────────────────────────────────────
export const UPG_LENSES = [
    // ═══════════════════════════════════════════════════════════════════════════════
    // 1. PRODUCT LENS — the strategic command view
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: 'product',
        name: 'Product',
        description: 'Full graph, PM vocabulary, outcome-driven workflow',
        icon: 'target',
        framework_id: 'ost',
        label_overrides: {
            experiment: 'Experiment',
            learning: 'Validated Learning',
        },
        visible_domains: [], // all domains visible
        workflow_steps: [
            {
                name: 'Outcomes',
                description: 'Define what success looks like — the measurable results you are driving toward',
                entity_types: ['product', 'outcome', 'objective', 'key_result', 'metric'],
                suggested_skill: '/upg-add outcome',
            },
            {
                name: 'Personas',
                description: 'Understand who you are building for — their jobs, needs, and pain points',
                entity_types: ['persona', 'jtbd', 'need', 'desired_outcome'],
                suggested_skill: '/upg-add persona',
            },
            {
                name: 'Opportunities',
                description: 'Identify the highest-leverage opportunities that connect user needs to outcomes',
                entity_types: ['opportunity', 'insight'],
                suggested_skill: '/upg-add opportunity',
            },
            {
                name: 'Solutions',
                description: 'Propose solutions for the top opportunities — ideas, not commitments',
                entity_types: ['solution', 'design_concept'],
                suggested_skill: '/upg-add solution',
            },
            {
                name: 'Hypotheses',
                description: 'Turn solutions into testable bets — what must be true for this to work?',
                entity_types: ['hypothesis', 'assumption'],
                suggested_skill: '/upg-add hypothesis',
            },
            {
                name: 'Experiments',
                description: 'Design the cheapest test that could disprove your riskiest assumption',
                entity_types: ['experiment', 'evidence', 'learning'],
                suggested_skill: '/upg-add experiment',
            },
            {
                name: 'Features',
                description: 'Ship validated ideas as features — scope, spec, and release',
                entity_types: ['feature', 'epic', 'user_story', 'release'],
                suggested_skill: '/upg-add feature',
            },
            {
                name: 'Market',
                description: 'Know your landscape — competitors, trends, and positioning',
                entity_types: ['competitor', 'competitor_feature', 'market_trend', 'market_segment'],
                suggested_skill: '/upg-add competitor',
            },
        ],
        benchmark_domains: [
            'strategic', 'user', 'discovery', 'validation',
            'market_intelligence', 'product_spec', 'growth',
        ],
        intelligence_prompts: [
            {
                condition: 'outcomes.length === 0',
                message: 'No outcomes defined yet. Start with what success looks like — what measurable result should this product drive?',
            },
            {
                condition: 'hypotheses.untested.length > 3',
                message: 'You have untested hypotheses stacking up. Pick the riskiest one and design an experiment before adding more.',
            },
            {
                condition: 'features.length > 0 && hypotheses.length === 0',
                message: 'Features without hypotheses means you are building on assumptions. What needs to be true for these features to matter?',
            },
            {
                condition: 'personas.length > 0 && opportunities.length === 0',
                message: 'You know who you are building for, but haven\'t identified opportunities yet. What are the biggest unmet needs?',
            },
            {
                condition: 'competitors.length === 0 && features.length > 3',
                message: 'You are building without competitive context. Who else solves this problem, and how is your approach different?',
            },
        ],
        audience: 'Product managers, founders making strategic decisions, and anyone thinking about what to build and why',
        perspective: 'Sees the product as a system of outcomes, opportunities, and validated bets. Outcome-driven, evidence-aware, strategically oriented.',
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // 2. DESIGN LENS — user-centric, journey-first
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: 'design',
        name: 'Design',
        description: 'User-centric view with design vocabulary, journey-first workflow',
        icon: 'pen-tool',
        framework_id: 'design_thinking',
        label_overrides: {
            need: 'Pain Point',
            insight: 'Finding',
            opportunity: 'Design Opportunity',
            solution: 'Design Concept',
            experiment: 'Usability Test',
            learning: 'Test Finding',
            feature: 'Feature',
        },
        visible_domains: [
            'design', 'user', 'ux_research', 'product_spec',
            'feedback_voc', 'accessibility', 'content',
        ],
        always_show_types: ['product', 'outcome'],
        always_hide_types: [
            'database_schema', 'queue_topic', 'build_artifact',
            'ci_pipeline', 'sli', 'slo', 'error_budget',
        ],
        workflow_steps: [
            {
                name: 'Research',
                description: 'Understand the problem space — observe real users, gather evidence',
                entity_types: ['research_study', 'participant', 'observation', 'quote', 'survey_response'],
                suggested_skill: '/upg-add research_study',
            },
            {
                name: 'Personas',
                description: 'Synthesize research into archetypes — who are you designing for?',
                entity_types: ['persona', 'jtbd', 'need', 'desired_outcome'],
                suggested_skill: '/upg-add persona',
            },
            {
                name: 'Journeys',
                description: 'Map how users move through the experience — where is the friction?',
                entity_types: ['user_journey', 'journey_step', 'user_flow', 'touchpoint'],
                suggested_skill: '/upg-add user_journey',
            },
            {
                name: 'Define',
                description: 'Frame the design challenge — How Might We questions, insights, opportunities',
                entity_types: ['how_might_we', 'insight', 'affinity_cluster', 'opportunity'],
                suggested_skill: '/upg-add how_might_we',
            },
            {
                name: 'Ideate',
                description: 'Generate solutions — concepts, screens, interaction ideas',
                entity_types: ['design_concept', 'solution', 'screen', 'screen_state'],
                suggested_skill: '/upg-add design_concept',
            },
            {
                name: 'Prototype',
                description: 'Build testable artifacts — wireframes, prototypes, interaction specs',
                entity_types: ['wireframe', 'prototype', 'interaction_spec', 'design_component'],
                suggested_skill: '/upg-add prototype',
            },
            {
                name: 'Test',
                description: 'Put prototypes in front of users — observe, learn, iterate',
                entity_types: ['experiment', 'learning', 'evidence', 'feedback_theme'],
                suggested_skill: '/upg-add experiment',
            },
            {
                name: 'Design System',
                description: 'Codify patterns — components, tokens, guidelines that scale',
                entity_types: ['design_system', 'design_component', 'design_token', 'design_pattern', 'design_guideline'],
                suggested_skill: '/upg-add design_component',
            },
        ],
        benchmark_domains: [
            'design', 'user', 'ux_research', 'feedback_voc', 'accessibility',
        ],
        intelligence_prompts: [
            {
                condition: 'personas.length === 0',
                message: 'No personas yet. Who are you designing for? Start with the person, not the screen.',
            },
            {
                condition: 'user_journeys.length === 0 && screens.length > 0',
                message: 'You have screens but no user journeys. Without a journey, screens are disconnected pages — map the experience first.',
            },
            {
                condition: 'prototypes.length > 0 && experiments.length === 0',
                message: 'You have prototypes that haven\'t been tested. A prototype only validates when a real user touches it.',
            },
            {
                condition: 'how_might_we.length === 0 && needs.length > 3',
                message: 'Plenty of pain points identified, but no How Might We questions. Reframe the problems as design opportunities.',
            },
            {
                condition: 'a11y_audits.length === 0 && screens.length > 5',
                message: 'Many screens designed but no accessibility audit. Inclusive design is not a polish step — it is a design constraint.',
            },
        ],
        audience: 'Designers, UX researchers, and anyone focused on the user experience',
        perspective: 'Sees the product through the eyes of the people using it. Journey-first, evidence-based, obsessed with friction and delight.',
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // 3. ENGINEERING LENS — architecture-first, system-aware
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: 'engineering',
        name: 'Engineering',
        description: 'Architecture-first view of the product as a technical system',
        icon: 'cpu',
        framework_id: 'dora',
        label_overrides: {
            feature: 'Feature',
            epic: 'Epic',
            user_story: 'Story',
            release: 'Release',
            outcome: 'Product Goal',
            experiment: 'Technical Spike',
            need: 'Requirement',
        },
        visible_domains: [
            'engineering', 'product_spec', 'devops', 'data_analytics',
            'security', 'qa_testing', 'ai_ml', 'agentic',
        ],
        always_show_types: ['product', 'outcome', 'persona', 'feature'],
        always_hide_types: [
            'brand_identity', 'brand_colour', 'brand_typography', 'brand_voice',
            'positioning', 'messaging', 'content_piece', 'social_post',
        ],
        workflow_steps: [
            {
                name: 'Architecture',
                description: 'Define the system shape — bounded contexts, services, key decisions',
                entity_types: ['bounded_context', 'architecture_decision', 'service', 'aggregate'],
                suggested_skill: '/upg-add architecture_decision',
            },
            {
                name: 'Services & APIs',
                description: 'Map the service layer — endpoints, contracts, integrations',
                entity_types: ['service', 'api_endpoint', 'api_contract', 'external_api', 'integration_pattern'],
                suggested_skill: '/upg-add service',
            },
            {
                name: 'Data',
                description: 'Design the data layer — schemas, events, pipelines',
                entity_types: ['database_schema', 'domain_event', 'event_schema', 'data_model', 'data_pipeline', 'queue_topic'],
                suggested_skill: '/upg-add database_schema',
            },
            {
                name: 'Build',
                description: 'Scope the work — features, epics, stories, tasks',
                entity_types: ['feature', 'epic', 'user_story', 'task', 'technical_debt_item'],
                suggested_skill: '/upg-add feature',
            },
            {
                name: 'Test',
                description: 'Verify the system — test suites, coverage, QA sessions',
                entity_types: ['test_suite', 'test_case', 'qa_session', 'regression_test', 'test_coverage_report'],
                suggested_skill: '/upg-add test_suite',
            },
            {
                name: 'Deploy',
                description: 'Ship reliably — pipelines, feature flags, release strategy',
                entity_types: ['deployment', 'ci_pipeline', 'feature_flag', 'release', 'release_strategy'],
                suggested_skill: '/upg-add deployment',
            },
            {
                name: 'Monitor',
                description: 'Keep it running — SLIs, monitors, alerts, incident response',
                entity_types: ['sli', 'slo', 'monitor', 'alert_rule', 'incident', 'runbook', 'on_call_rotation'],
                suggested_skill: '/upg-add monitor',
            },
            {
                name: 'Security',
                description: 'Keep it safe — threat models, controls, access policies',
                entity_types: ['threat_model', 'threat', 'vulnerability', 'security_control', 'security_policy', 'access_policy'],
                suggested_skill: '/upg-add threat_model',
            },
        ],
        benchmark_domains: [
            'engineering', 'product_spec', 'devops', 'security', 'qa_testing', 'data_analytics',
        ],
        intelligence_prompts: [
            {
                condition: 'architecture_decisions.length === 0',
                message: 'No architecture decisions recorded. Document the key technical choices — future you will thank present you.',
            },
            {
                condition: 'services.length > 0 && api_contracts.length === 0',
                message: 'Services without API contracts. How do they talk to each other? Define the interfaces.',
            },
            {
                condition: 'features.length > 5 && test_suites.length === 0',
                message: 'Features shipping without test coverage. What happens when something breaks?',
            },
            {
                condition: 'deployments.length > 0 && monitors.length === 0',
                message: 'You are deploying but not monitoring. How will you know when something goes wrong in production?',
            },
            {
                condition: 'technical_debt_items.length > 10',
                message: 'Technical debt is piling up. Consider dedicating a percentage of each cycle to paying it down before it compounds.',
            },
        ],
        audience: 'Developers, CTOs, and anyone building the technical system',
        perspective: 'Sees the product as a system of services, data flows, and deployments. Architecture-first, reliability-aware, concerned with how things are built and how they stay running.',
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // 4. GROWTH LENS — metrics-driven, experiment-focused
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: 'growth',
        name: 'Growth',
        description: 'Metrics-driven view focused on funnels, loops, and what moves the numbers',
        icon: 'trending-up',
        framework_id: 'aarrr',
        label_overrides: {
            metric: 'Growth Metric',
            experiment: 'Growth Experiment',
            outcome: 'North Star',
            persona: 'User Segment',
            hypothesis: 'Growth Bet',
            learning: 'Experiment Result',
            insight: 'Data Insight',
        },
        visible_domains: [
            'growth', 'business_model', 'go_to_market', 'data_analytics',
            'pricing', 'feedback_voc', 'market_intelligence',
        ],
        always_show_types: ['product', 'outcome', 'persona'],
        always_hide_types: [
            'bounded_context', 'service', 'api_endpoint', 'database_schema',
            'wireframe', 'design_component', 'design_token',
        ],
        workflow_steps: [
            {
                name: 'North Star',
                description: 'Define the one metric that matters most — the number that captures the value you create',
                entity_types: ['metric', 'outcome', 'objective'],
                suggested_skill: '/upg-add metric',
            },
            {
                name: 'Funnel',
                description: 'Map how users flow from awareness to value — where are the drops?',
                entity_types: ['funnel', 'funnel_step', 'user_flow'],
                suggested_skill: '/upg-add funnel',
            },
            {
                name: 'Channels',
                description: 'Identify where users come from — which channels are scalable and cost-effective?',
                entity_types: ['acquisition_channel', 'campaign', 'attribution_model'],
                suggested_skill: '/upg-add acquisition_channel',
            },
            {
                name: 'Segments',
                description: 'Break users into cohorts — who retains, who converts, who churns?',
                entity_types: ['cohort', 'segment', 'persona', 'ideal_customer_profile'],
                suggested_skill: '/upg-add segment',
            },
            {
                name: 'Experiments',
                description: 'Run experiments to move the numbers — A/B tests, pricing tests, growth loops',
                entity_types: ['experiment', 'variant', 'hypothesis', 'growth_loop'],
                suggested_skill: '/upg-add experiment',
            },
            {
                name: 'Measure',
                description: 'Track results — dashboards, event schemas, metric definitions',
                entity_types: ['metric', 'dashboard', 'event_schema', 'data_source'],
                suggested_skill: '/upg-add metric',
            },
            {
                name: 'Iterate',
                description: 'Learn and loop — what worked, what didn\'t, what to try next',
                entity_types: ['learning', 'evidence', 'insight'],
                suggested_skill: '/upg-add learning',
            },
        ],
        benchmark_domains: [
            'growth', 'business_model', 'data_analytics', 'pricing', 'go_to_market',
        ],
        intelligence_prompts: [
            {
                condition: 'north_star_metrics.length === 0',
                message: 'No north star metric defined. What single number best captures the value your product creates for users?',
            },
            {
                condition: 'funnels.length === 0',
                message: 'No funnels mapped. You can\'t improve what you can\'t see — map the user journey from first touch to activation.',
            },
            {
                condition: 'experiments.length > 0 && metrics.length < 3',
                message: 'Running experiments without enough metrics to measure them. Define the input and output metrics before you test.',
            },
            {
                condition: 'channels.length === 1',
                message: 'Only one acquisition channel. Single-channel dependency is risky — what else could work?',
            },
            {
                condition: 'cohorts.length === 0 && users > 100',
                message: 'No cohort analysis yet. Not all users are the same — segment by behaviour to find what drives retention.',
            },
        ],
        audience: 'Growth marketers, data-driven founders, and anyone optimising acquisition and retention',
        perspective: 'Sees the product as a system of funnels, loops, and numbers. Experiment-driven, metric-obsessed, always asking what moves the needle.',
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // 5. BUSINESS LENS — viability-focused
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: 'business',
        name: 'Business',
        description: 'Viability-focused view of the product as a business that needs to sustain itself',
        icon: 'briefcase',
        framework_id: 'bmc',
        label_overrides: {
            outcome: 'Business Outcome',
            persona: 'Customer Archetype',
            need: 'Customer Problem',
            feature: 'Product Capability',
            opportunity: 'Market Opportunity',
            experiment: 'Business Experiment',
            metric: 'Business Metric',
            hypothesis: 'Business Assumption',
        },
        visible_domains: [
            'business_model', 'pricing', 'go_to_market', 'strategic',
            'market_intelligence', 'growth',
        ],
        always_show_types: ['product', 'persona', 'feature', 'outcome'],
        always_hide_types: [
            'wireframe', 'design_component', 'design_token', 'prototype',
            'bounded_context', 'service', 'api_endpoint', 'database_schema',
            'test_suite', 'test_case', 'ci_pipeline',
        ],
        workflow_steps: [
            {
                name: 'Value Proposition',
                description: 'Define the value you create — why should someone pay for this?',
                entity_types: ['value_proposition', 'product', 'need', 'desired_outcome'],
                suggested_skill: '/upg-add value_proposition',
            },
            {
                name: 'Customer',
                description: 'Know your customer — segments, ICPs, what they are willing to pay for',
                entity_types: ['persona', 'customer_segment_bm', 'ideal_customer_profile', 'market_segment'],
                suggested_skill: '/upg-add customer_segment_bm',
            },
            {
                name: 'Revenue',
                description: 'Design the revenue engine — streams, pricing, packaging',
                entity_types: ['revenue_stream', 'pricing_tier', 'pricing_strategy', 'package'],
                suggested_skill: '/upg-add revenue_stream',
            },
            {
                name: 'Cost Structure',
                description: 'Map the costs — what does it take to build, deliver, and support this?',
                entity_types: ['cost_structure', 'unit_economics', 'key_resource', 'key_activity'],
                suggested_skill: '/upg-add cost_structure',
            },
            {
                name: 'Unit Economics',
                description: 'Prove the math works — LTV, CAC, margins, breakeven',
                entity_types: ['unit_economics', 'metric'],
                suggested_skill: '/upg-add unit_economics',
            },
            {
                name: 'Go-To-Market',
                description: 'Plan the path to customers — positioning, channels, launch strategy',
                entity_types: ['gtm_strategy', 'positioning', 'messaging', 'channel_bm', 'distribution_channel', 'launch'],
                suggested_skill: '/upg-add gtm_strategy',
            },
            {
                name: 'Competitive Advantage',
                description: 'Understand the landscape — competitors, differentiation, moats',
                entity_types: ['competitor', 'competitive_analysis', 'market_trend', 'partnership'],
                suggested_skill: '/upg-add competitor',
            },
        ],
        benchmark_domains: [
            'business_model', 'pricing', 'go_to_market', 'strategic', 'market_intelligence', 'growth',
        ],
        intelligence_prompts: [
            {
                condition: 'value_propositions.length === 0',
                message: 'No value proposition defined. Why would someone pay for this? That needs an answer before anything else.',
            },
            {
                condition: 'revenue_streams.length === 0',
                message: 'No revenue streams. A product without revenue is a hobby. How will this make money?',
            },
            {
                condition: 'revenue_streams.length > 0 && cost_structures.length === 0',
                message: 'Revenue modeled but no cost structure. You need both sides of the equation to know if this is viable.',
            },
            {
                condition: 'unit_economics.length === 0 && revenue_streams.length > 0',
                message: 'Revenue streams without unit economics. Does each customer generate more value than they cost to acquire and serve?',
            },
            {
                condition: 'gtm_strategies.length === 0 && features.length > 3',
                message: 'Building features without a go-to-market plan. Great products fail when nobody knows they exist.',
            },
        ],
        audience: 'Business-minded founders, CFOs, and investors reviewing the product',
        perspective: 'Sees the product as a business that needs to sustain itself. Viability-focused, cost-aware, always asking whether the math works.',
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // 6. RESEARCH LENS — evidence-first
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: 'research',
        name: 'Research',
        description: 'Evidence-first view focused on what is known, assumed, and yet to be learned',
        icon: 'microscope',
        label_overrides: {
            need: 'User Need',
            opportunity: 'Research Opportunity',
            solution: 'Proposed Solution',
            feature: 'Product Concept',
            hypothesis: 'Research Hypothesis',
            experiment: 'Study',
            learning: 'Finding',
            insight: 'Research Insight',
            evidence: 'Evidence',
        },
        visible_domains: [
            'ux_research', 'user', 'validation', 'discovery',
            'feedback_voc', 'market_intelligence',
        ],
        always_show_types: ['product', 'outcome', 'persona', 'opportunity'],
        always_hide_types: [
            'database_schema', 'service', 'api_endpoint', 'ci_pipeline',
            'design_component', 'design_token', 'pricing_tier', 'revenue_stream',
        ],
        workflow_steps: [
            {
                name: 'Plan',
                description: 'Define what you need to learn — research questions, study design, interview guides',
                entity_types: ['research_plan', 'research_question', 'interview_guide', 'research_study'],
                suggested_skill: '/upg-add research_study',
            },
            {
                name: 'Recruit',
                description: 'Find the right participants — who can teach you what you need to know?',
                entity_types: ['participant', 'persona', 'segment'],
                suggested_skill: '/upg-add participant',
            },
            {
                name: 'Observe',
                description: 'Gather raw data — observations, quotes, survey responses, field notes',
                entity_types: ['observation', 'quote', 'survey_response', 'highlight'],
                suggested_skill: '/upg-add observation',
            },
            {
                name: 'Synthesize',
                description: 'Make sense of the data — cluster, pattern-match, extract themes',
                entity_types: ['affinity_cluster', 'feedback_theme'],
                suggested_skill: '/upg-add affinity_cluster',
            },
            {
                name: 'Insight',
                description: 'Crystallize learnings into actionable insights — what did you discover?',
                entity_types: ['insight', 'evidence', 'learning'],
                suggested_skill: '/upg-add insight',
            },
            {
                name: 'Opportunity',
                description: 'Connect insights to opportunities — what should the product do about this?',
                entity_types: ['opportunity', 'need', 'desired_outcome'],
                suggested_skill: '/upg-add opportunity',
            },
            {
                name: 'Hypothesis',
                description: 'Frame testable hypotheses from research — what assumptions need validation?',
                entity_types: ['hypothesis', 'assumption'],
                suggested_skill: '/upg-add hypothesis',
            },
            {
                name: 'Test',
                description: 'Validate with targeted experiments — close the loop between research and action',
                entity_types: ['experiment', 'test_plan', 'evidence'],
                suggested_skill: '/upg-add experiment',
            },
        ],
        benchmark_domains: [
            'ux_research', 'user', 'validation', 'discovery', 'feedback_voc',
        ],
        intelligence_prompts: [
            {
                condition: 'research_studies.length === 0',
                message: 'No research studies yet. What do you need to learn? Start with the questions, not the answers.',
            },
            {
                condition: 'observations.length > 10 && insights.length === 0',
                message: 'Lots of observations but no synthesized insights. Raw data is not knowledge — cluster and extract patterns.',
            },
            {
                condition: 'insights.length > 5 && opportunities.length === 0',
                message: 'Insights without opportunities. Research is powerful when it drives product decisions — what should the product do about what you learned?',
            },
            {
                condition: 'hypotheses.length > 3 && experiments.length === 0',
                message: 'Hypotheses without experiments. The whole point of framing a hypothesis is to test it. What is the cheapest way to learn?',
            },
            {
                condition: 'participants.length < 5 && research_studies.length > 0',
                message: 'Very few participants. Qualitative research needs enough voices to reveal patterns — aim for 5-8 per study minimum.',
            },
        ],
        audience: 'User researchers, discovery coaches, and anyone in a research-heavy phase',
        perspective: 'Sees the product through what is known, what is assumed, and what needs investigation. Evidence-first, synthesis-driven, allergic to untested assumptions.',
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // 7. MARKETING LENS — audience-aware, message-focused
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: 'marketing',
        name: 'Marketing',
        description: 'Audience-aware view focused on reaching, resonating with, and converting people',
        icon: 'megaphone',
        label_overrides: {
            persona: 'Target Audience',
            need: 'Customer Problem',
            outcome: 'Marketing Goal',
            feature: 'Sellable Feature',
            insight: 'Market Insight',
            experiment: 'Campaign Test',
            metric: 'Marketing Metric',
            hypothesis: 'Messaging Hypothesis',
            learning: 'Campaign Learning',
        },
        visible_domains: [
            'go_to_market', 'content', 'growth', 'feedback_voc',
            'marketing_ops', 'market_intelligence',
        ],
        always_show_types: ['product', 'persona', 'value_proposition', 'feature', 'outcome'],
        always_hide_types: [
            'bounded_context', 'service', 'api_endpoint', 'database_schema',
            'test_suite', 'ci_pipeline', 'sli', 'slo',
            'wireframe', 'design_component', 'design_token',
        ],
        workflow_steps: [
            {
                name: 'Positioning',
                description: 'Define where you sit in the customer\'s mind — who is this for, and why is it different?',
                entity_types: ['positioning', 'competitive_analysis', 'competitor', 'market_segment'],
                suggested_skill: '/upg-add positioning',
            },
            {
                name: 'Messaging',
                description: 'Craft the words that resonate — value props, taglines, proof points',
                entity_types: ['messaging', 'value_proposition', 'proof_point', 'objection', 'rebuttal'],
                suggested_skill: '/upg-add messaging',
            },
            {
                name: 'Audience',
                description: 'Know who you are speaking to — personas, ICPs, segments',
                entity_types: ['persona', 'ideal_customer_profile', 'customer_segment_bm', 'segment'],
                suggested_skill: '/upg-add ideal_customer_profile',
            },
            {
                name: 'Channels',
                description: 'Choose where to show up — which channels reach your audience cost-effectively?',
                entity_types: ['acquisition_channel', 'channel_bm', 'distribution_channel', 'marketing_channel'],
                suggested_skill: '/upg-add acquisition_channel',
            },
            {
                name: 'Content',
                description: 'Create what resonates — content strategy, calendar, individual pieces',
                entity_types: ['content_strategy', 'content_piece', 'content_calendar', 'content_theme', 'brand_asset'],
                suggested_skill: '/upg-add content_piece',
            },
            {
                name: 'Launch',
                description: 'Orchestrate the go-to-market — launch plans, campaigns, press',
                entity_types: ['launch', 'campaign', 'demand_gen_program', 'press_release', 'event'],
                suggested_skill: '/upg-add launch',
            },
            {
                name: 'Measure',
                description: 'Track what works — attribution, conversion, engagement metrics',
                entity_types: ['metric', 'dashboard', 'attribution_model', 'funnel', 'nps_campaign'],
                suggested_skill: '/upg-add metric',
            },
        ],
        benchmark_domains: [
            'go_to_market', 'content', 'growth', 'market_intelligence', 'feedback_voc',
        ],
        intelligence_prompts: [
            {
                condition: 'positioning.length === 0',
                message: 'No positioning defined. Before any marketing can work, you need to know: who is this for, what category is it in, and why is it different?',
            },
            {
                condition: 'messaging.length === 0 && features.length > 3',
                message: 'Features without messaging. Features don\'t sell themselves — what is the message that makes someone care?',
            },
            {
                condition: 'channels.length === 0',
                message: 'No channels mapped. Where does your audience spend time? That is where you need to be.',
            },
            {
                condition: 'content_pieces.length === 0 && channels.length > 0',
                message: 'Channels without content. You know where to show up, but have nothing to say yet. Start with the content that matches your best channel.',
            },
            {
                condition: 'launches.length === 0 && features.length > 5',
                message: 'Building features without a launch plan. Every feature release is a marketing opportunity. Plan the story before the ship date.',
            },
        ],
        audience: 'Marketers, content creators, brand managers, and GTM leads',
        perspective: 'Sees the product as something that needs to reach and resonate with people. Audience-aware, message-focused, always asking what makes someone care.',
    },
    // ═══════════════════════════════════════════════════════════════════════════════
    // 8. FULL LENS — everything, canonical vocabulary (default)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: 'full',
        name: 'Full',
        description: 'Complete graph with canonical UPG vocabulary — the whole picture',
        icon: 'layout-grid',
        // No framework_id — uses canonical UPG labels
        // No label_overrides — everything stays canonical
        visible_domains: [], // empty = show all
        workflow_steps: [
            {
                name: 'Vision & Strategy',
                description: 'Set direction — vision, mission, outcomes, objectives',
                entity_types: ['product', 'vision', 'mission', 'outcome', 'objective', 'key_result', 'metric', 'strategic_theme'],
            },
            {
                name: 'Users & Needs',
                description: 'Understand who you serve — personas, jobs, needs, desired outcomes',
                entity_types: ['persona', 'jtbd', 'need', 'desired_outcome', 'job_step'],
            },
            {
                name: 'Research & Discovery',
                description: 'Learn what you don\'t know — studies, insights, opportunities',
                entity_types: ['research_study', 'insight', 'observation', 'opportunity', 'how_might_we'],
            },
            {
                name: 'Validation',
                description: 'Test your bets — hypotheses, experiments, evidence, learnings',
                entity_types: ['hypothesis', 'experiment', 'evidence', 'learning', 'solution'],
            },
            {
                name: 'Design & Experience',
                description: 'Shape the experience — journeys, screens, prototypes, design system',
                entity_types: ['user_journey', 'user_flow', 'screen', 'prototype', 'design_concept', 'design_component'],
            },
            {
                name: 'Build & Ship',
                description: 'Deliver value — features, epics, stories, releases, architecture',
                entity_types: ['feature', 'epic', 'user_story', 'release', 'service', 'architecture_decision'],
            },
            {
                name: 'Grow & Sustain',
                description: 'Scale and sustain — business model, growth, GTM, operations',
                entity_types: ['business_model', 'value_proposition', 'revenue_stream', 'funnel', 'gtm_strategy', 'launch'],
            },
        ],
        benchmark_domains: [], // empty = check all benchmark domains
        intelligence_prompts: [
            {
                condition: 'total_entities < 5',
                message: 'The graph is nearly empty. Start with the basics: a product, an outcome, and a persona.',
            },
            {
                condition: 'domains_activated < 3',
                message: 'Only a few domains active. A well-rounded product graph touches strategy, users, and at least one of validation, design, or engineering.',
            },
            {
                condition: 'orphan_entities.length > 5',
                message: 'Several entities without connections. Every entity should relate to something — orphans are loose thoughts waiting to be placed.',
            },
            {
                condition: 'validation_domain.length === 0 && features.length > 3',
                message: 'Building without validating. The validation domain (hypotheses, experiments, evidence) exists to prevent building the wrong thing.',
            },
        ],
        audience: 'Anyone who wants to see the complete picture without filtering',
        perspective: 'The complete, unfiltered product graph using canonical UPG vocabulary. Every domain, every type, every connection.',
    },
];
// ─── Lookup helpers ──────────────────────────────────────────────────────────────
/** O(1) lens lookup by id */
const _lensIndex = new Map(UPG_LENSES.map((l) => [l.id, l]));
/** Get a lens by its id. Returns undefined if not found. */
export function getLens(id) {
    return _lensIndex.get(id);
}
/** Get all lenses that include a given domain in their visible_domains. */
export function getLensesForDomain(domainId) {
    return UPG_LENSES.filter((l) => l.visible_domains.length === 0 || l.visible_domains.includes(domainId));
}
/**
 * Get all entity types visible through a given lens.
 *
 * Resolves the lens's visible_domains to concrete entity types from the
 * domain registry, then applies always_show_types and always_hide_types.
 *
 * If visible_domains is empty (show all), returns all types from all domains
 * minus always_hide_types.
 */
export function getVisibleTypes(lens) {
    // Resolve base types from visible domains
    let baseTypes;
    if (lens.visible_domains.length === 0) {
        // Show all — collect every type from every domain
        baseTypes = UPG_DOMAINS.flatMap((d) => [...d.types]);
    }
    else {
        // Filter to lens's visible domains
        baseTypes = UPG_DOMAINS
            .filter((d) => lens.visible_domains.includes(d.id))
            .flatMap((d) => [...d.types]);
    }
    // Add always_show_types that aren't already in the set
    const typeSet = new Set(baseTypes);
    if (lens.always_show_types) {
        for (const t of lens.always_show_types) {
            typeSet.add(t);
        }
    }
    // Remove always_hide_types
    if (lens.always_hide_types) {
        for (const t of lens.always_hide_types) {
            typeSet.delete(t);
        }
    }
    return [...typeSet];
}
/** Get the default lens (Full) */
export function getDefaultLens() {
    return _lensIndex.get('full');
}
/** Get all lens IDs */
export function getLensIds() {
    return UPG_LENSES.map((l) => l.id);
}
//# sourceMappingURL=lenses.js.map