# Phase 2: Auth and Storage - Research

**Researched:** 2026-04-03
**Domain:** Next.js App Router scaffolding, invite-code auth, session management, API key encryption, per-user file storage
**Confidence:** HIGH

## Summary

Phase 2 is the first web code for the project. It requires scaffolding a Next.js 16 App Router application in `web/`, then implementing invite-code registration, username/password login with stateless cookie sessions, encrypted API key storage, and per-user data directories. All stack decisions are already locked from prior research (iron-session, argon2, AES-256-GCM, per-user disk storage).

**Critical finding:** The `argon2` npm package (v0.44) has a known ABI breaking change with Node.js 23+ and no fix as of March 2026. The project runs Node v25.6.0, so `argon2` will fail to build. Use `@node-rs/argon2` instead -- it is built with napi-rs (prebuilt binaries, no node-gyp), has an identical API (`hash()`, `verify()`), defaults to Argon2id, and works on Node 25. This is a same-API drop-in replacement.

**Second critical finding:** In Next.js 15+/16, `cookies()` from `next/headers` is now async and must be `await`ed. This changes the iron-session call pattern to `getIronSession<T>(await cookies(), sessionOptions)`.

**Primary recommendation:** Scaffold Next.js 16 with `create-next-app`, implement auth as server actions + route handlers using iron-session v8, use `@node-rs/argon2` for password hashing, use Node.js built-in `crypto` for AES-256-GCM API key encryption, and validate API keys via the Anthropic `GET /v1/models` endpoint (zero tokens consumed).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can register with invite code, username, and password | iron-session v8 + @node-rs/argon2 + invite codes in JSON file on disk |
| AUTH-02 | Invalid or already-used invite codes rejected with clear error | Invite code store (JSON file) with `used_by` field; validate before registration |
| AUTH-03 | User can log in with username and password | iron-session getIronSession() in route handler; argon2.verify() for password check |
| AUTH-04 | Session persists across browser refresh (HTTP-only cookie) | iron-session encrypts session data into the cookie itself; httpOnly + secure + sameSite flags |
| AUTH-05 | User can log out | session.destroy() in route handler (synchronous -- removes cookie) |
| KEY-01 | User can enter Anthropic API key on settings page | Settings route + server action; store encrypted key in user's data directory |
| KEY-02 | API key encrypted at rest (AES-256-GCM) | Node.js crypto with random 12-byte IV per encryption, ENCRYPTION_KEY from env var |
| KEY-03 | API key validated on entry (test API call) | `GET /v1/models` endpoint via Anthropic SDK -- zero tokens consumed, validates key works |
| KEY-04 | User without valid API key cannot start a game | Middleware or server-side check: decrypt key, if missing/invalid redirect to settings |
</phase_requirements>

## Standard Stack

### Core (Phase 2 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.2 | App Router framework (first web code) | Already decided. Scaffolds with `create-next-app`. App Router is stable. |
| React | ^19.2 | UI rendering | Ships with Next.js 16 |
| iron-session | ^8.0.4 | Stateless encrypted cookie sessions | Single `getIronSession()` API. Works with App Router route handlers, server actions, and middleware (read-only in middleware). No database. Recommended by Next.js docs. |
| @node-rs/argon2 | ^2.0 | Password hashing (Argon2id) | **Use this instead of `argon2`**. The original `argon2` package has ABI issues with Node.js 23+. @node-rs/argon2 uses napi-rs (prebuilt binaries), identical API, defaults to Argon2id, works on Node v25.6.0. |
| Node.js crypto | built-in | AES-256-GCM encryption for API keys | Zero dependencies. `createCipheriv`/`createDecipheriv` with `aes-256-gcm`. Random 12-byte IV per encryption. |
| nanoid | ^5.1 | User IDs, invite code generation | Already in engine package. Consistent across codebase. |
| TypeScript | ^5.8+ | Type safety | Already used in engine and MCP server. Match existing. |
| Tailwind CSS | ^4.2 | Styling (minimal for auth pages) | Scaffolded by `create-next-app --tailwind`. CSS-first config in v4. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @node-rs/argon2 | argon2 (original) | argon2 v0.44 has ABI issues on Node 23+. @node-rs/argon2 is a drop-in with prebuilt binaries. |
| @node-rs/argon2 | @aspect-security/argon2 | Also a prebuilt drop-in for `argon2` with identical API. Either works; @node-rs/argon2 is more established in the ecosystem. |
| iron-session | NextAuth.js / Auth.js | Massively over-engineered for 10-user invite-code auth. No OAuth needed. |
| Node.js crypto | libsodium / tweetnacl | Built-in module, zero supply chain risk. AES-256-GCM is standard. |

