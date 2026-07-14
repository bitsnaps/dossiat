import { describe, it, expect, beforeAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, RefreshToken, Notification, EmailVerificationToken, PasswordResetToken } from '@/server/database/models'
import { generateAccessToken } from '@/server/utils/jwt'

let clientToken: string
let agentToken: string
let agentUserId: number
let adminToken: string
let adminUserId: number

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`

beforeAll(async () => {
  await Notification.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })

  // Register an agent and verify email so it appears in discovery
  const agentEmail = `discover-agent-${stamp}@test.com`
  const agentRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: agentEmail,
      password: 'Password123!',
      firstName: 'Diana',
      lastName: 'Prince',
      role: 'agent',
      acceptTerms: true,
    }),
  })
  const agentBody = await agentRes.json()
  agentToken = agentBody.data.accessToken
  agentUserId = agentBody.data.id

  // Verify the agent's email
  await User.update({ emailVerified: true }, { where: { id: agentUserId } })

  // Ensure agent profile has known specialties + slug
  await AgentProfile.update(
    {
      bio: 'Discovery test agent bio',
      specialties: ['Legal', 'Finance'],
      acceptedClientTypes: 'Both',
    },
    { where: { userId: agentUserId } },
  )

  // Register a client
  const clientEmail = `discover-client-${stamp}@test.com`
  const clientRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: clientEmail,
      password: 'Password123!',
      firstName: 'Clark',
      lastName: 'Kent',
      role: 'client',
      acceptTerms: true,
    }),
  })
  const clientBody = await clientRes.json()
  clientToken = clientBody.data.accessToken

  // Create an admin user directly + token
  const bcrypt = (await import('bcryptjs')).default
  const admin = await User.create({
    email: `discover-admin-${stamp}@test.com`,
    passwordHash: await bcrypt.hash('Password123!', 12),
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    emailVerified: true,
  })
  adminUserId = admin.id
  adminToken = await generateAccessToken({ userId: admin.id, email: admin.email, role: 'admin' })
})

describe('Agent Discovery Route', () => {
  it('GET /api/users/agents/discover - requires authentication', async () => {
    const res = await app.request('/api/users/agents/discover')
    expect(res.status).toBe(401)
  })

  it('GET /api/users/agents/discover - rejects agent role (403)', async () => {
    const res = await app.request('/api/users/agents/discover', {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    expect(res.status).toBe(403)
  })

  it('GET /api/users/agents/discover - returns agents for client', async () => {
    const res = await app.request('/api/users/agents/discover', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)

    const found = body.data.find((a: any) => a.id !== undefined)
    expect(found).toBeTruthy()
    expect(found).toHaveProperty('slug')
    expect(found).toHaveProperty('firstName')
    expect(found).toHaveProperty('lastName')
    expect(found).toHaveProperty('bio')
    expect(found).toHaveProperty('specialties')
    expect(found).toHaveProperty('acceptedClientTypes')
    expect(found).toHaveProperty('profilePhotoUrl')
  })

  it('GET /api/users/agents/discover - filters by name (q)', async () => {
    const res = await app.request('/api/users/agents/discover?q=Diana', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.some((a: any) => a.firstName === 'Diana')).toBe(true)
  })

  it('GET /api/users/agents/discover - filters by specialty (q)', async () => {
    const res = await app.request('/api/users/agents/discover?q=Legal', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.some((a: any) => a.specialties.includes('Legal'))).toBe(true)
  })

  it('GET /api/users/agents/discover - filters by clientType', async () => {
    const res = await app.request('/api/users/agents/discover?clientType=Both', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.data.every((a: any) => a.acceptedClientTypes === 'Both')).toBe(true)
  })

  it('GET /api/users/agents/discover - admin with X-View-As-Role: client gets 200', async () => {
    const res = await app.request('/api/users/agents/discover', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'X-View-As-Role': 'client',
      },
    })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('GET /api/users/agents/discover - admin without view-as header gets 403', async () => {
    const res = await app.request('/api/users/agents/discover', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(res.status).toBe(403)
  })
})
