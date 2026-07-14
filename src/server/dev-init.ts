import sequelize from './database/config/database'
import './database/models' // registers all models
import { User } from './database/models'
import { createDemoUsers } from './database/seeders/helpers/demo-users'
import { seedAdminFromEnv } from './utils/seed-admin'

let initialized = false

export async function initDevDatabase() {
  if (initialized) return
  initialized = true

  // Clean up stale backup tables left over from previous failed sync({ alter: true }) attempts.
  // SQLite's ALTER TABLE workaround creates *_backup tables; if a prior run crashed mid-alter
  // those tables persist and cause UNIQUE constraint errors on the next sync.
  const dialect = sequelize.getDialect()
  if (dialect === 'sqlite') {
    const [backupTables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup'"
    )
    for (const row of backupTables as any[]) {
      await sequelize.query(`DROP TABLE IF EXISTS "${row.name}"`)
      console.log(`[dev-init] Dropped stale backup table: ${row.name}`)
    }
  }

  // Create tables if they don't exist.
  // NOTE: We intentionally avoid `sync({ alter: true })` here. On SQLite, `alter: true`
  // recreates tables by creating a backup, copying rows, then DROPping the original.
  // When the `users` table is dropped, SQLite's foreign-key enforcement fails because
  // many tables (agent_profiles, client_profiles, missions, payments, …) reference it,
  // producing `SQLITE_CONSTRAINT: FOREIGN KEY constraint failed` on `DROP TABLE users`.
  // Schema evolution is handled by the migration files in src/server/database/migrations,
  // so a plain `sync()` (CREATE TABLE IF NOT EXISTS) is sufficient and safe for dev.
  await sequelize.sync()

  // Seed demo users if database is empty
  const userCount = await User.count()
  if (userCount === 0) {
    await createDemoUsers()
    console.log('[dev-init] Demo users created')
  }

  // Seed admin user from env vars (idempotent — skips if admin exists)
  await seedAdminFromEnv()
}
