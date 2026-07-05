# In-Memory SQLite for Tests + Mission Bulk Spec Fix

**Date:** 2025-07-05
**Status:** Completed

## What Was Done

Two related fixes delivered in this session:

1. **Fixed the failing `missions.spec.ts` bulk-route tests** (422-validation tests were returning 403) caused by stale `dev.sqlite` seed data leaking `subscription_plans` rows with `features: {}` (no `csv_import` flag), which short-circuited the Enterprise-tier check before validation ran.
2. **Migrated the test database from the on-disk `./dev.sqlite` to an in-memory SQLite** ("Option A") for speed and isolation, and added the missing schema-sync setup so every server spec gets a fresh empty DB without relying on persisted dev data.

### Files Modified

- `tests/server/routes/missions.spec.ts` — After each `SubscriptionPlan.findOrCreate`, explicitly `update` the `features` JSON so `csv_import` is correct regardless of pre-existing plan rows. (`:254`, `:270`)
- `src/server/database/config/database.ts` — Added a `NODE_ENV === 'test'` branch that uses `storage: ':memory:'` and **ignores `DB_STORAGE`**, so a developer's `dev.sqlite` can never leak stale schema/seed data into the test run. (`:7-23`)
- `package.json` — Prefixed test scripts with `NODE_ENV=test` so the in-memory branch activates: `test`, `test:watch`, `test:coverage`. (`:11-13`)
- `tests/helpers/setup.ts` — Added a guarded, dynamically-imported `sequelize.sync({ force: true })` that runs only under the Node test environment (`process.env.NODE_ENV === 'test' && typeof window === 'undefined'`). This guarantees the in-memory schema exists before any spec touches tables, without paying the sqlite3/sequelize import cost on component (jsdom) specs. (`:14-29`)
- `tests/server/middleware/auth.spec.ts` — Fixed pre-existing JWT_SECRET capture bug: the `secret` was captured at module-import time (before `beforeEach` set `JWT_SECRET='dev-secret'`), causing 7 valid-token tests to fail. Changed `secret` from a constant to a function evaluated at signing time. (`:6`, `:13`)

### Root Cause Analysis

#### Mission bulk spec failures (422 → 403)
- Route `src/server/routes/missions.ts:122-135` checks the Enterprise tier (`subscription.plan.features.csv_import`) **before** the per-mission field validation (`:138-142`).
- The test's `SubscriptionPlan.findOrCreate({ where: { name: 'enterprise' }, defaults: { features: { csv_import: true } } })` never applied `defaults` because the plan already existed in `dev.sqlite` — seeded earlier with `features: '{}'` (confirmed via `sqlite3 dev.sqlite "SELECT features FROM subscription_plans;"` → all `{}`).
- Result: Enterprise check failed → 403 fired before 422 validation for the title/clientId/pricingType tests; the Enterprise-success test also got 403 instead of 201.
- Fix: explicitly `update({ features: { ...plan.features, csv_import: true/false } })` after `findOrCreate`. Test self-contained and deterministic.

#### Why tests were not using in-memory SQLite
- `database.config.cjs:20-33` declares a `test` env with `:memory:`, but that file is **only used by sequelize-cli** (`db:migrate`/`db:seed`), not the app or tests.
- The app and tests import `src/server/database/config/database.ts`, which only branches on `NODE_ENV === 'production'`. Every other env falls into the `else` branch reading `storage = process.env.DB_STORAGE || './dev.sqlite'`.
- `dotenv.config()` loads the root `.env`, which sets `DB_STORAGE=./dev.sqlite`, so tests connected to the same on-disk dev DB as the dev server — leaking stale data and schema drift (`dev-init.ts:28` runs `sync({ alter: true })` on the shared file).

### Why per-file sync was needed
- Each Vitest test file runs in its own isolated in-memory SQLite connection; a `sync()` in file A does not create tables for file B. Several specs previously relied on the persisted `dev.sqlite` schema and only called `sequelize.authenticate()` (or raw `DELETE FROM`) without syncing — these now needed a guaranteed sync before their `beforeAll` touched tables.
- Rather than editing every server spec, the global `tests/helpers/setup.ts` now force-syncs the in-memory DB once per test file, gated to the Node env only.

### Key Design Decisions
- `:memory:` is gated on `NODE_ENV === 'test'` (explicit, set in `package.json` test scripts) — keeps production/dev behavior identical to before.
- `DB_STORAGE` is deliberately **ignored** in test mode to prevent `.env` from accidentally pointing tests at `dev.sqlite`.
- Global setup sync is **dynamic-imported** and guarded by `typeof window === 'undefined'` so component/router/composable (jsdom) specs don't load sqlite3/sequelize or sync a spurious DB.
- `sync({ force: true })` per file gives full isolation between spec files (slightly more work than `sync()`, but in-memory is fast enough and avoids cross-file state pollution).
- Kept the existing dead `tests/server/helpers/setup.ts` (`setupTestDb`) untouched — superseded by the global setup, but not worth removing yet.

### Test Results
- Before: `1 failed | 123 passed`, `7 failed | 1323 passed | 7 skipped` (1237 total) — 7 pre-existing `auth.spec.ts` failures.
- After: `124 passed`, `1330 passed | 7 skipped` (1337 total) — **fully green, 0 failures**.
- The mission bulk spec: 20/20 passing (was 16/20 before session start).
- The 7 `auth.spec.ts` failures were pre-existing (independent of this task) and fixed as a courtesy.

### Verification Commands
- `pnpm test -- tests/server/routes/missions.spec.ts` (20 tests pass)
- `pnpm test -- tests/server/database/{check-constraints,seeders,schema-consistency}.spec.ts` (all pass)
- `pnpm test` (full suite: 124 files, 1330 tests, 7 skipped, 0 failed)

### Notes for Future Agents
- `pnpm db:migrate`/`pnpm db:seed` still use `database.config.cjs` and act on `dev.sqlite` (development env). Do not assume test env touches the file DB.
- If adding a new server spec that needs DB tables, it no longer needs its own `sequelize.sync()` — the global setup handles it — but it still must seed any reference data (plans, etc.) it depends on (see the `missions.spec.ts` plan-feature `update` pattern as a template).
- Server specs that need cross-file shared state will NOT find it — each file gets a fresh in-memory DB. If such sharing is required, reconsider that design (it was never safe under parallelism anyway).
