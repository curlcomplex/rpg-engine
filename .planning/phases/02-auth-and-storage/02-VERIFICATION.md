---
phase: 02-auth-and-storage
verified: 2026-04-03T20:30:00Z
status: gaps_found
score: 8/9 must-haves verified
re_verification: false
gaps:
  - truth: "User can log in and immediately access the app (returning user with stored API key is not forced to re-enter key on every login)"
    status: failed
    reason: "login/route.ts creates a fresh iron-session but never sets session.hasApiKey. Iron-session only serializes fields explicitly saved to the session object — it does not reconstruct them from storage. So a returning user whose api_key.enc is on disk logs in and gets hasApiKey=undefined. Middleware then redirects them to /settings on every login, as if they have no key."
    artifacts:
      - path: "web/app/api/auth/login/route.ts"
        issue: "Does not check for existing api_key.enc on disk and set session.hasApiKey = true before session.save()"
      - path: "web/app/(app)/layout.tsx"
        issue: "Server action logout() calls session.destroy() without await — synchronous per iron-session impl so not a runtime bug, but pattern is inconsistent with the plan spec which said 'await session.destroy()'"
    missing:
      - "In login/route.ts, after creating the session, check if path.join(USERS_DIR, userId, 'api_key.enc') exists and set session.hasApiKey = true before session.save()"
      - "Same check needed in register/route.ts for completeness (though a brand-new user won't have a key yet, it's defensive)"
human_verification:
  - test: "Register with an invite code, then log out, then log in again — verify you land on the home page, not /settings"
    expected: "Returning user with stored API key should reach '/' after login, not be redirected to /settings"
    why_human: "This is a session-cookie behavioral flow across multiple requests that cannot be verified by static analysis alone"
  - test: "Enter a valid Anthropic API key on settings page — verify success message appears and key status shows 'configured'"
    expected: "Green checkmark status, success message 'API key saved and validated successfully'"
    why_human: "Requires live Anthropic API call to validate the key"
  - test: "Enter an invalid API key (not starting with sk-ant-) — verify immediate format error"
    expected: "Error message 'Invalid API key format'"
    why_human: "Client/server interaction with error display"
---

# Phase 2: Auth and Storage Verification Report

**Phase Goal:** Users can register with an invite code, log in securely, store their Anthropic API key, and have a personal data directory ready for world files
**Verified:** 2026-04-03
**Status:** gaps_found — 1 functional gap, 1 warning
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can register with valid invite code + username + password, rejected for invalid/used codes | VERIFIED | `register/route.ts` calls `validateInviteCode()` (line 46), returns error on failure; `claimInviteCode()` marks code used |
| 2 | User can log in, stay logged in across refreshes (HTTP-only cookie), log out | PARTIAL | Login and cookie creation work. But `session.hasApiKey` is not restored on login — returning user is always redirected to /settings despite having a stored key |
| 3 | User can enter API key, validated via test call, stored encrypted (AES-256-GCM) | VERIFIED | `api-key/route.ts` validates format, calls `validateApiKey()`, calls `encrypt()`, writes `api_key.enc` |
| 4 | User without valid API key redirected to settings | VERIFIED | Middleware line 32: `!session.hasApiKey` gate redirects to `/settings?setup=api-key` |

**Score:** 3/4 truths fully verified (Truth 2 is partial — login flow broken for returning users)

---

## Required Artifacts

### Plan 02-01 Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `web/lib/auth.ts` | VERIFIED | Exports `getSession`, `SessionData` (with `hasApiKey?: boolean`), `sessionOptions`; uses `await cookies()` correctly |
| `web/lib/crypto.ts` | VERIFIED | AES-256-GCM with `randomBytes(12)` per encryption, `iv:authTag:ciphertext` hex format |
| `web/lib/users.ts` | VERIFIED | Exports `createUser`, `findUserByUsername`, `UserProfile`; scans `USERS_DIR` per-user dirs |
| `web/lib/invite-codes.ts` | VERIFIED | Exports `validateInviteCode` (checks existence + used_by), `claimInviteCode` (sets used_by + claimed_at) |
| `web/lib/constants.ts` | VERIFIED | Exports `DATA_DIR`, `USERS_DIR`, `CODES_PATH`; resolves relative to RPG root |
| `web/lib/anthropic.ts` | VERIFIED | Exports `validateApiKey`; calls `client.models.list({limit:1})`; handles 401, 403, network errors |
| `web/middleware.ts` | VERIFIED | Route protection + API key gate; correct matcher config |
| `data/invite-codes.json` | VERIFIED | 15 codes in `{ codes: { [code]: { used_by, created_at } } }` format; all unused |

