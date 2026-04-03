import { NextRequest } from 'next/server';
import { hash } from '@node-rs/argon2';
import { nanoid } from 'nanoid';
import { getSession } from '@/lib/auth';
import { validateInviteCode, claimInviteCode } from '@/lib/invite-codes';
import { findUserByUsername, createUser } from '@/lib/users';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function POST(req: NextRequest) {
  let body: { inviteCode?: string; username?: string; password?: string };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { inviteCode, username, password } = body;

  // --- Validate required fields ---
  if (!inviteCode || !username || !password) {
    return Response.json(
      { error: 'Invite code, username, and password are required.' },
      { status: 400 },
    );
  }

  // --- Validate username format ---
  if (!USERNAME_RE.test(username)) {
    return Response.json(
      { error: 'Username must be 3-20 characters: letters, numbers, or underscores.' },
      { status: 400 },
    );
  }

  // --- Validate password length ---
  if (password.length < 8) {
    return Response.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 },
    );
  }

  // --- Validate invite code ---
  const codeCheck = await validateInviteCode(inviteCode);
  if (!codeCheck.valid) {
    return Response.json({ error: codeCheck.error }, { status: 400 });
  }

  // --- Check username uniqueness ---
  const existing = await findUserByUsername(username);
  if (existing) {
    return Response.json({ error: 'Username already taken.' }, { status: 400 });
  }

  // --- Hash password ---
  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  // --- Create user ---
  const userId = nanoid();
  await createUser({
    id: userId,
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  // --- Claim invite code ---
  await claimInviteCode(inviteCode, userId);

  // --- Create session ---
  const session = await getSession();
  session.userId = userId;
  session.username = username;
  await session.save();

  return Response.json({ ok: true });
}
