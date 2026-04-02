#!/usr/bin/env node

// src/index.ts
import { parseArgs } from "util";
import * as fs3 from "fs/promises";
import * as path3 from "path";

// src/store.ts
import * as fs from "fs/promises";
import * as path from "path";
import { createHash } from "crypto";
import { watch } from "chokidar";

// ../upg-spec/dist/domains.js
var UPG_DOMAINS = [
  {
    id: "strategic",
    label: "Strategic",
    description: "Vision, mission, outcomes, OKRs, and the decisions that shape product direction",
    tier: "core",
    types: [
      "product",
      "outcome",
      "kpi",
      "objective",
      "key_result",
      "metric",
      "vision",
      "mission",
      "strategic_theme",
      "initiative",
      "capability",
      "value_stream",
      "strategic_pillar",
      "assumption",
      "decision"
    ]
  },
  {
    id: "user",
    label: "User",
    description: "Personas, jobs-to-be-done, needs, and the demands that drive products",
    tier: "core",
    types: [
      "persona",
      "jtbd",
      "need",
      "desired_outcome",
      "job_step",
      "user_need",
      "switching_cost"
    ]
  },
  {
    id: "discovery",
    label: "Discovery",
    description: "Opportunities, solutions, feasibility studies, and design sprints",
    tier: "core",
    types: ["opportunity", "solution", "feasibility_study", "design_sprint"]
  },
  {
    id: "validation",
    label: "Validation",
    description: "Hypotheses, experiments, evidence, and the learning that confirms or kills ideas",
    tier: "core",
    types: ["hypothesis", "experiment", "learning", "test_plan", "evidence", "research_plan"]
  },
  {
    id: "market_intelligence",
    label: "Market Intelligence",
    description: "Competitors, trends, segments, and the landscape analysis that informs strategy",
    tier: "core",
    types: ["competitor", "competitor_feature", "market_trend", "market_segment", "competitive_analysis"]
  },
  {
    id: "ux_research",
    label: "UX Research",
    description: "Studies, participants, observations, quotes, clusters, and the full research toolkit",
    tier: "core",
    types: [
      "research_study",
      "insight",
      "participant",
      "observation",
      "quote",
      "affinity_cluster",
      "research_question",
      "interview_guide",
      "finding",
      "survey_response",
      "highlight"
    ]
  },
  {
    id: "design",
    label: "Design",
    description: "Journeys, prototypes, components, tokens, and the design system",
    tier: "core",
    types: [
      "user_journey",
      "journey_step",
      "ux_insight",
      "how_might_we",
      "design_concept",
      "prototype",
      "design_component",
      "design_token",
      "brand_identity",
      "brand_colour",
      "brand_typography",
      "brand_voice",
      "wireframe",
      "design_pattern",
      "design_guideline",
      "annotation",
      "interaction_spec",
      "design_system",
      "user_flow",
      "screen",
      "screen_state"
    ]
  },
  {
    id: "product_spec",
    label: "Product Spec",
    description: "Features, epics, stories, releases, roadmaps, and the backlog that ships value",
    tier: "core",
    types: [
      "feature",
      "epic",
      "user_story",
      "acceptance_criterion",
      "release",
      "task",
      "bug",
      "roadmap",
      "roadmap_item",
      "theme",
      "changelog"
    ]
  },
  {
    id: "engineering",
    label: "Engineering",
    description: "Services, APIs, architecture decisions, and the technical backbone",
    tier: "core",
    types: [
      "bounded_context",
      "service",
      "domain_event",
      "api_contract",
      "architecture_decision",
      "technical_debt_item",
      "feature_flag",
      "deployment",
      "aggregate",
      "domain_entity",
      "value_object",
      "command",
      "read_model",
      "api_endpoint",
      "database_schema",
      "queue_topic",
      "build_artifact",
      "code_repository",
      "library_dependency",
      "integration_pattern",
      "external_api",
      "data_flow"
    ]
  },
  {
    id: "growth",
    label: "Growth",
    description: "North-star metrics, funnels, loops, and the experiments that move them",
    tier: "core",
    types: [
      "north_star_metric",
      "input_metric",
      "funnel",
      "funnel_step",
      "acquisition_channel",
      "campaign",
      "cohort",
      "segment",
      "growth_loop",
      "growth_experiment",
      "variant",
      "attribution_model"
    ]
  },
  {
    id: "business_model",
    label: "Business Model",
    description: "Value propositions, revenue streams, costs, and unit economics",
    tier: "core",
    types: [
      "business_model",
      "value_proposition",
      "revenue_stream",
      "pricing_tier",
      "cost_structure",
      "unit_economics",
      "partnership",
      "key_resource",
      "key_activity",
      "customer_segment_bm",
      "channel_bm",
      "customer_relationship",
      "distribution_channel"
    ]
  },
  {
    id: "go_to_market",
    label: "Go-To-Market",
    description: "Positioning, messaging, launches, and the plan to reach customers",
    tier: "core",
    types: [
      "gtm_strategy",
      "ideal_customer_profile",
      "positioning",
      "messaging",
      "launch",
      "content_strategy",
      "sales_motion",
      "competitive_battle_card",
      "demand_gen_program",
      "territory",
      "objection",
      "rebuttal",
      "proof_point"
    ]
  },
  {
    id: "team_org",
    label: "Team & Organisation",
    description: "Teams, roles, stakeholders, and how the organisation operates",
    tier: "core",
    types: [
      "team",
      "role",
      "stakeholder",
      "product_decision",
      "team_okr",
      "retrospective",
      "dependency",
      "department",
      "skill",
      "ceremony",
      "capacity_plan"
    ]
  },
  {
    id: "data_analytics",
    label: "Data & Analytics",
    description: "Sources, metrics, pipelines, dashboards, and data governance",
    tier: "core",
    types: [
      "data_source",
      "metric_definition",
      "event_schema",
      "dashboard",
      "ab_test",
      "data_model",
      "data_quality_rule",
      "data_product",
      "data_pipeline",
      "data_lineage",
      "glossary_term",
      "data_domain",
      "report"
    ]
  },
  {
    id: "content",
    label: "Content & Knowledge",
    description: "Articles, brand assets, templates, and the content calendar",
    tier: "core",
    types: [
      "content_piece",
      "knowledge_base_article",
      "brand_asset",
      "internal_doc",
      "prompt_template",
      "content_calendar",
      "content_theme",
      "documentation_template"
    ]
  },
  {
    id: "legal_compliance",
    label: "Legal & Compliance",
    description: "Contracts, business entities, IP, compliance, and risk management",
    tier: "core",
    types: [
      "compliance_requirement",
      "risk",
      "data_contract",
      "legal_entity",
      "ip_asset",
      "audit_log_policy",
      "contract",
      "contract_clause",
      "privacy_policy",
      "compliance_framework",
      "security_audit"
    ]
  },
  {
    id: "devops",
    label: "DevOps & Platform",
    description: "SLIs, incidents, runbooks, and the reliability stack",
    tier: "core",
    types: [
      "sli",
      "slo",
      "error_budget",
      "incident",
      "postmortem",
      "runbook",
      "monitor",
      "alert_rule",
      "ci_pipeline",
      "release_strategy",
      "on_call_rotation",
      "infrastructure_component"
    ]
  },
  {
    id: "security",
    label: "Security",
    description: "Threat models, vulnerabilities, controls, and security reviews",
    tier: "core",
    types: [
      "threat_model",
      "threat",
      "vulnerability",
      "security_control",
      "security_policy",
      "security_incident",
      "penetration_test",
      "security_review",
      "data_classification",
      "access_policy"
    ]
  },
  {
    id: "accessibility",
    label: "Accessibility",
    description: "Standards, audits, and the practices that keep your product inclusive",
    tier: "core",
    types: ["a11y_standard", "a11y_guideline", "a11y_audit", "a11y_issue", "a11y_annotation"]
  },
  {
    id: "qa_testing",
    label: "QA & Testing",
    description: "Test suites, coverage reports, and quality assurance",
    tier: "core",
    types: [
      "test_suite",
      "test_case",
      "qa_session",
      "regression_test",
      "test_coverage_report",
      "test_environment",
      "defect_report"
    ]
  },
  {
    id: "feedback_voc",
    label: "Feedback & Voice of Customer",
    description: "Feature requests, NPS, beta programs, and the voice of the customer",
    tier: "core",
    types: [
      "feedback_program",
      "feature_request",
      "feedback_vote",
      "nps_campaign",
      "user_advisory_board",
      "beta_program",
      "feedback_theme"
    ]
  },
  {
    id: "pricing",
    label: "Pricing & Packaging",
    description: "Strategies, experiments, packages, and paywall configuration",
    tier: "core",
    types: [
      "pricing_strategy",
      "pricing_experiment",
      "package",
      "discount_strategy",
      "trial_config",
      "paywall"
    ]
  },
  {
    id: "ai_ml",
    label: "AI/ML Operations",
    description: "Models, prompts, evaluations, and guardrails for AI features",
    tier: "core",
    types: [
      "ai_model",
      "prompt_version",
      "eval_benchmark",
      "eval_run",
      "ai_cost_tracker",
      "hallucination_report",
      "ai_guardrail",
      "model_comparison"
    ]
  },
  {
    id: "agentic",
    label: "Agentic Workflows",
    description: "Workflows, agents, skills, and the automation layer",
    tier: "core",
    types: [
      "workflow_template",
      "workflow_run",
      "agent_definition",
      "agent_session",
      "review_gate",
      "approval_record",
      "agent_skill",
      "agent_hook",
      "workflow_artifact"
    ]
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Organisations, portfolios, and product areas for multi-product management",
    tier: "core",
    types: ["organization", "portfolio", "product_area"]
  },
  {
    id: "sales",
    label: "Sales & Revenue",
    description: "Accounts, deals, pipeline stages, and revenue forecasting",
    tier: "extended",
    types: [
      "account",
      "contact",
      "lead",
      "deal",
      "pipeline_sales",
      "pipeline_stage",
      "quote_document",
      "subscription",
      "invoice",
      "forecast"
    ]
  },
  {
    id: "program_mgmt",
    label: "Program Management",
    description: "Programs, projects, milestones, and cross-team delivery",
    tier: "extended",
    types: [
      "program",
      "project",
      "milestone",
      "risk_register",
      "risk_item",
      "change_request",
      "deliverable",
      "resource_allocation",
      "status_report"
    ]
  },
  {
    id: "marketing_ops",
    label: "Marketing Operations",
    description: "Campaign execution, channels, email sequences, ad creatives, and SEO",
    tier: "extended",
    types: [
      "marketing_strategy",
      "marketing_channel",
      "marketing_campaign_plan",
      "email_sequence",
      "social_post",
      "seo_keyword",
      "ad_creative",
      "press_release",
      "event",
      "community_initiative"
    ]
  },
  {
    id: "ops_cs",
    label: "Operations & Customer Success",
    description: "Support workflows, SLAs, health scores, and customer success at scale",
    tier: "extended",
    types: [
      "support_ticket",
      "customer_feedback",
      "churn_reason",
      "onboarding_flow",
      "customer_health_score",
      "playbook",
      "sla",
      "customer_journey_stage",
      "touchpoint",
      "success_milestone",
      "service_blueprint",
      "nps_score"
    ]
  },
  {
    id: "localisation",
    label: "Localisation & i18n",
    description: "Locales, translations, and cultural adaptations for global reach",
    tier: "extended",
    types: [
      "locale",
      "translation_key",
      "translation_bundle",
      "locale_config",
      "cultural_adaptation",
      "regional_pricing"
    ]
  },
  {
    id: "education",
    label: "Customer Education",
    description: "Tutorials, walkthroughs, certifications, and learning paths",
    tier: "extended",
    types: [
      "education_program",
      "tutorial",
      "walkthrough",
      "webinar",
      "certification",
      "help_video",
      "learning_path"
    ]
  },
  {
    id: "partners",
    label: "Partners & Ecosystem",
    description: "Partner programs, integrations, and the ecosystem around your product",
    tier: "extended",
    types: [
      "partner_program",
      "partner_tier",
      "api_ecosystem",
      "marketplace_listing",
      "developer_portal",
      "integration_partner",
      "partner_revenue_share"
    ]
  }
];
function getDomainsForTier(tier) {
  if (tier === "core")
    return UPG_DOMAINS.filter((d) => d.tier === "core");
  return [...UPG_DOMAINS];
}
function getTypesForTier(tier) {
  return getDomainsForTier(tier).flatMap((d) => [...d.types]);
}

