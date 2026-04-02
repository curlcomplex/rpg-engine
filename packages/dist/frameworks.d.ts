/**
 * UPG v0.1 — Framework Type Definitions
 *
 * Frameworks are config-driven lenses that structure UPG graph data into
 * well-known product management patterns (RICE, Lean Canvas, Opportunity
 * Solution Tree, etc.). Each framework is declarative JSON — no code —
 * describing four layers: data, structure, presentation, and education.
 *
 * A Methodology bundles multiple frameworks into a sequenced workflow.
 *
 * Zero dependencies — works in any JavaScript environment.
 *
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
/** The broad domain a framework belongs to */
export type FrameworkCategory = 'prioritization' | 'strategy' | 'discovery' | 'business_model' | 'metrics' | 'engineering' | 'research' | 'validation' | 'planning' | 'growth' | 'competitive' | 'team_process';
/** All valid framework categories as a runtime array */
export declare const FRAMEWORK_CATEGORIES: readonly FrameworkCategory[];
/** The visual / topological shape a framework's structure takes */
export type StructurePattern = 'tree' | 'table' | 'matrix' | 'funnel' | 'collection' | 'quadrant' | 'flow';
/** All valid structure patterns as a runtime array */
export declare const STRUCTURE_PATTERNS: readonly StructurePattern[];
/** Where the framework came from — attribution and licensing */
export interface FrameworkOrigin {
    /** Whether the framework is from academia, a practitioner, the community, or original to UPG */
    type: 'academic' | 'practitioner' | 'community' | 'tpc_original';
    /** Human-readable attribution (e.g. "Sean Ellis", "Marty Cagan", "Teresa Torres") */
    attribution: string;
    /** URL to the original source or publication */
    url?: string;
    /** License under which the framework definition is shared */
    license?: string;
}
/** Declares which UPG entity type plays which role within a framework */
export interface FrameworkEntityTypeSpec {
    /** The UPG entity type (must be a valid UPGExtendedType or custom string) */
    type: string;
    /** The role this entity plays in the framework (e.g. "root", "item", "branch", "leaf", "bucket") */
    role: string;
    /** Minimum number of entities of this type required */
    min_count?: number;
    /** Maximum number of entities of this type allowed */
    max_count?: number;
    /** Whether to auto-create placeholder entities when the framework is applied */
    auto_scaffold?: boolean;
}
/** A property that the framework requires on an entity */
export interface FrameworkPropertyRequirement {
    /** The property key on the entity's properties object */
    property: string;
    /** The data type of the property value */
    type: 'number' | 'string' | 'enum' | 'boolean' | 'scale_1_5';
    /** Whether the property must be filled for the framework to function */
    required: boolean;
    /** Default value to use when the property is not set */
    default_value?: unknown;
    /** Valid values when type is 'enum' */
    enum_values?: string[];
    /** Human-readable label for the property (shown in UI) */
    label?: string;
    /** Explanation of what this property represents */
    description?: string;
}
/** A property whose value is computed from other properties via a math DSL */
export interface FrameworkComputedProperty {
    /** The property key that will hold the computed result */
    property: string;
    /** A simple math expression referencing other properties (e.g. "(reach * impact * confidence) / effort") */
    expression: string;
    /** The entity type this computed property applies to */
    entity_type: string;
    /** Human-readable label for the computed property */
    label?: string;
    /** How to format the computed value in the UI */
    format?: 'number' | 'percentage' | 'currency';
}
/** A fixed entity that the framework scaffolds automatically (e.g. quadrant labels, funnel stages) */
export interface FrameworkConstant {
    /** The UPG entity type for this constant */
    type: string;
    /** Display title for the constant */
    title: string;
    /** Predefined properties for the constant entity */
    properties: Record<string, unknown>;
}
/** Everything the framework needs from the graph's data layer */
export interface FrameworkDataSpec {
    /** The entity types that participate in this framework and their roles */
    entity_types: FrameworkEntityTypeSpec[];
    /** Properties required on each entity type, keyed by entity type string */
    required_properties: Record<string, FrameworkPropertyRequirement[]>;
    /** Properties that are derived from other properties via expressions */
    computed_properties?: FrameworkComputedProperty[];
    /** Fixed entities that the framework creates automatically */
    constants?: FrameworkConstant[];
}
/** One level in a tree-structured framework */
export interface FrameworkLevel {
    /** Zero-based depth in the tree (0 = root) */
    depth: number;
    /** Human-readable name for this level (e.g. "Outcome", "Opportunity") */
    label: string;
    /** Which UPG entity types can appear at this level */
    entity_types: string[];
    /** Explanation of what this level represents */
    description: string;
    /** The edge type connecting entities at this level to their parent */
    edge_from_parent: string;
}
/** A cell in a matrix-structured framework */
export interface MatrixSlot {
    /** Unique identifier for this slot */
    id: string;
    /** Display label for the slot */
    label: string;
    /** The UPG entity type placed in this slot */
    entity_type: string;
    /** Position within the matrix grid */
    position: {
        /** Zero-based row index */
        row: number;
        /** Zero-based column index */
        col: number;
        /** Number of rows this slot spans */
        rowSpan?: number;
        /** Number of columns this slot spans */
        colSpan?: number;
    };
}
/** A stage in a funnel-structured framework */
export interface FunnelStage {
    /** Unique identifier for this stage */
    id: string;
    /** Display label for the stage */
    label: string;
    /** Position in the funnel (0 = top / widest) */
    order: number;
    /** The UPG entity type associated with this stage */
    entity_type?: string;
    /** The metric tracked at this stage (e.g. "visitors", "signups") */
    metric_name?: string;
}
/** A logical grouping of entities within a collection-structured framework */
export interface NamedGroup {
    /** Unique identifier for this group */
    id: string;
    /** Display label for the group */
    label: string;
    /** Explanation of what this group contains */
    description: string;
    /** Which UPG entity types belong to this group */
    entity_types: string[];
}
/** How entities are topologically organised within the framework */
export interface FrameworkStructureSpec {
    /** The visual / topological pattern (tree, table, matrix, etc.) */
    pattern: StructurePattern;
    /** Tree levels — only used when pattern is 'tree' */
    levels?: FrameworkLevel[];
    /** Edge types used to connect entities in this framework */
    edge_types?: string[];
    /** Matrix slots — only used when pattern is 'matrix' */
    slots?: MatrixSlot[];
    /** Funnel stages — only used when pattern is 'funnel' */
    stages?: FunnelStage[];
    /** Named groups — only used when pattern is 'collection' */
    groups?: NamedGroup[];
}
/** A column definition for table-layout frameworks */
export interface TableColumn {
    /** The property key to display in this column */
    property: string;
    /** Column header label */
    label: string;
    /** Column width in pixels (optional) */
    width?: number;
    /** Whether the column can be sorted */
    sortable?: boolean;
    /** How to render the cell value */
    format?: 'number' | 'bar' | 'badge' | 'score_pill';
}
/**
 * Discriminated union of all supported layout types.
 * Each layout carries its own configuration fields.
 */
