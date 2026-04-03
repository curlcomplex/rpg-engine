import { nanoid } from 'nanoid';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const count = 15;
const codes: Record<string, { used_by: null; created_at: string }> = {};

for (let i = 0; i < count; i++) {
  const code = `${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}`;
  codes[code] = { used_by: null, created_at: new Date().toISOString() };
}

const dataDir = join(process.cwd(), 'data');
mkdirSync(dataDir, { recursive: true });

const outputPath = join(dataDir, 'invite-codes.json');
writeFileSync(outputPath, JSON.stringify({ codes }, null, 2));
console.log(`Generated ${count} invite codes at ${outputPath}`);
console.log('Codes:', Object.keys(codes).join(', '));
