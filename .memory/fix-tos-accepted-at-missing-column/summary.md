# Fix: `column "tos_accepted_at" does not exist` in production

## Date
2026-07-20

## Symptom
Netlify function logs showed:
```
SequelizeDatabaseError: column "tos_accepted_at" does not exist
sql: SELECT ... "tos_accepted_at" AS "tosAcceptedAt" ... FROM "users" AS "User" WHERE "User"."role" = 'agent';
```
Re-running `.run-migrations.sh` did **not** fix it.

## Root Cause
The production Sequelize CLI config (`src/server/database/config/database.config.cjs`) used `migrationStorage: 'json'`. With JSON storage, sequelize-cli tracks executed migrations in a **local** `sequelize-meta.json` file (in the repo root), NOT in the database.

That local file already listed `20260713000000-add-tos-acceptance.cjs` as executed, so `db:migrate` **skipped** it on every subsequent run — even though the column had never actually been added to the production Postgres `users` table. The migration meta file was lying about DB state.

Confirmed by inspecting production:
- `users` columns were: `id, email, password_hash, first_name, last_name, role, email_verified, created_at, updated_at` (no `tos_accepted_at`).
- No `SequelizeMeta` table existed in the DB.

## Fix Applied

### 1. Immediate — added the missing column to production
Ran directly against Neon Postgres:
```sql
ALTER TABLE "users" ADD COLUMN "tos_accepted_at" DATE NULL;
```
Verified the original failing query then returned 2 agent rows successfully.

### 2. Permanent — switched production migration storage to the database
`src/server/database/config/database.config.cjs` (production block):
- Changed `migrationStorage: 'json'` → `migrationStorage: 'sequelize'`
- Kept `migrationStorageTableName: 'SequelizeMeta'`
- dev/test blocks left as `json` (fine for local SQLite).

Created the `SequelizeMeta` table in production and inserted all 4 already-applied migration names so future `db:migrate` runs know the true DB state:
- `20260614000000-initial-schema.cjs`
- `20260701000000-add-agreement-tracking.cjs`
- `20260706000000-client-initiated-missions.cjs`
- `20260713000000-add-tos-acceptance.cjs`

Verified: `pnpm db:migrate` against production now reports "No migrations were executed, database schema was already up to date."

### 3. Security — removed hardcoded credentials from `.run-migrations.sh`
The script previously contained the real Neon host, user, and password (`npg_...`) in plaintext. Replaced with environment-variable reads (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) and `set -u` guards. Made the script executable.

Note: `.gitignore` already ignores `sequelize-meta.json` (line 52) and `.*.sh` (line 55), so neither file should be tracked going forward — but the credentials should be rotated if they were ever committed to git history.

## Files Changed
- `src/server/database/config/database.config.cjs` — production `migrationStorage: 'sequelize'`
- `.run-migrations.sh` — env-var based, no hardcoded secrets, executable

## Database Changes (production Neon)
- Added column `users.tos_accepted_at` (DATE, nullable)
- Created table `SequelizeMeta` with the 4 executed migration names

## Lessons / Prevention
- Never use `migrationStorage: 'json'` for a shared/production database. Migration state must live **in the database** so it reflects reality regardless of which machine runs the migrations.
- A committed `sequelize-meta.json` claiming migrations are "done" while the DB lacks the schema is a silent failure: `db:migrate` reports success but does nothing.
- Do not commit real credentials in shell scripts; read them from the environment / a git-ignored `.env.prod`.
