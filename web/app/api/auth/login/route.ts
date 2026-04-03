import { NextRequest } from 'next/server';
import { verify } from '@node-rs/argon2';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { getSession } from '@/lib/auth';
import { findUserByUsername } from '@/lib/users';
import { USERS_DIR } from '@/lib/constants';

const INVALID_CREDENTIALS = 'Invalid username or password.';

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { username, password } = body;

  // --- Validate required fields ---
  if (!username || !password) {
    return Response.json(
      { error: 'Username and password are required.' },
      { status: 400 },
    );
  }

  // --- Look up user ---
  const user = await findUserByUsername(username);
  if (!user) {
    return Response.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }

  // --- Verify password ---
  let valid: boolean;
  try {
    valid = await verify(user.passwordHash, password);
  } catch {
    valid = false;
  }

  if (!valid) {
    return Response.json({ error: INVALID_CREDENTIALS }, { status: 401 });
  }

  // --- Restore hasApiKey flag from disk ---
  let hasApiKey = false;
  try {
    await access(path.join(USERS_DIR, user.id, 'api_key.enc'));
    hasApiKey = true;
  } catch {}

  // --- Create session ---
  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.hasApiKey = hasApiKey;
  await session.save();

  return Response.json({ ok: true });
}