export type FrameworkLayout = {
    type: 'tree'; /** Layout direction */
    direction: 'TB' | 'LR'; /** Layout engine */
    engine?: 'dagre' | 'elk';
} | {
    type: 'table'; /** Column definitions */
    columns: TableColumn[];
} | {
    type: 'matrix'; /** Number of rows */
    rows: number; /** Number of columns */
    cols: number; /** Optional named template */
    template?: string;
} | {
    type: 'funnel'; /** Funnel orientation */
    orientation: 'vertical' | 'horizontal';
} | {
    type: 'kanban'; /** Column identifiers */
    columns: string[];
} | {
    type: 'quadrant'; /** X-axis property */
    x_axis: string; /** Y-axis property */
    y_axis: string; /** X-axis label */
    x_label?: string; /** Y-axis label */
    y_label?: string;
} | {
    type: 'grid'; /** Property to group entities by */
    groupBy: string;
} | {
    type: 'flow'; /** Flow direction */
    direction: 'LR' | 'TB';
};
/** How the framework should be rendered in a UI */
export interface FrameworkPresentationSpec {
    /** The layout strategy for rendering */
    layout: FrameworkLayout;
    /** Default sort order for entities */
    sort_by?: {
        property: string; /** Sort direction */
        direction: 'asc' | 'desc';
    };
    /** Which dimension to use for colour coding */
    colour_by?: 'type' | 'status' | 'score' | 'group' | 'custom';
    /** Which properties to show on entity cards */
    card_fields?: string[];
    /** Whether tree branches can be collapsed */
    collapsible?: boolean;
    /** Custom colour map — keys are values of the colour_by dimension, values are CSS colours */
    colour_map?: Record<string, string>;
}
/** One step in a guided walkthrough of how to use a framework */
export interface FrameworkStep {
    /** Step order (1-based) */
    order: number;
    /** Human-readable instruction for this step */
    instruction: string;
    /** The property this step asks the user to fill */
    property?: string;
    /** The entity type this step focuses on */
    entity_type?: string;
}
/** Educational context that helps users understand and apply the framework */
export interface FrameworkEducation {
    /** A one-sentence explanation of what the framework does */
    purpose: string;
    /** The core question the framework helps answer */
    core_question: string;
    /** Situations where this framework is a good fit */
    when_to_use: string[];
    /** Situations where this framework is a poor fit */
    when_not_to_use: string[];
    /** URL to further reading about the framework */
    learn_more_url?: string;
    /** Step-by-step guided walkthrough */
    steps?: FrameworkStep[];
}
/**
 * A UPG Framework is a declarative, config-driven lens that structures
 * UPG graph data into a well-known product management pattern.
 *
 * Frameworks are pure data — no code. The rendering engine reads the
 * framework definition and produces the appropriate UI.
 */
