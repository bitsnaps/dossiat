import bcrypt from 'bcryptjs'
import { User } from '@/server/database/models'

const MIN_PASSWORD_LENGTH = 8

export interface SeedAdminResult {
  created: boolean
  email?: string
  error?: string
}

/**
 * Seeds an admin user from ADMIN_EMAIL and ADMIN_PASSWORD env vars.
 * Idempotent — skips if an admin already exists.
 *
 * @returns {SeedAdminResult} Whether an admin was created, skipped, or errored.
 */
export async function seedAdminFromEnv(): Promise<SeedAdminResult> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD

  // If env vars are not set, skip silently
  if (!email || !password) {
    return { created: false, error: 'ADMIN_EMAIL and/or ADMIN_PASSWORD not set' }
  }

  // Validate password length
  if (password.length < MIN_PASSWORD_LENGTH) {
    const msg = `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`
    console.warn(`[seed-admin] ${msg}`)
    return { created: false, error: msg }
  }

  // Check if admin already exists
  const existingAdmin = await User.findOne({ where: { role: 'admin' } })
  if (existingAdmin) {
    return { created: false }
  }

  // Create admin user
  const passwordHash = await bcrypt.hash(password, 12)
  const admin = await User.create({
    email,
    passwordHash,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    emailVerified: true,
  })

  console.log(`[seed-admin] Admin user created: ${admin.email}`)
  return { created: true, email: admin.email }
}
