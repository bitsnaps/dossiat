import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '@/server/index'
import sequelize from '@/server/database/config/database'

const agentEmail = `int-mission-agent-${Date.now()}@test.com`
const clientEmail = `int-mission-client-${Date.now()}@test.com`
const password = 'Password123!'

let agentToken: string
let clientToken: string
let agentId: number
let clientId: number
let missionId: number
let paymentId: number

beforeAll(async () => {
  await sequelize.sync({ force: true })

  const agentRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: agentEmail, password, firstName: 'Agent', lastName: 'LC', role: 'agent' }),
  })
  const agentBody = await agentRes.json()
  agentToken = agentBody.data.accessToken
  agentId = agentBody.data.id

  const clientRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: clientEmail, password, firstName: 'Client', lastName: 'LC', role: 'client' }),
  })
  const clientBody = await clientRes.json()
  clientToken = clientBody.data.accessToken
  clientId = clientBody.data.id
})

afterAll(async () => {
  await sequelize.close()
})

describe('Mission Lifecycle Integration', { timeout: 30_000 }, () => {
  it('step 1: agent creates mission', async () => {
    const res = await app.request('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({
        title: 'Integration Test Mission',
        description: 'Full lifecycle test',
        clientId,
        pricingType: 'fixed',
        agreedAmount: 500,
        currency: 'USD',
        agreedChecklist: ['Task A', 'Task B'],
      }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('draft')
    missionId = body.data.id
  })

  it('step 2: agent sends mission for agreement', async () => {
    const res = await app.request(`/api/missions/${missionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ status: 'pending_agreement' }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.status).toBe('pending_agreement')
  })

  it('step 3: agent agrees to mission', async () => {
    const res = await app.request(`/api/missions/${missionId}/agree`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.agreedByAgent).toBe(true)
    expect(body.data.status).toBe('pending_agreement')
  })

  it('step 4: client agrees to mission', async () => {
    const res = await app.request(`/api/missions/${missionId}/agree`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.agreedByClient).toBe(true)
    expect(body.data.status).toBe('agreed')
  })

  it('step 5: agent starts mission', async () => {
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

  it('step 6: agent sends message in mission', async () => {
    const res = await app.request(`/api/missions/${missionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ content: 'Starting work on Task A' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.content).toBe('Starting work on Task A')
  })

  it('step 7: client replies to mission conversation', async () => {
    const res = await app.request(`/api/missions/${missionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ content: 'Sounds good, keep me posted' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.content).toBe('Sounds good, keep me posted')
  })

  it('step 8: agent completes mission', async () => {
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

  it('step 9: client records payment', async () => {
    const res = await app.request(`/api/missions/${missionId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ amount: 500, method: 'cash', currency: 'USD' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.status).toBe('pending')
    expect(body.data.amount).toBe(500)
    expect(body.data.method).toBe('cash')
    paymentId = body.data.id
  })

  it('step 10: client confirms payment sent', async () => {
    const res = await app.request(`/api/payments/${paymentId}/confirm-payer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.confirmedByPayer).toBe(true)
    expect(body.data.status).toBe('pending') // not confirmed until payee also confirms
  })

  it('step 11: agent confirms payment received', async () => {
    const res = await app.request(`/api/payments/${paymentId}/confirm-payee`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.confirmedByPayee).toBe(true)
    expect(body.data.status).toBe('confirmed')
    expect(body.data.confirmedAt).toBeDefined()
  })

  it('step 12: verify payment is confirmed in mission payments list', async () => {
    const res = await app.request(`/api/missions/${missionId}/payments`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.length).toBe(1)
    expect(body.data[0].status).toBe('confirmed')
    expect(body.data[0].method).toBe('cash')
  })
})

describe('Client-Initiated Mission Lifecycle', { timeout: 30_000 }, () => {
  let clientMissionId: number

  it('step 1: client creates open mission', async () => {
    const res = await app.request('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Client Lifecycle Mission',
        description: 'Created by client',
        pricingType: 'fixed',
        agreedAmount: 300,
      }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.status).toBe('open')
    expect(body.data.agentId).toBeNull()
    expect(body.data.proposedAmount).toBe(300)
    clientMissionId = body.data.id
  })

  it('step 2: agent claims the mission', async () => {
    const res = await app.request(`/api/missions/${clientMissionId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({}),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.status).toBe('pending_agreement')
    expect(body.data.agentId).toBe(agentId)
    expect(body.data.agreedAmount).toBe(300)
  })

  it('step 3: agent agrees', async () => {
    const res = await app.request(`/api/missions/${clientMissionId}/agree`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.agreedByAgent).toBe(true)
    expect(body.data.status).toBe('pending_agreement')
  })

  it('step 4: client agrees', async () => {
    const res = await app.request(`/api/missions/${clientMissionId}/agree`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.agreedByClient).toBe(true)
    expect(body.data.status).toBe('agreed')
  })

  it('step 5: agent starts mission', async () => {
    const res = await app.request(`/api/missions/${clientMissionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ status: 'in_progress' }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.status).toBe('in_progress')
  })

  it('step 6: agent completes mission', async () => {
    const res = await app.request(`/api/missions/${clientMissionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ status: 'completed' }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.status).toBe('completed')
  })
})
