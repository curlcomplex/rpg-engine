#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WorldStore } from './store.js';
import { createServer } from './server.js';

const { values } = parseArgs({
  options: {
    file: { type: 'string', short: 'f' },
  },
  strict: false,
});

const filePath = resolve(typeof values.file === 'string' ? values.file : 'world.rpg');

async function main() {
  const store = new WorldStore(filePath);
  await store.ensureFile();

  const server = createServer(store);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('RPG Engine MCP server failed to start:', err);
  process.exit(1);
});