export interface UPGFramework {
    /** Unique identifier (kebab-case, e.g. "rice-scoring", "lean-canvas") */
    id: string;
    /** Human-readable name (e.g. "RICE Scoring", "Lean Canvas") */
    name: string;
    /** Semver version of this framework definition */
    version: string;
    /** One-sentence description of the framework */
    description: string;
    /** The broad domain this framework belongs to */
    category: FrameworkCategory;
    /** Attribution and licensing */
    origin: FrameworkOrigin;
    /** Freeform tags for filtering and discovery */
    tags: string[];
    /** What data the framework needs from the graph */
    data: FrameworkDataSpec;
    /** How entities are topologically organised */
    structure: FrameworkStructureSpec;
    /** How the framework should be rendered */
    presentation: FrameworkPresentationSpec;
    /** Educational context and guided walkthrough */
    education: FrameworkEducation;
    /** IDs of other frameworks this one can be composed with */
    composable_with?: string[];
    /** ID of a parent framework this one extends */
    extends?: string;
}
/** One step in a methodology — references a framework and its position in the sequence */
export interface MethodologyStep {
    /** The framework to apply at this step */
    framework_id: string;
    /** Position in the methodology sequence (1-based) */
    order: number;
    /** The phase label this step belongs to (e.g. "Discovery", "Validation") */
    phase: string;
    /** Optional condition that must be met before advancing to the next step */
    transition_condition?: string;
}
/**
 * A UPG Methodology bundles multiple frameworks into a sequenced,
 * phased workflow — e.g. "Lean Product Discovery" might sequence
 * Opportunity Solution Tree → RICE Scoring → Lean Canvas.
 */
export interface UPGMethodology {
    /** Unique identifier (kebab-case) */
    id: string;
    /** Human-readable name */
    name: string;
    /** Semver version of this methodology definition */
    version: string;
    /** One-sentence description */
    description: string;
    /** Attribution and licensing */
    origin: FrameworkOrigin;
    /** Ordered list of framework steps */
    frameworks: MethodologyStep[];
}
/** Result of validating a UPGFramework object */
export interface FrameworkValidationResult {
    /** Whether the framework passed all required checks */
    valid: boolean;
    /** Spec violations that must be fixed */
    errors: string[];
    /** Best-practice notices that should be reviewed */
    warnings: string[];
}
/**
 * Validates a UPGFramework object against the spec.
 *
 * Checks:
 * - Required top-level fields (id, name, version, category, data, structure, presentation, education)
 * - data.entity_types is a non-empty array
 * - structure.pattern is a valid StructurePattern
 * - computed_properties expressions are syntactically valid (balanced parens, valid tokens)
 * - education has required fields (purpose, core_question, when_to_use, when_not_to_use)
 * - category is a valid FrameworkCategory
 *
 * Returns a result with `valid`, `errors`, and `warnings`.
 */
export declare function validateUPGFramework(framework: unknown): FrameworkValidationResult;
//# sourceMappingURL=frameworks.d.ts.map