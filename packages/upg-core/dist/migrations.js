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
/**
 * Version-scoped migration definitions.
 * Key is the version that INTRODUCES the migration (target version).
 * Each entry describes how an old type maps to a new canonical type.
 */
export const UPG_MIGRATIONS = {
    '0.1.0': [
        // ── User layer: pain_point + user_need → need ──────────────────────────
        {
            from: 'pain_point',
            to: 'need',
            defaults: { valence: 'pain' },
            reason: 'Consolidated into neutral "need" type with valence property. Framework labels provide context-specific display names (Problem in Lean Canvas, Struggle in JTBD, etc.)',
        },
        {
            from: 'user_need',
            to: 'need',
            defaults: { valence: 'gap' },
            reason: 'Consolidated into "need" type. user_need was semantically identical to pain_point with different framing.',
        },
        // ── UX Research: insight consolidation ──────────────────────────────────
        {
            from: 'research_insight',
            to: 'insight',
            defaults: {},
            reason: 'Already deprecated. Research insights are insights with research provenance.',
        },
        {
            from: 'finding',
            to: 'insight',
            defaults: { insight_level: 'finding' },
            reason: 'Already deprecated. Findings are insights at the "finding" level.',
        },
        {
            from: 'ux_insight',
            to: 'insight',
            defaults: { source_domain: 'ux' },
            reason: 'UX insights are insights with source_domain=ux. Not a distinct type.',
        },
        {
            from: 'highlight',
            to: 'observation',
            defaults: { is_highlighted: true },
            reason: 'Already deprecated. Highlights are flagged observations.',
        },
        // ── Metrics consolidation ──────────────────────────────────────────────
        {
            from: 'kpi',
            to: 'metric',
            defaults: { designation: 'kpi' },
            reason: 'KPI is a metric role (designation), not a distinct type. Metric.designation already supports "kpi".',
        },
        {
            from: 'north_star_metric',
            to: 'metric',
            defaults: { designation: 'north_star' },
            reason: 'Already deprecated. North star is a metric designation.',
        },
        {
            from: 'input_metric',
            to: 'metric',
            defaults: { designation: 'input' },
            reason: 'Already deprecated. Input metric is a metric designation.',
        },
        {
            from: 'metric_definition',
            to: 'metric',
            defaults: { has_implementation: false },
            reason: 'A metric definition is a metric without implementation. Lifecycle property, not a separate type.',
        },
        // ── Experiment consolidation ────────────────────────────────────────────
        {
            from: 'ab_test',
            to: 'experiment',
            defaults: { experiment_type: 'ab_test' },
            reason: 'A/B test is an experiment method. Experiment.experiment_type distinguishes methods.',
        },
        {
            from: 'growth_experiment',
            to: 'experiment',
            defaults: { experiment_type: 'growth' },
            reason: 'Growth experiment is an experiment in growth context. experiment_type distinguishes context.',
        },
        {
            from: 'pricing_experiment',
            to: 'experiment',
            defaults: { experiment_type: 'pricing' },
            reason: 'Pricing experiment is an experiment about pricing. experiment_type distinguishes context.',
        },
        // ── Cross-domain consolidations ────────────────────────────────────────
        {
            from: 'risk_item',
            to: 'risk',
            defaults: { risk_domain: 'program' },
            reason: 'risk_item (Program Mgmt) is identical to risk (Legal). Consolidated with risk_domain property.',
        },
        {
            from: 'security_incident',
            to: 'incident',
            defaults: { incident_type: 'security' },
            reason: 'Security incident is an incident with incident_type=security. Same structure, different context.',
        },
        {
            from: 'defect_report',
            to: 'support_ticket',
            defaults: { ticket_designation: 'defect' },
            reason: 'Defect report is a support ticket with ticket_designation=defect. Same signal interface.',
        },
        {
            from: 'product_decision',
            to: 'decision',
            defaults: { decision_domain: 'product' },
            reason: 'product_decision is a decision about products. decision_domain distinguishes context.',
        },
        {
            from: 'onboarding_flow',
            to: 'user_flow',
            defaults: { flow_type: 'onboarding' },
            reason: 'Onboarding flow is a user flow with flow_type=onboarding. Same structure.',
        },
        {
            from: 'nps_score',
            to: 'nps_campaign',
            defaults: {},
            reason: 'NPS score demoted to a property of nps_campaign, not a standalone entity.',
        },
    ],
};
// ─── Migration helpers ─────────────────────────────────────────────────────────
/**
 * Build a flat old→new type name map for a specific version upgrade.
 * Used by TYPE_ALIASES and .upg file readers.
 */
export function getMigrationMap(fromVersion, toVersion) {
    const map = {};
    // Collect all migrations between fromVersion and toVersion
    for (const [version, migrations] of Object.entries(UPG_MIGRATIONS)) {
        if (version > fromVersion && version <= toVersion) {
            for (const m of migrations) {
                map[m.from] = m.to;
            }
        }
    }
    return map;
}
/**
 * Apply migrations to a single node, converting its type and
 * merging default properties.
 */
export function migrateNode(node, fromVersion, toVersion) {
    const migrations = getAllMigrations(fromVersion, toVersion);
    const migration = migrations.find((m) => m.from === node.type);
    if (!migration)
        return node;
    return {
        ...node,
        type: migration.to,
        properties: {
            ...migration.defaults,
            ...node.properties,
        },
    };
}
/**
 * Get all migration entries between two versions.
 */
function getAllMigrations(fromVersion, toVersion) {
    const result = [];
    for (const [version, migrations] of Object.entries(UPG_MIGRATIONS)) {
        if (version > fromVersion && version <= toVersion) {
            result.push(...migrations);
        }
    }
    return result;
}
/**
 * Get all deprecated type names (across all versions) as a flat set.
 * Useful for validation warnings.
 */
export function getDeprecatedTypes() {
    const deprecated = new Set();
    for (const migrations of Object.values(UPG_MIGRATIONS)) {
        for (const m of migrations) {
            deprecated.add(m.from);
        }
    }
    return deprecated;
}
//# sourceMappingURL=migrations.js.map