---
name: Fix "Please install pg package manually" error on Netlify
description: Fixed pg module not being bundled in Netlify serverless functions, causing registration and DB operations to fail in production
type: project
---

**Date:** 2026-06-27

**Problem:** After deploying to Netlify, all registration and database operations failed with `{"errorType":"Error","errorMessage":"Please install pg package manually"}`.

**Root cause:** The `pg` and `pg-hstore` packages are loaded dynamically by Sequelize via `require('pg')` at runtime, but esbuild (Netlify's bundler) cannot detect these dynamic imports. Without explicit side-effect imports in the Netlify function entry points, esbuild strips `pg` from the bundle, making it unavailable at runtime.

**Changes applied:**

1. **`netlify/functions/api.ts`** — Rewrote entry point to:
   - Add `import 'pg'` and `import 'pg-hstore'` (force esbuild to include packages)
   - Add `import 'dotenv/config'` (load env vars early)
   - Use `await import('@/server/index')` instead of static import (guarantees pg is loaded before Sequelize)
   - Import `handle` from `hono/netlify` and export config with `path: '/api/*'`

2. **`netlify/functions/scheduler.ts`** — Added `import 'pg'` and `import 'pg-hstore'` at the top (dotenv/config was already present)

**Pre-existing configuration (no changes needed):**
- `netlify.toml` already had `external_node_modules` for pg and related packages
- `package.json` already declared `pg` (^8.21.0) and `pg-hstore` (^2.3.4) as dependencies
- `.env.prod` already had correct production DB configuration (DB_DIALECT=postgres, Neon connection string)
- `.env` had correct local dev config (DB_DIALECT=sqlite)
- `src/server/database/config/database.ts` already handled postgres vs sqlite switching based on NODE_ENV

**Why:** esbuild only statically analyzes `import`/`require` statements. Sequelize's internal `require('pg')` is invisible to esbuild, so pg must be explicitly imported as a side effect in each Netlify function entry point to ensure it's available at runtime.

**How to apply:** Every Netlify function that uses Sequelize must have `import 'pg'` and `import 'pg-hstore'` at the top, and should use dynamic `await import()` for the app module to guarantee load order.
