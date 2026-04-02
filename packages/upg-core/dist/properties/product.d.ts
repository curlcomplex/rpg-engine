/**
 * UPG Property Schemas — PRODUCT Domains
 *
 * Typed property interfaces for product-domain entity types:
 * - UX Research Layer
 * - Design Layer
 * - Product Specification Expansion
 * - Engineering Layer
 *
 * Part of the Unified Product Graph specification.
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
import type { Priority, Confidence, Scale1to5 } from './core.js';
/** Properties for a research participant */
export interface ParticipantProperties {
    /** Anonymous alias for privacy (e.g. "P01") */
    alias?: string;
    /** User segment this participant belongs to */
    segment?: string;
    /** How the participant was recruited */
    recruit_source?: string;
    /** Current consent status for data usage */
    consent_status?: 'pending' | 'given' | 'withdrawn';
}
/** Properties for a discrete observation captured during research */
export interface ObservationProperties {
    /** The observation content / note */
    content?: string;
    /** Research method that produced this observation */
    source_type?: 'quote' | 'behavior' | 'metric';
    /** Reference to the session where this was captured */
    session_ref?: string;
    /** Whether this observation has been highlighted (absorbed from highlight entity) */
    is_highlighted?: boolean;
    /** Tag describing the highlight type (e.g. 'pain', 'delight', 'behaviour') */
    highlight_tag?: string;
}
/** Properties for a verbatim quote from a participant */
export interface QuoteProperties {
    /** The exact quoted text */
    text: string;
    /** Who said it (alias or name) */
    speaker?: string;
    /** When it was said (ISO timestamp or session offset) */
    timestamp?: string;
    /** Linked Job-to-be-Done identifier */
    linked_jtbd?: string;
}
/** Properties for an affinity cluster grouping observations */
export interface AffinityClusterProperties {
    /** The emergent theme label */
    theme?: string;
    /** Number of observations in this cluster */
    child_observation_count?: number;
    /** Confidence in the theme's validity */
    confidence?: Confidence;
}
/** Properties for a research question guiding a study */
export interface ResearchQuestionProperties {
    /** Classification of the research question */
    question_type?: 'exploratory' | 'evaluative' | 'generative';
    /** How important this question is to answer */
    priority?: Priority;
}
/** Properties for an interview guide document */
export interface InterviewGuideProperties {
    /** How structured the interview format is */
    guide_type?: 'structured' | 'semi_structured' | 'unstructured';
    /** Total number of questions in the guide */
    question_count?: number;
    /** Expected interview length in minutes */
    duration_minutes?: number;
}
/** Unified insight entity — replaces finding + research_insight */
export interface InsightProperties {
    /** Maturity level of the insight */
    insight_level?: 'pattern' | 'finding' | 'actionable' | 'strategic';
    /** How confident we are in this insight */
    confidence?: 'strong' | 'moderate' | 'weak';
    /** Number of supporting observations/quotes */
    evidence_count?: number;
    /** How novel this insight is */
    novelty?: 'known' | 'surprising' | 'contradictory';
    /** How actionable this insight is */
    actionability?: 'immediate' | 'needs_validation' | 'informational';
    /** The research method that produced this insight */
    source_method?: string;
    /** Which persona this insight concerns */
    affects_persona_id?: string;
    /** Statement text */
    statement?: string;
    /** Implications text */
    implications?: string;
}
/** @deprecated Use InsightProperties with insight_level='finding' instead */
/** Properties for a research finding — synthesised from evidence */
export interface FindingProperties {
    /** Category of finding */
    finding_type?: 'behavioral' | 'attitudinal' | 'usability' | 'conceptual';
    /** How confident we are in this finding */
    confidence?: Confidence;
    /** Number of supporting evidence items */
    evidence_count?: number;
}
/** Properties for aggregated survey response data */
export interface SurveyResponseProperties {
    /** Total number of responses received */
    response_count?: number;
    /** Percentage of surveys completed (0–1) */
    completion_rate?: number;
    /** Distribution method used */
    method?: 'email' | 'in_app' | 'phone' | 'other';
}
/** @deprecated Absorbed into ObservationProperties (is_highlighted + highlight_tag) */
export interface HighlightProperties {
    /** What kind of highlight this is */
    highlight_type?: 'quote' | 'behavior' | 'emotion' | 'pain_point' | 'delight';
    /** When the highlight occurred */
    timestamp?: string;
    /** Reference to the participant involved */
    participant_ref?: string;
}
/** Properties for a user journey map */
export interface UserJourneyProperties {
    /** Scope description (e.g. "end-to-end onboarding") */
    scope?: string;
    /** Whether this maps current or future state */
    journey_type?: 'current_state' | 'future_state' | 'service_blueprint';
    /** Named phases in the journey */
    phases?: string[];
    /** User goals the journey addresses */
    goals?: string[];
    /** Scenario context for this journey */
    scenario?: string;
}
/** Properties for a single step within a user journey */
export interface JourneyStepProperties {
    /** Which journey phase this step belongs to */
    phase?: string;
    /** The touchpoint where interaction occurs */
    touchpoint?: string;
    /** The channel used (e.g. "web", "email", "in-store") */
    channel?: string;
    /** User emotion at this step (1 = very negative, 5 = very positive) */
    emotion_score?: Scale1to5;
    /** Friction level at this step (1 = effortless, 5 = very painful) */
    friction_score?: Scale1to5;
    /** What the user does at this step */
    action?: string;
    /** What the user is thinking */
    thought?: string;
    /** Description of pain experienced */
    pain_point_text?: string;
    /** Physical evidence visible to the user at this step */
    physical_evidence?: string;
    /** Frontstage action performed by the service */
    frontstage_action?: string;
    /** Backstage action supporting the frontstage */
    backstage_action?: string;
    /** Supporting process or system behind the scenes */
    support_process?: string;
    /** Opportunity identified at this step */
    opportunity?: string;
    /** Label for a metric tracked at this step */
    metric_label?: string;
    /** Value of the metric at this step */
    metric_value?: string;
    /** Owner responsible for this step */
    owner?: string;
}
/** Properties for a UX insight derived from research or journey analysis */
export interface UxInsightProperties {
    /** The insight statement */
    statement?: string;
    /** Confidence in this insight */
    confidence?: Confidence;
    /** References to supporting evidence */
    evidence_refs?: string;
    /** What this insight means for the product */
    implications?: string;
}
/** Properties for a How Might We question */
export interface HowMightWeProperties {
    /** The HMW question text */
    text: string;
    /** What generated this HMW */
    source_type?: 'insight' | 'pain_point' | 'observation';
}
/** Properties for a design concept being explored */
export interface DesignConceptProperties {
    /** URL to a sketch or visual representation */
    sketch_url?: string;
    /** Current status in the selection process */
    concept_status?: 'sketched' | 'refined' | 'selected' | 'rejected';
    /** Why this concept was selected or rejected */
    rationale?: string;
}
/** Properties for a prototype */
export interface PrototypeProperties {
    /** Level of detail in the prototype */
    fidelity?: 'lo' | 'mid' | 'hi';
    /** Link to the Figma prototype */
    figma_url?: string;
    /** Whether this prototype has been tested with users */
    test_status?: 'untested' | 'testing' | 'passed' | 'failed';
    /** Tool used to create the prototype */
    tool?: string;
}
/** Properties for a design system component */
export interface DesignComponentProperties {
    /** Atomic design level */
    atomic_level?: 'atom' | 'molecule' | 'organism' | 'template';
    /** Link to the Figma component */
    figma_url?: string;
    /** Link to the code implementation */
    code_url?: string;
}
/** Properties for a design token */
export interface DesignTokenProperties {
    /** Token category */
    category?: 'color' | 'spacing' | 'typography' | 'radius' | 'motion';
    /** The token's resolved value */
    value: string;
    /** Corresponding CSS custom property name */
    css_variable?: string;
}
/** Properties for a brand identity definition */
export interface BrandIdentityProperties {
    /** Core personality traits of the brand */
    personality_traits?: string[];
    /** Brand tagline or slogan */
    tagline?: string;
    /** The brand's mission statement */
    mission_statement?: string;
    /** Current lifecycle stage of the brand */
    brand_stage?: 'exploratory' | 'defined' | 'mature';
}
/** Properties for a brand colour */
export interface BrandColourProperties {
    /** Hex colour value (e.g. "#1A2B3C") */
    hex: string;
    /** Role this colour plays in the palette */
    role?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic';
    /** Hex of the contrast-paired colour for accessibility */
    contrast_pair?: string;
    /** Where this colour should be used */
    usage_context?: string;
}
/** Properties for a brand typography choice */
export interface BrandTypographyProperties {
    /** Font family name */
    font_family: string;
    /** Typographic role */
    category?: 'heading' | 'body' | 'mono' | 'display' | 'accent';
    /** Available weight range (e.g. "400–700") */
    weight_range?: string;
    /** Example text to preview the font */
    sample_text?: string;
}
/** Properties for brand voice guidelines */
export interface BrandVoiceProperties {
    /** Tone descriptors (e.g. "confident", "warm", "precise") */
    tone_attributes?: string[];
    /** Examples of correct brand voice */
    do_examples?: string[];
    /** Examples of what to avoid */
    dont_examples?: string[];
    /** Core writing principles */
    writing_principles?: string[];
}
/** Properties for a wireframe */
export interface WireframeProperties {
    /** Level of detail in the wireframe */
    fidelity?: 'low' | 'medium' | 'high';
    /** Name of the screen this wireframe represents */
    screen_name?: string;
    /** Link to the Figma wireframe */
    figma_url?: string;
}
/** Properties for a reusable design pattern */
export interface DesignPatternProperties {
    /** Category of the pattern */
    pattern_category?: 'navigation' | 'input' | 'display' | 'feedback' | 'layout';
    /** When and where to use this pattern */
    usage_context?: string;
}
/** Properties for a design guideline */
export interface DesignGuidelineProperties {
    /** Category this guideline covers */
    guideline_category?: 'spacing' | 'color' | 'typography' | 'layout' | 'interaction' | 'content';
    /** What elements or contexts this guideline applies to */
    applies_to?: string;
}
/** Properties for a design annotation on a screen */
export interface AnnotationProperties {
    /** Type of annotation */
    annotation_type?: 'spec' | 'interaction' | 'content' | 'accessibility';
    /** The element being annotated */
    target_element?: string;
    /** The annotation note */
    note?: string;
}
/** Properties for an interaction specification */
export interface InteractionSpecProperties {
    /** What triggers the interaction */
    trigger?: string;
    /** Type of animation or transition */
    animation_type?: string;
    /** Duration in milliseconds */
    duration_ms?: number;
    /** Easing function (e.g. "ease-in-out", "spring") */
    easing?: string;
}
/** Properties for a design system as a whole */
export interface DesignSystemProperties {
    /** Current version of the design system */
    version?: string;
    /** Link to the Figma library */
    figma_url?: string;
    /** Path to the code repository or package */
    repo_path?: string;
}
/** Properties for a user flow */
export interface UserFlowProperties {
    /** What initiates the flow */
    trigger?: string;
    /** Ordered list of steps in the flow */
    steps: string[];
    /** What a successful completion looks like */
    success_state?: string;
    /** What a failed completion looks like */
    failure_state?: string;
    /** Link to the Figma flow diagram */
    figma_url?: string;
}
/** Properties for a screen in the product */
export interface ScreenProperties {
    /** The application route for this screen */
    route?: string;
    /** Link to the Figma screen design */
    figma_url?: string;
    /** Reference to the parent flow this screen belongs to */
    parent_flow?: string;
}
/** Properties for a specific state of a screen */
export interface ScreenStateProperties {
    /** The state this represents */
    state_name: 'empty' | 'loading' | 'error' | 'populated' | 'skeleton' | 'partial';
    /** Reference to the parent screen */
    parent_screen?: string;
}
/** Properties for an acceptance criterion on a story or feature */
export interface AcceptanceCriterionProperties {
    /** The condition that must be met (Given/When/Then or plain text) */
    condition: string;
    /** How this criterion is tested */
    test_type?: 'manual' | 'automated';
    /** Current pass/fail status */
    pass_status?: 'untested' | 'pass' | 'fail';
}
/** Properties for a task — a unit of work */
export interface TaskProperties {
    /** Current status of the task */
    task_status?: 'todo' | 'in_progress' | 'in_review' | 'done';
    /** Person assigned to this task */
    assignee?: string;
    /** Effort estimate (e.g. "2h", "1d", "3 points") */
    effort?: string;
    /** How important this task is */
    priority?: Priority;
}
/** Properties for a bug report */
export interface BugProperties {
    /** How severe the bug is */
    bug_severity?: 'critical' | 'major' | 'minor' | 'trivial';
    /** Current lifecycle status of the bug */
    bug_status?: 'open' | 'in_progress' | 'fixed' | 'verified' | 'wont_fix';
    /** How to reproduce the bug */
    steps_to_reproduce?: string;
    /** Environment where the bug was observed */
    environment?: string;
}
/** Properties for a product roadmap */
export interface RoadmapProperties {
    /** Structure of the roadmap */
    roadmap_type?: 'now_next_later' | 'quarterly' | 'release_based' | 'theme_based';
    /** Timeframe the roadmap covers */
    timeframe?: string;
    /** Person or team that owns this roadmap */
    owner?: string;
}
/** Properties for an item on a roadmap */
export interface RoadmapItemProperties {
    /** Which quarter this item is planned for */
    quarter?: string;
    /** Priority of this roadmap item */
    priority?: Priority;
    /** Current status of the item */
    item_status?: 'planned' | 'in_progress' | 'shipped' | 'deferred';
    /** Confidence in the delivery estimate */
    confidence?: Confidence;
}
/** Properties for a thematic grouping of work */
export interface ThemeProperties {
    /** Scope description of the theme */
    theme_scope?: string;
    /** Priority of this theme */
    priority?: Priority;
}
/** Properties for a changelog entry */
export interface ChangelogProperties {
    /** Version string (e.g. "1.2.0") */
    version?: string;
    /** ISO date of the changelog entry */
    date?: string;
    /** Type of change */
    change_type?: 'feature' | 'improvement' | 'bugfix' | 'breaking' | 'deprecation';
    /** References to features included in this change */
    linked_features?: string[];
}
/** Properties for a DDD bounded context */
export interface BoundedContextProperties {
    /** Team that owns this bounded context */
    team_owner?: string;
    /** Technologies used within this context */
    tech_stack?: string[];
    /** Key terms and their definitions within this context */
    ubiquitous_language?: string;
}
/** Properties for a service or microservice */
export interface ServiceProperties {
    /** Type of service */
    service_type?: 'web' | 'api' | 'worker' | 'db' | 'queue';
    /** Link to the service's code repository */
    repo_url?: string;
    /** Technologies used by this service */
    tech_stack?: string[];
    /** Current deployment status */
    service_status?: 'development' | 'staging' | 'production' | 'deprecated';
}
/** Properties for a domain event in an event-driven architecture */
export interface DomainEventProperties {
    /** Name of the event (e.g. "OrderPlaced") */
    event_name?: string;
    /** Schema or shape of the event payload */
    payload_schema?: string;
    /** What triggers this event */
    triggered_by?: string;
}
/** Properties for an API contract */
export interface ApiContractProperties {
    /** URL to the specification document */
    spec_url?: string;
    /** Communication protocol */
    protocol?: 'REST' | 'GraphQL' | 'gRPC' | 'AsyncAPI';
    /** API version string */
    version?: string;
}
/** Properties for an Architecture Decision Record */
export interface ArchitectureDecisionProperties {
    /** Current status of the ADR */
    adr_status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
    /** Background context and problem statement */
    context?: string;
    /** The decision that was made */
    decision?: string;
    /** Known consequences of this decision */
    consequences?: string;
}
/** Properties for a technical debt item */
export interface TechnicalDebtItemProperties {
    /** Type of technical debt */
    debt_type?: 'code' | 'architecture' | 'security' | 'test' | 'docs' | 'dependency';
    /** How severe this debt is (1 = minor, 5 = critical) */
    severity?: Scale1to5;
    /** Effort required to fix (1 = trivial, 5 = major) */
    effort_to_fix?: Scale1to5;
}
/** Properties for a feature flag */
export interface FeatureFlagProperties {
    /** Unique flag key used in code */
    key: string;
    /** Current state of the flag */
    flag_status?: 'on' | 'off' | 'rollout';
    /** Rollout percentage (0–100) */
    rollout_pct?: number;
    /** Targeting rules description */
    targeting_rules?: string;
}
/** Properties for a deployment */
export interface DeploymentProperties {
    /** Target environment */
    environment?: 'dev' | 'staging' | 'prod';
    /** ISO timestamp of the deployment */
    timestamp?: string;
    /** Current status of the deployment */
    deploy_status?: 'success' | 'failure' | 'rolling';
    /** Git SHA of the deployed commit */
    sha?: string;
}
/** Properties for a DDD aggregate */
export interface AggregateProperties {
    /** The root entity of this aggregate */
    aggregate_root?: string;
    /** Business rules this aggregate enforces */
    invariants?: string;
}
/** Properties for a DDD domain entity */
export interface DomainEntityProperties {
    /** How this entity is identified (e.g. "UUID", "email") */
    entity_identity?: string;
    /** Lifecycle description of this entity */
    lifecycle?: string;
}
/** Properties for a DDD value object */
export interface ValueObjectProperties {
    /** Whether this value object is immutable */
    immutable?: boolean;
    /** Fields used for equality comparison */
    equality_fields?: string;
}
/** Properties for a command in CQRS */
export interface CommandProperties {
    /** Handler that processes this command */
    command_handler?: string;
    /** Validation rules applied before execution */
    validation_rules?: string;
}
/** Properties for a read model / projection */
export interface ReadModelProperties {
    /** Source event or aggregate this model projects from */
    projection_source?: string;
    /** How the read model stays up to date */
    refresh_strategy?: 'sync' | 'async' | 'cron' | 'on_demand';
}
/** Properties for an API endpoint */
export interface ApiEndpointProperties {
    /** HTTP method */
    http_method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /** URL path (e.g. "/api/v1/products/:id") */
    path?: string;
    /** Whether authentication is required */
    auth_required?: boolean;
    /** Rate limit description (e.g. "100/min") */
    rate_limit?: string;
}
/** Properties for a database schema */
export interface DatabaseSchemaProperties {
    /** Database engine type */
    db_type?: 'postgres' | 'mysql' | 'mongodb' | 'redis' | 'other';
    /** Current schema version */
    schema_version?: string;
    /** Status of pending migrations */
    migration_status?: 'current' | 'pending' | 'failed';
}
/** Properties for a message queue or topic */
export interface QueueTopicProperties {
    /** Queue/topic technology */
    queue_type?: 'sqs' | 'kafka' | 'rabbitmq' | 'pubsub' | 'other';
    /** Message retention period in hours */
    retention_hours?: number;
    /** Consumer group names */
    consumer_groups?: string;
}
/** Properties for a build artifact */
export interface BuildArtifactProperties {
    /** Type of artifact produced */
    artifact_type?: 'docker_image' | 'npm_package' | 'binary' | 'static_assets' | 'other';
    /** Version of the artifact */
    version?: string;
    /** Human-readable size (e.g. "12.4 MB") */
    size?: string;
    /** Registry or storage location */
    registry?: string;
}
/** Properties for a code repository */
export interface CodeRepositoryProperties {
    /** URL of the repository */
    repo_url?: string;
    /** Default branch name */
    default_branch?: string;
    /** Primary programming language */
    language?: string;
    /** Current CI status */
    ci_status?: 'passing' | 'failing' | 'unknown';
}
/** Properties for a library or package dependency */
export interface LibraryDependencyProperties {
    /** Installed version */
    dep_version?: string;
    /** Dependency classification */
    dep_type?: 'runtime' | 'dev' | 'peer' | 'optional';
    /** SPDX license identifier */
    license?: string;
    /** Whether a newer version is available */
    is_outdated?: boolean;
}
/** Properties for an integration pattern between systems */
export interface IntegrationPatternProperties {
    /** Type of integration */
    pattern_type?: 'api' | 'event' | 'file' | 'database' | 'webhook';
    /** System that initiates the integration */
    source_system?: string;
    /** System that receives the integration */
    target_system?: string;
    /** Communication protocol used */
    protocol?: string;
}
/** Properties for an external API dependency */
export interface ExternalApiProperties {
    /** API provider name */
    provider?: string;
    /** Base URL of the API */
    base_url?: string;
    /** Authentication method required */
    auth_type?: 'api_key' | 'oauth2' | 'jwt' | 'basic' | 'none';
    /** Rate limit description */
    rate_limits?: string;
    /** Current availability status */
    api_status?: 'active' | 'deprecated' | 'beta' | 'unavailable';
}
/** Properties for a data flow between services */
export interface DataFlowProperties {
    /** Service that produces the data */
    source_service?: string;
    /** Service that consumes the data */
    destination_service?: string;
    /** What triggers the data flow */
    trigger?: string;
    /** Type of data being transferred */
    data_type?: string;
    /** Flow direction */
    direction?: 'unidirectional' | 'bidirectional';
    /** Communication protocol */
    protocol?: 'rest' | 'graphql' | 'grpc' | 'event' | 'webhook' | 'file';
}
//# sourceMappingURL=product.d.ts.map