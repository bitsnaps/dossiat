import { describe, it, expect, beforeAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, ClientProfile, Mission, RefreshToken, Notification, EmailVerificationToken, PasswordResetToken, Conversation } from '@/server/database/models'
import { generateAccessToken } from '@/server/utils/jwt'

let agentToken: string
let agentId: number
let clientToken: string
let clientId: number
let otherClientToken: string
let otherClientId: number
let otherAgentToken: string
let otherAgentId: number

const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`

beforeAll(async () => {
  await Notification.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await Conversation.destroy({ where: {} })
  await Mission.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })

  // Register an agent
  const agentRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `network-agent-${stamp}@test.com`,
      password: 'Password123!',
      firstName: 'Network',
      lastName: 'Agent',
      role: 'agent',
    }),
  })
  const agentBody = await agentRes.json()
  agentToken = agentBody.data.accessToken
  agentId = agentBody.data.id

  // Register a client (will have a mission with the agent)
  const clientRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `network-client-${stamp}@test.com`,
      password: 'Password123!',
      firstName: 'Network',
      lastName: 'Client',
      role: 'client',
    }),
  })
  const clientBody = await clientRes.json()
  clientToken = clientBody.data.accessToken
  clientId = clientBody.data.id

  // Register another client (NO mission with the agent — should NOT appear)
  const otherClientRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `other-client-${stamp}@test.com`,
      password: 'Password123!',
      firstName: 'Other',
      lastName: 'Client',
      role: 'client',
    }),
  })
  const otherClientBody = await otherClientRes.json()
  otherClientToken = otherClientBody.data.accessToken
  otherClientId = otherClientBody.data.id

  // Register another agent (NO mission with the client — should NOT appear)
  const otherAgentRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `other-agent-${stamp}@test.com`,
      password: 'Password123!',
      firstName: 'Other',
      lastName: 'Agent',
      role: 'agent',
    }),
  })
  const otherAgentBody = await otherAgentRes.json()
  otherAgentToken = otherAgentBody.data.accessToken
  otherAgentId = otherAgentBody.data.id

  // Create a mission linking the agent and the client (establishes the network)
  await Mission.create({
    agentId,
    clientId,
    title: 'Network link mission',
    status: 'draft',
    type: 'one_time',
    pricingType: 'fixed',
    agreedAmount: 100,
    currency: 'USD',
    agreedChecklist: [],
  } as any)
  await Conversation.create({ missionId: (await Mission.findOne({ where: { title: 'Network link mission' } }))!.id } as any)
})

describe('Network Endpoint (Private Network Model)', () => {
  it('GET /api/users/network - requires authentication', async () => {
    const res = await app.request('/api/users/network')
    expect(res.status).toBe(401)
  })

  it('GET /api/users/network?role=client - agent sees only clients with existing missions', async () => {
    const res = await app.request('/api/users/network?role=client', {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    // Should include the linked client
    expect(body.data.some((u: any) => u.id === clientId)).toBe(true)
    // Should NOT include the unlinked client
    expect(body.data.some((u: any) => u.id === otherClientId)).toBe(false)
    // Response shape
    const found = body.data.find((u: any) => u.id === clientId)
    expect(found).toHaveProperty('firstName')
    expect(found).toHaveProperty('lastName')
    expect(found).toHaveProperty('email')
  })

  it('GET /api/users/network?role=agent - client sees only agents with existing missions', async () => {
    const res = await app.request('/api/users/network?role=agent', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    // Should include the linked agent
    expect(body.data.some((u: any) => u.id === agentId)).toBe(true)
    // Should NOT include the unlinked agent
    expect(body.data.some((u: any) => u.id === otherAgentId)).toBe(false)
  })

  it('GET /api/users/network?role=client - agent with no missions returns empty array', async () => {
    const res = await app.request('/api/users/network?role=client', {
      headers: { Authorization: `Bearer ${otherAgentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toEqual([])
  })

  it('GET /api/users/network?role=agent - client with no missions returns empty array', async () => {
    const res = await app.request('/api/users/network?role=agent', {
      headers: { Authorization: `Bearer ${otherClientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toEqual([])
  })
})

describe('User by ID Endpoint', () => {
  it('GET /api/users/:id - requires authentication', async () => {
    const res = await app.request(`/api/users/${agentId}`)
    expect(res.status).toBe(401)
  })

  it('GET /api/users/:id - returns minimal public fields for a valid user', async () => {
    const res = await app.request(`/api/users/${agentId}`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe(agentId)
    expect(body.data.firstName).toBe('Network')
    expect(body.data.lastName).toBe('Agent')
    expect(body.data.role).toBe('agent')
    // Should NOT expose sensitive fields
    expect(body.data).not.toHaveProperty('email')
    expect(body.data).not.toHaveProperty('passwordHash')
  })

  it('GET /api/users/:id - returns 404 for non-existent id', async () => {
    const res = await app.request('/api/users/99999', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.success).toBe(false)
  })

  it('GET /api/users/:id - non-numeric id returns 404 (does not shadow other routes)', async () => {
    const res = await app.request('/api/users/not-a-number', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    expect(res.status).toBe(404)
  })
})
