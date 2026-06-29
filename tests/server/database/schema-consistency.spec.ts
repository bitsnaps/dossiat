import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  User,
  AgentProfile,
  ClientProfile,
  RefreshToken,
  PasswordResetToken,
  EmailVerificationToken,
  Mission,
  RecurrentMissionConfig,
  MissionAttachment,
  Conversation,
  Message,
  MessageAttachment,
  Payment,
  PlatformCredit,
  CreditTransaction,
  Invoice,
  SubscriptionPlan,
  Subscription,
  SubscriptionInvoice,
  Dispute,
  DisputeMessage,
  Notification,
} from '@/server/database/models'
import sequelize from '@/server/database/config/database'

/**
 * This test suite verifies that model definitions are consistent with the database schema.
 * 
 * The root cause of the original bug was that models with `timestamps: true` (inherited from
 * the global Sequelize config) tried to write `updated_at` to tables that don't have that column
 * in the migration. This caused a 500 error on registration in production but passed in tests
 * because tests use `sequelize.sync({ force: true })` which creates columns from model definitions.
 * 
 * These tests prevent regression by validating each model's timestamp configuration.
 */

describe('Schema Consistency', { timeout: 30_000 }, () => {
  beforeAll(async () => {
    await sequelize.authenticate()
    await sequelize.sync()
  })

  describe('Model timestamp configurations match migration schema', () => {
    const modelsWithBothTimestamps = [
      { name: 'User', model: User },
      { name: 'AgentProfile', model: AgentProfile },
      { name: 'ClientProfile', model: ClientProfile },
      { name: 'Mission', model: Mission },
      { name: 'RecurrentMissionConfig', model: RecurrentMissionConfig },
      { name: 'Conversation', model: Conversation },
      { name: 'SubscriptionPlan', model: SubscriptionPlan },
      { name: 'Subscription', model: Subscription },
      { name: 'Dispute', model: Dispute },
    ]

    for (const { name, model } of modelsWithBothTimestamps) {
      it(`${name} has both createdAt and updatedAt`, () => {
        const options = model.options
        expect(options.timestamps).not.toBe(false)
        expect(options.updatedAt).not.toBe(false)
      })
    }

    const modelsWithOnlyCreatedAt = [
      { name: 'RefreshToken', model: RefreshToken },
      { name: 'PasswordResetToken', model: PasswordResetToken },
      { name: 'EmailVerificationToken', model: EmailVerificationToken },
      { name: 'MissionAttachment', model: MissionAttachment },
      { name: 'Message', model: Message },
      { name: 'Payment', model: Payment },
      { name: 'CreditTransaction', model: CreditTransaction },
      { name: 'Invoice', model: Invoice },
      { name: 'SubscriptionInvoice', model: SubscriptionInvoice },
      { name: 'DisputeMessage', model: DisputeMessage },
      { name: 'Notification', model: Notification },
    ]

    for (const { name, model } of modelsWithOnlyCreatedAt) {
      it(`${name} has createdAt but NOT updatedAt (migration lacks updated_at)`, () => {
        const options = model.options
        expect(options.updatedAt).toBe(false)
      })
    }

    const modelsWithNoTimestamps = [
      { name: 'MessageAttachment', model: MessageAttachment },
    ]

    for (const { name, model } of modelsWithNoTimestamps) {
      it(`${name} has no timestamps at all`, () => {
        const options = model.options
        expect(options.timestamps).toBe(false)
      })
    }

    const modelsWithOnlyUpdatedAt = [
      { name: 'PlatformCredit', model: PlatformCredit },
    ]

    for (const { name, model } of modelsWithOnlyUpdatedAt) {
      it(`${name} has updatedAt but NOT createdAt`, () => {
        const options = model.options
        expect(options.createdAt).toBe(false)
        expect(options.updatedAt).not.toBe(false)
      })
    }
  })

  describe('CRITICAL: Token models can create records without updated_at errors', () => {
    let testUserId: number

    beforeAll(async () => {
      const user = await User.create({
        email: `schema-test-${Date.now()}@test.com`,
        passwordHash: 'hashed',
        firstName: 'Schema',
        lastName: 'Test',
        role: 'client',
      })
      testUserId = user.id
    })

    afterAll(async () => {
      await EmailVerificationToken.destroy({ where: { userId: testUserId } })
      await PasswordResetToken.destroy({ where: { userId: testUserId } })
      await RefreshToken.destroy({ where: { userId: testUserId } })
      await User.destroy({ where: { id: testUserId } })
    })

    it('EmailVerificationToken.create() does not reference updated_at', async () => {
      const token = await EmailVerificationToken.create({
        userId: testUserId,
        token: `test-verify-${Date.now()}`,
        expiresAt: new Date(Date.now() + 86400000),
      })
      expect(token.id).toBeDefined()
      expect(token.createdAt).toBeDefined()
      await token.destroy()
    })

    it('PasswordResetToken.create() does not reference updated_at', async () => {
      const token = await PasswordResetToken.create({
        userId: testUserId,
        token: `test-reset-${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600000),
      })
      expect(token.id).toBeDefined()
      expect(token.createdAt).toBeDefined()
      await token.destroy()
    })

    it('RefreshToken.create() does not reference updated_at', async () => {
      const token = await RefreshToken.create({
        userId: testUserId,
        token: `test-refresh-${Date.now()}`,
        expiresAt: new Date(Date.now() + 604800000),
      })
      expect(token.id).toBeDefined()
      expect(token.createdAt).toBeDefined()
      await token.destroy()
    })
  })
})
