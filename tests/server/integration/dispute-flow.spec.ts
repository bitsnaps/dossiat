import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '@/server/index'
import sequelize from '@/server/database/config/database'

const agentEmail = `int-dispute-agent-${Date.now()}@test.com`
const clientEmail = `int-dispute-client-${Date.now()}@test.com`
const password = 'Password123!'

let agentToken: string
let clientToken: string
let clientId: number
let missionId: number
let escalateMissionId: number
let disputeId: number
let escalateDisputeId: number

beforeAll(async () => {
  await sequelize.sync({ force: true })

  const agentRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: agentEmail, password, firstName: 'Agent', lastName: 'DF', role: 'agent' }),
  })
  const agentBody = await agentRes.json()
  agentToken = agentBody.data.accessToken

  const clientRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: clientEmail, password, firstName: 'Client', lastName: 'DF', role: 'client' }),
  })
  const clientBody = await clientRes.json()
  clientToken = clientBody.data.accessToken
  clientId = clientBody.data.id

  const setupMission = async (title: string) => {
    const mRes = await app.request('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ title, clientId, pricingType: 'fixed', agreedAmount: 300 }),
    })
    const mBody = await mRes.json()
    const id = mBody.data.id

    await app.request(`/api/missions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ status: 'pending_agreement' }),
    })
    await app.request(`/api/missions/${id}/agree`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    await app.request(`/api/missions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ status: 'in_progress' }),
    })
    return id
  }

  missionId = await setupMission('Dispute Test Mission')
  escalateMissionId = await setupMission('Escalate Test Mission')
})

afterAll(async () => {
  await sequelize.close()
})

describe('Dispute Flow Integration', { timeout: 30_000 }, () => {
  it('step 1: client initiates dispute on mission', async () => {
    // Dispute initiation is at POST /api/disputes/missions/:id/dispute
    const res = await app.request(`/api/disputes/missions/${missionId}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ reason: 'Agent did not complete work as agreed' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('open')
    expect(body.data.reason).toBe('Agent did not complete work as agreed')
    disputeId = body.data.id
  })

  it('step 2: verify mission status changed to disputed', async () => {
    const res = await app.request(`/api/missions/${missionId}`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.status).toBe('disputed')
  })

  it('step 3: client sees dispute in list', async () => {
    const res = await app.request('/api/disputes', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0].id).toBe(disputeId)
  })

  it('step 4: get dispute details', async () => {
    const res = await app.request(`/api/disputes/${disputeId}`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.id).toBe(disputeId)
    expect(body.data.mission).toBeDefined()
    expect(body.data.messages).toBeDefined()
  })

  it('step 5: client sends message in dispute room', async () => {
    const res = await app.request(`/api/disputes/${disputeId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ content: 'I am unhappy with the quality of work' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.content).toBe('I am unhappy with the quality of work')
  })

  it('step 6: agent sends message in dispute room', async () => {
    const res = await app.request(`/api/disputes/${disputeId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ content: 'I apologize, let me fix it' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.content).toBe('I apologize, let me fix it')
  })

  it('step 7: verify both messages in dispute details', async () => {
    const res = await app.request(`/api/disputes/${disputeId}`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.messages.length).toBe(2)
  })

  it('step 8: agent resolves dispute', async () => {
    const res = await app.request(`/api/disputes/${disputeId}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ resolution: 'Agent will redo the work at no extra cost' }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.status).toBe('resolved')
    expect(body.data.resolution).toBe('Agent will redo the work at no extra cost')
    expect(body.data.resolvedAt).toBeDefined()
  })

  it('step 9: initiate and escalate a second dispute', async () => {
    const createRes = await app.request(`/api/disputes/missions/${escalateMissionId}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ reason: 'Client not responding' }),
    })
    const createBody = await createRes.json()
    escalateDisputeId = createBody.data.id

    expect(createRes.status).toBe(201)
    expect(createBody.data.status).toBe('open')

    const escRes = await app.request(`/api/disputes/${escalateDisputeId}/escalate`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const escBody = await escRes.json()

    expect(escRes.status).toBe(200)
    expect(escBody.data.status).toBe('escalated')
  })

  it('step 10: verify escalated dispute in list', async () => {
    const res = await app.request('/api/disputes', {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    const escalated = body.data.find((d: any) => d.id === escalateDisputeId)
    expect(escalated).toBeDefined()
    expect(escalated.status).toBe('escalated')
  })
})
