import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import sequelize from '@/server/database/config/database'
import '@/server/database/models'
import { User, Notification, EmailVerificationToken, RefreshToken, PasswordResetToken, AgentProfile, ClientProfile } from '@/server/database/models'
import { seedAdminFromEnv } from '@/server/utils/seed-admin'

const ADMIN_EMAIL = 'seed-test-admin@test.com'
const ADMIN_PASSWORD = 'Admin1234!'

beforeAll(async () => {
  await sequelize.sync({ force: true })
})

afterEach(async () => {
  // Clean up test data
  await Notification.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  await ClientProfile.destroy({ where: {} })
  await User.destroy({ where: {} })

  // Reset env vars
  delete process.env.ADMIN_EMAIL
  delete process.env.ADMIN_PASSWORD
})

describe('seedAdminFromEnv', { timeout: 15_000 }, () => {
  it('creates admin when env vars are set and no admin exists', async () => {
    process.env.ADMIN_EMAIL = ADMIN_EMAIL
    process.env.ADMIN_PASSWORD = ADMIN_PASSWORD

    const result = await seedAdminFromEnv()

    expect(result.created).toBe(true)
    expect(result.email).toBe(ADMIN_EMAIL)

    const admin = await User.findOne({ where: { email: ADMIN_EMAIL } })
    expect(admin).not.toBeNull()
    expect(admin!.role).toBe('admin')
    expect(admin!.emailVerified).toBe(true)
  })

  it('skips when admin already exists', async () => {
    // Create an existing admin
    const bcrypt = await import('bcryptjs')
    await User.create({
      email: 'existing-admin@test.com',
      passwordHash: await bcrypt.hash('Password123!', 12),
      firstName: 'Existing',
      lastName: 'Admin',
      role: 'admin',
      emailVerified: true,
    })

    process.env.ADMIN_EMAIL = ADMIN_EMAIL
    process.env.ADMIN_PASSWORD = ADMIN_PASSWORD

    const result = await seedAdminFromEnv()

    expect(result.created).toBe(false)

    // Verify the new email was NOT created
    const newAdmin = await User.findOne({ where: { email: ADMIN_EMAIL } })
    expect(newAdmin).toBeNull()
  })

  it('skips when env vars are not set', async () => {
    // Ensure env vars are deleted
    delete process.env.ADMIN_EMAIL
    delete process.env.ADMIN_PASSWORD

    const result = await seedAdminFromEnv()

    expect(result.created).toBe(false)
    expect(result.error).toContain('ADMIN_EMAIL')
  })

  it('skips when only ADMIN_EMAIL is set', async () => {
    process.env.ADMIN_EMAIL = ADMIN_EMAIL
    delete process.env.ADMIN_PASSWORD

    const result = await seedAdminFromEnv()

    expect(result.created).toBe(false)
  })

  it('skips when only ADMIN_PASSWORD is set', async () => {
    delete process.env.ADMIN_EMAIL
    process.env.ADMIN_PASSWORD = ADMIN_PASSWORD

    const result = await seedAdminFromEnv()

    expect(result.created).toBe(false)
  })

  it('rejects short password', async () => {
    process.env.ADMIN_EMAIL = ADMIN_EMAIL
    process.env.ADMIN_PASSWORD = 'short'

    const result = await seedAdminFromEnv()

    expect(result.created).toBe(false)
    expect(result.error).toContain('at least')
  })

  it('is idempotent when called multiple times', async () => {
    process.env.ADMIN_EMAIL = ADMIN_EMAIL
    process.env.ADMIN_PASSWORD = ADMIN_PASSWORD

    const result1 = await seedAdminFromEnv()
    expect(result1.created).toBe(true)

    const result2 = await seedAdminFromEnv()
    expect(result2.created).toBe(false)

    // Verify only one admin was created
    const admins = await User.findAll({ where: { role: 'admin' } })
    expect(admins.length).toBe(1)
  })
})
