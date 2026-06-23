import { describe, it, expect, beforeAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, RefreshToken, Notification, EmailVerificationToken, PasswordResetToken } from '@/server/database/models'

let agentToken: string

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
    body: JSON.stringify({ email: `agent-paypal-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Agent', lastName: 'Paypal', role: 'agent' }),
  })
  const agentBody = await agentRes.json()
  agentToken = agentBody.data.accessToken
})

describe('PayPal Routes', () => {
  it('POST /api/payments/paypal/setup - returns 501 when PayPal not configured', async () => {
    const res = await app.request('/api/payments/paypal/setup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${agentToken}` },
    })

    expect(res.status).toBe(501)
  })

  it('POST /api/payments/paypal/create-order - returns 501 when PayPal not configured', async () => {
    const res = await app.request('/api/payments/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({ missionId: 1, amount: 100 }),
    })

    expect(res.status).toBe(501)
  })

  it('POST /api/payments/paypal/webhook - returns 501 when PayPal not configured', async () => {
    const res = await app.request('/api/payments/paypal/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'PAYMENT.CAPTURE.COMPLETED' }),
    })

    expect(res.status).toBe(501)
  })

  it('GET /api/payments/paypal/status - returns configured=false when not configured', async () => {
    const res = await app.request('/api/payments/paypal/status', {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.configured).toBe(false)
    expect(body.data.connected).toBe(false)
  })

  it('POST /api/payments/paypal/setup - requires authentication', async () => {
    const res = await app.request('/api/payments/paypal/setup', {
      method: 'POST',
    })

    expect(res.status).toBe(401)
  })

  it('POST /api/payments/paypal/create-order - requires authentication', async () => {
    const res = await app.request('/api/payments/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(res.status).toBe(401)
  })

  it('GET /api/payments/paypal/status - requires authentication', async () => {
    const res = await app.request('/api/payments/paypal/status')

    expect(res.status).toBe(401)
  })
})
