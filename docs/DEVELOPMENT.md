# Dossiat — Developer Setup Guide

> Local development onboarding for the Dossiat SaaS platform.
>
> For production deployment, see the [Deployment Guide](DEPLOYMENT.md). For architecture, see [`ARCHITECTURE.md`](../ARCHITECTURE.md).

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 20.x | Required (matches Netlify runtime). Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage versions. |
| **pnpm** | latest | Package manager. Install: `npm install -g pnpm` |
| **Git** | any | |

**OS:** macOS, Linux, or Windows. SQLite (dev default) needs no external database.

---

## 1. Clone & Install

```bash
git clone <your-repo-url> dossiat
cd dossiat
pnpm install
```

The lockfile is [`pnpm-lock.yaml`](../pnpm-lock.yaml) — always use `pnpm` (not npm/yarn) to keep it consistent.

---

## 2. Environment Setup

Copy the example env file and edit it:

```bash
cp .env.example .env
```

The full variable reference is in [`.env.example`](../.env.example). Key groups:

### App

| Variable | Dev default | Purpose |
|----------|-------------|---------|
| `NODE_ENV` | `development` | |
| `PORT` | `3000` | API port (used when not behind Vite) |
| `VITE_API_BASE_URL` | `/api` | Frontend API base URL |

### Database

| Variable | Dev default | Purpose |
|----------|-------------|---------|
| `DB_DIALECT` | `sqlite` | `sqlite` (dev) or `postgres` (prod) |
| `DB_STORAGE` | `./dev.sqlite` | SQLite file path (sqlite only) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | — | PostgreSQL connection (prod) |

> **Dev default uses SQLite** — no external database is required to start developing. To use PostgreSQL locally, set `DB_DIALECT=postgres` and fill in the `DB_*` fields.

### Authentication

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Access token signing secret (use a random 64+ char string) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (different random string) |
| `JWT_ACCESS_EXPIRES_IN` | Default `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Default `7d` |
| `ENCRYPTION_KEY` | 32-char key for sensitive data at rest |

### Admin Bootstrap

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAIL` | Auto-creates an admin user on first server startup if set |
| `ADMIN_PASSWORD` | Paired with `ADMIN_EMAIL` |

### Dev Login Pre-fill

| Variable | Purpose |
|----------|---------|
| `VITE_ADMIN_EMAIL` | Pre-fills the admin login form in dev mode (Vite strips at build) |
| `VITE_ADMIN_PASSWORD` | Paired with `VITE_ADMIN_EMAIL` |

> `VITE_*` variables are embedded in the client bundle. **Never put secrets in `VITE_*` variables.** These dev-login helpers are stripped in production builds.

### Payment Gateways (optional for dev)

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PUBLISHABLE_KEY` | Stripe integration |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_MODE` | PayPal integration |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe key |

> If these are unset, the Stripe/PayPal endpoints return `501` (not configured). Cash and bank transfer payments work without them.

### Email (optional for dev)

| Variable | Default | Purpose |
|----------|---------|---------|
| `SMTP_HOST` | `smtp.ethereal.email` | SMTP server |
| `SMTP_PORT` | `587` | |
| `SMTP_USER` / `SMTP_PASS` | — | |
| `EMAIL_FROM` | `noreply@dossiat.com` | |

---

## 3. Database Setup

### Migrations

Run pending migrations (creates all tables):

```bash
pnpm db:migrate
```

Undo the last migration or all migrations:

```bash
pnpm db:migrate:undo      # undo last
# or to undo all then re-run:
pnpm db:reset
```

### Seeders

Seed initial data (subscription plans, demo users, supported currencies):

```bash
pnpm db:seed
```

Undo all seeders:

```bash
pnpm db:seed:undo
```

### Full Reset

Drop all tables, re-run migrations, and reseed in one command:

```bash
pnpm db:reset
```

### Seeded Data

- **Subscription plans** — 3 tiers: Small Business ($29), Professional ($99), Enterprise ($499). See [`20260614000000-subscription-plans.cjs`](../src/server/database/seeders/20260614000000-subscription-plans.cjs).
- **Demo users** — sample agent and client users with missions. See [`demo-users.ts`](../src/server/database/seeders/helpers/demo-users.ts).
- **Currencies** — supported currency list. See [`currencies.ts`](../src/server/database/seeders/helpers/currencies.ts).

---

## 4. Running the App

```bash
pnpm dev
```

This starts the Vite dev server, which serves both the Vue frontend **and** the Hono API via the Vite plugin ([`src/server/vite-plugin.ts`](../src/server/vite-plugin.ts)).

- **Frontend:** http://localhost:5173
- **API:** http://localhost:5173/api (same origin; `VITE_API_BASE_URL=/api`)

The dev server hot-reloads both frontend and backend changes.

---

## 5. Creating an Admin User

Two options:

### Option A — Environment auto-bootstrap

