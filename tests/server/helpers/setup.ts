import sequelize from '@/server/database/config/database'

export async function setupTestDb() {
  // Sync all models (create tables if they don't exist)
  await sequelize.sync({ force: true })
}

export async function teardownTestDb() {
  await sequelize.close()
}

export { sequelize as getTestSequelize }
