# Dossiat — Project Summary

## What Is Dossiat?

**Dossiat** is a SaaS platform that connects independent **Agents** with their **Clients** for administrative, financial, and errand-based missions. Think of it as a workflow and billing tool for freelance fixers — people who handle real-world tasks like paying bills, filing paperwork, managing documents, or running errands on behalf of others.

The platform does **not** hold funds, act as escrow, or take legal responsibility. It is purely an intermediary layer for quoting, task tracking, messaging, and fee collection.

---

## Current State: Early Stage / Pre-Development

This project is in its **very early phase**. Here's what exists and what doesn't:

### What Exists
| File | Purpose |
|------|---------|
| [`docs/PRD-v0.md`](docs/PRD-v0.md) | Full product requirements document — defines the vision, features, pricing tiers, and business rules |
| [`docs/UI_and_landing_page.md`](docs/UI_and_landing_page.md) | Design spec for the landing page — dark theme, gradient accents, section layout |
| [`index.html`](index.html) | A fully built **landing page** — single-file HTML with Bootstrap 5, custom CSS, and vanilla JS animations. No build step needed. |
| [`package.json`](package.json) | Declares all dependencies for both frontend and backend, but **no source code consumes them yet** |
| [`netlify.toml`](netlify.toml) | Deployment config for Netlify — references a `netlify/functions` directory that **does not exist yet** |
| [`.env`](.env) | Environment template — PostgreSQL connection string, JWT secret, encryption key (all placeholder values) |
| [`AGENTS.md`](AGENTS.md) | AI agent coding guidelines and project conventions |

### What Does NOT Exist (Yet)
- **No `src/` directory** — no Vue components, no TypeScript source, no composables, no Pinia stores, no router config
- **No backend code** — no Hono server, no API routes, no middleware
- **No database schema** — no Sequelize models or migrations, despite `sequelize` and `pg` being in dependencies
- **No `netlify/functions/` directory** — the Netlify config references it, but it hasn't been created
- **No tests** — Vitest is configured but no test files exist
- **No `.memory/` task history** — this is a fresh workspace with no prior AI-assisted work

---

## Tech Stack (Planned)

The [`package.json`](package.json) already has all dependencies installed, revealing the intended architecture:

```
┌─────────────────────────────────────────────┐
│              FRONTEND (Vue 3)               │
│  Vue 3 · TypeScript · Pinia · Vue Router    │
│  vue-i18n · VueUse · Bootstrap 5            │
│  Vite (dev server + build)                  │
├─────────────────────────────────────────────┤
│              BACKEND (Hono on Node)          │
│  @hono/node-server · Hono framework         │
│  JWT auth (jose + jsonwebtoken)             │
│  bcryptjs (password hashing)                │
├─────────────────────────────────────────────┤
│              DATABASE (PostgreSQL)           │
│  Sequelize 6 ORM · pg driver               │
│  pg-hstore · sequelize-cli                  │
├─────────────────────────────────────────────┤
│              DEPLOYMENT                     │
│  Netlify (static + serverless functions)    │
│  Scheduler function every 10 minutes        │
└─────────────────────────────────────────────┘
```

---

## Core Features (from PRD)

1. **Agent-led Private Network** — Agents invite clients via unique links; full profiles unlock after registration
2. **Flexible Quoting Engine** — Flat rate or time-based billing, multi-currency support
3. **Recurrent Missions** — Scheduled recurring tasks (daily/weekly/monthly/annual)
4. **Mission Workflow** — Checkbox agreements, step-by-step status tracking, async messaging per mission
5. **Hybrid Payments** — Cash/off-platform with manual confirmation, or online gateways (Stripe/PayPal) with direct fund flow
6. **Smart Platform Fee** — 1% of agent labor fee (minimum $1), calculated on net after gateway fees
7. **Dispute Resolution** — In-platform reconciliation room with structured messaging and audit trail
8. **B2B Subscription Tiers** — Small Business ($29), Professional ($99), Enterprise ($499) with escalating seat limits and features

---

## Deployment Model

The project targets **Netlify** as its deployment platform:
- The landing page ([`index.html`](index.html)) is served as a static file
- Backend logic will run as **Netlify Serverless Functions** (in `netlify/functions/`)
- A **scheduler function** is configured to run every 10 minutes (likely for the recurring missions engine)
- PostgreSQL dependencies are marked as external in [`netlify.toml`](netlify.toml) to avoid esbuild bundling issues

---

## Key Takeaway

This is a **greenfield project** with a well-defined product vision and a complete landing page, but **zero application source code**. The entire Vue frontend, Hono backend, database schema, API routes, and serverless functions remain to be built from scratch. The dependency manifest and deployment config are ready — the next phase is implementing the actual application.
