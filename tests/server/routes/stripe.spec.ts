import { describe, it, expect, beforeAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, RefreshToken } from '@/server/database/models'

let agentToken: string

beforeAll(async () => {
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  await User.destroy({ where: {} })

  const agentRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `agent-stripe-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Agent', lastName: 'Stripe', role: 'agent' }),
  })
  const agentBody = await agentRes.json()
  agentToken = agentBody.data.accessToken
})

describe('Stripe Routes', () => {
  it('POST /api/payments/stripe/connect - returns stub when configured', async () => {
    const res = await app.request('/api/payments/stripe/connect', {
      method: 'POST',
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    // When STRIPE_SECRET_KEY is set, returns 200 with stub message
    // When not set, returns 501
    if (process.env.STRIPE_SECRET_KEY) {
      expect(res.status).toBe(200)
      expect(body.data.message).toContain('not yet implemented')
    } else {
      expect(res.status).toBe(501)
    }
  })

  it('POST /api/payments/stripe/create-checkout-session - returns stub when configured', async () => {
    const res = await app.request('/api/payments/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ missionId: 1, amount: 100 }),
    })
    const body = await res.json()

    if (process.env.STRIPE_SECRET_KEY) {
      expect(res.status).toBe(200)
      expect(body.data.message).toContain('not yet implemented')
    } else {
      expect(res.status).toBe(501)
    }
  })

  it('POST /api/payments/stripe/webhook - returns stub when configured', async () => {
    const res = await app.request('/api/payments/stripe/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'checkout.session.completed' }),
    })
    const body = await res.json()

    if (process.env.STRIPE_SECRET_KEY) {
      expect(res.status).toBe(200)
      expect(body.data.received).toBe(true)
    } else {
      expect(res.status).toBe(501)
    }
  })

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

  it('POST /api/payments/stripe/connect - requires authentication', async () => {
    const res = await app.request('/api/payments/stripe/connect', {
      method: 'POST',
    })

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
