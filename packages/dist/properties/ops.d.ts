/**
 * UPG Property Schemas — OPS, INFRASTRUCTURE & EXTENDED Domains
 *
 * Typed property interfaces for operational, infrastructure, and extended
 * entity types:
 * - Operations & Customer Success
 * - Content & Knowledge
 * - Legal, Compliance & Risk
 * - DevOps & Platform
 * - Security
 * - Accessibility
 * - QA & Testing
 * - Feedback & VoC
 * - Pricing & Packaging
 * - AI/ML Operations
 * - Agentic Workflows
 * - Sales & Revenue (Extended)
 * - Program Management (Extended)
 * - Marketing Operations (Extended)
 * - Localisation & i18n (Extended)
 * - Customer Education (Extended)
 * - Partners & Ecosystem (Extended)
 *
 * Part of the Unified Product Graph specification.
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
import type { Priority, RAGStatus } from './core.js';
/** Properties for a support ticket */
export interface SupportTicketProperties {
    /** Classification of the ticket */
    ticket_type?: 'bug' | 'question' | 'feature_request';
    /** Urgency level of the ticket */
    severity?: 'critical' | 'high' | 'medium' | 'low';
    /** How the ticket was resolved */
    resolution?: string;
    /** Channel or system the ticket originated from */
    source?: string;
    /** Emotional tone of the signal */
    signal_sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
    /** Channel that produced this signal */
    signal_channel?: string;
    /** Unified urgency across signal types */
    signal_urgency?: 'low' | 'medium' | 'high' | 'critical';
}
/** Properties for customer feedback */
export interface CustomerFeedbackProperties {
    /** Classification of the feedback */
    feedback_type?: 'survey' | 'interview' | 'review' | 'nps';
    /** Emotional tone of the feedback */
    sentiment?: 'positive' | 'neutral' | 'negative';
    /** Exact customer quote or text */
    verbatim?: string;
    /** Emotional tone of the signal */
    signal_sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
    /** Channel that produced this signal */
    signal_channel?: string;
    /** Unified urgency across signal types */
    signal_urgency?: 'low' | 'medium' | 'high' | 'critical';
}
/** Properties for a churn reason */
export interface ChurnReasonProperties {
    /** High-level category of the churn reason */
    category?: string;
    /** How often this reason is cited */
    frequency?: number;
    /** Other factors that contributed to churn */
    contributing_factors?: string[];
    /** Emotional tone of the signal */
    signal_sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
    /** Channel that produced this signal */
    signal_channel?: string;
    /** Unified urgency across signal types */
    signal_urgency?: 'low' | 'medium' | 'high' | 'critical';
}
/** Properties for an onboarding flow */
export interface OnboardingFlowProperties {
    /** Ordered steps in the onboarding flow */
    steps?: string[];
    /** Percentage of users who complete the full flow */
    completion_rate?: number;
    /** Step where most users abandon the flow */
    drop_off_step?: string;
    /** Typical duration to reach first value (e.g. "3 days") */
    time_to_value?: string;
}
/** Properties for a customer health score */
export interface CustomerHealthScoreProperties {
    /** Individual score components (e.g. "usage", "support", "nps") */
    components?: string[];
    /** Aggregated health score */
    overall_score?: number;
    /** Risk classification based on the score */
    risk_level?: 'healthy' | 'at_risk' | 'red';
    /** Direction of score movement */
    trend?: 'improving' | 'stable' | 'declining';
}
/** Properties for a customer success playbook */
export interface PlaybookProperties {
    /** Category of playbook */
    playbook_type?: 'onboarding' | 'expansion' | 'renewal' | 'rescue' | 'other';
    /** Event or condition that triggers playbook execution */
    trigger?: string;
    /** Ordered steps in the playbook */
    playbook_steps?: string[];
}
/** Properties for a service-level agreement */
export interface SlaProperties {
    /** The metric being measured (e.g. "first response time") */
    metric?: string;
    /** Target value for the metric (e.g. "< 4 hours") */
    target?: string;
    /** Time window for measurement (e.g. "monthly") */
    measurement_window?: string;
    /** What happens if the SLA is breached */
    consequence_of_breach?: string;
}
/** Properties for a customer journey stage */
export interface CustomerJourneyStageProperties {
    /** Pirate metrics / AARRR stage */
    stage_type?: 'awareness' | 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral';
    /** Average time a customer spends in this stage */
    avg_duration?: string;
    /** Percentage of customers that move to the next stage */
    conversion_rate?: number;
}
/** Properties for a customer touchpoint */
export interface TouchpointProperties {
    /** Communication channel (e.g. "email", "in-app", "phone") */
    touchpoint_channel?: string;
    /** Whether the interaction is initiated by us or the customer */
    touchpoint_type?: 'reactive' | 'proactive' | 'automated';
    /** CSAT score associated with this touchpoint */
    satisfaction_score?: number;
}
/** Properties for a customer success milestone */
export interface SuccessMilestoneProperties {
    /** Category of the milestone */
    milestone_type?: 'adoption' | 'expansion' | 'renewal' | 'advocacy';
    /** ISO date the milestone is targeted for */
    target_date?: string;
    /** Current achievement status */
    milestone_status?: 'pending' | 'achieved' | 'missed';
}
/** Properties for a service blueprint */
export interface ServiceBlueprintProperties {
    /** Area of the service being mapped */
    blueprint_scope?: string;
    /** Number of customer-facing steps */
    frontstage_steps?: number;
    /** Number of behind-the-scenes steps */
    backstage_steps?: number;
}
/** Properties for an NPS score record */
export interface NpsScoreProperties {
    /** Net Promoter Score value (-100 to 100) */
    score?: number;
    /** ISO date of the survey */
    survey_date?: string;
    /** Total number of responses */
    response_count?: number;
    /** Number of promoters (9-10) */
    promoters?: number;
    /** Number of detractors (0-6) */
    detractors?: number;
    /** Emotional tone of the signal */
    signal_sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
    /** Channel that produced this signal */
    signal_channel?: string;
    /** Unified urgency across signal types */
    signal_urgency?: 'low' | 'medium' | 'high' | 'critical';
}
/** Properties for a content piece */
export interface ContentPieceProperties {
    /** Format of the content */
    content_type?: 'blog' | 'video' | 'podcast' | 'whitepaper' | 'case_study' | 'other';
    /** Lifecycle status of the content */
    content_status?: 'draft' | 'review' | 'published' | 'archived';
    /** Marketing funnel stage this content targets */
    funnel_stage?: 'tofu' | 'mofu' | 'bofu';
    /** URL where the content is published */
    url?: string;
}
/** Properties for a knowledge base article */
export interface KnowledgeBaseArticleProperties {
    /** Intended audience for the article */
    audience?: 'customer' | 'internal' | 'developer' | 'admin';
    /** Product features this article relates to */
    related_features?: string[];
    /** URL of the article */
    url?: string;
}
/** Properties for a brand asset */
export interface BrandAssetProperties {
    /** Type of brand asset */
    asset_type?: 'logo' | 'icon' | 'illustration' | 'photo' | 'video' | 'template';
    /** URL where the asset is stored */
    url?: string;
    /** Licensing or usage restrictions */
    usage_rights?: string;
}
/** Properties for an internal document */
export interface InternalDocProperties {
    /** Category of internal document */
    doc_type?: 'rfc' | 'runbook' | 'guide' | 'spec' | 'onboarding' | 'other';
    /** Person or team that owns the document */
    owner?: string;
    /** URL of the document */
    url?: string;
}
/** Properties for a prompt template */
export interface PromptTemplateProperties {
    /** What the prompt is designed for */
    use_case?: string;
    /** AI model the prompt is designed for */
    model?: string;
    /** Template variables (e.g. "{{context}}", "{{question}}") */
    variables?: string[];
    /** Version identifier */
    version?: string;
}
/** Properties for a content calendar */
export interface ContentCalendarProperties {
    /** Time period covered (e.g. "Q1 2026") */
    calendar_period?: string;
    /** Number of content pieces planned */
    content_count?: number;
    /** Publishing frequency (e.g. "2x/week") */
    publish_cadence?: string;
}
/** Properties for a content theme */
export interface ContentThemeProperties {
    /** Category or pillar the theme belongs to */
    theme_category?: string;
    /** Target persona for this theme */
    target_persona?: string;
    /** Number of content pieces under this theme */
    content_count?: number;
}
/** Properties for a documentation template */
export interface DocumentationTemplateProperties {
    /** Type of template (e.g. "API reference", "how-to guide") */
    template_type?: string;
    /** Expected sections in the template */
    sections?: string;
    /** Version identifier */
    version?: string;
}
/** Properties for a compliance requirement */
export interface ComplianceRequirementProperties {
    /** Regulatory framework */
    regulation?: 'gdpr' | 'ccpa' | 'hipaa' | 'soc2' | 'iso27001' | 'pci_dss' | 'other';
    /** Current compliance status */
    compliance_status?: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable';
    /** Person or team responsible */
    owner?: string;
}
/** Properties for a risk */
export interface RiskProperties {
    /** Category of risk */
    risk_type?: 'technical' | 'business' | 'legal' | 'security' | 'operational';
    /** Likelihood of the risk materialising */
    probability?: 'high' | 'medium' | 'low';
    /** Severity if the risk materialises */
    impact?: 'high' | 'medium' | 'low';
    /** Planned mitigation strategy */
    mitigation?: string;
}
/** Properties for a data contract */
export interface DataContractProperties {
    /** Person or team that owns the data */
    owner?: string;
    /** How long data is retained (e.g. "90 days") */
    retention_period?: string;
    /** Policy for data deletion */
    deletion_policy?: string;
    /** Whether data is shared with third parties */
    third_party_sharing?: boolean;
}
/** Properties for a legal entity */
export interface LegalEntityProperties {
    /** Corporate structure type */
    entity_type?: 'corporation' | 'llc' | 'partnership' | 'sole_proprietor' | 'nonprofit';
    /** Legal jurisdiction */
    jurisdiction?: string;
    /** IP ownership model */
    ip_ownership?: string;
}
/** Properties for an intellectual property asset */
export interface IpAssetProperties {
    /** Type of IP */
    asset_type?: 'patent' | 'trademark' | 'copyright' | 'trade_secret';
    /** Filing / registration status */
    ip_status?: 'filed' | 'pending' | 'granted' | 'expired' | 'abandoned';
    /** Jurisdiction where the IP is registered */
    jurisdiction?: string;
}
/** Properties for an audit log policy */
export interface AuditLogPolicyProperties {
    /** What the policy covers */
    scope?: string;
    /** How long audit logs are retained */
    retention_days?: number;
    /** Types of events being tracked */
    events_tracked?: string[];
}
/** Properties for a contract */
export interface ContractProperties {
    /** Category of contract */
    contract_type?: 'service' | 'employment' | 'nda' | 'license' | 'partnership' | 'other';
    /** Lifecycle status of the contract */
    contract_status?: 'draft' | 'in_review' | 'signed' | 'active' | 'expired' | 'terminated';
    /** ISO date when the contract starts */
    start_date?: string;
    /** ISO date when the contract ends */
    end_date?: string;
    /** Monetary value of the contract */
    value?: number;
}
/** Properties for a contract clause */
export interface ContractClauseProperties {
    /** Type of clause (e.g. "liability", "termination") */
    clause_type?: string;
    /** Whether the clause can be renegotiated */
    is_negotiable?: boolean;
    /** Risk level if the clause is unfavourable */
    risk_level?: 'high' | 'medium' | 'low';
}
/** Properties for a privacy policy */
export interface PrivacyPolicyProperties {
    /** Version identifier of the policy */
    policy_version?: string;
    /** ISO date of last update */
    last_updated?: string;
    /** Whether the policy covers GDPR requirements */
    covers_gdpr?: boolean;
    /** Whether the policy covers CCPA requirements */
    covers_ccpa?: boolean;
}
/** Properties for a compliance framework */
export interface ComplianceFrameworkProperties {
    /** Name of the framework (e.g. "SOC 2 Type II") */
    framework_name?: string;
    /** Current certification status */
    certification_status?: 'not_started' | 'in_progress' | 'certified' | 'expired';
    /** ISO date of the last audit */
    audit_date?: string;
    /** ISO date of the next scheduled audit */
    next_audit?: string;
}
/** Properties for a security audit */
export interface SecurityAuditProperties {
    /** What the audit covers */
    audit_scope?: string;
    /** Current audit status */
    audit_status?: 'scheduled' | 'in_progress' | 'completed';
    /** Total number of findings */
    findings_count?: number;
    /** Number of critical-severity findings */
    critical_findings?: number;
}
/** Properties for a Service Level Indicator */
export interface SliProperties {
    /** Name of the metric being measured */
    metric_name?: string;
    /** Threshold value that defines "good" */
    threshold?: number;
    /** Current observed value */
    current_value?: number;
}
/** Properties for a Service Level Objective */
export interface SloProperties {
    /** Target percentage (e.g. 99.9) */
    target_percentage?: number;
    /** Measurement window (e.g. "30 days") */
    window?: string;
    /** Current achieved percentage */
    current_percentage?: number;
}
/** Properties for an error budget */
export interface ErrorBudgetProperties {
    /** Remaining budget as a percentage */
    budget_remaining?: number;
    /** Current rate of budget consumption */
    burn_rate?: number;
    /** Policy when budget is exhausted */
    policy?: string;
}
/** Properties for an incident */
export interface IncidentProperties {
    /** Severity classification */
    severity_level?: 'sev1' | 'sev2' | 'sev3' | 'sev4';
    /** ISO timestamp when the incident started */
    started_at?: string;
    /** ISO timestamp when the incident was resolved */
    resolved_at?: string;
    /** Identified root cause */
    root_cause?: string;
}
/** Properties for a postmortem */
export interface PostmortemProperties {
    /** Reference to the related incident */
    incident_ref?: string;
    /** Chronological timeline of the incident */
    timeline?: string;
    /** Follow-up actions to prevent recurrence */
    action_items?: string;
}
/** Properties for a runbook */
export interface RunbookProperties {
    /** Event or alert that triggers runbook execution */
    trigger?: string;
    /** Ordered steps to follow */
    steps?: string;
    /** ISO date when the runbook was last tested */
    last_tested?: string;
}
/** Properties for a monitor */
export interface MonitorProperties {
    /** What the monitor measures */
    monitor_type?: 'uptime' | 'latency' | 'error_rate' | 'throughput' | 'custom';
    /** The service or endpoint being monitored */
    target?: string;
    /** Threshold that triggers an alert */
    threshold?: string;
    /** Where alerts are sent (e.g. "slack:#ops-alerts") */
    alert_channel?: string;
}
/** Properties for an alert rule */
export interface AlertRuleProperties {
    /** Condition that triggers the alert */
    condition?: string;
    /** Severity of the alert */
    severity?: 'critical' | 'warning' | 'info';
    /** Where notifications are sent */
    notification_channel?: string;
}
/** Properties for a CI pipeline */
export interface CiPipelineProperties {
    /** Type of pipeline */
    pipeline_type?: 'build' | 'test' | 'deploy' | 'release' | 'full';
    /** What triggers the pipeline */
    trigger?: string;
    /** Average run duration */
    avg_duration?: string;
}
/** Properties for a release strategy */
export interface ReleaseStrategyProperties {
    /** Deployment strategy type */
    strategy_type?: 'blue_green' | 'canary' | 'rolling' | 'recreate' | 'feature_flag';
    /** Percentage of traffic routed to canary */
    canary_percentage?: number;
    /** Conditions that trigger a rollback */
    rollback_criteria?: string;
}
/** Properties for an on-call rotation */
export interface OnCallRotationProperties {
    /** Rotation schedule description */
    schedule?: string;
    /** How escalations are handled */
    escalation_policy?: string;
    /** Reference to the team on rotation */
    team_ref?: string;
}
/** Properties for an infrastructure component */
export interface InfrastructureComponentProperties {
    /** Type of infrastructure */
    component_type?: 'compute' | 'storage' | 'network' | 'database' | 'cdn' | 'queue' | 'other';
    /** Cloud or infrastructure provider */
    provider?: string;
    /** Deployment region */
    region?: string;
    /** Monthly cost in base currency */
    cost_monthly?: number;
}
/** Properties for a threat model */
export interface ThreatModelProperties {
    /** Methodology used for threat modelling */
    methodology?: 'stride' | 'dread' | 'pasta' | 'attack_tree' | 'other';
    /** Scope of the threat model */
    scope?: string;
    /** ISO date of last review */
    last_reviewed?: string;
}
/** Properties for a threat */
export interface ThreatProperties {
    /** Category of the threat */
    threat_category?: string;
    /** Likelihood of exploitation */
    likelihood?: 'high' | 'medium' | 'low';
    /** Impact if exploited */
    impact?: 'high' | 'medium' | 'low';
    /** STRIDE classification */
    stride_type?: 'spoofing' | 'tampering' | 'repudiation' | 'info_disclosure' | 'denial_of_service' | 'elevation_of_privilege';
}
/** Properties for a vulnerability */
export interface VulnerabilityProperties {
    /** CVE identifier */
    cve_id?: string;
    /** CVSS severity score (0.0 – 10.0) */
    cvss_score?: number;
    /** Component affected by the vulnerability */
    affected_component?: string;
    /** Current remediation status */
    remediation_status?: 'open' | 'in_progress' | 'mitigated' | 'resolved' | 'accepted';
}
/** Properties for a security control */
export interface SecurityControlProperties {
    /** Type of security control */
    control_type?: 'preventive' | 'detective' | 'corrective' | 'compensating';
    /** Implementation status */
    implementation_status?: 'planned' | 'in_progress' | 'implemented' | 'verified';
    /** How effective the control is */
    effectiveness?: 'high' | 'medium' | 'low';
}
/** Properties for a security policy */
export interface SecurityPolicyProperties {
    /** What the policy covers */
    policy_scope?: string;
    /** How often the policy is reviewed */
    review_cadence?: string;
    /** Person or team that owns the policy */
    owner?: string;
}
/** Properties for a security incident */
export interface SecurityIncidentProperties {
    /** Type of security incident */
    incident_type?: string;
    /** Severity classification */
    severity?: 'critical' | 'high' | 'medium' | 'low';
    /** ISO timestamp when the incident was detected */
    detected_at?: string;
    /** ISO timestamp when the incident was contained */
    contained_at?: string;
}
/** Properties for a penetration test */
export interface PenetrationTestProperties {
    /** Scope of the penetration test */
    test_type?: 'external' | 'internal' | 'web_app' | 'api' | 'mobile';
    /** What was tested */
    scope?: string;
    /** Total number of findings */
    findings_count?: number;
    /** Number of critical findings */
    critical_count?: number;
}
/** Properties for a security review */
export interface SecurityReviewProperties {
    /** Type of review performed */
    review_type?: 'code' | 'design' | 'architecture' | 'vendor';
    /** Who performed the review */
    reviewer?: string;
    /** Summary of findings */
    findings?: string;
}
/** Properties for a data classification */
export interface DataClassificationProperties {
    /** Classification level */
    classification_level?: 'public' | 'internal' | 'confidential' | 'restricted';
    /** How data at this level must be handled */
    handling_requirements?: string;
    /** Examples of data at this classification */
    examples?: string;
}
/** Properties for an access policy */
export interface AccessPolicyProperties {
    /** Resource being protected */
    resource?: string;
    /** Who or what is granted access */
    principal?: string;
    /** Level of access granted */
    permission_level?: 'read' | 'write' | 'admin' | 'custom';
    /** Conditions under which access is granted */
    condition?: string;
}
/** Properties for an accessibility standard */
export interface A11yStandardProperties {
    /** Name of the standard (e.g. "WCAG") */
    standard_name?: string;
    /** Version of the standard (e.g. "2.2") */
    version?: string;
    /** Target conformance level */
    conformance_level?: 'A' | 'AA' | 'AAA';
}
/** Properties for an accessibility guideline */
export interface A11yGuidelineProperties {
    /** WCAG principle */
    principle?: 'perceivable' | 'operable' | 'understandable' | 'robust';
    /** Guideline number (e.g. "1.4.3") */
    guideline_number?: string;
    /** Conformance level required */
    level?: 'A' | 'AA' | 'AAA';
}
/** Properties for an accessibility audit */
export interface A11yAuditProperties {
    /** Type of audit performed */
    audit_type?: 'automated' | 'manual' | 'assistive_tech' | 'expert';
    /** What was audited */
    scope?: string;
    /** Overall conformance result */
    conformance_result?: 'pass' | 'partial' | 'fail';
    /** Number of issues found */
    issues_found?: number;
}
/** Properties for an accessibility issue */
export interface A11yIssueProperties {
    /** Severity of the issue */
    issue_severity?: 'critical' | 'major' | 'minor';
    /** WCAG success criterion violated (e.g. "1.4.3") */
    wcag_criterion?: string;
    /** The element or component affected */
    affected_element?: string;
    /** How to fix the issue */
    remediation?: string;
}
/** Properties for an accessibility annotation */
export interface A11yAnnotationProperties {
    /** Type of annotation */
    annotation_type?: 'focus_order' | 'alt_text' | 'heading_level' | 'aria_label' | 'other';
    /** Component the annotation applies to */
    target_component?: string;
    /** The accessibility requirement */
    requirement?: string;
}
/** Properties for a test suite */
export interface TestSuiteProperties {
    /** Type of test suite */
    suite_type?: 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility';
    /** Number of tests in the suite */
    test_count?: number;
    /** Percentage of tests passing */
    pass_rate?: number;
    /** ISO date of last run */
    last_run?: string;
}
/** Properties for a test case */
export interface TestCaseProperties {
    /** How the test is executed */
    test_type?: 'manual' | 'automated' | 'exploratory';
    /** Importance of this test case */
    priority?: Priority;
    /** Conditions required before running */
    preconditions?: string;
    /** What a passing result looks like */
    expected_result?: string;
    /** Current execution status */
    test_status?: 'not_run' | 'pass' | 'fail' | 'blocked' | 'skipped';
}
/** Properties for a QA session */
export interface QaSessionProperties {
    /** Type of QA session */
    session_type?: 'exploratory' | 'regression' | 'smoke' | 'uat';
    /** Who performed the session */
    tester?: string;
    /** Duration of the session in minutes */
    duration_minutes?: number;
    /** Number of bugs found */
    bugs_found?: number;
}
/** Properties for a regression test */
export interface RegressionTestProperties {
    /** Scope of regression coverage */
    regression_scope?: string;
    /** Whether the test is automated */
    automated?: boolean;
    /** ISO date of last passing run */
    last_pass?: string;
    /** Number of failures in recent runs */
    failure_count?: number;
}
/** Properties for a test coverage report */
export interface TestCoverageReportProperties {
    /** Percentage of lines covered */
    line_coverage?: number;
    /** Percentage of branches covered */
    branch_coverage?: number;
    /** Percentage of functions covered */
    function_coverage?: number;
    /** ISO date of the report */
    report_date?: string;
}
/** Properties for a test environment */
export interface TestEnvironmentProperties {
    /** Type of environment */
    env_type?: 'local' | 'ci' | 'staging' | 'sandbox' | 'production_mirror';
    /** Current availability status */
    env_status?: 'available' | 'in_use' | 'maintenance' | 'unavailable';
    /** Configuration details */
    config?: string;
}
/** Properties for a defect report */
export interface DefectReportProperties {
    /** Severity of the defect */
    defect_severity?: 'critical' | 'major' | 'minor' | 'cosmetic';
    /** Current defect status */
    defect_status?: 'open' | 'in_progress' | 'fixed' | 'verified' | 'closed';
    /** How to reproduce the defect */
    steps_to_reproduce?: string;
    /** Version or environment where the defect was found */
    found_in?: string;
}
/** Properties for a feedback program */
export interface FeedbackProgramProperties {
    /** How feedback is collected */
    program_type?: 'continuous' | 'periodic' | 'event_triggered';
    /** Collection method (e.g. "in-app survey", "email") */
    collection_method?: string;
    /** Current status of the program */
    program_status?: 'active' | 'paused' | 'retired';
}
/** Properties for a feature request */
export interface FeatureRequestProperties {
    /** Where the request originated */
    request_source?: 'customer' | 'internal' | 'prospect' | 'support' | 'community';
    /** Number of upvotes */
    vote_count?: number;
    /** Current triage status */
    request_status?: 'new' | 'under_review' | 'planned' | 'in_progress' | 'shipped' | 'wont_do';
    /** Segment of the requester */
    requester_segment?: string;
    /** Emotional tone of the signal */
    signal_sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
    /** Channel that produced this signal */
    signal_channel?: string;
    /** Unified urgency across signal types */
    signal_urgency?: 'low' | 'medium' | 'high' | 'critical';
}
/** Properties for a feedback vote */
export interface FeedbackVoteProperties {
    /** Total number of votes */
    vote_count?: number;
    /** Segments of voters */
    voter_segments?: string[];
    /** Monthly recurring revenue impact */
    mrr_impact?: number;
}
/** Properties for an NPS campaign */
export interface NpsCampaignProperties {
    /** Type of NPS survey */
    campaign_type?: 'relationship' | 'transactional' | 'feature';
    /** ISO date the campaign was sent */
    send_date?: string;
    /** Number of responses received */
    response_count?: number;
    /** Resulting NPS score */
    nps_result?: number;
    /** Percentage of promoters */
    promoters_pct?: number;
    /** Percentage of detractors */
    detractors_pct?: number;
}
/** Properties for a user advisory board */
export interface UserAdvisoryBoardProperties {
    /** Number of board members */
    member_count?: number;
    /** How often the board meets */
    meeting_cadence?: string;
    /** Primary focus area */
    board_focus?: string;
    /** Current board status */
    board_status?: 'recruiting' | 'active' | 'paused';
}
/** Properties for a beta program */
export interface BetaProgramProperties {
    /** Type of beta */
    beta_type?: 'closed' | 'open' | 'invite_only';
    /** Number of participants */
    participant_count?: number;
    /** Number of feedback items received */
    feedback_count?: number;
    /** Current beta status */
    beta_status?: 'recruiting' | 'active' | 'closed' | 'graduated';
    /** Feature being beta-tested */
    target_feature?: string;
}
/** Properties for a feedback theme */
export interface FeedbackThemeProperties {
    /** Name of the theme */
    theme_name?: string;
    /** Number of times this theme has been mentioned */
    mention_count?: number;
    /** Overall sentiment of the theme */
    sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
    /** Whether the theme is actionable */
    actionable?: boolean;
}
/** Properties for a pricing strategy */
export interface PricingStrategyProperties {
    /** Type of pricing strategy */
    strategy_type?: 'value_based' | 'cost_plus' | 'competitor_based' | 'penetration' | 'freemium';
    /** How often pricing is reviewed */
    review_cadence?: string;
    /** ISO date of last pricing change */
    last_change?: string;
}
/** Properties for a pricing experiment */
export interface PricingExperimentProperties {
    /** Type of experiment */
    experiment_type?: 'a_b' | 'cohort' | 'geographic' | 'temporal';
    /** Description of variant A */
    variant_a?: string;
    /** Description of variant B */
    variant_b?: string;
    /** Current experiment status */
    experiment_status?: 'planned' | 'running' | 'completed' | 'canceled';
    /** Which variant won */
    winner?: string;
    /** Revenue impact of the experiment */
    revenue_impact?: number;
}
/** Properties for a product package */
export interface PackageProperties {
    /** Name of the package (e.g. "Pro", "Enterprise") */
    package_name?: string;
    /** Features included in the package */
    features_included?: string[];
    /** Target customer segment */
    target_segment?: string;
    /** Lifecycle status of the package */
    package_status?: 'active' | 'sunset' | 'planned';
}
/** Properties for a discount strategy */
export interface DiscountStrategyProperties {
    /** Type of discount */
    discount_type?: 'percentage' | 'fixed' | 'tiered' | 'bundle';
    /** Discount percentage (if applicable) */
    discount_percentage?: number;
    /** ISO date the discount expires */
    valid_until?: string;
    /** Number of times the discount has been redeemed */
    redemption_count?: number;
}
/** Properties for a trial configuration */
export interface TrialConfigProperties {
    /** Type of trial limitation */
    trial_type?: 'time_limited' | 'feature_limited' | 'usage_limited' | 'reverse';
    /** Duration of the trial in days */
    duration_days?: number;
    /** Features available during the trial */
    features_available?: string[];
    /** Percentage of trial users that convert */
    conversion_rate?: number;
}
/** Properties for a paywall */
export interface PaywallProperties {
    /** Type of paywall */
    paywall_type?: 'hard' | 'soft' | 'metered' | 'freemium_gate';
    /** Event or condition that triggers the paywall */
    trigger?: string;
    /** Percentage of users that convert at the paywall */
    conversion_rate?: number;
    /** Feature being gated */
    gate_feature?: string;
}
/** Properties for an AI model */
export interface AiModelProperties {
    /** Model provider */
    model_provider?: 'anthropic' | 'openai' | 'google' | 'meta' | 'custom' | 'other';
    /** Model identifier (e.g. "claude-sonnet-4-6") */
    model_id?: string;
    /** What the model is used for */
    model_purpose?: string;
    /** Cost per 1,000 tokens */
    cost_per_1k_tokens?: number;
    /** Lifecycle status of the model */
    model_status?: 'evaluating' | 'active' | 'deprecated' | 'retired';
}
/** Properties for a prompt version */
export interface PromptVersionProperties {
    /** Version number */
    version_number?: string;
    /** The prompt template text */
    template?: string;
    /** Template variables */
    variables?: string[];
    /** Reference to the model this prompt targets */
    model_ref?: string;
    /** Performance score from evaluation */
    performance_score?: number;
}
/** Properties for an evaluation benchmark */
export interface EvalBenchmarkProperties {
    /** What the benchmark measures */
    benchmark_type?: 'accuracy' | 'latency' | 'cost' | 'safety' | 'custom';
    /** Number of test cases in the benchmark */
    test_case_count?: number;
    /** Minimum score to pass */
    passing_threshold?: number;
    /** ISO date of last run */
    last_run?: string;
}
/** Properties for an evaluation run */
export interface EvalRunProperties {
    /** ISO date of the run */
    run_date?: string;
    /** Score achieved */
    score?: number;
    /** Whether the run passed */
    passed?: boolean;
    /** Duration in milliseconds */
    duration_ms?: number;
    /** Total tokens consumed */
    token_count?: number;
}
/** Properties for an AI cost tracker */
export interface AiCostTrackerProperties {
    /** Time period being tracked (e.g. "2026-03") */
    period?: string;
    /** Total cost in the period */
    total_cost?: number;
    /** Total number of requests */
    total_requests?: number;
    /** Average cost per request */
    avg_cost_per_request?: number;
    /** Budget limit for the period */
    budget_limit?: number;
}
/** Properties for a hallucination report */
export interface HallucinationReportProperties {
    /** Type of hallucination */
    report_type?: 'factual' | 'logical' | 'fabrication' | 'inconsistency';
    /** Severity of the hallucination */
    severity?: 'critical' | 'major' | 'minor';
    /** Whether the hallucination was exposed to users */
    user_facing?: boolean;
    /** Root cause analysis */
    root_cause?: string;
    /** How the hallucination was addressed */
    remediation?: string;
}
/** Properties for an AI guardrail */
export interface AiGuardrailProperties {
    /** Type of guardrail */
    guardrail_type?: 'content_filter' | 'rate_limit' | 'token_limit' | 'safety' | 'custom';
    /** What happens when the guardrail triggers */
    enforcement?: 'block' | 'warn' | 'log';
    /** Number of times the guardrail has been triggered */
    trigger_count?: number;
}
/** Properties for a model comparison */
export interface ModelComparisonProperties {
    /** Models being compared */
    models_compared?: string[];
    /** Criteria used for comparison */
    comparison_criteria?: string[];
    /** Winning model */
    winner?: string;
    /** ISO date of the comparison */
    comparison_date?: string;
}
/** Properties for a workflow template */
export interface WorkflowTemplateProperties {
    /** Execution pattern of the workflow */
    template_type?: 'sequential' | 'parallel' | 'conditional' | 'loop';
    /** Number of steps in the workflow */
    step_count?: number;
    /** Estimated duration (e.g. "5 minutes") */
    estimated_duration?: string;
    /** Agent that owns this workflow */
    owner_agent?: string;
}
/** Properties for a workflow run */
export interface WorkflowRunProperties {
    /** ISO timestamp when the run started */
    started_at?: string;
    /** ISO timestamp when the run completed */
    completed_at?: string;
    /** Current status of the run */
    run_status?: 'pending' | 'running' | 'completed' | 'failed' | 'canceled';
    /** Event that triggered the run */
    triggering_event?: string;
}
/** Properties for an agent definition */
export interface AgentDefinitionProperties {
    /** Role of the agent */
    agent_role?: string;
    /** Scope of the agent's responsibilities */
    agent_scope?: string;
    /** Tools the agent has access to */
    tools_available?: string[];
    /** Reference to the model the agent uses */
    model_ref?: string;
    /** Whether the agent is active */
    agent_status?: 'active' | 'disabled' | 'testing';
}
/** Properties for an agent session */
export interface AgentSessionProperties {
    /** ISO timestamp when the session started */
    session_start?: string;
    /** ISO timestamp when the session ended */
    session_end?: string;
    /** Number of conversational turns */
    turns?: number;
    /** Total tokens consumed */
    tokens_used?: number;
    /** Current session status */
    session_status?: 'active' | 'completed' | 'errored' | 'timed_out';
    /** Summary of the session's output */
    output_summary?: string;
}
/** Properties for a review gate */
export interface ReviewGateProperties {
    /** Type of gate */
    gate_type?: 'human_review' | 'automated_check' | 'approval';
    /** People or roles required to approve */
    required_approvers?: string[];
    /** Current gate status */
    gate_status?: 'pending' | 'approved' | 'rejected' | 'bypassed';
}
/** Properties for an approval record */
export interface ApprovalRecordProperties {
    /** Who approved */
    approver?: string;
    /** Whether it was approved */
    approved?: boolean;
    /** Comments from the approver */
    comment?: string;
    /** ISO timestamp of the approval */
    approved_at?: string;
}
/** Properties for an agent skill */
export interface AgentSkillProperties {
    /** Name of the skill */
    skill_name?: string;
    /** What triggers the skill */
    skill_trigger?: string;
    /** Description of what the skill does */
    skill_description?: string;
    /** Number of times the skill has been invoked */
    invocation_count?: number;
}
/** Properties for an agent hook */
export interface AgentHookProperties {
    /** Event that triggers the hook */
    hook_event?: string;
    /** Action executed by the hook */
    hook_action?: string;
    /** Whether the hook is active */
    hook_status?: 'active' | 'disabled' | 'error';
    /** Number of times the hook has executed */
    execution_count?: number;
}
/** Properties for a workflow artifact */
export interface WorkflowArtifactProperties {
    /** Type of artifact produced */
    artifact_type?: 'document' | 'code' | 'data' | 'report' | 'other';
    /** URL or path to the artifact */
    artifact_url?: string;
    /** ISO timestamp when the artifact was produced */
    produced_at?: string;
}
/** Properties for a sales account */
export interface AccountProperties {
    /** Account classification */
    account_type?: 'prospect' | 'customer' | 'partner' | 'churned';
    /** Industry vertical */
    industry?: string;
    /** Number of employees */
    employee_count?: number;
    /** Annual revenue in base currency */
    annual_revenue?: number;
}
/** Properties for a contact */
export interface ContactProperties {
    /** Role within their organisation */
    contact_role?: string;
    /** Email address */
    email?: string;
    /** Phone number */
    phone?: string;
    /** Whether this person makes purchasing decisions */
    is_decision_maker?: boolean;
}
/** Properties for a lead */
export interface LeadProperties {
    /** Where the lead came from */
    lead_source?: string;
    /** Lead scoring value */
    lead_score?: number;
    /** Current status in the pipeline */
    lead_status?: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
    /** Qualification level */
    qualification_status?: 'mql' | 'sql' | 'pql' | 'unqualified';
}
/** Properties for a deal */
export interface DealProperties {
    /** Current stage in the sales pipeline */
    deal_stage?: string;
    /** Monetary value of the deal */
    deal_value?: number;
    /** Expected close date (ISO) */
    close_date?: string;
    /** Win probability (0–1) */
    probability?: number;
    /** Sales rep or team that owns the deal */
    owner?: string;
}
/** Properties for a sales pipeline */
export interface PipelineSalesProperties {
    /** Type of pipeline */
    pipeline_type?: string;
    /** Total value of deals in the pipeline */
    total_value?: number;
    /** Number of deals in the pipeline */
    deal_count?: number;
    /** Average sales cycle in days */
    avg_cycle_days?: number;
}
/** Properties for a pipeline stage */
export interface PipelineStageProperties {
    /** Order of this stage in the pipeline */
    stage_order?: number;
    /** Percentage of deals that advance from this stage */
    conversion_rate?: number;
    /** Average time deals spend in this stage */
    avg_days_in_stage?: number;
}
/** Properties for a quote document */
export interface QuoteDocumentProperties {
    /** Current status of the quote */
    quote_status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
    /** Total monetary amount */
    total_amount?: number;
    /** ISO date the quote expires */
    valid_until?: string;
    /** Currency code (e.g. "USD") */
    currency?: string;
}
/** Properties for a subscription */
export interface SubscriptionProperties {
    /** Subscription plan name */
    plan?: string;
    /** Monthly recurring revenue */
    mrr?: number;
    /** ISO date the subscription started */
    start_date?: string;
    /** ISO date of next renewal */
    renewal_date?: string;
    /** Current subscription status */
    subscription_status?: 'active' | 'trial' | 'past_due' | 'canceled' | 'expired';
}
/** Properties for an invoice */
export interface InvoiceProperties {
    /** Current invoice status */
    invoice_status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'voided';
    /** Monetary amount */
    amount?: number;
    /** ISO date the invoice is due */
    due_date?: string;
    /** Currency code (e.g. "USD") */
    currency?: string;
}
/** Properties for a revenue forecast */
export interface ForecastProperties {
    /** Time period being forecasted (e.g. "Q2 2026") */
    forecast_period?: string;
    /** Predicted revenue amount */
    predicted_revenue?: number;
    /** Confidence in the forecast (0–1) */
    confidence?: number;
    /** Forecasting methodology used */
    methodology?: string;
}
/** Properties for a program */
export interface ProgramProperties {
    /** Current program status */
    program_status?: 'planned' | 'active' | 'on_hold' | 'completed' | 'canceled';
    /** ISO date the program starts */
    start_date?: string;
    /** ISO date the program ends */
    end_date?: string;
    /** Allocated budget */
    budget?: number;
    /** Executive sponsor */
    sponsor?: string;
}
/** Properties for a project */
export interface ProjectProperties {
    /** Current project status */
    project_status?: 'planned' | 'active' | 'on_hold' | 'completed' | 'canceled';
    /** ISO date the project starts */
    start_date?: string;
    /** ISO date the project ends */
    end_date?: string;
    /** Project management methodology */
    methodology?: 'agile' | 'waterfall' | 'kanban' | 'hybrid';
}
/** Properties for a milestone */
export interface MilestoneProperties {
    /** ISO date the milestone is due */
    due_date?: string;
    /** Current milestone status */
    milestone_status?: 'upcoming' | 'hit' | 'missed' | 'at_risk';
    /** What must be delivered */
    deliverables?: string;
}
/** Properties for a risk register */
export interface RiskRegisterProperties {
    /** Total number of risks tracked */
    risk_count?: number;
    /** Number of high-severity risks */
    high_risks?: number;
    /** ISO date of last review */
    last_reviewed?: string;
}
/** Properties for a risk item */
export interface RiskItemProperties {
    /** Category of risk */
    risk_category?: string;
    /** Likelihood of the risk materialising */
    probability?: 'high' | 'medium' | 'low';
    /** Impact if the risk materialises */
    impact?: 'high' | 'medium' | 'low';
    /** Planned mitigation strategy */
    mitigation_strategy?: string;
    /** Person responsible for the risk */
    owner?: string;
}
/** Properties for a change request */
export interface ChangeRequestProperties {
    /** Type of change being requested */
    change_type?: 'scope' | 'schedule' | 'budget' | 'resource' | 'requirements';
    /** Current status of the request */
    change_status?: 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'implemented';
    /** Urgency of the change */
    priority?: Priority;
    /** Assessment of the change's impact */
    impact_assessment?: string;
    /** Who submitted the request */
    requester?: string;
}
/** Properties for a deliverable */
export interface DeliverableProperties {
    /** Type of deliverable */
    deliverable_type?: string;
    /** ISO date the deliverable is due */
    due_date?: string;
    /** Current status */
    deliverable_status?: 'not_started' | 'in_progress' | 'in_review' | 'accepted';
    /** Criteria for acceptance */
    acceptance_criteria?: string;
}
/** Properties for a resource allocation */
export interface ResourceAllocationProperties {
    /** Type of resource being allocated */
    resource_type?: 'person' | 'team' | 'budget' | 'tool';
    /** Percentage of the resource allocated */
    allocation_percentage?: number;
    /** ISO date the allocation starts */
    start_date?: string;
    /** ISO date the allocation ends */
    end_date?: string;
}
/** Properties for a status report */
export interface StatusReportProperties {
    /** Time period the report covers */
    report_period?: string;
    /** Overall RAG status */
    overall_status?: RAGStatus;
    /** Number of risks flagged */
    risks_flagged?: number;
    /** Description of blockers */
    blockers?: string;
}
/** Properties for a marketing strategy */
export interface MarketingStrategyProperties {
    /** Overall marketing approach */
    approach?: 'inbound' | 'outbound' | 'product_led' | 'community' | 'hybrid';
    /** Annual marketing budget */
    annual_budget?: number;
    /** Primary business goal */
    primary_goal?: string;
}
/** Properties for a marketing channel */
export interface MarketingChannelProperties {
    /** Type of marketing channel */
    channel_type?: 'social' | 'email' | 'seo' | 'sem' | 'content' | 'events' | 'other';
    /** Monthly spend on this channel */
    monthly_budget?: number;
    /** Return on investment */
    roi?: number;
    /** Current channel status */
    channel_status?: 'active' | 'paused' | 'testing' | 'deprecated';
}
/** Properties for a marketing campaign plan */
export interface MarketingCampaignPlanProperties {
    /** Campaign brief */
    brief?: string;
    /** Campaign budget */
    budget?: number;
    /** ISO date the campaign starts */
    start_date?: string;
    /** ISO date the campaign ends */
    end_date?: string;
    /** Target audience description */
    target_audience?: string;
    /** Current campaign status */
    campaign_status?: 'planning' | 'active' | 'completed' | 'paused';
}
/** Properties for an email sequence */
export interface EmailSequenceProperties {
    /** Type of email sequence */
    sequence_type?: 'onboarding' | 'nurture' | 're_engagement' | 'sales' | 'other';
    /** Number of emails in the sequence */
    email_count?: number;
    /** Average open rate */
    open_rate?: number;
    /** Average click-through rate */
    click_rate?: number;
}
/** Properties for a social media post */
export interface SocialPostProperties {
    /** Social media platform */
    platform?: 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'tiktok' | 'other';
    /** Format of the post */
    post_type?: 'text' | 'image' | 'video' | 'carousel' | 'story';
    /** ISO date the post is scheduled for */
    scheduled_date?: string;
    /** Current post status */
    post_status?: 'draft' | 'scheduled' | 'published' | 'archived';
}
/** Properties for an SEO keyword */
export interface SeoKeywordProperties {
    /** The keyword or phrase */
    keyword: string;
    /** Monthly search volume */
    search_volume?: number;
    /** Keyword difficulty score (0–100) */
    difficulty?: number;
    /** Search intent */
    intent?: 'informational' | 'navigational' | 'commercial' | 'transactional';
    /** Current ranking position */
    current_rank?: number;
    /** Target ranking position */
    target_rank?: number;
}
/** Properties for an ad creative */
export interface AdCreativeProperties {
    /** Advertising platform */
    platform?: 'google' | 'meta' | 'linkedin' | 'twitter' | 'other';
    /** Ad format */
    ad_format?: 'search' | 'display' | 'video' | 'native' | 'social';
    /** Ad headline */
    headline?: string;
    /** Call-to-action text */
    cta?: string;
    /** Total spend on this creative */
    spend?: number;
    /** Number of impressions */
    impressions?: number;
    /** Number of clicks */
    clicks?: number;
}
/** Properties for a press release */
export interface PressReleaseProperties {
    /** Type of press release */
    pr_type?: 'product_launch' | 'partnership' | 'funding' | 'milestone' | 'other';
    /** ISO date of publication */
    publish_date?: string;
    /** Media outlets targeted */
    outlets?: string[];
    /** Current press release status */
    pr_status?: 'draft' | 'approved' | 'distributed' | 'published';
}
/** Properties for an event */
export interface EventProperties {
    /** Type of event */
    event_type?: 'conference' | 'webinar' | 'meetup' | 'workshop' | 'trade_show' | 'other';
    /** ISO date of the event */
    event_date?: string;
    /** Event location */
    location?: string;
    /** Number of attendees */
    attendee_count?: number;
    /** Current event status */
    event_status?: 'planning' | 'upcoming' | 'live' | 'completed' | 'canceled';
}
/** Properties for a community initiative */
export interface CommunityInitiativeProperties {
    /** Type of community initiative */
    initiative_type?: 'forum' | 'discord' | 'slack' | 'meetup' | 'ambassador' | 'other';
    /** Number of community members */
    member_count?: number;
    /** Engagement rate */
    engagement_rate?: number;
    /** Current initiative status */
    initiative_status?: 'planning' | 'active' | 'paused' | 'sunset';
}
/** Properties for a locale */
export interface LocaleProperties {
    /** ISO 639-1 language code */
    language_code: string;
    /** ISO 3166-1 alpha-2 region code */
    region_code?: string;
    /** Whether this is the default locale */
    is_default?: boolean;
    /** Lifecycle status of the locale */
    locale_status?: 'active' | 'beta' | 'planned' | 'deprecated';
    /** Percentage of strings translated */
    translation_coverage?: number;
}
/** Properties for a translation key */
export interface TranslationKeyProperties {
    /** Dot-notation key path (e.g. "nav.settings.title") */
    key_path: string;
    /** Source language text */
    source_text?: string;
    /** Context hint for translators */
    context_hint?: string;
    /** Maximum character length for the translation */
    max_length?: number;
}
/** Properties for a translation bundle */
export interface TranslationBundleProperties {
    /** Scope of the bundle (e.g. "onboarding", "settings") */
    bundle_scope?: string;
    /** Number of keys in the bundle */
    key_count?: number;
    /** Percentage of keys translated */
    completion_pct?: number;
    /** ISO date of last sync */
    last_synced?: string;
}
/** Properties for locale configuration */
export interface LocaleConfigProperties {
    /** Date format pattern (e.g. "DD/MM/YYYY") */
    date_format?: string;
    /** Number format pattern */
    number_format?: string;
    /** Currency code (e.g. "EUR") */
    currency?: string;
    /** Text direction */
    text_direction?: 'ltr' | 'rtl';
    /** Default timezone (e.g. "Europe/London") */
    timezone?: string;
}
/** Properties for a cultural adaptation */
export interface CulturalAdaptationProperties {
    /** What is being adapted */
    adaptation_type?: 'content' | 'imagery' | 'ux' | 'legal' | 'payment';
    /** Target market for the adaptation */
    target_market?: string;
    /** Why the adaptation is needed */
    rationale?: string;
}
/** Properties for regional pricing */
export interface RegionalPricingProperties {
    /** Currency code */
    currency?: string;
    /** Price override for this region */
    price_override?: number;
    /** Purchasing power parity factor */
    ppp_factor?: number;
    /** ISO date the pricing takes effect */
    effective_date?: string;
}
/** Properties for an education program */
export interface EducationProgramProperties {
    /** Type of education program */
    program_type?: 'onboarding' | 'certification' | 'ongoing' | 'partner';
    /** Target audience */
    audience?: string;
    /** Current program status */
    program_status?: 'planning' | 'active' | 'paused' | 'retired';
}
/** Properties for a tutorial */
export interface TutorialProperties {
    /** Format of the tutorial */
    tutorial_format?: 'written' | 'video' | 'interactive' | 'code_along';
    /** Difficulty level */
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    /** Duration in minutes */
    duration_minutes?: number;
    /** Percentage of users who complete the tutorial */
    completion_rate?: number;
}
/** Properties for a product walkthrough */
export interface WalkthroughProperties {
    /** Type of walkthrough */
    walkthrough_type?: 'product_tour' | 'feature_intro' | 'tooltip_sequence' | 'checklist';
    /** Number of steps in the walkthrough */
    step_count?: number;
    /** What triggers the walkthrough */
    trigger?: string;
    /** Percentage of users who complete it */
    completion_rate?: number;
}
/** Properties for a webinar */
export interface WebinarProperties {
    /** Type of webinar */
    webinar_type?: 'live' | 'recorded' | 'hybrid';
    /** ISO date the webinar is scheduled for */
    scheduled_date?: string;
    /** Duration in minutes */
    duration_minutes?: number;
    /** Number of registrations */
    registrations?: number;
    /** Number of attendees */
    attendance?: number;
}
/** Properties for a certification */
export interface CertificationProperties {
    /** Certification level */
    cert_level?: 'foundation' | 'practitioner' | 'expert';
    /** Requirements to earn the certification */
    requirements?: string[];
    /** How long the certification is valid */
    validity_months?: number;
    /** Number of people who hold this certification */
    holders?: number;
}
/** Properties for a help video */
export interface HelpVideoProperties {
    /** Type of help video */
    video_type?: 'how_to' | 'overview' | 'troubleshooting' | 'best_practice';
    /** Duration in seconds */
    duration_seconds?: number;
    /** Number of views */
    views?: number;
    /** URL of the video */
    url?: string;
}
/** Properties for a learning path */
export interface LearningPathProperties {
    /** Difficulty level */
    path_difficulty?: 'beginner' | 'intermediate' | 'advanced';
    /** Number of items in the path */
    item_count?: number;
    /** Estimated hours to complete */
    estimated_hours?: number;
    /** Percentage of users who complete the path */
    completion_rate?: number;
}
/** Properties for a partner program */
export interface PartnerProgramProperties {
    /** Type of partner program */
    program_type?: 'referral' | 'reseller' | 'technology' | 'consulting' | 'marketplace';
    /** Current program status */
    program_status?: 'planning' | 'active' | 'paused' | 'sunset';
    /** Number of partners enrolled */
    partner_count?: number;
}
/** Properties for a partner tier */
export interface PartnerTierProperties {
    /** Name of the tier (e.g. "Gold", "Platinum") */
    tier_name?: string;
    /** Numeric level for ordering */
    tier_level?: number;
    /** Requirements to reach this tier */
    requirements?: string[];
    /** Benefits of this tier */
    benefits?: string[];
}
/** Properties for an API ecosystem */
export interface ApiEcosystemProperties {
    /** API architectural style */
    api_style?: 'rest' | 'graphql' | 'grpc' | 'webhook' | 'mixed';
    /** Number of registered developers */
    developer_count?: number;
    /** Number of apps built on the API */
    app_count?: number;
    /** Lifecycle status of the ecosystem */
    ecosystem_status?: 'alpha' | 'beta' | 'ga' | 'deprecated';
}
/** Properties for a marketplace listing */
export interface MarketplaceListingProperties {
    /** Type of listing */
    listing_type?: 'app' | 'integration' | 'template' | 'plugin';
    /** Number of installs */
    installs?: number;
    /** Average user rating */
    rating?: number;
    /** Current listing status */
    listing_status?: 'draft' | 'in_review' | 'published' | 'suspended';
}
/** Properties for a developer portal */
export interface DeveloperPortalProperties {
    /** URL of the portal */
    portal_url?: string;
    /** Number of documentation pages */
    doc_count?: number;
    /** Whether a sandbox environment is available */
    sandbox_available?: boolean;
    /** Current portal status */
    portal_status?: 'active' | 'maintenance' | 'deprecated';
}
/** Properties for an integration partner */
export interface IntegrationPartnerProperties {
    /** Name of the partner */
    partner_name?: string;
    /** Type of integration */
    integration_type?: 'native' | 'webhook' | 'api' | 'embedded';
    /** Current status of the partnership */
    partner_status?: 'exploring' | 'developing' | 'live' | 'deprecated';
}
/** Properties for a partner revenue share */
export interface PartnerRevenueShareProperties {
    /** Revenue sharing model */
    share_model?: 'percentage' | 'flat_fee' | 'tiered' | 'hybrid';
    /** Revenue share percentage (if applicable) */
    share_percentage?: number;
    /** Annual revenue generated through the partnership */
    annual_revenue?: number;
}
//# sourceMappingURL=ops.d.ts.map