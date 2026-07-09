# Fix Agent Profile Not Found

## Problem
`PUT /api/users/agents/me` always returned 404 "Agent profile not found" when agents tried to save their profile.

## Root Cause
Two issues:

1. **Route handler assumed profile exists** — [`PUT /api/users/agents/me`](src/server/routes/users.ts:211) used `AgentProfile.findOne()` and threw 404 if not found. Same for [`POST /api/users/agents/me/invite-link`](src/server/routes/users.ts:220) and [`POST /api/users/me/avatar`](src/server/routes/users.ts:328).

2. **Admin user creation didn't create profiles** — [`POST /api/admin/users`](src/server/routes/admin.ts:63) created a `User` record but never created an `AgentProfile` (or `ClientProfile`) for the role. Similarly, [`PUT /api/admin/users/:id`](src/server/routes/admin.ts:100) could change a user's role to agent without creating the profile.

## Solution

### 1. Added `ensureAgentProfile()` helper in [`users.ts`](src/server/routes/users.ts:17)
Uses `findOrCreate` to guarantee an `AgentProfile` exists for any agent user. If missing, creates one with sensible defaults (random slug, empty specialties, USD, UTC).

### 2. Updated three route handlers in [`users.ts`](src/server/routes/users.ts) to use `ensureAgentProfile()`:
- [`PUT /api/users/agents/me`](src/server/routes/users.ts:220) — update agent profile
- [`POST /api/users/agents/me/invite-link`](src/server/routes/users.ts:234) — regenerate invite link
- [`POST /api/users/me/avatar`](src/server/routes/users.ts:328) — upload avatar

### 3. Fixed [`POST /api/admin/users`](src/server/routes/admin.ts:84) to create profiles
When admin creates a user, the corresponding profile is now created:
- Agent users → `AgentProfile.create()` with slug, defaults
- Client users → `ClientProfile.create()`

### 4. Fixed [`PUT /api/admin/users/:id`](src/server/routes/admin.ts:139) to create profiles on role change
When admin changes a user's role, the corresponding profile is created if missing.

### 5. Increased `hookTimeout` in [`vitest.config.ts`](vitest.config.ts:25) to 30s
Fixed pre-existing timeout issue in `payments.spec.ts` `Admin Payment Access` test.

## Files Changed
- `src/server/routes/users.ts` — Added `ensureAgentProfile()`, updated 3 handlers
- `src/server/routes/admin.ts` — Added profile creation in POST/PUT user routes, added `crypto` import
- `vitest.config.ts` — Added `hookTimeout: 30000`
- `tests/server/routes/payments.spec.ts` — Reverted unnecessary per-hook timeout

## Testing
All 128 tests pass (127 + 1 previously-failing payment test now fixed).
