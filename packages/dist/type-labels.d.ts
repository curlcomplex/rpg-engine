/**
 * UPG Rosetta Stone — Framework Vocabulary Map
 *
 * Every UPG entity type mapped to its canonical label, alternative names,
 * and framework-specific labels. This is the single source of truth for
 * "what does framework X call this concept?"
 *
 * Registry-driven: imports UPG_ACTIVE_TYPES from entity-meta.ts to ensure
 * coverage matches exactly the active set (skips deprecated types).
 * Imports UPG_MIGRATIONS from migrations.ts to auto-include old type names
 * as alt_labels for consolidated types.
 *
 * Used by:
 * - View renderers (show framework-native labels)
 * - Entity creation UI (search by any synonym)
 * - TYPE_ALIASES (auto-generated from alt_labels)
 * - Copilot context (framework-aware prompts)
 * - Import/export (map external tool types to UPG)
 *
 * Framework IDs match the JSON filenames in packages/upg-spec/frameworks/:
 *   ost, design_thinking, bmc, lean_canvas, aarrr, okr_tree, rice, moscow, kano, dora
 *
 * Additional framework IDs used for labels not yet backed by JSON definitions:
 *   jtbd, vpc, lean_startup, running_lean
 *
 * NOTE: Uses consolidated type names from the schema maturity plan.
 */
export interface UPGTypeLabel {
    /** Matches the NodeType string (canonical, post-consolidation) */
    id: string;
    /** Default display name */
    canonical_label: string;
    /** All known synonyms across frameworks + common usage (lowercase for matching) */
    alt_labels: string[];
    /** Framework-specific labels: { framework_id: "what that framework calls it" } */
    framework_labels: Record<string, string>;
    /** Only for types that use the designation pattern */
    designations?: Record<string, string>;
}
/**
 * The complete Rosetta Stone — one UPGTypeLabel for every active type.
 *
 * Assembly logic:
 * 1. If a type has a PRIORITY_LABELS entry → use it (richest framework_labels)
 * 2. Else if a type has a STANDARD_LABELS entry → build from that
 * 3. Else → auto-generate from the type name (canonical_label only)
 *
 * In all cases, migration aliases are merged into alt_labels automatically.
 */
export declare const UPG_TYPE_LABELS: UPGTypeLabel[];
/** O(1) lookup by entity type id */
export declare const UPG_TYPE_LABELS_MAP: ReadonlyMap<string, UPGTypeLabel>;
/**
 * Resolve the display label for an entity type, with optional framework context.
 *
 * Priority:
 * 1. If frameworkId provided and a framework_labels entry exists → use it
 * 2. If designation provided and a designations entry exists → use it
 * 3. Fall back to canonical_label
 * 4. Fall back to Title Case of the id
 */
export declare function resolveLabel(entityType: string, frameworkId?: string, designation?: string): string;
/**
 * Build the TYPE_ALIASES map from alt_labels.
 *
 * Replaces the hand-maintained TYPE_ALIASES in validation.ts.
 * Maps every alt_label (and its snake_case variant) → canonical entity type id.
 *
 * Collision rule: first entry wins (entries earlier in UPG_TYPE_LABELS take priority).
 */
export declare function buildTypeAliases(): Record<string, string>;
/** Pre-built alias map — import this instead of calling buildTypeAliases() repeatedly */
export declare const TYPE_ALIASES: Record<string, string>;
//# sourceMappingURL=type-labels.d.ts.map