import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, ClientProfile, Mission, RefreshToken, Conversation, Notification, EmailVerificationToken, PasswordResetToken } from '@/server/database/models'
import { generateAccessToken } from '@/server/utils/jwt'

let agentToken: string
let clientToken: string
let agentId: number
let clientId: number

beforeAll(async () => {
  await Notification.destroy({ where: {} })
  // await Mission.destroy({ where: {} })
  // await Conversation.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  // await ClientProfile.destroy({ where: {} })
  // await User.destroy({ where: {} })

  // Register agent
  const agentRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `agent-missions-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Agent', lastName: 'Test', role: 'agent' }),
  })
  const agentBody = await agentRes.json()
  agentId = agentBody.data.id
  agentToken = agentBody.data.accessToken

  // Register client
  const clientRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `client-missions-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Client', lastName: 'Test', role: 'client' }),
  })
  const clientBody = await clientRes.json()
  clientId = clientBody.data.id
  clientToken = clientBody.data.accessToken
})

describe('Mission Routes', () => {
  let missionId: number

  it('POST /api/missions - creates a mission as agent', async () => {
    const res = await app.request('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({
        title: 'Test Mission',
        description: 'A test mission',
        clientId,
        pricingType: 'fixed',
        agreedAmount: 500,
        agreedChecklist: ['Task 1', 'Task 2'],
      }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.title).toBe('Test Mission')
    expect(body.data.status).toBe('draft')
    missionId = body.data.id
  })

  it('GET /api/missions - lists missions for agent', async () => {
    const res = await app.request('/api/missions', {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.meta).toBeDefined()
  })

  it('GET /api/missions/:id - gets mission details', async () => {
    const res = await app.request(`/api/missions/${missionId}`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.id).toBe(missionId)
  })

  it('PUT /api/missions/:id - updates mission', async () => {
    const res = await app.request(`/api/missions/${missionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ title: 'Updated Mission' }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.title).toBe('Updated Mission')
  })

  it('PUT /api/missions/:id/status - updates status to pending_agreement', async () => {
    const res = await app.request(`/api/missions/${missionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ status: 'pending_agreement' }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.status).toBe('pending_agreement')
  })

  it('POST /api/missions/:id/agree - agrees to mission', async () => {
    const res = await app.request(`/api/missions/${missionId}/agree`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.status).toBe('agreed')
  })

  it('PUT /api/missions/:id/status - starts mission', async () => {
    const res = await app.request(`/api/missions/${missionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ status: 'in_progress' }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.status).toBe('in_progress')
    expect(body.data.startedAt).toBeDefined()
  })

  it('PUT /api/missions/:id/status - completes mission', async () => {
    const res = await app.request(`/api/missions/${missionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ status: 'completed' }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.status).toBe('completed')
    expect(body.data.completedAt).toBeDefined()
  })

  it('denies access to unauthorized user', async () => {
    const otherToken = await generateAccessToken({ userId: 999, email: 'other@test.com', role: 'agent' })
    const res = await app.request(`/api/missions/${missionId}`, {
      headers: { Authorization: `Bearer ${otherToken}` },
    })

    expect(res.status).toBe(403)
  })

  it('DELETE /api/missions/:id - cancels mission', async () => {
    // Create a new mission to cancel
    const createRes = await app.request('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ title: 'Cancel Me', clientId, pricingType: 'fixed' }),
    })
    const createBody = await createRes.json()

    const res = await app.request(`/api/missions/${createBody.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
  })
})
