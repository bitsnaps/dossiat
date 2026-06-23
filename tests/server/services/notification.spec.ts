import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { User, AgentProfile, ClientProfile, RefreshToken, Notification, EmailVerificationToken, PasswordResetToken } from '@/server/database/models'
import { createNotification, bulkCreateNotifications } from '@/server/services/notification'

let testUserId: number
let testUserId2: number

beforeAll(async () => {
  await Notification.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  // await ClientProfile.destroy({ where: {} })
  // await User.destroy({ where: {} })

  const user1 = await User.create({
    email: `notif-agent-${Date.now()}@test.com`,
    passwordHash: 'hashed',
    firstName: 'Notif',
    lastName: 'Agent',
    role: 'agent',
  })
  testUserId = user1.id

  const user2 = await User.create({
    email: `notif-client-${Date.now()}@test.com`,
    passwordHash: 'hashed',
    firstName: 'Notif',
    lastName: 'Client',
    role: 'client',
  })
  testUserId2 = user2.id
})

afterAll(async () => {
  await Notification.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  // await ClientProfile.destroy({ where: {} })
  // await User.destroy({ where: {} })
})

describe('Notification Service', () => {
  describe('createNotification', () => {
    it('creates a notification with all fields', async () => {
      const notification = await createNotification(
        testUserId,
        'mission.created',
        'New Mission',
        'You have a new mission assigned to you',
        { missionId: 42 }
      )

      expect(notification).toBeTruthy()
      expect(notification.userId).toBe(testUserId)
      expect(notification.type).toBe('mission.created')
      expect(notification.title).toBe('New Mission')
      expect(notification.body).toBe('You have a new mission assigned to you')
      expect(notification.data).toEqual({ missionId: 42 })
      expect(notification.readAt).toBeFalsy()
    })

    it('creates a notification without data field', async () => {
      const notification = await createNotification(
        testUserId,
        'message.received',
        'New Message',
        'You have a new message'
      )

      expect(notification).toBeTruthy()
      expect(notification.type).toBe('message.received')
      expect(notification.data).toEqual({})
    })

    it('logs error and returns null when creation fails', async () => {
      // Pass invalid userId (non-existent FK)
      const notification = await createNotification(
        999999,
        'mission.created',
        'Title',
        'Body'
      )

      // Should not throw, should return null
      expect(notification).toBeNull()
    })
  })

  describe('bulkCreateNotifications', () => {
    it('creates notifications for multiple users', async () => {
      const notifications = await bulkCreateNotifications(
        [testUserId, testUserId2],
        'payment.confirmed',
        'Payment Confirmed',
        'A payment has been confirmed',
        { paymentId: 10 }
      )

      expect(notifications).toHaveLength(2)
      expect(notifications[0].userId).toBe(testUserId)
      expect(notifications[1].userId).toBe(testUserId2)
      expect(notifications[0].type).toBe('payment.confirmed')
    })

    it('creates notifications with empty data by default', async () => {
      const notifications = await bulkCreateNotifications(
        [testUserId],
        'dispute.resolved',
        'Dispute Resolved',
        'Your dispute has been resolved'
      )

      expect(notifications).toHaveLength(1)
      expect(notifications[0].data).toEqual({})
    })

    it('returns empty array when no user IDs provided', async () => {
      const notifications = await bulkCreateNotifications([], 'mission.created', 'Title', 'Body')
      expect(notifications).toHaveLength(0)
    })
  })
})
