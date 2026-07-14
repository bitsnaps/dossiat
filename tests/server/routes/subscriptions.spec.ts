import { describe, it, expect, beforeAll } from 'vitest'
import app from '@/server/index'
import { User, ClientProfile, Subscription, SubscriptionPlan, RefreshToken, Notification, EmailVerificationToken, PasswordResetToken } from '@/server/database/models'

let clientToken: string
let planId: number

beforeAll(async () => {
  await Notification.destroy({ where: {} })
  await Subscription.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await ClientProfile.destroy({ where: {} })
  // await User.destroy({ where: {} })

  const clientRes = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `client-sub-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Client', lastName: 'Sub', role: 'client', acceptTerms: true }),
  })
  const clientBody = await clientRes.json()
  clientToken = clientBody.data.accessToken

  // Seed plans if not exists
  const plans = await SubscriptionPlan.findAll()
  if (plans.length === 0) {
    await SubscriptionPlan.bulkCreate([
      { name: 'small_business', price: 29, currency: 'USD', interval: 'monthly', maxSeats: 1, maxRecurrentMissions: 10, features: {} },
      { name: 'professional', price: 99, currency: 'USD', interval: 'monthly', maxSeats: 5, maxRecurrentMissions: 50, features: {} },
      { name: 'enterprise', price: 499, currency: 'USD', interval: 'monthly', maxSeats: 999, maxRecurrentMissions: -1, features: {} },
    ])
  }
  const plan = await SubscriptionPlan.findOne({ where: { name: 'small_business' } })
  planId = plan!.id
})

describe('Subscription Routes', () => {
  it('GET /api/subscriptions/plans - lists plans', async () => {
    const res = await app.request('/api/subscriptions/plans')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it('POST /api/subscriptions - subscribes to a plan', async () => {
    const res = await app.request('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ planId }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.status).toBe('active')
  })

  it('GET /api/subscriptions/me - gets current subscription', async () => {
    const res = await app.request('/api/subscriptions/me', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeDefined()
  })

  it('DELETE /api/subscriptions/me - cancels subscription', async () => {
    const res = await app.request('/api/subscriptions/me', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})
