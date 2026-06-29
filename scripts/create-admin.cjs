'use strict'

/**
 * create-admin — CLI script to create an admin user.
 *
 * Usage:
 *   node scripts/create-admin.cjs --email=admin@example.com --password=Secret123
 *   node scripts/create-admin.cjs                     # uses ADMIN_EMAIL / ADMIN_PASSWORD env vars
 */

const path = require('path')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })

const Sequelize = require('sequelize')

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {}
  for (const arg of args) {
    const match = arg.match(/^--([a-z_]+)=(.+)$/)
    if (match) {
      parsed[match[1]] = match[2]
    }
  }
  return parsed
}

function createSequelizeInstance() {
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction && process.env.DB_DIALECT !== 'sqlite') {
    const host = process.env.DB_HOST || process.env.PGHOST
    const port = Number(process.env.DB_PORT || process.env.PGPORT) || 5432
    const database = process.env.DB_NAME || process.env.PGDATABASE
    const username = process.env.DB_USER || process.env.PGUSER
    const password = process.env.DB_PASSWORD || process.env.PGPASSWORD

    return new Sequelize(database, username, password, {
      host,
      port,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
      define: { timestamps: true, underscored: true },
    })
  }

  const storage = process.env.DB_STORAGE || './dev.sqlite'
  return new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
    define: { timestamps: true, underscored: true },
  })
}

async function main() {
  const args = parseArgs()
  const email = (args.email || process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const password = args.password || process.env.ADMIN_PASSWORD || ''

  if (!email) {
    console.error('Error: --email is required (or set ADMIN_EMAIL env var)')
    process.exit(1)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Error: Invalid email format')
    process.exit(1)
  }

  if (!password) {
    console.error('Error: --password is required (or set ADMIN_PASSWORD env var)')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters')
    process.exit(1)
  }

  const sequelize = createSequelizeInstance()
  await sequelize.authenticate()

  // Check if admin already exists
  const [admins] = await sequelize.query(
    `SELECT id, email FROM users WHERE role = 'admin' LIMIT 1`
  )
  if (admins.length > 0) {
    console.error(`Error: An admin user already exists (${admins[0].email}). Skipping.`)
    await sequelize.close()
    process.exit(1)
  }

  // Check if email is already taken
  const [existing] = await sequelize.query(
    `SELECT id FROM users WHERE email = :email LIMIT 1`,
    { replacements: { email } }
  )
  if (existing.length > 0) {
    console.error(`Error: Email "${email}" is already registered. Skipping.`)
    await sequelize.close()
    process.exit(1)
  }

  // Create admin user
  const passwordHash = await bcrypt.hash(password, 12)
  const now = new Date()

  const [result] = await sequelize.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified, created_at, updated_at)
     VALUES (:email, :passwordHash, 'Admin', 'User', 'admin', 1, :now, :now)`,
    { replacements: { email, passwordHash, now } }
  )

  console.log(`✅ Admin user created successfully!`)
  console.log(`   Email: ${email}`)
  console.log(`   Role:  admin`)
  console.log(`   ID:    ${result}`)

  await sequelize.close()
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