### Plan 02-02 Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `web/app/api/auth/register/route.ts` | VERIFIED | Full validation: invite code, username regex, password length, uniqueness check, argon2 hash, session |
| `web/app/api/auth/login/route.ts` | STUB (partial) | Credential verification correct, session created — but `hasApiKey` not restored from disk |
| `web/app/api/auth/logout/route.ts` | VERIFIED | `session.destroy()` called (synchronous — no await needed per iron-session impl) |
| `web/app/(auth)/login/page.tsx` | VERIFIED | 107 lines; POSTs to `/api/auth/login`; error + loading state; redirects on success |
| `web/app/(auth)/register/page.tsx` | VERIFIED | 130 lines; all 3 fields; POSTs to `/api/auth/register`; input hints; redirects on success |

### Plan 02-03 Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `web/app/api/settings/api-key/route.ts` | VERIFIED | POST: format check → validateApiKey → encrypt → writeFile → session.hasApiKey=true → save; GET: access() check |
| `web/app/(app)/settings/page.tsx` | VERIFIED | 167 lines; useEffect GET on mount; POST on submit; shows status, update flow, error/success messages |
| `web/app/(app)/layout.tsx` | VERIFIED | Server component nav with username, Settings link, logout server action |
| `web/app/(app)/page.tsx` | VERIFIED | Intentional placeholder per plan spec; links to /settings |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `web/lib/auth.ts` | `iron-session` | `getIronSession(await cookies(), sessionOptions)` | WIRED | Line 23: exact pattern present |
| `web/middleware.ts` | `web/lib/auth.ts` | imports `sessionOptions`, checks `session.userId` and `session.hasApiKey` | WIRED | Lines 5, 25, 32 |
| `web/lib/crypto.ts` | `node:crypto` | `createCipheriv/createDecipheriv` with `aes-256-gcm` | WIRED | Line 3: `const ALGORITHM = 'aes-256-gcm'` |
| `register/route.ts` | `invite-codes.ts` | `validateInviteCode` + `claimInviteCode` | WIRED | Lines 5, 46, 74 |
| `register/route.ts` | `@node-rs/argon2` | `hash()` for password hashing | WIRED | Line 2: `import { hash } from '@node-rs/argon2'` |
| `login/route.ts` | `@node-rs/argon2` | `verify()` for password checking | WIRED | Line 2: `import { verify } from '@node-rs/argon2'` |
| `login/route.ts` | `web/lib/auth.ts` | `getSession()` + `session.save()` | WIRED | Lines 4, 46-49 |
| `login/route.ts` | `data/users/{id}/api_key.enc` | **MISSING** — does not check disk for existing key | NOT_WIRED | No reference to `api_key.enc` or `USERS_DIR` in login route |
| `logout/route.ts` | `web/lib/auth.ts` | `getSession()` + `session.destroy()` | WIRED | Lines 1, 4-5 |
| `login/page.tsx` | `/api/auth/login` | fetch POST on form submit | WIRED | Line 20 |
| `register/page.tsx` | `/api/auth/register` | fetch POST on form submit | WIRED | Line 21 |
| `api-key/route.ts` | `web/lib/crypto.ts` | `encrypt()` to store API key | WIRED | Lines 2, 37 |
| `api-key/route.ts` | `web/lib/anthropic.ts` | `validateApiKey()` before storing | WIRED | Lines 3, 31 |
| `api-key/route.ts` | `data/users/{id}/api_key.enc` | `writeFile` to user's data directory | WIRED | Lines 40, `api_key.enc` string |
| `settings/page.tsx` | `/api/settings/api-key` | POST to store key, GET to check status | WIRED | Lines 16, 34 |
| `middleware.ts` | `session.hasApiKey` | cookie-based gate (no filesystem) | WIRED | Line 32 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| AUTH-01 | 02-02 | User can register with invite code, username, password | SATISFIED | `register/route.ts` full implementation with all validations |
| AUTH-02 | 02-02 | Invalid/used invite codes rejected with clear error | SATISFIED | `validateInviteCode` returns distinct errors: "Invalid invite code." / "This invite code has already been used." |
| AUTH-03 | 02-02 | User can log in with username and password | SATISFIED | `login/route.ts` verifies credentials and creates session |
| AUTH-04 | 02-01 | Session persists across browser refresh (HTTP-only cookie) | SATISFIED | `sessionOptions` sets `httpOnly: true`, `maxAge: 14 days`; iron-session seals cookie |
| AUTH-05 | 02-02 | User can log out | SATISFIED | `logout/route.ts` calls `session.destroy()` |
| KEY-01 | 02-03 | User can enter Anthropic API key on settings page | SATISFIED | `settings/page.tsx` has form with API key input and POST handler |
| KEY-02 | 02-03 | API key encrypted at rest (AES-256-GCM) | SATISFIED | `api-key/route.ts` calls `encrypt(apiKey)` from `crypto.ts` before `writeFile` |
| KEY-03 | 02-03 | API key validated on entry (test API call) | SATISFIED | `api-key/route.ts` calls `validateApiKey()` which calls `client.models.list()` |
| KEY-04 | 02-03 | User without valid API key cannot start game | PARTIAL | Gate exists in middleware but only effective for first-time setup. Returning users who log out and log back in will be gate-blocked until they visit settings (where the flag is re-set by the GET check, but the GET response does not update the session cookie) |

