# Section 11 — Documentation

> Plan for completing the pending documentation tasks in [`docs/TODO.md`](../docs/TODO.md) Section 11.

---

## Context

Section 11 of the TODO list has 6 items, of which only the deployment guide is done. The remaining 5 are documentation deliverables. No source code changes are required — this is a docs-only task. Per the user's instruction, tests will not be run since no code is touched.

### Pending items (from [`docs/TODO.md`](../docs/TODO.md:478-486))

- [ ] Write comprehensive API documentation (endpoints, request/response formats, authentication)
- [ ] Write developer setup guide (local development, environment variables, database setup)
- [x] Write deployment guide — `docs/DEPLOYMENT.md` (already done)
- [ ] Update any outdated information in `AGENTS.md` if needed.
- [ ] Write user guide / help center content for Agents and Clients
- [ ] Document the platform fee calculation logic for transparency

---

## Deliverables

All new files go in the [`docs/`](../docs/) directory. Existing references in [`AGENTS.md`](../AGENTS.md) and [`ARCHITECTURE.md`](../ARCHITECTURE.md) will be used as source material — no duplication, cross-link instead.

### 1. `docs/API.md` — Comprehensive API Documentation

Single source of truth for the REST API. Generated from the route files in [`src/server/routes/`](../src/server/routes/).

**Structure:**
- Overview: base URL (`/api`), versioning note, content type (`application/json`)
- Authentication: JWT access + refresh token flow, `Authorization: Bearer <token>` header, token refresh endpoint, role guards (agent/client/admin)
- Standardized response format: `successResponse`, `errorResponse`, `paginatedResponse` shapes (from [`apiResponse.ts`](../src/server/utils/apiResponse.ts))
- Error codes table
- Endpoint reference grouped by module (matching [`src/server/index.ts`](../src/server/index.ts) mount order):
  - Auth (`/api/auth`)
  - Users & Profiles (`/api/users`, `/api/agents`, `/api/clients`)
  - Missions (`/api/missions`)
  - Recurrence (`/api/missions/:id/recurrence`)
  - Messaging (`/api/missions/:id/messages`, `/api/messages`)
  - Payments (`/api/missions/:id/payments`, `/api/payments`, `/api/agents/me/credits`)
  - Stripe (`/api/payments/stripe/*`) — marked stubbed
  - PayPal (`/api/payments/paypal/*`) — marked stubbed
  - Subscriptions (`/api/subscriptions`)
  - Disputes (`/api/disputes`)
  - Notifications (`/api/notifications`)
  - Admin (`/api/admin/*`)
  - Health (`/api/health`)
- Each endpoint entry: method, path, auth requirement, role, request body/params, success response, error cases
- Mermaid sequence diagram for the cash payment confirmation flow (reuse from [`ARCHITECTURE.md`](../ARCHITECTURE.md))

**Source of truth:** Read each route file in [`src/server/routes/`](../src/server/routes/) to extract exact paths, methods, validation schemas, and role guards. Do not invent endpoints.

### 2. `docs/DEVELOPMENT.md` — Developer Setup Guide

