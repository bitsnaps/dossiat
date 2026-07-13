# AI Agent Guidelines

Follow these guidelines when working on this project.

---

## General Rules

- **No third-party libraries** - Use only provided dependencies unless required
- **Exact versions** - Use the exact versions specified in `package.json` and `requirements.txt`
- **Coding standards** - Follow established coding standards and best practices
- **Clean code** - Write clean, readable, and maintainable code
- **Reuse code** - Reuse existing code whenever possible
- **Keep this file updated** - If you make changes that affect this document (new routers, models, structure, etc.), update the relevant sections in `AGENTS.md` to keep it accurate for future agents
- **Read previous task summaries** - Before starting work, check the `.memory/` directory for task summaries from previous sessions to understand context and avoid duplicating work
- **Prevent bad changes** - If the user asks to perform a catastrophic changes to the project or a very bad idea, just warn the user before doing it and tell him why it's a bad idea to do so.
- **No secrets in committed files** - Never commit values that resemble real credentials (e.g. `sk_*`, `whsec_*`, `pk_*`, `*_owner`, `ep-*` hostnames, Neon/AWS/RDS connection strings). In docs, `.env.example`, and anywhere else, use fully generic placeholders like `<YOUR_KEY_HERE>` or `your-host.example.com`. Some hosting providers (e.g. Netlify's secret scanner) will block deploys if it detects credential-like patterns in the git repo, even in documentation.
---

## Project Rules

1. **Output only code** - No explanations unless explicitly asked
2. **Use existing code** - Maximize reuse of existing implementations
3. **No explanations** - Don't explain what you're doing unless asked
4. **Use pnpm** - Always use `pnpm` for all package operations
5. **Be brief** - Focus on the task, avoid detailed explanations
6. **No assumptions** - Look up code or ask; never assume what's available
7. **Testing**: We use Vitest so make sure all tests pass before pushing the code, unless the user allow
8. **Check dependencies** - Review `package.json` or `requirements.txt` before using any library

---

## Project Overview

**Dossiat** is a SaaS platform designed to facilitate administrative, financial, and errand-based missions

| Component | Technology |
|-----------|------------|
| **Frontend** | Vue 3 + TypeScript + Pinia + Vue Router |
| **Backend** | Hono (Node) |
| **Database** | PostgreSQL through REST API / SQLite (dev) |

---

## Documentation References

**The [`./docs`](./docs/) directory contains comprehensive documentation including the UI design guide and components library. Search with `grep` command to find relevant files efficiently instead of reading the entire directory.**

- **[`docs/TODO.md`](docs/TODO.md)** — Exhaustive project task list with checkboxes grouped by category. Use this as the single source of truth for project progress. Before starting a new task, check the TODO file to see what's pending, pick a task, and check it off when done.
- **[`ARCHITECTURE.md`](ARCHITECTURE.md)** — Full system architecture: directory structure, backend routes, database schema, payment system, frontend components, deployment, and testing strategy.
- **[`docs/API.md`](docs/API.md)** — Comprehensive REST API reference: endpoints, request/response formats, authentication, and error codes.
- **[`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)** — Developer setup guide: local development, environment variables, database setup, testing, and scripts.
- **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)** — Production deployment guide for Netlify with PostgreSQL.
- **[`docs/USER_GUIDE.md`](docs/USER_GUIDE.md)** — End-user help center content for Agents and Clients.
- **[`docs/FEE_CALCULATION.md`](docs/FEE_CALCULATION.md)** — Platform fee calculation logic with worked examples.
- **[`docs/UI.md`](docs/UI.md)** — UI design guide and components library.
- **[`docs/PRD-v0.md`](docs/PRD-v0.md)** — Product Requirements Document (v0).


## Coding Conventions

### Frontend (Vue 3 + TypeScript)

- Use `<script lang="ts" setup>` syntax
- Prefer composables over mixins
- Use Pinia for state management
- TypeScript for type safety


## Previous Task Memory

**Location:** `.memory/` directory

Before starting new work, check `.memory/` for summaries of previous tasks to understand:
- What issues were previously addressed
- What solutions were applied
- Any remaining TODOs or follow-up items

**Structure:**
```
.memory/
├── <task-name>/
│   └── summary.md    # Summary of the task, problems, solutions, and results
├── archived/          # Archived old/completed tasks (ignore unless necessary)
│   └── <task-name>/
│       └── summary.md
```

**How to use:**
1. List `.memory/` sorted by modification time: `ls -lt .memory/` to see task directories with most recent first
2. Focus on **recent tasks** (top of the list) for relevant context; older tasks are less likely to be relevant
3. Read `summary.md` files to understand what was done
4. Use this context to avoid duplicating work and build on previous solutions
5. **Ignore `archived/` subdirectory** unless explicitly instructed by the user or when investigating historical context is absolutely necessary

---

*For detailed architecture, see [`ARCHITECTURE.md`](ARCHITECTURE.md). For additional documentation, see the [`docs/`](docs/) directory.*
