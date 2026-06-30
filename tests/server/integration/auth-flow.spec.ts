import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '@/server/index'
import { User, RefreshToken, EmailVerificationToken, Notification } from '@/server/database/models'
import sequelize from '@/server/database/config/database'

const agentEmail = `int-auth-agent-${Date.now()}@test.com`
const clientEmail = `int-auth-client-${Date.now()}@test.com`
const password = 'Password123!'

let agentAccessToken: string
let agentRefreshToken: string
let agentVerificationToken: string
let clientAccessToken: string
let clientRefreshToken: string

beforeAll(async () => {
  await sequelize.sync({ force: true })
})

afterAll(async () => {
  await sequelize.close()
})

describe('Auth Flow Integration', { timeout: 30_000 }, () => {
  it('step 1: register agent', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: agentEmail, password, firstName: 'Agent', lastName: 'Test', role: 'agent' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.role).toBe('agent')
    expect(body.data.accessToken).toBeDefined()
    expect(body.data.refreshToken).toBeDefined()
    expect(body.data.verificationToken).toBeDefined()

    agentAccessToken = body.data.accessToken
    agentRefreshToken = body.data.refreshToken
    agentVerificationToken = body.data.verificationToken
  })

  it('step 2: register client', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clientEmail, password, firstName: 'Client', lastName: 'Test', role: 'client' }),
    })
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.role).toBe('client')

    clientAccessToken = body.data.accessToken
    clientRefreshToken = body.data.refreshToken
  })

  it('step 3: verify agent email', async () => {
    const res = await app.request(`/api/auth/verify-email/${agentVerificationToken}`)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)

    const user = await User.findOne({ where: { email: agentEmail } })
    expect(user?.emailVerified).toBe(true)
  })

  it('step 4: login agent', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: agentEmail, password }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.accessToken).toBeDefined()
    expect(body.data.refreshToken).toBeDefined()
    expect(body.data.user.email).toBe(agentEmail)

    agentAccessToken = body.data.accessToken
    agentRefreshToken = body.data.refreshToken
  })

  it('step 5: login client', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clientEmail, password }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.user.email).toBe(clientEmail)

    clientAccessToken = body.data.accessToken
    clientRefreshToken = body.data.refreshToken
  })

  it('step 6: agent accesses protected route', async () => {
    const res = await app.request('/api/users/me', {
      headers: { Authorization: `Bearer ${agentAccessToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.email).toBe(agentEmail)
    expect(body.data.role).toBe('agent')
  })

  it('step 7: client accesses protected route', async () => {
    const res = await app.request('/api/users/me', {
      headers: { Authorization: `Bearer ${clientAccessToken}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.email).toBe(clientEmail)
  })

  it('step 8: unauthenticated request returns 401', async () => {
    const res = await app.request('/api/users/me')
    expect(res.status).toBe(401)
  })

  it('step 9: refresh token returns new tokens', async () => {
    const res = await app.request('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: agentRefreshToken }),
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.accessToken).toBeDefined()
    expect(body.data.refreshToken).toBeDefined()
    // expect(body.data.accessToken).not.toBe(agentAccessToken)

    agentAccessToken = body.data.accessToken
    agentRefreshToken = body.data.refreshToken
  })

  it('step 10: logout then refresh fails', async () => {
    const logoutRes = await app.request('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: clientRefreshToken }),
    })
    expect((await logoutRes.json()).success).toBe(true)

    const refreshRes = await app.request('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: clientRefreshToken }),
    })
    expect(refreshRes.status).toBe(401)
  })
})