// ../upg-spec/dist/entity-meta.js
var UPG_ENTITY_META = [
  // ── Strategic (core) ──
  { name: "product", type_id: "ent_001", maturity: "stable", since: "0.1.0" },
  { name: "outcome", type_id: "ent_002", maturity: "stable", since: "0.1.0" },
  { name: "kpi", type_id: "ent_003", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "metric" },
  { name: "objective", type_id: "ent_004", maturity: "stable", since: "0.1.0" },
  { name: "key_result", type_id: "ent_005", maturity: "stable", since: "0.1.0" },
  { name: "metric", type_id: "ent_006", maturity: "stable", since: "0.1.0" },
  { name: "vision", type_id: "ent_007", maturity: "stable", since: "0.1.0" },
  { name: "mission", type_id: "ent_008", maturity: "stable", since: "0.1.0" },
  { name: "strategic_theme", type_id: "ent_009", maturity: "stable", since: "0.1.0" },
  { name: "initiative", type_id: "ent_010", maturity: "stable", since: "0.1.0" },
  { name: "capability", type_id: "ent_011", maturity: "stable", since: "0.1.0" },
  { name: "value_stream", type_id: "ent_012", maturity: "stable", since: "0.1.0" },
  { name: "strategic_pillar", type_id: "ent_013", maturity: "stable", since: "0.1.0" },
  { name: "assumption", type_id: "ent_014", maturity: "stable", since: "0.1.0" },
  { name: "decision", type_id: "ent_015", maturity: "stable", since: "0.1.0" },
  // ── User (core) ──
  { name: "persona", type_id: "ent_016", maturity: "stable", since: "0.1.0" },
  { name: "jtbd", type_id: "ent_017", maturity: "stable", since: "0.1.0" },
  { name: "pain_point", type_id: "ent_018", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "need" },
  { name: "desired_outcome", type_id: "ent_019", maturity: "stable", since: "0.1.0" },
  { name: "job_step", type_id: "ent_020", maturity: "stable", since: "0.1.0" },
  { name: "user_need", type_id: "ent_021", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "need" },
  { name: "switching_cost", type_id: "ent_022", maturity: "stable", since: "0.1.0" },
  // ── Discovery (core) ──
  { name: "opportunity", type_id: "ent_023", maturity: "stable", since: "0.1.0" },
  { name: "solution", type_id: "ent_024", maturity: "stable", since: "0.1.0" },
  { name: "feasibility_study", type_id: "ent_025", maturity: "stable", since: "0.1.0" },
  { name: "design_sprint", type_id: "ent_026", maturity: "stable", since: "0.1.0" },
  // ── Validation (core) ──
  { name: "hypothesis", type_id: "ent_027", maturity: "stable", since: "0.1.0" },
  { name: "experiment", type_id: "ent_028", maturity: "stable", since: "0.1.0" },
  { name: "learning", type_id: "ent_029", maturity: "stable", since: "0.1.0" },
  { name: "test_plan", type_id: "ent_030", maturity: "stable", since: "0.1.0" },
  { name: "evidence", type_id: "ent_031", maturity: "stable", since: "0.1.0" },
  { name: "research_plan", type_id: "ent_032", maturity: "stable", since: "0.1.0" },
  // ── Market Intelligence (core) ──
  { name: "competitor", type_id: "ent_033", maturity: "stable", since: "0.1.0" },
  { name: "competitor_feature", type_id: "ent_034", maturity: "stable", since: "0.1.0" },
  { name: "market_trend", type_id: "ent_035", maturity: "stable", since: "0.1.0" },
  { name: "market_segment", type_id: "ent_036", maturity: "stable", since: "0.1.0" },
  { name: "competitive_analysis", type_id: "ent_037", maturity: "stable", since: "0.1.0" },
  // ── UX Research (core) ──
  { name: "research_study", type_id: "ent_038", maturity: "stable", since: "0.1.0" },
  { name: "research_insight", type_id: "ent_039", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "insight" },
  { name: "insight", type_id: "ent_040", maturity: "stable", since: "0.1.0" },
  { name: "participant", type_id: "ent_041", maturity: "stable", since: "0.1.0" },
  { name: "observation", type_id: "ent_042", maturity: "stable", since: "0.1.0" },
  { name: "quote", type_id: "ent_043", maturity: "stable", since: "0.1.0" },
  { name: "affinity_cluster", type_id: "ent_044", maturity: "stable", since: "0.1.0" },
  { name: "research_question", type_id: "ent_045", maturity: "stable", since: "0.1.0" },
  { name: "interview_guide", type_id: "ent_046", maturity: "stable", since: "0.1.0" },
  { name: "finding", type_id: "ent_047", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "insight" },
  { name: "survey_response", type_id: "ent_048", maturity: "stable", since: "0.1.0" },
  { name: "highlight", type_id: "ent_049", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "observation" },
  // ── Design (core) ──
  { name: "user_journey", type_id: "ent_050", maturity: "stable", since: "0.1.0" },
  { name: "journey_step", type_id: "ent_051", maturity: "stable", since: "0.1.0" },
  { name: "ux_insight", type_id: "ent_052", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "insight" },
  { name: "how_might_we", type_id: "ent_053", maturity: "stable", since: "0.1.0" },
  { name: "design_concept", type_id: "ent_054", maturity: "stable", since: "0.1.0" },
  { name: "prototype", type_id: "ent_055", maturity: "stable", since: "0.1.0" },
  { name: "design_component", type_id: "ent_056", maturity: "stable", since: "0.1.0" },
  { name: "design_token", type_id: "ent_057", maturity: "stable", since: "0.1.0" },
  { name: "brand_identity", type_id: "ent_058", maturity: "stable", since: "0.1.0" },
  { name: "brand_colour", type_id: "ent_059", maturity: "stable", since: "0.1.0" },
  { name: "brand_typography", type_id: "ent_060", maturity: "stable", since: "0.1.0" },
  { name: "brand_voice", type_id: "ent_061", maturity: "stable", since: "0.1.0" },
  { name: "wireframe", type_id: "ent_062", maturity: "stable", since: "0.1.0" },
  { name: "design_pattern", type_id: "ent_063", maturity: "stable", since: "0.1.0" },
  { name: "design_guideline", type_id: "ent_064", maturity: "stable", since: "0.1.0" },
  { name: "annotation", type_id: "ent_065", maturity: "stable", since: "0.1.0" },
  { name: "interaction_spec", type_id: "ent_066", maturity: "stable", since: "0.1.0" },
  { name: "design_system", type_id: "ent_067", maturity: "stable", since: "0.1.0" },
  { name: "user_flow", type_id: "ent_068", maturity: "stable", since: "0.1.0" },
  { name: "screen", type_id: "ent_069", maturity: "stable", since: "0.1.0" },
  { name: "screen_state", type_id: "ent_070", maturity: "stable", since: "0.1.0" },
  // ── Product Spec (core) ──
  { name: "feature", type_id: "ent_071", maturity: "stable", since: "0.1.0" },
  { name: "epic", type_id: "ent_072", maturity: "stable", since: "0.1.0" },
  { name: "user_story", type_id: "ent_073", maturity: "stable", since: "0.1.0" },
  { name: "acceptance_criterion", type_id: "ent_074", maturity: "stable", since: "0.1.0" },
  { name: "release", type_id: "ent_075", maturity: "stable", since: "0.1.0" },
  { name: "task", type_id: "ent_076", maturity: "stable", since: "0.1.0" },
  { name: "bug", type_id: "ent_077", maturity: "stable", since: "0.1.0" },
  { name: "roadmap", type_id: "ent_078", maturity: "stable", since: "0.1.0" },
  { name: "roadmap_item", type_id: "ent_079", maturity: "stable", since: "0.1.0" },
  { name: "theme", type_id: "ent_080", maturity: "stable", since: "0.1.0" },
  { name: "changelog", type_id: "ent_081", maturity: "stable", since: "0.1.0" },
  // ── Engineering (core) ──
  { name: "bounded_context", type_id: "ent_082", maturity: "stable", since: "0.1.0" },
  { name: "service", type_id: "ent_083", maturity: "stable", since: "0.1.0" },
  { name: "domain_event", type_id: "ent_084", maturity: "stable", since: "0.1.0" },
  { name: "api_contract", type_id: "ent_085", maturity: "stable", since: "0.1.0" },
  { name: "architecture_decision", type_id: "ent_086", maturity: "stable", since: "0.1.0" },
  { name: "technical_debt_item", type_id: "ent_087", maturity: "stable", since: "0.1.0" },
  { name: "feature_flag", type_id: "ent_088", maturity: "stable", since: "0.1.0" },
  { name: "deployment", type_id: "ent_089", maturity: "stable", since: "0.1.0" },
  { name: "aggregate", type_id: "ent_090", maturity: "stable", since: "0.1.0" },
  { name: "domain_entity", type_id: "ent_091", maturity: "stable", since: "0.1.0" },
  { name: "value_object", type_id: "ent_092", maturity: "stable", since: "0.1.0" },
  { name: "command", type_id: "ent_093", maturity: "stable", since: "0.1.0" },
  { name: "read_model", type_id: "ent_094", maturity: "stable", since: "0.1.0" },
  { name: "api_endpoint", type_id: "ent_095", maturity: "stable", since: "0.1.0" },
  { name: "database_schema", type_id: "ent_096", maturity: "stable", since: "0.1.0" },
  { name: "queue_topic", type_id: "ent_097", maturity: "stable", since: "0.1.0" },
  { name: "build_artifact", type_id: "ent_098", maturity: "stable", since: "0.1.0" },
  { name: "code_repository", type_id: "ent_099", maturity: "stable", since: "0.1.0" },
  { name: "library_dependency", type_id: "ent_100", maturity: "stable", since: "0.1.0" },
  { name: "integration_pattern", type_id: "ent_101", maturity: "stable", since: "0.1.0" },
  { name: "external_api", type_id: "ent_102", maturity: "stable", since: "0.1.0" },
  { name: "data_flow", type_id: "ent_103", maturity: "stable", since: "0.1.0" },
  // ── Growth (core) ──
  { name: "north_star_metric", type_id: "ent_104", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "metric" },
  { name: "input_metric", type_id: "ent_105", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "metric" },
  { name: "funnel", type_id: "ent_106", maturity: "stable", since: "0.1.0" },
  { name: "funnel_step", type_id: "ent_107", maturity: "stable", since: "0.1.0" },
  { name: "acquisition_channel", type_id: "ent_108", maturity: "stable", since: "0.1.0" },
  { name: "campaign", type_id: "ent_109", maturity: "stable", since: "0.1.0" },
  { name: "cohort", type_id: "ent_110", maturity: "stable", since: "0.1.0" },
  { name: "segment", type_id: "ent_111", maturity: "stable", since: "0.1.0" },
  { name: "growth_loop", type_id: "ent_112", maturity: "stable", since: "0.1.0" },
  { name: "growth_experiment", type_id: "ent_113", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "experiment" },
  { name: "variant", type_id: "ent_114", maturity: "stable", since: "0.1.0" },
  { name: "attribution_model", type_id: "ent_115", maturity: "stable", since: "0.1.0" },
  // ── Business Model (core) ──
  { name: "business_model", type_id: "ent_116", maturity: "stable", since: "0.1.0" },
  { name: "value_proposition", type_id: "ent_117", maturity: "stable", since: "0.1.0" },
  { name: "revenue_stream", type_id: "ent_118", maturity: "stable", since: "0.1.0" },
  { name: "pricing_tier", type_id: "ent_119", maturity: "stable", since: "0.1.0" },
  { name: "cost_structure", type_id: "ent_120", maturity: "stable", since: "0.1.0" },
  { name: "unit_economics", type_id: "ent_121", maturity: "stable", since: "0.1.0" },
  { name: "partnership", type_id: "ent_122", maturity: "stable", since: "0.1.0" },
  { name: "key_resource", type_id: "ent_123", maturity: "stable", since: "0.1.0" },
  { name: "key_activity", type_id: "ent_124", maturity: "stable", since: "0.1.0" },
  { name: "customer_segment_bm", type_id: "ent_125", maturity: "stable", since: "0.1.0" },
  { name: "channel_bm", type_id: "ent_126", maturity: "stable", since: "0.1.0" },
  { name: "customer_relationship", type_id: "ent_127", maturity: "stable", since: "0.1.0" },
  { name: "distribution_channel", type_id: "ent_128", maturity: "stable", since: "0.1.0" },
  // ── Go-To-Market (core) ──
  { name: "gtm_strategy", type_id: "ent_129", maturity: "stable", since: "0.1.0" },
  { name: "ideal_customer_profile", type_id: "ent_130", maturity: "stable", since: "0.1.0" },
  { name: "positioning", type_id: "ent_131", maturity: "stable", since: "0.1.0" },
  { name: "messaging", type_id: "ent_132", maturity: "stable", since: "0.1.0" },
  { name: "launch", type_id: "ent_133", maturity: "stable", since: "0.1.0" },
  { name: "content_strategy", type_id: "ent_134", maturity: "stable", since: "0.1.0" },
  { name: "sales_motion", type_id: "ent_135", maturity: "stable", since: "0.1.0" },
  { name: "competitive_battle_card", type_id: "ent_136", maturity: "stable", since: "0.1.0" },
  { name: "demand_gen_program", type_id: "ent_137", maturity: "stable", since: "0.1.0" },
  { name: "territory", type_id: "ent_138", maturity: "stable", since: "0.1.0" },
  { name: "objection", type_id: "ent_139", maturity: "stable", since: "0.1.0" },
  { name: "rebuttal", type_id: "ent_140", maturity: "stable", since: "0.1.0" },
  { name: "proof_point", type_id: "ent_141", maturity: "stable", since: "0.1.0" },
  // ── Team & Organisation (core) ──
  { name: "team", type_id: "ent_142", maturity: "stable", since: "0.1.0" },
  { name: "role", type_id: "ent_143", maturity: "stable", since: "0.1.0" },
  { name: "stakeholder", type_id: "ent_144", maturity: "stable", since: "0.1.0" },
  { name: "product_decision", type_id: "ent_145", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "decision" },
  { name: "team_okr", type_id: "ent_146", maturity: "stable", since: "0.1.0" },
  { name: "retrospective", type_id: "ent_147", maturity: "stable", since: "0.1.0" },
  { name: "dependency", type_id: "ent_148", maturity: "stable", since: "0.1.0" },
  { name: "department", type_id: "ent_149", maturity: "stable", since: "0.1.0" },
  { name: "skill", type_id: "ent_150", maturity: "stable", since: "0.1.0" },
  { name: "ceremony", type_id: "ent_151", maturity: "stable", since: "0.1.0" },
  { name: "capacity_plan", type_id: "ent_152", maturity: "stable", since: "0.1.0" },
  // ── Data & Analytics (core) ──
  { name: "data_source", type_id: "ent_153", maturity: "stable", since: "0.1.0" },
  { name: "metric_definition", type_id: "ent_154", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "metric" },
  { name: "event_schema", type_id: "ent_155", maturity: "stable", since: "0.1.0" },
  { name: "dashboard", type_id: "ent_156", maturity: "stable", since: "0.1.0" },
  { name: "ab_test", type_id: "ent_157", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "experiment" },
  { name: "data_model", type_id: "ent_158", maturity: "stable", since: "0.1.0" },
  { name: "data_quality_rule", type_id: "ent_159", maturity: "stable", since: "0.1.0" },
  { name: "data_product", type_id: "ent_160", maturity: "stable", since: "0.1.0" },
  { name: "data_pipeline", type_id: "ent_161", maturity: "stable", since: "0.1.0" },
  { name: "data_lineage", type_id: "ent_162", maturity: "stable", since: "0.1.0" },
  { name: "glossary_term", type_id: "ent_163", maturity: "stable", since: "0.1.0" },
  { name: "data_domain", type_id: "ent_164", maturity: "stable", since: "0.1.0" },
  { name: "report", type_id: "ent_165", maturity: "stable", since: "0.1.0" },
  // ── Content & Knowledge (core) ──
  { name: "content_piece", type_id: "ent_166", maturity: "stable", since: "0.1.0" },
  { name: "knowledge_base_article", type_id: "ent_167", maturity: "stable", since: "0.1.0" },
  { name: "brand_asset", type_id: "ent_168", maturity: "stable", since: "0.1.0" },
  { name: "internal_doc", type_id: "ent_169", maturity: "stable", since: "0.1.0" },
  { name: "prompt_template", type_id: "ent_170", maturity: "stable", since: "0.1.0" },
  { name: "content_calendar", type_id: "ent_171", maturity: "stable", since: "0.1.0" },
  { name: "content_theme", type_id: "ent_172", maturity: "stable", since: "0.1.0" },
  { name: "documentation_template", type_id: "ent_173", maturity: "stable", since: "0.1.0" },
  // ── Legal & Compliance (core) ──
  { name: "compliance_requirement", type_id: "ent_174", maturity: "stable", since: "0.1.0" },
  { name: "risk", type_id: "ent_175", maturity: "stable", since: "0.1.0" },
  { name: "data_contract", type_id: "ent_176", maturity: "stable", since: "0.1.0" },
  { name: "legal_entity", type_id: "ent_177", maturity: "stable", since: "0.1.0" },
  { name: "ip_asset", type_id: "ent_178", maturity: "stable", since: "0.1.0" },
  { name: "audit_log_policy", type_id: "ent_179", maturity: "stable", since: "0.1.0" },
  { name: "contract", type_id: "ent_180", maturity: "stable", since: "0.1.0" },
  { name: "contract_clause", type_id: "ent_181", maturity: "stable", since: "0.1.0" },
  { name: "privacy_policy", type_id: "ent_182", maturity: "stable", since: "0.1.0" },
  { name: "compliance_framework", type_id: "ent_183", maturity: "stable", since: "0.1.0" },
  { name: "security_audit", type_id: "ent_184", maturity: "stable", since: "0.1.0" },
  // ── DevOps & Platform (core) ──
  { name: "sli", type_id: "ent_185", maturity: "stable", since: "0.1.0" },
  { name: "slo", type_id: "ent_186", maturity: "stable", since: "0.1.0" },
  { name: "error_budget", type_id: "ent_187", maturity: "stable", since: "0.1.0" },
  { name: "incident", type_id: "ent_188", maturity: "stable", since: "0.1.0" },
  { name: "postmortem", type_id: "ent_189", maturity: "stable", since: "0.1.0" },
  { name: "runbook", type_id: "ent_190", maturity: "stable", since: "0.1.0" },
  { name: "monitor", type_id: "ent_191", maturity: "stable", since: "0.1.0" },
  { name: "alert_rule", type_id: "ent_192", maturity: "stable", since: "0.1.0" },
  { name: "ci_pipeline", type_id: "ent_193", maturity: "stable", since: "0.1.0" },
  { name: "release_strategy", type_id: "ent_194", maturity: "stable", since: "0.1.0" },
  { name: "on_call_rotation", type_id: "ent_195", maturity: "stable", since: "0.1.0" },
  { name: "infrastructure_component", type_id: "ent_196", maturity: "stable", since: "0.1.0" },
  // ── Security (core) ──
  { name: "threat_model", type_id: "ent_197", maturity: "stable", since: "0.1.0" },
  { name: "threat", type_id: "ent_198", maturity: "stable", since: "0.1.0" },
  { name: "vulnerability", type_id: "ent_199", maturity: "stable", since: "0.1.0" },
  { name: "security_control", type_id: "ent_200", maturity: "stable", since: "0.1.0" },
  { name: "security_policy", type_id: "ent_201", maturity: "stable", since: "0.1.0" },
  { name: "security_incident", type_id: "ent_202", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "incident" },
  { name: "penetration_test", type_id: "ent_203", maturity: "stable", since: "0.1.0" },
  { name: "security_review", type_id: "ent_204", maturity: "stable", since: "0.1.0" },
  { name: "data_classification", type_id: "ent_205", maturity: "stable", since: "0.1.0" },
  { name: "access_policy", type_id: "ent_206", maturity: "stable", since: "0.1.0" },
  // ── Accessibility (core) ──
  { name: "a11y_standard", type_id: "ent_207", maturity: "stable", since: "0.1.0" },
  { name: "a11y_guideline", type_id: "ent_208", maturity: "stable", since: "0.1.0" },
  { name: "a11y_audit", type_id: "ent_209", maturity: "stable", since: "0.1.0" },
  { name: "a11y_issue", type_id: "ent_210", maturity: "stable", since: "0.1.0" },
  { name: "a11y_annotation", type_id: "ent_211", maturity: "stable", since: "0.1.0" },
  // ── QA & Testing (core) ──
  { name: "test_suite", type_id: "ent_212", maturity: "stable", since: "0.1.0" },
  { name: "test_case", type_id: "ent_213", maturity: "stable", since: "0.1.0" },
  { name: "qa_session", type_id: "ent_214", maturity: "stable", since: "0.1.0" },
  { name: "regression_test", type_id: "ent_215", maturity: "stable", since: "0.1.0" },
  { name: "test_coverage_report", type_id: "ent_216", maturity: "stable", since: "0.1.0" },
  { name: "test_environment", type_id: "ent_217", maturity: "stable", since: "0.1.0" },
  { name: "defect_report", type_id: "ent_218", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "support_ticket" },
  // ── Feedback & Voice of Customer (core) ──
  { name: "feedback_program", type_id: "ent_219", maturity: "stable", since: "0.1.0" },
  { name: "feature_request", type_id: "ent_220", maturity: "stable", since: "0.1.0" },
  { name: "feedback_vote", type_id: "ent_221", maturity: "stable", since: "0.1.0" },
  { name: "nps_campaign", type_id: "ent_222", maturity: "stable", since: "0.1.0" },
  { name: "user_advisory_board", type_id: "ent_223", maturity: "stable", since: "0.1.0" },
  { name: "beta_program", type_id: "ent_224", maturity: "stable", since: "0.1.0" },
  { name: "feedback_theme", type_id: "ent_225", maturity: "stable", since: "0.1.0" },
  // ── Pricing & Packaging (core) ──
  { name: "pricing_strategy", type_id: "ent_226", maturity: "stable", since: "0.1.0" },
  { name: "pricing_experiment", type_id: "ent_227", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "experiment" },
  { name: "package", type_id: "ent_228", maturity: "stable", since: "0.1.0" },
  { name: "discount_strategy", type_id: "ent_229", maturity: "stable", since: "0.1.0" },
  { name: "trial_config", type_id: "ent_230", maturity: "stable", since: "0.1.0" },
  { name: "paywall", type_id: "ent_231", maturity: "stable", since: "0.1.0" },
  // ── AI/ML Operations (core) ──
  { name: "ai_model", type_id: "ent_232", maturity: "stable", since: "0.1.0" },
  { name: "prompt_version", type_id: "ent_233", maturity: "stable", since: "0.1.0" },
  { name: "eval_benchmark", type_id: "ent_234", maturity: "stable", since: "0.1.0" },
  { name: "eval_run", type_id: "ent_235", maturity: "stable", since: "0.1.0" },
  { name: "ai_cost_tracker", type_id: "ent_236", maturity: "stable", since: "0.1.0" },
  { name: "hallucination_report", type_id: "ent_237", maturity: "stable", since: "0.1.0" },
  { name: "ai_guardrail", type_id: "ent_238", maturity: "stable", since: "0.1.0" },
  { name: "model_comparison", type_id: "ent_239", maturity: "stable", since: "0.1.0" },
  // ── Agentic Workflows (core) ──
  { name: "workflow_template", type_id: "ent_240", maturity: "stable", since: "0.1.0" },
  { name: "workflow_run", type_id: "ent_241", maturity: "stable", since: "0.1.0" },
  { name: "agent_definition", type_id: "ent_242", maturity: "stable", since: "0.1.0" },
  { name: "agent_session", type_id: "ent_243", maturity: "stable", since: "0.1.0" },
  { name: "review_gate", type_id: "ent_244", maturity: "stable", since: "0.1.0" },
  { name: "approval_record", type_id: "ent_245", maturity: "stable", since: "0.1.0" },
  { name: "agent_skill", type_id: "ent_246", maturity: "stable", since: "0.1.0" },
  { name: "agent_hook", type_id: "ent_247", maturity: "stable", since: "0.1.0" },
  { name: "workflow_artifact", type_id: "ent_248", maturity: "stable", since: "0.1.0" },
  // ── Portfolio (core) ──
  { name: "organization", type_id: "ent_249", maturity: "stable", since: "0.1.0" },
  { name: "portfolio", type_id: "ent_250", maturity: "stable", since: "0.1.0" },
  { name: "product_area", type_id: "ent_251", maturity: "stable", since: "0.1.0" },
  // ── Sales & Revenue (extended) ──
  { name: "account", type_id: "ent_252", maturity: "stable", since: "0.1.0" },
  { name: "contact", type_id: "ent_253", maturity: "stable", since: "0.1.0" },
  { name: "lead", type_id: "ent_254", maturity: "stable", since: "0.1.0" },
  { name: "deal", type_id: "ent_255", maturity: "stable", since: "0.1.0" },
  { name: "pipeline_sales", type_id: "ent_256", maturity: "stable", since: "0.1.0" },
  { name: "pipeline_stage", type_id: "ent_257", maturity: "stable", since: "0.1.0" },
  { name: "quote_document", type_id: "ent_258", maturity: "stable", since: "0.1.0" },
  { name: "subscription", type_id: "ent_259", maturity: "stable", since: "0.1.0" },
  { name: "invoice", type_id: "ent_260", maturity: "stable", since: "0.1.0" },
  { name: "forecast", type_id: "ent_261", maturity: "stable", since: "0.1.0" },
  // ── Program Management (extended) ──
  { name: "program", type_id: "ent_262", maturity: "stable", since: "0.1.0" },
  { name: "project", type_id: "ent_263", maturity: "stable", since: "0.1.0" },
  { name: "milestone", type_id: "ent_264", maturity: "stable", since: "0.1.0" },
  { name: "risk_register", type_id: "ent_265", maturity: "stable", since: "0.1.0" },
  { name: "risk_item", type_id: "ent_266", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "risk" },
  { name: "change_request", type_id: "ent_267", maturity: "stable", since: "0.1.0" },
  { name: "deliverable", type_id: "ent_268", maturity: "stable", since: "0.1.0" },
  { name: "resource_allocation", type_id: "ent_269", maturity: "stable", since: "0.1.0" },
  { name: "status_report", type_id: "ent_270", maturity: "stable", since: "0.1.0" },
  // ── Marketing Operations (extended) ──
  { name: "marketing_strategy", type_id: "ent_271", maturity: "stable", since: "0.1.0" },
  { name: "marketing_channel", type_id: "ent_272", maturity: "stable", since: "0.1.0" },
  { name: "marketing_campaign_plan", type_id: "ent_273", maturity: "stable", since: "0.1.0" },
  { name: "email_sequence", type_id: "ent_274", maturity: "stable", since: "0.1.0" },
  { name: "social_post", type_id: "ent_275", maturity: "stable", since: "0.1.0" },
  { name: "seo_keyword", type_id: "ent_276", maturity: "stable", since: "0.1.0" },
  { name: "ad_creative", type_id: "ent_277", maturity: "stable", since: "0.1.0" },
  { name: "press_release", type_id: "ent_278", maturity: "stable", since: "0.1.0" },
  { name: "event", type_id: "ent_279", maturity: "stable", since: "0.1.0" },
  { name: "community_initiative", type_id: "ent_280", maturity: "stable", since: "0.1.0" },
  // ── Operations & Customer Success (extended) ──
  { name: "support_ticket", type_id: "ent_281", maturity: "stable", since: "0.1.0" },
  { name: "customer_feedback", type_id: "ent_282", maturity: "stable", since: "0.1.0" },
  { name: "churn_reason", type_id: "ent_283", maturity: "stable", since: "0.1.0" },
  { name: "onboarding_flow", type_id: "ent_284", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "user_flow" },
  { name: "customer_health_score", type_id: "ent_285", maturity: "stable", since: "0.1.0" },
  { name: "playbook", type_id: "ent_286", maturity: "stable", since: "0.1.0" },
  { name: "sla", type_id: "ent_287", maturity: "stable", since: "0.1.0" },
  { name: "customer_journey_stage", type_id: "ent_288", maturity: "stable", since: "0.1.0" },
  { name: "touchpoint", type_id: "ent_289", maturity: "stable", since: "0.1.0" },
  { name: "success_milestone", type_id: "ent_290", maturity: "stable", since: "0.1.0" },
  { name: "service_blueprint", type_id: "ent_291", maturity: "stable", since: "0.1.0" },
  { name: "nps_score", type_id: "ent_292", maturity: "deprecated", since: "0.1.0", deprecated_in: "0.1.0", replacement: "nps_campaign" },
  // ── Localisation & i18n (extended) ──
  { name: "locale", type_id: "ent_293", maturity: "stable", since: "0.1.0" },
  { name: "translation_key", type_id: "ent_294", maturity: "stable", since: "0.1.0" },
  { name: "translation_bundle", type_id: "ent_295", maturity: "stable", since: "0.1.0" },
  { name: "locale_config", type_id: "ent_296", maturity: "stable", since: "0.1.0" },
  { name: "cultural_adaptation", type_id: "ent_297", maturity: "stable", since: "0.1.0" },
  { name: "regional_pricing", type_id: "ent_298", maturity: "stable", since: "0.1.0" },
  // ── Customer Education (extended) ──
  { name: "education_program", type_id: "ent_299", maturity: "stable", since: "0.1.0" },
  { name: "tutorial", type_id: "ent_300", maturity: "stable", since: "0.1.0" },
  { name: "walkthrough", type_id: "ent_301", maturity: "stable", since: "0.1.0" },
  { name: "webinar", type_id: "ent_302", maturity: "stable", since: "0.1.0" },
  { name: "certification", type_id: "ent_303", maturity: "stable", since: "0.1.0" },
  { name: "help_video", type_id: "ent_304", maturity: "stable", since: "0.1.0" },
  { name: "learning_path", type_id: "ent_305", maturity: "stable", since: "0.1.0" },
  // ── Partners & Ecosystem (extended) ──
  { name: "partner_program", type_id: "ent_306", maturity: "stable", since: "0.1.0" },
  { name: "partner_tier", type_id: "ent_307", maturity: "stable", since: "0.1.0" },
  { name: "api_ecosystem", type_id: "ent_308", maturity: "stable", since: "0.1.0" },
  { name: "marketplace_listing", type_id: "ent_309", maturity: "stable", since: "0.1.0" },
  { name: "developer_portal", type_id: "ent_310", maturity: "stable", since: "0.1.0" },
  { name: "integration_partner", type_id: "ent_311", maturity: "stable", since: "0.1.0" },
  { name: "partner_revenue_share", type_id: "ent_312", maturity: "stable", since: "0.1.0" },
  // ── Consolidated types ──
  { name: "need", type_id: "ent_313", maturity: "stable", since: "0.1.0" }
];
var UPG_ENTITY_META_BY_NAME = new Map(UPG_ENTITY_META.map((m) => [m.name, m]));
var UPG_ENTITY_META_BY_ID = new Map(UPG_ENTITY_META.map((m) => [m.type_id, m]));
var UPG_ACTIVE_TYPES = UPG_ENTITY_META.filter((m) => m.maturity === "stable" || m.maturity === "proposed").map((m) => m.name);
var UPG_DEPRECATED_TYPES = UPG_ENTITY_META.filter((m) => m.maturity === "deprecated").map((m) => m.name);

// ../upg-spec/dist/migrations.js
var UPG_MIGRATIONS = {
  "0.1.0": [
    // ── User layer: pain_point + user_need → need ──────────────────────────
    {
      from: "pain_point",
      to: "need",
      defaults: { valence: "pain" },
      reason: 'Consolidated into neutral "need" type with valence property. Framework labels provide context-specific display names (Problem in Lean Canvas, Struggle in JTBD, etc.)'
    },
    {
      from: "user_need",
      to: "need",
      defaults: { valence: "gap" },
      reason: 'Consolidated into "need" type. user_need was semantically identical to pain_point with different framing.'
    },
    // ── UX Research: insight consolidation ──────────────────────────────────
    {
      from: "research_insight",
      to: "insight",
      defaults: {},
      reason: "Already deprecated. Research insights are insights with research provenance."
    },
    {
      from: "finding",
      to: "insight",
      defaults: { insight_level: "finding" },
      reason: 'Already deprecated. Findings are insights at the "finding" level.'
    },
    {
      from: "ux_insight",
      to: "insight",
      defaults: { source_domain: "ux" },
      reason: "UX insights are insights with source_domain=ux. Not a distinct type."
    },
    {
      from: "highlight",
      to: "observation",
      defaults: { is_highlighted: true },
      reason: "Already deprecated. Highlights are flagged observations."
    },
    // ── Metrics consolidation ──────────────────────────────────────────────
    {
      from: "kpi",
      to: "metric",
      defaults: { designation: "kpi" },
      reason: 'KPI is a metric role (designation), not a distinct type. Metric.designation already supports "kpi".'
    },
    {
      from: "north_star_metric",
      to: "metric",
      defaults: { designation: "north_star" },
      reason: "Already deprecated. North star is a metric designation."
    },
    {
      from: "input_metric",
      to: "metric",
      defaults: { designation: "input" },
      reason: "Already deprecated. Input metric is a metric designation."
    },
    {
      from: "metric_definition",
      to: "metric",
      defaults: { has_implementation: false },
      reason: "A metric definition is a metric without implementation. Lifecycle property, not a separate type."
    },
    // ── Experiment consolidation ────────────────────────────────────────────
    {
      from: "ab_test",
      to: "experiment",
      defaults: { experiment_type: "ab_test" },
      reason: "A/B test is an experiment method. Experiment.experiment_type distinguishes methods."
    },
    {
      from: "growth_experiment",
      to: "experiment",
      defaults: { experiment_type: "growth" },
      reason: "Growth experiment is an experiment in growth context. experiment_type distinguishes context."
    },
    {
      from: "pricing_experiment",
      to: "experiment",
      defaults: { experiment_type: "pricing" },
      reason: "Pricing experiment is an experiment about pricing. experiment_type distinguishes context."
    },
    // ── Cross-domain consolidations ────────────────────────────────────────
    {
      from: "risk_item",
      to: "risk",
      defaults: { risk_domain: "program" },
      reason: "risk_item (Program Mgmt) is identical to risk (Legal). Consolidated with risk_domain property."
    },
    {
      from: "security_incident",
      to: "incident",
      defaults: { incident_type: "security" },
      reason: "Security incident is an incident with incident_type=security. Same structure, different context."
    },
    {
      from: "defect_report",
      to: "support_ticket",
      defaults: { ticket_designation: "defect" },
      reason: "Defect report is a support ticket with ticket_designation=defect. Same signal interface."
    },
    {
      from: "product_decision",
      to: "decision",
      defaults: { decision_domain: "product" },
      reason: "product_decision is a decision about products. decision_domain distinguishes context."
    },
    {
      from: "onboarding_flow",
      to: "user_flow",
      defaults: { flow_type: "onboarding" },
      reason: "Onboarding flow is a user flow with flow_type=onboarding. Same structure."
    },
    {
      from: "nps_score",
      to: "nps_campaign",
      defaults: {},
      reason: "NPS score demoted to a property of nps_campaign, not a standalone entity."
    }
  ]
};
function getDeprecatedTypes() {
  const deprecated = /* @__PURE__ */ new Set();
  for (const migrations of Object.values(UPG_MIGRATIONS)) {
    for (const m of migrations) {
      deprecated.add(m.from);
    }
  }
  return deprecated;
}

