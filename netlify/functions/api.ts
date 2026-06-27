/**
 * api.ts — Netlify Functions adapter
 *
 * This is the ONLY Netlify-specific file. It loads env vars and
 * wraps the platform-agnostic Hono app from src/server/index.ts.
 *
 * IMPORTANT: Static imports are hoisted, so we use dynamic import()
 * to guarantee that pg is available before Sequelize tries to load it.
 */
import 'dotenv/config'
import { handle } from 'hono/netlify'

// Force esbuild to include pg in the bundle — Sequelize loads it dynamically
import 'pg'
import 'pg-hstore'

// Dynamic import ensures the app only loads AFTER pg is available
const { default: app } = await import('@/server/index')

export default handle(app)

export const config = {
  path: '/api/*',
}