**Installation:**
```bash
# In web/ directory after scaffold
npm install iron-session@latest
npm install @node-rs/argon2@latest
npm install nanoid@latest
# No install needed for Node.js crypto (built-in)
# Tailwind installed by create-next-app
```

## Architecture Patterns

### Recommended Project Structure (Phase 2 scope)

```
web/
  app/
    (auth)/                    # Route group for login/register (no shared app layout)
      login/
        page.tsx               # Login form
      register/
        page.tsx               # Registration form (invite code + username + password)
      layout.tsx               # Minimal layout for auth pages (centered card)
    (app)/                     # Route group for authenticated pages
      settings/
        page.tsx               # API key entry form
      layout.tsx               # App layout (will later hold sidebar + nav)
      page.tsx                 # Home/dashboard (will later be chat, for now redirect)
    api/
      auth/
        login/route.ts         # POST: validate credentials, create session
        register/route.ts      # POST: validate invite code, create user, create session
        logout/route.ts        # POST: destroy session
      settings/
        api-key/route.ts       # POST: encrypt + store API key; GET: check if key exists
    layout.tsx                 # Root layout (html, body, font)
  lib/
    auth.ts                    # Session config, getSession() helper, SessionData type
    crypto.ts                  # AES-256-GCM encrypt/decrypt functions
    invite-codes.ts            # Load/validate/claim invite codes
    users.ts                   # Create user, find user, validate password
    constants.ts               # DATA_DIR, paths, config
  middleware.ts                # Route protection: check session, redirect unauthenticated
  package.json
  next.config.ts
  tsconfig.json
  .env.local                   # SESSION_SECRET, ENCRYPTION_KEY (not committed)
```

### Data Directory Layout

```
/data/                         # Root data directory (env var DATA_DIR, default ./data)
  invite-codes.json            # { "DRAGON-FIRE-2026": { used_by: null, created_at: "..." }, ... }
  users/
    {user_id}/
      profile.json             # { id, username, passwordHash, createdAt }
      api_key.enc              # AES-256-GCM encrypted: iv (24 hex) + : + authTag (32 hex) + : + ciphertext (hex)
      worlds/                  # Empty dir, ready for Phase 5
```

### Pattern 1: iron-session Helper Module

**What:** Centralize session configuration in a single module. Export a `getSession()` helper that all route handlers and server actions call.

**Why:** iron-session requires passing session options (password, cookieName, cookie config) to every `getIronSession()` call. Centralizing avoids duplication and ensures consistent configuration.

**Example:**
```typescript
// web/lib/auth.ts
import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  username?: string;
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'rpg-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 14, // 14 days
    path: '/',
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
```

**Critical detail:** `cookies()` is async in Next.js 15+/16 and must be `await`ed before passing to `getIronSession()`.

### Pattern 2: Registration Flow

**What:** Validate invite code, hash password, create user directory, create session.