// ../upg-spec/dist/type-labels.js
var PRIORITY_LABELS = [
  // ── need (CONSOLIDATED: replaces pain_point + user_need) ─────────────────────
  {
    id: "need",
    canonical_label: "Need",
    alt_labels: [
      "pain point",
      "pain",
      "user need",
      "customer need",
      "problem",
      "struggle",
      "customer pain",
      "frustration",
      "gap",
      "unmet need",
      "user problem"
    ],
    framework_labels: {
      lean_canvas: "Problem",
      design_thinking: "Pain Point",
      ost: "Opportunity (need)",
      jtbd: "Struggle",
      vpc: "Customer Pain"
    },
    designations: {
      pain: "Pain Point",
      gap: "Need",
      desire: "Desire",
      constraint: "Constraint"
    }
  },
  // ── opportunity ──────────────────────────────────────────────────────────────
  {
    id: "opportunity",
    canonical_label: "Opportunity",
    alt_labels: ["product opportunity", "market opportunity", "user opportunity"],
    framework_labels: {
      ost: "Opportunity"
    }
  },
  // ── solution ─────────────────────────────────────────────────────────────────
  {
    id: "solution",
    canonical_label: "Solution",
    alt_labels: ["proposed solution", "solution idea", "concept", "approach"],
    framework_labels: {
      ost: "Solution",
      design_thinking: "Solution",
      lean_canvas: "Solution",
      rice: "Scored Solution"
    }
  },
  // ── experiment (CONSOLIDATED: absorbs ab_test, growth_experiment, pricing_experiment) ──
  {
    id: "experiment",
    canonical_label: "Experiment",
    alt_labels: [
      "test",
      "validation",
      "ab test",
      "a/b test",
      "split test",
      "growth experiment",
      "pricing experiment",
      "usability test",
      "discovery experiment"
    ],
    framework_labels: {
      ost: "Experiment",
      design_thinking: "Test",
      lean_startup: "Experiment"
    },
    designations: {
      discovery: "Discovery Experiment",
      ab_test: "A/B Test",
      growth: "Growth Experiment",
      pricing: "Pricing Experiment",
      usability: "Usability Test"
    }
  },
  // ── hypothesis ───────────────────────────────────────────────────────────────
  {
    id: "hypothesis",
    canonical_label: "Hypothesis",
    alt_labels: ["bet", "testable assumption", "leap of faith"],
    framework_labels: {
      lean_startup: "Hypothesis",
      running_lean: "Riskiest Assumption",
      lean_canvas: "Riskiest Assumption"
    }
  },
  // ── metric (CONSOLIDATED: absorbs kpi, north_star_metric, input_metric, metric_definition) ──
  {
    id: "metric",
    canonical_label: "Metric",
    alt_labels: [
      "kpi",
      "key performance indicator",
      "north star metric",
      "nsm",
      "input metric",
      "output metric",
      "metric definition",
      "measure",
      "indicator",
      "signal",
      "counter metric",
      "guardrail metric"
    ],
    framework_labels: {
      aarrr: "Pirate Metric",
      dora: "DORA Metric",
      lean_canvas: "Key Metric",
      okr_tree: "Key Result Metric"
    },
    designations: {
      north_star: "North Star Metric",
      kpi: "KPI",
      input: "Input Metric",
      output: "Output Metric",
      guardrail: "Guardrail Metric",
      counter: "Counter Metric",
      health: "Health Metric"
    }
  },
  // ── persona ──────────────────────────────────────────────────────────────────
  {
    id: "persona",
    canonical_label: "Persona",
    alt_labels: ["user persona", "buyer persona", "customer persona", "user type", "archetype", "actor"],
    framework_labels: {
      design_thinking: "Persona",
      lean_canvas: "Customer Segment",
      bmc: "Customer Archetype"
    }
  },
  // ── desired_outcome ──────────────────────────────────────────────────────────
  {
    id: "desired_outcome",
    canonical_label: "Desired Outcome",
    alt_labels: ["gain", "user gain", "customer gain", "expected outcome"],
    framework_labels: {
      ost: "Desired Outcome",
      jtbd: "Desired Outcome",
      vpc: "Customer Gain"
    }
  },
  // ── insight (CONSOLIDATED: absorbs research_insight, finding, ux_insight) ────
  {
    id: "insight",
    canonical_label: "Insight",
    alt_labels: [
      "research insight",
      "finding",
      "ux insight",
      "user insight",
      "discovery",
      "key finding",
      "research finding",
      "design insight",
      "analytics insight",
      "feedback insight"
    ],
    framework_labels: {
      design_thinking: "Finding",
      ost: "Insight"
    },
    designations: {
      atomic: "Atomic Insight",
      composite: "Composite Insight",
      strategic: "Strategic Insight"
    }
  },
  // ── jtbd ─────────────────────────────────────────────────────────────────────
  {
    id: "jtbd",
    canonical_label: "Job-to-be-Done",
    alt_labels: ["job to be done", "jtbd", "job", "customer job", "user job", "functional job", "social job", "emotional job"],
    framework_labels: {
      ost: "Opportunity (job)",
      design_thinking: "Task",
      jtbd: "Job",
      vpc: "Customer Job"
    }
  },
  // ── outcome ──────────────────────────────────────────────────────────────────
  {
    id: "outcome",
    canonical_label: "Outcome",
    alt_labels: ["desired outcome", "product outcome", "business outcome", "target outcome"],
    framework_labels: {
      ost: "Desired Outcome",
      okr_tree: "Outcome"
    }
  },
  // ── objective ────────────────────────────────────────────────────────────────
  {
    id: "objective",
    canonical_label: "Objective",
    alt_labels: ["goal", "strategic goal", "team goal"],
    framework_labels: {
      okr_tree: "Objective"
    }
  },
  // ── key_result ───────────────────────────────────────────────────────────────
  {
    id: "key_result",
    canonical_label: "Key Result",
    alt_labels: ["kr", "measurable result", "target"],
    framework_labels: {
      okr_tree: "Key Result"
    }
  },
  // ── feature ──────────────────────────────────────────────────────────────────
  {
    id: "feature",
    canonical_label: "Feature",
    alt_labels: ["capability", "product feature", "functionality"],
    framework_labels: {
      rice: "Scored Item",
      moscow: "Prioritised Item",
      kano: "Classified Feature"
    }
  },
  // ── user_story ───────────────────────────────────────────────────────────────
  {
    id: "user_story",
    canonical_label: "User Story",
    alt_labels: ["story", "requirement", "as a... i want... so that..."],
    framework_labels: {
      moscow: "Prioritised Story"
    }
  },
  // ── Business Model Canvas types ──────────────────────────────────────────────
  {
    id: "value_proposition",
    canonical_label: "Value Proposition",
    alt_labels: ["value prop", "vp", "unique value proposition", "uvp", "unfair advantage"],
    framework_labels: {
      bmc: "Value Proposition",
      lean_canvas: "Unique Value Proposition",
      vpc: "Value Map"
    }
  },
  {
    id: "partnership",
    canonical_label: "Partnership",
    alt_labels: ["key partner", "partner", "key partners", "strategic partner"],
    framework_labels: {
      bmc: "Key Partner"
    }
  },
  {
    id: "key_resource",
    canonical_label: "Key Resource",
    alt_labels: ["resource", "key asset", "critical resource"],
    framework_labels: {
      bmc: "Key Resource"
    }
  },
  {
    id: "key_activity",
    canonical_label: "Key Activity",
    alt_labels: ["activity", "core activity", "critical activity"],
    framework_labels: {
      bmc: "Key Activity"
    }
  },
  {
    id: "customer_segment_bm",
    canonical_label: "Customer Segment",
    alt_labels: ["customer segment", "segment", "target segment", "audience"],
    framework_labels: {
      bmc: "Customer Segment",
      lean_canvas: "Customer Segment"
    }
  },
  {
    id: "channel_bm",
    canonical_label: "Channel",
    alt_labels: ["channel", "distribution channel", "sales channel", "go-to-market channel"],
    framework_labels: {
      bmc: "Channel",
      lean_canvas: "Channel"
    }
  },
  {
    id: "customer_relationship",
    canonical_label: "Customer Relationship",
    alt_labels: ["relationship", "engagement model", "customer engagement"],
    framework_labels: {
      bmc: "Customer Relationship"
    }
  },
  {
    id: "revenue_stream",
    canonical_label: "Revenue Stream",
    alt_labels: ["revenue", "income stream", "monetization"],
    framework_labels: {
      bmc: "Revenue Stream",
      lean_canvas: "Revenue Stream"
    }
  },
  {
    id: "cost_structure",
    canonical_label: "Cost Structure",
    alt_labels: ["costs", "expense", "cost base", "operating cost"],
    framework_labels: {
      bmc: "Cost Structure",
      lean_canvas: "Cost Structure"
    }
  },
  // ── Design Thinking types ────────────────────────────────────────────────────
  {
    id: "observation",
    canonical_label: "Observation",
    alt_labels: ["field note", "user observation", "behavioural note", "ethnographic note"],
    framework_labels: {
      design_thinking: "Observation"
    }
  },
  {
    id: "how_might_we",
    canonical_label: "How Might We",
    alt_labels: ["hmw", "design challenge", "problem reframe", "opportunity question"],
    framework_labels: {
      design_thinking: "How Might We"
    }
  },
  {
    id: "design_concept",
    canonical_label: "Design Concept",
    alt_labels: ["concept", "design idea", "concept sketch"],
    framework_labels: {
      design_thinking: "Concept"
    }
  },
  {
    id: "prototype",
    canonical_label: "Prototype",
    alt_labels: ["mockup", "mock", "poc", "proof of concept", "lo-fi", "hi-fi"],
    framework_labels: {
      design_thinking: "Prototype"
    }
  },
  // ── AARRR types ──────────────────────────────────────────────────────────────
  {
    id: "funnel",
    canonical_label: "Funnel",
    alt_labels: ["conversion funnel", "user funnel", "marketing funnel", "sales funnel"],
    framework_labels: {
      aarrr: "AARRR Funnel"
    }
  },
  {
    id: "funnel_step",
    canonical_label: "Funnel Step",
    alt_labels: ["funnel stage", "conversion stage", "lifecycle stage"],
    framework_labels: {
      aarrr: "Pirate Metric Stage"
    }
  },
  // ── DORA types ───────────────────────────────────────────────────────────────
  {
    id: "deployment",
    canonical_label: "Deployment",
    alt_labels: ["deploy", "release deployment", "ship event"],
    framework_labels: {
      dora: "Deployment"
    }
  },
  {
    id: "ci_pipeline",
    canonical_label: "CI Pipeline",
    alt_labels: ["pipeline", "ci/cd", "build pipeline", "github actions workflow"],
    framework_labels: {
      dora: "Deployment Pipeline"
    }
  },
  {
    id: "sli",
    canonical_label: "SLI",
    alt_labels: ["service level indicator", "reliability indicator"],
    framework_labels: {
      dora: "Service Level Indicator"
    }
  },
  {
    id: "slo",
    canonical_label: "SLO",
    alt_labels: ["service level objective", "reliability target"],
    framework_labels: {
      dora: "Service Level Objective"
    }
  },
  // ── Consolidated types (non-priority but have designations) ──────────────────
  {
    id: "decision",
    canonical_label: "Decision",
    alt_labels: ["product decision", "strategic decision", "team decision"],
    framework_labels: {},
    designations: {
      product: "Product Decision",
      architecture: "Architecture Decision",
      strategic: "Strategic Decision",
      operational: "Operational Decision"
    }
  },
  {
    id: "risk",
    canonical_label: "Risk",
    alt_labels: ["risk item", "project risk", "programme risk"],
    framework_labels: {},
    designations: {
      technical: "Technical Risk",
      business: "Business Risk",
      legal: "Legal Risk",
      security: "Security Risk",
      program: "Program Risk"
    }
  },
  {
    id: "incident",
    canonical_label: "Incident",
    alt_labels: ["outage", "service incident", "security incident", "production incident"],
    framework_labels: {
      dora: "Incident"
    },
    designations: {
      operational: "Operational Incident",
      security: "Security Incident",
      performance: "Performance Incident"
    }
  },
  {
    id: "user_flow",
    canonical_label: "User Flow",
    alt_labels: ["flow", "task flow", "user path", "navigation path", "onboarding flow"],
    framework_labels: {},
    designations: {
      onboarding: "Onboarding Flow",
      activation: "Activation Flow",
      checkout: "Checkout Flow",
      general: "User Flow"
    }
  },
  {
    id: "support_ticket",
    canonical_label: "Support Ticket",
    alt_labels: [
      "ticket",
      "support case",
      "customer issue",
      "help request",
      "defect report",
      "bug report"
    ],
    framework_labels: {},
    designations: {
      question: "Support Question",
      bug: "Bug Report",
      feature_request: "Feature Request",
      defect: "Defect Report"
    }
  }
];
var STANDARD_LABELS = {
  // Strategic layer
  product: { alt_labels: ["offering", "app", "service", "platform"] },
  vision: { alt_labels: ["product vision", "north star vision", "long-term vision"] },
  mission: { alt_labels: ["mission statement", "purpose"] },
  strategic_theme: { alt_labels: ["theme", "strategic pillar", "focus area"] },
  initiative: { alt_labels: ["strategic initiative", "program initiative", "workstream"] },
  capability: { alt_labels: ["business capability", "organizational capability"] },
  value_stream: { alt_labels: ["value chain", "stream"] },
  strategic_pillar: { alt_labels: ["pillar", "foundation"] },
  assumption: { alt_labels: ["belief", "working assumption", "premise"] },
  // User layer
  job_step: { alt_labels: ["job stage", "job phase", "job map step"] },
  switching_cost: { alt_labels: ["lock-in", "migration cost", "switching barrier"] },
  // Discovery layer
  feasibility_study: { alt_labels: ["feasibility assessment", "viability study", "tech spike"] },
  design_sprint: { alt_labels: ["sprint", "gv sprint", "google ventures sprint"] },
  // Validation layer
  learning: { alt_labels: ["validated learning", "lesson learned", "takeaway"] },
  test_plan: { alt_labels: ["experiment plan", "validation plan"] },
  research_plan: { alt_labels: ["study plan", "research brief"] },
  evidence: { alt_labels: ["proof", "supporting data", "signal"] },
  variant: { alt_labels: ["test variant", "experiment arm", "variation"] },
  // Market layer
  competitor: { alt_labels: ["rival", "alternative", "competitive product", "competing product"] },
  competitor_feature: { alt_labels: ["competitive feature", "rival capability"] },
  market_trend: { alt_labels: ["trend", "industry trend", "macro trend"] },
  market_segment: { alt_labels: ["segment", "market slice", "tam segment", "sam segment"] },
  competitive_analysis: { alt_labels: ["competitor analysis", "competitive landscape", "market analysis"] },
  // UX Research layer
  research_study: { alt_labels: ["study", "user study", "research project", "ux study"] },
  participant: { alt_labels: ["research participant", "interviewee", "respondent", "test subject"] },
  quote: { alt_labels: ["user quote", "verbatim", "voice of customer"] },
  affinity_cluster: { alt_labels: ["cluster", "affinity group", "theme cluster", "affinity note"] },
  research_question: { alt_labels: ["rq", "study question", "inquiry"] },
  interview_guide: { alt_labels: ["discussion guide", "interview script", "moderator guide"] },
  survey_response: { alt_labels: ["survey answer", "questionnaire response"] },
  // Design layer
  user_journey: { alt_labels: ["journey map", "customer journey", "experience map", "journey"] },
  journey_step: { alt_labels: ["touchpoint", "journey stage", "journey phase"] },
  design_component: { alt_labels: ["component", "ui component", "design element"] },
  design_token: { alt_labels: ["token", "style token", "css variable"] },
  wireframe: { alt_labels: ["wireflow", "lo-fi mockup", "skeleton"] },
  design_pattern: { alt_labels: ["ui pattern", "ux pattern", "interaction pattern"] },
  design_guideline: { alt_labels: ["style guide", "design rule", "design standard"] },
  annotation: { alt_labels: ["design annotation", "spec note", "callout"] },
  interaction_spec: { alt_labels: ["interaction specification", "motion spec", "behaviour spec"] },
  design_system: { alt_labels: ["component library", "style system", "ui kit"] },
  screen: { alt_labels: ["page", "view", "route", "ui state"] },
  screen_state: { alt_labels: ["view state", "empty state", "loading state", "error state"] },
  // Brand layer
  brand_identity: { alt_labels: ["brand", "brand guidelines", "brand book"] },
  brand_colour: { alt_labels: ["brand color", "colour palette", "color palette"] },
  brand_typography: { alt_labels: ["typeface", "font family", "type system"] },
  brand_voice: { alt_labels: ["tone of voice", "brand tone", "writing style"] },
  // Product Specification layer
  epic: { alt_labels: ["initiative", "large story", "feature set"] },
  acceptance_criterion: { alt_labels: ["ac", "done criterion", "acceptance criteria", "definition of done"] },
  release: { alt_labels: ["version", "ship", "launch version", "build"] },
  task: { alt_labels: ["work item", "todo", "subtask", "ticket"] },
  bug: { alt_labels: ["defect", "issue", "regression"] },
  roadmap: { alt_labels: ["product roadmap", "release plan", "timeline"] },
  roadmap_item: { alt_labels: ["roadmap entry", "planned item"] },
  theme: { alt_labels: ["product theme", "bucket", "category"] },
  // Engineering layer
  bounded_context: { alt_labels: ["context", "domain boundary", "module boundary"] },
  service: { alt_labels: ["microservice", "backend service", "api service"] },
  domain_event: { alt_labels: ["event", "system event", "business event"] },
  api_contract: { alt_labels: ["api spec", "api schema", "contract", "openapi spec"] },
  architecture_decision: { alt_labels: ["adr", "architecture decision record", "tech decision", "arc"] },
  technical_debt_item: { alt_labels: ["tech debt", "debt", "tech debt item", "cleanup"] },
  feature_flag: { alt_labels: ["flag", "toggle", "feature toggle", "release flag"] },
  aggregate: { alt_labels: ["aggregate root", "ddd aggregate"] },
  domain_entity: { alt_labels: ["entity", "ddd entity", "domain object"] },
  value_object: { alt_labels: ["vo", "ddd value object"] },
  command: { alt_labels: ["cqrs command", "write command", "mutation"] },
  read_model: { alt_labels: ["projection", "query model", "cqrs read model"] },
  api_endpoint: { alt_labels: ["endpoint", "route", "api route"] },
  database_schema: { alt_labels: ["schema", "db schema", "table definition"] },
  queue_topic: { alt_labels: ["topic", "message queue", "event bus topic", "pubsub topic"] },
  build_artifact: { alt_labels: ["artifact", "binary", "docker image", "package"] },
  code_repository: { alt_labels: ["repo", "repository", "git repo", "codebase"] },
  library_dependency: { alt_labels: ["dependency", "package", "library", "npm package"] },
  integration_pattern: { alt_labels: ["integration", "pattern", "middleware pattern"] },
  external_api: { alt_labels: ["third-party api", "vendor api", "saas integration"] },
  data_flow: { alt_labels: ["data movement", "data transfer", "pipeline flow"] },
  // Growth layer
  acquisition_channel: { alt_labels: ["channel", "traffic source", "user source"] },
  campaign: { alt_labels: ["marketing campaign", "ad campaign", "growth campaign"] },
  cohort: { alt_labels: ["user cohort", "retention cohort", "signup cohort"] },
  segment: { alt_labels: ["user segment", "audience segment", "behavioural segment"] },
  growth_loop: { alt_labels: ["viral loop", "referral loop", "flywheel"] },
  attribution_model: { alt_labels: ["attribution", "marketing attribution", "channel attribution"] },
  // Business Model layer
  business_model: { alt_labels: ["model", "biz model"] },
  pricing_tier: { alt_labels: ["plan", "pricing plan", "tier"] },
  unit_economics: { alt_labels: ["unit econ", "ltv/cac", "economics"] },
  distribution_channel: { alt_labels: ["distribution", "delivery channel"] },
  // Go-To-Market layer
  gtm_strategy: { alt_labels: ["go-to-market strategy", "go to market", "gtm plan", "launch strategy"] },
  ideal_customer_profile: { alt_labels: ["icp", "target customer", "ideal buyer"] },
  positioning: { alt_labels: ["market positioning", "positioning statement", "brand position"] },
  messaging: { alt_labels: ["messaging framework", "value messaging", "key messages"] },
  launch: { alt_labels: ["product launch", "go-live", "ship date"] },
  content_strategy: { alt_labels: ["editorial strategy", "content plan"] },
  sales_motion: { alt_labels: ["sales model", "sales approach", "plg", "self-serve", "sales-led"] },
  competitive_battle_card: { alt_labels: ["battle card", "competitive card", "win/loss card"] },
  demand_gen_program: { alt_labels: ["demand generation", "demand gen", "lead gen program"] },
  territory: { alt_labels: ["sales territory", "region", "geo"] },
  objection: { alt_labels: ["customer objection", "sales objection", "pushback"] },
  rebuttal: { alt_labels: ["counter-argument", "objection handler", "response"] },
  proof_point: { alt_labels: ["evidence point", "case study reference", "social proof"] },
  // Team & Organisation layer
  team: { alt_labels: ["squad", "pod", "tribe", "team unit"] },
  role: { alt_labels: ["position", "job title", "responsibility"] },
  stakeholder: { alt_labels: ["sponsor", "decision maker", "approver"] },
  team_okr: { alt_labels: ["team objective", "team goal"] },
  retrospective: { alt_labels: ["retro", "sprint retro", "team retro", "post-mortem"] },
  dependency: { alt_labels: ["team dependency", "cross-team dependency", "blocker"] },
  department: { alt_labels: ["org unit", "division", "business unit"] },
  skill: { alt_labels: ["competency", "capability", "expertise"] },
  ceremony: { alt_labels: ["ritual", "meeting cadence", "standup", "retrospective meeting"] },
  capacity_plan: { alt_labels: ["resourcing plan", "staffing plan", "headcount plan"] },
  // Data & Analytics layer
  data_source: { alt_labels: ["source", "data origin", "database"] },
  event_schema: { alt_labels: ["tracking plan", "event definition", "analytics event"] },
  dashboard: { alt_labels: ["analytics dashboard", "report dashboard", "monitoring dashboard"] },
  data_model: { alt_labels: ["erd", "entity relationship diagram", "schema model"] },
  data_quality_rule: { alt_labels: ["data rule", "quality check", "data validation"] },
  data_product: { alt_labels: ["data asset", "data offering"] },
  data_pipeline: { alt_labels: ["etl", "elt", "ingestion pipeline", "data flow"] },
  data_lineage: { alt_labels: ["lineage", "data provenance", "data trail"] },
  glossary_term: { alt_labels: ["term", "definition", "business term"] },
  data_domain: { alt_labels: ["data area", "data subject area"] },
  report: { alt_labels: ["analytics report", "business report"] },
  // Operations & Customer Success layer
  customer_feedback: { alt_labels: ["feedback", "user feedback", "csat response"] },
  churn_reason: { alt_labels: ["cancellation reason", "churn driver", "attrition cause"] },
  customer_health_score: { alt_labels: ["health score", "customer health", "account health"] },
  playbook: { alt_labels: ["cs playbook", "success playbook", "engagement playbook"] },
  sla: { alt_labels: ["service level agreement", "sla policy", "response time commitment"] },
  customer_journey_stage: { alt_labels: ["journey stage", "lifecycle stage", "customer stage"] },
  touchpoint: { alt_labels: ["interaction point", "contact point", "engagement point"] },
  success_milestone: { alt_labels: ["cs milestone", "onboarding milestone", "adoption milestone"] },
  service_blueprint: { alt_labels: ["blueprint", "service map", "service design"] },
  nps_campaign: { alt_labels: ["nps survey", "nps score", "net promoter score", "nps"] },
  // Content & Knowledge layer
  content_piece: { alt_labels: ["content", "article", "blog post", "content asset"] },
  knowledge_base_article: { alt_labels: ["kb article", "help article", "faq", "support doc"] },
  brand_asset: { alt_labels: ["asset", "creative asset", "marketing asset"] },
  internal_doc: { alt_labels: ["internal document", "wiki page", "confluence page", "notion doc"] },
  prompt_template: { alt_labels: ["prompt", "ai prompt", "system prompt", "template"] },
  changelog: { alt_labels: ["release notes", "what's new", "update log"] },
  content_calendar: { alt_labels: ["editorial calendar", "publishing schedule"] },
  content_theme: { alt_labels: ["editorial theme", "content pillar", "topic cluster"] },
  documentation_template: { alt_labels: ["doc template", "template"] },
  // Legal, Compliance & Risk layer
  compliance_requirement: { alt_labels: ["regulation", "compliance rule", "regulatory requirement"] },
  data_contract: { alt_labels: ["data agreement", "data sharing agreement"] },
  legal_entity: { alt_labels: ["company", "subsidiary", "legal body"] },
  ip_asset: { alt_labels: ["intellectual property", "patent", "trademark", "ip"] },
  audit_log_policy: { alt_labels: ["audit policy", "logging policy", "retention policy"] },
  contract: { alt_labels: ["agreement", "legal contract"] },
  contract_clause: { alt_labels: ["clause", "term", "provision"] },
  privacy_policy: { alt_labels: ["privacy notice", "data privacy policy"] },
  compliance_framework: { alt_labels: ["regulatory framework", "iso standard", "soc2"] },
  security_audit: { alt_labels: ["audit", "compliance audit", "security assessment"] },
  // DevOps & Platform layer
  error_budget: { alt_labels: ["reliability budget", "downtime budget"] },
  postmortem: { alt_labels: ["post-mortem", "incident review", "rca", "root cause analysis"] },
  runbook: { alt_labels: ["operations guide", "playbook", "sop", "standard operating procedure"] },
  monitor: { alt_labels: ["health check", "synthetic monitor", "uptime check"] },
  alert_rule: { alt_labels: ["alert", "pager rule", "notification rule"] },
  release_strategy: { alt_labels: ["rollout strategy", "deployment strategy", "canary release"] },
  on_call_rotation: { alt_labels: ["on-call schedule", "pager rotation", "incident rotation"] },
  infrastructure_component: { alt_labels: ["infra", "cloud resource", "server", "container"] },
  // Security layer
  threat_model: { alt_labels: ["threat analysis", "stride model", "attack surface"] },
  threat: { alt_labels: ["attack vector", "security threat", "risk vector"] },
  vulnerability: { alt_labels: ["vuln", "cve", "security flaw", "weakness"] },
  security_control: { alt_labels: ["control", "safeguard", "countermeasure", "mitigation"] },
  security_policy: { alt_labels: ["infosec policy", "security standard"] },
  penetration_test: { alt_labels: ["pentest", "pen test", "security test"] },
  security_review: { alt_labels: ["code review", "security assessment", "audit"] },
  data_classification: { alt_labels: ["classification", "sensitivity level", "data label"] },
  access_policy: { alt_labels: ["iam policy", "rbac rule", "permission", "access control"] },
  // Sales & Revenue layer
  account: { alt_labels: ["customer account", "client", "organization"] },
  contact: { alt_labels: ["person", "buyer", "champion"] },
  lead: { alt_labels: ["prospect", "mql", "sql", "marketing lead"] },
  deal: { alt_labels: ["opportunity", "sales opportunity", "opp"] },
  pipeline_sales: { alt_labels: ["sales pipeline", "deal pipeline", "revenue pipeline"] },
  pipeline_stage: { alt_labels: ["deal stage", "sales stage"] },
  quote_document: { alt_labels: ["quote", "proposal", "estimate", "quotation"] },
  subscription: { alt_labels: ["recurring revenue", "saas subscription", "plan"] },
  invoice: { alt_labels: ["bill", "payment request"] },
  forecast: { alt_labels: ["revenue forecast", "sales forecast", "projection"] },
  // Program Management layer
  program: { alt_labels: ["programme", "initiative portfolio"] },
  project: { alt_labels: ["workstream", "work package"] },
  milestone: { alt_labels: ["checkpoint", "gate", "deadline"] },
  risk_register: { alt_labels: ["risk log", "risk tracker"] },
  change_request: { alt_labels: ["cr", "rfc", "scope change", "change order"] },
  deliverable: { alt_labels: ["output", "work product", "artifact"] },
  resource_allocation: { alt_labels: ["allocation", "assignment", "staffing"] },
  status_report: { alt_labels: ["sitrep", "progress report", "weekly update"] },
  // Accessibility layer
  a11y_standard: { alt_labels: ["accessibility standard", "wcag", "ada requirement"] },
  a11y_guideline: { alt_labels: ["accessibility guideline", "wcag guideline"] },
  a11y_audit: { alt_labels: ["accessibility audit", "a11y review"] },
  a11y_issue: { alt_labels: ["accessibility issue", "a11y bug", "accessibility violation"] },
  a11y_annotation: { alt_labels: ["accessibility annotation", "aria note"] },
  // Marketing & Communications layer
  marketing_strategy: { alt_labels: ["marketing plan", "growth strategy"] },
  marketing_channel: { alt_labels: ["channel", "paid channel", "organic channel"] },
  marketing_campaign_plan: { alt_labels: ["campaign plan", "launch campaign"] },
  email_sequence: { alt_labels: ["drip campaign", "nurture sequence", "email flow"] },
  social_post: { alt_labels: ["tweet", "linkedin post", "social media post"] },
  seo_keyword: { alt_labels: ["keyword", "search term", "target keyword"] },
  ad_creative: { alt_labels: ["ad", "advertisement", "creative"] },
  press_release: { alt_labels: ["pr", "media release", "announcement"] },
  event: { alt_labels: ["conference", "meetup", "webinar event", "launch event"] },
  community_initiative: { alt_labels: ["community program", "community project", "developer community"] },
  // Localisation & i18n layer
  locale: { alt_labels: ["language", "region", "l10n target"] },
  translation_key: { alt_labels: ["i18n key", "message key", "string key"] },
  translation_bundle: { alt_labels: ["language file", "locale bundle", "message bundle"] },
  locale_config: { alt_labels: ["locale settings", "regional config"] },
  cultural_adaptation: { alt_labels: ["localization", "cultural customization", "market adaptation"] },
  regional_pricing: { alt_labels: ["geo pricing", "ppp pricing", "local pricing"] },
  // Customer Education & Training layer
  education_program: { alt_labels: ["training program", "onboarding program", "academy"] },
  tutorial: { alt_labels: ["how-to", "guide", "getting started"] },
  walkthrough: { alt_labels: ["product tour", "guided tour", "interactive guide"] },
  webinar: { alt_labels: ["live demo", "online workshop", "virtual event"] },
  certification: { alt_labels: ["cert", "credential", "badge"] },
  help_video: { alt_labels: ["tutorial video", "screencast", "how-to video"] },
  learning_path: { alt_labels: ["curriculum", "course track", "learning journey"] },
  // Quality Assurance & Testing layer
  test_suite: { alt_labels: ["test collection", "test group"] },
  test_case: { alt_labels: ["test", "test scenario", "verification step"] },
  qa_session: { alt_labels: ["testing session", "exploratory test", "qa round"] },
  regression_test: { alt_labels: ["regression", "regression check"] },
  test_coverage_report: { alt_labels: ["coverage report", "coverage"] },
  test_environment: { alt_labels: ["staging", "qa environment", "sandbox"] },
  // Partner & Ecosystem Management layer
  partner_program: { alt_labels: ["partnership program", "channel program"] },
  partner_tier: { alt_labels: ["partner level", "partnership tier"] },
  api_ecosystem: { alt_labels: ["platform ecosystem", "developer ecosystem", "integration ecosystem"] },
  marketplace_listing: { alt_labels: ["listing", "app store listing", "marketplace entry"] },
  developer_portal: { alt_labels: ["dev portal", "api docs site", "developer hub"] },
  integration_partner: { alt_labels: ["tech partner", "integration vendor"] },
  partner_revenue_share: { alt_labels: ["rev share", "commission", "affiliate payout"] },
  // Feedback & Voice of Customer layer
  feedback_program: { alt_labels: ["voice of customer program", "voc program"] },
  feature_request: { alt_labels: ["request", "product request", "enhancement request"] },
  feedback_vote: { alt_labels: ["upvote", "vote", "user vote"] },
  user_advisory_board: { alt_labels: ["cab", "customer advisory board", "advisory council"] },
  beta_program: { alt_labels: ["beta", "early access", "preview program"] },
  feedback_theme: { alt_labels: ["feedback cluster", "theme", "feedback category"] },
  // Pricing & Packaging layer
  pricing_strategy: { alt_labels: ["pricing model", "monetization strategy"] },
  package: { alt_labels: ["product package", "bundle", "sku"] },
  discount_strategy: { alt_labels: ["discount", "promotion", "coupon strategy"] },
  trial_config: { alt_labels: ["free trial", "trial settings", "trial period"] },
  paywall: { alt_labels: ["gate", "upgrade wall", "monetization gate"] },
  // AI/ML Operations layer
  ai_model: { alt_labels: ["model", "ml model", "llm", "machine learning model"] },
  prompt_version: { alt_labels: ["prompt revision", "prompt iteration"] },
  eval_benchmark: { alt_labels: ["benchmark", "evaluation", "eval suite"] },
  eval_run: { alt_labels: ["evaluation run", "benchmark run", "eval result"] },
  ai_cost_tracker: { alt_labels: ["llm cost", "token usage", "ai spend"] },
  hallucination_report: { alt_labels: ["hallucination", "factuality error", "grounding failure"] },
  ai_guardrail: { alt_labels: ["guardrail", "safety rail", "content filter"] },
  model_comparison: { alt_labels: ["model eval", "a/b model test", "model benchmark"] },
  // Agentic Workflows & Process layer
  workflow_template: { alt_labels: ["workflow", "process template", "automation"] },
  workflow_run: { alt_labels: ["run", "execution", "workflow execution"] },
  agent_definition: { alt_labels: ["agent", "ai agent", "autonomous agent"] },
  agent_session: { alt_labels: ["session", "agent run", "agent conversation"] },
  review_gate: { alt_labels: ["approval gate", "quality gate", "stage gate"] },
  approval_record: { alt_labels: ["approval", "sign-off", "authorization"] },
  agent_skill: { alt_labels: ["skill", "tool", "agent capability"] },
  agent_hook: { alt_labels: ["hook", "trigger", "callback"] },
  workflow_artifact: { alt_labels: ["artifact", "output artifact", "generated artifact"] },
  // Portfolio layer
  organization: { alt_labels: ["org", "company", "enterprise", "organisation"] },
  portfolio: { alt_labels: ["product portfolio", "product line", "product suite"] },
  product_area: { alt_labels: ["area", "product domain", "vertical"] }
};
function toTitleCase(id) {
  const UPPER = /* @__PURE__ */ new Set([
    "kpi",
    "jtbd",
    "okr",
    "sli",
    "slo",
    "sla",
    "api",
    "ci",
    "ip",
    "qa",
    "ai",
    "ml",
    "ab",
    "bm",
    "nps",
    "seo",
    "gtm",
    "erd"
  ]);
  return id.split("_").map((w) => {
    if (UPPER.has(w))
      return w.toUpperCase();
    if (w === "a11y")
      return "A11y";
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(" ");
}
function getMigrationAliases(canonicalType) {
  const aliases = [];
  for (const migrations of Object.values(UPG_MIGRATIONS)) {
    for (const m of migrations) {
      if (m.to === canonicalType) {
        aliases.push(m.from.replace(/_/g, " "));
      }
    }
  }
  return aliases;
}
var _priorityIndex = new Map(PRIORITY_LABELS.map((p) => [p.id, p]));
var UPG_TYPE_LABELS = UPG_ACTIVE_TYPES.map((typeName) => {
  const migrationAliases = getMigrationAliases(typeName);
  const priority = _priorityIndex.get(typeName);
  if (priority) {
    const existingSet = new Set(priority.alt_labels.map((a) => a.toLowerCase()));
    const newAliases = migrationAliases.filter((a) => !existingSet.has(a.toLowerCase()));
    return {
      ...priority,
      alt_labels: [...priority.alt_labels, ...newAliases]
    };
  }
  const standard = STANDARD_LABELS[typeName];
  if (standard) {
    const existingSet = new Set(standard.alt_labels.map((a) => a.toLowerCase()));
    const newAliases = migrationAliases.filter((a) => !existingSet.has(a.toLowerCase()));
    return {
      id: typeName,
      canonical_label: toTitleCase(typeName),
      alt_labels: [...standard.alt_labels, ...newAliases],
      framework_labels: {}
    };
  }
  return {
    id: typeName,
    canonical_label: toTitleCase(typeName),
    alt_labels: migrationAliases,
    framework_labels: {}
  };
});
var UPG_TYPE_LABELS_MAP = new Map(UPG_TYPE_LABELS.map((entry) => [entry.id, entry]));
function buildTypeAliases() {
  const aliases = {};
  for (const entry of UPG_TYPE_LABELS) {
    for (const label of entry.alt_labels) {
      const snaked = label.toLowerCase().replace(/[\s\-\/]+/g, "_");
      if (!aliases[snaked]) {
        aliases[snaked] = entry.id;
      }
      const lower = label.toLowerCase();
      if (lower !== snaked && !aliases[lower]) {
        aliases[lower] = entry.id;
      }
    }
  }
  return aliases;
}
var TYPE_ALIASES = buildTypeAliases();

// ../upg-spec/dist/lenses.js
var UPG_LENSES = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // 1. PRODUCT LENS — the strategic command view
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: "product",
    name: "Product",
    description: "Full graph, PM vocabulary, outcome-driven workflow",
    icon: "target",
    framework_id: "ost",
    label_overrides: {
      experiment: "Experiment",
      learning: "Validated Learning"
    },
    visible_domains: [],
    // all domains visible
    workflow_steps: [
      {
        name: "Outcomes",
        description: "Define what success looks like \u2014 the measurable results you are driving toward",
        entity_types: ["product", "outcome", "objective", "key_result", "metric"],
        suggested_skill: "/upg-add outcome"
      },
      {
        name: "Personas",
        description: "Understand who you are building for \u2014 their jobs, needs, and pain points",
        entity_types: ["persona", "jtbd", "need", "desired_outcome"],
        suggested_skill: "/upg-add persona"
      },
      {
        name: "Opportunities",
        description: "Identify the highest-leverage opportunities that connect user needs to outcomes",
        entity_types: ["opportunity", "insight"],
        suggested_skill: "/upg-add opportunity"
      },
      {
        name: "Solutions",
        description: "Propose solutions for the top opportunities \u2014 ideas, not commitments",
        entity_types: ["solution", "design_concept"],
        suggested_skill: "/upg-add solution"
      },
      {
        name: "Hypotheses",
        description: "Turn solutions into testable bets \u2014 what must be true for this to work?",
        entity_types: ["hypothesis", "assumption"],
        suggested_skill: "/upg-add hypothesis"
      },
      {
        name: "Experiments",
        description: "Design the cheapest test that could disprove your riskiest assumption",
        entity_types: ["experiment", "evidence", "learning"],
        suggested_skill: "/upg-add experiment"
      },
      {
        name: "Features",
        description: "Ship validated ideas as features \u2014 scope, spec, and release",
        entity_types: ["feature", "epic", "user_story", "release"],
        suggested_skill: "/upg-add feature"
      },
      {
        name: "Market",
        description: "Know your landscape \u2014 competitors, trends, and positioning",
        entity_types: ["competitor", "competitor_feature", "market_trend", "market_segment"],
        suggested_skill: "/upg-add competitor"
      }
    ],
    benchmark_domains: [
      "strategic",
      "user",
      "discovery",
      "validation",
      "market_intelligence",
      "product_spec",
      "growth"
    ],
    intelligence_prompts: [
      {
        condition: "outcomes.length === 0",
        message: "No outcomes defined yet. Start with what success looks like \u2014 what measurable result should this product drive?"
      },
      {
        condition: "hypotheses.untested.length > 3",
        message: "You have untested hypotheses stacking up. Pick the riskiest one and design an experiment before adding more."
      },
      {
        condition: "features.length > 0 && hypotheses.length === 0",
        message: "Features without hypotheses means you are building on assumptions. What needs to be true for these features to matter?"
      },
      {
        condition: "personas.length > 0 && opportunities.length === 0",
        message: "You know who you are building for, but haven't identified opportunities yet. What are the biggest unmet needs?"
      },
      {
        condition: "competitors.length === 0 && features.length > 3",
        message: "You are building without competitive context. Who else solves this problem, and how is your approach different?"
      }
    ],
    audience: "Product managers, founders making strategic decisions, and anyone thinking about what to build and why",
    perspective: "Sees the product as a system of outcomes, opportunities, and validated bets. Outcome-driven, evidence-aware, strategically oriented."
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. DESIGN LENS — user-centric, journey-first
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: "design",
    name: "Design",
    description: "User-centric view with design vocabulary, journey-first workflow",
    icon: "pen-tool",
    framework_id: "design_thinking",
    label_overrides: {
      need: "Pain Point",
      insight: "Finding",
      opportunity: "Design Opportunity",
      solution: "Design Concept",
      experiment: "Usability Test",
      learning: "Test Finding",
      feature: "Feature"
    },
    visible_domains: [
      "design",
      "user",
      "ux_research",
      "product_spec",
      "feedback_voc",
      "accessibility",
      "content"
    ],
    always_show_types: ["product", "outcome"],
    always_hide_types: [
      "database_schema",
      "queue_topic",
      "build_artifact",
      "ci_pipeline",
      "sli",
      "slo",
      "error_budget"
    ],
    workflow_steps: [
      {
        name: "Research",
        description: "Understand the problem space \u2014 observe real users, gather evidence",
        entity_types: ["research_study", "participant", "observation", "quote", "survey_response"],
        suggested_skill: "/upg-add research_study"
      },
      {
        name: "Personas",
        description: "Synthesize research into archetypes \u2014 who are you designing for?",
        entity_types: ["persona", "jtbd", "need", "desired_outcome"],
        suggested_skill: "/upg-add persona"
      },
      {
        name: "Journeys",
        description: "Map how users move through the experience \u2014 where is the friction?",
        entity_types: ["user_journey", "journey_step", "user_flow", "touchpoint"],
        suggested_skill: "/upg-add user_journey"
      },
      {
        name: "Define",
        description: "Frame the design challenge \u2014 How Might We questions, insights, opportunities",
        entity_types: ["how_might_we", "insight", "affinity_cluster", "opportunity"],
        suggested_skill: "/upg-add how_might_we"
      },
      {
        name: "Ideate",
        description: "Generate solutions \u2014 concepts, screens, interaction ideas",
        entity_types: ["design_concept", "solution", "screen", "screen_state"],
        suggested_skill: "/upg-add design_concept"
      },
      {
        name: "Prototype",
        description: "Build testable artifacts \u2014 wireframes, prototypes, interaction specs",
        entity_types: ["wireframe", "prototype", "interaction_spec", "design_component"],
        suggested_skill: "/upg-add prototype"
      },
      {
        name: "Test",
        description: "Put prototypes in front of users \u2014 observe, learn, iterate",
        entity_types: ["experiment", "learning", "evidence", "feedback_theme"],
        suggested_skill: "/upg-add experiment"
      },
      {
        name: "Design System",
        description: "Codify patterns \u2014 components, tokens, guidelines that scale",
        entity_types: ["design_system", "design_component", "design_token", "design_pattern", "design_guideline"],
        suggested_skill: "/upg-add design_component"
      }
    ],
    benchmark_domains: [
      "design",
      "user",
      "ux_research",
      "feedback_voc",
      "accessibility"
    ],
    intelligence_prompts: [
      {
        condition: "personas.length === 0",
        message: "No personas yet. Who are you designing for? Start with the person, not the screen."
      },
      {
        condition: "user_journeys.length === 0 && screens.length > 0",
        message: "You have screens but no user journeys. Without a journey, screens are disconnected pages \u2014 map the experience first."
      },
      {
        condition: "prototypes.length > 0 && experiments.length === 0",
        message: "You have prototypes that haven't been tested. A prototype only validates when a real user touches it."
      },
      {
        condition: "how_might_we.length === 0 && needs.length > 3",
        message: "Plenty of pain points identified, but no How Might We questions. Reframe the problems as design opportunities."
      },
      {
        condition: "a11y_audits.length === 0 && screens.length > 5",
        message: "Many screens designed but no accessibility audit. Inclusive design is not a polish step \u2014 it is a design constraint."
      }
    ],
    audience: "Designers, UX researchers, and anyone focused on the user experience",
    perspective: "Sees the product through the eyes of the people using it. Journey-first, evidence-based, obsessed with friction and delight."
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // 3. ENGINEERING LENS — architecture-first, system-aware
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: "engineering",
    name: "Engineering",
    description: "Architecture-first view of the product as a technical system",
    icon: "cpu",
    framework_id: "dora",
    label_overrides: {
      feature: "Feature",
      epic: "Epic",
      user_story: "Story",
      release: "Release",
      outcome: "Product Goal",
      experiment: "Technical Spike",
      need: "Requirement"
    },
    visible_domains: [
      "engineering",
      "product_spec",
      "devops",
      "data_analytics",
      "security",
      "qa_testing",
      "ai_ml",
      "agentic"
    ],
    always_show_types: ["product", "outcome", "persona", "feature"],
    always_hide_types: [
      "brand_identity",
      "brand_colour",
      "brand_typography",
      "brand_voice",
      "positioning",
      "messaging",
      "content_piece",
      "social_post"
    ],
    workflow_steps: [
      {
        name: "Architecture",
        description: "Define the system shape \u2014 bounded contexts, services, key decisions",
        entity_types: ["bounded_context", "architecture_decision", "service", "aggregate"],
        suggested_skill: "/upg-add architecture_decision"
      },
      {
        name: "Services & APIs",
        description: "Map the service layer \u2014 endpoints, contracts, integrations",
        entity_types: ["service", "api_endpoint", "api_contract", "external_api", "integration_pattern"],
        suggested_skill: "/upg-add service"
      },
      {
        name: "Data",
        description: "Design the data layer \u2014 schemas, events, pipelines",
        entity_types: ["database_schema", "domain_event", "event_schema", "data_model", "data_pipeline", "queue_topic"],
        suggested_skill: "/upg-add database_schema"
      },
      {
        name: "Build",
        description: "Scope the work \u2014 features, epics, stories, tasks",
        entity_types: ["feature", "epic", "user_story", "task", "technical_debt_item"],
        suggested_skill: "/upg-add feature"
      },
      {
        name: "Test",
        description: "Verify the system \u2014 test suites, coverage, QA sessions",
        entity_types: ["test_suite", "test_case", "qa_session", "regression_test", "test_coverage_report"],
        suggested_skill: "/upg-add test_suite"
      },
      {
        name: "Deploy",
        description: "Ship reliably \u2014 pipelines, feature flags, release strategy",
        entity_types: ["deployment", "ci_pipeline", "feature_flag", "release", "release_strategy"],
        suggested_skill: "/upg-add deployment"
      },
      {
        name: "Monitor",
        description: "Keep it running \u2014 SLIs, monitors, alerts, incident response",
        entity_types: ["sli", "slo", "monitor", "alert_rule", "incident", "runbook", "on_call_rotation"],
        suggested_skill: "/upg-add monitor"
      },
      {
        name: "Security",
        description: "Keep it safe \u2014 threat models, controls, access policies",
        entity_types: ["threat_model", "threat", "vulnerability", "security_control", "security_policy", "access_policy"],
        suggested_skill: "/upg-add threat_model"
      }
    ],
    benchmark_domains: [
      "engineering",
      "product_spec",
      "devops",
      "security",
      "qa_testing",
      "data_analytics"
    ],
    intelligence_prompts: [
      {
        condition: "architecture_decisions.length === 0",
        message: "No architecture decisions recorded. Document the key technical choices \u2014 future you will thank present you."
      },
      {
        condition: "services.length > 0 && api_contracts.length === 0",
        message: "Services without API contracts. How do they talk to each other? Define the interfaces."
      },
      {
        condition: "features.length > 5 && test_suites.length === 0",
        message: "Features shipping without test coverage. What happens when something breaks?"
      },
      {
        condition: "deployments.length > 0 && monitors.length === 0",
        message: "You are deploying but not monitoring. How will you know when something goes wrong in production?"
      },
      {
        condition: "technical_debt_items.length > 10",
        message: "Technical debt is piling up. Consider dedicating a percentage of each cycle to paying it down before it compounds."
      }
    ],
    audience: "Developers, CTOs, and anyone building the technical system",
    perspective: "Sees the product as a system of services, data flows, and deployments. Architecture-first, reliability-aware, concerned with how things are built and how they stay running."
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. GROWTH LENS — metrics-driven, experiment-focused
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: "growth",
    name: "Growth",
    description: "Metrics-driven view focused on funnels, loops, and what moves the numbers",
    icon: "trending-up",
    framework_id: "aarrr",
    label_overrides: {
      metric: "Growth Metric",
      experiment: "Growth Experiment",
      outcome: "North Star",
      persona: "User Segment",
      hypothesis: "Growth Bet",
      learning: "Experiment Result",
      insight: "Data Insight"
    },
    visible_domains: [
      "growth",
      "business_model",
      "go_to_market",
      "data_analytics",
      "pricing",
      "feedback_voc",
      "market_intelligence"
    ],
    always_show_types: ["product", "outcome", "persona"],
    always_hide_types: [
      "bounded_context",
      "service",
      "api_endpoint",
      "database_schema",
      "wireframe",
      "design_component",
      "design_token"
    ],
    workflow_steps: [
      {
        name: "North Star",
        description: "Define the one metric that matters most \u2014 the number that captures the value you create",
        entity_types: ["metric", "outcome", "objective"],
        suggested_skill: "/upg-add metric"
      },
      {
        name: "Funnel",
        description: "Map how users flow from awareness to value \u2014 where are the drops?",
        entity_types: ["funnel", "funnel_step", "user_flow"],
        suggested_skill: "/upg-add funnel"
      },
      {
        name: "Channels",
        description: "Identify where users come from \u2014 which channels are scalable and cost-effective?",
        entity_types: ["acquisition_channel", "campaign", "attribution_model"],
        suggested_skill: "/upg-add acquisition_channel"
      },
      {
        name: "Segments",
        description: "Break users into cohorts \u2014 who retains, who converts, who churns?",
        entity_types: ["cohort", "segment", "persona", "ideal_customer_profile"],
        suggested_skill: "/upg-add segment"
      },
      {
        name: "Experiments",
        description: "Run experiments to move the numbers \u2014 A/B tests, pricing tests, growth loops",
        entity_types: ["experiment", "variant", "hypothesis", "growth_loop"],
        suggested_skill: "/upg-add experiment"
      },
      {
        name: "Measure",
        description: "Track results \u2014 dashboards, event schemas, metric definitions",
        entity_types: ["metric", "dashboard", "event_schema", "data_source"],
        suggested_skill: "/upg-add metric"
      },
      {
        name: "Iterate",
        description: "Learn and loop \u2014 what worked, what didn't, what to try next",
        entity_types: ["learning", "evidence", "insight"],
        suggested_skill: "/upg-add learning"
      }
    ],
    benchmark_domains: [
      "growth",
      "business_model",
      "data_analytics",
      "pricing",
      "go_to_market"
    ],
    intelligence_prompts: [
      {
        condition: "north_star_metrics.length === 0",
        message: "No north star metric defined. What single number best captures the value your product creates for users?"
      },
      {
        condition: "funnels.length === 0",
        message: "No funnels mapped. You can't improve what you can't see \u2014 map the user journey from first touch to activation."
      },
      {
        condition: "experiments.length > 0 && metrics.length < 3",
        message: "Running experiments without enough metrics to measure them. Define the input and output metrics before you test."
      },
      {
        condition: "channels.length === 1",
        message: "Only one acquisition channel. Single-channel dependency is risky \u2014 what else could work?"
      },
      {
        condition: "cohorts.length === 0 && users > 100",
        message: "No cohort analysis yet. Not all users are the same \u2014 segment by behaviour to find what drives retention."
      }
    ],
    audience: "Growth marketers, data-driven founders, and anyone optimising acquisition and retention",
    perspective: "Sees the product as a system of funnels, loops, and numbers. Experiment-driven, metric-obsessed, always asking what moves the needle."
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. BUSINESS LENS — viability-focused
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: "business",
    name: "Business",
    description: "Viability-focused view of the product as a business that needs to sustain itself",
    icon: "briefcase",
    framework_id: "bmc",
    label_overrides: {
      outcome: "Business Outcome",
      persona: "Customer Archetype",
      need: "Customer Problem",
      feature: "Product Capability",
      opportunity: "Market Opportunity",
      experiment: "Business Experiment",
      metric: "Business Metric",
      hypothesis: "Business Assumption"
    },
    visible_domains: [
      "business_model",
      "pricing",
      "go_to_market",
      "strategic",
      "market_intelligence",
      "growth"
    ],
    always_show_types: ["product", "persona", "feature", "outcome"],
    always_hide_types: [
      "wireframe",
      "design_component",
      "design_token",
      "prototype",
      "bounded_context",
      "service",
      "api_endpoint",
      "database_schema",
      "test_suite",
      "test_case",
      "ci_pipeline"
    ],
    workflow_steps: [
      {
        name: "Value Proposition",
        description: "Define the value you create \u2014 why should someone pay for this?",
        entity_types: ["value_proposition", "product", "need", "desired_outcome"],
        suggested_skill: "/upg-add value_proposition"
      },
      {
        name: "Customer",
        description: "Know your customer \u2014 segments, ICPs, what they are willing to pay for",
        entity_types: ["persona", "customer_segment_bm", "ideal_customer_profile", "market_segment"],
        suggested_skill: "/upg-add customer_segment_bm"
      },
      {
        name: "Revenue",
        description: "Design the revenue engine \u2014 streams, pricing, packaging",
        entity_types: ["revenue_stream", "pricing_tier", "pricing_strategy", "package"],
        suggested_skill: "/upg-add revenue_stream"
      },
      {
        name: "Cost Structure",
        description: "Map the costs \u2014 what does it take to build, deliver, and support this?",
        entity_types: ["cost_structure", "unit_economics", "key_resource", "key_activity"],
        suggested_skill: "/upg-add cost_structure"
      },
      {
        name: "Unit Economics",
        description: "Prove the math works \u2014 LTV, CAC, margins, breakeven",
        entity_types: ["unit_economics", "metric"],
        suggested_skill: "/upg-add unit_economics"
      },
      {
        name: "Go-To-Market",
        description: "Plan the path to customers \u2014 positioning, channels, launch strategy",
        entity_types: ["gtm_strategy", "positioning", "messaging", "channel_bm", "distribution_channel", "launch"],
        suggested_skill: "/upg-add gtm_strategy"
      },
      {
        name: "Competitive Advantage",
        description: "Understand the landscape \u2014 competitors, differentiation, moats",
        entity_types: ["competitor", "competitive_analysis", "market_trend", "partnership"],
        suggested_skill: "/upg-add competitor"
      }
    ],
    benchmark_domains: [
      "business_model",
      "pricing",
      "go_to_market",
      "strategic",
      "market_intelligence",
      "growth"
    ],
    intelligence_prompts: [
      {
        condition: "value_propositions.length === 0",
        message: "No value proposition defined. Why would someone pay for this? That needs an answer before anything else."
      },
      {
        condition: "revenue_streams.length === 0",
        message: "No revenue streams. A product without revenue is a hobby. How will this make money?"
      },
      {
        condition: "revenue_streams.length > 0 && cost_structures.length === 0",
        message: "Revenue modeled but no cost structure. You need both sides of the equation to know if this is viable."
      },
      {
        condition: "unit_economics.length === 0 && revenue_streams.length > 0",
        message: "Revenue streams without unit economics. Does each customer generate more value than they cost to acquire and serve?"
      },
      {
        condition: "gtm_strategies.length === 0 && features.length > 3",
        message: "Building features without a go-to-market plan. Great products fail when nobody knows they exist."
      }
    ],
    audience: "Business-minded founders, CFOs, and investors reviewing the product",
    perspective: "Sees the product as a business that needs to sustain itself. Viability-focused, cost-aware, always asking whether the math works."
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. RESEARCH LENS — evidence-first
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: "research",
    name: "Research",
    description: "Evidence-first view focused on what is known, assumed, and yet to be learned",
    icon: "microscope",
    label_overrides: {
      need: "User Need",
      opportunity: "Research Opportunity",
      solution: "Proposed Solution",
      feature: "Product Concept",
      hypothesis: "Research Hypothesis",
      experiment: "Study",
      learning: "Finding",
      insight: "Research Insight",
      evidence: "Evidence"
    },
    visible_domains: [
      "ux_research",
      "user",
      "validation",
      "discovery",
      "feedback_voc",
      "market_intelligence"
    ],
    always_show_types: ["product", "outcome", "persona", "opportunity"],
    always_hide_types: [
      "database_schema",
      "service",
      "api_endpoint",
      "ci_pipeline",
      "design_component",
      "design_token",
      "pricing_tier",
      "revenue_stream"
    ],
    workflow_steps: [
      {
        name: "Plan",
        description: "Define what you need to learn \u2014 research questions, study design, interview guides",
        entity_types: ["research_plan", "research_question", "interview_guide", "research_study"],
        suggested_skill: "/upg-add research_study"
      },
      {
        name: "Recruit",
        description: "Find the right participants \u2014 who can teach you what you need to know?",
        entity_types: ["participant", "persona", "segment"],
        suggested_skill: "/upg-add participant"
      },
      {
        name: "Observe",
        description: "Gather raw data \u2014 observations, quotes, survey responses, field notes",
        entity_types: ["observation", "quote", "survey_response", "highlight"],
        suggested_skill: "/upg-add observation"
      },
      {
        name: "Synthesize",
        description: "Make sense of the data \u2014 cluster, pattern-match, extract themes",
        entity_types: ["affinity_cluster", "feedback_theme"],
        suggested_skill: "/upg-add affinity_cluster"
      },
      {
        name: "Insight",
        description: "Crystallize learnings into actionable insights \u2014 what did you discover?",
        entity_types: ["insight", "evidence", "learning"],
        suggested_skill: "/upg-add insight"
      },
      {
        name: "Opportunity",
        description: "Connect insights to opportunities \u2014 what should the product do about this?",
        entity_types: ["opportunity", "need", "desired_outcome"],
        suggested_skill: "/upg-add opportunity"
      },
      {
        name: "Hypothesis",
        description: "Frame testable hypotheses from research \u2014 what assumptions need validation?",
        entity_types: ["hypothesis", "assumption"],
        suggested_skill: "/upg-add hypothesis"
      },
      {
        name: "Test",
        description: "Validate with targeted experiments \u2014 close the loop between research and action",
        entity_types: ["experiment", "test_plan", "evidence"],
        suggested_skill: "/upg-add experiment"
      }
    ],
    benchmark_domains: [
      "ux_research",
      "user",
      "validation",
      "discovery",
      "feedback_voc"
    ],
    intelligence_prompts: [
      {
        condition: "research_studies.length === 0",
        message: "No research studies yet. What do you need to learn? Start with the questions, not the answers."
      },
      {
        condition: "observations.length > 10 && insights.length === 0",
        message: "Lots of observations but no synthesized insights. Raw data is not knowledge \u2014 cluster and extract patterns."
      },
      {
        condition: "insights.length > 5 && opportunities.length === 0",
        message: "Insights without opportunities. Research is powerful when it drives product decisions \u2014 what should the product do about what you learned?"
      },
      {
        condition: "hypotheses.length > 3 && experiments.length === 0",
        message: "Hypotheses without experiments. The whole point of framing a hypothesis is to test it. What is the cheapest way to learn?"
      },
      {
        condition: "participants.length < 5 && research_studies.length > 0",
        message: "Very few participants. Qualitative research needs enough voices to reveal patterns \u2014 aim for 5-8 per study minimum."
      }
    ],
    audience: "User researchers, discovery coaches, and anyone in a research-heavy phase",
    perspective: "Sees the product through what is known, what is assumed, and what needs investigation. Evidence-first, synthesis-driven, allergic to untested assumptions."
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // 7. MARKETING LENS — audience-aware, message-focused
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: "marketing",
    name: "Marketing",
    description: "Audience-aware view focused on reaching, resonating with, and converting people",
    icon: "megaphone",
    label_overrides: {
      persona: "Target Audience",
      need: "Customer Problem",
      outcome: "Marketing Goal",
      feature: "Sellable Feature",
      insight: "Market Insight",
      experiment: "Campaign Test",
      metric: "Marketing Metric",
      hypothesis: "Messaging Hypothesis",
      learning: "Campaign Learning"
    },
    visible_domains: [
      "go_to_market",
      "content",
      "growth",
      "feedback_voc",
      "marketing_ops",
      "market_intelligence"
    ],
    always_show_types: ["product", "persona", "value_proposition", "feature", "outcome"],
    always_hide_types: [
      "bounded_context",
      "service",
      "api_endpoint",
      "database_schema",
      "test_suite",
      "ci_pipeline",
      "sli",
      "slo",
      "wireframe",
      "design_component",
      "design_token"
    ],
    workflow_steps: [
      {
        name: "Positioning",
        description: "Define where you sit in the customer's mind \u2014 who is this for, and why is it different?",
        entity_types: ["positioning", "competitive_analysis", "competitor", "market_segment"],
        suggested_skill: "/upg-add positioning"
      },
      {
        name: "Messaging",
        description: "Craft the words that resonate \u2014 value props, taglines, proof points",
        entity_types: ["messaging", "value_proposition", "proof_point", "objection", "rebuttal"],
        suggested_skill: "/upg-add messaging"
      },
      {
        name: "Audience",
        description: "Know who you are speaking to \u2014 personas, ICPs, segments",
        entity_types: ["persona", "ideal_customer_profile", "customer_segment_bm", "segment"],
        suggested_skill: "/upg-add ideal_customer_profile"
      },
      {
        name: "Channels",
        description: "Choose where to show up \u2014 which channels reach your audience cost-effectively?",
        entity_types: ["acquisition_channel", "channel_bm", "distribution_channel", "marketing_channel"],
        suggested_skill: "/upg-add acquisition_channel"
      },
      {
        name: "Content",
        description: "Create what resonates \u2014 content strategy, calendar, individual pieces",
        entity_types: ["content_strategy", "content_piece", "content_calendar", "content_theme", "brand_asset"],
        suggested_skill: "/upg-add content_piece"
      },
      {
        name: "Launch",
        description: "Orchestrate the go-to-market \u2014 launch plans, campaigns, press",
        entity_types: ["launch", "campaign", "demand_gen_program", "press_release", "event"],
        suggested_skill: "/upg-add launch"
      },
      {
        name: "Measure",
        description: "Track what works \u2014 attribution, conversion, engagement metrics",
        entity_types: ["metric", "dashboard", "attribution_model", "funnel", "nps_campaign"],
        suggested_skill: "/upg-add metric"
      }
    ],
    benchmark_domains: [
      "go_to_market",
      "content",
      "growth",
      "market_intelligence",
      "feedback_voc"
    ],
    intelligence_prompts: [
      {
        condition: "positioning.length === 0",
        message: "No positioning defined. Before any marketing can work, you need to know: who is this for, what category is it in, and why is it different?"
      },
      {
        condition: "messaging.length === 0 && features.length > 3",
        message: "Features without messaging. Features don't sell themselves \u2014 what is the message that makes someone care?"
      },
      {
        condition: "channels.length === 0",
        message: "No channels mapped. Where does your audience spend time? That is where you need to be."
      },
      {
        condition: "content_pieces.length === 0 && channels.length > 0",
        message: "Channels without content. You know where to show up, but have nothing to say yet. Start with the content that matches your best channel."
      },
      {
        condition: "launches.length === 0 && features.length > 5",
        message: "Building features without a launch plan. Every feature release is a marketing opportunity. Plan the story before the ship date."
      }
    ],
    audience: "Marketers, content creators, brand managers, and GTM leads",
    perspective: "Sees the product as something that needs to reach and resonate with people. Audience-aware, message-focused, always asking what makes someone care."
  },
  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. FULL LENS — everything, canonical vocabulary (default)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: "full",
    name: "Full",
    description: "Complete graph with canonical UPG vocabulary \u2014 the whole picture",
    icon: "layout-grid",
    // No framework_id — uses canonical UPG labels
    // No label_overrides — everything stays canonical
    visible_domains: [],
    // empty = show all
    workflow_steps: [
      {
        name: "Vision & Strategy",
        description: "Set direction \u2014 vision, mission, outcomes, objectives",
        entity_types: ["product", "vision", "mission", "outcome", "objective", "key_result", "metric", "strategic_theme"]
      },
      {
        name: "Users & Needs",
        description: "Understand who you serve \u2014 personas, jobs, needs, desired outcomes",
        entity_types: ["persona", "jtbd", "need", "desired_outcome", "job_step"]
      },
      {
        name: "Research & Discovery",
        description: "Learn what you don't know \u2014 studies, insights, opportunities",
        entity_types: ["research_study", "insight", "observation", "opportunity", "how_might_we"]
      },
      {
        name: "Validation",
        description: "Test your bets \u2014 hypotheses, experiments, evidence, learnings",
        entity_types: ["hypothesis", "experiment", "evidence", "learning", "solution"]
      },
      {
        name: "Design & Experience",
        description: "Shape the experience \u2014 journeys, screens, prototypes, design system",
        entity_types: ["user_journey", "user_flow", "screen", "prototype", "design_concept", "design_component"]
      },
      {
        name: "Build & Ship",
        description: "Deliver value \u2014 features, epics, stories, releases, architecture",
        entity_types: ["feature", "epic", "user_story", "release", "service", "architecture_decision"]
      },
      {
        name: "Grow & Sustain",
        description: "Scale and sustain \u2014 business model, growth, GTM, operations",
        entity_types: ["business_model", "value_proposition", "revenue_stream", "funnel", "gtm_strategy", "launch"]
      }
    ],
    benchmark_domains: [],
    // empty = check all benchmark domains
    intelligence_prompts: [
      {
        condition: "total_entities < 5",
        message: "The graph is nearly empty. Start with the basics: a product, an outcome, and a persona."
      },
      {
        condition: "domains_activated < 3",
        message: "Only a few domains active. A well-rounded product graph touches strategy, users, and at least one of validation, design, or engineering."
      },
      {
        condition: "orphan_entities.length > 5",
        message: "Several entities without connections. Every entity should relate to something \u2014 orphans are loose thoughts waiting to be placed."
      },
      {
        condition: "validation_domain.length === 0 && features.length > 3",
        message: "Building without validating. The validation domain (hypotheses, experiments, evidence) exists to prevent building the wrong thing."
      }
    ],
    audience: "Anyone who wants to see the complete picture without filtering",
    perspective: "The complete, unfiltered product graph using canonical UPG vocabulary. Every domain, every type, every connection."
  }
];
var _lensIndex = new Map(UPG_LENSES.map((l) => [l.id, l]));

