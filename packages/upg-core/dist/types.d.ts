/**
 * UPG v0.1 — Entity Type Definitions
 *
 * The Unified Product Graph is an open specification for product knowledge.
 * All entity types are part of a single unified set, organised into semantic
 * domains. Types with property interfaces have full type-safe schemas.
 * All other types use UPGBaseNode.properties (Record<string, unknown>)
 * for flexibility. Property interfaces can be contributed over time.
 *
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
import type { InsightProperties } from './properties/product.js';
export type Scale1to5 = 1 | 2 | 3 | 4 | 5;
export type MappingConfidence = 'high' | 'medium' | 'low' | 'manual';
export type UPGEntityType = 'product' | 'outcome' | 'kpi' | 'objective' | 'key_result' | 'metric' | 'vision' | 'mission' | 'strategic_theme' | 'initiative' | 'capability' | 'value_stream' | 'strategic_pillar' | 'assumption' | 'decision' | 'persona' | 'jtbd' | 'need' | 'desired_outcome' | 'job_step' | 'user_need' | 'switching_cost' | 'opportunity' | 'solution' | 'feasibility_study' | 'design_sprint' | 'hypothesis' | 'experiment' | 'learning' | 'test_plan' | 'evidence' | 'research_plan' | 'competitor' | 'competitor_feature' | 'market_trend' | 'market_segment' | 'competitive_analysis' | 'research_study' | 'insight' | 'participant' | 'observation' | 'quote' | 'affinity_cluster' | 'research_question' | 'interview_guide' | 'finding' | 'survey_response' | 'highlight' | 'user_journey' | 'journey_step' | 'ux_insight' | 'how_might_we' | 'design_concept' | 'prototype' | 'design_component' | 'design_token' | 'brand_identity' | 'brand_colour' | 'brand_typography' | 'brand_voice' | 'wireframe' | 'design_pattern' | 'design_guideline' | 'annotation' | 'interaction_spec' | 'design_system' | 'user_flow' | 'screen' | 'screen_state' | 'feature' | 'epic' | 'user_story' | 'acceptance_criterion' | 'release' | 'task' | 'bug' | 'roadmap' | 'roadmap_item' | 'theme' | 'changelog' | 'bounded_context' | 'service' | 'domain_event' | 'api_contract' | 'architecture_decision' | 'technical_debt_item' | 'feature_flag' | 'deployment' | 'aggregate' | 'domain_entity' | 'value_object' | 'command' | 'read_model' | 'api_endpoint' | 'database_schema' | 'queue_topic' | 'build_artifact' | 'code_repository' | 'library_dependency' | 'integration_pattern' | 'external_api' | 'data_flow' | 'north_star_metric' | 'input_metric' | 'funnel' | 'funnel_step' | 'acquisition_channel' | 'campaign' | 'cohort' | 'segment' | 'growth_loop' | 'growth_experiment' | 'variant' | 'attribution_model' | 'business_model' | 'value_proposition' | 'revenue_stream' | 'pricing_tier' | 'cost_structure' | 'unit_economics' | 'partnership' | 'key_resource' | 'key_activity' | 'customer_segment_bm' | 'channel_bm' | 'customer_relationship' | 'distribution_channel' | 'gtm_strategy' | 'ideal_customer_profile' | 'positioning' | 'messaging' | 'launch' | 'content_strategy' | 'sales_motion' | 'competitive_battle_card' | 'demand_gen_program' | 'territory' | 'objection' | 'rebuttal' | 'proof_point' | 'team' | 'role' | 'stakeholder' | 'product_decision' | 'team_okr' | 'retrospective' | 'dependency' | 'department' | 'skill' | 'ceremony' | 'capacity_plan' | 'data_source' | 'metric_definition' | 'event_schema' | 'dashboard' | 'ab_test' | 'data_model' | 'data_quality_rule' | 'data_product' | 'data_pipeline' | 'data_lineage' | 'glossary_term' | 'data_domain' | 'report' | 'content_piece' | 'knowledge_base_article' | 'brand_asset' | 'internal_doc' | 'prompt_template' | 'content_calendar' | 'content_theme' | 'documentation_template' | 'compliance_requirement' | 'risk' | 'data_contract' | 'legal_entity' | 'ip_asset' | 'audit_log_policy' | 'contract' | 'contract_clause' | 'privacy_policy' | 'compliance_framework' | 'security_audit' | 'sli' | 'slo' | 'error_budget' | 'incident' | 'postmortem' | 'runbook' | 'monitor' | 'alert_rule' | 'ci_pipeline' | 'release_strategy' | 'on_call_rotation' | 'infrastructure_component' | 'threat_model' | 'threat' | 'vulnerability' | 'security_control' | 'security_policy' | 'security_incident' | 'penetration_test' | 'security_review' | 'data_classification' | 'access_policy' | 'a11y_standard' | 'a11y_guideline' | 'a11y_audit' | 'a11y_issue' | 'a11y_annotation' | 'test_suite' | 'test_case' | 'qa_session' | 'regression_test' | 'test_coverage_report' | 'test_environment' | 'defect_report' | 'feedback_program' | 'feature_request' | 'feedback_vote' | 'nps_campaign' | 'user_advisory_board' | 'beta_program' | 'feedback_theme' | 'pricing_strategy' | 'pricing_experiment' | 'package' | 'discount_strategy' | 'trial_config' | 'paywall' | 'ai_model' | 'prompt_version' | 'eval_benchmark' | 'eval_run' | 'ai_cost_tracker' | 'hallucination_report' | 'ai_guardrail' | 'model_comparison' | 'workflow_template' | 'workflow_run' | 'agent_definition' | 'agent_session' | 'review_gate' | 'approval_record' | 'agent_skill' | 'agent_hook' | 'workflow_artifact' | 'organization' | 'portfolio' | 'product_area' | 'account' | 'contact' | 'lead' | 'deal' | 'pipeline_sales' | 'pipeline_stage' | 'quote_document' | 'subscription' | 'invoice' | 'forecast' | 'program' | 'project' | 'milestone' | 'risk_register' | 'risk_item' | 'change_request' | 'deliverable' | 'resource_allocation' | 'status_report' | 'marketing_strategy' | 'marketing_channel' | 'marketing_campaign_plan' | 'email_sequence' | 'social_post' | 'seo_keyword' | 'ad_creative' | 'press_release' | 'event' | 'community_initiative' | 'support_ticket' | 'customer_feedback' | 'churn_reason' | 'onboarding_flow' | 'customer_health_score' | 'playbook' | 'sla' | 'customer_journey_stage' | 'touchpoint' | 'success_milestone' | 'service_blueprint' | 'nps_score' | 'locale' | 'translation_key' | 'translation_bundle' | 'locale_config' | 'cultural_adaptation' | 'regional_pricing' | 'education_program' | 'tutorial' | 'walkthrough' | 'webinar' | 'certification' | 'help_video' | 'learning_path' | 'partner_program' | 'partner_tier' | 'api_ecosystem' | 'marketplace_listing' | 'developer_portal' | 'integration_partner' | 'partner_revenue_share';
/** @deprecated Use UPGEntityType instead */
export type UPGCoreType = UPGEntityType;
/** @deprecated Use UPGEntityType instead */
export type UPGExtendedType = UPGEntityType;
export interface UPGBaseNode {
    /** Unique identifier within the graph */
    id: string;
    /** The UPG entity type (or a custom string for tool-specific types) */
    type: UPGEntityType | string;
    /** Human-readable title */
    title: string;
    /** Optional narrative description */
    description?: string;
    /** Freeform tags for filtering and grouping */
    tags?: string[];
    /** Lifecycle status — semantics vary by entity type */
    status?: string;
    /** Original ID in the source tool (for round-trip fidelity) */
    source_id?: string;
    /** Original type name in the source tool */
    source_type?: string;
    /** Confidence level of the type mapping */
    mapping_confidence?: MappingConfidence;
    /** Manual sort order among siblings — used for drag-to-reorder in tree views */
    sort_order?: number;
    /** Journey Framework: where the entity is in the Draft → Validated lifecycle */
    lifecycle_status?: 'draft' | 'needs_research' | 'in_research' | 'validated' | 'invalidated';
    /** Journey Framework: simple provenance — how the entity came to exist */
    provenance_source?: 'conversation' | 'import' | 'ai_suggested' | 'manual';
    /** Commitment level — communicates team commitment, not task state */
    commitment?: string;
    /** If true, commitment was set manually and won't auto-propagate from children */
    commitment_override?: boolean;
    /** External tool that holds the canonical artifact (e.g. "figma", "linear", "notion") */
    external_tool?: string;
    /** URL to the artifact in its native tool */
    external_url?: string;
    /** Identifier in the external tool's system (for sync / round-trip) */
    external_id?: string;
    /** Local file path for design files (.fig, .sketch, .pen, etc.) */
    file_path?: string;
    /** Type-specific properties */
    properties?: Record<string, unknown>;
}
/** The product being created — root of the graph */
export interface ProductProperties {
    stage?: 'idea' | 'mvp' | 'growth' | 'scale';
    archetype?: string;
    onboarded?: boolean;
    portfolio_id?: string;
    horizon?: 'h1_core' | 'h2_emerging' | 'h3_transformative';
    portfolio_stage?: 'ideate' | 'discover' | 'validate' | 'accelerate' | 'launch' | 'sustain' | 'mature' | 'decline';
    health_status?: 'green' | 'amber' | 'red';
    investment_bucket?: string;
}
/** A measurable change in user or business state that the product drives */
export interface OutcomeProperties {
    timeline?: string;
}
/** A metric that measures progress toward an outcome */
export interface KPIProperties {
    current_value?: number;
    target_value?: number;
    unit?: string;
    range_min?: number;
    range_max?: number;
}
/** A high-level strategic goal — the O in OKR */
export interface ObjectiveProperties {
    timeframe?: string;
    status?: 'active' | 'achieved' | 'deferred';
    progress?: number;
}
/** A measurable result under an objective — the KR in OKR */
export interface KeyResultProperties {
    current_value?: number;
    target_value?: number;
    unit?: string;
    status?: 'on_track' | 'at_risk' | 'behind' | 'achieved';
}
/** A user archetype representing a distinct group of users */
export interface PersonaProperties {
    goals?: string[];
    frustrations?: string[];
    context?: string;
    is_primary?: boolean;
    experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'varies';
    motivation?: string;
    tech_comfort?: string;
    framework_knowledge?: string;
}
/** A Job-to-be-Done: the underlying goal a user is trying to accomplish */
export interface JTBDProperties {
    /** The job statement — "When I... I want to... So I can..." */
    statement?: string;
    job_type?: 'functional' | 'emotional' | 'social';
    importance?: Scale1to5;
    current_satisfaction?: Scale1to5;
}
/** Unified need — replaces pain_point + user_need. Framework labels provide context-specific display names. */
export interface NeedProperties {
    statement?: string;
    valence?: 'pain' | 'gap' | 'desire' | 'constraint';
    maturity?: 'raw' | 'validated' | 'prioritized';
    frequency?: Scale1to5;
    severity?: Scale1to5;
    importance?: Scale1to5;
}
/** A problem worth solving, grounded in user need and business value */
export interface OpportunityProperties {
    discovery_status?: 'identified' | 'validated' | 'deferred';
    reach?: Scale1to5;
    frequency?: Scale1to5;
    pain?: Scale1to5;
}
/** A proposed response to an opportunity */
export interface SolutionProperties {
    status?: 'proposed' | 'in_progress' | 'shipped' | 'deferred';
    timeline?: string;
    reach?: Scale1to5;
    impact?: Scale1to5;
    confidence?: Scale1to5;
    effort?: Scale1to5;
    /** Computed: (reach × impact × confidence) / effort */
    rice_score?: number;
}
/** A testable belief about a solution: if we do X, we expect Y */
export interface HypothesisProperties {
    we_believe?: string;
    will_result_in?: string;
    we_know_when?: string;
    we_test_by?: string;
    hypothesis_status?: 'untested' | 'in_progress' | 'validated' | 'invalidated';
}
/** A structured activity designed to test a hypothesis */
export interface ExperimentProperties {
    method?: string;
    experiment_status?: 'planned' | 'running' | 'analysing' | 'done';
    start_date?: string;
    end_date?: string;
    primary_metric_id?: string;
    guardrail_metric_ids?: string[];
    expected_lift?: number;
    expected_lift_unit?: 'percentage' | 'absolute' | 'ratio';
    actual_lift?: number;
}
/** The result of an experiment; evidence that updates a hypothesis */
export interface LearningProperties {
    result?: string;
    metric?: string;
    result_value?: string;
    result_direction?: 'positive' | 'negative' | 'neutral';
    confidence_impact?: 'strengthens' | 'weakens' | 'neutral';
}
/** A product or approach competing for the same user need */
export interface CompetitorProperties {
    positioning?: string;
    pricing_model?: string;
    strengths?: string[];
    weaknesses?: string[];
    website?: string;
}
/** A discrete, user-facing capability of the product */
export interface FeatureProperties {
    feature_status?: 'planned' | 'in_progress' | 'shipped' | 'archived';
    /** Linked Job-to-be-Done identifier */
    linked_jtbd?: string;
    /** Linked OKR identifier */
    linked_okr?: string;
}
/** A collection of related user stories that delivers a feature or capability */
export interface EpicProperties {
    epic_status?: 'todo' | 'in_progress' | 'done';
    estimate?: string;
}
/** A unit of user-facing functionality from the user's perspective */
export interface UserStoryProperties {
    /** "As a [persona], I want to [action], so that [outcome]" */
    as_a?: string;
    i_want_to?: string;
    so_that?: string;
    text?: string;
    persona_ref?: string;
    story_status?: 'draft' | 'ready' | 'in_progress' | 'done';
    estimate?: string;
    effort?: number;
}
/** A shipped version or milestone of the product */
export interface ReleaseProperties {
    release_status?: 'planned' | 'in_progress' | 'shipped';
    release_date?: string;
    version?: string;
}
/** A structured user research activity */
export interface ResearchStudyProperties {
    method?: 'interview' | 'usability' | 'survey' | 'diary' | 'analytics';
    status?: 'planned' | 'in_progress' | 'analysing' | 'complete';
    participant_count?: number;
    start_date?: string;
    end_date?: string;
}
/** A unified metric — measures progress, health, or behaviour across the product */
export interface MetricProperties {
    designation?: 'north_star' | 'kpi' | 'driver' | 'input' | 'guardrail' | 'proxy' | 'health' | 'vanity' | 'metric';
    guardrail_for?: string;
    action?: string;
    unit_of_analysis?: string;
    statistical_function?: 'average' | 'total' | 'count' | 'median' | 'rate' | 'ratio' | 'percentage' | 'score' | 'min' | 'max' | 'p95' | 'p99' | 'growth_rate' | 'conversion_rate' | 'retention_rate' | 'churn_rate' | 'custom';
    formula?: string;
    impact_level?: 'impact' | 'outcome' | 'output';
    indicator_direction?: 'leading' | 'lagging';
    metric_category?: 'acquisition' | 'activation' | 'retention' | 'referral' | 'revenue' | 'engagement' | 'happiness' | 'task_success' | 'adoption' | 'other';
    current_value?: number;
    target_value?: number;
    unit?: string;
    range_min?: number;
    range_max?: number;
    frequency?: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
    segment?: string;
    data_source?: string;
    owner?: string;
    guardrail_threshold_min?: number;
    guardrail_threshold_max?: number;
    guardrail_status?: 'safe' | 'warning' | 'breached';
    guards_metric_id?: string;
    persona_id?: string;
    segment_type?: 'persona' | 'cohort' | 'channel' | 'geography' | 'device' | 'plan' | 'custom';
    segment_value?: string;
    is_aggregate?: boolean;
    quality_correlated?: boolean;
    quality_actionable?: boolean;
    quality_sensitive?: boolean;
    quality_comparative?: boolean;
    quality_related?: boolean;
    quality_score?: number;
    proxy_for?: string;
    proxy_reason?: 'qualitative' | 'no_direct_measure' | 'not_yet_instrumented' | 'too_expensive';
    proxy_confidence?: 'strong' | 'moderate' | 'weak';
    proxy_alternatives?: string[];
    external_metric_id?: string;
    external_query?: string;
    last_synced_at?: string;
    sync_status?: 'synced' | 'stale' | 'error' | 'manual';
    sync_error?: string;
}
export interface UPGPropertyMap {
    product: ProductProperties;
    outcome: OutcomeProperties;
    kpi: KPIProperties;
    objective: ObjectiveProperties;
    key_result: KeyResultProperties;
    persona: PersonaProperties;
    jtbd: JTBDProperties;
    need: NeedProperties;
    opportunity: OpportunityProperties;
    solution: SolutionProperties;
    hypothesis: HypothesisProperties;
    experiment: ExperimentProperties;
    learning: LearningProperties;
    competitor: CompetitorProperties;
    feature: FeatureProperties;
    epic: EpicProperties;
    user_story: UserStoryProperties;
    release: ReleaseProperties;
    research_study: ResearchStudyProperties;
    insight: InsightProperties;
    metric: MetricProperties;
}
/** @deprecated Use UPGPropertyMap instead */
export type UPGCorePropertyMap = UPGPropertyMap;
export type UPGNode<T extends keyof UPGPropertyMap = keyof UPGPropertyMap> = UPGBaseNode & {
    type: T;
    properties?: UPGPropertyMap[T];
};
//# sourceMappingURL=types.d.ts.map