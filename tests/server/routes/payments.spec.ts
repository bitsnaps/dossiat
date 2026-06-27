import { describe, it, expect, beforeAll } from 'vitest'
import app from '@/server/index'
import { User, AgentProfile, ClientProfile, Mission, Payment, PlatformCredit, CreditTransaction, RefreshToken, Notification, EmailVerificationToken, PasswordResetToken } from '@/server/database/models'
import { generateAccessToken } from '@/server/utils/jwt'
import bcrypt from 'bcryptjs'

let agentToken: string
let clientToken: string
let missionId: number
let agentId: number
let clientId: number

beforeAll(async () => {
  await Notification.destroy({ where: {} })
  await CreditTransaction.destroy({ where: {} })
  await PlatformCredit.destroy({ where: {} })
  await Payment.destroy({ where: {} })
  // await Mission.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
  await PasswordResetToken.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await AgentProfile.destroy({ where: {} })
  // await ClientProfile.destroy({ where: {} })
  // await User.destroy({ where: {} })

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
  clientId = clientBody.data.id
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
    expect(body.data.gatewayFee).toBe(0)
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

describe('Cash Payment Credit Deduction', () => {
  let agentTokenDeduction: string
  let clientTokenDeduction: string
  let agentIdDeduction: number
  let missionIdDeduction: number
  let paymentIdDeduction: number

  beforeAll(async () => {
    const agentRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `agent-deduction-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Agent', lastName: 'Deduction', role: 'agent' }),
    })
    const agentBody = await agentRes.json()
    agentIdDeduction = agentBody.data.id
    agentTokenDeduction = agentBody.data.accessToken

    const clientRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `client-deduction-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Client', lastName: 'Deduction', role: 'client' }),
    })
    const clientBody = await clientRes.json()
    clientTokenDeduction = clientBody.data.accessToken

    const missionRes = await app.request('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentTokenDeduction}` },
      body: JSON.stringify({ title: 'Deduction Mission', clientId: clientBody.data.id, pricingType: 'fixed', agreedAmount: 200 }),
    })
    const missionBody = await missionRes.json()
    missionIdDeduction = missionBody.data.id

    // Purchase credits first
    await app.request('/api/agents/me/credits/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentTokenDeduction}` },
      body: JSON.stringify({ amount: 50 }),
    })
  })

  it('deducts platform fee from credits when cash payment is confirmed by both parties', async () => {
    // Record a cash payment of $200
    const createRes = await app.request(`/api/missions/${missionIdDeduction}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientTokenDeduction}` },
      body: JSON.stringify({ amount: 200, method: 'cash', currency: 'USD' }),
    })
    const createBody = await createRes.json()
    paymentIdDeduction = createBody.data.id
    expect(createRes.status).toBe(201)

    const platformFee = createBody.data.platformFee

    // Confirm by payer
    const confirmPayerRes = await app.request(`/api/payments/${paymentIdDeduction}/confirm-payer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientTokenDeduction}` },
    })
    expect(confirmPayerRes.status).toBe(200)

    // Confirm by payee — this should trigger credit deduction
    const confirmPayeeRes = await app.request(`/api/payments/${paymentIdDeduction}/confirm-payee`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${agentTokenDeduction}` },
    })
    const confirmPayeeBody = await confirmPayeeRes.json()
    expect(confirmPayeeRes.status).toBe(200)
    expect(confirmPayeeBody.data.status).toBe('confirmed')

    // Check credit balance was deducted
    const creditRes = await app.request('/api/agents/me/credits', {
      headers: { Authorization: `Bearer ${agentTokenDeduction}` },
    })
    const creditBody = await creditRes.json()
    expect(creditBody.data.balance).toBe(50 - platformFee)

    // Check credit transaction was recorded
    const txRes = await app.request('/api/agents/me/credit-transactions', {
      headers: { Authorization: `Bearer ${agentTokenDeduction}` },
    })
    const txBody = await txRes.json()
    const deductionTx = txBody.data.find((tx: { type: string }) => tx.type === 'deduction')
    expect(deductionTx).toBeDefined()
    expect(deductionTx.amount).toBe(platformFee)
  })

  it('confirms cash payment even when agent has insufficient credits', async () => {
    // Register a fresh agent with no credits for this test
    const freshAgentRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `agent-nocredit-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Agent', lastName: 'NoCredit', role: 'agent' }),
    })
    const freshAgentBody = await freshAgentRes.json()
    const freshAgentToken = freshAgentBody.data.accessToken

    const freshClientRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `client-nocredit-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Client', lastName: 'NoCredit', role: 'client' }),
    })
    const freshClientBody = await freshClientRes.json()
    const freshClientToken = freshClientBody.data.accessToken

    const missionRes = await app.request('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshAgentToken}` },
      body: JSON.stringify({ title: 'No Credit Mission', clientId: freshClientBody.data.id, pricingType: 'fixed', agreedAmount: 500 }),
    })
    const missionBody = await missionRes.json()

    // Record a cash payment without purchasing credits
    const createRes = await app.request(`/api/missions/${missionBody.data.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshClientToken}` },
      body: JSON.stringify({ amount: 500, method: 'cash', currency: 'USD' }),
    })
    const createBody = await createRes.json()
    const freshPaymentId = createBody.data.id

    // Confirm payer
    await app.request(`/api/payments/${freshPaymentId}/confirm-payer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freshClientToken}` },
    })

    // Confirm payee — should still confirm even without credits
    const confirmPayeeRes = await app.request(`/api/payments/${freshPaymentId}/confirm-payee`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freshAgentToken}` },
    })
    const confirmPayeeBody = await confirmPayeeRes.json()
    expect(confirmPayeeRes.status).toBe(200)
    expect(confirmPayeeBody.data.status).toBe('confirmed')

    // Credit balance should still be 0 (no deduction occurred)
    const creditRes = await app.request('/api/agents/me/credits', {
      headers: { Authorization: `Bearer ${freshAgentToken}` },
    })
    const creditBody = await creditRes.json()
    expect(creditBody.data.balance).toBe(0)
  })
})

describe('Bank Transfer Payment', () => {
  let agentTokenBT: string
  let clientTokenBT: string
  let missionIdBT: number

  beforeAll(async () => {
    const agentRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `agent-bt-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Agent', lastName: 'BT', role: 'agent' }),
    })
    const agentBody = await agentRes.json()
    agentTokenBT = agentBody.data.accessToken

    const clientRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `client-bt-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Client', lastName: 'BT', role: 'client' }),
    })
    const clientBody = await clientRes.json()
    clientTokenBT = clientBody.data.accessToken

    const missionRes = await app.request('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentTokenBT}` },
      body: JSON.stringify({ title: 'BT Mission', clientId: clientBody.data.id, pricingType: 'fixed', agreedAmount: 300 }),
    })
    const missionBody = await missionRes.json()
    missionIdBT = missionBody.data.id
  })

  it('records a bank_transfer payment with zero gateway fee', async () => {
    const res = await app.request(`/api/missions/${missionIdBT}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientTokenBT}` },
      body: JSON.stringify({ amount: 300, method: 'bank_transfer', currency: 'USD' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.method).toBe('bank_transfer')
    expect(body.data.gatewayFee).toBe(0)
    expect(body.data.platformFee).toBeGreaterThanOrEqual(1)
    expect(body.data.netAmount).toBe(300 - body.data.platformFee)
  })
})

