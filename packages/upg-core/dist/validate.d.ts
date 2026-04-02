/**
 * UPG v0.1 — Document Validator
 *
 * Validates a UPGDocument against the spec.
 * Zero dependencies — works in any JavaScript environment.
 *
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */
import type { UPGDocument } from './schema.js';
export interface UPGValidationError {
    path: string;
    message: string;
}
export interface UPGValidationResult {
    valid: boolean;
    errors: UPGValidationError[];
    warnings: UPGValidationWarning[];
}
export interface UPGValidationWarning {
    path: string;
    message: string;
}
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
export declare function validateUPGDocument(doc: unknown): UPGValidationResult;
/**
 * Type guard — returns true if the document is a valid UPGDocument.
 * Use `validateUPGDocument` for detailed error reporting.
 */
export declare function isUPGDocument(doc: unknown): doc is UPGDocument;
//# sourceMappingURL=validate.d.ts.map