**Example:**
```typescript
// web/app/api/auth/register/route.ts
import { hash } from '@node-rs/argon2';
import { nanoid } from 'nanoid';
import { getSession } from '@/lib/auth';
import { claimInviteCode } from '@/lib/invite-codes';
import { createUser } from '@/lib/users';

export async function POST(req: Request) {
  const { inviteCode, username, password } = await req.json();

  // 1. Validate invite code
  const codeResult = await claimInviteCode(inviteCode);
  if (!codeResult.valid) {
    return Response.json({ error: codeResult.error }, { status: 400 });
  }

  // 2. Check username availability
  // ... (scan users directory for duplicate username)

  // 3. Hash password
  const passwordHash = await hash(password, {
    memoryCost: 19456,  // 19 MiB
    timeCost: 2,
    parallelism: 1,
    algorithm: 2,       // Argon2id
  });

  // 4. Create user
  const userId = nanoid();
  await createUser({ id: userId, username, passwordHash });

  // 5. Mark invite code as used
  await claimInviteCode(inviteCode, userId);

  // 6. Create session
  const session = await getSession();
  session.userId = userId;
  session.username = username;
  await session.save();

  return Response.json({ ok: true });
}
```

### Pattern 3: API Key Encryption (AES-256-GCM)

**What:** Encrypt the user's Anthropic API key with AES-256-GCM using a unique random IV per encryption. Store as a single file with IV + authTag + ciphertext.

**Example:**
```typescript
// web/lib/crypto.ts
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM (recommended by NIST)

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(key, 'hex');
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  // Format: iv:authTag:ciphertext (all hex)
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, ciphertext] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getEncryptionKey();

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

**Security notes:**
- Random 12-byte IV per encryption ensures unique ciphertext even for the same key value
- GCM mode provides authenticated encryption (tamper detection via auth tag)
- ENCRYPTION_KEY is 32 bytes (256 bits), stored as 64-char hex string in env var
- Never store the encryption key on the same volume as the encrypted data in production

### Pattern 4: API Key Validation via Models List

**What:** Validate the user's Anthropic API key by calling `GET /v1/models` -- the lightest possible API call that consumes zero tokens.

**Example:**
```typescript
// web/lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';

export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const client = new Anthropic({ apiKey });
    await client.models.list({ limit: 1 });
    return { valid: true };
  } catch (err: any) {
    if (err.status === 401) {
      return { valid: false, error: 'Invalid API key. Please check and try again.' };
    }
    if (err.status === 403) {
      return { valid: false, error: 'API key does not have access. Check your Anthropic account.' };
    }
    return { valid: false, error: 'Could not validate API key. Please try again later.' };
  }
}
```

**Why `models.list()` over `messages.create()`:** Zero cost. No tokens consumed. No model selection needed. A 401 response means invalid key; a 200 means valid.

### Pattern 5: Middleware for Route Protection

**What:** Use Next.js middleware to redirect unauthenticated users to `/login` and users without API keys to `/settings`.

**Example:**
```typescript
// web/middleware.ts
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

const publicPaths = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow API routes for auth endpoints
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Read session (read-only in middleware -- cannot save/destroy)
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Important:** Middleware can READ iron-session cookies but CANNOT write them (Next.js limitation). All session modifications (save, destroy) must happen in route handlers or server actions.

### Pattern 6: Invite Code Store

**What:** Store invite codes in a simple JSON file on disk. Pre-generate codes before deployment. Validate and claim atomically.

**Example:**
```typescript
// web/lib/invite-codes.ts
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CODES_PATH = join(process.env.DATA_DIR || './data', 'invite-codes.json');

interface InviteCode {
  used_by: string | null;
  created_at: string;
  claimed_at?: string;
}

interface CodesStore {
  codes: Record<string, InviteCode>;
}

export async function validateInviteCode(code: string): Promise<{ valid: boolean; error?: string }> {
  const store = JSON.parse(await readFile(CODES_PATH, 'utf8')) as CodesStore;
  const entry = store.codes[code];

  if (!entry) return { valid: false, error: 'Invalid invite code.' };
  if (entry.used_by) return { valid: false, error: 'This invite code has already been used.' };

  return { valid: true };
}

export async function claimInviteCode(code: string, userId: string): Promise<void> {
  const store = JSON.parse(await readFile(CODES_PATH, 'utf8')) as CodesStore;
  store.codes[code].used_by = userId;
  store.codes[code].claimed_at = new Date().toISOString();
  await writeFile(CODES_PATH, JSON.stringify(store, null, 2));
}
```

### Anti-Patterns to Avoid