**Orphaned requirements:** None. All 9 IDs (AUTH-01 through AUTH-05, KEY-01 through KEY-04) appear in plan frontmatter and REQUIREMENTS.md.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `web/app/api/auth/login/route.ts` | 46-49 | Session saved without restoring `hasApiKey` from disk | Blocker | Returning users redirected to /settings on every login |
| `web/app/(app)/layout.tsx` | 8 | `session.destroy()` without `await` in server action | Warning | No runtime impact (destroy() is synchronous in iron-session v8), but inconsistent with plan spec |

---

## Human Verification Required

### 1. Returning User Login Flow

**Test:** Register with an invite code, submit a valid Anthropic API key on settings, log out, then log back in with the same credentials.
**Expected:** After login, user lands on `/` (home page), NOT redirected to `/settings`.
**Why human:** Multi-request session flow; static analysis confirmed the bug exists but end-to-end behavior needs confirmation.

### 2. API Key Validation Live Call

**Test:** Enter a real Anthropic API key on the settings page and submit.
**Expected:** Green success message; key status shows checkmark "API key is configured".
**Why human:** Requires live Anthropic API connection.

### 3. Invalid Invite Code Rejection

**Test:** Register with a made-up invite code (e.g., `FAKE-CODE-1234`).
**Expected:** Error message "Invalid invite code." displayed in red on the register form.
**Why human:** Visual error display confirmation.

---

## Gaps Summary

**One functional gap** blocks the phase goal for returning users.

**Root cause:** The `hasApiKey` session flag is a one-way write: it gets set when the user first enters their API key (`api-key/route.ts` POST), but it is never restored in `login/route.ts`. Iron-session stores only what's explicitly saved — it does not infer `hasApiKey` from the filesystem. So after logout + login, `hasApiKey` is `undefined` in the new session and the middleware gate trips for every app route except `/settings`.

**Fix is small:** In `web/app/api/auth/login/route.ts`, after `findUserByUsername` succeeds, add a filesystem check for `api_key.enc` and conditionally set `session.hasApiKey = true`:

```typescript
import { access } from 'node:fs/promises';
import path from 'node:path';
import { USERS_DIR } from '@/lib/constants';

// ... after credential verification, before session.save():
try {
  await access(path.join(USERS_DIR, user.id, 'api_key.enc'));
  session.hasApiKey = true;
} catch {
  // no key stored yet — hasApiKey stays undefined (falsy)
}
```

This single addition closes the gap. The same pattern should be applied in `register/route.ts` for defensiveness, though a new user will never have a key file at registration time.

---

_Verified: 2026-04-03_
_Verifier: Claude (gsd-verifier)_