Set in `.env`:

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-strong-password
```

The admin user is created automatically on first server startup.

### Option B — CLI script

```bash
pnpm create-admin --email=admin@example.com --password=your-strong-password
```

See [`scripts/create-admin.cjs`](../scripts/create-admin.cjs).

---

## 6. Testing

Tests use **Vitest** with an SQLite in-memory database for backend tests (no external setup needed).

| Command | Purpose |
|---------|---------|
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Watch mode (re-runs on file change) |
| `pnpm test:coverage` | Run tests with coverage report |

Test locations (see [`ARCHITECTURE.md`](../ARCHITECTURE.md#testing-strategy) for details):

- `tests/components/` — Vue component tests
- `tests/server/routes/` — API endpoint tests
- `tests/server/middleware/` — Middleware tests
- `tests/server/services/` — Business logic tests
- `tests/server/database/` — DB constraint + seeder tests
- `tests/server/utils/` — Utility tests
- `tests/stores/` — Pinia store tests
- `tests/services/` — Frontend service tests
- `tests/router/` — Router tests

---

## 7. Type Checking & Linting

```bash
pnpm lint
```

Runs `vue-tsc --noEmit` for full TypeScript type checking across the project. There is no separate linter configured — type safety is the primary gate.

---

## 8. i18n Sync

Translation files live in [`src/locales/`](../src/locales/) (`en.json`, `fr.json`, `ar.json`).

| Command | Purpose |
|---------|---------|
| `pnpm i18n:sync` | Check that all locales have the same keys (reports missing keys) |
| `pnpm i18n:sync:fix` | Auto-add missing keys from the English reference |

See [`scripts/sync-i18n.mjs`](../scripts/sync-i18n.mjs).

---

## 9. Common Scripts

From [`package.json`](../package.json):

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server (frontend + API) |
| `build` | `vue-tsc -b && vite build` | Type-check then build for production |
| `preview` | `vite preview` | Preview the production build locally |
| `test` | `NODE_ENV=test vitest run` | Run tests once |
| `test:watch` | `NODE_ENV=test vitest watch` | Watch mode tests |
| `test:coverage` | `NODE_ENV=test vitest run --coverage` | Tests with coverage |
| `db:migrate` | `sequelize-cli db:migrate ...` | Run pending migrations |
| `db:migrate:undo` | `sequelize-cli db:migrate:undo:all ...` | Undo all migrations |
| `db:seed` | `sequelize-cli db:seed:all ...` | Run all seeders |
| `db:seed:undo` | `sequelize-cli db:seed:undo:all ...` | Undo all seeders |
| `db:reset` | undo + migrate + seed | Full database reset |
| `i18n:sync` | `node scripts/sync-i18n.mjs` | Validate locale key parity |
| `i18n:sync:fix` | `node scripts/sync-i18n.mjs --fix` | Fix missing locale keys |
| `create-admin` | `node scripts/create-admin.cjs` | Create an admin user |
| `lint` | `vue-tsc --noEmit` | TypeScript type check |

---

## 10. Project Structure

A quick orientation (full details in [`ARCHITECTURE.md`](../ARCHITECTURE.md)):

```
src/
├── server/                  # Backend (Hono)
│   ├── index.ts             # App entry + route mounting
│   ├── database/            # Sequelize config, models, migrations, seeders
│   ├── middleware/           # auth, roleGuard, validation, error, rate limit
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic (payment, billing, notifications)
│   └── utils/               # apiResponse, jwt, dateUtils
├── components/              # Vue components (base, common, layout, mission, messaging)
├── composables/             # Vue composables
├── stores/                  # Pinia stores
├── views/                   # Vue page components
├── router/                  # Vue Router config
├── locales/                 # i18n translations (en, fr, ar)
└── assets/                  # Global CSS
netlify/functions/           # Serverless + scheduled functions
tests/                       # Vitest test suites
```

---

## 11. Troubleshooting

### Port already in use

If `pnpm dev` fails with "port 5173 in use", either stop the other process or change the Vite port in [`vite.config.mts`](../vite.config.mts).

### Migration errors

- **"Database does not exist"** (PostgreSQL): create the database first, then run `pnpm db:migrate`.
- **SQLite locked**: stop the dev server, delete `dev.sqlite`, then `pnpm db:reset`.
- **Migration already applied**: run `pnpm db:migrate:undo` to roll back, or `pnpm db:reset` for a clean slate.

### Switching SQLite → PostgreSQL

1. Set `DB_DIALECT=postgres` and fill in `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` in `.env`
2. Create the PostgreSQL database
3. `pnpm db:migrate && pnpm db:seed`

### Stripe/PayPal endpoints return 501

The gateway keys are not set in `.env`. This is expected for local dev unless you're testing gateway flows. Cash and bank transfer payments work without them.

### Type errors after pulling changes

```bash
pnpm install
pnpm lint
```

### Tests fail with database errors

Backend tests use SQLite in-memory. If you see persistent DB errors, ensure `NODE_ENV=test` is set (the `test` scripts set this automatically).

---

## Related Documentation

- [Architecture](../ARCHITECTURE.md) — system design, database schema, payment system
- [API Reference](API.md) — full endpoint documentation
- [Deployment Guide](DEPLOYMENT.md) — production setup on Netlify
- [Fee Calculation](FEE_CALCULATION.md) — platform fee logic
- [TODO List](TODO.md) — project progress tracker
