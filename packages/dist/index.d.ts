/**
 * @upg/core — Unified Product Graph Specification
 *
 * The open specification and TypeScript SDK for product knowledge graphs.
 *
 * https://unifiedproductgraph.org
 * License: MIT
 */
export * from './types.js';
export * from './schema.js';
export * from './domains.js';
export * from './properties/index.js';
export * from './frameworks.js';
export * from './entity-meta.js';
export * from './migrations.js';
export * from './type-labels.js';
export * from './lenses.js';
export * from './benchmarks.js';
export { validateUPGDocument, isUPGDocument } from './validate.js';
export type { UPGValidationResult, UPGValidationError, UPGValidationWarning } from './validate.js';
/** The current spec version implemented by this package */
export declare const UPG_VERSION: "0.1.0";
/**
 * Every entity type in the UPG specification.
 * Computed from the domain registry so it never drifts.
 *
 * Use this to check whether a type is a valid UPG type at runtime:
 * ```ts
 * const isValid = UPG_ALL_TYPES.includes(myType)
 * ```
 */
export declare const UPG_ALL_TYPES: readonly string[];
/** Set of all valid UPG entity types — O(1) lookup for validation and filtering */
export declare const UPG_ALL_TYPES_SET: ReadonlySet<string>;
/**
 * Human-readable labels for every UPG entity type.
 * Converts snake_case to Title Case (e.g. 'user_story' -> 'User Story').
 * Computed from the domain registry.
 */
export declare const UPG_ALL_TYPE_LABELS: Record<string, string>;
/**
 * UPG types that have full typed property interfaces (e.g. PersonaProperties).
 * These are the types with dedicated property schemas in `types.ts`.
 * For all types, use UPG_ALL_TYPES.
 */
export declare const UPG_TYPED_ENTITIES: readonly ["product", "outcome", "kpi", "objective", "key_result", "persona", "jtbd", "need", "opportunity", "solution", "hypothesis", "experiment", "learning", "competitor", "feature", "epic", "user_story", "release", "research_study", "insight", "metric"];
/** @deprecated Use UPG_TYPED_ENTITIES instead */
export declare const UPG_CORE_TYPES: readonly ["product", "outcome", "kpi", "objective", "key_result", "persona", "jtbd", "need", "opportunity", "solution", "hypothesis", "experiment", "learning", "competitor", "feature", "epic", "user_story", "release", "research_study", "insight", "metric"];
/** All UPG edge types from the core schema */
export declare const UPG_CORE_EDGE_TYPES: readonly ["product_has_outcome", "product_has_objective", "product_has_competitor", "product_has_feature", "product_has_release", "product_has_research_study", "product_has_persona", "outcome_has_kpi", "outcome_has_opportunity", "objective_has_key_result", "persona_has_jtbd", "jtbd_has_need", "opportunity_has_solution", "solution_has_hypothesis", "hypothesis_has_experiment", "experiment_produces_learning", "feature_has_epic", "epic_has_user_story", "cluster_has_insight", "study_has_insight", "insight_informs_opportunity", "opportunity_addresses_need", "opportunity_pursues_outcome", "opportunity_relates_to_job"];
/**
 * Human-readable labels for UPG entity types with property interfaces.
 * Useful for building UI elements like entity pickers.
 */
export declare const UPG_CORE_TYPE_LABELS: Record<typeof UPG_TYPED_ENTITIES[number], string>;
/**
 * Groups UPG types by the product creation lifecycle phase they belong to.
 */
export declare const UPG_CORE_TYPE_GROUPS: {
    strategy: readonly ["product", "outcome", "kpi", "objective", "key_result", "metric"];
    users: readonly ["persona", "jtbd", "need"];
    discovery: readonly ["opportunity"];
    validation: readonly ["solution", "hypothesis", "experiment", "learning"];
    execution: readonly ["feature", "epic", "user_story", "release"];
    market: readonly ["competitor"];
    research: readonly ["research_study", "insight"];
};
/** Total entity types — computed from the domain registry */
export declare const UPG_ENTITY_COUNT: number;
/** @deprecated Use UPG_ENTITY_COUNT instead */
export declare const UPG_TOTAL_ENTITY_COUNT: number;
/** Total number of domains — computed from the domain registry */
export declare const UPG_DOMAIN_COUNT: number;
/** Number of entity types with full property interfaces */
export declare const UPG_TYPED_CORE_COUNT: 21;
/** Number of active (non-deprecated) entity types — the count to show publicly */
export declare const UPG_ACTIVE_ENTITY_COUNT: number;
/** Number of deprecated entity types */
export declare const UPG_DEPRECATED_ENTITY_COUNT: number;
/** @deprecated Use UPG_ENTITY_COUNT instead */
export declare const UPG_CORE_ENTITY_COUNT: number;
/** @deprecated Use UPG_ENTITY_COUNT instead */
export declare const UPG_EXTENDED_ENTITY_COUNT: number;
/** @deprecated Use UPG_DOMAIN_COUNT instead */
export declare const UPG_CORE_DOMAIN_COUNT: number;
/** @deprecated Use UPG_DOMAIN_COUNT instead */
export declare const UPG_EXTENDED_DOMAIN_COUNT: number;
/**
 * Extended edge type lookup map.
 * Key format: 'sourceType:targetType' -> canonical edge type string.
 * Covers all domain-specific relationships beyond the core schema edges.
 */
export declare const UPG_EXTENDED_EDGE_MAP: Record<string, string>;
/** Set of all extended edge type values for O(1) membership checks */
export declare const UPG_EXTENDED_EDGE_TYPES_SET: ReadonlySet<string>;
//# sourceMappingURL=index.d.ts.map