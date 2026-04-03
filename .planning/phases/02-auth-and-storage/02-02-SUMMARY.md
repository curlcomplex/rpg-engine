---
phase: 02-auth-and-storage
plan: 02
subsystem: auth
tags: [nextjs, iron-session, argon2, invite-codes, react, app-router]

# Dependency graph
requires:
  - phase: 02-auth-and-storage/01
    provides: "iron-session getSession(), user CRUD, invite-code validation, @node-rs/argon2"
provides:
  - "POST /api/auth/register -- invite-code-gated registration with argon2 hashing"
  - "POST /api/auth/login -- credential verification with anti-enumeration errors"
  - "POST /api/auth/logout -- session destruction"
  - "Login page with dark RPG theme and error handling"
  - "Register page with invite code, username, password fields and input hints"
  - "Auth layout centering forms in card container"
affects: [02-03-PLAN, 03-turn-orchestrator, 04-chat-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [api-route-json-validation, anti-enumeration-error-messages, client-form-with-fetch]

key-files:
  created:
    - web/app/api/auth/register/route.ts
    - web/app/api/auth/login/route.ts
    - web/app/api/auth/logout/route.ts
    - web/app/(auth)/layout.tsx
    - web/app/(auth)/login/page.tsx
    - web/app/(auth)/register/page.tsx
  modified: []

key-decisions:
  - "Used identical error message for user-not-found and wrong-password to prevent username enumeration"
  - "Invite code field placed first in register form (most important gate for this flow)"

patterns-established:
  - "API route pattern: parse JSON body, validate fields, return Response.json with status codes"
  - "Anti-enumeration: login always returns 'Invalid username or password.' for both not-found and wrong-password"
  - "Client form pattern: useState for fields + error + loading, fetch POST, redirect on success via router.push"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-05]

# Metrics
duration: 2min
completed: 2026-04-03
---

# Phase 2 Plan 2: Auth Flow Summary

**Registration with invite-code gating and argon2 hashing, login with anti-enumeration errors, logout with session destruction, plus dark-themed login/register UI pages**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-03T20:05:35Z
- **Completed:** 2026-04-03T20:07:37Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Three auth API routes: register (validates invite code, hashes password, creates user + session), login (verifies credentials with identical error messages), logout (destroys session)
- Two client-side form pages with dark RPG theme: login (username/password) and register (invite code/username/password with input hints)
- Auth layout wrapping both pages in centered card on dark background
- Build passes cleanly with all 6 new files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create auth API routes (register, login, logout)** - `a879b7c` (feat)
2. **Task 2: Create auth UI pages (login, register) with auth layout** - `cf76d77` (feat)

## Files Created/Modified
- `web/app/api/auth/register/route.ts` - POST handler: validates invite code, username format, password length, hashes with argon2, creates user, claims code, creates session
- `web/app/api/auth/login/route.ts` - POST handler: verifies credentials with argon2, identical error for not-found/wrong-password, creates session
- `web/app/api/auth/logout/route.ts` - POST handler: destroys iron-session cookie
- `web/app/(auth)/layout.tsx` - Centered card layout with dark bg-gray-950 background
- `web/app/(auth)/login/page.tsx` - Client form with username/password, error display, loading state, link to register
- `web/app/(auth)/register/page.tsx` - Client form with invite code/username/password, input requirement hints, link to login

## Decisions Made
- Used identical error message ("Invalid username or password.") for both user-not-found and wrong-password cases to prevent username enumeration attacks
- Placed invite code field first in registration form since it is the primary gate for account creation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Full auth flow operational: register -> login -> logout cycle
- Middleware (from 02-01) redirects unauthenticated users to /login where the form now exists
- Plan 02-03 (settings page, API key storage) can build on the authenticated session
- All routes and pages confirmed in production build output

## Self-Check: PASSED

All 6 key files verified present on disk. Both task commits (a879b7c, cf76d77) verified in git log. Build passes cleanly.

---
*Phase: 02-auth-and-storage*
*Completed: 2026-04-03*
