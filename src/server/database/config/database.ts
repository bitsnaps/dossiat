import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

let sequelize: Sequelize

if (isTest) {
  // Tests run against an in-memory SQLite database for speed and isolation.
  // `DB_STORAGE` is intentionally ignored here so a developer's `dev.sqlite` never leaks
  // stale schema/seed data into the test run.
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  })
} else if (isProduction && process.env.DB_DIALECT !== 'sqlite') {
  // Support both DB_* and Neon's PG* env var names
  const host = process.env.DB_HOST || process.env.PGHOST
  const port = Number(process.env.DB_PORT || process.env.PGPORT) || 5432
  const database = process.env.DB_NAME || process.env.PGDATABASE
  const username = process.env.DB_USER || process.env.PGUSER
  const password = process.env.DB_PASSWORD || process.env.PGPASSWORD

  console.log('[DB Config]', { host: host ? '***' : 'MISSING', port, database: database ? '***' : 'MISSING', username: username ? '***' : 'MISSING', password: password ? '***' : 'MISSING' })

  sequelize = new Sequelize(database!, username!, password!, {
      host,
      port,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      define: {
        timestamps: true,
        underscored: true,
      },
    }
  )
} else {
  const storage = process.env.DB_STORAGE || './dev.sqlite'
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  })
}

export default sequelize
