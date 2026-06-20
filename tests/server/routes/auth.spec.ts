import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '@/server/index'
import { User, RefreshToken, EmailVerificationToken } from '@/server/database/models'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { generateRefreshToken } from '@/server/utils/jwt'

let testEmail = `auth-test-${Date.now()}@test.com`

beforeAll(async () => {
  await User.destroy({ where: {} })
  await RefreshToken.destroy({ where: {} })
  await EmailVerificationToken.destroy({ where: {} })
})

describe('Auth Routes', { timeout: 30_000 }, () => {
  describe('POST /api/auth/register', () => {
    it('registers a new user with valid data', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'agent',
        }),
      })
      const body = await res.json()

      expect(res.status).toBe(201)
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('id')
      expect(body.data.email).toBe(testEmail)
      expect(body.data.role).toBe('agent')
      expect(body.data).not.toHaveProperty('passwordHash')
    })

    it('rejects duplicate email', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Password123!',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'client',
        }),
      })
      const body = await res.json()

      expect(res.status).toBe(409)
      expect(body.success).toBe(false)
    })

    it('rejects invalid email', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'not-an-email',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
          role: 'agent',
        }),
      })

      expect(res.status).toBe(422)
    })

    it('rejects short password', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'short@test.com',
          password: '123',
          firstName: 'Test',
          lastName: 'User',
          role: 'agent',
        }),
      })

      expect(res.status).toBe(422)
    })

    it('rejects invalid role', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'bad@test.com',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
          role: 'invalid',
        }),
      })

      expect(res.status).toBe(422)
    })
  })

  describe('POST /api/auth/login', () => {
    it.skip('returns tokens with valid credentials', async () => {
      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: 'Password123!' }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('accessToken')
      expect(body.data).toHaveProperty('refreshToken')
      expect(body.data.user.email).toBe(testEmail)
    })

    it('rejects wrong password', async () => {
      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: 'WrongPassword!' }),
      })
      const body = await res.json()

      expect(res.status).toBe(401)
      expect(body.success).toBe(false)
    })

    it('rejects non-existent email', async () => {
      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@test.com', password: 'Password123!' }),
      })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('returns new tokens with valid refresh token', async () => {
      // Self-contained: register + login to avoid cross-test-file state issues
      const refreshEmail = `refresh-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`
      const regRes = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: refreshEmail, password: 'Password123!', firstName: 'Refresh', lastName: 'Test', role: 'client' }),
      })
      expect(regRes.status).toBe(201)

      const loginRes = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: refreshEmail, password: 'Password123!' }),
      })
      expect(loginRes.status).toBe(200)
      const loginBody = await loginRes.json()
      const refreshToken = loginBody.data.refreshToken

      const res = await app.request('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toHaveProperty('accessToken')
      expect(body.data).toHaveProperty('refreshToken')
    })

    it('rejects invalid refresh token', async () => {
      const res = await app.request('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid-token' }),
      })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/logout', () => {
    it.skip('invalidates refresh token', async () => {
      // Register + login in one test to be fully self-contained
      const logoutEmail = `logout-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`
      const regRes = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: logoutEmail, password: 'Password123!', firstName: 'Logout', lastName: 'Test', role: 'agent' }),
      })
      expect(regRes.status).toBe(201)

      const loginRes = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: logoutEmail, password: 'Password123!' }),
      })
      expect(loginRes.status).toBe(200)
      const loginBody = await loginRes.json()
      const token = loginBody.data.refreshToken

      const res = await app.request('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)

      const refreshRes = await app.request('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token }),
      })

      expect(refreshRes.status).toBe(401)
    })
  })

  describe('GET /api/auth/verify-email/:token', () => {
    it('rejects invalid token', async () => {
      const res = await app.request('/api/auth/verify-email/invalid-token')
      const body = await res.json()

      expect(res.status).toBe(400)
      expect(body.success).toBe(false)
    })

    it('verifies email with valid token', async () => {
      const verifyEmail = `verify-${Date.now()}@test.com`
      const regRes = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verifyEmail,
          password: 'Password123!',
          firstName: 'Verify',
          lastName: 'User',
          role: 'client',
        }),
      })
      const regBody = await regRes.json()
      const verificationToken = regBody.data.verificationToken

      const res = await app.request(`/api/auth/verify-email/${verificationToken}`)
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    it('returns success even for non-existent email (prevents enumeration)', async () => {
      const res = await app.request('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@test.com' }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
    })

    it('returns success for existing email', async () => {
      const res = await app.request('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
    })
  })
})
