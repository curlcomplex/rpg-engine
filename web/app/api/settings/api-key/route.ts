import { getSession } from '@/lib/auth';
import { encrypt } from '@/lib/crypto';
import { validateApiKey } from '@/lib/anthropic';
import { USERS_DIR } from '@/lib/constants';
import { writeFile, access, mkdir } from 'node:fs/promises';
import path from 'node:path';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: { apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const apiKey = body.apiKey?.trim();
  if (!apiKey) {
    return Response.json({ error: 'API key is required' }, { status: 400 });
  }

  if (!apiKey.startsWith('sk-ant-')) {
    return Response.json({ error: 'Invalid API key format' }, { status: 400 });
  }

  // Validate key against Anthropic API
  const validation = await validateApiKey(apiKey);
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  // Encrypt and store
  const encrypted = encrypt(apiKey);
  const userDir = path.join(USERS_DIR, session.userId);
  await mkdir(userDir, { recursive: true });
  await writeFile(path.join(userDir, 'api_key.enc'), encrypted, 'utf8');

  // Update session with hasApiKey flag
  session.hasApiKey = true;
  await session.save();

  return Response.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const keyPath = path.join(USERS_DIR, session.userId, 'api_key.enc');
  let hasKey = false;
  try {
    await access(keyPath);
    hasKey = true;
  } catch {
    hasKey = false;
  }

  return Response.json({ hasKey });
}
