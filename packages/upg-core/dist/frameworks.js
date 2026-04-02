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
/** All valid framework categories as a runtime array */
export const FRAMEWORK_CATEGORIES = [
    'prioritization',
    'strategy',
    'discovery',
    'business_model',
    'metrics',
    'engineering',
    'research',
    'validation',
    'planning',
    'growth',
    'competitive',
    'team_process',
];
/** All valid structure patterns as a runtime array */
export const STRUCTURE_PATTERNS = [
    'tree',
    'table',
    'matrix',
    'funnel',
    'collection',
    'quadrant',
    'flow',
];
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
export function validateUPGFramework(framework) {
    const errors = [];
    const warnings = [];
    if (!framework || typeof framework !== 'object') {
        return { valid: false, errors: ['Framework must be an object'], warnings };
    }
    const f = framework;
    // ── Required string fields ──────────────────────────────────────────────
    const requiredStrings = ['id', 'name', 'version', 'description'];
    for (const field of requiredStrings) {
        if (!f[field] || typeof f[field] !== 'string') {
            errors.push(`"${field}" is required and must be a string`);
        }
    }
    // ── Category ────────────────────────────────────────────────────────────
    if (!f.category || typeof f.category !== 'string') {
        errors.push('"category" is required and must be a string');
    }
    else if (!FRAMEWORK_CATEGORIES.includes(f.category)) {
        errors.push(`"category" must be one of: ${FRAMEWORK_CATEGORIES.join(', ')}. Got "${f.category}"`);
    }
    // ── Origin ──────────────────────────────────────────────────────────────
    if (!f.origin || typeof f.origin !== 'object') {
        errors.push('"origin" is required and must be an object');
    }
    else {
        const origin = f.origin;
        if (!origin.type || typeof origin.type !== 'string') {
            errors.push('"origin.type" is required and must be a string');
        }
        if (!origin.attribution || typeof origin.attribution !== 'string') {
            errors.push('"origin.attribution" is required and must be a string');
        }
    }
    // ── Tags ────────────────────────────────────────────────────────────────
    if (!Array.isArray(f.tags)) {
        warnings.push('"tags" should be an array of strings');
    }
    // ── Data spec ───────────────────────────────────────────────────────────
    if (!f.data || typeof f.data !== 'object') {
        errors.push('"data" is required and must be an object');
    }
    else {
        const data = f.data;
        if (!Array.isArray(data.entity_types) || data.entity_types.length === 0) {
            errors.push('"data.entity_types" is required and must be a non-empty array');
        }
        else {
            data.entity_types.forEach((et, i) => {
                if (!et || typeof et !== 'object') {
                    errors.push(`"data.entity_types[${i}]" must be an object`);
                    return;
                }
                const spec = et;
                if (!spec.type || typeof spec.type !== 'string') {
                    errors.push(`"data.entity_types[${i}].type" is required and must be a string`);
                }
                if (!spec.role || typeof spec.role !== 'string') {
                    errors.push(`"data.entity_types[${i}].role" is required and must be a string`);
                }
            });
        }
        if (!data.required_properties || typeof data.required_properties !== 'object') {
            errors.push('"data.required_properties" is required and must be an object');
        }
        // Validate computed properties expressions
        if (Array.isArray(data.computed_properties)) {
            data.computed_properties.forEach((cp, i) => {
                if (!cp || typeof cp !== 'object') {
                    errors.push(`"data.computed_properties[${i}]" must be an object`);
                    return;
                }
                const prop = cp;
                if (!prop.property || typeof prop.property !== 'string') {
                    errors.push(`"data.computed_properties[${i}].property" is required and must be a string`);
                }
                if (!prop.expression || typeof prop.expression !== 'string') {
                    errors.push(`"data.computed_properties[${i}].expression" is required and must be a string`);
                }
                else {
                    const exprError = validateExpression(prop.expression);
                    if (exprError) {
                        errors.push(`"data.computed_properties[${i}].expression": ${exprError}`);
                    }
                }
                if (!prop.entity_type || typeof prop.entity_type !== 'string') {
                    errors.push(`"data.computed_properties[${i}].entity_type" is required and must be a string`);
                }
            });
        }
    }
    // ── Structure spec ──────────────────────────────────────────────────────
    if (!f.structure || typeof f.structure !== 'object') {
        errors.push('"structure" is required and must be an object');
    }
    else {
        const structure = f.structure;
        if (!structure.pattern || typeof structure.pattern !== 'string') {
            errors.push('"structure.pattern" is required and must be a string');
        }
        else if (!STRUCTURE_PATTERNS.includes(structure.pattern)) {
            errors.push(`"structure.pattern" must be one of: ${STRUCTURE_PATTERNS.join(', ')}. Got "${structure.pattern}"`);
        }
    }
    // ── Presentation spec ───────────────────────────────────────────────────
    if (!f.presentation || typeof f.presentation !== 'object') {
        errors.push('"presentation" is required and must be an object');
    }
    else {
        const pres = f.presentation;
        if (!pres.layout || typeof pres.layout !== 'object') {
            errors.push('"presentation.layout" is required and must be an object');
        }
        else {
            const layout = pres.layout;
            if (!layout.type || typeof layout.type !== 'string') {
                errors.push('"presentation.layout.type" is required and must be a string');
            }
        }
    }
    // ── Education spec ──────────────────────────────────────────────────────
    if (!f.education || typeof f.education !== 'object') {
        errors.push('"education" is required and must be an object');
    }
    else {
        const edu = f.education;
        if (!edu.purpose || typeof edu.purpose !== 'string') {
            errors.push('"education.purpose" is required and must be a string');
        }
        if (!edu.core_question || typeof edu.core_question !== 'string') {
            errors.push('"education.core_question" is required and must be a string');
        }
        if (!Array.isArray(edu.when_to_use)) {
            errors.push('"education.when_to_use" is required and must be an array');
        }
        if (!Array.isArray(edu.when_not_to_use)) {
            errors.push('"education.when_not_to_use" is required and must be an array');
        }
    }
    return { valid: errors.length === 0, errors, warnings };
}
/**
 * Validates a computed-property math expression.
 *
 * Checks:
 * - Balanced parentheses
 * - Only allowed tokens: identifiers, numbers, operators (+, -, *, /), parens, whitespace
 *
 * Returns null if valid, or an error message string.
 */
function validateExpression(expr) {
    // Check for empty expression
    if (expr.trim().length === 0) {
        return 'Expression must not be empty';
    }
    // Check balanced parentheses
    let depth = 0;
    for (const ch of expr) {
        if (ch === '(')
            depth++;
        if (ch === ')')
            depth--;
        if (depth < 0)
            return 'Unbalanced parentheses — unexpected closing paren';
    }
    if (depth !== 0) {
        return 'Unbalanced parentheses — missing closing paren';
    }
    // Check for valid tokens only: identifiers (a-z, _, digits), numbers, operators, parens, whitespace, dots
    const tokenPattern = /^[\w\s+\-*/().]+$/;
    if (!tokenPattern.test(expr)) {
        return `Expression contains invalid characters. Allowed: identifiers, numbers, +, -, *, /, (, ), .`;
    }
    return null;
}
//# sourceMappingURL=frameworks.js.map