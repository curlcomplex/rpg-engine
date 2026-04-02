/**
 * UPG v0.1 — Document Validator
 *
 * Validates a UPGDocument against the spec.
 * Zero dependencies — works in any JavaScript environment.
 *
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
import { getTypesForTier } from './domains.js';
/**
 * Validates a UPGDocument against the UPG v0.1 specification.
 *
 * Returns a result object with `valid`, `errors`, and `warnings`.
 * Errors are spec violations. Warnings are best-practice notices.
 *
 * Node types are checked against both tiers:
 * - Core types: no warning
 * - Extended types: no warning (recognised tier)
 * - Unknown types: warning (preserved but not in any tier)
 */
export function validateUPGDocument(doc) {
    const errors = [];
    const warnings = [];
    if (!doc || typeof doc !== 'object') {
        return { valid: false, errors: [{ path: '$', message: 'Document must be an object' }], warnings };
    }
    const d = doc;
    // Required top-level fields
    if (!d.upg_version || typeof d.upg_version !== 'string') {
        errors.push({ path: '$.upg_version', message: 'upg_version is required and must be a string' });
    }
    if (!d.exported_at || typeof d.exported_at !== 'string') {
        errors.push({ path: '$.exported_at', message: 'exported_at is required and must be an ISO 8601 string' });
    }
    if (!d.source || typeof d.source !== 'object') {
        errors.push({ path: '$.source', message: 'source is required and must be an object' });
    }
    else {
        const source = d.source;
        if (!source.tool || typeof source.tool !== 'string') {
            errors.push({ path: '$.source.tool', message: 'source.tool is required and must be a string' });
        }
    }
    if (!d.product || typeof d.product !== 'object') {
        errors.push({ path: '$.product', message: 'product is required and must be an object' });
    }
    else {
        const product = d.product;
        if (!product.id || typeof product.id !== 'string') {
            errors.push({ path: '$.product.id', message: 'product.id is required and must be a string' });
        }
        if (!product.title || typeof product.title !== 'string') {
            errors.push({ path: '$.product.title', message: 'product.title is required and must be a string' });
        }
    }
    // Build the set of all known types across both tiers
    const allKnownTypes = new Set(getTypesForTier('extended'));
    // Nodes
    if (!Array.isArray(d.nodes)) {
        errors.push({ path: '$.nodes', message: 'nodes is required and must be an array' });
    }
    else {
        const nodeIds = new Set();
        d.nodes.forEach((node, i) => {
            const path = `$.nodes[${i}]`;
            if (!node || typeof node !== 'object') {
                errors.push({ path, message: 'Each node must be an object' });
                return;
            }
            const n = node;
            if (!n.id || typeof n.id !== 'string') {
                errors.push({ path: `${path}.id`, message: 'Node id is required and must be a string' });
            }
            else {
                if (nodeIds.has(n.id)) {
                    errors.push({ path: `${path}.id`, message: `Duplicate node id: ${n.id}` });
                }
                nodeIds.add(n.id);
            }
            if (!n.type || typeof n.type !== 'string') {
                errors.push({ path: `${path}.type`, message: 'Node type is required and must be a string' });
            }
            else if (!allKnownTypes.has(n.type)) {
                warnings.push({ path: `${path}.type`, message: `Unknown UPG type: "${n.type}". Node will be preserved with its original type.` });
            }
            if (!n.title || typeof n.title !== 'string') {
                errors.push({ path: `${path}.title`, message: 'Node title is required and must be a string' });
            }
        });
        // Edges
        if (!Array.isArray(d.edges)) {
            errors.push({ path: '$.edges', message: 'edges is required and must be an array' });
        }
        else {
            d.edges.forEach((edge, i) => {
                const path = `$.edges[${i}]`;
                if (!edge || typeof edge !== 'object') {
                    errors.push({ path, message: 'Each edge must be an object' });
                    return;
                }
                const e = edge;
                if (!e.id || typeof e.id !== 'string') {
                    errors.push({ path: `${path}.id`, message: 'Edge id is required and must be a string' });
                }
                if (!e.source || typeof e.source !== 'string') {
                    errors.push({ path: `${path}.source`, message: 'Edge source is required and must be a string' });
                }
                else if (!nodeIds.has(e.source)) {
                    errors.push({ path: `${path}.source`, message: `Edge source references unknown node id: ${e.source}` });
                }
                if (!e.target || typeof e.target !== 'string') {
                    errors.push({ path: `${path}.target`, message: 'Edge target is required and must be a string' });
                }
                else if (!nodeIds.has(e.target)) {
                    errors.push({ path: `${path}.target`, message: `Edge target references unknown node id: ${e.target}` });
                }
                if (!e.type || typeof e.type !== 'string') {
                    errors.push({ path: `${path}.type`, message: 'Edge type is required and must be a string' });
                }
            });
        }
    }
    return { valid: errors.length === 0, errors, warnings };
}
/**
 * Type guard — returns true if the document is a valid UPGDocument.
 * Use `validateUPGDocument` for detailed error reporting.
 */
export function isUPGDocument(doc) {
    return validateUPGDocument(doc).valid;
}
//# sourceMappingURL=validate.js.map