# Fix Failing Tests Summary

## Problem
7 test files were failing (4 suite-level + 12 individual test failures) out of 22 total test files.

## Root Causes & Fixes

### 1. jose@6 + jsdom incompatibility (10 test failures across 5 files)
**Files:** `auth.spec.ts`, `roleGuard.spec.ts`, `auth routes`, `messages`, `missions`, `payments`, `subscriptions`

`jose@6.2.3` requires a native `Uint8Array` from Node.js. The `jsdom` environment polyfills `TextEncoder`, producing a non-standard `Uint8Array` that fails `instanceof` checks in `jose`'s `FlattenedSign` → `CompactSign` → `SignJWT.sign()` chain.

**Fix:** Added `environmentMatchGlobs` to `vitest.config.ts` to run all `tests/server/**` files in the `node` environment instead of `jsdom`.

### 2. Race conditions on shared SQLite database (seeders test failure)
**File:** `src/server/database/seeders/helpers/demo-users.ts`

`createDemoUsers()` used `User.create()` which throws `SequelizeUniqueConstraintError` when test files run in parallel and demo users already exist.

**Fix:** Changed to `User.findOrCreate()` and wrapped profile/mission creation in existence checks, making the function idempotent.

### 3. Cross-test-file state dependency (auth refresh test)
**File:** `tests/server/routes/auth.spec.ts`

The refresh token test relied on a user created in a previous test, but other test files destroy all users in `beforeAll`.

**Fix:** Made the test self-contained (register + login within the same test).

### 4. Test timeout (auth logout test)
**File:** `tests/server/routes/auth.spec.ts`

Tests doing register+login+logout+refresh with bcrypt hashing (cost 12) exceeded the default 5s timeout.

**Fix:** Added `{ timeout: 30_000 }` to the `describe('Auth Routes', ...)` block.

### 5. Parallel test file execution
**File:** `vitest.config.ts`

Server tests share a single SQLite database file. Parallel execution caused race conditions.

**Fix:** Added `fileParallelism: false` to vitest config.

## Result
All 22 test files pass with 214 tests.

## Files Modified
- `vitest.config.ts` — environment globs + sequential execution
- `tests/server/routes/auth.spec.ts` — self-contained refresh test + timeout
- `src/server/database/seeders/helpers/demo-users.ts` — idempotent createDemoUsers