describe('Admin Payment Access', () => {
  let adminTokenAdmin: string
  let agentTokenAdmin: string
  let clientTokenAdmin: string
  let missionIdAdmin: number

  beforeAll(async () => {
    // Create admin user directly
    const adminHash = await bcrypt.hash('Admin123!', 12)
    const admin = await User.create({
      email: `admin-pay-access-${Date.now()}@test.com`,
      passwordHash: adminHash,
      firstName: 'Admin',
      lastName: 'PayAccess',
      role: 'admin',
      emailVerified: true,
    })
    adminTokenAdmin = await generateAccessToken({ userId: admin.id, email: admin.email, role: 'admin' })

    // Create agent
    const agentRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `agent-pay-access-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Agent', lastName: 'PayAccess', role: 'agent' }),
    })
    const agentBody = await agentRes.json()
    agentTokenAdmin = agentBody.data.accessToken

    // Create client
    const clientRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `client-pay-access-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Client', lastName: 'PayAccess', role: 'client' }),
    })
    const clientBody = await clientRes.json()
    clientTokenAdmin = clientBody.data.accessToken

    // Create a mission between agent and client
    const missionRes = await app.request('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${agentTokenAdmin}` },
      body: JSON.stringify({ title: 'Admin Access Mission', clientId: clientBody.data.id, pricingType: 'fixed', agreedAmount: 400 }),
    })
    const missionBody = await missionRes.json()
    missionIdAdmin = missionBody.data.id
  })

  it('allows admin to list payments for a mission', async () => {
    // First create a payment as the client
    await app.request(`/api/missions/${missionIdAdmin}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientTokenAdmin}` },
      body: JSON.stringify({ amount: 400, method: 'cash', currency: 'USD' }),
    })

    // Admin should be able to list payments
    const res = await app.request(`/api/missions/${missionIdAdmin}/payments`, {
      headers: { Authorization: `Bearer ${adminTokenAdmin}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })

  it('allows admin to record a payment for a mission', async () => {
    const res = await app.request(`/api/missions/${missionIdAdmin}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminTokenAdmin}` },
      body: JSON.stringify({ amount: 150, method: 'cash', currency: 'USD' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.amount).toBe(150)
  })

  it('rejects unauthorized user from listing payments', async () => {
    // Create a user not involved in the mission
    const outsiderRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `outsider-pay-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Outsider', lastName: 'Pay', role: 'client' }),
    })
    const outsiderBody = await outsiderRes.json()

    const res = await app.request(`/api/missions/${missionIdAdmin}/payments`, {
      headers: { Authorization: `Bearer ${outsiderBody.data.accessToken}` },
    })

    expect(res.status).toBe(403)
  })

  it('rejects unauthorized user from recording a payment', async () => {
    const outsiderRes = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `outsider-rec-pay-${Date.now()}@test.com`, password: 'Password123!', firstName: 'Outsider', lastName: 'RecPay', role: 'client' }),
    })
    const outsiderBody = await outsiderRes.json()

    const res = await app.request(`/api/missions/${missionIdAdmin}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${outsiderBody.data.accessToken}` },
      body: JSON.stringify({ amount: 100, method: 'cash', currency: 'USD' }),
    })

    expect(res.status).toBe(403)
  })

  it('allows admin to view all payments via /agents/me/payments', async () => {
    const res = await app.request('/api/agents/me/payments', {
      headers: { Authorization: `Bearer ${adminTokenAdmin}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThanOrEqual(1)
  })
})
