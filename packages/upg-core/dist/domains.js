/**
 * UPG v0.1 — Domain Definitions & Entity Type Registry
 *
 * The Unified Product Graph organises entity types into semantic domains.
 * Each domain groups related entity types by their functional area.
 *
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
// ─── Domain registry ────────────────────────────────────────────────────────────
export const UPG_DOMAINS = [
    {
        id: 'strategic',
        label: 'Strategic',
        description: 'Vision, mission, outcomes, OKRs, and the decisions that shape product direction',
        tier: 'core',
        types: [
            'product', 'outcome', 'kpi', 'objective', 'key_result', 'metric',
            'vision', 'mission', 'strategic_theme', 'initiative', 'capability',
            'value_stream', 'strategic_pillar', 'assumption', 'decision',
        ],
    },
    {
        id: 'user',
        label: 'User',
        description: 'Personas, jobs-to-be-done, needs, and the demands that drive products',
        tier: 'core',
        types: [
            'persona', 'jtbd', 'need', 'desired_outcome',
            'job_step', 'user_need', 'switching_cost',
        ],
    },
    {
        id: 'discovery',
        label: 'Discovery',
        description: 'Opportunities, solutions, feasibility studies, and design sprints',
        tier: 'core',
        types: ['opportunity', 'solution', 'feasibility_study', 'design_sprint'],
    },
    {
        id: 'validation',
        label: 'Validation',
        description: 'Hypotheses, experiments, evidence, and the learning that confirms or kills ideas',
        tier: 'core',
        types: ['hypothesis', 'experiment', 'learning', 'test_plan', 'evidence', 'research_plan'],
    },
    {
        id: 'market_intelligence',
        label: 'Market Intelligence',
        description: 'Competitors, trends, segments, and the landscape analysis that informs strategy',
        tier: 'core',
        types: ['competitor', 'competitor_feature', 'market_trend', 'market_segment', 'competitive_analysis'],
    },
    {
        id: 'ux_research',
        label: 'UX Research',
        description: 'Studies, participants, observations, quotes, clusters, and the full research toolkit',
        tier: 'core',
        types: [
            'research_study', 'insight', 'participant', 'observation',
            'quote', 'affinity_cluster', 'research_question', 'interview_guide',
            'finding', 'survey_response', 'highlight',
        ],
    },
    {
        id: 'design',
        label: 'Design',
        description: 'Journeys, prototypes, components, tokens, and the design system',
        tier: 'core',
        types: [
            'user_journey', 'journey_step', 'ux_insight', 'how_might_we', 'design_concept',
            'prototype', 'design_component', 'design_token', 'brand_identity', 'brand_colour',
            'brand_typography', 'brand_voice', 'wireframe', 'design_pattern', 'design_guideline',
            'annotation', 'interaction_spec', 'design_system', 'user_flow', 'screen', 'screen_state',
        ],
    },
    {
        id: 'product_spec',
        label: 'Product Spec',
        description: 'Features, epics, stories, releases, roadmaps, and the backlog that ships value',
        tier: 'core',
        types: [
            'feature', 'epic', 'user_story', 'acceptance_criterion', 'release',
            'task', 'bug', 'roadmap', 'roadmap_item', 'theme', 'changelog',
        ],
    },
    {
        id: 'engineering',
        label: 'Engineering',
        description: 'Services, APIs, architecture decisions, and the technical backbone',
        tier: 'core',
        types: [
            'bounded_context', 'service', 'domain_event', 'api_contract', 'architecture_decision',
            'technical_debt_item', 'feature_flag', 'deployment', 'aggregate', 'domain_entity',
            'value_object', 'command', 'read_model', 'api_endpoint', 'database_schema',
            'queue_topic', 'build_artifact', 'code_repository', 'library_dependency',
            'integration_pattern', 'external_api', 'data_flow',
        ],
    },
    {
        id: 'growth',
        label: 'Growth',
        description: 'North-star metrics, funnels, loops, and the experiments that move them',
        tier: 'core',
        types: [
            'north_star_metric', 'input_metric', 'funnel', 'funnel_step', 'acquisition_channel',
            'campaign', 'cohort', 'segment', 'growth_loop', 'growth_experiment', 'variant',
            'attribution_model',
        ],
    },
    {
        id: 'business_model',
        label: 'Business Model',
        description: 'Value propositions, revenue streams, costs, and unit economics',
        tier: 'core',
        types: [
            'business_model', 'value_proposition', 'revenue_stream', 'pricing_tier',
            'cost_structure', 'unit_economics', 'partnership', 'key_resource', 'key_activity',
            'customer_segment_bm', 'channel_bm', 'customer_relationship', 'distribution_channel',
        ],
    },
    {
        id: 'go_to_market',
        label: 'Go-To-Market',
        description: 'Positioning, messaging, launches, and the plan to reach customers',
        tier: 'core',
        types: [
            'gtm_strategy', 'ideal_customer_profile', 'positioning', 'messaging', 'launch',
            'content_strategy', 'sales_motion', 'competitive_battle_card', 'demand_gen_program',
            'territory', 'objection', 'rebuttal', 'proof_point',
        ],
    },
    {
        id: 'team_org',
        label: 'Team & Organisation',
        description: 'Teams, roles, stakeholders, and how the organisation operates',
        tier: 'core',
        types: [
            'team', 'role', 'stakeholder', 'product_decision', 'team_okr', 'retrospective',
            'dependency', 'department', 'skill', 'ceremony', 'capacity_plan',
        ],
    },
    {
        id: 'data_analytics',
        label: 'Data & Analytics',
        description: 'Sources, metrics, pipelines, dashboards, and data governance',
        tier: 'core',
        types: [
            'data_source', 'metric_definition', 'event_schema', 'dashboard', 'ab_test',
            'data_model', 'data_quality_rule', 'data_product', 'data_pipeline', 'data_lineage',
            'glossary_term', 'data_domain', 'report',
        ],
    },
    {
        id: 'content',
        label: 'Content & Knowledge',
        description: 'Articles, brand assets, templates, and the content calendar',
        tier: 'core',
        types: [
            'content_piece', 'knowledge_base_article', 'brand_asset', 'internal_doc',
            'prompt_template', 'content_calendar', 'content_theme', 'documentation_template',
        ],
    },
    {
        id: 'legal_compliance',
        label: 'Legal & Compliance',
        description: 'Contracts, business entities, IP, compliance, and risk management',
        tier: 'core',
        types: [
            'compliance_requirement', 'risk', 'data_contract', 'legal_entity', 'ip_asset',
            'audit_log_policy', 'contract', 'contract_clause', 'privacy_policy',
            'compliance_framework', 'security_audit',
        ],
    },
    {
        id: 'devops',
        label: 'DevOps & Platform',
        description: 'SLIs, incidents, runbooks, and the reliability stack',
        tier: 'core',
        types: [
            'sli', 'slo', 'error_budget', 'incident', 'postmortem', 'runbook', 'monitor',
            'alert_rule', 'ci_pipeline', 'release_strategy', 'on_call_rotation',
            'infrastructure_component',
        ],
    },
    {
        id: 'security',
        label: 'Security',
        description: 'Threat models, vulnerabilities, controls, and security reviews',
        tier: 'core',
        types: [
            'threat_model', 'threat', 'vulnerability', 'security_control', 'security_policy',
            'security_incident', 'penetration_test', 'security_review', 'data_classification',
            'access_policy',
        ],
    },
    {
        id: 'accessibility',
        label: 'Accessibility',
        description: 'Standards, audits, and the practices that keep your product inclusive',
        tier: 'core',
        types: ['a11y_standard', 'a11y_guideline', 'a11y_audit', 'a11y_issue', 'a11y_annotation'],
    },
    {
        id: 'qa_testing',
        label: 'QA & Testing',
        description: 'Test suites, coverage reports, and quality assurance',
        tier: 'core',
        types: [
            'test_suite', 'test_case', 'qa_session', 'regression_test', 'test_coverage_report',
            'test_environment', 'defect_report',
        ],
    },
    {
        id: 'feedback_voc',
        label: 'Feedback & Voice of Customer',
        description: 'Feature requests, NPS, beta programs, and the voice of the customer',
        tier: 'core',
        types: [
            'feedback_program', 'feature_request', 'feedback_vote', 'nps_campaign',
            'user_advisory_board', 'beta_program', 'feedback_theme',
        ],
    },
    {
        id: 'pricing',
        label: 'Pricing & Packaging',
        description: 'Strategies, experiments, packages, and paywall configuration',
        tier: 'core',
        types: [
            'pricing_strategy', 'pricing_experiment', 'package', 'discount_strategy',
            'trial_config', 'paywall',
        ],
    },
    {
        id: 'ai_ml',
        label: 'AI/ML Operations',
        description: 'Models, prompts, evaluations, and guardrails for AI features',
        tier: 'core',
        types: [
            'ai_model', 'prompt_version', 'eval_benchmark', 'eval_run', 'ai_cost_tracker',
            'hallucination_report', 'ai_guardrail', 'model_comparison',
        ],
    },
    {
        id: 'agentic',
        label: 'Agentic Workflows',
        description: 'Workflows, agents, skills, and the automation layer',
        tier: 'core',
        types: [
            'workflow_template', 'workflow_run', 'agent_definition', 'agent_session',
            'review_gate', 'approval_record', 'agent_skill', 'agent_hook', 'workflow_artifact',
        ],
    },
    {
        id: 'portfolio',
        label: 'Portfolio',
        description: 'Organisations, portfolios, and product areas for multi-product management',
        tier: 'core',
        types: ['organization', 'portfolio', 'product_area'],
    },
    {
        id: 'sales',
        label: 'Sales & Revenue',
        description: 'Accounts, deals, pipeline stages, and revenue forecasting',
        tier: 'extended',
        types: [
            'account', 'contact', 'lead', 'deal', 'pipeline_sales', 'pipeline_stage',
            'quote_document', 'subscription', 'invoice', 'forecast',
        ],
    },
    {
        id: 'program_mgmt',
        label: 'Program Management',
        description: 'Programs, projects, milestones, and cross-team delivery',
        tier: 'extended',
        types: [
            'program', 'project', 'milestone', 'risk_register', 'risk_item', 'change_request',
            'deliverable', 'resource_allocation', 'status_report',
        ],
    },
    {
        id: 'marketing_ops',
        label: 'Marketing Operations',
        description: 'Campaign execution, channels, email sequences, ad creatives, and SEO',
        tier: 'extended',
        types: [
            'marketing_strategy', 'marketing_channel', 'marketing_campaign_plan', 'email_sequence',
            'social_post', 'seo_keyword', 'ad_creative', 'press_release', 'event',
            'community_initiative',
        ],
    },
    {
        id: 'ops_cs',
        label: 'Operations & Customer Success',
        description: 'Support workflows, SLAs, health scores, and customer success at scale',
        tier: 'extended',
        types: [
            'support_ticket', 'customer_feedback', 'churn_reason', 'onboarding_flow',
            'customer_health_score', 'playbook', 'sla', 'customer_journey_stage', 'touchpoint',
            'success_milestone', 'service_blueprint', 'nps_score',
        ],
    },
    {
        id: 'localisation',
        label: 'Localisation & i18n',
        description: 'Locales, translations, and cultural adaptations for global reach',
        tier: 'extended',
        types: [
            'locale', 'translation_key', 'translation_bundle', 'locale_config',
            'cultural_adaptation', 'regional_pricing',
        ],
    },
    {
        id: 'education',
        label: 'Customer Education',
        description: 'Tutorials, walkthroughs, certifications, and learning paths',
        tier: 'extended',
        types: [
            'education_program', 'tutorial', 'walkthrough', 'webinar', 'certification',
            'help_video', 'learning_path',
        ],
    },
    {
        id: 'partners',
        label: 'Partners & Ecosystem',
        description: 'Partner programs, integrations, and the ecosystem around your product',
        tier: 'extended',
        types: [
            'partner_program', 'partner_tier', 'api_ecosystem', 'marketplace_listing',
            'developer_portal', 'integration_partner', 'partner_revenue_share',
        ],
    },
];
// ─── Helper functions ───────────────────────────────────────────────────────────
/** Get all domains for a specific tier (inclusive — 'extended' includes 'core') */
export function getDomainsForTier(tier) {
    if (tier === 'core')
        return UPG_DOMAINS.filter((d) => d.tier === 'core');
    return [...UPG_DOMAINS]; // extended includes everything
}
/** Get all entity types for a specific tier (inclusive) */
export function getTypesForTier(tier) {
    return getDomainsForTier(tier).flatMap((d) => [...d.types]);
}
/** Look up which domain an entity type belongs to */
export function getDomainForType(entityType) {
    return UPG_DOMAINS.find((d) => d.types.includes(entityType));
}
/** Look up which tier an entity type belongs to */
export function getTierForType(entityType) {
    return getDomainForType(entityType)?.tier;
}
//# sourceMappingURL=domains.js.map