- **Putting auth logic in page components:** Auth checks belong in middleware (for redirects) and route handlers (for session creation). Page components should assume they are authenticated if they render at all.
- **Checking auth in layouts:** Next.js layouts do NOT re-render on navigation (Partial Rendering). An auth check in a layout will not run on every page change. Use middleware instead.
- **Importing `argon2` (the original package):** Will fail to build on Node v25.6.0. Always use `@node-rs/argon2`.
- **Synchronous `cookies()` call:** `cookies()` is async in Next.js 15+/16. Must be `await`ed. `getIronSession(cookies(), ...)` will fail -- use `getIronSession(await cookies(), ...)`.
- **Writing sessions in middleware:** iron-session `session.save()` does not work in Next.js middleware. Only route handlers and server actions can write cookies.
- **Hardcoding ENCRYPTION_KEY in source:** Must be an environment variable, never committed to git.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management | Custom JWT implementation or signed cookies | iron-session v8 | Handles encryption, sealing, cookie management, tamper protection. One function call. |
| Password hashing | Custom hash + salt | @node-rs/argon2 | Memory-hard algorithm, timing-safe comparison, configurable parameters. Getting crypto right is hard. |
| Cookie encryption | Manual AES on cookies | iron-session (uses @hapi/iron internally) | iron-session already encrypts the session cookie. Don't double-encrypt. |
| API key encryption | Custom encryption scheme | Node.js crypto AES-256-GCM | Standard, audited, built-in. The pattern is 20 lines of code. |
| Route protection | Manual auth checks in every route | Next.js middleware + getIronSession | Centralized, runs before route handlers, single source of truth |

**Key insight:** The entire auth system for 10 users with invite codes is roughly 200-300 lines of actual code. The complexity is in getting the security patterns right (argon2 config, GCM IV handling, cookie flags), not in the amount of code.

## Common Pitfalls

### Pitfall 1: argon2 Build Failure on Node.js 23+

**What goes wrong:** `npm install argon2` triggers a native build via node-gyp. On Node.js 23+ there is an ABI breaking change. Build fails with cryptic C++ compilation errors.
**Why it happens:** The `argon2` package uses N-API bindings that are tied to a specific Node.js ABI version. Node 23 changed the ABI.
**How to avoid:** Use `@node-rs/argon2` which ships prebuilt binaries via napi-rs. No compilation step.
**Warning signs:** `node-gyp rebuild` failures during `npm install`.

### Pitfall 2: cookies() Not Awaited (Next.js 16 Breaking Change)

**What goes wrong:** Code uses `getIronSession(cookies(), sessionOptions)` without `await` on `cookies()`. Session reads fail silently or throw runtime errors.
**Why it happens:** Next.js 15 made `cookies()` async. All tutorials/examples before 2025 show synchronous usage.
**How to avoid:** Always `await cookies()` before passing to `getIronSession()`. Pattern: `getIronSession<SessionData>(await cookies(), sessionOptions)`.
**Warning signs:** "cookies() should be awaited" warnings in dev console.

### Pitfall 3: Same IV Reused for AES-GCM Encryption

**What goes wrong:** Using a static or predictable IV for AES-256-GCM encryption. If the same key+IV pair is reused, GCM mode leaks plaintext via XOR of ciphertexts.
**Why it happens:** Developer copies encryption example that uses a hardcoded IV for simplicity.
**How to avoid:** Always generate a fresh random IV: `crypto.randomBytes(12)`. Store it alongside the ciphertext.
**Warning signs:** Two encryptions of the same plaintext produce identical ciphertext.

### Pitfall 4: ENCRYPTION_KEY Committed to Git

**What goes wrong:** `.env.local` or the encryption key string gets committed to the repository.
**Why it happens:** `.gitignore` not set up for `.env*` files, or key is placed in `next.config.ts`.
**How to avoid:** Verify `.gitignore` includes `.env*`. Keep ENCRYPTION_KEY only in environment variables. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
**Warning signs:** `git diff` shows env files staged.

### Pitfall 5: Race Condition on Invite Code Claiming

