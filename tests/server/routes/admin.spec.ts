import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, ClientProfile, Mission, Dispute, Payment, Notification, EmailVerificationToken, PasswordResetToken, RefreshToken } from '@/server/database/models'
import { generateAccessToken } from '@/server/utils/jwt'
import bcrypt from 'bcryptjs'

let adminToken: string
let agentToken: string
let clientToken: string
let adminId: number
let agentId: number
let clientId: number

beforeAll(async () => {
  await Notification.destroy({ where: {} })
  await Payment.destroy({ where: {} })
  await Dispute.destroy({ where: {} })
  // await Mission.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  // await ClientProfile.destroy({ where: {} })
  // await User.destroy({ where: {} })

  // Create admin user directly
  const passwordHash = await bcrypt.hash('Admin123!', 12)
  const admin = await User.create({
    email: `admin-test-${Date.now()}@test.com`,
    passwordHash,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    emailVerified: true,
  })
  adminId = admin.id
  adminToken = await generateAccessToken({ userId: admin.id, email: admin.email, role: 'admin' })

  // Create agent directly (avoids generating notifications via register endpoint)
  const agentHash = await bcrypt.hash('Password123!', 12)
  const agent = await User.create({
    email: `agent-admin-${Date.now()}@test.com`,
    passwordHash: agentHash,
    firstName: 'Agent',
    lastName: 'Test',
    role: 'agent',
    emailVerified: true,
  })
  agentId = agent.id
  agentToken = await generateAccessToken({ userId: agent.id, email: agent.email, role: 'agent' })

  // Create client directly
  const clientHash = await bcrypt.hash('Password123!', 12)
  const client = await User.create({
    email: `client-admin-${Date.now()}@test.com`,
    passwordHash: clientHash,
    firstName: 'Client',
    lastName: 'Test',
    role: 'client',
    emailVerified: true,
  })
  clientId = client.id
  clientToken = await generateAccessToken({ userId: client.id, email: client.email, role: 'client' })
})

afterAll(async () => {
  await Notification.destroy({ where: {} })
  await Payment.destroy({ where: {} })
  await Dispute.destroy({ where: {} })
  // await Mission.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  // await ClientProfile.destroy({ where: {} })
  // await User.destroy({ where: {} })
})

describe('Admin Routes', { timeout: 30_000 }, () => {
  // ─── Authentication & Authorization ───

  describe('authentication', () => {
    it('rejects requests without auth token', async () => {
      const res = await app.request('/api/admin/users')
      const body = await res.json()

      expect(res.status).toBe(401)
      expect(body.success).toBe(false)
    })

    it('rejects non-admin users', async () => {
      const res = await app.request('/api/admin/users', {
        headers: { Authorization: `Bearer ${agentToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(403)
      expect(body.success).toBe(false)
    })

    it('rejects client users', async () => {
      const res = await app.request('/api/admin/users', {
        headers: { Authorization: `Bearer ${clientToken}` },
      })

      expect(res.status).toBe(403)
    })

    it('allows admin users', async () => {
      const res = await app.request('/api/admin/users', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(res.status).toBe(200)
    })
  })

  // ─── GET /api/admin/stats ───

  describe('GET /api/admin/stats', () => {
    it('returns platform statistics', async () => {
      const res = await app.request('/api/admin/stats', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('totalUsers')
      expect(body.data).toHaveProperty('totalMissions')
      expect(body.data).toHaveProperty('totalDisputes')
      expect(body.data).toHaveProperty('openDisputes')
      expect(body.data).toHaveProperty('totalRevenue')
      expect(body.data.totalUsers).toBeGreaterThanOrEqual(3) // admin + agent + client
    })
  })

  // ─── User Management ───

  describe('GET /api/admin/users', () => {
    it('returns paginated user list', async () => {
      const res = await app.request('/api/admin/users', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.data.length).toBeGreaterThanOrEqual(3)
      expect(body.meta).toBeDefined()
      expect(body.meta.total).toBeGreaterThanOrEqual(3)
    })

    it('excludes passwordHash from response', async () => {
      const res = await app.request('/api/admin/users', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      body.data.forEach((user: any) => {
        expect(user).not.toHaveProperty('passwordHash')
      })
    })

    it('supports pagination params', async () => {
      const res = await app.request('/api/admin/users?page=1&limit=2', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.data.length).toBeLessThanOrEqual(2)
      expect(body.meta.limit).toBe(2)
    })

    it('supports role filter', async () => {
      const res = await app.request('/api/admin/users?role=agent', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      body.data.forEach((user: any) => {
        expect(user.role).toBe('agent')
      })
    })

    it('supports search by name', async () => {
      const res = await app.request('/api/admin/users?search=Agent', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.data.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('GET /api/admin/users/:id', () => {
    it('returns user detail with profiles', async () => {
      const res = await app.request(`/api/admin/users/${agentId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.id).toBe(agentId)
      expect(body.data).not.toHaveProperty('passwordHash')
    })

    it('returns 404 for non-existent user', async () => {
      const res = await app.request('/api/admin/users/999999', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/admin/users/:id', () => {
    it('updates user role', async () => {
      // Create a temporary user to update
      const passwordHash = await bcrypt.hash('Temp123!', 12)
      const tempUser = await User.create({
        email: `temp-update-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Temp',
        lastName: 'Update',
        role: 'client',
        emailVerified: false,
      })

      const res = await app.request(`/api/admin/users/${tempUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ role: 'agent', emailVerified: true }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.role).toBe('agent')
      expect(body.data.emailVerified).toBe(true)

      await tempUser.destroy()
    })

    it('rejects invalid role', async () => {
      const res = await app.request(`/api/admin/users/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ role: 'superadmin' }),
      })

      expect(res.status).toBe(422)
    })

    it('returns 404 for non-existent user', async () => {
      const res = await app.request('/api/admin/users/999999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ role: 'agent' }),
      })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/admin/users/:id', () => {
    it('deactivates user account', async () => {
      // Create a temporary user to delete
      const passwordHash = await bcrypt.hash('Temp123!', 12)
      const tempUser = await User.create({
        email: `temp-delete-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Temp',
        lastName: 'Delete',
        role: 'client',
        emailVerified: true,
      })

      const res = await app.request(`/api/admin/users/${tempUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)

      // Verify user is soft-deactivated
      const checkRes = await app.request(`/api/admin/users/${tempUser.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const checkBody = await checkRes.json()
      // User should either be gone or marked inactive
      if (checkRes.status === 200) {
        expect(checkBody.data.emailVerified).toBe(false)
      }
    })

    it('returns 404 for non-existent user', async () => {
      const res = await app.request('/api/admin/users/999999', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(res.status).toBe(404)
    })
  })

  // ─── Dispute Management ───

  describe('GET /api/admin/disputes', () => {
    it('returns paginated dispute list', async () => {
      const res = await app.request('/api/admin/disputes', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.meta).toBeDefined()
    })

    it('supports status filter', async () => {
      const res = await app.request('/api/admin/disputes?status=open', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      body.data.forEach((dispute: any) => {
        expect(dispute.status).toBe('open')
      })
    })
  })
})
