/**
 * UPG Schema Migrations
 *
 * Version-scoped type migration maps. When a type is renamed, merged, or
 * deprecated in a new version, this map tells readers how to convert old
 * data to new types.
 *
 * All migrations in 0.1.0 are completed consolidations. The old type names
 * are retained in the domain registry for backwards compatibility with
 * existing .upg files and external tools, but new graphs should use the
 * canonical types listed in the `to` field.
 *
 * Used by:
 * - .upg file reader (lazy migration on load)
 * - TYPE_ALIASES auto-generation
 * - MCP server validation (accept old types gracefully)
 *
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
export interface TypeMigration {
    /** The old type name being retired */
    from: string;
    /** The new canonical type name */
    to: string;
    /** Default designation/property values to set on migrated nodes */
    defaults?: Record<string, unknown>;
    /** Human-readable explanation of why this migration exists */
    reason: string;
}
/**
 * Version-scoped migration definitions.
 * Key is the version that INTRODUCES the migration (target version).
 * Each entry describes how an old type maps to a new canonical type.
 */
export declare const UPG_MIGRATIONS: Record<string, TypeMigration[]>;
/**
 * Build a flat old→new type name map for a specific version upgrade.
 * Used by TYPE_ALIASES and .upg file readers.
 */
export declare function getMigrationMap(fromVersion: string, toVersion: string): Record<string, string>;
/**
 * Apply migrations to a single node, converting its type and
 * merging default properties.
 */
export declare function migrateNode<T extends {
    type: string;
    properties?: Record<string, unknown>;
}>(node: T, fromVersion: string, toVersion: string): T;
/**
 * Get all deprecated type names (across all versions) as a flat set.
 * Useful for validation warnings.
 */
export declare function getDeprecatedTypes(): Set<string>;
//# sourceMappingURL=migrations.d.ts.map