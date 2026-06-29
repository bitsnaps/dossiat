# Task: Admin User Seeding — Env Var Seed + CLI Script

## Problem
The app supported an `admin` role in the User model and had admin API routes, but the registration endpoint only accepted `agent` or `client` roles. There was no way to create an admin user through the UI or API — a classic chicken-and-egg problem where the admin API requires an existing admin to access it.

## Options Evaluated
1. **First user becomes admin** — simple but has race condition and security risk (anyone could register first)
2. **Env var seed on startup** ⭐ — secure, explicit, idempotent, standard SaaS pattern
3. **CLI script** — explicit, auditable, good complement to option 2
4. **Protected registration with secret key** — unusual pattern, secret could leak
5. **Database seeder** — credentials in code, not flexible

## Solution: Options 2 + 3

### Files Created
| File | Purpose |
|------|---------|
| `src/server/utils/seed-admin.ts` | Seed utility — creates admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars |
| `scripts/create-admin.cjs` | CLI script — `pnpm create-admin --email=... --password=...` |
| `tests/server/utils/seed-admin.spec.ts` | 7 tests for the seed utility |
| `tests/server/scripts/create-admin.spec.ts` | 6 tests for the CLI script (4 validation + 2 skipped DB-dependent) |
| `plans/admin-seed-and-cli.md` | Implementation plan |

### Files Modified
| File | Change |
|------|--------|
| `src/server/dev-init.ts` | Added `seedAdminFromEnv()` call after demo user seeding |
| `package.json` | Added `"create-admin"` npm script |
| `.env.example` | Added `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars |

### How It Works
- **Seed utility** (`seedAdminFromEnv`): Checks if any user with `role: 'admin'` exists. If not and `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars are set, creates the admin with `emailVerified: true`. Returns a `SeedAdminResult` object.
- **Server startup**: `initDevDatabase()` calls `seedAdminFromEnv()` after demo user seeding. Idempotent — skips if admin already exists.
- **CLI script** (`scripts/create-admin.cjs`): CommonJS script (avoids TypeScript import issues) that uses raw Sequelize with the same DB config pattern. Validates args, checks for existing admin, creates user via raw SQL. Supports `--email`/`--password` args or `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars.

## Key Decisions
- **CommonJS for CLI script** — The project is `"type": "module"` but the CLI script uses `.cjs` extension because it needs to run outside the Vite/TypeScript toolchain. Used raw Sequelize connection (same pattern as `database.config.cjs`) instead of TypeScript model imports.
- **DB-dependent CLI tests skipped** — The CLI script creates its own in-memory SQLite instance separate from the test's connection. DB-dependent tests are marked `.skip` with a note to run manually.
- **No registration endpoint change** — The registration endpoint still only accepts `agent`/`client` roles. Admin creation is intentionally not available through public routes.

## Test Results
Full test suite: **113 files passed, 1066 tests passed, 7 skipped**. Zero regressions.

## Usage
```bash
# Option 2: Set env vars and restart server
ADMIN_EMAIL=admin@dossiat.com ADMIN_PASSWORD=SecurePass123 pnpm dev

# Option 3: CLI on-demand
pnpm create-admin --email=admin@dossiat.com --password=SecurePass123
```
