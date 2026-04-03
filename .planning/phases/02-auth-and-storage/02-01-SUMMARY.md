---
phase: 02-auth-and-storage
plan: 01
subsystem: auth
tags: [nextjs, iron-session, argon2, aes-256-gcm, middleware, invite-codes, anthropic-sdk]

# Dependency graph
requires:
  - phase: 01-engine-extraction
    provides: "@rpg-engine/core package for transpilePackages config"
provides:
  - "Next.js 16 app scaffold at web/ with App Router"
  - "npm workspaces linking packages/*, mcp-server, web"
  - "iron-session getSession() helper with SessionData type"
  - "AES-256-GCM encrypt/decrypt for API key storage"
  - "User CRUD (createUser, findUserByUsername) with per-user directories"
  - "Invite code validation and claiming from JSON store"
  - "API key validation via Anthropic models.list()"
  - "Middleware route protection redirecting unauthenticated to /login"
  - "15 seed invite codes in data/invite-codes.json"
  - "Environment secrets (SESSION_SECRET, ENCRYPTION_KEY) in .env.local"
affects: [02-02-PLAN, 02-03-PLAN, 03-turn-orchestrator, 04-chat-ui]

# Tech tracking
tech-stack:
  added: [next@16.2.2, react@19.2, iron-session@8, "@node-rs/argon2", nanoid, "@anthropic-ai/sdk", tailwindcss@4]
  patterns: [iron-session-async-cookies, aes-256-gcm-random-iv, per-user-directory-storage, middleware-route-protection]

key-files:
  created:
    - web/lib/auth.ts
    - web/lib/crypto.ts
    - web/lib/users.ts
    - web/lib/invite-codes.ts
    - web/lib/constants.ts
    - web/lib/anthropic.ts
    - web/middleware.ts
    - web/app/layout.tsx
    - web/next.config.ts
    - scripts/generate-invite-codes.ts
    - package.json
  modified:
    - .gitignore

key-decisions:
  - "Used @node-rs/argon2 instead of argon2 (ABI issues on Node v25.6.0)"
  - "Omitted --src-dir flag to match documented architecture paths (web/app/, web/lib/)"
  - "DATA_DIR resolves relative to RPG root (process.cwd()/../data) not web/"

patterns-established:
  - "iron-session pattern: getIronSession<SessionData>(await cookies(), sessionOptions) -- always await cookies()"
  - "Crypto pattern: AES-256-GCM with randomBytes(12) IV per encryption, stored as iv:authTag:ciphertext hex"
  - "User storage: data/users/{id}/profile.json + worlds/ directory per user"
  - "Route protection: middleware reads session (read-only), route handlers write sessions"

requirements-completed: [AUTH-04]

# Metrics
duration: 4min
completed: 2026-04-03
---

# Phase 2 Plan 1: Web App Scaffold and Auth Libraries Summary

**Next.js 16 app with iron-session auth helpers, AES-256-GCM crypto, user/invite-code stores, middleware route protection, and 15 seed invite codes**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-03T19:57:37Z
- **Completed:** 2026-04-03T20:02:25Z
- **Tasks:** 2
- **Files modified:** 29

## Accomplishments
- Next.js 16 app scaffolded at web/ with App Router, Tailwind v4, and monorepo workspaces
- All 7 library modules created with correct TypeScript types and exports
- Middleware intercepts unauthenticated requests and redirects to /login
- 15 invite codes seeded in data/invite-codes.json for playtest registration

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js app, install dependencies, set up monorepo workspaces** - `2f8731c` (feat)
2. **Task 2: Create all lib modules, middleware, and seed invite codes** - `b9178ff` (feat)

## Files Created/Modified
- `package.json` - Root monorepo with npm workspaces
- `web/package.json` - Next.js 16 app with auth dependencies
- `web/next.config.ts` - transpilePackages for @rpg-engine/core
- `web/app/layout.tsx` - Root layout (html, body, fonts)
- `web/middleware.ts` - Route protection checking session.userId
- `web/lib/auth.ts` - getSession() helper, SessionData type, session config
- `web/lib/crypto.ts` - AES-256-GCM encrypt/decrypt with random IV
- `web/lib/users.ts` - createUser/findUserByUsername with per-user directories
- `web/lib/invite-codes.ts` - validateInviteCode/claimInviteCode from JSON store
- `web/lib/constants.ts` - DATA_DIR, USERS_DIR, CODES_PATH path constants
- `web/lib/anthropic.ts` - validateApiKey via Anthropic models.list()
- `scripts/generate-invite-codes.ts` - Invite code generator (15 codes, XXXX-XXXX-XXXX format)
- `.gitignore` - Added .env*, data/, web/.next/, web/node_modules/

## Decisions Made
- Used `@node-rs/argon2` instead of `argon2` -- the original package has ABI issues with Node.js 23+ and fails to build on Node v25.6.0. @node-rs/argon2 is a drop-in replacement with prebuilt napi-rs binaries.
- Omitted `--src-dir` flag from create-next-app to match documented architecture paths (web/app/, web/lib/ not web/src/app/).
- DATA_DIR resolves relative to RPG root via `path.join(process.cwd(), '..', 'data')` so web/ process finds the shared data directory.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npx tsx` was not available in the environment (tsx not installed globally). Resolved by installing tsx globally with `npm install -g tsx`. This is a dev tool dependency, not a runtime issue.

## User Setup Required

None - no external service configuration required. Environment secrets are auto-generated in web/.env.local.

## Next Phase Readiness
- All lib modules ready for Plan 02-02 (auth routes: login, register, logout)
- Middleware active and will redirect to /login once auth pages exist
- Invite codes seeded and ready for registration flow
- Plan 02-03 (settings page, API key storage) can use crypto.ts and anthropic.ts immediately

## Self-Check: PASSED

All 12 key files verified present on disk. Both task commits (2f8731c, b9178ff) verified in git log.

---
*Phase: 02-auth-and-storage*
*Completed: 2026-04-03*
