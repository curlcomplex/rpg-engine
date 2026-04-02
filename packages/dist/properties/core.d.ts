/**
 * UPG Property Schemas — CORE Domains
 *
 * Typed property interfaces for all CORE entity types in the
 * Unified Product Graph specification.
 */
/** Task or strategic priority level */
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
/** Red / Amber / Green health status */
export type RAGStatus = 'on_track' | 'at_risk' | 'off_track';
/** Confidence level for assumptions, evidence, and feasibility */
export type Confidence = 'high' | 'medium' | 'low';
/** Likert-style 1–5 scale (defined in types.ts) */
import type { Scale1to5 } from '../types.js';
export type { Scale1to5 } from '../types.js';
/** Properties for the Organization entity */
export interface OrganizationProperties {
    /** URL of the organisation's logo */
    logo_url?: string;
    /** Current billing / subscription plan */
    billing_plan?: string;
    /** Industry vertical the organisation operates in */
    industry?: string;
}
/** Properties for the Portfolio entity */
export interface PortfolioProperties {
    /** How products are structured within the portfolio */
    hierarchy_model?: 'flat' | 'nested' | 'matrix';
    /** High-level strategy archetype */
    strategy_type?: string;
    /** Person or team that owns this portfolio */
    owner?: string;
}
/** Properties for the ProductArea entity */
export interface ProductAreaProperties {
    /** Person or team that owns this product area */
    owner?: string;
    /** Number of products within this area */
    product_count?: number;
    /** Strategic priority assigned to this area */
    strategic_priority?: Priority;
}
/** Properties for the Vision entity */
export interface VisionProperties {
    /** Target timeframe for the vision (e.g. "3 years") */
    timeframe?: string;
    /** The single north-star metric or statement */
    north_star?: string;
    /** Narrative description of what success looks like */
    success_looks_like?: string;
}
/** Properties for the Mission entity */
export interface MissionProperties {
    /** Who this mission serves */
    target_audience: string;
    /** The core value proposition */
    core_value: string;
    /** What differentiates this from alternatives */
    differentiation?: string;
}
/** Properties for the StrategicTheme entity */
export interface StrategicThemeProperties {
    /** Lifecycle status of the theme */
    theme_status?: 'active' | 'completed' | 'paused';
    /** Person or team that owns this theme */
    owner?: string;
    /** Planning horizon (e.g. "Q1 2026", "FY26") */
    time_horizon?: string;
}
/** Properties for the Initiative entity */
export interface InitiativeProperties {
    /** Lifecycle status of the initiative */
    initiative_status?: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'abandoned';
    /** ISO date when the initiative starts */
    start_date?: string;
    /** ISO date when the initiative ends */
    end_date?: string;
    /** Budget allocated (in base currency units) */
    budget?: number;
    /** Person or team that owns this initiative */
    owner?: string;
}
/** Properties for the Capability entity */
export interface CapabilityProperties {
    /** Current maturity level of this capability */
    maturity_level?: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
    /** Desired maturity level to reach */
    target_maturity?: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
    /** Description of the gap between current and target maturity */
    gap?: string;
}
/** Properties for the ValueStream entity */
export interface ValueStreamProperties {
    /** Current stage in the value delivery pipeline */
    stream_stage?: string;
    /** End-to-end lead time (e.g. "2 weeks") */
    lead_time?: string;
    /** Throughput measure (e.g. "5 features/sprint") */
    throughput?: string;
}
/** Properties for the StrategicPillar entity */
export interface StrategicPillarProperties {
    /** Lifecycle status of the pillar */
    pillar_status?: 'active' | 'sunset' | 'proposed';
    /** Person or team that owns this pillar */
    owner?: string;
}
/** Properties for the Assumption entity */
export interface AssumptionProperties {
    /** Current validation status */
    assumption_status?: 'untested' | 'testing' | 'validated' | 'invalidated';
    /** How confident we are in this assumption */
    confidence?: Confidence;
    /** Method used or planned for validating this assumption */
    validation_method?: string;
}
/** Properties for the Decision entity */
export interface DecisionProperties {
    /** Domain layer this decision applies to */
    layer: 'strategic' | 'product' | 'engineering' | 'design' | 'business' | 'other';
    /** Background context that led to this decision */
    context?: string;
    /** List of options that were evaluated */
    options_considered: string[];
    /** Why the chosen option was selected */
    rationale?: string;
    /** Current status of the decision */
    decision_status?: 'proposed' | 'accepted' | 'superseded' | 'rejected';
    /** ISO date when the decision was made */
    date?: string;
}
/** Properties for the DesiredOutcome entity */
export interface DesiredOutcomeProperties {
    /** Outcome statement in the user's words */
    statement?: string;
    /** How important this outcome is to the user (1 = low, 5 = critical) */
    importance: Scale1to5;
    /** How satisfied the user currently is with this outcome (1 = very unsatisfied, 5 = fully satisfied) */
    current_satisfaction: Scale1to5;
}
/** Properties for the JobStep entity */
export interface JobStepProperties {
    /** Order of this step within the parent job */
    step_order?: number;
    /** Classification of the step */
    step_type?: 'core' | 'supporting' | 'emotional';
    /** Tools or products currently used for this step */
    tools_used?: string;
}
/** Properties for the UserNeed entity */
export interface UserNeedProperties {
    /** Classification of the need */
    need_type?: 'functional' | 'emotional' | 'social';
    /** How urgently the user feels this need */
    urgency?: 'high' | 'medium' | 'low';
    /** How often the need arises */
    frequency?: 'daily' | 'weekly' | 'monthly' | 'occasional';
}
/** Properties for the SwitchingCost entity */
export interface SwitchingCostProperties {
    /** Type of switching cost */
    cost_type?: 'financial' | 'learning' | 'data' | 'relationship' | 'procedural';
    /** How large the barrier is */
    magnitude?: 'high' | 'medium' | 'low';
    /** Free-text description of the barrier */
    barrier_description?: string;
}
/** Properties for the FeasibilityStudy entity */
export interface FeasibilityStudyProperties {
    /** Type of feasibility being assessed */
    feasibility_type?: 'technical' | 'business' | 'market' | 'resource';
    /** Outcome conclusion of the study */
    conclusion?: 'feasible' | 'not_feasible' | 'conditional' | 'needs_more_data';
    /** Confidence in the conclusion */
    confidence?: Confidence;
}
/** Properties for the DesignSprint entity */
export interface DesignSprintProperties {
    /** Duration of the sprint (e.g. "5 days") */
    sprint_duration?: string;
    /** The core challenge the sprint addresses */
    challenge?: string;
    /** Current status of the sprint */
    sprint_status?: 'planning' | 'in_progress' | 'completed';
}
/** Properties for the TestPlan entity */
export interface TestPlanProperties {
    /** Type of test being planned */
    plan_type?: 'usability' | 'concept' | 'ab_test' | 'beta' | 'smoke';
    /** Number of participants or observations */
    sample_size?: number;
    /** How long the test will run (e.g. "2 weeks") */
    duration?: string;
    /** Criteria that determine whether the test passes */
    success_criteria?: string;
}
/** Properties for the ResearchPlan entity */
export interface ResearchPlanProperties {
    /** The primary question this research aims to answer */
    research_question?: string;
    /** Suggested research methods to use */
    suggested_methods?: string[];
    /** Minimum evidence bar to consider the question answered */
    evidence_threshold?: string;
    /** Suggested deadline for completing the research */
    deadline_suggestion?: string;
}
/** Properties for the Evidence entity */
export interface EvidenceProperties {
    /** Classification of the evidence */
    evidence_type?: 'quantitative' | 'qualitative' | 'anecdotal' | 'expert_opinion';
    /** Where this evidence came from */
    source?: string;
    /** How strong this evidence is */
    strength?: 'strong' | 'moderate' | 'weak';
    /** Whether this evidence supports or refutes the hypothesis */
    direction?: 'supports' | 'refutes' | 'neutral';
}
/** Properties for the CompetitorFeature entity */
export interface CompetitorFeatureProperties {
    /** Our product's equivalent feature (if any) */
    our_equivalent?: string;
    /** Whether this represents a gap in our offering */
    is_gap: boolean;
    /** How our equivalent compares in quality */
    quality?: 'better' | 'same' | 'worse' | 'missing';
}
/** Properties for the MarketTrend entity */
export interface MarketTrendProperties {
    /** How relevant this trend is to our product (1 = low, 5 = critical) */
    relevance?: Scale1to5;
    /** When this trend is expected to peak or mature */
    timeframe?: string;
    /** Expected impact on our market */
    impact?: 'high' | 'medium' | 'low';
    /** Where this trend data comes from */
    source?: string;
}
/** Properties for the MarketSegment entity */
export interface MarketSegmentProperties {
    /** Number of potential customers in this segment */
    segment_size?: number;
    /** Year-over-year growth rate (as a decimal, e.g. 0.15 = 15%) */
    growth_rate?: number;
    /** Total Addressable Market in currency units */
    tam?: number;
    /** Serviceable Addressable Market in currency units */
    sam?: number;
}
/** Properties for the CompetitiveAnalysis entity */
export interface CompetitiveAnalysisProperties {
    /** Type of competitive analysis performed */
    analysis_type?: 'feature_comparison' | 'positioning' | 'swot' | 'pricing';
    /** ISO date when the analysis was conducted */
    date?: string;
    /** Framework or methodology used */
    framework?: string;
}
//# sourceMappingURL=core.d.ts.map