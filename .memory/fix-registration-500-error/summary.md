# Fix: Registration 500 Error — `updated_at` column missing

## Problem
Production registration endpoint `/api/auth/register` returned 500 Internal Server Error with:
```
column "updated_at" of relation "email_verification_tokens" does not exist
```
The user WAS created in the DB (the `User.create()` call succeeded), but the subsequent `EmailVerificationToken.create()` call failed because Sequelize tried to write to a non-existent `updated_at` column. This prevented the response from reaching the client.

## Root Cause
The global Sequelize config in `src/server/database/config/database.ts` sets `define: { timestamps: true, underscored: true }`, which makes Sequelize manage BOTH `created_at` AND `updated_at` on every model. However, the migration (`20260614000000-initial-schema.cjs`) only created `created_at` for several tables — no `updated_at`.

**Why tests didn't catch it:** Test setup uses `sequelize.sync({ force: true })` which creates tables directly from model definitions (including `updated_at`), so the column always existed in tests. In production, migrations were used instead.

## Affected Tables (had `created_at` but no `updated_at` in migration)
- `refresh_tokens`
- `password_reset_tokens`
- `email_verification_tokens`
- `mission_attachments`
- `messages`
- `payments`
- `credit_transactions`
- `invoices`
- `subscription_invoices`
- `dispute_messages`
- `notifications`

**Special cases:**
- `message_attachments` — no timestamps at all
- `platform_credits` — only `updated_at`, no `created_at`

## Fix Applied

### 1. `src/server/database/models/index.ts` — 13 models corrected
- Added `updatedAt: false` to: `RefreshToken`, `PasswordResetToken`, `EmailVerificationToken`, `MissionAttachment`, `Message`, `Payment`, `CreditTransaction`, `Invoice`, `SubscriptionInvoice`, `DisputeMessage`, `Notification`
- Added `timestamps: false` to: `MessageAttachment`
- Added `createdAt: false` to: `PlatformCredit`

### 2. `tests/server/database/schema-consistency.spec.ts` — NEW file
- 22 tests verifying each model's timestamp config matches the migration schema
- 3 critical tests proving token models can `create()` records without `updated_at` errors
- Uses `sequelize.sync()` to ensure tables exist

### 3. `tests/server/routes/auth.spec.ts` — improved setup
- Added `sequelize.sync()` to `beforeAll` so auth tests don't depend on pre-existing `dev.sqlite`
- Auth registration tests now properly test the full flow including `EmailVerificationToken.create()`

## Test Results
All 37 tests pass (3 pre-existing skips unchanged).

## Key Takeaway
When the global Sequelize config has `timestamps: true`, models that don't have `updated_at` in the migration MUST explicitly set `updatedAt: false` in their `.init()` options. Otherwise Sequelize will attempt to write to a non-existent column on PostgreSQL (which fails) but silently succeeds on SQLite (which is more lenient).