// ../upg-spec/dist/validate.js
function validateUPGDocument(doc) {
  const errors = [];
  const warnings = [];
  if (!doc || typeof doc !== "object") {
    return { valid: false, errors: [{ path: "$", message: "Document must be an object" }], warnings };
  }
  const d = doc;
  if (!d.upg_version || typeof d.upg_version !== "string") {
    errors.push({ path: "$.upg_version", message: "upg_version is required and must be a string" });
  }
  if (!d.exported_at || typeof d.exported_at !== "string") {
    errors.push({ path: "$.exported_at", message: "exported_at is required and must be an ISO 8601 string" });
  }
  if (!d.source || typeof d.source !== "object") {
    errors.push({ path: "$.source", message: "source is required and must be an object" });
  } else {
    const source = d.source;
    if (!source.tool || typeof source.tool !== "string") {
      errors.push({ path: "$.source.tool", message: "source.tool is required and must be a string" });
    }
  }
  if (!d.product || typeof d.product !== "object") {
    errors.push({ path: "$.product", message: "product is required and must be an object" });
  } else {
    const product = d.product;
    if (!product.id || typeof product.id !== "string") {
      errors.push({ path: "$.product.id", message: "product.id is required and must be a string" });
    }
    if (!product.title || typeof product.title !== "string") {
      errors.push({ path: "$.product.title", message: "product.title is required and must be a string" });
    }
  }
  const allKnownTypes = new Set(getTypesForTier("extended"));
  if (!Array.isArray(d.nodes)) {
    errors.push({ path: "$.nodes", message: "nodes is required and must be an array" });
  } else {
    const nodeIds = /* @__PURE__ */ new Set();
    d.nodes.forEach((node, i) => {
      const path4 = `$.nodes[${i}]`;
      if (!node || typeof node !== "object") {
        errors.push({ path: path4, message: "Each node must be an object" });
        return;
      }
      const n = node;
      if (!n.id || typeof n.id !== "string") {
        errors.push({ path: `${path4}.id`, message: "Node id is required and must be a string" });
      } else {
        if (nodeIds.has(n.id)) {
          errors.push({ path: `${path4}.id`, message: `Duplicate node id: ${n.id}` });
        }
        nodeIds.add(n.id);
      }
      if (!n.type || typeof n.type !== "string") {
        errors.push({ path: `${path4}.type`, message: "Node type is required and must be a string" });
      } else if (!allKnownTypes.has(n.type)) {
        warnings.push({ path: `${path4}.type`, message: `Unknown UPG type: "${n.type}". Node will be preserved with its original type.` });
      }
      if (!n.title || typeof n.title !== "string") {
        errors.push({ path: `${path4}.title`, message: "Node title is required and must be a string" });
      }
    });
    if (!Array.isArray(d.edges)) {
      errors.push({ path: "$.edges", message: "edges is required and must be an array" });
    } else {
      d.edges.forEach((edge, i) => {
        const path4 = `$.edges[${i}]`;
        if (!edge || typeof edge !== "object") {
          errors.push({ path: path4, message: "Each edge must be an object" });
          return;
        }
        const e = edge;
        if (!e.id || typeof e.id !== "string") {
          errors.push({ path: `${path4}.id`, message: "Edge id is required and must be a string" });
        }
        if (!e.source || typeof e.source !== "string") {
          errors.push({ path: `${path4}.source`, message: "Edge source is required and must be a string" });
        } else if (!nodeIds.has(e.source)) {
          errors.push({ path: `${path4}.source`, message: `Edge source references unknown node id: ${e.source}` });
        }
        if (!e.target || typeof e.target !== "string") {
          errors.push({ path: `${path4}.target`, message: "Edge target is required and must be a string" });
        } else if (!nodeIds.has(e.target)) {
          errors.push({ path: `${path4}.target`, message: `Edge target references unknown node id: ${e.target}` });
        }
        if (!e.type || typeof e.type !== "string") {
          errors.push({ path: `${path4}.type`, message: "Edge type is required and must be a string" });
        }
      });
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}

// ../upg-spec/dist/index.js
var UPG_VERSION = "0.1.0";
var UPG_ALL_TYPES = getTypesForTier("extended");
var UPG_ALL_TYPES_SET = new Set(UPG_ALL_TYPES);
var UPG_ALL_TYPE_LABELS = Object.fromEntries(UPG_ALL_TYPES.map((t) => [
  t,
  t.split("_").map((w) => {
    if (["kpi", "jtbd", "okr", "sli", "slo", "sla", "api", "ci", "ip", "qa", "ai", "ml", "ab", "bm", "nps", "seo", "gtm"].includes(w))
      return w.toUpperCase();
    if (w === "a11y")
      return "A11y";
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(" ")
]));
var UPG_TYPED_ENTITIES = [
  "product",
  "outcome",
  "kpi",
  "objective",
  "key_result",
  "persona",
  "jtbd",
  "need",
  "opportunity",
  "solution",
  "hypothesis",
  "experiment",
  "learning",
  "competitor",
  "feature",
  "epic",
  "user_story",
  "release",
  "research_study",
  "insight",
  "metric"
];
var UPG_CORE_EDGE_TYPES = [
  "product_has_outcome",
  "product_has_objective",
  "product_has_competitor",
  "product_has_feature",
  "product_has_release",
  "product_has_research_study",
  "product_has_persona",
  "outcome_has_kpi",
  "outcome_has_opportunity",
  "objective_has_key_result",
  "persona_has_jtbd",
  "jtbd_has_need",
  "opportunity_has_solution",
  "solution_has_hypothesis",
  "hypothesis_has_experiment",
  "experiment_produces_learning",
  "feature_has_epic",
  "epic_has_user_story",
  "cluster_has_insight",
  "study_has_insight",
  "insight_informs_opportunity",
  // Opportunity as bridge — bundles user evidence
  "opportunity_addresses_need",
  "opportunity_pursues_outcome",
  "opportunity_relates_to_job",
  // Portfolio hierarchy
  "organization_has_portfolio",
  "organization_has_area",
  "portfolio_has_product",
  "area_has_product",
  // Cross-product edges
  "shares_persona",
  "shares_competitor",
  "shares_metric",
  "depends_on_product",
  "cannibalises",
  "succeeds"
];
var UPG_ENTITY_COUNT = UPG_DOMAINS.flatMap((d) => d.types).length;
var UPG_DOMAIN_COUNT = UPG_DOMAINS.length;
var UPG_TYPED_CORE_COUNT = UPG_TYPED_ENTITIES.length;
var UPG_ACTIVE_ENTITY_COUNT = UPG_ENTITY_META.filter((m) => m.maturity === "stable" || m.maturity === "proposed").length;
var UPG_DEPRECATED_ENTITY_COUNT = UPG_ENTITY_META.filter((m) => m.maturity === "deprecated").length;
var _coreDomains = UPG_DOMAINS.filter((d) => d.tier === "core");
var _extendedOnlyDomains = UPG_DOMAINS.filter((d) => d.tier === "extended");
var UPG_CORE_ENTITY_COUNT = _coreDomains.flatMap((d) => d.types).length;
var UPG_EXTENDED_ENTITY_COUNT = _extendedOnlyDomains.flatMap((d) => d.types).length;
var UPG_CORE_DOMAIN_COUNT = _coreDomains.length;
var UPG_EXTENDED_DOMAIN_COUNT = _extendedOnlyDomains.length;
var UPG_EXTENDED_EDGE_MAP = {
  // ── Strategic hierarchy ─────────────────────────────────────────────────
  "outcome:feature": "outcome_has_feature",
  "persona:need": "persona_has_need",
  "persona:user_need": "persona_has_user_need",
  "persona:switching_cost": "persona_has_switching_cost",
  "persona:pain_point": "persona_has_pain_point",
  "persona:desired_outcome": "persona_has_desired_outcome",
  "jtbd:need": "jtbd_has_need",
  "jtbd:desired_outcome": "jtbd_has_desired_outcome",
  "jtbd:job_step": "jtbd_has_job_step",
  "opportunity:design_concept": "opportunity_has_design_concept",
  "opportunity:feasibility_study": "opportunity_has_feasibility_study",
  "opportunity:design_sprint": "opportunity_has_design_sprint",
  "solution:prototype": "solution_has_prototype",
  "hypothesis:research_plan": "hypothesis_has_research_plan",
  "hypothesis:test_plan": "hypothesis_has_test_plan",
  "experiment:ab_test": "experiment_has_ab_test",
  "experiment:evidence": "experiment_has_evidence",
  "objective:north_star_metric": "objective_has_north_star_metric",
  "key_result:kpi": "key_result_has_kpi",
  "key_result:input_metric": "key_result_has_input_metric",
  "kpi:outcome": "kpi_has_outcome",
  "competitor:competitor_feature": "competitor_has_feature",
  "product:market_trend": "product_has_market_trend",
  // ── Strategic cascade ─────────────────────────────────────────────────────
  "product:vision": "product_has_vision",
  "product:mission": "product_has_mission",
  "product:strategic_theme": "product_has_strategic_theme",
  "product:initiative": "product_has_initiative",
  "product:capability": "product_has_capability",
  "product:value_stream": "product_has_value_stream",
  "product:strategic_pillar": "product_has_strategic_pillar",
  "product:assumption": "product_has_assumption",
  "vision:mission": "vision_has_mission",
  "mission:strategic_pillar": "mission_has_strategic_pillar",
  "strategic_pillar:strategic_theme": "strategic_pillar_has_strategic_theme",
  "strategic_pillar:capability": "strategic_pillar_has_capability",
  "strategic_pillar:value_stream": "strategic_pillar_has_value_stream",
  "strategic_pillar:decision": "strategic_pillar_has_decision",
  "strategic_theme:initiative": "strategic_theme_has_initiative",
  "initiative:assumption": "initiative_has_assumption",
  // ── Market ────────────────────────────────────────────────────────────────
  "product:market_segment": "product_has_market_segment",
  "product:competitive_analysis": "product_has_competitive_analysis",
  "competitive_analysis:competitor": "competitive_analysis_has_competitor",
  "competitive_analysis:market_trend": "competitive_analysis_has_market_trend",
  "competitive_analysis:market_segment": "competitive_analysis_has_market_segment",
  // ── UX Research ───────────────────────────────────────────────────────────
  "research_study:participant": "study_has_participant",
  "research_study:observation": "study_has_observation",
  "research_study:affinity_cluster": "study_has_affinity_cluster",
  "research_study:research_question": "study_has_research_question",
  "research_study:interview_guide": "study_has_interview_guide",
  "research_study:finding": "study_has_finding",
  "research_study:survey_response": "study_has_survey_response",
  "observation:quote": "observation_has_quote",
  "observation:highlight": "observation_has_highlight",
  "affinity_cluster:research_insight": "cluster_has_research_insight",
  "affinity_cluster:finding": "cluster_has_finding",
  // ── Design ────────────────────────────────────────────────────────────────
  "product:user_journey": "product_has_user_journey",
  "product:design_component": "product_has_design_component",
  "product:wireframe": "product_has_wireframe",
  "user_journey:journey_step": "journey_has_step",
  "research_insight:ux_insight": "insight_has_ux_insight",
  "research_insight:how_might_we": "insight_inspires_hmw",
  "ux_insight:how_might_we": "ux_insight_inspires_hmw",
  "need:how_might_we": "need_has_hmw",
  "pain_point:how_might_we": "pain_point_has_hmw",
  "how_might_we:design_concept": "hmw_has_concept",
  "design_concept:prototype": "concept_has_prototype",
  "design_concept:wireframe": "design_concept_has_wireframe",
  "design_component:design_token": "component_has_token",
  "design_component:design_pattern": "component_has_design_pattern",
  "design_component:design_guideline": "component_has_design_guideline",
  "design_component:interaction_spec": "component_has_interaction_spec",
  "prototype:annotation": "prototype_has_annotation",
  // ── Unified Context Layer (Design System) ─────────────────────────────────
  "product:design_system": "product_has_design_system",
  "product:user_flow": "product_has_user_flow",
  "product:external_api": "product_has_external_api",
  "product:data_flow": "product_has_data_flow",
  "design_system:design_component": "design_system_has_design_component",
  "design_system:design_token": "design_system_has_design_token",
  "design_system:design_guideline": "design_system_has_design_guideline",
  "design_system:brand_identity": "design_system_has_brand_identity",
  "design_system:user_journey": "design_system_has_user_journey",
  "design_system:user_flow": "design_system_has_user_flow",
  "design_system:ux_insight": "design_system_has_ux_insight",
  "user_flow:screen": "user_flow_has_screen",
  "screen:screen_state": "screen_has_screen_state",
  // Information Architecture edges
  "product:screen": "product_has_screen",
  "screen:screen": "screen_has_screen",
  "screen:design_component": "screen_has_component",
  "design_component:design_component": "component_has_component",
  "screen:feature": "screen_uses_feature",
  "screen:wireframe": "screen_has_wireframe",
  // ── Brand ─────────────────────────────────────────────────────────────────
  "product:brand_identity": "product_has_brand_identity",
  "brand_identity:brand_colour": "brand_has_colour",
  "brand_identity:brand_typography": "brand_has_typography",
  "brand_identity:brand_asset": "brand_identity_has_brand_asset",
  "brand_identity:brand_voice": "brand_has_voice",
  // ── Product Specification ─────────────────────────────────────────────────
  "product:roadmap": "product_has_roadmap",
  "product:theme": "product_has_theme",
  "feature:bug": "feature_has_bug",
  "user_story:acceptance_criterion": "story_has_acceptance_criterion",
  "user_story:task": "story_has_task",
  "roadmap:roadmap_item": "roadmap_has_roadmap_item",
  "roadmap:theme": "roadmap_has_theme",
  "roadmap:release": "roadmap_has_release",
  "theme:feature": "theme_has_feature",
  "release:changelog": "release_has_changelog",
  // ── Engineering ───────────────────────────────────────────────────────────
  "product:bounded_context": "product_has_bounded_context",
  "product:architecture_decision": "product_has_architecture_decision",
  "product:code_repository": "product_has_code_repository",
  "product:integration_pattern": "product_has_integration_pattern",
  "bounded_context:service": "context_has_service",
  "bounded_context:domain_event": "context_has_domain_event",
  "bounded_context:architecture_decision": "context_has_architecture_decision",
  "bounded_context:data_model": "bounded_context_has_data_model",
  "bounded_context:aggregate": "context_has_aggregate",
  "bounded_context:read_model": "context_has_read_model",
  "bounded_context:code_repository": "bounded_context_has_code_repository",
  "bounded_context:integration_pattern": "bounded_context_has_integration_pattern",
  "bounded_context:external_api": "bounded_context_has_external_api",
  "bounded_context:data_flow": "bounded_context_has_data_flow",
  "service:api_contract": "service_has_api_contract",
  "service:technical_debt_item": "service_has_technical_debt",
  "service:feature_flag": "service_has_feature_flag",
  "service:deployment": "service_has_deployment",
  "service:api_endpoint": "service_has_api_endpoint",
  "service:database_schema": "service_has_database_schema",
  "service:queue_topic": "service_has_queue_topic",
  "service:build_artifact": "service_has_build_artifact",
  "service:library_dependency": "service_has_library_dependency",
  "architecture_decision:technical_debt_item": "decision_has_technical_debt",
  "aggregate:domain_entity": "aggregate_has_domain_entity",
  "aggregate:value_object": "aggregate_has_value_object",
  "aggregate:command": "aggregate_has_command",
  // ── Growth ────────────────────────────────────────────────────────────────
  "product:north_star_metric": "product_has_north_star_metric",
  "product:funnel": "product_has_funnel",
  "product:acquisition_channel": "product_has_acquisition_channel",
  "product:cohort": "product_has_cohort",
  "product:segment": "product_has_segment",
  "product:growth_loop": "product_has_growth_loop",
  "product:attribution_model": "product_has_attribution_model",
  "north_star_metric:input_metric": "nsm_has_input_metric",
  "input_metric:kpi": "input_metric_drives_kpi",
  "north_star_metric:funnel": "north_star_metric_has_funnel",
  "north_star_metric:acquisition_channel": "north_star_metric_has_acquisition_channel",
  "north_star_metric:growth_loop": "north_star_metric_has_growth_loop",
  "north_star_metric:attribution_model": "north_star_metric_has_attribution_model",
  "north_star_metric:cohort": "north_star_metric_has_cohort",
  "north_star_metric:segment": "north_star_metric_has_segment",
  "funnel:funnel_step": "funnel_has_step",
  "acquisition_channel:campaign": "channel_has_campaign",
  "campaign:growth_experiment": "campaign_has_growth_experiment",
  "growth_experiment:variant": "growth_experiment_has_variant",
  // ── Business Model ────────────────────────────────────────────────────────
  "product:business_model": "product_has_business_model",
  "business_model:value_proposition": "business_model_has_value_proposition",
  "business_model:revenue_stream": "business_model_has_revenue_stream",
  "business_model:cost_structure": "business_model_has_cost_structure",
  "business_model:unit_economics": "business_model_has_unit_economics",
  "business_model:partnership": "business_model_has_partnership",
  "business_model:key_resource": "business_model_has_key_resource",
  "business_model:key_activity": "business_model_has_key_activity",
  "business_model:customer_segment_bm": "business_model_has_customer_segment_bm",
  "business_model:channel_bm": "business_model_has_channel_bm",
  "business_model:customer_relationship": "business_model_has_customer_relationship",
  "business_model:distribution_channel": "business_model_has_distribution_channel",
  "revenue_stream:pricing_tier": "revenue_stream_has_pricing_tier",
  // ── Go-To-Market ──────────────────────────────────────────────────────────
  "product:gtm_strategy": "product_has_gtm_strategy",
  "gtm_strategy:ideal_customer_profile": "gtm_has_icp",
  "gtm_strategy:positioning": "gtm_has_positioning",
  "gtm_strategy:launch": "gtm_has_launch",
  "gtm_strategy:content_strategy": "gtm_has_content_strategy",
  "gtm_strategy:sales_motion": "gtm_has_sales_motion",
  "gtm_strategy:competitive_battle_card": "gtm_has_competitive_battle_card",
  "gtm_strategy:demand_gen_program": "gtm_has_demand_gen_program",
  "gtm_strategy:territory": "gtm_has_territory",
  "positioning:messaging": "positioning_has_messaging",
  "positioning:objection": "positioning_has_objection",
  "positioning:proof_point": "positioning_has_proof_point",
  "value_proposition:objection": "value_proposition_has_objection",
  "value_proposition:proof_point": "value_proposition_has_proof_point",
  "competitive_battle_card:objection": "competitive_battle_card_has_objection",
  "objection:rebuttal": "objection_has_rebuttal",
  "rebuttal:proof_point": "rebuttal_has_proof_point",
  // ── Team & Organisation ───────────────────────────────────────────────────
  "product:team": "product_has_team",
  "product:stakeholder": "product_has_stakeholder",
  "product:product_decision": "product_has_product_decision",
  "product:department": "product_has_department",
  "department:team": "department_has_team",
  "department:stakeholder": "department_has_stakeholder",
  "team:role": "team_has_role",
  "team:team_okr": "team_has_team_okr",
  "team:retrospective": "team_has_retrospective",
  "team:dependency": "team_has_dependency",
  "team:skill": "team_has_skill",
  "team:ceremony": "team_has_ceremony",
  "team:capacity_plan": "team_has_capacity_plan",
  "team:product_decision": "team_has_product_decision",
  // ── Data & Analytics ──────────────────────────────────────────────────────
  "product:data_source": "product_has_data_source",
  "product:event_schema": "product_has_event_schema",
  "product:dashboard": "product_has_dashboard",
  "product:data_domain": "product_has_data_domain",
  "product:glossary_term": "product_has_glossary_term",
  "data_source:metric_definition": "data_source_has_metric_definition",
  "data_source:data_pipeline": "data_source_has_data_pipeline",
  "data_source:data_lineage": "data_source_has_data_lineage",
  "data_source:event_schema": "data_source_has_event_schema",
  "metric_definition:data_quality_rule": "metric_definition_has_data_quality_rule",
  "data_domain:data_product": "data_domain_has_data_product",
  "data_domain:data_source": "data_domain_has_data_source",
  "data_domain:glossary_term": "data_domain_has_glossary_term",
  "data_domain:data_model": "data_domain_has_data_model",
  "data_domain:dashboard": "data_domain_has_dashboard",
  "dashboard:report": "dashboard_has_report",
  "dashboard:ab_test": "dashboard_has_ab_test",
  // ── Operations & Customer Success ─────────────────────────────────────────
  "product:support_ticket": "product_has_support_ticket",
  "product:customer_feedback": "product_has_customer_feedback",
  "product:churn_reason": "product_has_churn_reason",
  "product:onboarding_flow": "product_has_onboarding_flow",
  "product:customer_health_score": "product_has_customer_health_score",
  "product:playbook": "product_has_playbook",
  "product:sla": "product_has_sla",
  "product:success_milestone": "product_has_success_milestone",
  "product:service_blueprint": "product_has_service_blueprint",
  "product:nps_score": "product_has_nps_score",
  "service_blueprint:onboarding_flow": "service_blueprint_has_onboarding_flow",
  "service_blueprint:playbook": "service_blueprint_has_playbook",
  "service_blueprint:sla": "service_blueprint_has_sla",
  "service_blueprint:customer_health_score": "service_blueprint_has_customer_health_score",
  "service_blueprint:support_ticket": "service_blueprint_has_support_ticket",
  "service_blueprint:customer_feedback": "service_blueprint_has_customer_feedback",
  "customer_health_score:nps_score": "customer_health_score_has_nps_score",
  "customer_health_score:success_milestone": "customer_health_score_has_success_milestone",
  "customer_feedback:churn_reason": "customer_feedback_has_churn_reason",
  "onboarding_flow:customer_journey_stage": "onboarding_flow_has_customer_journey_stage",
  "customer_journey_stage:touchpoint": "customer_journey_stage_has_touchpoint",
  // ── Content & Knowledge ───────────────────────────────────────────────────
  "product:content_piece": "product_has_content_piece",
  "product:knowledge_base_article": "product_has_knowledge_base_article",
  "product:brand_asset": "product_has_brand_asset",
  "product:internal_doc": "product_has_internal_doc",
  "product:prompt_template": "product_has_prompt_template",
  "product:documentation_template": "product_has_documentation_template",
  "content_strategy:content_calendar": "content_strategy_has_content_calendar",
  "content_strategy:content_theme": "content_strategy_has_content_theme",
  "content_calendar:content_theme": "content_calendar_has_content_theme",
  "content_calendar:content_piece": "content_calendar_has_content_piece",
  "content_calendar:knowledge_base_article": "content_calendar_has_knowledge_base_article",
  "content_calendar:brand_asset": "content_calendar_has_brand_asset",
  "content_calendar:internal_doc": "content_calendar_has_internal_doc",
  "content_calendar:prompt_template": "content_calendar_has_prompt_template",
  "content_calendar:documentation_template": "content_calendar_has_documentation_template",
  // ── Legal, Compliance & Risk ──────────────────────────────────────────────
  "product:compliance_requirement": "product_has_compliance_requirement",
  "product:risk": "product_has_risk",
  "product:data_contract": "product_has_data_contract",
  "product:legal_entity": "product_has_legal_entity",
  "product:audit_log_policy": "product_has_audit_log_policy",
  "product:privacy_policy": "product_has_privacy_policy",
  "product:compliance_framework": "product_has_compliance_framework",
  "legal_entity:ip_asset": "legal_entity_has_ip_asset",
  "legal_entity:contract": "legal_entity_has_contract",
  "contract:contract_clause": "contract_has_contract_clause",
  "compliance_framework:security_audit": "compliance_framework_has_security_audit",
  "compliance_framework:compliance_requirement": "compliance_framework_has_compliance_requirement",
  "compliance_framework:privacy_policy": "compliance_framework_has_privacy_policy",
  "compliance_framework:audit_log_policy": "compliance_framework_has_audit_log_policy",
  "compliance_framework:risk": "compliance_framework_has_risk",
  "compliance_framework:data_contract": "compliance_framework_has_data_contract",
  "compliance_framework:legal_entity": "compliance_framework_has_legal_entity",
  // ── DevOps & Platform ─────────────────────────────────────────────────────
  "product:slo": "product_has_slo",
  "product:incident": "product_has_incident",
  "product:runbook": "product_has_runbook",
  "product:monitor": "product_has_monitor",
  "product:ci_pipeline": "product_has_ci_pipeline",
  "product:release_strategy": "product_has_release_strategy",
  "product:on_call_rotation": "product_has_on_call_rotation",
  "product:infrastructure_component": "product_has_infrastructure_component",
  "slo:sli": "slo_has_sli",
  "slo:error_budget": "slo_has_error_budget",
  "incident:postmortem": "incident_has_postmortem",
  "monitor:alert_rule": "monitor_has_alert_rule",
  "ci_pipeline:build_artifact": "ci_pipeline_has_build_artifact",
  "infrastructure_component:slo": "infrastructure_component_has_slo",
  "infrastructure_component:monitor": "infrastructure_component_has_monitor",
  "infrastructure_component:ci_pipeline": "infrastructure_component_has_ci_pipeline",
  "infrastructure_component:incident": "infrastructure_component_has_incident",
  "infrastructure_component:runbook": "infrastructure_component_has_runbook",
  "infrastructure_component:release_strategy": "infrastructure_component_has_release_strategy",
  "infrastructure_component:on_call_rotation": "infrastructure_component_has_on_call_rotation",
  // ── Security ──────────────────────────────────────────────────────────────
  "product:threat_model": "product_has_threat_model",
  "product:security_control": "product_has_security_control",
  "product:security_policy": "product_has_security_policy",
  "product:security_incident": "product_has_security_incident",
  "product:penetration_test": "product_has_penetration_test",
  "product:security_review": "product_has_security_review",
  "product:data_classification": "product_has_data_classification",
  "product:access_policy": "product_has_access_policy",
  "threat_model:threat": "threat_model_has_threat",
  "threat_model:vulnerability": "threat_model_has_vulnerability",
  "security_policy:security_control": "security_policy_has_security_control",
  "security_policy:access_policy": "security_policy_has_access_policy",
  "security_policy:data_classification": "security_policy_has_data_classification",
  "security_policy:threat_model": "security_policy_has_threat_model",
  "security_policy:security_review": "security_policy_has_security_review",
  "security_policy:security_incident": "security_policy_has_security_incident",
  "security_review:penetration_test": "security_review_has_penetration_test",
  // ── Sales & Revenue ───────────────────────────────────────────────────────
  "product:pipeline_sales": "product_has_pipeline_sales",
  "product:account": "product_has_account",
  "product:lead": "product_has_lead",
  "product:subscription": "product_has_subscription",
  "product:forecast": "product_has_forecast",
  "pipeline_sales:pipeline_stage": "pipeline_sales_has_pipeline_stage",
  "pipeline_sales:lead": "pipeline_sales_has_lead",
  "pipeline_sales:account": "pipeline_sales_has_account",
  "pipeline_sales:forecast": "pipeline_sales_has_forecast",
  "pipeline_sales:subscription": "pipeline_sales_has_subscription",
  "account:contact": "account_has_contact",
  "account:deal": "account_has_deal",
  "deal:quote_document": "deal_has_quote_document",
  "subscription:invoice": "subscription_has_invoice",
  // ── Program Management ────────────────────────────────────────────────────
  "product:program": "product_has_program",
  "program:project": "program_has_project",
  "program:risk_register": "program_has_risk_register",
  "program:change_request": "program_has_change_request",
  "program:resource_allocation": "program_has_resource_allocation",
  "program:status_report": "program_has_status_report",
  "project:milestone": "project_has_milestone",
  "project:deliverable": "project_has_deliverable",
  "risk_register:risk_item": "risk_register_has_risk_item",
  // ── Accessibility ─────────────────────────────────────────────────────────
  "product:a11y_standard": "product_has_a11y_standard",
  "product:a11y_audit": "product_has_a11y_audit",
  "product:a11y_annotation": "product_has_a11y_annotation",
  "a11y_standard:a11y_guideline": "a11y_standard_has_a11y_guideline",
  "a11y_standard:a11y_audit": "a11y_standard_has_a11y_audit",
  "a11y_standard:a11y_annotation": "a11y_standard_has_a11y_annotation",
  "a11y_audit:a11y_issue": "a11y_audit_has_a11y_issue",
  // ── Marketing & Communications ────────────────────────────────────────────
  "product:marketing_strategy": "product_has_marketing_strategy",
  "product:press_release": "product_has_press_release",
  "product:event": "product_has_event",
  "product:community_initiative": "product_has_community_initiative",
  "marketing_strategy:marketing_channel": "marketing_strategy_has_marketing_channel",
  "marketing_strategy:seo_keyword": "marketing_strategy_has_seo_keyword",
  "marketing_strategy:press_release": "marketing_strategy_has_press_release",
  "marketing_strategy:event": "marketing_strategy_has_event",
  "marketing_strategy:community_initiative": "marketing_strategy_has_community_initiative",
  "marketing_channel:marketing_campaign_plan": "marketing_channel_has_marketing_campaign_plan",
  "marketing_campaign_plan:email_sequence": "marketing_campaign_plan_has_email_sequence",
  "marketing_campaign_plan:social_post": "marketing_campaign_plan_has_social_post",
  "marketing_campaign_plan:ad_creative": "marketing_campaign_plan_has_ad_creative",
  // ── Localisation & i18n ───────────────────────────────────────────────────
  "product:locale": "product_has_locale",
  "product:locale_config": "product_has_locale_config",
  "locale:translation_bundle": "locale_has_translation_bundle",
  "locale:cultural_adaptation": "locale_has_cultural_adaptation",
  "locale:regional_pricing": "locale_has_regional_pricing",
  "locale:locale_config": "locale_has_locale_config",
  "translation_bundle:translation_key": "translation_bundle_has_translation_key",
  // ── Customer Education & Training ─────────────────────────────────────────
  "product:education_program": "product_has_education_program",
  "education_program:tutorial": "education_program_has_tutorial",
  "education_program:walkthrough": "education_program_has_walkthrough",
  "education_program:webinar": "education_program_has_webinar",
  "education_program:certification": "education_program_has_certification",
  "education_program:help_video": "education_program_has_help_video",
  "education_program:learning_path": "education_program_has_learning_path",
  "learning_path:tutorial": "learning_path_has_tutorial",
  // ── Quality Assurance & Testing ───────────────────────────────────────────
  "product:test_suite": "product_has_test_suite",
  "product:qa_session": "product_has_qa_session",
  "product:test_coverage_report": "product_has_test_coverage_report",
  "product:test_environment": "product_has_test_environment",
  "test_suite:test_case": "test_suite_has_test_case",
  "test_suite:regression_test": "test_suite_has_regression_test",
  "test_suite:qa_session": "test_suite_has_qa_session",
  "test_suite:test_coverage_report": "test_suite_has_test_coverage_report",
  "test_suite:test_environment": "test_suite_has_test_environment",
  "qa_session:defect_report": "qa_session_has_defect_report",
  // ── Partner & Ecosystem Management ────────────────────────────────────────
  "product:partner_program": "product_has_partner_program",
  "product:api_ecosystem": "product_has_api_ecosystem",
  "product:developer_portal": "product_has_developer_portal",
  "partner_program:partner_tier": "partner_program_has_partner_tier",
  "partner_program:integration_partner": "partner_program_has_integration_partner",
  "partner_program:partner_revenue_share": "partner_program_has_partner_revenue_share",
  "partner_program:api_ecosystem": "partner_program_has_api_ecosystem",
  "partner_program:developer_portal": "partner_program_has_developer_portal",
  "api_ecosystem:marketplace_listing": "api_ecosystem_has_marketplace_listing",
  // ── Feedback & Voice of Customer ──────────────────────────────────────────
  "product:feedback_program": "product_has_feedback_program",
  "product:user_advisory_board": "product_has_user_advisory_board",
  "product:beta_program": "product_has_beta_program",
  "feedback_program:feature_request": "feedback_program_has_feature_request",
  "feedback_program:nps_campaign": "feedback_program_has_nps_campaign",
  "feedback_program:feedback_theme": "feedback_program_has_feedback_theme",
  "feedback_program:user_advisory_board": "feedback_program_has_user_advisory_board",
  "feedback_program:beta_program": "feedback_program_has_beta_program",
  "feature_request:feedback_vote": "feature_request_has_feedback_vote",
  // ── Pricing & Packaging ───────────────────────────────────────────────────
  "product:pricing_strategy": "product_has_pricing_strategy",
  "pricing_strategy:pricing_experiment": "pricing_strategy_has_pricing_experiment",
  "pricing_strategy:package": "pricing_strategy_has_package",
  "pricing_strategy:discount_strategy": "pricing_strategy_has_discount_strategy",
  "pricing_strategy:trial_config": "pricing_strategy_has_trial_config",
  "pricing_strategy:paywall": "pricing_strategy_has_paywall",
  // ── AI/ML Operations ──────────────────────────────────────────────────────
  "product:ai_model": "product_has_ai_model",
  "product:model_comparison": "product_has_model_comparison",
  "ai_model:prompt_version": "ai_model_has_prompt_version",
  "ai_model:eval_benchmark": "ai_model_has_eval_benchmark",
  "ai_model:ai_cost_tracker": "ai_model_has_ai_cost_tracker",
  "ai_model:hallucination_report": "ai_model_has_hallucination_report",
  "ai_model:ai_guardrail": "ai_model_has_ai_guardrail",
  "ai_model:model_comparison": "ai_model_has_model_comparison",
  "eval_benchmark:eval_run": "eval_benchmark_has_eval_run",
  // ── Agentic Workflows & Process ───────────────────────────────────────────
  "product:workflow_template": "product_has_workflow_template",
  "product:agent_definition": "product_has_agent_definition",
  "workflow_template:workflow_run": "workflow_template_has_workflow_run",
  "workflow_template:review_gate": "workflow_template_has_review_gate",
  "workflow_run:workflow_artifact": "workflow_run_has_workflow_artifact",
  "agent_definition:agent_session": "agent_definition_has_agent_session",
  "agent_definition:agent_skill": "agent_definition_has_agent_skill",
  "agent_definition:agent_hook": "agent_definition_has_agent_hook",
  "agent_definition:workflow_template": "agent_definition_has_workflow_template",
  "review_gate:approval_record": "review_gate_has_approval_record",
  // ── Portfolio ─────────────────────────────────────────────────────────────
  "product:product_area": "product_has_product_area",
  "organization:portfolio": "organization_has_portfolio",
  "organization:product_area": "organization_has_area",
  "portfolio:product": "portfolio_has_product",
  "product_area:product": "area_has_product",
  "portfolio:portfolio": "portfolio_has_sub_portfolio",
  "product_area:product_area": "area_has_sub_area",
  // ── Cross-product edges ─────────────────────────────────────────────────
  "product:product:shares_persona": "shares_persona",
  "product:product:shares_competitor": "shares_competitor",
  "product:product:shares_metric": "shares_metric",
  "product:product:depends_on": "depends_on_product",
  "product:product:cannibalises": "cannibalises",
  "product:product:succeeds": "succeeds",
  // ── Research → User ───────────────────────────────────────────────────────
  "finding:pain_point": "finding_validates_pain_point",
  "finding:desired_outcome": "finding_reveals_desired_outcome",
  "finding:jtbd": "finding_informs_jtbd",
  "finding:persona": "finding_characterises_persona",
  "finding:user_need": "finding_validates_user_need",
  "observation:pain_point": "observation_reveals_pain_point",
  "observation:persona": "observation_relates_to_persona",
  "quote:pain_point": "quote_evidences_pain_point",
  "quote:jtbd": "quote_evidences_jtbd",
  "research_insight:persona": "insight_enriches_persona",
  "research_insight:pain_point": "insight_validates_pain_point",
  // ── Research → Discovery ──────────────────────────────────────────────────
  "finding:opportunity": "finding_surfaces_opportunity",
  "finding:solution": "finding_informs_solution",
  "finding:how_might_we": "finding_inspires_hmw",
  "finding:design_concept": "finding_inspires_concept",
  "research_insight:opportunity": "insight_surfaces_opportunity",
  "research_insight:solution": "insight_informs_solution",
  "observation:ux_insight": "observation_yields_ux_insight",
  // ── Validation → Discovery ────────────────────────────────────────────────
  "learning:opportunity": "learning_validates_opportunity",
  "learning:solution": "learning_validates_solution",
  "learning:hypothesis": "learning_refines_hypothesis",
  "learning:pain_point": "learning_validates_pain_point",
  "learning:jtbd": "learning_validates_jtbd",
  "learning:feature": "learning_informs_feature",
  "evidence:opportunity": "evidence_supports_opportunity",
  "evidence:hypothesis": "evidence_supports_hypothesis",
  "experiment:feature": "experiment_tests_feature",
  // ── Design → Engineering ──────────────────────────────────────────────────
  "design_component:feature": "component_implements_feature",
  "design_component:service": "component_uses_service",
  "prototype:feature": "prototype_validates_feature",
  "wireframe:feature": "wireframe_specifies_feature",
  "user_flow:feature": "flow_requires_feature",
  // ── Design → User ────────────────────────────────────────────────────────
  "user_journey:persona": "journey_maps_persona",
  "user_journey:jtbd": "journey_addresses_jtbd",
  "user_flow:persona": "flow_targets_persona",
  "journey_step:pain_point": "step_reveals_pain_point",
  // ── Market → Strategy ─────────────────────────────────────────────────────
  "competitive_analysis:outcome": "analysis_informs_outcome",
  "competitive_analysis:opportunity": "analysis_reveals_opportunity",
  "competitive_analysis:strategic_theme": "analysis_informs_theme",
  "market_trend:opportunity": "trend_creates_opportunity",
  "market_trend:strategic_theme": "trend_informs_theme",
  "competitor_feature:feature": "competitor_feature_inspires_feature",
  "competitor:persona": "competitor_competes_for_persona",
  "competitor_feature:solution": "competitor_feature_inspires_solution",
  // ── Growth → User / Market ────────────────────────────────────────────────
  "acquisition_channel:segment": "channel_targets_segment",
  "acquisition_channel:persona": "channel_reaches_persona",
  "funnel:persona": "funnel_maps_persona",
  "cohort:persona": "cohort_represents_persona",
  "segment:persona": "segment_maps_persona",
  // ── Business Model → User / Strategy ──────────────────────────────────────
  "revenue_stream:outcome": "revenue_stream_drives_outcome",
  "revenue_stream:kpi": "revenue_stream_measured_by_kpi",
  "value_proposition:persona": "vp_targets_persona",
  "value_proposition:jtbd": "vp_addresses_jtbd",
  "value_proposition:pain_point": "vp_solves_pain_point",
  // ── Engineering → Product Spec ────────────────────────────────────────────
  "service:feature": "service_powers_feature",
  "bounded_context:feature": "context_contains_feature",
  "technical_debt_item:feature": "debt_blocks_feature",
  "api_endpoint:feature": "endpoint_serves_feature",
  // ── GTM → User / Market ───────────────────────────────────────────────────
  "ideal_customer_profile:persona": "icp_maps_persona",
  "ideal_customer_profile:segment": "icp_targets_segment",
  "positioning:persona": "positioning_resonates_persona",
  "positioning:competitor": "positioning_differentiates_competitor",
  "launch:feature": "launch_ships_feature",
  "launch:release": "launch_announces_release",
  // ── Ops & CS → User / Spec ────────────────────────────────────────────────
  "customer_feedback:pain_point": "feedback_surfaces_pain_point",
  "customer_feedback:feature_request": "feedback_becomes_request",
  "support_ticket:bug": "ticket_reports_bug",
  "support_ticket:pain_point": "ticket_reveals_pain_point",
  "churn_reason:pain_point": "churn_reveals_pain_point",
  // ── Feedback & VoC → Product Spec / Discovery ─────────────────────────────
  "feature_request:feature": "request_becomes_feature",
  "feature_request:opportunity": "request_surfaces_opportunity",
  "feedback_theme:pain_point": "theme_maps_pain_point",
  // ── Program Mgmt → Product Spec ───────────────────────────────────────────
  "milestone:release": "milestone_triggers_release",
  "deliverable:feature": "deliverable_ships_feature",
  "project:epic": "project_delivers_epic",
  // ── Data & Analytics → Strategy / Growth ──────────────────────────────────
  "metric_definition:kpi": "metric_measures_kpi",
  "metric_definition:input_metric": "metric_measures_input_metric",
  "ab_test:hypothesis": "ab_test_tests_hypothesis",
  "dashboard:kpi": "dashboard_tracks_kpi",
  // ── Product Spec → User ───────────────────────────────────────────────────
  "user_story:persona": "story_serves_persona",
  "feature:jtbd": "feature_fulfils_jtbd",
  "feature:pain_point": "feature_solves_pain_point"
};
var UPG_EXTENDED_EDGE_TYPES_SET = new Set(Object.values(UPG_EXTENDED_EDGE_MAP));

// src/store.ts
var UPGFileStore = class {
  doc;
  filePath;
  dirty = false;
  saveTimer = null;
  selfWriteInProgress = false;
  watcher = null;
  // Indexes for O(1) lookups
  nodeMap = /* @__PURE__ */ new Map();
  edgeMap = /* @__PURE__ */ new Map();
  edgesByNode = /* @__PURE__ */ new Map();
  // nodeId → Set<edgeId>
  // Session change log
  changeLog = [];
  // Content hash for cache-aware responses
  contentHash = "";
  // ── Load / Save ──────────────────────────────────────────────────────────
  async load(filePath) {
    this.filePath = path.resolve(filePath);
    const raw = await fs.readFile(this.filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const result = validateUPGDocument(parsed);
    if (!result.valid) {
      const msgs = result.errors.map((e) => `  ${e.path}: ${e.message}`).join("\n");
      throw new Error(`Invalid UPG document:
${msgs}`);
    }
    this.doc = parsed;
    this.rebuildIndexes();
    this.computeHash();
    this.dirty = false;
    this.startWatching();
  }
  async save() {
    if (!this.dirty) return;
    this.doc.exported_at = (/* @__PURE__ */ new Date()).toISOString();
    if (!this.doc.source.tool) {
      this.doc.source.tool = "upg-mcp-local";
    }
    const output = JSON.stringify(this.doc, null, 2) + "\n";
    const tmpPath = this.filePath + ".tmp";
    this.selfWriteInProgress = true;
    try {
      await fs.writeFile(tmpPath, output, "utf-8");
      await fs.rename(tmpPath, this.filePath);
      this.dirty = false;
      this.computeHash();
    } finally {
      setTimeout(() => {
        this.selfWriteInProgress = false;
      }, 150);
    }
  }
  async flush() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    await this.save();
  }
  scheduleSave() {
    this.dirty = true;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save(), 300);
  }
  // ── File Watching ────────────────────────────────────────────────────────
  startWatching() {
    if (this.watcher) return;
    this.watcher = watch(this.filePath, {
      persistent: false,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 }
    });
    this.watcher.on("change", async () => {
      if (this.selfWriteInProgress) return;
      try {
        const raw = await fs.readFile(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (validateUPGDocument(parsed).valid) {
          this.doc = parsed;
          this.rebuildIndexes();
          this.computeHash();
          this.dirty = false;
        }
      } catch {
      }
    });
  }
  stopWatching() {
    this.watcher?.close();
    this.watcher = null;
  }
  // ── Index Management ─────────────────────────────────────────────────────
  rebuildIndexes() {
    this.nodeMap.clear();
    this.edgeMap.clear();
    this.edgesByNode.clear();
    for (const node of this.doc.nodes) {
      this.nodeMap.set(node.id, node);
    }
    for (const edge of this.doc.edges) {
      this.edgeMap.set(edge.id, edge);
      this.indexEdgeForNode(edge);
    }
  }
  indexEdgeForNode(edge) {
    for (const nodeId2 of [edge.source, edge.target]) {
      let set = this.edgesByNode.get(nodeId2);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        this.edgesByNode.set(nodeId2, set);
      }
      set.add(edge.id);
    }
  }
  unindexEdgeForNode(edge) {
    this.edgesByNode.get(edge.source)?.delete(edge.id);
    this.edgesByNode.get(edge.target)?.delete(edge.id);
  }
  // ── Hash ─────────────────────────────────────────────────────────────────
  computeHash() {
    const content = JSON.stringify({
      nodes: this.doc.nodes.length,
      edges: this.doc.edges.length,
      nodeIds: this.doc.nodes.map((n) => n.id).sort(),
      edgeIds: this.doc.edges.map((e) => e.id).sort(),
      lastMod: this.doc.exported_at
    });
    this.contentHash = createHash("sha256").update(content).digest("hex").slice(0, 16);
  }
  getContentHash() {
    return this.contentHash;
  }
  // ── Reads ────────────────────────────────────────────────────────────────
  getFilePath() {
    return this.filePath;
  }
  getDocument() {
    return this.doc;
  }
  getProduct() {
    return this.doc.product;
  }
  getNode(id) {
    return this.nodeMap.get(id);
  }
  getEdge(id) {
    return this.edgeMap.get(id);
  }
  getAllNodes() {
    return this.doc.nodes;
  }
  getAllEdges() {
    return this.doc.edges;
  }
  getEdgesForNode(nodeId2) {
    const edgeIds = this.edgesByNode.get(nodeId2);
    if (!edgeIds) return [];
    return [...edgeIds].map((id) => this.edgeMap.get(id)).filter(Boolean);
  }
  // ── Change Log ──────────────────────────────────────────────────────────
  logChange(action, entity, id, type, title) {
    this.changeLog.push({
      action,
      entity,
      id,
      type,
      title,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  getChanges(since) {
    if (!since) return [...this.changeLog];
    return this.changeLog.filter((c) => c.timestamp >= since);
  }
  // ── Writes ───────────────────────────────────────────────────────────────
  addNode(node) {
    this.doc.nodes.push(node);
    this.nodeMap.set(node.id, node);
    this.logChange("create", "node", node.id, node.type, node.title);
    this.scheduleSave();
  }
  updateNode(id, patch) {
    const node = this.nodeMap.get(id);
    if (!node) throw new Error(`Node not found: ${id}`);
    if (patch.type !== void 0) node.type = patch.type;
    if (patch.title !== void 0) node.title = patch.title;
    if (patch.description !== void 0) node.description = patch.description;
    if (patch.tags !== void 0) node.tags = patch.tags;
    if (patch.status !== void 0) node.status = patch.status;
    if (patch.properties) {
      node.properties = { ...node.properties ?? {}, ...patch.properties };
    }
    this.logChange("update", "node", node.id, node.type, node.title);
    this.scheduleSave();
    return node;
  }
  removeNode(id) {
    const node = this.nodeMap.get(id);
    if (!node) throw new Error(`Node not found: ${id}`);
    const edgeIds = new Set(this.edgesByNode.get(id) ?? []);
    const removedEdgeIds = [];
    for (const edgeId2 of edgeIds) {
      const edge = this.edgeMap.get(edgeId2);
      if (edge) {
        this.unindexEdgeForNode(edge);
        this.edgeMap.delete(edgeId2);
        removedEdgeIds.push(edgeId2);
      }
    }
    this.doc.edges = this.doc.edges.filter((e) => !edgeIds.has(e.id));
    this.edgesByNode.delete(id);
    this.doc.nodes = this.doc.nodes.filter((n) => n.id !== id);
    this.nodeMap.delete(id);
    this.logChange("delete", "node", node.id, node.type, node.title);
    for (const eid of removedEdgeIds) {
      this.logChange("delete", "edge", eid, "cascade", void 0);
    }
    this.scheduleSave();
    return { node, removedEdgeIds };
  }
  addEdge(edge) {
    if (!this.nodeMap.has(edge.source))
      throw new Error(`Source node not found: ${edge.source}`);
    if (!this.nodeMap.has(edge.target))
      throw new Error(`Target node not found: ${edge.target}`);
    this.doc.edges.push(edge);
    this.edgeMap.set(edge.id, edge);
    this.indexEdgeForNode(edge);
    this.logChange("create", "edge", edge.id, edge.type, void 0);
    this.scheduleSave();
  }
  removeEdge(id) {
    const edge = this.edgeMap.get(id);
    if (!edge) throw new Error(`Edge not found: ${id}`);
    this.unindexEdgeForNode(edge);
    this.edgeMap.delete(id);
    this.doc.edges = this.doc.edges.filter((e) => e.id !== id);
    this.logChange("delete", "edge", edge.id, edge.type, void 0);
    this.scheduleSave();
    return edge;
  }
  migrateType(fromType, toType, defaults) {
    let migratedNodes = 0;
    let migratedEdges = 0;
    const edgeTypesRenamed = {};
    for (const node of this.doc.nodes) {
      if (node.type === fromType) {
        node.type = toType;
        if (defaults && Object.keys(defaults).length > 0) {
          node.properties = { ...defaults, ...node.properties ?? {} };
        }
        migratedNodes++;
      }
    }
    for (const edge of this.doc.edges) {
      if (edge.type.includes(fromType)) {
        const newEdgeType = edge.type.split(fromType).join(toType);
        edgeTypesRenamed[edge.type] = newEdgeType;
        edge.type = newEdgeType;
        migratedEdges++;
      }
    }
    this.scheduleSave();
    return { migratedNodes, migratedEdges, edgeTypesRenamed };
  }
};

// src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import * as fs2 from "fs";
import * as fsp from "fs/promises";
import * as path2 from "path";

// src/lib/id.ts
import { nanoid } from "nanoid";
function nodeId() {
  return `n_${nanoid(16)}`;
}
function edgeId() {
  return `e_${nanoid(16)}`;
}

// src/lib/edge-inference.ts
var CORE_EDGE_LOOKUP = /* @__PURE__ */ new Map();
for (const edgeType of UPG_CORE_EDGE_TYPES) {
  const match = edgeType.match(/^(\w+?)_(has|produces|informs|addresses|pursues|relates_to)_(\w+)$/);
  if (match) {
    const [, sourceType, , targetType] = match;
    CORE_EDGE_LOOKUP.set(`${sourceType}:${targetType}`, edgeType);
  }
}
function inferEdgeTypeWithTier(sourceType, targetType) {
  const key = `${sourceType}:${targetType}`;
  const core = CORE_EDGE_LOOKUP.get(key);
  if (core) return { edgeType: core, tier: "core" };
  const extended = UPG_EXTENDED_EDGE_MAP[key];
  if (extended) return { edgeType: extended, tier: "extended" };
  const fallback = `${sourceType}_has_${targetType}`;
  return {
    edgeType: fallback,
    tier: "unknown",
    warning: `Edge type '${fallback}' is not in the UPG standard or extended set. It will work locally but may not sync correctly to the cloud.`
  };
}
function inferEdgeType(sourceType, targetType) {
  return inferEdgeTypeWithTier(sourceType, targetType).edgeType;
}

// src/server.ts
var BUSINESS_AREAS = {
  identity: { emoji: "\u{1F3AF}", types: ["product", "vision", "mission"] },
  understanding: { emoji: "\u{1F464}", types: ["persona", "jtbd", "pain_point", "research_study", "research_insight"] },
  discovery: { emoji: "\u{1F4A1}", types: ["opportunity", "solution", "competitor", "hypothesis", "experiment", "learning"] },
  reaching: { emoji: "\u{1F4E3}", types: ["ideal_customer_profile", "positioning", "messaging", "acquisition_channel", "content_strategy"] },
  converting: { emoji: "\u{1F4B0}", types: ["value_proposition", "pricing_tier", "funnel", "funnel_step"] },
  building: { emoji: "\u{1F4E6}", types: ["feature", "user_story", "epic", "release", "user_journey", "user_flow"] },
  sustaining: { emoji: "\u{1F3E6}", types: ["business_model", "revenue_stream", "cost_structure", "unit_economics", "pricing_strategy"] },
  learning: { emoji: "\u{1F4CA}", types: ["outcome", "kpi", "metric", "objective", "key_result", "retrospective"] }
};
var LIFECYCLE_PHASES = {
  strategy: ["product", "outcome", "kpi", "objective", "key_result", "vision", "mission", "strategic_theme", "initiative"],
  users: ["persona", "jtbd", "pain_point", "desired_outcome", "job_step", "user_need"],
  discovery: ["opportunity", "solution", "research_study", "research_insight", "competitor"],
  validation: ["hypothesis", "experiment", "learning", "evidence"],
  execution: ["feature", "epic", "user_story", "release", "task", "bug"]
};
var queryCache = /* @__PURE__ */ new Map();
var queryCacheCounter = 0;
var TOOLS = [
  {
    name: "get_product_context",
    description: "Returns the product summary, entity counts by type, and a human-readable overview of the graph. Use this first to understand what is in the file. Pass include_summary for edge counts, orphan count, and edges-by-type breakdown.",
    inputSchema: {
      type: "object",
      properties: {
        include_summary: {
          type: "boolean",
          description: "Include detailed graph statistics (edge counts by type, orphan count) \u2014 replaces need for get_graph_summary"
        },
        if_changed_since: { type: "string", description: "Hash from a previous response \u2014 returns { changed: false } if graph unchanged" }
      }
    }
  },
  {
    name: "get_graph_digest",
    description: "Pre-computed graph analytics in one call: counts, health metrics, chain completeness, business area coverage, lifecycle balance. Replaces multiple fetch-and-compute patterns. ~500 tokens vs ~5-8K for equivalent manual fetches.",
    inputSchema: {
      type: "object",
      properties: {
        if_changed_since: { type: "string", description: "Hash from a previous response \u2014 returns { changed: false } if graph unchanged (saves ~470 tokens)" }
      }
    }
  },
  {
    name: "list_nodes",
    description: "List entities in the graph with filtering, edge inclusion, and count-only mode. Supports pagination.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", description: "Filter by entity type" },
        status: { type: "string", description: "Filter by status value" },
        tags: { type: "array", items: { type: "string" }, description: "Filter by tags (matches any)" },
        parent_id: { type: "string", description: "Filter to children of this node (connected by outgoing edge from parent)" },
        include_edges: { type: "boolean", description: "Include compact edge data (id, type, source, target) per node" },
        count_only: { type: "boolean", description: "Return only the total count, no node data" },
        offset: { type: "number", description: "Skip N results (default 0)" },
        limit: { type: "number", description: "Max results (default 50, max 200)" },
        if_changed_since: { type: "string", description: "Hash from a previous response \u2014 returns { changed: false } if graph unchanged" }
      }
    }
  },
  {
    name: "get_node",
    description: "Get a single entity by ID with its full properties and all connected edges.",
    inputSchema: {
      type: "object",
      properties: {
        node_id: { type: "string", description: "The node ID" },
        compact_edges: { type: "boolean", description: "Omit source_title/target_title from edges (saves ~30% on edge-heavy nodes)" }
      },
      required: ["node_id"]
    }
  },
  {
    name: "get_nodes",
    description: "Batch-fetch multiple entities by ID. Returns each node with its edges. More efficient than multiple get_node calls.",
    inputSchema: {
      type: "object",
      properties: {
        ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of node IDs to fetch (max 50)"
        },
        compact_edges: { type: "boolean", description: "Omit titles from edges" }
      },
      required: ["ids"]
    }
  },
  {
    name: "search_nodes",
    description: 'Search entities by text. By default searches title (score 3) and description (score 1). Use "fields" to also search tags (score 2) and properties (score 1). Results include matched_field.',
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search text (case-insensitive substring match)" },
        type: { type: "string", description: "Optional type filter" },
        fields: {
          type: "array",
          items: { type: "string" },
          description: 'Fields to search: "title", "description", "tags", "properties" (default: title + description)'
        },
        limit: { type: "number", description: "Max results (default 20, max 100)" }
      },
      required: ["query"]
    }
  },
  {
    name: "query",
    description: 'Traverse the graph following typed edges. Returns a subgraph (nodes + edges) in a single call. Replaces multi-step fetch patterns for trees and discovery flows. Example: query({ from: "persona", traverse: ["persona_has_jtbd", "jtbd_has_pain_point"], depth: 2 })',
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", description: "Start from all nodes of this type" },
        from_id: { type: "string", description: "Start from a specific node ID (alternative to from)" },
        traverse: {
          type: "array",
          items: { type: "string" },
          description: 'Edge types to follow at each level (in order). If omitted, follows all edges. Prefix with ! to exclude (e.g. "!product_has_feature").'
        },
        depth: { type: "number", description: "Max traversal depth (default 3, max 10)" },
        include: {
          type: "array",
          items: { type: "string" },
          description: 'Fields to include per node: "title", "status", "tags", "description", "properties" (default: title, status, type)'
        },
        limit: { type: "number", description: "Max nodes to return (default 200, max 1000)" },
        edge_include: {
          type: "array",
          items: { type: "string" },
          description: 'Edge fields to return: "id", "type", "source", "target". Empty array = no edges. Default: all fields.'
        },
        property_include: {
          type: "array",
          items: { type: "string" },
          description: 'When "properties" is in include, only return these property keys (e.g. ["severity", "importance"])'
        },
        diff_from: { type: "string", description: "Result ID from a previous query \u2014 returns only added/removed nodes since that result" }
      }
    }
  },
  {
    name: "create_node",
    description: "Create a new entity in the graph. Optionally connect it to a parent node.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: 'UPG entity type (e.g. "persona", "opportunity")'
        },
        title: { type: "string", description: "Entity title" },
        description: { type: "string", description: "Optional description" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Freeform tags"
        },
        status: { type: "string", description: "Lifecycle status" },
        properties: {
          type: "object",
          description: "Type-specific fields"
        },
        parent_id: {
          type: "string",
          description: "Parent node ID \u2014 creates an edge automatically"
        }
      },
      required: ["type", "title"]
    }
  },
  {
    name: "update_node",
    description: "Update an existing entity. Unspecified fields are preserved.",
    inputSchema: {
      type: "object",
      properties: {
        node_id: { type: "string", description: "The node ID to update" },
        type: { type: "string", description: "Change the entity type (use for migrations)" },
        title: { type: "string" },
        description: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        status: { type: "string" },
        properties: {
          type: "object",
          description: "Merged with existing properties"
        }
      },
      required: ["node_id"]
    }
  },
  {
    name: "delete_node",
    description: "Remove an entity and all its connected edges from the graph.",
    inputSchema: {
      type: "object",
      properties: {
        node_id: { type: "string", description: "The node ID to delete" }
      },
      required: ["node_id"]
    }
  },
  {
    name: "create_edge",
    description: "Create a relationship between two nodes. Edge type is auto-inferred if omitted. Target can be specified by ID or by title+type (server resolves).",
    inputSchema: {
      type: "object",
      properties: {
        source_id: { type: "string", description: "Source node ID" },
        target_id: { type: "string", description: "Target node ID" },
        target_title: { type: "string", description: "Target node title (alternative to target_id \u2014 requires target_type)" },
        target_type: { type: "string", description: "Target node type (used with target_title for resolution)" },
        type: {
          type: "string",
          description: "Edge type \u2014 auto-inferred if omitted"
        }
      },
      required: ["source_id"]
    }
  },
  {
    name: "delete_edge",
    description: "Remove a relationship between two nodes.",
    inputSchema: {
      type: "object",
      properties: {
        edge_id: { type: "string", description: "The edge ID to delete" }
      },
      required: ["edge_id"]
    }
  },
  {
    name: "get_changes",
    description: "Get a log of all mutations made during this session. Use to verify what was created, updated, or deleted without re-fetching.",
    inputSchema: {
      type: "object",
      properties: {
        since: { type: "string", description: "ISO 8601 timestamp \u2014 only return changes after this time (default: all session changes)" }
      }
    }
  },
  {
    name: "get_graph_summary",
    description: "[DEPRECATED \u2014 use get_product_context with include_summary: true instead] High-level statistics: node/edge counts by type, orphan count, graph health.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "list_product_areas",
    description: "List all product areas in the graph. Product areas are top-level organizational units within a product.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "get_area_graph",
    description: "Get all entities and edges that belong to a product area. Returns the sub-graph scoped to that area.",
    inputSchema: {
      type: "object",
      properties: {
        area_id: { type: "string", description: "The product area node ID" },
        depth: {
          type: "number",
          description: "How many levels deep to traverse (default 3, max 10)"
        }
      },
      required: ["area_id"]
    }
  },
  {
    name: "list_local_products",
    description: "Find all .upg files in the current directory and its immediate subdirectories.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "switch_product",
    description: 'Switch to a different .upg file without restarting the server. In workspace mode, you can pass just the filename (e.g. "client-project" or "client-project.upg").',
    inputSchema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          description: "Path to the .upg file \u2014 can be relative, absolute, or just a product name in workspace mode"
        }
      },
      required: ["file"]
    }
  },
  {
    name: "get_workspace_info",
    description: "Get information about the current UPG workspace \u2014 which product is loaded, what other products are available, workspace mode.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "init_workspace",
    description: "Initialize a UPG workspace \u2014 creates .upg/ folder and moves the current .upg file into it. Enables multi-product management.",
    inputSchema: {
      type: "object",
      properties: {
        move_existing: {
          type: "boolean",
          description: "Move existing .upg files into the workspace (default true)"
        }
      }
    }
  },
  {
    name: "migrate_type",
    description: "Migrate all entities of one type to another. Updates node types AND renames associated edge types. Use for schema migrations (e.g. pain_point \u2192 need).",
    inputSchema: {
      type: "object",
      properties: {
        from_type: { type: "string", description: "The current entity type to migrate FROM" },
        to_type: { type: "string", description: "The new entity type to migrate TO" },
        dry_run: { type: "boolean", description: "Preview changes without applying (default false)" }
      },
      required: ["from_type", "to_type"]
    }
  },
  {
    name: "get_area_context",
    description: "Check if the current working directory has a .upg-area.json that scopes work to a specific product area.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "create_area",
    description: "Create a product area entity. Product areas represent the organisational axis \u2014 who owns what. Supports nesting via parent_area_id.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: 'Area name (e.g. "Search", "Payments")' },
        description: { type: "string", description: "What this area covers" },
        parent_area_id: {
          type: "string",
          description: "Parent area ID for creating a sub-area"
        },
        strategic_priority: {
          type: "string",
          enum: ["critical", "high", "medium", "low"],
          description: "Strategic priority of this area"
        },
        owner: { type: "string", description: "Person or team that owns this area" }
      },
      required: ["title"]
    }
  },
  {
    name: "list_portfolios",
    description: "List all portfolio entities in the graph. Portfolios represent the strategic axis \u2014 where we invest.",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "create_cross_product_edge",
    description: "Create a cross-product relationship between two entities in different products within a portfolio graph. Types: shares_persona, shares_competitor, shares_metric, depends_on_product, cannibalises, succeeds.",
    inputSchema: {
      type: "object",
      properties: {
        source_id: { type: "string", description: "Source node ID" },
        target_id: { type: "string", description: "Target node ID" },
        type: {
          type: "string",
          enum: ["shares_persona", "shares_competitor", "shares_metric", "depends_on_product", "cannibalises", "succeeds"],
          description: "Cross-product relationship type"
        },
        source_product_id: { type: "string", description: "Product ID of the source node" },
        target_product_id: { type: "string", description: "Product ID of the target node" }
      },
      required: ["source_id", "target_id", "type"]
    }
  }
];
function normalizeTags(tags) {
  if (!tags) return void 0;
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch {
    }
    return [tags];
  }
  return void 0;
}
function text(s) {
  return { content: [{ type: "text", text: s }] };
}
function textError(s) {
  return { content: [{ type: "text", text: s }], isError: true };
}
function createServer(store) {
  const server = new Server(
    { name: "upg-local", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    switch (name) {
      // ── get_product_context ──────────────────────────────────────────
      case "get_product_context": {
        const ifChangedCtx = args.if_changed_since;
        const currentHashCtx = store.getContentHash();
        if (ifChangedCtx && ifChangedCtx === currentHashCtx) {
          return text(JSON.stringify({ changed: false, _hash: currentHashCtx }, null, 2));
        }
        const doc = store.getDocument();
        const product = doc.product;
        const nodes = store.getAllNodes();
        const edges = store.getAllEdges();
        const includeSummary = args.include_summary ?? false;
        const countsByType = {};
        for (const n of nodes) {
          countsByType[n.type] = (countsByType[n.type] ?? 0) + 1;
        }
        const lines = [
          `## ${product.title}`,
          product.description ? `
${product.description}` : "",
          product.stage ? `
Stage: ${product.stage}` : "",
          `
### Graph Stats`,
          `- Nodes: ${nodes.length}`,
          `- Edges: ${edges.length}`,
          `- Entity types: ${Object.keys(countsByType).length}`,
          `
### Entities by Type`,
          ...Object.entries(countsByType).sort(([, a], [, b]) => b - a).map(([type, count]) => `- ${type}: ${count}`)
        ];
        if (includeSummary) {
          const edgesByType = {};
          for (const e of edges)
            edgesByType[e.type] = (edgesByType[e.type] ?? 0) + 1;
          const connectedNodes = /* @__PURE__ */ new Set();
          for (const e of edges) {
            connectedNodes.add(e.source);
            connectedNodes.add(e.target);
          }
          const orphanCount = nodes.filter((n) => !connectedNodes.has(n.id)).length;
          lines.push(
            `
### Graph Summary`,
            `- Orphan nodes: ${orphanCount}`,
            `
### Edges by Type`,
            ...Object.entries(edgesByType).sort(([, a], [, b]) => b - a).map(([type, count]) => `- ${type}: ${count}`)
          );
        }
        lines.push(`
_hash: ${currentHashCtx}`);
        return text(lines.filter(Boolean).join("\n"));
      }
      // ── get_graph_digest ─────────────────────────────────────────────
      case "get_graph_digest": {
        const ifChanged = args.if_changed_since;
        const currentHash = store.getContentHash();
        if (ifChanged && ifChanged === currentHash) {
          return text(JSON.stringify({ changed: false, _hash: currentHash }, null, 2));
        }
        const nodes = store.getAllNodes();
        const edges = store.getAllEdges();
        const product = store.getProduct();
        const byType = {};
        for (const n of nodes) byType[n.type] = (byType[n.type] ?? 0) + 1;
        const connectedNodes = /* @__PURE__ */ new Set();
        for (const e of edges) {
          connectedNodes.add(e.source);
          connectedNodes.add(e.target);
        }
        const orphanCount = nodes.filter((n) => !connectedNodes.has(n.id)).length;
        const hypothesisCount = byType["hypothesis"] ?? 0;
        const experimentCount = byType["experiment"] ?? 0;
        const personaCount = byType["persona"] ?? 0;
        const chainStats = (parentType, childType, edgePattern) => {
          let withChild = 0;
          const parents = nodes.filter((n) => n.type === parentType);
          for (const p of parents) {
            const pEdges = store.getEdgesForNode(p.id);
            if (pEdges.some((e) => e.source === p.id && e.type.includes(edgePattern))) withChild++;
          }
          return { with_child: withChild, total: parents.length };
        };
        const personaJtbd = chainStats("persona", "jtbd", "jtbd");
        const jtbdPain = chainStats("jtbd", "pain_point", "pain_point");
        const oppSolution = chainStats("opportunity", "solution", "solution");
        const hypExperiment = chainStats("hypothesis", "experiment", "experiment");
        const expLearning = chainStats("experiment", "learning", "learning");
        const typeSet = new Set(Object.keys(byType));
        const coverage = {};
        for (const [area, def] of Object.entries(BUSINESS_AREAS)) {
          const present = def.types.filter((t) => typeSet.has(t));
          const missing = def.types.filter((t) => !typeSet.has(t));
          coverage[area] = { covered: present.length, total: def.types.length, types_present: present, types_missing: missing };
        }
        const lifecycle = {};
        for (const [phase, types] of Object.entries(LIFECYCLE_PHASES)) {
          lifecycle[phase] = types.reduce((sum, t) => sum + (byType[t] ?? 0), 0);
        }
        const digest = {
          product: {
            title: product.title,
            stage: product.stage ?? nodes.find((n) => n.type === "product")?.properties?.stage ?? "unknown"
          },
          counts: { total_nodes: nodes.length, total_edges: edges.length, by_type: byType },
          health: {
            orphan_count: orphanCount,
            orphan_rate: nodes.length > 0 ? Math.round(orphanCount / nodes.length * 100) / 100 : 0,
            connectivity: nodes.length > 0 ? Math.round((nodes.length - orphanCount) / nodes.length * 100) / 100 : 0,
            validation_rate: hypothesisCount > 0 ? Math.round(experimentCount / hypothesisCount * 100) / 100 : 0,
            user_coverage: personaCount > 0 ? Math.round(personaJtbd.with_child / personaCount * 100) / 100 : 0
          },
          chains: {
            persona_with_jtbd: personaJtbd.with_child,
            persona_total: personaJtbd.total,
            jtbd_with_pain_point: jtbdPain.with_child,
            jtbd_total: jtbdPain.total,
            opportunity_with_solution: oppSolution.with_child,
            opportunity_total: oppSolution.total,
            hypothesis_untested: hypothesisCount - hypExperiment.with_child,
            hypothesis_total: hypothesisCount,
            experiment_with_learning: expLearning.with_child,
            experiment_total: experimentCount
          },
          coverage,
          lifecycle,
          _hash: currentHash
        };
        return text(JSON.stringify(digest, null, 2));
      }
      // ── list_nodes ───────────────────────────────────────────────────
      case "list_nodes": {
        const ifChangedList = args.if_changed_since;
        const currentHashList = store.getContentHash();
        if (ifChangedList && ifChangedList === currentHashList) {
          return text(JSON.stringify({ changed: false, _hash: currentHashList }, null, 2));
        }
        const filterType = args.type;
        const filterStatus = args.status;
        const filterTags = args.tags;
        const filterParentId = args.parent_id;
        const includeEdges = args.include_edges ?? false;
        const countOnly = args.count_only ?? false;
        const offset = args.offset ?? 0;
        const limit = Math.min(args.limit ?? 50, 200);
        let nodes = store.getAllNodes();
        if (filterType) nodes = nodes.filter((n) => n.type === filterType);
        if (filterStatus) nodes = nodes.filter((n) => n.status === filterStatus);
        if (filterTags && filterTags.length > 0) {
          nodes = nodes.filter((n) => normalizeTags(n.tags)?.some((t) => filterTags.includes(t)));
        }
        if (filterParentId) {
          const parentEdges = store.getEdgesForNode(filterParentId);
          const childIds = new Set(
            parentEdges.filter((e) => e.source === filterParentId).map((e) => e.target)
          );
          nodes = nodes.filter((n) => childIds.has(n.id));
        }
        const total = nodes.length;
        if (countOnly) {
          return text(JSON.stringify({ total, _hash: currentHashList }, null, 2));
        }
        const page = nodes.slice(offset, offset + limit).map((n) => {
          const entry = {
            id: n.id,
            type: n.type,
            title: n.title,
            status: n.status,
            tags: n.tags
          };
          if (includeEdges) {
            entry.edges = store.getEdgesForNode(n.id).map((e) => ({
              id: e.id,
              type: e.type,
              source: e.source,
              target: e.target
            }));
          }
          return entry;
        });
        return text(JSON.stringify({ nodes: page, total, offset, limit, _hash: currentHashList }, null, 2));
      }
      // ── get_node ─────────────────────────────────────────────────────
      case "get_node": {
        if (!args.node_id) return textError(`Missing required parameter: node_id`);
        const nid = args.node_id;
        const node = store.getNode(nid);
        if (!node) return textError(`Node not found: ${nid}`);
        const compact = args.compact_edges ?? false;
        const edges = store.getEdgesForNode(nid);
        const edgesOut = edges.filter((e) => e.source === nid).map(
          (e) => compact ? { id: e.id, type: e.type, source: e.source, target: e.target } : { ...e, target_title: store.getNode(e.target)?.title ?? "(unknown)" }
        );
        const edgesIn = edges.filter((e) => e.target === nid).map(
          (e) => compact ? { id: e.id, type: e.type, source: e.source, target: e.target } : { ...e, source_title: store.getNode(e.source)?.title ?? "(unknown)" }
        );
        return text(
          JSON.stringify({ node, edges_out: edgesOut, edges_in: edgesIn }, null, 2)
        );
      }
      // ── get_nodes (batch) ────────────────────────────────────────────
      case "get_nodes": {
        const ids = args.ids;
        if (!ids || !Array.isArray(ids) || ids.length === 0)
          return textError("Missing required parameter: ids (non-empty array)");
        if (ids.length > 50)
          return textError("Maximum 50 IDs per batch request");
        const compact = args.compact_edges ?? false;
        const results = [];
        const notFound = [];
        for (const id of ids) {
          const node = store.getNode(id);
          if (!node) {
            notFound.push(id);
            continue;
          }
          const edges = store.getEdgesForNode(id);
          const edgesOut = edges.filter((e) => e.source === id).map(
            (e) => compact ? { id: e.id, type: e.type, source: e.source, target: e.target } : { ...e, target_title: store.getNode(e.target)?.title ?? "(unknown)" }
          );
          const edgesIn = edges.filter((e) => e.target === id).map(
            (e) => compact ? { id: e.id, type: e.type, source: e.source, target: e.target } : { ...e, source_title: store.getNode(e.source)?.title ?? "(unknown)" }
          );
          results.push({ node, edges_out: edgesOut, edges_in: edgesIn });
        }
        const response = { nodes: results, total: results.length };
        if (notFound.length > 0) response.not_found = notFound;
        return text(JSON.stringify(response, null, 2));
      }
      // ── search_nodes ─────────────────────────────────────────────────
      case "search_nodes": {
        if (!args.query) return textError(`Missing required parameter: query`);
        const q = args.query.toLowerCase();
        const filterType = args.type;
        const searchFields = new Set(
          args.fields ?? ["title", "description"]
        );
        const limit = Math.min(args.limit ?? 20, 100);
        let nodes = store.getAllNodes();
        if (filterType) nodes = nodes.filter((n) => n.type === filterType);
        const scored = nodes.map((n) => {
          let bestScore = 0;
          let matchField = "";
          if (searchFields.has("title") && n.title.toLowerCase().includes(q)) {
            bestScore = 3;
            matchField = "title";
          }
          if (searchFields.has("tags") && normalizeTags(n.tags)?.some((t) => t.toLowerCase().includes(q))) {
            if (2 > bestScore) {
              bestScore = 2;
              matchField = "tags";
            }
          }
          if (searchFields.has("description") && n.description?.toLowerCase().includes(q)) {
            if (1 > bestScore) {
              bestScore = 1;
              matchField = "description";
            }
          }
          if (searchFields.has("properties") && n.properties) {
            const propsStr = JSON.stringify(n.properties).toLowerCase();
            if (propsStr.includes(q)) {
              if (1 > bestScore) {
                bestScore = 1;
                matchField = "properties";
              }
            }
          }
          if (bestScore === 0) return null;
          return { node: n, score: bestScore, match_field: matchField };
        }).filter(
          (s) => s !== null
        ).sort((a, b) => b.score - a.score).slice(0, limit);
        return text(
          JSON.stringify(
            {
              results: scored.map((s) => ({
                id: s.node.id,
                type: s.node.type,
                title: s.node.title,
                status: s.node.status,
                tags: s.node.tags,
                match_field: s.match_field,
                score: s.score
              })),
              total: scored.length,
              searched_fields: [...searchFields]
            },
            null,
            2
          )
        );
      }
      // ── query (traversal) ────────────────────────────────────────────
      case "query": {
        const fromType = args.from;
        const fromId = args.from_id;
        if (!fromType && !fromId)
          return textError('Provide either "from" (entity type) or "from_id" (node ID)');
        const traverseEdgeTypes = args.traverse;
        const maxDepth = Math.min(Math.max(args.depth ?? 3, 1), 10);
        const maxNodes = Math.min(Math.max(args.limit ?? 200, 1), 1e3);
        const includeFields = new Set(
          args.include ?? ["title", "status", "type"]
        );
        includeFields.add("id");
        includeFields.add("type");
        let startNodes;
        if (fromId) {
          const node = store.getNode(fromId);
          if (!node) return textError(`Node not found: ${fromId}`);
          startNodes = [node];
        } else {
          startNodes = store.getAllNodes().filter((n) => n.type === fromType);
        }
        if (startNodes.length === 0)
          return text(JSON.stringify({ nodes: [], edges: [], total_nodes: 0, total_edges: 0 }, null, 2));
        const visited = /* @__PURE__ */ new Set();
        const collectedNodes = [];
        const collectedEdges = /* @__PURE__ */ new Map();
        const queue = [];
        let truncated = false;
        let maxDepthReached = 0;
        for (const n of startNodes) {
          if (collectedNodes.length >= maxNodes) {
            truncated = true;
            break;
          }
          visited.add(n.id);
          collectedNodes.push(n);
          queue.push({ id: n.id, level: 0 });
        }
        while (queue.length > 0) {
          if (collectedNodes.length >= maxNodes) {
            truncated = true;
            break;
          }
          const { id, level } = queue.shift();
          if (level > maxDepthReached) maxDepthReached = level;
          if (level >= maxDepth) continue;
          const edges = store.getEdgesForNode(id);
          for (const edge of edges) {
            if (edge.source !== id) continue;
            if (traverseEdgeTypes && traverseEdgeTypes.length > 0) {
              const edgeTypeForLevel = level < traverseEdgeTypes.length ? traverseEdgeTypes[level] : traverseEdgeTypes[traverseEdgeTypes.length - 1];
              if (edgeTypeForLevel.startsWith("!")) {
                if (edge.type === edgeTypeForLevel.slice(1)) continue;
              } else {
                if (edge.type !== edgeTypeForLevel) continue;
              }
            }
            collectedEdges.set(edge.id, edge);
            const neighborId = edge.target;
            if (!visited.has(neighborId)) {
              visited.add(neighborId);
              const neighbor = store.getNode(neighborId);
              if (neighbor) {
                if (collectedNodes.length >= maxNodes) {
                  truncated = true;
                  break;
                }
                collectedNodes.push(neighbor);
                queue.push({ id: neighborId, level: level + 1 });
              }
            }
          }
        }
        const propInclude = args.property_include;
        const propFilter = propInclude && propInclude.length > 0 ? new Set(propInclude) : null;
        const projectedNodes = collectedNodes.map((n) => {
          const projected = { id: n.id, type: n.type };
          if (includeFields.has("title")) projected.title = n.title;
          if (includeFields.has("status")) projected.status = n.status;
          if (includeFields.has("tags")) projected.tags = n.tags;
          if (includeFields.has("description")) projected.description = n.description;
          if (includeFields.has("properties")) {
            if (propFilter && n.properties) {
              const filtered = {};
              for (const key of propFilter) {
                if (key in n.properties) filtered[key] = n.properties[key];
              }
              projected.properties = filtered;
            } else {
              projected.properties = n.properties;
            }
          }
          return projected;
        });
        const edgeInclude = args.edge_include;
        let edgeArray;
        if (edgeInclude !== void 0 && edgeInclude.length === 0) {
          edgeArray = [];
        } else {
          const edgeFields = edgeInclude ? new Set(edgeInclude) : null;
          edgeArray = [...collectedEdges.values()].map((e) => {
            if (!edgeFields) return { id: e.id, type: e.type, source: e.source, target: e.target };
            const projected = {};
            if (edgeFields.has("id")) projected.id = e.id;
            if (edgeFields.has("type")) projected.type = e.type;
            if (edgeFields.has("source")) projected.source = e.source;
            if (edgeFields.has("target")) projected.target = e.target;
            return projected;
          });
        }
        const response = {
          nodes: projectedNodes,
          edges: edgeArray,
          total_nodes: projectedNodes.length,
          total_edges: edgeArray.length
        };
        if (truncated) {
          response.truncated = true;
          response.truncated_at_depth = maxDepthReached;
          response.hint = `Limit of ${maxNodes} nodes reached at depth ${maxDepthReached}. Increase limit to see deeper results.`;
        }
        const diffFrom = args.diff_from;
        const resultId = `qr_${++queryCacheCounter}`;
        const cacheEntry = {
          params: JSON.stringify({ from: fromType, from_id: fromId, traverse: traverseEdgeTypes, depth: maxDepth }),
          nodes: projectedNodes.map((n) => ({ id: n.id, type: n.type })),
          edges: edgeArray.map((e) => ({ id: e.id ?? "" })),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (diffFrom && queryCache.has(diffFrom)) {
          const prev = queryCache.get(diffFrom);
          const prevNodeIds = new Set(prev.nodes.map((n) => n.id));
          const currNodeIds = new Set(cacheEntry.nodes.map((n) => n.id));
          const added = projectedNodes.filter((n) => !prevNodeIds.has(n.id));
          const removed = prev.nodes.filter((n) => !currNodeIds.has(n.id));
          response.diff = { added, removed, added_count: added.length, removed_count: removed.length };
        }
        queryCache.set(resultId, cacheEntry);
        response._result_id = resultId;
        if (queryCache.size > 20) {
          const oldest = queryCache.keys().next().value;
          if (oldest) queryCache.delete(oldest);
        }
        return text(JSON.stringify(response, null, 2));
      }
      // ── create_node ──────────────────────────────────────────────────
      case "create_node": {
        if (!args.type) return textError(`Missing required parameter: type`);
        if (!args.title) return textError(`Missing required parameter: title`);
        const newNode = {
          id: nodeId(),
          type: args.type,
          title: args.title
        };
        if (args.description) newNode.description = args.description;
        if (args.tags) newNode.tags = normalizeTags(args.tags) ?? [];
        if (args.status) newNode.status = args.status;
        if (args.properties)
          newNode.properties = args.properties;
        const nodeType = args.type;
        const nId = newNode.id;
        store.addNode(newNode);
        let edge = null;
        const parentId = args.parent_id;
        if (parentId) {
          const parent = store.getNode(parentId);
          if (!parent) {
            return text(
              JSON.stringify(
                {
                  node: newNode,
                  edge: null,
                  warning: `Parent node ${parentId} not found. Node created without edge.`
                },
                null,
                2
              )
            );
          }
          const edgeType = inferEdgeType(parent.type, nodeType);
          edge = {
            id: edgeId(),
            source: parentId,
            target: nId,
            type: edgeType
          };
          store.addEdge(edge);
        }
        return text(JSON.stringify({ node: newNode, edge }, null, 2));
      }
      // ── update_node ──────────────────────────────────────────────────
      case "update_node": {
        if (!args.node_id) return textError(`Missing required parameter: node_id`);
        const nid = args.node_id;
        const patch = {};
        if (args.type !== void 0) patch.type = args.type;
        if (args.title !== void 0) patch.title = args.title;
        if (args.description !== void 0) patch.description = args.description;
        if (args.tags !== void 0) patch.tags = normalizeTags(args.tags) ?? [];
        if (args.status !== void 0) patch.status = args.status;
        if (args.properties !== void 0) patch.properties = args.properties;
        try {
          const updated = store.updateNode(nid, patch);
          return text(JSON.stringify({ node: updated }, null, 2));
        } catch (err) {
          return textError(err.message);
        }
      }
      // ── delete_node ──────────────────────────────────────────────────
      case "delete_node": {
        if (!args.node_id) return textError(`Missing required parameter: node_id`);
        try {
          const { node, removedEdgeIds } = store.removeNode(
            args.node_id
          );
          return text(
            JSON.stringify(
              {
                deleted_node_id: node.id,
                deleted_node_title: node.title,
                deleted_edge_ids: removedEdgeIds
              },
              null,
              2
            )
          );
        } catch (err) {
          return textError(err.message);
        }
      }
      // ── create_edge ──────────────────────────────────────────────────
      case "create_edge": {
        const sourceId = args.source_id;
        if (!sourceId) return textError(`Missing required parameter: source_id`);
        let targetId = args.target_id;
        const targetTitle = args.target_title;
        const targetType = args.target_type;
        if (!targetId && !targetTitle) {
          return textError("Provide either target_id or target_title (with target_type)");
        }
        if (!targetId && targetTitle) {
          if (!targetType) {
            return textError("target_type is required when using target_title");
          }
          const candidates = store.getAllNodes().filter(
            (n) => n.type === targetType && n.title.toLowerCase() === targetTitle.toLowerCase()
          );
          if (candidates.length === 0) {
            return textError(
              `No ${targetType} found with title "${targetTitle}"`
            );
          }
          if (candidates.length > 1) {
            return textError(
              `Ambiguous: ${candidates.length} nodes match "${targetTitle}" (type: ${targetType}). Use target_id instead. IDs: ${candidates.map((c) => c.id).join(", ")}`
            );
          }
          targetId = candidates[0].id;
        }
        const source = store.getNode(sourceId);
        const target = store.getNode(targetId);
        if (!source) return textError(`Source not found: ${sourceId}`);
        if (!target) return textError(`Target not found: ${targetId}`);
        const explicitType = args.type;
        let edgeType;
        let edgeWarning;
        if (explicitType) {
          edgeType = explicitType;
        } else {
          const result = inferEdgeTypeWithTier(source.type, target.type);
          edgeType = result.edgeType;
          edgeWarning = result.warning;
        }
        const edge = {
          id: edgeId(),
          source: sourceId,
          target: targetId,
          type: edgeType
        };
        try {
          store.addEdge(edge);
          const response = { edge };
          if (edgeWarning) response.warning = edgeWarning;
          return text(JSON.stringify(response, null, 2));
        } catch (err) {
          return textError(err.message);
        }
      }
      // ── delete_edge ──────────────────────────────────────────────────
      case "delete_edge": {
        if (!args.edge_id) return textError(`Missing required parameter: edge_id`);
        try {
          const edge = store.removeEdge(args.edge_id);
          return text(JSON.stringify({ deleted_edge_id: edge.id }, null, 2));
        } catch (err) {
          return textError(err.message);
        }
      }
      // ── get_changes ──────────────────────────────────────────────────
      case "get_changes": {
        const since = args.since;
        const changes = store.getChanges(since);
        const summary = { create: 0, update: 0, delete: 0 };
        for (const c of changes) {
          summary[c.action]++;
        }
        return text(
          JSON.stringify(
            { changes, summary, total: changes.length },
            null,
            2
          )
        );
      }
      // ── get_graph_summary ────────────────────────────────────────────
      case "get_graph_summary": {
        const nodes = store.getAllNodes();
        const edges = store.getAllEdges();
        const product = store.getProduct();
        const nodesByType = {};
        for (const n of nodes)
          nodesByType[n.type] = (nodesByType[n.type] ?? 0) + 1;
        const edgesByType = {};
        for (const e of edges)
          edgesByType[e.type] = (edgesByType[e.type] ?? 0) + 1;
        const connectedNodes = /* @__PURE__ */ new Set();
        for (const e of edges) {
          connectedNodes.add(e.source);
          connectedNodes.add(e.target);
        }
        const orphanCount = nodes.filter(
          (n) => !connectedNodes.has(n.id)
        ).length;
        return text(
          JSON.stringify(
            {
              product: {
                id: product.id,
                title: product.title,
                stage: product.stage
              },
              node_count: nodes.length,
              edge_count: edges.length,
              nodes_by_type: nodesByType,
              edges_by_type: edgesByType,
              orphan_count: orphanCount
            },
            null,
            2
          )
        );
      }
      // ── list_product_areas ─────────────────────────────────────
      case "list_product_areas": {
        const allNodes = store.getAllNodes();
        const allEdges = store.getAllEdges();
        const areas = allNodes.filter((n) => n.type === "product_area");
        const result = areas.map((area) => {
          const childCount = allEdges.filter((e) => e.source === area.id).length;
          return { id: area.id, title: area.title, child_count: childCount };
        });
        return text(JSON.stringify({ areas: result, total: result.length }, null, 2));
      }
      // ── get_area_graph ──────────────────────────────────────────
      case "get_area_graph": {
        const areaId = args.area_id;
        const areaNode = store.getNode(areaId);
        if (!areaNode) return textError(`Area node not found: ${areaId}`);
        if (areaNode.type !== "product_area")
          return textError(`Node ${areaId} is type "${areaNode.type}", not "product_area"`);
        const maxDepth = Math.min(Math.max(args.depth ?? 3, 1), 10);
        const visited = /* @__PURE__ */ new Set([areaId]);
        const queue = [{ id: areaId, level: 0 }];
        const resultNodes = [];
        const resultEdges = [];
        while (queue.length > 0) {
          const { id, level } = queue.shift();
          const node = store.getNode(id);
          if (node) resultNodes.push(node);
          if (level < maxDepth) {
            const edges = store.getEdgesForNode(id);
            for (const edge of edges) {
              resultEdges.push(edge);
              const neighborId = edge.source === id ? edge.target : edge.source;
              if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push({ id: neighborId, level: level + 1 });
              }
            }
          }
        }
        const uniqueEdges = [...new Map(resultEdges.map((e) => [e.id, e])).values()];
        return text(
          JSON.stringify(
            {
              area: { id: areaNode.id, title: areaNode.title, type: areaNode.type },
              nodes: resultNodes,
              edges: uniqueEdges,
              node_count: resultNodes.length,
              edge_count: uniqueEdges.length
            },
            null,
            2
          )
        );
      }
      // ── list_local_products ────────────────────────────────────
      case "list_local_products": {
        const cwd = process.cwd();
        const products = [];
        const candidates = [];
        const topEntries = fs2.readdirSync(cwd, { withFileTypes: true });
        for (const entry of topEntries) {
          if (entry.isFile() && entry.name.endsWith(".upg")) {
            candidates.push(path2.join(cwd, entry.name));
          } else if (entry.isDirectory() && (entry.name === ".upg" || !entry.name.startsWith("."))) {
            try {
              const subEntries = fs2.readdirSync(
                path2.join(cwd, entry.name),
                { withFileTypes: true }
              );
              for (const sub of subEntries) {
                if (sub.isFile() && sub.name.endsWith(".upg")) {
                  candidates.push(path2.join(cwd, entry.name, sub.name));
                }
              }
            } catch {
            }
          }
        }
        for (const filePath of candidates) {
          try {
            const raw = fs2.readFileSync(filePath, "utf-8");
            const doc = JSON.parse(raw);
            products.push({
              file: path2.relative(cwd, filePath),
              title: doc.product?.title ?? "(untitled)",
              stage: doc.product?.stage ?? "unknown",
              nodes: Array.isArray(doc.nodes) ? doc.nodes.length : 0,
              edges: Array.isArray(doc.edges) ? doc.edges.length : 0
            });
          } catch {
          }
        }
        return text(JSON.stringify({ products }, null, 2));
      }
      // ── switch_product ──────────────────────────────────────────
      case "switch_product": {
        const fileArg = args.file;
        let resolved = path2.resolve(fileArg);
        if (!fs2.existsSync(resolved)) {
          const cwd = process.cwd();
          const workspaceCandidates = [
            path2.join(cwd, ".upg", fileArg),
            path2.join(cwd, ".upg", fileArg + ".upg")
          ];
          const found = workspaceCandidates.find((c) => fs2.existsSync(c));
          if (found) {
            resolved = found;
          } else {
            return textError(
              `File not found: ${resolved} (also checked .upg/${fileArg} and .upg/${fileArg}.upg)`
            );
          }
        }
        try {
          await store.flush();
          store.stopWatching();
          await store.load(resolved);
          const product = store.getProduct();
          const nodes = store.getAllNodes();
          return text(
            JSON.stringify(
              {
                message: `Switched to ${product.title}`,
                file: resolved,
                product: { title: product.title, stage: product.stage },
                entities: nodes.length
              },
              null,
              2
            )
          );
        } catch (err) {
          return textError(`Failed to switch: ${err.message}`);
        }
      }
      // ── get_workspace_info ──────────────────────────────────────
      case "get_workspace_info": {
        const cwd = process.cwd();
        const workspacePath = path2.join(cwd, ".upg", "workspace.json");
        const currentFile = store.getFilePath();
        try {
          const raw = await fsp.readFile(workspacePath, "utf-8");
          const workspace = JSON.parse(raw);
          const currentBasename = path2.basename(currentFile);
          const products = workspace.products.map((p) => ({
            file: p.file,
            title: p.title,
            active: p.file === currentBasename
          }));
          return text(
            JSON.stringify(
              {
                mode: "workspace",
                workspace_path: ".upg/",
                current_product: currentBasename,
                products
              },
              null,
              2
            )
          );
        } catch {
          const product = store.getProduct();
          return text(
            JSON.stringify(
              {
                mode: "single-file",
                current_file: path2.relative(cwd, currentFile) || path2.basename(currentFile),
                products: [
                  {
                    file: path2.relative(cwd, currentFile) || path2.basename(currentFile),
                    title: product.title,
                    active: true
                  }
                ]
              },
              null,
              2
            )
          );
        }
      }
      // ── init_workspace ──────────────────────────────────────────
      case "init_workspace": {
        const cwd = process.cwd();
        const upgDir = path2.join(cwd, ".upg");
        const moveExisting = args.move_existing ?? true;
        try {
          await fsp.access(path2.join(upgDir, "workspace.json"));
          return textError(
            "Workspace already exists. Use get_workspace_info to see current state."
          );
        } catch {
        }
        await fsp.mkdir(upgDir, { recursive: true });
        const entries = await fsp.readdir(cwd);
        const upgFiles = entries.filter((f) => f.endsWith(".upg")).sort();
        const products = [];
        if (moveExisting && upgFiles.length > 0) {
          for (const file of upgFiles) {
            const srcPath = path2.join(cwd, file);
            const destPath = path2.join(upgDir, file);
            let title = path2.basename(file, ".upg");
            try {
              const raw = await fsp.readFile(srcPath, "utf-8");
              const doc = JSON.parse(raw);
              if (doc.product?.title) title = doc.product.title;
            } catch {
            }
            await fsp.rename(srcPath, destPath);
            products.push({ file, title });
          }
        } else if (!moveExisting || upgFiles.length === 0) {
          const currentFile = store.getFilePath();
          const basename3 = path2.basename(currentFile);
          const product2 = store.getProduct();
          const destPath = path2.join(upgDir, basename3);
          try {
            await fsp.access(destPath);
          } catch {
            await fsp.copyFile(currentFile, destPath);
          }
          products.push({ file: basename3, title: product2.title });
        }
        const defaultProduct = products[0]?.file ?? "product.upg";
        const workspace = {
          version: "1.0",
          default_product: defaultProduct,
          products
        };
        await fsp.writeFile(
          path2.join(upgDir, "workspace.json"),
          JSON.stringify(workspace, null, 2) + "\n",
          "utf-8"
        );
        const newFilePath = path2.join(upgDir, defaultProduct);
        try {
          await store.flush();
          store.stopWatching();
          await store.load(newFilePath);
        } catch (err) {
          return textError(
            `Workspace created but failed to reload: ${err.message}`
          );
        }
        const product = store.getProduct();
        return text(
          JSON.stringify(
            {
              message: "Workspace initialized",
              workspace_path: ".upg/",
              default_product: defaultProduct,
              products,
              current_product: {
                title: product.title,
                entities: store.getAllNodes().length
              }
            },
            null,
            2
          )
        );
      }
      // ── migrate_type ──────────────────────────────────────────────
      case "migrate_type": {
        const fromType = args.from_type;
        const toType = args.to_type;
        if (!fromType) return textError("Missing required parameter: from_type");
        if (!toType) return textError("Missing required parameter: to_type");
        const dryRun = args.dry_run ?? false;
        let defaults;
        for (const migrations of Object.values(UPG_MIGRATIONS)) {
          const m = migrations.find((m2) => m2.from === fromType && m2.to === toType);
          if (m?.defaults && Object.keys(m.defaults).length > 0) {
            defaults = m.defaults;
            break;
          }
        }
        if (dryRun) {
          const nodes = store.getAllNodes();
          const edges = store.getAllEdges();
          const matchingNodes = nodes.filter((n) => n.type === fromType);
          const edgeTypesRenamed = {};
          for (const e of edges) {
            if (e.type.includes(fromType)) {
              const newEdgeType = e.type.split(fromType).join(toType);
              edgeTypesRenamed[e.type] = newEdgeType;
            }
          }
          return text(
            JSON.stringify(
              {
                migrated_nodes: matchingNodes.length,
                migrated_edges: Object.keys(edgeTypesRenamed).length > 0 ? edges.filter((e) => e.type.includes(fromType)).length : 0,
                edge_types_renamed: edgeTypesRenamed,
                defaults_applied: defaults ?? null,
                dry_run: true
              },
              null,
              2
            )
          );
        }
        const result = store.migrateType(fromType, toType, defaults);
        return text(
          JSON.stringify(
            {
              migrated_nodes: result.migratedNodes,
              migrated_edges: result.migratedEdges,
              edge_types_renamed: result.edgeTypesRenamed,
              defaults_applied: defaults ?? null,
              dry_run: false
            },
            null,
            2
          )
        );
      }
      // ── get_area_context ────────────────────────────────────────
      case "get_area_context": {
        let dir = process.cwd();
        const root = path2.parse(dir).root;
        while (dir !== root) {
          const areaFile = path2.join(dir, ".upg-area.json");
          try {
            const raw = await fsp.readFile(areaFile, "utf-8");
            const area = JSON.parse(raw);
            return text(
              JSON.stringify(
                {
                  has_area_context: true,
                  area_id: area.area_id,
                  area_name: area.area_name,
                  found_at: path2.relative(process.cwd(), areaFile) || areaFile
                },
                null,
                2
              )
            );
          } catch {
          }
          dir = path2.dirname(dir);
        }
        return text(JSON.stringify({ has_area_context: false }, null, 2));
      }
      // ── create_area ──────────────────────────────────────────────
      case "create_area": {
        if (!args.title) return textError("Missing required parameter: title");
        const areaNode = {
          id: nodeId(),
          type: "product_area",
          title: args.title
        };
        if (args.description) areaNode.description = args.description;
        const areaProps = {};
        if (args.owner) areaProps.owner = args.owner;
        if (args.strategic_priority) areaProps.strategic_priority = args.strategic_priority;
        if (args.parent_area_id) areaProps.parent_area_id = args.parent_area_id;
        if (Object.keys(areaProps).length > 0) areaNode.properties = areaProps;
        store.addNode(areaNode);
        let edge = null;
        const parentAreaId = args.parent_area_id;
        if (parentAreaId) {
          const parent = store.getNode(parentAreaId);
          if (parent && parent.type === "product_area") {
            edge = {
              id: edgeId(),
              source: parentAreaId,
              target: areaNode.id,
              type: "area_has_sub_area"
            };
            store.addEdge(edge);
          }
        }
        return text(JSON.stringify({ node: areaNode, edge }, null, 2));
      }
      // ── list_portfolios ────────────────────────────────────────────
      case "list_portfolios": {
        const allNodes = store.getAllNodes();
        const allEdges = store.getAllEdges();
        const portfolios = allNodes.filter((n) => n.type === "portfolio");
        const result = portfolios.map((pf) => {
          const childCount = allEdges.filter((e) => e.source === pf.id).length;
          return {
            id: pf.id,
            title: pf.title,
            hierarchy_model: pf.properties?.hierarchy_model,
            child_count: childCount
          };
        });
        return text(JSON.stringify({ portfolios: result, total: result.length }, null, 2));
      }
      // ── create_cross_product_edge ──────────────────────────────────
      case "create_cross_product_edge": {
        const sourceId = args.source_id;
        const targetId = args.target_id;
        const edgeTypeArg = args.type;
        if (!sourceId) return textError("Missing required parameter: source_id");
        if (!targetId) return textError("Missing required parameter: target_id");
        if (!edgeTypeArg) return textError("Missing required parameter: type");
        const validCrossTypes = ["shares_persona", "shares_competitor", "shares_metric", "depends_on_product", "cannibalises", "succeeds"];
        if (!validCrossTypes.includes(edgeTypeArg)) {
          return textError(`Invalid cross-product edge type: ${edgeTypeArg}. Valid types: ${validCrossTypes.join(", ")}`);
        }
        const edge = {
          id: edgeId(),
          source: sourceId,
          target: targetId,
          type: edgeTypeArg
        };
        try {
          store.addEdge(edge);
          const response = { edge };
          if (args.source_product_id) response.source_product_id = args.source_product_id;
          if (args.target_product_id) response.target_product_id = args.target_product_id;
          return text(JSON.stringify(response, null, 2));
        } catch (err) {
          return textError(err.message);
        }
      }
      default:
        return textError(`Unknown tool: ${name}`);
    }
  });
  return {
    async start() {
      const transport = new StdioServerTransport();
      await server.connect(transport);
    }
  };
}

