# Task Summary: Database Schema & Models

**Date:** 2026-06-15
**Status:** Completed

## What Was Done

### 1. Database Configuration
- Created [`src/server/database/config/database.ts`](../../src/server/database/config/database.ts) — Sequelize connection (PostgreSQL prod / SQLite dev)
- Created [`src/server/database/config/database.config.cjs`](../../src/server/database/config/database.config.cjs) — CJS config for `sequelize-cli` (ESM compat)
- Created [`.sequelizerc`](../../.sequelizerc) — points to the CJS config file
- Added npm scripts: `db:migrate`, `db:migrate:undo`, `db:seed`, `db:seed:undo`, `db:reset`

### 2. All Database Models (22 models)
Created [`src/server/database/models/index.ts`](../../src/server/database/models/index.ts) with all models:

| Category | Models |
|----------|--------|
| **User & Auth** | `User`, `AgentProfile`, `ClientProfile`, `RefreshToken`, `PasswordResetToken`, `EmailVerificationToken` |
| **Mission** | `Mission`, `RecurrentMissionConfig`, `MissionAttachment` |
| **Messaging** | `Conversation`, `Message`, `MessageAttachment` |
| **Payment** | `Payment`, `PlatformCredit`, `CreditTransaction`, `Invoice` |
| **Subscription** | `SubscriptionPlan`, `Subscription`, `SubscriptionInvoice` |
| **Dispute** | `Dispute`, `DisputeMessage` |
| **Notification** | `Notification` |

All associations defined (belongsTo, hasMany, hasOne).

### 3. Migration
- Created [`src/server/database/migrations/20260614000000-initial-schema.cjs`](../../src/server/database/migrations/20260614000000-initial-schema.cjs) — creates all 22 tables
- Added indexes on frequently queried columns (userId, missionId, status, etc.)
- Foreign key constraints with ON DELETE CASCADE
- ENUM types for all status fields
- Successfully tested: `pnpm db:migrate` ✓

### 4. Seeders
- Created [`src/server/database/seeders/20260614000000-subscription-plans.cjs`](../../src/server/database/seeders/20260614000000-subscription-plans.cjs) — 3 tiers: Small Business ($29), Professional ($99), Enterprise ($499)
- Successfully tested: `pnpm db:seed` ✓

## Problems & Solutions

| Problem | Solution |
|---------|----------|
| ESM (`"type": "module"`) breaks `require()` in config/migration files | Used `.cjs` extension for all CLI-facing files |
| `sequelize-cli` ignores `modelsPath`/`migrationsPath` in config | Passed paths via CLI flags in npm scripts |
| Missing `sqlite3` dependency | User installed it manually |

## Files Created
- `src/server/database/config/database.ts` — TS connection config
- `src/server/database/config/database.config.cjs` — CJS CLI config
- `src/server/database/models/index.ts` — All 22 models + associations
- `src/server/database/migrations/20260614000000-initial-schema.cjs` — Initial migration
- `src/server/database/seeders/20260614000000-subscription-plans.cjs` — Plan seeder
- `.sequelizerc` — Sequelize CLI config pointer

## Files Modified
- `package.json` — Added DB scripts (`db:migrate`, `db:seed`, `db:reset`, etc.)

## Remaining TODOs (Section 2)
- Demo agent/client user seeder (requires bcrypt for password hashing)
- Supported currencies seeder

## Verification
- `pnpm db:migrate` — ✓ migration ran successfully
- `pnpm db:seed` — ✓ seeder ran successfully
- `pnpm run test` — ✓ 1 test passed (no regressions)
