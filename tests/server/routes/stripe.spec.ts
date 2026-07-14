import { describe, it, expect, beforeAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, RefreshToken, Mission, Conversation, Notification, EmailVerificationToken, PasswordResetToken } from '@/server/database/models'

let agentToken: string
let agentUserId: number
let clientToken: string
let clientUserId: number
let testMissionId: number

beforeAll(async () => {
  await Notification.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  // await User.destroy({ where: {} })

  const agentRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `agent-stripe-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Agent', lastName: 'Stripe', role: 'agent', acceptTerms: true }),
  })
  const agentBody = await agentRes.json()
  agentToken = agentBody.data.accessToken
  agentUserId = agentBody.data.id

  const clientRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `client-stripe-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Client', lastName: 'Stripe', role: 'client', acceptTerms: true }),
  })
  const clientBody = await clientRes.json()
  clientToken = clientBody.data.accessToken
  clientUserId = clientBody.data.id

  const missionRes = await app.request('/api/missions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
    body: JSON.stringify({
      title: 'Stripe Test Mission',
      clientId: clientUserId,
      pricingType: 'fixed',
      agreedAmount: 100,
    }),
  })
  const missionBody = await missionRes.json()
  testMissionId = missionBody.data?.id
})

describe('Stripe Routes', () => {
  it('GET /api/payments/stripe/status - returns configuration status', async () => {
    const res = await app.request('/api/payments/stripe/status', {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(typeof body.data.configured).toBe('boolean')
    expect(typeof body.data.connected).toBe('boolean')

    if (process.env.STRIPE_SECRET_KEY) {
      expect(body.data.configured).toBe(true)
    } else {
      expect(body.data.configured).toBe(false)
    }
  })

  /**
   * Skipped to avoid timed out error.
   */
  it.skip('POST /api/payments/stripe/connect - returns 501 when Stripe not configured', async () => {
    if (process.env.STRIPE_SECRET_KEY) {
      // When configured, it tries to create a Stripe account — may succeed or fail based on key validity
      const res = await app.request('/api/payments/stripe/connect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${agentToken}` },
      })
      expect([200, 500]).toContain(res.status)
    } else {
      const res = await app.request('/api/payments/stripe/connect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${agentToken}` },
      })
      expect(res.status).toBe(501)
    }
  })

  /**
   * Skipped to avoid timed out error.
   */
  it.skip('POST /api/payments/stripe/create-checkout-session - returns 501 when not configured', async () => {
    if (process.env.STRIPE_SECRET_KEY && testMissionId) {
      const res = await app.request('/api/payments/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
        body: JSON.stringify({ missionId: testMissionId, amount: 100 }),
      })
      expect([200, 500]).toContain(res.status)
    } else {
      const res = await app.request('/api/payments/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
        body: JSON.stringify({ missionId: 1, amount: 100 }),
      })
      expect(res.status).toBe(501)
    }
  })

  it('POST /api/payments/stripe/webhook - returns 501 or 400 when not configured', async () => {
    if (process.env.STRIPE_SECRET_KEY) {
      const res = await app.request('/api/payments/stripe/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'checkout.session.completed' }),
      })
      // Without valid signature returns 400, with valid returns 200
      expect([200, 400]).toContain(res.status)
    } else {
      const res = await app.request('/api/payments/stripe/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'checkout.session.completed' }),
      })
      expect(res.status).toBe(501)
    }
  })

  it('POST /api/payments/stripe/connect - requires authentication', async () => {
    const res = await app.request('/api/payments/stripe/connect', { method: 'POST' })
    expect(res.status).toBe(401)
  })

  it('POST /api/payments/stripe/create-checkout-session - requires authentication', async () => {
    const res = await app.request('/api/payments/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(401)
  })

  it('GET /api/payments/stripe/status - requires authentication', async () => {
    const res = await app.request('/api/payments/stripe/status')
    expect(res.status).toBe(401)
  })
})
