# Fix Tests, dev-init, and i18n Issues

## Date: 2026-07-14

## Task
Fixed three separate issues: failing test suite, dev-init database error, and missing i18n keys.

## Issues Fixed

### 1. Test Suite Failures (12 suites + 9 tests)
**Root cause:** The `/api/auth/register` route requires `acceptTerms` field, but 13 test files were sending registration requests without it. This caused 422 validation errors, making `body.data` undefined, leading to `Cannot read properties of undefined (reading 'accessToken')`.

**Fix:** Added `acceptTerms: true` to all registration payloads in 13 test files:
- `tests/server/integration/auth-flow.spec.ts`
- `tests/server/integration/dispute-flow.spec.ts`
- `tests/server/integration/mission-lifecycle.spec.ts`
- `tests/server/integration/subscription-flow.spec.ts`
- `tests/server/routes/messages.spec.ts`
- `tests/server/routes/missions.spec.ts`
- `tests/server/routes/payments.spec.ts`
- `tests/server/routes/paypal.spec.ts`
- `tests/server/routes/stripe.spec.ts`
- `tests/server/routes/subscriptions.spec.ts`
- `tests/server/routes/users.avatar.spec.ts`
- `tests/server/routes/users.discover.spec.ts`
- `tests/server/routes/users.network.spec.ts`

### 2. Cannot Delete User / dev-init FK Error
**Root cause:** `dev-init.ts` used `sequelize.sync({ alter: true })`. On SQLite, `alter: true` recreates tables by creating a backup, copying data, then DROPping the original. When the `users` table is dropped, SQLite's FK enforcement fails because many tables reference it.

**Fix:** Changed `await sequelize.sync({ alter: true })` to `await sequelize.sync()` in `src/server/dev-init.ts`. Schema evolution is handled by migrations in `src/server/database/migrations/`.

### 3. Missing i18n Keys
**Root cause:** `StatusBadge.vue` builds key `common.status.mission.${status}`. The `common.status.mission` block was missing `pending` and `confirmed` keys.

**Fix:** Added `"pending": "Pending"` and `"confirmed": "Confirmed"` to `common.status.mission` in:
- `src/locales/en.json` — `"pending": "Pending"`, `"confirmed": "Confirmed"`
- `src/locales/ar.json` — `"pending": "قيد الانتظار"`, `"confirmed": "مؤكد"`
- `src/locales/fr.json` — `"pending": "En attente"`, `"confirmed": "Confirmée"`

## Verification
Full test suite passes: **131 files, 1479 tests passed, 0 failures**.
