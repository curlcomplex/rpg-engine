/**
 * UPG Lenses — contextual projections of the product graph.
 *
 * A lens adapts the graph to a specific role, framework, or mode of thinking.
 * It combines vocabulary, visibility, workflow, and intelligence into one
 * coherent context.
 *
 * Four layers:
 * - Vocabulary  → which labels to use (maps to type-labels.ts framework_labels)
 * - Visibility  → which domains/types to show (maps to domains.ts)
 * - Workflow    → what sequence of steps this lens prescribes
 * - Intelligence → which benchmarks and nudges are relevant
 *
 * The .upg file format is lens-unaware. Lenses are a presentation concern,
 * applied on read, never on write. Canonical types are always used in storage.
 *
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
export interface UPGLensWorkflowStep {
    /** Human-readable step name */
    name: string;
    /** What this step accomplishes */
    description: string;
    /** Entity types relevant to this workflow step */
    entity_types: string[];
    /** Skill to suggest for this step (e.g. '/upg-add persona') */
    suggested_skill?: string;
}
export interface UPGLensIntelligencePrompt {
    /** When to surface this prompt (human-readable condition) */
    condition: string;
    /** The message to show, in the lens's voice */
    message: string;
}
export interface UPGLens {
    /** Unique identifier (e.g. 'product', 'design', 'engineering') */
    id: string;
    /** Human-readable name */
    name: string;
    /** One-sentence description of what this lens shows */
    description: string;
    /** Lucide icon name for UI rendering */
    icon: string;
    /** Framework ID for label resolution (maps to type-labels.ts framework_labels) */
    framework_id?: string;
    /** Custom label overrides (entity type → display label) for cases where no framework covers the translation */
    label_overrides?: Record<string, string>;
    /** Domain IDs to show (from domains.ts). Empty array = show all. */
    visible_domains: string[];
    /** Specific entity types to always show even if their domain is hidden */
    always_show_types?: string[];
    /** Specific entity types to always hide even if their domain is visible */
    always_hide_types?: string[];
    /** Ordered sequence of steps representing the discipline's workflow */
    workflow_steps: UPGLensWorkflowStep[];
    /** Which benchmark domain IDs to check */
    benchmark_domains: string[];
    /** Custom intelligence prompts scoped to this lens's perspective */
    intelligence_prompts: UPGLensIntelligencePrompt[];
    /** Who this lens is designed for */
    audience: string;
    /** Plain language description of the perspective this lens provides */
    perspective: string;
}
export declare const UPG_LENSES: readonly UPGLens[];
/** Get a lens by its id. Returns undefined if not found. */
export declare function getLens(id: string): UPGLens | undefined;
/** Get all lenses that include a given domain in their visible_domains. */
export declare function getLensesForDomain(domainId: string): UPGLens[];
/**
 * Get all entity types visible through a given lens.
 *
 * Resolves the lens's visible_domains to concrete entity types from the
 * domain registry, then applies always_show_types and always_hide_types.
 *
 * If visible_domains is empty (show all), returns all types from all domains
 * minus always_hide_types.
 */
export declare function getVisibleTypes(lens: UPGLens): string[];
/** Get the default lens (Full) */
export declare function getDefaultLens(): UPGLens;
/** Get all lens IDs */
export declare function getLensIds(): string[];
//# sourceMappingURL=lenses.d.ts.map