Local development onboarding. Complements [`docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) (which covers production).

**Structure:**
- Prerequisites: Node 20, pnpm, OS notes (macOS/Linux/Windows)
- Clone & install: `pnpm install`
- Environment setup: `cp .env.example .env`, explanation of each variable group (DB, JWT, encryption, Stripe/PayPal, SMTP, admin bootstrap, VITE_* dev login prefill) — cross-link to [`.env.example`](../.env.example)
- Database setup:
  - Dev default: SQLite (no external DB needed), `DB_STORAGE=./dev.sqlite`
  - Optional PostgreSQL: how to switch `DB_DIALECT=postgres` and configure `DB_*`
  - Migrations: `pnpm db:migrate`, `pnpm db:migrate:undo`
  - Seeders: `pnpm db:seed` (subscription plans, demo users, currencies), `pnpm db:seed:undo`
  - Full reset: `pnpm db:reset`
- Running the app: `pnpm dev` (Vite dev server + Hono API via vite-plugin), default ports, API base URL
- Creating an admin user: `pnpm create-admin --email=... --password=...` (cross-link [`scripts/create-admin.cjs`](../scripts/create-admin.cjs)) and `ADMIN_EMAIL`/`ADMIN_PASSWORD` env auto-bootstrap
- Testing: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`, SQLite in-memory for backend tests
- Type checking / linting: `pnpm lint` (vue-tsc)
- i18n sync: `pnpm i18n:sync`, `pnpm i18n:sync:fix` (cross-link [`scripts/sync-i18n.mjs`](../scripts/sync-i18n.mjs))
- Project structure overview: brief, cross-link [`ARCHITECTURE.md`](../ARCHITECTURE.md)
- Common scripts table (from [`package.json`](../package.json) `scripts`)
- Troubleshooting section (port conflicts, migration errors, SQLite vs Postgres)

### 3. `AGENTS.md` — Review & Update

Audit [`AGENTS.md`](../AGENTS.md) against the current state of the codebase. Known gaps to verify and fix:

- **Documentation References** section (lines 45-50) only lists `docs/TODO.md` and `ARCHITECTURE.md`. Add references to the new docs: `docs/API.md`, `docs/DEVELOPMENT.md`, `docs/USER_GUIDE.md`, `docs/FEE_CALCULATION.md`, and the existing `docs/DEPLOYMENT.md`, `docs/UI.md`, `docs/PRD-v0.md`.
- Verify the tech stack table is still accurate (it is — matches [`ARCHITECTURE.md`](../ARCHITECTURE.md)).
- No other structural changes expected; keep edits minimal and surgical.

### 4. `docs/USER_GUIDE.md` — User Guide / Help Center

End-user documentation for Agents and Clients (not developers). Plain language, role-based sections.

**Structure:**
- Introduction: what Dossiat is, who it's for (agent vs client roles)
- Getting started:
  - Register an account (role selection, ToS acceptance)
  - Verify email
  - Log in
- **For Agents:**
  - Complete agent profile setup (specialties, accepted client types, bio, photo, currency)
  - Share invite link (`uniqueInviteSlug`) — how clients find you
  - Create missions (one-time and recurrent)
  - Mission agreement workflow (checklist acceptance by both parties)
  - Track mission status (timeline)
  - Upload proof-of-work attachments
  - Messaging clients
  - Payments: recording cash/bank payments, dual-party confirmation, platform credits, invoices
  - Subscriptions (client-side concept — agents don't subscribe)
  - Disputes: initiating and reconciling
- **For Clients:**
  - Discover agents (via invite link or agent discovery search)
  - Accept/agree to missions
  - Track mission progress
  - Make payments (cash/bank/Stripe/PayPal)
  - Subscriptions: choose a plan, upgrade/downgrade, cancel, billing history
  - Messaging agents
  - Disputes: initiating and reconciling
- **For Both:**
  - Notifications (bell icon, mark as read)
  - Account settings (profile, password, notification preferences, appearance)
  - Language switching (EN/FR/AR with RTL support for Arabic)
- FAQ section
- Glossary (mission, recurrent mission, platform fee, platform credit, dispute, subscription plan)

### 5. `docs/FEE_CALCULATION.md` — Platform Fee Logic

Transparent documentation of the fee model, derived from [`src/server/services/payment/feeCalculator.ts`](../src/server/services/payment/feeCalculator.ts:1) and the Payment System Architecture section of [`ARCHITECTURE.md`](../ARCHITECTURE.md:151).

**Structure:**
- Overview: Dossiat charges a platform fee on agent labor; gateway fees pass through
- Constants table (from [`feeCalculator.ts`](../src/server/services/payment/feeCalculator.ts:9-12)):
  - `GATEWAY_FEE_RATE` = 2.9%
  - `GATEWAY_FEE_FIXED` = $0.30
  - `PLATFORM_FEE_RATE` = 1%
  - `PLATFORM_FEE_MINIMUM` = $1.00
- Fee calculation by payment method:
  - Cash / Bank Transfer: gateway fee = $0; platform fee = max(amount × 1%, $1); net = amount − platformFee
  - Stripe / PayPal: gateway fee = amount × 2.9% + $0.30; platform fee = max((amount − gatewayFee) × 1%, $1); net = amount − platformFee − gatewayFee
- Rounding rules: all amounts rounded to 2 decimal places (cents) via `Math.round(x * 100) / 100`
- Worked examples table: 4-5 example amounts (e.g., $50, $100, $500, $1000) × method, showing gatewayFee, platformFee, net
- Fee collection:
  - Cash/bank: deducted from agent [`PlatformCredit`](../src/server/database/models/index.ts) balance on dual-party confirmation; if insufficient, outstanding fee tracked for billing cycle invoice
  - Stripe/PayPal: handled by gateway automatically (platform fee still recorded for invoicing)
- Mermaid diagram of the calculation order
- Reference to implementation: [`feeCalculator.ts`](../src/server/services/payment/feeCalculator.ts:1)

### 6. Update `docs/TODO.md`

After all docs are written, check off the 5 completed items in Section 11 (lines 480-486 of [`docs/TODO.md`](../docs/TODO.md)). The deployment guide item (line 482) is already checked.

---

## Execution Order

1. `docs/FEE_CALCULATION.md` (smallest, well-defined source)
2. `docs/API.md` (largest; requires reading all route files)
3. `docs/DEVELOPMENT.md`
4. `docs/USER_GUIDE.md`
5. `AGENTS.md` update (surgical edit to Documentation References section)
6. `docs/TODO.md` — check off Section 11 items

---

## Constraints

- **Docs only** — no source code changes, no test execution (per user instruction: "Don't run tests if the code is not touched")
- **No secrets** — use placeholders like `<YOUR_KEY_HERE>` per AGENTS.md rules
- **Cross-link, don't duplicate** — reference [`ARCHITECTURE.md`](../ARCHITECTURE.md) and [`docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) instead of repeating their content
- **Accuracy** — extract real endpoints/schemas from route files; do not invent
- All markdown links to files use relative paths from the docs file location
