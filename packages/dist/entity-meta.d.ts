/**
 * UPG Entity Type Metadata — Immutable IDs, Maturity & Versioning
 *
 * Every entity type in the UPG specification has:
 * - A human-readable `name` (can change across versions via migrations)
 * - An immutable `type_id` (never changes — used for wire format stability)
 * - A `maturity` level (draft → proposed → stable → deprecated → removed)
 * - Version tracking (`since`, `deprecated_in`, `replacement`)
 *
 * This file is the source of truth for ontology evolution. When types are
 * renamed, merged, or deprecated, the type_id remains stable so that old
 * .upg files and external tools continue to work.
 *
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
export type EntityTypeMaturity = 'draft' | 'proposed' | 'stable' | 'deprecated' | 'removed';
export interface EntityTypeMeta {
    /** Human-readable type name (e.g. 'need'). May change across versions. */
    name: string;
    /** Immutable identifier (e.g. 'ent_313'). Never changes, even if name changes. */
    type_id: string;
    /** Current maturity level */
    maturity: EntityTypeMaturity;
    /** UPG version when this type was introduced */
    since: string;
    /** UPG version when this type was deprecated (if applicable) */
    deprecated_in?: string;
    /** UPG version when this type was removed (if applicable) */
    removed_in?: string;
    /** Canonical replacement type (if deprecated) */
    replacement?: string;
}
export declare const UPG_ENTITY_META: readonly EntityTypeMeta[];
/** O(1) lookup: type name → metadata */
export declare const UPG_ENTITY_META_BY_NAME: ReadonlyMap<string, EntityTypeMeta>;
/** O(1) lookup: type_id → metadata */
export declare const UPG_ENTITY_META_BY_ID: ReadonlyMap<string, EntityTypeMeta>;
/** All active (non-deprecated, non-removed) type names */
export declare const UPG_ACTIVE_TYPES: readonly string[];
/** All deprecated type names */
export declare const UPG_DEPRECATED_TYPES: readonly string[];
/** Check if a type name is deprecated */
export declare function isDeprecatedType(name: string): boolean;
/** Get the replacement type for a deprecated type */
export declare function getReplacementType(name: string): string | undefined;
/** Resolve a type name to its type_id (stable across renames) */
export declare function getTypeId(name: string): string | undefined;
/** Resolve a type_id back to its current name */
export declare function getTypeName(typeId: string): string | undefined;
//# sourceMappingURL=entity-meta.d.ts.map