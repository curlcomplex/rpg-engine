/**
 * UPG Property Schemas — BUSINESS Domains
 *
 * Typed property interfaces for all BUSINESS entity types in the
 * Unified Product Graph specification.
 *
 * Covers: Growth, Business Model, Go-to-Market, Team & Organisation,
 * Data & Analytics layers.
 */
import type { Scale1to5 } from './core.js';
/** Properties for the NorthStarMetric entity */
export interface NorthStarMetricProperties {
    /** Formula or calculation used to derive this metric */
    formula?: string;
    /** Current measured value */
    current_value?: number;
    /** Target value to achieve */
    target_value?: number;
    /** Person or team responsible for this metric */
    owner?: string;
}
/** Properties for the InputMetric entity */
export interface InputMetricProperties {
    /** Formula or calculation used to derive this metric */
    formula?: string;
    /** Current measured value */
    current_value?: number;
    /** Target value to achieve */
    target_value?: number;
    /** Person or team responsible for this metric */
    owner?: string;
    /** How often this metric is refreshed */
    update_cadence?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}
/** Properties for the Funnel entity */
export interface FunnelProperties {
    /** Classification of the funnel */
    funnel_type?: 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral' | 'custom';
    /** Number of steps in the funnel */
    step_count?: number;
    /** End-to-end conversion rate (as a decimal, e.g. 0.05 = 5%) */
    overall_conversion_rate?: number;
}
/** Properties for the FunnelStep entity */
export interface FunnelStepProperties {
    /** Analytics event name that triggers this step */
    event_name?: string;
    /** Zero-based position of this step in the funnel */
    step_index?: number;
    /** Conversion rate at this step (as a decimal) */
    conversion_rate?: number;
    /** Drop-off rate at this step (as a decimal) */
    drop_off_rate?: number;
}
/** Properties for the AcquisitionChannel entity */
export interface AcquisitionChannelProperties {
    /** Classification of the acquisition channel */
    channel_type?: 'seo' | 'paid' | 'social' | 'referral' | 'direct' | 'content';
    /** Customer acquisition cost in base currency units */
    cac?: number;
    /** Average monthly volume of acquisitions */
    monthly_volume?: number;
}
/** Properties for the Campaign entity */
export interface CampaignProperties {
    /** The campaign's primary goal */
    goal?: string;
    /** Budget allocated in base currency units */
    budget?: number;
    /** ISO date when the campaign starts */
    start_date?: string;
    /** ISO date when the campaign ends */
    end_date?: string;
    /** UTM parameter string for tracking */
    utm_params?: string;
}
/** Properties for the Cohort entity */
export interface CohortProperties {
    /** Free-text definition of this cohort */
    definition?: string;
    /** ISO date marking the start of the acquisition window */
    acquisition_start?: string;
    /** ISO date marking the end of the acquisition window */
    acquisition_end?: string;
    /** Number of users in this cohort */
    size?: number;
    /** Day-7 retention rate (as a decimal) */
    retention_d7?: number;
    /** Day-30 retention rate (as a decimal) */
    retention_d30?: number;
}
/** Properties for the Segment entity */
export interface SegmentProperties {
    /** Criteria used to define this segment */
    criteria?: string;
    /** Number of users in this segment */
    size?: number;
    /** Classification of the segment */
    segment_type?: 'behavioral' | 'demographic' | 'firmographic' | 'custom';
}
/** Properties for the GrowthLoop entity */
export interface GrowthLoopProperties {
    /** Classification of the growth loop */
    loop_type?: 'viral' | 'content' | 'paid' | 'product' | 'network_effect';
    /** What initiates the loop */
    trigger?: string;
    /** The core action users take in the loop */
    action?: string;
    /** What users receive that completes the loop */
    reward?: string;
}
/** Properties for the GrowthExperiment entity */
export interface GrowthExperimentProperties {
    /** Channel being tested */
    channel?: string;
    /** Budget allocated to this experiment in base currency units */
    budget?: number;
    /** Current status of the experiment */
    growth_experiment_status?: 'planned' | 'running' | 'completed' | 'abandoned';
    /** Summary of the experiment result */
    result?: string;
}
/** Properties for the Variant entity */
export interface VariantProperties {
    /** Human-readable name for this variant */
    variant_name?: string;
    /** Percentage of traffic allocated to this variant */
    traffic_percentage?: number;
    /** Current status of the variant */
    variant_status?: 'active' | 'winner' | 'loser' | 'inactive';
}
/** Properties for the AttributionModel entity */
export interface AttributionModelProperties {
    /** Type of attribution model */
    model_type?: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'custom';
    /** How far back the model looks (e.g. "30 days") */
    lookback_window?: string;
    /** Comma-separated list of channels included */
    channels?: string;
}
/** Properties for the BusinessModel entity */
export interface BusinessModelProperties {
    /** Type of business model canvas used */
    canvas_type?: 'lean' | 'bmc' | 'vpc' | 'custom';
    /** Lifecycle stage of the business model */
    stage?: 'draft' | 'validated' | 'active';
}
/** Properties for the ValueProposition entity */
export interface ValuePropositionProperties {
    /** Which customer segment this value proposition targets */
    customer_segment?: string;
    /** Gains this proposition creates for the customer */
    gains?: string[];
    /** Pains this proposition relieves for the customer */
    pains_relieved?: string[];
}
/** Properties for the RevenueStream entity */
export interface RevenueStreamProperties {
    /** Classification of the revenue stream */
    stream_type?: 'subscription' | 'transaction' | 'licensing' | 'advertising' | 'freemium' | 'other';
    /** Monthly or annual recurring revenue in base currency units */
    mrr_arr?: number;
    /** Description of the pricing model */
    pricing_model?: string;
}
/** Properties for the PricingTier entity */
export interface PricingTierProperties {
    /** Price in base currency units */
    price?: number;
    /** Billing period for this tier */
    billing_period?: 'monthly' | 'yearly' | 'one_time';
    /** List of features included in this tier */
    features_included?: string[];
}
/** Properties for the CostStructure entity */
export interface CostStructureProperties {
    /** Classification of the cost */
    cost_type?: 'fixed' | 'variable' | 'cogs' | 'opex';
    /** Cost amount in base currency units */
    amount?: number;
    /** Billing period for this cost */
    period?: 'monthly' | 'yearly' | 'one_time';
}
/** Properties for the UnitEconomics entity */
export interface UnitEconomicsProperties {
    /** Customer lifetime value in base currency units */
    ltv?: number;
    /** Customer acquisition cost in base currency units */
    cac?: number;
    /** Number of months to recoup CAC */
    payback_period_months?: number;
    /** Gross margin as a decimal (e.g. 0.70 = 70%) */
    gross_margin?: number;
}
/** Properties for the Partnership entity */
export interface PartnershipProperties {
    /** Classification of the partnership */
    partner_type?: 'technology' | 'distribution' | 'content' | 'strategic';
    /** Current status of the partnership */
    partner_status?: 'prospecting' | 'negotiating' | 'active' | 'churned';
    /** Description of what each side provides */
    value_exchange?: string;
}
/** Properties for the KeyResource entity */
export interface KeyResourceProperties {
    /** Classification of the resource */
    resource_type?: 'physical' | 'intellectual' | 'human' | 'financial';
    /** How critical this resource is to the business */
    criticality?: 'critical' | 'important' | 'nice_to_have';
}
/** Properties for the KeyActivity entity */
export interface KeyActivityProperties {
    /** Classification of the activity */
    activity_type?: 'production' | 'problem_solving' | 'platform' | 'network';
    /** How often this activity occurs (e.g. "daily", "per sprint") */
    frequency?: string;
}
/** Properties for the CustomerSegmentBm entity (Business Model context) */
export interface CustomerSegmentBmProperties {
    /** Market segmentation type */
    segment_type?: 'mass' | 'niche' | 'segmented' | 'diversified' | 'multi_sided';
    /** Estimated number of customers in this segment */
    segment_size?: number;
    /** Description of willingness to pay */
    willingness_to_pay?: string;
}
/** Properties for the ChannelBm entity (Business Model context) */
export interface ChannelBmProperties {
    /** Phase in the customer journey this channel serves */
    channel_phase?: 'awareness' | 'evaluation' | 'purchase' | 'delivery' | 'after_sales';
    /** Whether the channel is direct, indirect, or partner-driven */
    channel_type?: 'direct' | 'indirect' | 'partner';
    /** Cost per acquisition through this channel in base currency units */
    cost_per_acquisition?: number;
}
/** Properties for the CustomerRelationship entity */
export interface CustomerRelationshipProperties {
    /** Type of relationship maintained */
    relationship_type?: 'personal' | 'self_service' | 'automated' | 'community' | 'co_creation';
    /** Role this relationship plays in acquiring customers */
    acquisition_role?: string;
    /** Role this relationship plays in retaining customers */
    retention_role?: string;
}
/** Properties for the DistributionChannel entity */
export interface DistributionChannelProperties {
    /** Classification of the distribution channel */
    channel_type?: 'direct' | 'retail' | 'wholesale' | 'marketplace' | 'oem';
    /** Whether the channel is owned or operated by a partner */
    owned_or_partner?: 'owned' | 'partner';
    /** Phase in the customer journey this channel serves */
    phase?: 'awareness' | 'purchase' | 'delivery' | 'support';
}
/** Properties for the GtmStrategy entity */
export interface GtmStrategyProperties {
    /** Target customer segment for this GTM motion */
    target_segment?: string;
    /** Primary go-to-market motion */
    primary_motion?: 'plg' | 'slg' | 'channel';
    /** ISO date for the planned launch */
    launch_date?: string;
}
/** Properties for the IdealCustomerProfile entity */
export interface IdealCustomerProfileProperties {
    /** Target company size (e.g. "50-200 employees") */
    company_size?: string;
    /** Target industry vertical */
    industry?: string;
    /** Expected budget range (e.g. "$10k-$50k/year") */
    budget_range?: string;
    /** Events that signal buying intent */
    trigger_events?: string[];
    /** Technology stack the ideal customer uses */
    tech_stack?: string[];
}
/** Properties for the Positioning entity */
export interface PositioningProperties {
    /** Market category the product competes in */
    category?: string;
    /** Primary differentiator from alternatives */
    differentiator?: string;
    /** Known alternatives or competitors */
    alternatives?: string[];
    /** Short tagline capturing the positioning */
    tagline?: string;
}
/** Properties for the Messaging entity */
export interface MessagingProperties {
    /** Target audience for this messaging */
    audience?: string;
    /** Primary headline */
    headline?: string;
    /** Body copy */
    body?: string;
    /** Supporting proof points */
    proof_points?: string[];
    /** Call to action */
    cta?: string;
}
/** Properties for the Launch entity */
export interface LaunchProperties {
    /** Scale of the launch */
    launch_type?: 'soft' | 'beta' | 'public' | 'feature';
    /** ISO date for the planned launch */
    target_date?: string;
    /** Distribution channels for the launch */
    channels?: string[];
    /** Metrics that define launch success */
    success_metrics?: string[];
}
/** Properties for the ContentStrategy entity */
export interface ContentStrategyProperties {
    /** Where in the funnel this content targets */
    funnel_stage?: 'tofu' | 'mofu' | 'bofu';
    /** Types of content to produce */
    content_types?: string[];
    /** Where content will be distributed */
    distribution_channels?: string[];
    /** Publishing cadence (e.g. "2x/week") */
    cadence?: string;
}
/** Properties for the SalesMotion entity */
export interface SalesMotionProperties {
    /** Type of sales motion */
    motion_type?: 'self_serve' | 'assisted' | 'enterprise';
    /** Criteria for qualifying leads */
    qualification_criteria?: string;
    /** Average deal cycle duration (e.g. "45 days") */
    avg_deal_cycle?: string;
}
/** Properties for the Objection entity */
export interface ObjectionProperties {
    /** The objection statement */
    statement?: string;
    /** Where this objection typically comes from */
    source_type?: 'prospect' | 'competitor' | 'internal' | 'market';
    /** How severe this objection is (1 = minor, 5 = deal-breaker) */
    severity?: Scale1to5;
    /** Whether this objection has been addressed */
    resolution?: 'open' | 'addressed' | 'invalidated';
}
/** Properties for the Rebuttal entity */
export interface RebuttalProperties {
    /** The rebuttal statement */
    statement?: string;
    /** How strong this rebuttal is (1 = weak, 5 = irrefutable) */
    strength?: Scale1to5;
    /** References to supporting evidence */
    evidence_refs?: string;
}
/** Properties for the ProofPoint entity */
export interface ProofPointProperties {
    /** The proof point statement */
    statement?: string;
    /** Type of evidence backing this proof point */
    evidence_type?: 'case_study' | 'statistic' | 'testimonial' | 'certification' | 'award';
    /** Source of the evidence */
    source?: string;
}
/** Properties for the CompetitiveBattleCard entity */
export interface CompetitiveBattleCardProperties {
    /** Reference to the competitor node */
    competitor_ref?: string;
    /** Historical win rate against this competitor (as a decimal) */
    win_rate?: number;
    /** Summary of key differentiators */
    key_differentiators?: string;
}
/** Properties for the DemandGenProgram entity */
export interface DemandGenProgramProperties {
    /** Type of demand generation program */
    program_type?: string;
    /** Budget allocated in base currency units */
    budget?: number;
    /** Target number of leads to generate */
    target_leads?: number;
    /** Current status of the program */
    program_status?: 'planned' | 'active' | 'completed' | 'paused';
}
/** Properties for the Territory entity */
export interface TerritoryProperties {
    /** How the territory is defined */
    territory_type?: 'geographic' | 'vertical' | 'account_based' | 'named';
    /** Geographic region (if applicable) */
    region?: string;
    /** Sales rep assigned to this territory */
    assigned_rep?: string;
    /** Revenue quota in base currency units */
    quota?: number;
}
/** Properties for the Team entity */
export interface TeamProperties {
    /** Team topology classification */
    team_type?: 'product' | 'eng' | 'design' | 'growth' | 'cs';
    /** Number of team members */
    size?: number;
    /** Team mission statement */
    mission?: string;
    /** Team lead or manager */
    lead?: string;
}
/** Properties for the Role entity */
export interface RoleProperties {
    /** Title of the role */
    role_title?: string;
    /** Key responsibilities of this role */
    responsibilities?: string[];
    /** What this role is directly responsible for */
    dri_for?: string;
}
/** Properties for the Stakeholder entity */
export interface StakeholderProperties {
    /** Classification of the stakeholder */
    stakeholder_type?: 'internal' | 'external' | 'investor' | 'regulator';
    /** Level of influence this stakeholder has */
    influence?: 'high' | 'medium' | 'low';
    /** Level of interest this stakeholder has */
    interest?: 'high' | 'medium' | 'low';
}
/** Properties for the ProductDecision entity */
export interface ProductDecisionProperties {
    /** Type of decision being made */
    decision_type?: string;
    /** Options that were considered */
    options_considered?: string[];
    /** The option that was chosen */
    chosen_option?: string;
    /** Why this option was selected */
    rationale?: string;
    /** Who made the decision */
    made_by?: string;
}
/** Properties for the TeamOkr entity */
export interface TeamOkrProperties {
    /** Time period for this OKR (e.g. "Q1 2026") */
    period?: string;
    /** The objective statement */
    okr_objective?: string;
    /** List of key results */
    okr_key_results?: string[];
    /** Overall progress as a decimal (0.0 to 1.0) */
    progress?: number;
}
/** Properties for the Retrospective entity */
export interface RetrospectiveProperties {
    /** Retrospective format used (e.g. "start-stop-continue") */
    format?: string;
    /** Time period covered by this retro */
    period?: string;
    /** Key learnings from the retrospective */
    key_learnings?: string[];
    /** Action items arising from the retrospective */
    action_items?: string[];
}
/** Properties for the Dependency entity */
export interface DependencyProperties {
    /** How critical this dependency is */
    dependency_type?: 'blocks' | 'enables' | 'informs';
    /** Team that has the dependency */
    from_team?: string;
    /** Team that must fulfil the dependency */
    to_team?: string;
    /** How the dependency was or will be resolved */
    resolution?: string;
}
/** Properties for the Department entity */
export interface DepartmentProperties {
    /** Head of the department */
    department_head?: string;
    /** Number of people in the department */
    headcount?: number;
    /** Department budget in base currency units */
    budget?: number;
}
/** Properties for the Skill entity */
export interface SkillProperties {
    /** Category or domain of the skill */
    skill_category?: string;
    /** Description of proficiency levels */
    proficiency_levels?: string;
}
/** Properties for the Ceremony entity */
export interface CeremonyProperties {
    /** Type of team ceremony */
    ceremony_type?: 'standup' | 'planning' | 'review' | 'retro' | 'sync' | 'demo' | 'other';
    /** How often this ceremony occurs (e.g. "weekly") */
    cadence?: string;
    /** Duration of the ceremony in minutes */
    duration_minutes?: number;
    /** Comma-separated list of participants or roles */
    participants?: string;
}
/** Properties for the CapacityPlan entity */
export interface CapacityPlanProperties {
    /** Time period for this capacity plan (e.g. "Q2 2026") */
    plan_period?: string;
    /** Total available capacity (in story points, hours, etc.) */
    total_capacity?: number;
    /** Capacity already allocated */
    allocated?: number;
    /** Remaining available capacity */
    available?: number;
}
/** Properties for the DataSource entity */
export interface DataSourceProperties {
    /** Type of data source */
    source_type?: 'database' | 'api' | 'event_stream' | 'warehouse';
    /** Current connection status */
    connection_status?: 'connected' | 'disconnected' | 'error';
    /** How often data is refreshed (e.g. "every 15 minutes") */
    refresh_cadence?: string;
}
/** Properties for the MetricDefinition entity */
export interface MetricDefinitionProperties {
    /** Formula or calculation for this metric */
    formula?: string;
    /** Person or team that owns this metric */
    owner?: string;
    /** How often this metric is refreshed */
    refresh_cadence?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
}
/** Properties for the EventSchema entity */
export interface EventSchemaProperties {
    /** Name of the analytics event */
    event_name: string;
    /** List of property names attached to this event */
    properties?: string[];
    /** Description of what triggers this event */
    trigger_description?: string;
}
/** Properties for the Dashboard entity */
export interface DashboardProperties {
    /** Analytics tool hosting this dashboard */
    tool?: 'looker' | 'amplitude' | 'mixpanel' | 'posthog' | 'custom';
    /** URL of the dashboard */
    url?: string;
    /** Intended audience for this dashboard */
    audience?: string;
}
/** Properties for the AbTest entity */
export interface AbTestProperties {
    /** List of variant names in this test */
    variants?: string[];
    /** Required sample size for statistical significance */
    sample_size?: number;
    /** Statistical significance threshold (e.g. 0.95) */
    significance_threshold?: number;
    /** Current result of the test */
    result?: 'winner_a' | 'winner_b' | 'inconclusive' | 'pending';
}
/** Properties for the DataModel entity */
export interface DataModelProperties {
    /** Name of the schema or database */
    schema_name?: string;
    /** Number of tables or collections in this model */
    table_count?: number;
    /** Type of data model */
    model_type?: 'relational' | 'document' | 'graph' | 'time_series';
}
/** Properties for the DataQualityRule entity */
export interface DataQualityRuleProperties {
    /** Type of data quality rule */
    rule_type?: 'completeness' | 'accuracy' | 'freshness' | 'uniqueness' | 'consistency';
    /** Threshold for this rule (e.g. "99.5%") */
    threshold?: string;
    /** Whether to alert when the threshold is breached */
    alert_on_breach?: boolean;
}
/** Properties for the DataProduct entity */
export interface DataProductProperties {
    /** Type of data product */
    data_product_type?: string;
    /** Freshness SLA (e.g. "< 1 hour") */
    sla_freshness?: string;
    /** Person or team that owns this data product */
    owner?: string;
    /** Downstream consumers of this data product */
    consumers?: string;
}
/** Properties for the DataPipeline entity */
export interface DataPipelineProperties {
    /** Current status of the pipeline */
    pipeline_status?: 'active' | 'paused' | 'failed' | 'deprecated';
    /** Cron or schedule expression */
    schedule?: string;
    /** Source system or table */
    source?: string;
    /** Destination system or table */
    destination?: string;
    /** Average runtime (e.g. "12 minutes") */
    avg_runtime?: string;
}
/** Properties for the DataLineage entity */
export interface DataLineageProperties {
    /** Upstream data source or table */
    upstream?: string;
    /** Downstream data source or table */
    downstream?: string;
    /** Description of the transformation applied */
    transformation?: string;
}
/** Properties for the GlossaryTerm entity */
export interface GlossaryTermProperties {
    /** Definition of the term */
    term_definition?: string;
    /** Person or team that owns this term's definition */
    owner?: string;
    /** Alternative names or synonyms for this term */
    synonyms?: string;
}
/** Properties for the DataDomain entity */
export interface DataDomainProperties {
    /** Person or team that owns this data domain */
    domain_owner?: string;
    /** Number of datasets in this domain */
    dataset_count?: number;
    /** Number of data products in this domain */
    data_product_count?: number;
}
/** Properties for the Report entity */
export interface ReportProperties {
    /** Type of report */
    report_type?: string;
    /** Delivery schedule (e.g. "weekly on Monday") */
    schedule?: string;
    /** Who receives this report */
    recipients?: string;
    /** Tool used to generate this report */
    tool?: string;
}
//# sourceMappingURL=business.d.ts.map