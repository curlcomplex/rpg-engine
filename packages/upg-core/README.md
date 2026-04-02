# @upg/core

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The **Unified Product Graph (UPG)** is an open specification for structuring product knowledge as a typed, interconnected graph. It defines 311 entity types across 32 domains — from strategic outcomes and personas to engineering services and go-to-market plans — giving every product tool a shared language for import, export, and interoperability.

## Installation

```bash
npm install @upg/core
```

## Quick usage

```typescript
import {
  type UPGDocument,
  type UPGBaseNode,
  type UPGExtendedType,
  validateUPGDocument,
  isUPGDocument,
  UPG_VERSION,
} from '@upg/core'

// Build a document
const doc: UPGDocument = {
  upg_version: UPG_VERSION,
  exported_at: new Date().toISOString(),
  source: { tool: 'my-app', tool_version: '1.0.0' },
  product: { id: 'p1', title: 'My Product' },
  nodes: [
    { id: 'n1', type: 'persona', title: 'Power User' },
    { id: 'n2', type: 'jtbd', title: 'Get insights faster' },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', type: 'persona_has_jtbd' },
  ],
}

// Validate
const result = validateUPGDocument(doc)
console.log(result.valid)    // true
console.log(result.errors)   // []
console.log(result.warnings) // []

// Type guard
if (isUPGDocument(doc)) {
  console.log(`${doc.nodes.length} nodes exported`)
}
```

## Specification

The full spec is available at [`spec/UPG-CORE-v0.1.md`](./spec/UPG-CORE-v0.1.md).

## Website

[unifiedproductgraph.org](https://unifiedproductgraph.org)

## License

MIT
