import sequelize from './database/config/database'
import './database/models' // registers all models
import { User } from './database/models'
import { createDemoUsers } from './database/seeders/helpers/demo-users'
import { seedAdminFromEnv } from './utils/seed-admin'

let initialized = false

export async function initDevDatabase() {
  if (initialized) return
  initialized = true

  // Create tables if they don't exist (safe for SQLite dev)
  await sequelize.sync({ alter: true })

  // Seed demo users if database is empty
  const userCount = await User.count()
  if (userCount === 0) {
    await createDemoUsers()
    console.log('[dev-init] Demo users created')
  }

  // Seed admin user from env vars (idempotent — skips if admin exists)
  await seedAdminFromEnv()
}