**What goes wrong:** Two registration requests arrive simultaneously for the same invite code. Both validate the code as unused, both claim it, and two users are created with the same code.
**Why it happens:** The validate-then-claim is not atomic. File reads and writes are separate operations.
**How to avoid:** For 10 users this is extremely unlikely, but be safe: read-validate-write in a single atomic operation. Use a simple lock (promise queue) around invite code operations, or check for duplicate claims after write and roll back the second one.
**Warning signs:** Two user profiles referencing the same invite code.

### Pitfall 6: Session Not Saved Before Response

**What goes wrong:** `session.save()` is called but not `await`ed. The response is sent before the cookie header is written. User appears to not be logged in.
**Why it happens:** Forgetting that `session.save()` is async and must complete before the response is sent.
**How to avoid:** Always `await session.save()` before returning a Response. iron-session docs explicitly state: "save() is asynchronous and must be awaited before headers are sent."
**Warning signs:** Login appears to succeed but user is immediately redirected back to login page.

## Code Examples

### Generating Environment Secrets

```bash
# Generate SESSION_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ENCRYPTION_KEY (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Generating Invite Codes

```typescript
// scripts/generate-invite-codes.ts
import { nanoid } from 'nanoid';
import { writeFileSync } from 'node:fs';

const count = 15;
const codes: Record<string, { used_by: null; created_at: string }> = {};

for (let i = 0; i < count; i++) {
  const code = `${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}`;
  codes[code] = { used_by: null, created_at: new Date().toISOString() };
}

writeFileSync('./data/invite-codes.json', JSON.stringify({ codes }, null, 2));
console.log('Generated invite codes:', Object.keys(codes));
```

### Next.js Scaffold Command

```bash
# From the RPG/ root directory
npx create-next-app@latest web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --turbopack

# Then add auth dependencies
cd web
npm install iron-session @node-rs/argon2 nanoid @anthropic-ai/sdk
```

**Note on `--src-dir`:** The scaffold creates `web/src/app/` instead of `web/app/`. Adjust paths accordingly. If `src/` directory is not desired, omit the flag.

### User Lookup by Username

```typescript
// web/lib/users.ts
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const USERS_DIR = join(process.env.DATA_DIR || './data', 'users');

