import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, ClientProfile, Mission, Dispute, DisputeMessage, Payment, Notification, EmailVerificationToken, PasswordResetToken, RefreshToken } from '@/server/database/models'
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

    it('updates firstName and lastName', async () => {
      const passwordHash = await bcrypt.hash('Temp123!', 12)
      const tempUser = await User.create({
        email: `temp-name-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'OldFirst',
        lastName: 'OldLast',
        role: 'client',
        emailVerified: false,
      })

      const res = await app.request(`/api/admin/users/${tempUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ firstName: 'NewFirst', lastName: 'NewLast' }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.firstName).toBe('NewFirst')
      expect(body.data.lastName).toBe('NewLast')

      await tempUser.destroy()
    })

    it('updates email and lowercases it', async () => {
      const passwordHash = await bcrypt.hash('Temp123!', 12)
      const tempUser = await User.create({
        email: `temp-email-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Temp',
        lastName: 'Email',
        role: 'client',
        emailVerified: false,
      })

      const newEmail = `UPDATED-${Date.now()}@test.com`
      const res = await app.request(`/api/admin/users/${tempUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ email: newEmail }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.email).toBe(newEmail.toLowerCase())

      await tempUser.destroy()
    })

    it('rejects invalid email format', async () => {
      const res = await app.request(`/api/admin/users/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ email: 'not-an-email' }),
      })

      expect(res.status).toBe(422)
    })

    it('rejects duplicate email', async () => {
      const passwordHash = await bcrypt.hash('Temp123!', 12)
      const tempUser = await User.create({
        email: `temp-dup-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Temp',
        lastName: 'Dup',
        role: 'client',
        emailVerified: false,
      })

      // Try to set email to the agent's email (already taken)
      const res = await app.request(`/api/admin/users/${tempUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ email: agentEmail }),
      })

      expect(res.status).toBe(409)

      await tempUser.destroy()
    })

    it('rejects empty update body', async () => {
      const res = await app.request(`/api/admin/users/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({}),
      })

      expect(res.status).toBe(422)
    })
  })

  describe('PATCH /api/admin/users/:id/reset-password', () => {
    it('resets the password and allows login with new password', async () => {
      const passwordHash = await bcrypt.hash('OldPass123!', 12)
      const tempUser = await User.create({
        email: `temp-reset-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Temp',
        lastName: 'Reset',
        role: 'client',
        emailVerified: true,
      })

      const res = await app.request(`/api/admin/users/${tempUser.id}/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ password: 'NewPass456!' }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).not.toHaveProperty('passwordHash')

      // Verify the new password works
      const updated = await User.findByPk(tempUser.id)
      const valid = await bcrypt.compare('NewPass456!', updated!.passwordHash)
      expect(valid).toBe(true)

      await tempUser.destroy()
    })

    it('rejects password shorter than 8 chars', async () => {
      const passwordHash = await bcrypt.hash('Temp123!', 12)
      const tempUser = await User.create({
        email: `temp-short-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Temp',
        lastName: 'Short',
        role: 'client',
        emailVerified: true,
      })

      const res = await app.request(`/api/admin/users/${tempUser.id}/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ password: 'short' }),
      })

      expect(res.status).toBe(422)

      await tempUser.destroy()
    })

    it('returns 404 for non-existent user', async () => {
      const res = await app.request('/api/admin/users/999999/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ password: 'NewPass456!' }),
      })

      expect(res.status).toBe(404)
    })

    it('invalidates existing refresh tokens', async () => {
      const passwordHash = await bcrypt.hash('Temp123!', 12)
      const tempUser = await User.create({
        email: `temp-tokens-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Temp',
        lastName: 'Tokens',
        role: 'client',
        emailVerified: true,
      })

      // Create a refresh token for the user
      await RefreshToken.create({
        userId: tempUser.id,
        token: 'existing-token-to-invalidate',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })

      const res = await app.request(`/api/admin/users/${tempUser.id}/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ password: 'NewPass456!' }),
      })

      expect(res.status).toBe(200)

      // Verify the refresh token was destroyed
      const remaining = await RefreshToken.findOne({ where: { userId: tempUser.id } })
      expect(remaining).toBeNull()

      await tempUser.destroy()
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

  // ─── Mission CRUD ───

  describe('POST /api/admin/missions', () => {
    it('creates a new mission', async () => {
      const res = await app.request('/api/admin/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          agentId,
          clientId,
          title: 'Admin Created Mission',
          description: 'Created via admin panel',
          type: 'one_time',
          pricingType: 'fixed',
          agreedAmount: 150.00,
          currency: 'USD',
        }),
      })
      const body = await res.json()

      expect(res.status).toBe(201)
      expect(body.success).toBe(true)
      expect(body.data.title).toBe('Admin Created Mission')
      expect(body.data.agentId).toBe(agentId)
      expect(body.data.clientId).toBe(clientId)
      expect(body.data.status).toBe('draft')

      // Cleanup
      await Mission.destroy({ where: { id: body.data.id } })
    })

    it('creates mission with checklist', async () => {
      const res = await app.request('/api/admin/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          agentId,
          clientId,
          title: 'Mission With Checklist',
          type: 'one_time',
          pricingType: 'task_based',
          currency: 'EUR',
          agreedChecklist: ['Task 1', 'Task 2', 'Task 3'],
        }),
      })
      const body = await res.json()

      expect(res.status).toBe(201)
      expect(body.success).toBe(true)
      expect(body.data.agreedChecklist).toEqual(['Task 1', 'Task 2', 'Task 3'])

      await Mission.destroy({ where: { id: body.data.id } })
    })

    it('rejects creation without required fields', async () => {
      const res = await app.request('/api/admin/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ title: 'Missing Fields' }),
      })

      expect(res.status).toBe(422)
    })

    it('rejects creation with invalid agentId', async () => {
      const res = await app.request('/api/admin/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          agentId: 999999,
          clientId,
          title: 'Bad Agent',
          type: 'one_time',
          pricingType: 'fixed',
        }),
      })

      expect(res.status).toBe(400)
    })

    it('rejects creation with invalid type', async () => {
      const res = await app.request('/api/admin/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          agentId,
          clientId,
          title: 'Bad Type',
          type: 'weekly',
          pricingType: 'fixed',
        }),
      })

      expect(res.status).toBe(422)
    })
  })

  describe('PUT /api/admin/missions/:id', () => {
    let testMissionId: number

    beforeAll(async () => {
      const mission = await Mission.create({
        agentId,
        clientId,
        title: 'Mission To Update',
        type: 'one_time',
        pricingType: 'fixed',
        currency: 'USD',
        status: 'draft',
      })
      testMissionId = mission.id
    })

    afterAll(async () => {
      if (testMissionId) {
        await Mission.destroy({ where: { id: testMissionId } })
      }
    })

    it('updates mission fields', async () => {
      const res = await app.request(`/api/admin/missions/${testMissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          title: 'Updated Mission Title',
          description: 'Updated description',
          agreedAmount: 250.00,
        }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.title).toBe('Updated Mission Title')
      expect(body.data.description).toBe('Updated description')
      expect(Number(body.data.agreedAmount)).toBe(250)
    })

    it('returns 404 for non-existent mission', async () => {
      const res = await app.request('/api/admin/missions/999999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ title: 'Nope' }),
      })

      expect(res.status).toBe(404)
    })

    it('rejects invalid type value', async () => {
      const res = await app.request(`/api/admin/missions/${testMissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ type: 'invalid' }),
      })

      expect(res.status).toBe(422)
    })
  })

  describe('DELETE /api/admin/missions/:id', () => {
    it('deletes a mission', async () => {
      const mission = await Mission.create({
        agentId,
        clientId,
        title: 'Mission To Delete',
        type: 'one_time',
        pricingType: 'fixed',
        currency: 'USD',
        status: 'draft',
      })

      const res = await app.request(`/api/admin/missions/${mission.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)

      // Verify mission no longer exists
      const check = await Mission.findByPk(mission.id)
      expect(check).toBeNull()
    })

    it('returns 404 for non-existent mission', async () => {
      const res = await app.request('/api/admin/missions/999999', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(res.status).toBe(404)
    })
  })

  // ─── Payment CRUD ───

  let testPaymentMissionId: number

  beforeAll(async () => {
    // Create a test mission for payment tests
    const mission = await Mission.create({
      agentId,
      clientId,
      title: 'Payment Test Mission',
      type: 'one_time',
      pricingType: 'fixed',
      agreedAmount: 500,
      currency: 'USD',
      status: 'in_progress',
    })
    testPaymentMissionId = mission.id
  })

  afterAll(async () => {
    if (testPaymentMissionId) {
      await Payment.destroy({ where: { missionId: testPaymentMissionId } })
      await Mission.destroy({ where: { id: testPaymentMissionId } })
    }
  })

  describe('POST /api/admin/payments', () => {
    it('creates a payment with auto-calculated fees', async () => {
      const res = await app.request('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          missionId: testPaymentMissionId,
          payerId: clientId,
          payeeId: agentId,
          amount: 100,
          method: 'cash',
          currency: 'USD',
        }),
      })
      const body = await res.json()

      expect(res.status).toBe(201)
      expect(body.success).toBe(true)
      expect(Number(body.data.amount)).toBe(100)
      expect(body.data.method).toBe('cash')
      expect(body.data.status).toBe('pending')
      expect(body.data.payer.id).toBe(clientId)
      expect(body.data.payee.id).toBe(agentId)
      expect(body.data.mission.id).toBe(testPaymentMissionId)
      // Cash has no gateway fee
      expect(Number(body.data.gatewayFee)).toBe(0)
      // Platform fee should be calculated (1% of amount, min $1)
      expect(Number(body.data.platformFee)).toBeGreaterThanOrEqual(1)
      expect(Number(body.data.netAmount)).toBeGreaterThanOrEqual(0)

      // Cleanup
      await Payment.destroy({ where: { id: body.data.id } })
    })

    it('calculates gateway fees for stripe method', async () => {
      const res = await app.request('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          missionId: testPaymentMissionId,
          payerId: clientId,
          payeeId: agentId,
          amount: 100,
          method: 'stripe',
        }),
      })
      const body = await res.json()

      expect(res.status).toBe(201)
      expect(Number(body.data.gatewayFee)).toBeGreaterThan(0)
      expect(Number(body.data.platformFee)).toBeGreaterThanOrEqual(1)
      expect(Number(body.data.netAmount)).toBeLessThan(100)

      await Payment.destroy({ where: { id: body.data.id } })
    })

    it('rejects creation without required fields', async () => {
      const res = await app.request('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ amount: 100 }),
      })

      expect(res.status).toBe(422)
    })

    it('rejects creation with invalid method', async () => {
      const res = await app.request('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          missionId: testPaymentMissionId,
          payerId: clientId,
          payeeId: agentId,
          amount: 100,
          method: 'bitcoin',
        }),
      })

      expect(res.status).toBe(422)
    })

    it('rejects creation with non-existent mission', async () => {
      const res = await app.request('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          missionId: 999999,
          payerId: clientId,
          payeeId: agentId,
          amount: 100,
          method: 'cash',
        }),
      })

      expect(res.status).toBe(404)
    })

    it('rejects creation with non-existent payer', async () => {
      const res = await app.request('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          missionId: testPaymentMissionId,
          payerId: 999999,
          payeeId: agentId,
          amount: 100,
          method: 'cash',
        }),
      })

      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/admin/payments/:id', () => {
    let testPaymentId: number

    beforeAll(async () => {
      const payment = await Payment.create({
        missionId: testPaymentMissionId,
        payerId: clientId,
        payeeId: agentId,
        amount: 200,
        currency: 'USD',
        method: 'cash',
        platformFee: 2,
        gatewayFee: 0,
        netAmount: 198,
        status: 'pending',
      })
      testPaymentId = payment.id
    })

    afterAll(async () => {
      if (testPaymentId) {
        await Payment.destroy({ where: { id: testPaymentId } })
      }
    })

    it('updates payment fields', async () => {
      const res = await app.request(`/api/admin/payments/${testPaymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          amount: 300,
          currency: 'EUR',
        }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.currency).toBe('EUR')
      expect(Number(body.data.amount)).toBe(300)
    })

    it('recalculates fees on amount change', async () => {
      const res = await app.request(`/api/admin/payments/${testPaymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ amount: 500, method: 'cash' }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(Number(body.data.gatewayFee)).toBe(0)
      expect(Number(body.data.platformFee)).toBeGreaterThanOrEqual(1)
    })

    it('returns 404 for non-existent payment', async () => {
      const res = await app.request('/api/admin/payments/999999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ amount: 100 }),
      })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/admin/payments/:id', () => {
    it('deletes a payment', async () => {
      const payment = await Payment.create({
        missionId: testPaymentMissionId,
        payerId: clientId,
        payeeId: agentId,
        amount: 50,
        currency: 'USD',
        method: 'cash',
        platformFee: 1,
        gatewayFee: 0,
        netAmount: 49,
        status: 'pending',
      })

      const res = await app.request(`/api/admin/payments/${payment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)

      const check = await Payment.findByPk(payment.id)
      expect(check).toBeNull()
    })

    it('returns 404 for non-existent payment', async () => {
      const res = await app.request('/api/admin/payments/999999', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      expect(res.status).toBe(404)
    })
  })

  describe('PATCH /api/admin/payments/:id/status', () => {
    let testStatusPaymentId: number

    beforeAll(async () => {
      const payment = await Payment.create({
        missionId: testPaymentMissionId,
        payerId: clientId,
        payeeId: agentId,
        amount: 75,
        currency: 'USD',
        method: 'bank_transfer',
        platformFee: 1,
        gatewayFee: 0,
        netAmount: 74,
        status: 'pending',
      })
      testStatusPaymentId = payment.id
    })

    afterAll(async () => {
      if (testStatusPaymentId) {
        await Payment.destroy({ where: { id: testStatusPaymentId } })
      }
    })

    it('updates payment status', async () => {
      const res = await app.request(`/api/admin/payments/${testStatusPaymentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'confirmed' }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.status).toBe('confirmed')
      expect(body.data.confirmedAt).not.toBeNull()
    })

    it('rejects invalid status', async () => {
      const res = await app.request(`/api/admin/payments/${testStatusPaymentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      expect(res.status).toBe(422)
    })

    it('returns 404 for non-existent payment', async () => {
      const res = await app.request('/api/admin/payments/999999/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'confirmed' }),
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

  // ─── Dispute CRUD ───

  describe('Dispute CRUD', () => {
    let testDisputeMissionId: number
    let testDisputeId: number

    beforeAll(async () => {
      // Create a test mission for dispute tests
      const mission = await Mission.create({
        agentId,
        clientId,
        title: 'Dispute Test Mission',
        type: 'one_time',
        pricingType: 'fixed',
        agreedAmount: 200,
        currency: 'USD',
        status: 'in_progress',
      })
      testDisputeMissionId = mission.id

      // Create a test dispute
      const dispute = await Dispute.create({
        missionId: testDisputeMissionId,
        initiatedBy: clientId,
        reason: 'Work quality not as agreed',
        status: 'open',
      })
      testDisputeId = dispute.id
    })

    afterAll(async () => {
      await DisputeMessage.destroy({ where: { disputeId: testDisputeId } })
      if (testDisputeId) {
        await Dispute.destroy({ where: { id: testDisputeId } })
      }
      if (testDisputeMissionId) {
        await Mission.destroy({ where: { id: testDisputeMissionId } })
      }
    })

    // ─── GET /api/admin/disputes/:id ───

    describe('GET /api/admin/disputes/:id', () => {
      it('returns dispute detail with messages and mission context', async () => {
        const res = await app.request(`/api/admin/disputes/${testDisputeId}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.data.id).toBe(testDisputeId)
        expect(body.data.reason).toBe('Work quality not as agreed')
        expect(body.data.status).toBe('open')
        expect(body.data.mission).toBeDefined()
        expect(body.data.mission.id).toBe(testDisputeMissionId)
        expect(body.data.initiator).toBeDefined()
        expect(body.data.messages).toBeDefined()
        expect(Array.isArray(body.data.messages)).toBe(true)
      })

      it('returns 404 for non-existent dispute', async () => {
        const res = await app.request('/api/admin/disputes/999999', {
          headers: { Authorization: `Bearer ${adminToken}` },
        })

        expect(res.status).toBe(404)
      })

      it('returns 422 for invalid ID', async () => {
        const res = await app.request('/api/admin/disputes/abc', {
          headers: { Authorization: `Bearer ${adminToken}` },
        })

        expect(res.status).toBe(422)
      })
    })

    // ─── POST /api/admin/disputes ───

    describe('POST /api/admin/disputes', () => {
      it('creates dispute with valid data', async () => {
        const res = await app.request('/api/admin/disputes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({
            missionId: testDisputeMissionId,
            initiatedBy: agentId,
            reason: 'Payment not received',
          }),
        })
        const body = await res.json()

        expect(res.status).toBe(201)
        expect(body.success).toBe(true)
        expect(body.data.reason).toBe('Payment not received')
        expect(body.data.status).toBe('open')
        expect(body.data.mission.id).toBe(testDisputeMissionId)
        expect(body.data.initiator.id).toBe(agentId)
        expect(body.data.messages).toEqual([])

        // Cleanup
        await Dispute.destroy({ where: { id: body.data.id } })
      })

      it('returns 422 without required fields', async () => {
        const res = await app.request('/api/admin/disputes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({
            missionId: testDisputeMissionId,
            initiatedBy: agentId,
          }),
        })

        expect(res.status).toBe(422)
      })

      it('returns 404 with non-existent missionId', async () => {
        const res = await app.request('/api/admin/disputes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({
            missionId: 999999,
            initiatedBy: agentId,
            reason: 'Test reason',
          }),
        })

        expect(res.status).toBe(404)
      })

      it('returns 404 with non-existent initiatedBy', async () => {
        const res = await app.request('/api/admin/disputes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({
            missionId: testDisputeMissionId,
            initiatedBy: 999999,
            reason: 'Test reason',
          }),
        })

        expect(res.status).toBe(404)
      })
    })

    // ─── PUT /api/admin/disputes/:id ───

    describe('PUT /api/admin/disputes/:id', () => {
      it('updates dispute reason', async () => {
        const res = await app.request(`/api/admin/disputes/${testDisputeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({
            reason: 'Updated reason: quality is worse than expected',
          }),
        })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.data.reason).toBe('Updated reason: quality is worse than expected')

        // Restore original reason for other tests
        await Dispute.update({ reason: 'Work quality not as agreed' }, { where: { id: testDisputeId } })
      })

      it('returns 404 for non-existent dispute', async () => {
        const res = await app.request('/api/admin/disputes/999999', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({ reason: 'Test' }),
        })

        expect(res.status).toBe(404)
      })

      it('returns 422 when no valid fields provided', async () => {
        const res = await app.request(`/api/admin/disputes/${testDisputeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({}),
        })

        expect(res.status).toBe(422)
      })
    })

    // ─── DELETE /api/admin/disputes/:id ───

    describe('DELETE /api/admin/disputes/:id', () => {
      it('deletes dispute', async () => {
        const dispute = await Dispute.create({
          missionId: testDisputeMissionId,
          initiatedBy: clientId,
          reason: 'Dispute to delete',
          status: 'open',
        })

        const res = await app.request(`/api/admin/disputes/${dispute.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.success).toBe(true)

        // Verify dispute no longer exists
        const check = await Dispute.findByPk(dispute.id)
        expect(check).toBeNull()
      })

      it('returns 404 for non-existent dispute', async () => {
        const res = await app.request('/api/admin/disputes/999999', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` },
        })

        expect(res.status).toBe(404)
      })
    })

    // ─── PUT /api/admin/disputes/:id/resolve ───

    describe('PUT /api/admin/disputes/:id/resolve', () => {
      it('resolves dispute with resolution note', async () => {
        const res = await app.request(`/api/admin/disputes/${testDisputeId}/resolve`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({
            resolution: 'Issue resolved: partial refund issued',
          }),
        })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.data.status).toBe('resolved')
        expect(body.data.resolution).toBe('Issue resolved: partial refund issued')
        expect(body.data.resolvedAt).not.toBeNull()

        // Restore to open for other tests
        await Dispute.update({ status: 'open', resolution: null, resolvedAt: null }, { where: { id: testDisputeId } })
      })

      it('returns 404 for non-existent dispute', async () => {
        const res = await app.request('/api/admin/disputes/999999/resolve', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({ resolution: 'Test' }),
        })

        expect(res.status).toBe(404)
      })

      it('returns 422 without resolution', async () => {
        const res = await app.request(`/api/admin/disputes/${testDisputeId}/resolve`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({}),
        })

        expect(res.status).toBe(422)
      })
    })

    // ─── PUT /api/admin/disputes/:id/escalate ───

    describe('PUT /api/admin/disputes/:id/escalate', () => {
      it('escalates dispute', async () => {
        const res = await app.request(`/api/admin/disputes/${testDisputeId}/escalate`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.data.status).toBe('escalated')

        // Restore to open for other tests
        await Dispute.update({ status: 'open' }, { where: { id: testDisputeId } })
      })

      it('returns 404 for non-existent dispute', async () => {
        const res = await app.request('/api/admin/disputes/999999/escalate', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${adminToken}` },
        })

        expect(res.status).toBe(404)
      })
    })

    // ─── PATCH /api/admin/disputes/:id/status ───

    describe('PATCH /api/admin/disputes/:id/status', () => {
      it('updates dispute status to reconciling', async () => {
        const res = await app.request(`/api/admin/disputes/${testDisputeId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({ status: 'reconciling' }),
        })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.data.status).toBe('reconciling')

        // Restore to open for other tests
        await Dispute.update({ status: 'open' }, { where: { id: testDisputeId } })
      })

      it('returns 422 for invalid status', async () => {
        const res = await app.request(`/api/admin/disputes/${testDisputeId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({ status: 'invalid_status' }),
        })

        expect(res.status).toBe(422)
      })

      it('returns 404 for non-existent dispute', async () => {
        const res = await app.request('/api/admin/disputes/999999/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({ status: 'reconciling' }),
        })

        expect(res.status).toBe(404)
      })
    })

    // ─── POST /api/admin/disputes/:id/messages ───

    describe('POST /api/admin/disputes/:id/messages', () => {
      let createdMessageId: number

      it('sends message in dispute room', async () => {
        const res = await app.request(`/api/admin/disputes/${testDisputeId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({
            content: 'We are reviewing this case.',
          }),
        })
        const body = await res.json()

        expect(res.status).toBe(201)
        expect(body.success).toBe(true)
        expect(body.data.content).toBe('We are reviewing this case.')
        expect(body.data.disputeId).toBe(testDisputeId)
        expect(body.data.senderId).toBe(adminId)
        expect(body.data.sender).toBeDefined()
        expect(body.data.sender.id).toBe(adminId)
        expect(body.data.sender.firstName).toBe('Admin')

        createdMessageId = body.data.id
      })

      it('message persists and is returned in dispute detail', async () => {
        const res = await app.request(`/api/admin/disputes/${testDisputeId}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.data.messages.length).toBeGreaterThanOrEqual(1)
        const msg = body.data.messages.find((m: any) => m.id === createdMessageId)
        expect(msg).toBeDefined()
        expect(msg.content).toBe('We are reviewing this case.')

        // Cleanup
        if (createdMessageId) {
          await DisputeMessage.destroy({ where: { id: createdMessageId } })
        }
      })

      it('returns 422 without content', async () => {
        const res = await app.request(`/api/admin/disputes/${testDisputeId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({}),
        })

        expect(res.status).toBe(422)
      })

      it('returns 404 for non-existent dispute', async () => {
        const res = await app.request('/api/admin/disputes/999999/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
          body: JSON.stringify({ content: 'Test' }),
        })

        expect(res.status).toBe(404)
      })
    })
  })
})
