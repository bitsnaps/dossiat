import { describe, it, expect, beforeAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, ClientProfile, Mission, Payment, PlatformCredit, CreditTransaction, RefreshToken } from '@/server/database/models'

let agentToken: string
let clientToken: string
let missionId: number
let agentId: number

beforeAll(async () => {
  await CreditTransaction.destroy({ where: {} })
  await PlatformCredit.destroy({ where: {} })
  await Payment.destroy({ where: {} })
  await Mission.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  await ClientProfile.destroy({ where: {} })
  await User.destroy({ where: {} })

  const agentRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `agent-pay-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Agent', lastName: 'Pay', role: 'agent' }),
  })
  const agentBody = await agentRes.json()
  agentId = agentBody.data.id
  agentToken = agentBody.data.accessToken

  const clientRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `client-pay-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Client', lastName: 'Pay', role: 'client' }),
  })
  const clientBody = await clientRes.json()
  clientToken = clientBody.data.accessToken

  const missionRes = await app.request('/api/missions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
    body: JSON.stringify({ title: 'Pay Mission', clientId: clientBody.data.id, pricingType: 'fixed', agreedAmount: 500 }),
  })
  const missionBody = await missionRes.json()
  missionId = missionBody.data.id
})

describe('Payment Routes', () => {
  let paymentId: number

  it('POST /api/missions/:id/payments - records a payment', async () => {
    const res = await app.request(`/api/missions/${missionId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ amount: 500, method: 'cash', currency: 'USD' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.amount).toBe(500)
    expect(body.data.platformFee).toBeGreaterThanOrEqual(1)
    expect(body.data.status).toBe('pending')
    paymentId = body.data.id
  })

  it('GET /api/missions/:id/payments - lists payments', async () => {
    const res = await app.request(`/api/missions/${missionId}/payments`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it('POST /api/payments/:id/confirm-payer - confirms payer', async () => {
    const res = await app.request(`/api/payments/${paymentId}/confirm-payer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.confirmedByPayer).toBe(true)
  })

  it('POST /api/payments/:id/confirm-payee - confirms payee', async () => {
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

  it('GET /api/agents/me/credits - gets credit balance', async () => {
    const res = await app.request('/api/agents/me/credits', {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.balance).toBeDefined()
  })

  it('POST /api/agents/me/credits/purchase - purchases credits', async () => {
    const res = await app.request('/api/agents/me/credits/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ amount: 100 }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.balance).toBe(100)
  })

  it('GET /api/agents/me/credit-transactions - lists transactions', async () => {
    const res = await app.request('/api/agents/me/credit-transactions', {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it('GET /api/agents/me/invoices - lists invoices', async () => {
    const res = await app.request('/api/agents/me/invoices', {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(body.data)).toBe(true)
  })
})
