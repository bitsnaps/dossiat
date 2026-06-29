---
name: Fix Netlify deployment — pg bundling, SSL, env vars, and DB migration
description: Resolved a chain of deployment issues preventing the app from working on Netlify with PostgreSQL (Neon)
type: project
---

**Date:** 2026-06-27 → 2026-06-28

## Problems Faced (in order)

### 1. "Please install sqlite3 package manually"
- **Root cause:** `DB_DIALECT` was set to `postgresql` (invalid, should be `postgres`) and `NODE_ENV` was not set to `production`
- **Fix:** Set correct env vars in Netlify (`NODE_ENV=production`, `DB_DIALECT=postgres`)

### 2. "Please install pg package manually"
- **Root cause:** Sequelize loads `pg` and `pg-hstore` dynamically via `require('pg')`, which esbuild cannot detect during bundling
- **Fix:** Added side-effect imports (`import 'pg'`, `import 'pg-hstore'`) in both [`netlify/functions/api.ts`](netlify/functions/api.ts) and [`netlify/functions/scheduler.ts`](netlify/functions/scheduler.ts), plus dynamic `await import('@/server/index')` for correct load order

### 3. pnpm symlink layout issue
- **Root cause:** pnpm's default symlink linker caused packages to be in `.pnpm/` instead of flat `node_modules/`
- **Fix:** Created [`.npmrc`](.npmrc) with `node-linker=hoisted`

### 4. `ECONNREFUSED 0.0.0.0:5432`
- **Root cause:** `DB_HOST` was `undefined` at runtime (missing env var or typo in key name)
- **Fix:** Added `PG*` env var fallbacks in [`database.ts`](src/server/database/config/database.ts) and diagnostic logging

### 5. `password authentication failed for user ''`
- **Root cause:** `DB_USER` env var was missing in Netlify
- **Fix:** Added the missing `DB_USER` env var in Netlify dashboard

### 6. `connection is insecure (try using sslmode=require)`
- **Root cause:** Neon requires SSL connections, but [`database.config.cjs`](src/server/database/config/database.config.cjs) (used by Sequelize CLI for migrations) had no `dialectOptions.ssl` config
- **Fix:** Added `dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }` to the production config in [`database.config.cjs`](src/server/database/config/database.config.cjs)

### 7. "relation 'users' does not exist"
- **Root cause:** Database tables were not created — migrations had never been run against the production Neon database
- **Fix:** Ran `pnpm db:migrate` and `pnpm db:seed` against the production database

### 8. "relation 'subscription_plans' does not exist" (during seeding)
- **Root cause:** Stale `SequelizeMeta` record — a previous partial migration left the record but no actual tables
- **Fix:** Dropped `SequelizeMeta` table in Neon SQL console, then re-ran migrations

### 9. Netlify deploy blocked by secret scanner
- **Root cause:** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) contained example values that matched Netlify's secret detection patterns
- **Fix:** Replaced all examples with generic placeholders.

## Files Modified

| File | Changes |
|------|---------|
| [`netlify/functions/api.ts`](netlify/functions/api.ts) | Rewrote entry point: side-effect imports for pg/pg-hstore, dynamic app import, `hono/netlify` adapter |
| [`netlify/functions/scheduler.ts`](netlify/functions/scheduler.ts) | Added `import 'pg'` and `import 'pg-hstore'` |
| [`src/server/database/config/database.ts`](src/server/database/config/database.ts) | Added SSL dialectOptions, PG* env var fallbacks, diagnostic logging |
| [`src/server/database/config/database.config.cjs`](src/server/database/config/database.config.cjs) | Added SSL dialectOptions, PG* env var fallbacks for Sequelize CLI |
| [`src/server/middleware/errorHandler.ts`](src/server/middleware/errorHandler.ts) | Added `console.error` logging for production debugging |
| [`.npmrc`](.npmrc) | Created with `node-linker=hoisted` for pnpm compatibility with Netlify |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Sanitized example values to avoid triggering Netlify secret scanner |

## Key Lessons

1. **esbuild + dynamic requires:** esbuild only sees static imports. When a library (like Sequelize) does `require('pg')` internally, esbuild can't detect it. You must add side-effect imports in each function entry point.

2. **Neon + SSL:** Neon databases require `sslmode=require`. Always add `dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }` in Sequelize config for Neon.

3. **pnpm + Netlify:** pnpm's default symlink layout breaks esbuild's `external_node_modules`. Use `.npmrc` with `node-linker=hoisted`.

4. **Netlify secret scanner:** Netlify scans committed files for patterns that look like secrets (Neon hostnames, database usernames, etc.). Use generic placeholders in docs.

5. **Sequelize CLI vs runtime config:** The Sequelize CLI uses `database.config.cjs`, not `database.ts`. Both must have matching SSL/dialect settings.

6. **Stale SequelizeMeta:** If `db:migrate` says "already up to date" but tables don't exist, drop the `SequelizeMeta` table and re-run.
