/**
 * UPG Core v0.1 — Document Format & Edge Types
 *
 * A UPGDocument is the portable interchange format for a product's knowledge graph.
 * Any tool that can produce or consume this format is "UPG-compatible."
 *
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
import type { UPGBaseNode, MappingConfidence } from './types.js';
export type UPGCoreEdgeType = 'product_has_outcome' | 'product_has_objective' | 'product_has_competitor' | 'product_has_feature' | 'product_has_release' | 'product_has_research_study' | 'outcome_has_kpi' | 'outcome_has_opportunity' | 'objective_has_key_result' | 'product_has_persona' | 'persona_has_jtbd' | 'jtbd_has_need' | 'opportunity_has_solution' | 'solution_has_hypothesis' | 'hypothesis_has_experiment' | 'experiment_produces_learning' | 'feature_has_epic' | 'epic_has_user_story' | 'cluster_has_insight' | 'study_has_insight' | 'insight_informs_opportunity' | 'signal_relates_to_persona' | 'signal_relates_to_need' | 'signal_relates_to_opportunity';
export interface UPGEdge {
    /** Unique identifier within the graph */
    id: string;
    /** Source node ID */
    source: string;
    /** Target node ID */
    target: string;
    /** The semantic relationship type */
    type: UPGCoreEdgeType | string;
    /** Confidence level if this edge was inferred during import */
    mapping_confidence?: MappingConfidence;
}
export interface UPGSource {
    /** The tool that exported this document */
    tool: string;
    /** Optional tool version */
    tool_version?: string;
    /** Optional workspace or project identifier in the source tool */
    workspace_id?: string;
}
export interface UPGProduct {
    id: string;
    title: string;
    description?: string;
    stage?: 'idea' | 'mvp' | 'growth' | 'scale';
}
/**
 * A UPGDocument is a portable, versioned snapshot of a product's knowledge graph.
 *
 * Design principles:
 * - Every node carries its source identity (source_id + source_type + source.tool)
 *   so the original record is always traceable. Round-trips are possible.
 * - Mapping confidence is first-class. Every mapped entity carries
 *   `mapping_confidence`. Uncertainty is always explicit, never silent.
 * - Unknown entity types are preserved, not dropped. Unrecognised types map to
 *   the nearest UPG type with `mapping_confidence: 'low'`, preserving
 *   `source_type` for auditability.
 * - Extra properties are preserved in `properties` as-is. Nothing is lost.
 * - The document is versioned. `upg_version` enables forward compatibility.
 */
export interface UPGDocument {
    /** Spec version — semver string, e.g. "0.1" */
    upg_version: string;
    /** ISO 8601 timestamp of export */
    exported_at: string;
    /** The tool that produced this document */
    source: UPGSource;
    /** The root product */
    product: UPGProduct;
    /** All nodes in the graph */
    nodes: UPGBaseNode[];
    /** All edges connecting nodes */
    edges: UPGEdge[];
}
//# sourceMappingURL=schema.d.ts.map