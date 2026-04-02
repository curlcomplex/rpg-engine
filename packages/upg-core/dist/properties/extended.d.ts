/**
 * UPG Property Schemas — EXTENDED Domains
 *
 * Typed property interfaces for all EXTENDED entity types in the
 * Unified Product Graph specification.
 */
import type { Priority, RAGStatus } from './core.js';
/** Properties for an Account entity — company or organisation in the CRM */
export interface AccountProperties {
    account_type?: 'prospect' | 'customer' | 'partner' | 'churned';
    industry?: string;
    employee_count?: number;
    annual_revenue?: number;
}
/** Properties for a Contact entity — individual person linked to an account */
export interface ContactProperties {
    contact_role?: string;
    email?: string;
    phone?: string;
    is_decision_maker?: boolean;
}
/** Properties for a Lead entity — inbound or outbound sales lead */
export interface LeadProperties {
    lead_source?: string;
    lead_score?: number;
    lead_status?: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
    qualification_status?: 'mql' | 'sql' | 'pql' | 'unqualified';
}
/** Properties for a Deal entity — single sales opportunity */
export interface DealProperties {
    deal_stage?: string;
    deal_value?: number;
    close_date?: string;
    probability?: number;
    owner?: string;
}
/** Properties for a Pipeline (Sales) entity — aggregate sales pipeline */
export interface PipelineSalesProperties {
    pipeline_type?: string;
    total_value?: number;
    deal_count?: number;
    avg_cycle_days?: number;
}
/** Properties for a Pipeline Stage entity — one stage within a pipeline */
export interface PipelineStageProperties {
    stage_order?: number;
    conversion_rate?: number;
    avg_days_in_stage?: number;
}
/** Properties for a Quote Document entity — formal price quote */
export interface QuoteDocumentProperties {
    quote_status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
    total_amount?: number;
    valid_until?: string;
    currency?: string;
}
/** Properties for a Subscription entity — recurring billing subscription */
export interface SubscriptionProperties {
    plan?: string;
    mrr?: number;
    start_date?: string;
    renewal_date?: string;
    subscription_status?: 'active' | 'trial' | 'past_due' | 'canceled' | 'expired';
}
/** Properties for an Invoice entity — billing invoice */
export interface InvoiceProperties {
    invoice_status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'voided';
    amount?: number;
    due_date?: string;
    currency?: string;
}
/** Properties for a Forecast entity — revenue forecast */
export interface ForecastProperties {
    forecast_period?: string;
    predicted_revenue?: number;
    confidence?: number;
    methodology?: string;
}
/** Properties for a Program entity — strategic programme of work */
export interface ProgramProperties {
    program_status?: 'planned' | 'active' | 'on_hold' | 'completed' | 'canceled';
    start_date?: string;
    end_date?: string;
    budget?: number;
    sponsor?: string;
}
/** Properties for a Project entity — discrete project within a programme */
export interface ProjectProperties {
    project_status?: 'planned' | 'active' | 'on_hold' | 'completed' | 'canceled';
    start_date?: string;
    end_date?: string;
    methodology?: 'agile' | 'waterfall' | 'kanban' | 'hybrid';
}
/** Properties for a Milestone entity — key checkpoint or deadline */
export interface MilestoneProperties {
    due_date?: string;
    milestone_status?: 'upcoming' | 'hit' | 'missed' | 'at_risk';
    deliverables?: string;
}
/** Properties for a Risk Register entity — aggregate risk register */
export interface RiskRegisterProperties {
    risk_count?: number;
    high_risks?: number;
    last_reviewed?: string;
}
/** Properties for a Risk Item entity — individual identified risk */
export interface RiskItemProperties {
    risk_category?: string;
    probability?: 'high' | 'medium' | 'low';
    impact?: 'high' | 'medium' | 'low';
    mitigation_strategy?: string;
    owner?: string;
}
/** Properties for a Change Request entity — formal scope/schedule/budget change */
export interface ChangeRequestProperties {
    change_type?: 'scope' | 'schedule' | 'budget' | 'resource' | 'requirements';
    change_status?: 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'implemented';
    priority?: Priority;
    impact_assessment?: string;
    requester?: string;
}
/** Properties for a Deliverable entity — tangible output of a project */
export interface DeliverableProperties {
    deliverable_type?: string;
    due_date?: string;
    deliverable_status?: 'not_started' | 'in_progress' | 'in_review' | 'accepted';
    acceptance_criteria?: string;
}
/** Properties for a Resource Allocation entity — person, team, or budget allocation */
export interface ResourceAllocationProperties {
    resource_type?: 'person' | 'team' | 'budget' | 'tool';
    allocation_percentage?: number;
    start_date?: string;
    end_date?: string;
}
/** Properties for a Status Report entity — periodic project health report */
export interface StatusReportProperties {
    report_period?: string;
    overall_status?: RAGStatus;
    risks_flagged?: number;
    blockers?: string;
}
/** Properties for a Marketing Strategy entity — top-level marketing approach */
export interface MarketingStrategyProperties {
    approach?: 'inbound' | 'outbound' | 'product_led' | 'community' | 'hybrid';
    annual_budget?: number;
    primary_goal?: string;
}
/** Properties for a Marketing Channel entity — single marketing channel */
export interface MarketingChannelProperties {
    channel_type?: 'social' | 'email' | 'seo' | 'sem' | 'content' | 'events' | 'other';
    monthly_budget?: number;
    roi?: number;
    channel_status?: 'active' | 'paused' | 'testing' | 'deprecated';
}
/** Properties for a Marketing Campaign Plan entity — planned or active campaign */
export interface MarketingCampaignPlanProperties {
    brief?: string;
    budget?: number;
    start_date?: string;
    end_date?: string;
    target_audience?: string;
    campaign_status?: 'planning' | 'active' | 'completed' | 'paused';
}
/** Properties for an Email Sequence entity — automated email series */
export interface EmailSequenceProperties {
    sequence_type?: 'onboarding' | 'nurture' | 're_engagement' | 'sales' | 'other';
    email_count?: number;
    open_rate?: number;
    click_rate?: number;
}
/** Properties for a Social Post entity — individual social media post */
export interface SocialPostProperties {
    platform?: 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'tiktok' | 'other';
    post_type?: 'text' | 'image' | 'video' | 'carousel' | 'story';
    scheduled_date?: string;
    post_status?: 'draft' | 'scheduled' | 'published' | 'archived';
}
/** Properties for an SEO Keyword entity — tracked search keyword */
export interface SeoKeywordProperties {
    keyword: string;
    search_volume?: number;
    difficulty?: number;
    intent?: 'informational' | 'navigational' | 'commercial' | 'transactional';
    current_rank?: number;
    target_rank?: number;
}
/** Properties for an Ad Creative entity — paid advertising creative */
export interface AdCreativeProperties {
    platform?: 'google' | 'meta' | 'linkedin' | 'twitter' | 'other';
    ad_format?: 'search' | 'display' | 'video' | 'native' | 'social';
    headline?: string;
    cta?: string;
    spend?: number;
    impressions?: number;
    clicks?: number;
}
/** Properties for a Press Release entity — PR distribution */
export interface PressReleaseProperties {
    pr_type?: 'product_launch' | 'partnership' | 'funding' | 'milestone' | 'other';
    publish_date?: string;
    outlets?: string[];
    pr_status?: 'draft' | 'approved' | 'distributed' | 'published';
}
/** Properties for an Event entity — conference, webinar, or meetup */
export interface EventProperties {
    event_type?: 'conference' | 'webinar' | 'meetup' | 'workshop' | 'trade_show' | 'other';
    event_date?: string;
    location?: string;
    attendee_count?: number;
    event_status?: 'planning' | 'upcoming' | 'live' | 'completed' | 'canceled';
}
/** Properties for a Community Initiative entity — community engagement effort */
export interface CommunityInitiativeProperties {
    initiative_type?: 'forum' | 'discord' | 'slack' | 'meetup' | 'ambassador' | 'other';
    member_count?: number;
    engagement_rate?: number;
    initiative_status?: 'planning' | 'active' | 'paused' | 'sunset';
}
/** Properties for a Locale entity — supported language/region */
export interface LocaleProperties {
    language_code: string;
    region_code?: string;
    is_default?: boolean;
    locale_status?: 'active' | 'beta' | 'planned' | 'deprecated';
    translation_coverage?: number;
}
/** Properties for a Translation Key entity — single translatable string */
export interface TranslationKeyProperties {
    key_path: string;
    source_text?: string;
    context_hint?: string;
    max_length?: number;
}
/** Properties for a Translation Bundle entity — group of translation keys */
export interface TranslationBundleProperties {
    bundle_scope?: string;
    key_count?: number;
    completion_pct?: number;
    last_synced?: string;
}
/** Properties for a Locale Config entity — regional formatting rules */
export interface LocaleConfigProperties {
    date_format?: string;
    number_format?: string;
    currency?: string;
    text_direction?: 'ltr' | 'rtl';
    timezone?: string;
}
/** Properties for a Cultural Adaptation entity — market-specific content adaptation */
export interface CulturalAdaptationProperties {
    adaptation_type?: 'content' | 'imagery' | 'ux' | 'legal' | 'payment';
    target_market?: string;
    rationale?: string;
}
/** Properties for a Regional Pricing entity — locale-specific pricing override */
export interface RegionalPricingProperties {
    currency?: string;
    price_override?: number;
    ppp_factor?: number;
    effective_date?: string;
}
/** Properties for an Education Program entity — structured learning programme */
export interface EducationProgramProperties {
    program_type?: 'onboarding' | 'certification' | 'ongoing' | 'partner';
    audience?: string;
    program_status?: 'planning' | 'active' | 'paused' | 'retired';
}
/** Properties for a Tutorial entity — step-by-step learning content */
export interface TutorialProperties {
    tutorial_format?: 'written' | 'video' | 'interactive' | 'code_along';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    duration_minutes?: number;
    completion_rate?: number;
}
/** Properties for a Walkthrough entity — in-product guided experience */
export interface WalkthroughProperties {
    walkthrough_type?: 'product_tour' | 'feature_intro' | 'tooltip_sequence' | 'checklist';
    step_count?: number;
    trigger?: string;
    completion_rate?: number;
}
/** Properties for a Webinar entity — live or recorded educational session */
export interface WebinarProperties {
    webinar_type?: 'live' | 'recorded' | 'hybrid';
    scheduled_date?: string;
    duration_minutes?: number;
    registrations?: number;
    attendance?: number;
}
/** Properties for a Certification entity — formal credential */
export interface CertificationProperties {
    cert_level?: 'foundation' | 'practitioner' | 'expert';
    requirements?: string[];
    validity_months?: number;
    holders?: number;
}
/** Properties for a Help Video entity — short-form support video */
export interface HelpVideoProperties {
    video_type?: 'how_to' | 'overview' | 'troubleshooting' | 'best_practice';
    duration_seconds?: number;
    views?: number;
    url?: string;
}
/** Properties for a Learning Path entity — ordered sequence of learning items */
export interface LearningPathProperties {
    path_difficulty?: 'beginner' | 'intermediate' | 'advanced';
    item_count?: number;
    estimated_hours?: number;
    completion_rate?: number;
}
/** Properties for a Partner Program entity — structured partner programme */
export interface PartnerProgramProperties {
    program_type?: 'referral' | 'reseller' | 'technology' | 'consulting' | 'marketplace';
    program_status?: 'planning' | 'active' | 'paused' | 'sunset';
    partner_count?: number;
}
/** Properties for a Partner Tier entity — level within a partner programme */
export interface PartnerTierProperties {
    tier_name?: string;
    tier_level?: number;
    requirements?: string[];
    benefits?: string[];
}
/** Properties for an API Ecosystem entity — developer API surface */
export interface ApiEcosystemProperties {
    api_style?: 'rest' | 'graphql' | 'grpc' | 'webhook' | 'mixed';
    developer_count?: number;
    app_count?: number;
    ecosystem_status?: 'alpha' | 'beta' | 'ga' | 'deprecated';
}
/** Properties for a Marketplace Listing entity — app/plugin listing */
export interface MarketplaceListingProperties {
    listing_type?: 'app' | 'integration' | 'template' | 'plugin';
    installs?: number;
    rating?: number;
    listing_status?: 'draft' | 'in_review' | 'published' | 'suspended';
}
/** Properties for a Developer Portal entity — developer documentation site */
export interface DeveloperPortalProperties {
    portal_url?: string;
    doc_count?: number;
    sandbox_available?: boolean;
    portal_status?: 'active' | 'maintenance' | 'deprecated';
}
/** Properties for an Integration Partner entity — specific integration partner */
export interface IntegrationPartnerProperties {
    partner_name?: string;
    integration_type?: 'native' | 'webhook' | 'api' | 'embedded';
    partner_status?: 'exploring' | 'developing' | 'live' | 'deprecated';
}
/** Properties for a Partner Revenue Share entity — revenue sharing arrangement */
export interface PartnerRevenueShareProperties {
    share_model?: 'percentage' | 'flat_fee' | 'tiered' | 'hybrid';
    share_percentage?: number;
    annual_revenue?: number;
}
//# sourceMappingURL=extended.d.ts.map