// src/index.ts
import { nanoid as nanoid2 } from "nanoid";
async function discoverUPGFile(explicitFile) {
  if (explicitFile) return path3.resolve(explicitFile);
  const cwd = process.cwd();
  const workspacePath = path3.join(cwd, ".upg", "workspace.json");
  try {
    const raw = await fs3.readFile(workspacePath, "utf-8");
    const workspace = JSON.parse(raw);
    if (workspace.default_product) {
      const filePath = path3.join(cwd, ".upg", workspace.default_product);
      await fs3.access(filePath);
      const title = workspace.products?.find(
        (p) => p.file === workspace.default_product
      )?.title ?? workspace.default_product;
      process.stderr.write(
        `UPG workspace \u2014 loading "${title}"
`
      );
      return filePath;
    }
  } catch {
  }
  try {
    const entries = await fs3.readdir(cwd);
    const upgFiles = entries.filter((f) => f.endsWith(".upg")).sort();
    if (upgFiles.length === 1) {
      return path3.resolve(upgFiles[0]);
    }
    if (upgFiles.length > 1) {
      process.stderr.write(
        `Found ${upgFiles.length} .upg files \u2014 loading ${upgFiles[0]}. Use --file to pick a specific one.
`
      );
      return path3.resolve(upgFiles[0]);
    }
  } catch {
  }
  return null;
}
async function main() {
  const { values } = parseArgs({
    options: {
      file: { type: "string", short: "f" },
      title: { type: "string", short: "t" }
    }
  });
  let resolvedPath = await discoverUPGFile(values.file);
  if (!resolvedPath) {
    const defaultFile = path3.resolve("product.upg");
    const title = values.title ?? "My Product";
    const blank = {
      upg_version: UPG_VERSION,
      exported_at: (/* @__PURE__ */ new Date()).toISOString(),
      source: {
        tool: "upg-mcp-local",
        tool_version: "0.1.0"
      },
      product: {
        id: nanoid2(16),
        title
      },
      nodes: [],
      edges: []
    };
    await fs3.mkdir(path3.dirname(defaultFile), { recursive: true });
    await fs3.writeFile(
      defaultFile,
      JSON.stringify(blank, null, 2) + "\n",
      "utf-8"
    );
    process.stderr.write(`Created new UPG file: ${defaultFile}
`);
    resolvedPath = defaultFile;
  } else {
    try {
      await fs3.access(resolvedPath);
    } catch {
      const title = values.title ?? path3.basename(resolvedPath, ".upg");
      const blank = {
        upg_version: UPG_VERSION,
        exported_at: (/* @__PURE__ */ new Date()).toISOString(),
        source: {
          tool: "upg-mcp-local",
          tool_version: "0.1.0"
        },
        product: {
          id: nanoid2(16),
          title
        },
        nodes: [],
        edges: []
      };
      await fs3.mkdir(path3.dirname(resolvedPath), { recursive: true });
      await fs3.writeFile(
        resolvedPath,
        JSON.stringify(blank, null, 2) + "\n",
        "utf-8"
      );
      process.stderr.write(`Created new UPG file: ${resolvedPath}
`);
    }
  }
  const store = new UPGFileStore();
  await store.load(resolvedPath);
  const deprecated = getDeprecatedTypes();
  const nodes = store.getAllNodes();
  const deprecatedCounts = {};
  for (const node of nodes) {
    if (deprecated.has(node.type)) {
      deprecatedCounts[node.type] = (deprecatedCounts[node.type] ?? 0) + 1;
    }
  }
  if (Object.keys(deprecatedCounts).length > 0) {
    const lines = Object.entries(deprecatedCounts).map(([type, count]) => {
      for (const migrations of Object.values(UPG_MIGRATIONS)) {
        const m = migrations.find((m2) => m2.from === type);
        if (m) return `  \u26A0\uFE0F  ${count} "${type}" entities \u2192 should be "${m.to}"`;
      }
      return `  \u26A0\uFE0F  ${count} "${type}" entities (deprecated)`;
    });
    process.stderr.write(`
Deprecated types found in your graph:
${lines.join("\n")}
`);
    process.stderr.write(`Run /upg-migrate to update them.

`);
  }
  const server = createServer(store);
  await server.start();
  process.stderr.write(`UPG MCP server running \u2014 ${resolvedPath}
`);
  const shutdown = async () => {
    await store.flush();
    store.stopWatching();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
main().catch((err) => {
  process.stderr.write(`Fatal: ${err}
`);
  process.exit(1);
});
//# sourceMappingURL=index.js.map