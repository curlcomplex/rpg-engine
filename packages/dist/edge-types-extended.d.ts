/**
 * Extended edge types — TPC Graph's full relationship vocabulary.
 *
 * These extend the 25 core UPG edge types with ~500 additional domain-specific
 * relationships used by The Product Creator's cloud graph. They are NOT part of
 * the open UPG standard — they represent TPC's product-specific ontology.
 *
 * Used by upg-mcp-server for tiered edge validation:
 *   1. Core (UPG_CORE_EDGE_TYPES) — always valid, part of the open standard
 *   2. Extended (this file) — known to TPC, will sync correctly to cloud
 *   3. Unknown — auto-generated _has_ fallback, may not sync to cloud
 *
 * Source of truth: packages/graph-service/src/validation.ts (EDGE_TYPE_MAP)
 * Auto-extracted — do not edit by hand.
 */
/**
 * Extended edge type lookup map.
 * Key format: 'sourceType:targetType' → canonical edge type string.
 */
export declare const UPG_EXTENDED_EDGE_MAP: Record<string, string>;
/**
 * Set of all extended edge type values for O(1) membership checks.
 */
export declare const UPG_EXTENDED_EDGE_TYPES_SET: ReadonlySet<string>;
//# sourceMappingURL=edge-types-extended.d.ts.map