import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
})

config.global.plugins = [i18n]

// Server (Node) test files share an in-memory SQLite database (see
// `src/server/database/config/database.ts` when NODE_ENV=test). Each test file
// runs in its own isolated in-memory database instance, so the schema must be
// (re)created before any spec touches the tables.
//
// Dynamically import the DB only when running under the Node test environment
// so component/router/composable specs (jsdom) don't pay the cost of loading
// sqlite3 + sequelize, and don't get a spurious in-memory database synced.
if (process.env.NODE_ENV === 'test' && typeof window === 'undefined') {
  const { default: sequelize } = await import('@/server/database/config/database')
  // Importing the models registers them on the sequelize instance.
  await import('@/server/database/models')
  // Recreate tables fresh for each test file. In-memory SQLite is fast enough
  // that `force: true` is the cleanest way to guarantee isolation.
  await sequelize.sync({ force: true })
}