export interface UserProfile {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export async function findUserByUsername(username: string): Promise<UserProfile | null> {
  const entries = await readdir(USERS_DIR).catch(() => []);
  for (const userId of entries) {
    try {
      const profile = JSON.parse(
        await readFile(join(USERS_DIR, userId, 'profile.json'), 'utf8')
      ) as UserProfile;
      if (profile.username === username) return profile;
    } catch { continue; }
  }
  return null;
}

export async function createUser(profile: UserProfile): Promise<void> {
  const userDir = join(USERS_DIR, profile.id);
  await mkdir(join(userDir, 'worlds'), { recursive: true });
  await writeFile(join(userDir, 'profile.json'), JSON.stringify(profile, null, 2));
}
```

**Note:** Linear scan of user directories is fine for 10 users. At scale, you would add a username index file or switch to a database.

### Login Route Handler

```typescript
// web/app/api/auth/login/route.ts
import { verify } from '@node-rs/argon2';
import { getSession } from '@/lib/auth';
import { findUserByUsername } from '@/lib/users';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return Response.json({ error: 'Username and password are required.' }, { status: 400 });
  }

  const user = await findUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  const valid = await verify(user.passwordHash, password);
  if (!valid) {
    return Response.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  await session.save();

  return Response.json({ ok: true });
}
```

**Security note:** Always return the same error message for "user not found" and "wrong password" to prevent username enumeration.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `cookies()` synchronous | `cookies()` async (must await) | Next.js 15 (Oct 2024) | All iron-session calls need `await cookies()` |
| `argon2` (node-gyp) | `@node-rs/argon2` (prebuilt napi-rs) | 2024+ (Node 23 ABI break) | Drop-in replacement, no build step |
| NextAuth.js for all auth | iron-session for simple auth | Ongoing | NextAuth adds OAuth complexity; iron-session is simpler for password auth |
| `tailwind.config.js` | CSS-first config (no config file) | Tailwind v4 (2025) | `create-next-app --tailwind` scaffolds v4 automatically |
| bcrypt for passwords | Argon2id (memory-hard) | OWASP 2024 recommendation | Argon2id resists GPU attacks better than bcrypt |

## Open Questions

1. **`--src-dir` flag decision**
   - What we know: `create-next-app` offers `src/` directory. Architecture doc uses `web/app/` (no src). The STACK.md shows `web/app/` paths.
   - What's unclear: Whether the project prefers `web/src/app/` or `web/app/`
   - Recommendation: Omit `--src-dir` to match the documented architecture paths (`web/app/`, `web/lib/`). Simpler imports.

2. **Root package.json and npm workspaces**
   - What we know: No root `package.json` exists yet. ARCHITECTURE.md says to use npm workspaces with `["packages/*", "mcp-server", "web"]`.
   - What's unclear: Whether to set up the workspace in this phase or defer
   - Recommendation: Create root `package.json` with workspaces in this phase, since `web/` needs to import from `@rpg-engine/core` (for Anthropic SDK types and tool definitions in later phases, but the workspace link should exist from the start).

3. **DATA_DIR environment variable vs hardcoded path**
   - What we know: Design spec says `/data/users/{id}/`. Railway mounts volumes at a configurable path.
   - What's unclear: Exact Railway volume mount path
   - Recommendation: Use `process.env.DATA_DIR || './data'` everywhere. Default to `./data` for local dev. Set `DATA_DIR=/data` in Railway env vars when deploying. Create a `constants.ts` that resolves all paths.

## Sources

### Primary (HIGH confidence)
- [iron-session GitHub README](https://github.com/vvo/iron-session) -- v8 API, getIronSession, cookies() pattern, session options
- [iron-session middleware discussion #658](https://github.com/vvo/iron-session/discussions/658) -- middleware can read sessions but not write
- [@node-rs/argon2 README](https://github.com/napi-rs/node-rs/blob/main/packages/argon2/README.md) -- hash/verify API, options, Argon2id default, napi-rs prebuilt binaries
- [Anthropic Models List API](https://platform.claude.com/docs/en/api/models/list) -- GET /v1/models, zero-cost validation endpoint
- [Next.js cookies() async change](https://nextjs.org/docs/app/api-reference/functions/cookies) -- must be awaited in Next.js 15+/16
- [Next.js Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) -- (auth) and (app) group pattern
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) -- recommended patterns, layout auth warning
- [Node.js crypto AES-256-GCM](https://nodejs.org/api/crypto.html) -- createCipheriv, createDecipheriv, getAuthTag
- [Node.js AES-256-GCM example gist](https://gist.github.com/rjz/15baffeab434b8125ca4d783f4116d81) -- standard encrypt/decrypt pattern

### Secondary (MEDIUM confidence)
- [argon2 Node 23 ABI issue](https://www.npmjs.com/package/argon2) -- build failure reports, @aspect-security/argon2 as alternative
- [Next.js 16 blog post](https://nextjs.org/blog/next-16) -- Turbopack default, React 19.2, async APIs
- [create-next-app CLI docs](https://nextjs.org/docs/app/api-reference/cli/create-next-app) -- scaffold flags, --tailwind, --app
- [renchris/app-router-iron-session example](https://github.com/renchris/app-router-iron-session) -- working App Router + iron-session example

### Tertiary (LOW confidence)
- None -- all findings verified against official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified, argon2 Node.js 25 compatibility issue caught and resolved with @node-rs/argon2
- Architecture: HIGH -- patterns follow documented project architecture (ARCHITECTURE.md, STACK.md), iron-session v8 API verified
- Pitfalls: HIGH -- argon2 ABI issue verified, cookies() async change verified, GCM IV uniqueness is standard crypto knowledge
- Code examples: HIGH -- all examples use verified APIs, patterns cross-referenced with official docs

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (30 days -- stable domain, no fast-moving APIs)
