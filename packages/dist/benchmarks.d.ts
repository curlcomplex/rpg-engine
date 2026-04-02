/**
 * UPG Benchmarks — Product management wisdom as structured data.
 *
 * Encodes expected entity counts, relationships, ratios, and domain activation
 * thresholds per product stage. Used by /upg-intel, /upg-gaps, and the
 * proactive intelligence layer in /upg-context.
 *
 * Sources: Lean Startup (Ries), JTBD (Christensen), Continuous Discovery (Torres),
 * BMC (Osterwalder), Shape Up (Basecamp), Lean Analytics (Croll & Yoskovitz),
 * Inspired (Cagan), Crossing the Chasm (Moore), The Mom Test (Fitzpatrick)
 */
export type ProductStage = 'idea' | 'mvp' | 'growth' | 'scale';
/** Ordered stages from earliest to latest */
export declare const PRODUCT_STAGES: readonly ProductStage[];
export interface CountBenchmark {
    type: string;
    domain: string;
    /** Expected range per stage. null = not expected at this stage */
    idea: {
        min: number;
        max: number;
    } | null;
    mvp: {
        min: number;
        max: number;
    } | null;
    growth: {
        min: number;
        max: number;
    } | null;
    scale: {
        min: number;
        max: number;
    } | null;
    source: string;
    rationale: string;
}
export interface RelationshipBenchmark {
    parent_type: string;
    child_type: string;
    /** Minimum children per parent */
    min_per_parent: number;
    /** Stages where this relationship is expected */
    stages: ProductStage[];
    source: string;
    rationale: string;
}
export interface RatioBenchmark {
    name: string;
    numerator_type: string | string[];
    denominator_type: string | string[];
    expected_min: number;
    stages: ProductStage[];
    source: string;
    rationale: string;
}
export interface DomainActivation {
    domain_id: string;
    /** At which stage should this domain have at least 1 entity? */
    expected_from: ProductStage;
    /** At which stage should this domain be well-populated? */
    expected_mature: ProductStage;
    source: string;
    rationale: string;
}
export declare const COUNT_BENCHMARKS: CountBenchmark[];
export declare const RELATIONSHIP_BENCHMARKS: RelationshipBenchmark[];
export declare const RATIO_BENCHMARKS: RatioBenchmark[];
export declare const DOMAIN_ACTIVATION: DomainActivation[];
/** Get count benchmarks for a given stage */
export declare function getBenchmarksForStage(stage: ProductStage): CountBenchmark[];
/** Get relationship benchmarks applicable at a given stage */
export declare function getRelationshipBenchmarksForStage(stage: ProductStage): RelationshipBenchmark[];
/** Get ratio benchmarks applicable at a given stage */
export declare function getRatioBenchmarksForStage(stage: ProductStage): RatioBenchmark[];
/** Get domains expected to be activated at a given stage */
export declare function getExpectedDomainsForStage(stage: ProductStage): DomainActivation[];
/**
 * Score a graph against benchmarks — returns 0-100.
 *
 * Scores each entity type's count against the expected range for the given stage.
 * Within range = full credit. Over range = half credit (over is better than under).
 * Under range or missing = zero credit.
 */
export declare function computeBenchmarkScore(stage: ProductStage, entityCounts: Record<string, number>, _relationshipCounts: Record<string, number>): number;
//# sourceMappingURL=benchmarks.d.ts.map