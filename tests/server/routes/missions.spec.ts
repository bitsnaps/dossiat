import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, ClientProfile, Mission, RefreshToken, Conversation, Notification, EmailVerificationToken, PasswordResetToken, Subscription, SubscriptionPlan } from '@/server/database/models'
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

  it('POST /api/missions/:id/agree - agent agrees to mission', async () => {
    const res = await app.request(`/api/missions/${missionId}/agree`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.agreedByAgent).toBe(true)
    expect(body.data.agreedByClient).toBe(false)
    expect(body.data.status).toBe('pending_agreement')
  })

  it('POST /api/missions/:id/agree - client agrees to mission', async () => {
    const res = await app.request(`/api/missions/${missionId}/agree`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.agreedByAgent).toBe(true)
    expect(body.data.agreedByClient).toBe(true)
    expect(body.data.status).toBe('agreed')
  })

  it('GET /api/missions/:id/agreement-status - returns agreement status', async () => {
    const res = await app.request(`/api/missions/${missionId}/agreement-status`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.agreedByAgent).toBe(true)
    expect(body.data.agreedByClient).toBe(true)
    expect(body.data.bothAgreed).toBe(true)
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

describe('Mission Bulk Routes', () => {
  let enterpriseClientToken: string
  let enterpriseClientId: number
  let nonEnterpriseClientToken: string
  let nonEnterpriseClientId: number
  let enterpriseClientProfileId: number
  let nonEnterpriseClientProfileId: number

  beforeAll(async () => {
    // Register an enterprise client
    const entClientRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `ent-bulk-${Date.now()}@test.com`, password: 'Password123!', firstName: 'EntClient', lastName: 'Test', role: 'client' }),
    })
    const entClientBody = await entClientRes.json()
    enterpriseClientId = entClientBody.data.id
    enterpriseClientToken = entClientBody.data.accessToken

    // Register a non-enterprise client
    const nonEntClientRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `nonent-bulk-${Date.now()}@test.com`, password: 'Password123!', firstName: 'NonEntClient', lastName: 'Test', role: 'client' }),
    })
    const nonEntClientBody = await nonEntClientRes.json()
    nonEnterpriseClientId = nonEntClientBody.data.id
    nonEnterpriseClientToken = nonEntClientBody.data.accessToken

    // Get client profiles
    const entProfile = await ClientProfile.findOne({ where: { userId: enterpriseClientId } })
    enterpriseClientProfileId = entProfile!.id
    const nonEntProfile = await ClientProfile.findOne({ where: { userId: nonEnterpriseClientId } })
    nonEnterpriseClientProfileId = nonEntProfile!.id

    // Find or create an Enterprise plan with csv_import feature
    const [enterprisePlan] = await SubscriptionPlan.findOrCreate({
      where: { name: 'enterprise' },
      defaults: {
        price: 499,
        currency: 'USD',
        interval: 'monthly',
        maxSeats: -1,
        maxRecurrentMissions: -1,
        features: { csv_import: true },
        isActive: true,
      } as any,
    })
    // Ensure csv_import is enabled even when the plan row pre-exists (e.g. seeded without the flag)
    await enterprisePlan.update({ features: { ...enterprisePlan.features, csv_import: true } })

    // Find or create a non-Enterprise plan without csv_import
    const [basicPlan] = await SubscriptionPlan.findOrCreate({
      where: { name: 'small_business' },
      defaults: {
        price: 29,
        currency: 'USD',
        interval: 'monthly',
        maxSeats: 3,
        maxRecurrentMissions: 10,
        features: { csv_import: false },
        isActive: true,
      } as any,
    })
    // Ensure csv_import is disabled even when the plan row pre-exists
    await basicPlan.update({ features: { ...basicPlan.features, csv_import: false } })

    // Assign Enterprise subscription to enterprise client
    await Subscription.create({
      clientId: enterpriseClientProfileId,
      planId: enterprisePlan.id,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    } as any)

    // Assign basic subscription to non-enterprise client
    await Subscription.create({
      clientId: nonEnterpriseClientProfileId,
      planId: basicPlan.id,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    } as any)
  })

  it('POST /api/missions/bulk - Enterprise client creates 3 missions', async () => {
    const res = await app.request('/api/missions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${enterpriseClientToken}` },
      body: JSON.stringify({
        missions: [
          { title: 'Bulk Mission 1', clientId: agentId, pricingType: 'fixed', agreedAmount: 100 },
          { title: 'Bulk Mission 2', clientId: agentId, pricingType: 'hourly', agreedAmount: 50 },
          { title: 'Bulk Mission 3', clientId: agentId, pricingType: 'task_based', agreedAmount: 200 },
        ],
      }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.count).toBe(3)
    expect(body.data.missions).toHaveLength(3)
  })

  it('POST /api/missions/bulk - non-Enterprise client gets 403', async () => {
    const res = await app.request('/api/missions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${nonEnterpriseClientToken}` },
      body: JSON.stringify({
        missions: [
          { title: 'Should Fail', clientId: agentId, pricingType: 'fixed' },
        ],
      }),
    })
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.success).toBe(false)
  })

  it('POST /api/missions/bulk - agent can bulk create', async () => {
    const res = await app.request('/api/missions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentToken}` },
      body: JSON.stringify({
        missions: [
          { title: 'Agent Bulk 1', clientId: enterpriseClientId, pricingType: 'fixed' },
          { title: 'Agent Bulk 2', clientId: enterpriseClientId, pricingType: 'hourly' },
        ],
      }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.count).toBe(2)
  })

  it('POST /api/missions/bulk - missing title returns 422', async () => {
    const res = await app.request('/api/missions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${enterpriseClientToken}` },
      body: JSON.stringify({
        missions: [
          { clientId: agentId, pricingType: 'fixed' },
        ],
      }),
    })
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.success).toBe(false)
  })

  it('POST /api/missions/bulk - empty array returns 422', async () => {
    const res = await app.request('/api/missions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${enterpriseClientToken}` },
      body: JSON.stringify({ missions: [] }),
    })
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.success).toBe(false)
  })

  it('POST /api/missions/bulk - over 100 missions returns 422', async () => {
    const missions = Array.from({ length: 101 }, (_, i) => ({
      title: `Mission ${i}`,
      clientId: agentId,
      pricingType: 'fixed',
    }))

    const res = await app.request('/api/missions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${enterpriseClientToken}` },
      body: JSON.stringify({ missions }),
    })
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.success).toBe(false)
  })

  it('POST /api/missions/bulk - missing clientId returns 422', async () => {
    const res = await app.request('/api/missions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${enterpriseClientToken}` },
      body: JSON.stringify({
        missions: [
          { title: 'No Client', pricingType: 'fixed' },
        ],
      }),
    })
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.success).toBe(false)
  })

  it('POST /api/missions/bulk - missing pricingType returns 422', async () => {
    const res = await app.request('/api/missions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${enterpriseClientToken}` },
      body: JSON.stringify({
        missions: [
          { title: 'No Pricing', clientId: agentId },
        ],
      }),
    })
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.success).toBe(false)
  })
})
