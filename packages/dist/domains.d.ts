/**
 * UPG v0.1 — Domain Definitions & Entity Type Registry
 *
 * The Unified Product Graph organises entity types into semantic domains.
 * Each domain groups related entity types by their functional area.
 *
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
export type UPGTier = 'core' | 'extended';
export interface UPGDomain {
    /** Machine-readable domain identifier */
    id: string;
    /** Human-readable domain name */
    label: string;
    /** Short description of what this domain covers */
    description: string;
    /** Which tier this domain belongs to */
    tier: UPGTier;
    /** Entity types in this domain */
    types: readonly string[];
}
export declare const UPG_DOMAINS: readonly UPGDomain[];
/** Get all domains for a specific tier (inclusive — 'extended' includes 'core') */
export declare function getDomainsForTier(tier: UPGTier): UPGDomain[];
/** Get all entity types for a specific tier (inclusive) */
export declare function getTypesForTier(tier: UPGTier): string[];
/** Look up which domain an entity type belongs to */
export declare function getDomainForType(entityType: string): UPGDomain | undefined;
/** Look up which tier an entity type belongs to */
export declare function getTierForType(entityType: string): UPGTier | undefined;
//# sourceMappingURL=domains.d.ts.map