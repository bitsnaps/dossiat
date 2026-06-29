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
let agentEmail: string
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
  agentEmail = agent.email
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

  describe('POST /api/admin/users', () => {
    it('creates a new user', async () => {
      const email = `new-user-${Date.now()}@test.com`
      const res = await app.request('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          email,
          firstName: 'New',
          lastName: 'User',
          role: 'client',
          password: 'SecurePass123!',
        }),
      })
      const body = await res.json()

      expect(res.status).toBe(201)
      expect(body.success).toBe(true)
      expect(body.data.email).toBe(email)
      expect(body.data.firstName).toBe('New')
      expect(body.data.lastName).toBe('User')
      expect(body.data.role).toBe('client')
      expect(body.data).not.toHaveProperty('passwordHash')
      expect(body.data.emailVerified).toBe(false)
    })

    it('rejects creation without required fields', async () => {
      const res = await app.request('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ email: 'test@test.com' }),
      })

      expect(res.status).toBe(422)
    })

    it('rejects creation with invalid role', async () => {
      const res = await app.request('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          email: `invalid-role-${Date.now()}@test.com`,
          firstName: 'Test',
          lastName: 'User',
          role: 'superadmin',
          password: 'Pass123!',
        }),
      })

      expect(res.status).toBe(422)
    })

    it('rejects creation with duplicate email', async () => {
      const dupEmail = `dup-${Date.now()}@test.com`
      // Create a user first
      await app.request('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          email: dupEmail,
          firstName: 'Dup',
          lastName: 'First',
          role: 'client',
          password: 'Pass123!',
        }),
      })

      // Try to create another with same email
      const res = await app.request('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          email: dupEmail,
          firstName: 'Dup',
          lastName: 'Second',
          role: 'client',
          password: 'Pass123!',
        }),
      })

      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

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

  describe('PATCH /api/admin/users/:id/deactivate', () => {
    it('soft-deactivates a user', async () => {
      const passwordHash = await bcrypt.hash('Temp123!', 12)
      const tempUser = await User.create({
        email: `temp-deactivate-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Temp',
        lastName: 'Deactivate',
        role: 'client',
        emailVerified: true,
      })

      const res = await app.request(`/api/admin/users/${tempUser.id}/deactivate`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.emailVerified).toBe(false)

      // Verify in DB
      const check = await User.findByPk(tempUser.id)
      expect(check!.emailVerified).toBe(false)

      await tempUser.destroy()
    })

    it('returns 404 for non-existent user', async () => {
      const res = await app.request('/api/admin/users/999999/deactivate', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/admin/users/:id/activate', () => {
    it('reactivates a deactivated user', async () => {
      const passwordHash = await bcrypt.hash('Temp123!', 12)
      const tempUser = await User.create({
        email: `temp-activate-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Temp',
        lastName: 'Activate',
        role: 'agent',
        emailVerified: false,
      })

      const res = await app.request(`/api/admin/users/${tempUser.id}/activate`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.emailVerified).toBe(true)

      // Verify in DB
      const check = await User.findByPk(tempUser.id)
      expect(check!.emailVerified).toBe(true)

      await tempUser.destroy()
    })

    it('returns 404 for non-existent user', async () => {
      const res = await app.request('/api/admin/users/999999/activate', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/admin/users/:id', () => {
    it('hard-deletes a user from the database', async () => {
      const passwordHash = await bcrypt.hash('Temp123!', 12)
      const tempUser = await User.create({
        email: `temp-harddelete-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Temp',
        lastName: 'HardDelete',
        role: 'client',
        emailVerified: true,
      })
      const tempId = tempUser.id

      const res = await app.request(`/api/admin/users/${tempId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)

      // Verify user no longer exists in DB
      const check = await User.findByPk(tempId)
      expect(check).toBeNull()
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
