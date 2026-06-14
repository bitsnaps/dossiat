# Dossiat

A decentralized, geo-independent SaaS platform that connects independent **Agents** with their **Clients** for administrative, financial, and errand-based missions.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 · TypeScript · Pinia · Vue Router · Vite |
| Backend | Hono (Node.js) |
| Database | PostgreSQL (production) / SQLite (dev) |
| Styling | Bootstrap 5 · Bootstrap Icons · Custom dark theme |
| Testing | Vitest · Vue Test Utils |
| Deploy | Netlify (static + serverless functions) |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Type-check and build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
├── src/
│   ├── main.ts              # Entry point
│   ├── App.vue              # Root component
│   ├── router/              # Vue Router config
│   ├── stores/              # Pinia state stores
│   ├── views/               # Page-level components
│   │   └── LandingPage.vue  # Landing page
│   └── assets/              # Global styles
├── tests/                   # Vitest test files
├── docs/                    # Product documentation
├── index.html               # Vite HTML shell
└── vite.config.mts          # Vite + Vitest config
```

## License

MIT
