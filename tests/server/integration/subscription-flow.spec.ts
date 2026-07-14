import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '@/server/index'
import { SubscriptionPlan } from '@/server/database/models'
import sequelize from '@/server/database/config/database'

const clientEmail = `int-sub-client-${Date.now()}@test.com`
const password = 'Password123!'

let clientToken: string
let smallBizPlanId: number
let proPlanId: number

beforeAll(async () => {
  await sequelize.sync({ force: true })

  // Seed subscription plans
  const smallBiz = await SubscriptionPlan.create({
    name: 'small_business', price: 29, currency: 'USD', interval: 'monthly',
    maxSeats: 1, maxRecurrentMissions: 10, features: {}, isActive: true,
  })
  const pro = await SubscriptionPlan.create({
    name: 'professional', price: 99, currency: 'USD', interval: 'monthly',
    maxSeats: 5, maxRecurrentMissions: 50, features: {}, isActive: true,
  })
  smallBizPlanId = smallBiz.id
  proPlanId = pro.id

  // Register client
  const res = await app.request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: clientEmail, password, firstName: 'Client', lastName: 'Sub', role: 'client', acceptTerms: true }),
  })
  const body = await res.json()
  clientToken = body.data.accessToken
})

afterAll(async () => {
  await sequelize.close()
})

describe('Subscription Flow Integration', { timeout: 30_000 }, () => {
  it('step 1: list available plans', async () => {
    const res = await app.request('/api/subscriptions/plans')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.length).toBeGreaterThanOrEqual(2)
  })

  it('step 2: subscribe to Small Business plan', async () => {
    const res = await app.request('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ planId: smallBizPlanId }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('active')
  })

  it('step 3: verify subscription details', async () => {
    const res = await app.request('/api/subscriptions/me', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeDefined()
    expect(body.data.status).toBe('active')
    expect(body.data.planId).toBe(smallBizPlanId)
  })

  it('step 4: upgrade to Professional plan', async () => {
    const res = await app.request('/api/subscriptions/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ planId: proPlanId }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.planId).toBe(proPlanId)
  })

  it('step 5: verify upgraded plan', async () => {
    const res = await app.request('/api/subscriptions/me', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.planId).toBe(proPlanId)
  })

  it('step 6: cancel subscription', async () => {
    const res = await app.request('/api/subscriptions/me', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('step 7: verify no active subscription', async () => {
    const res = await app.request('/api/subscriptions/me', {
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeNull()
  })

  it('step 8: can subscribe again after cancellation', async () => {
    const res = await app.request('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ planId: smallBizPlanId }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.status).toBe('active')
  })

  it('step 9: cannot subscribe when already active', async () => {
    const res = await app.request('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ planId: proPlanId }),
    })

    expect(res.status).toBe(400)
  })
})
