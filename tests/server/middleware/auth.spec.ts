import { describe, it, expect, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { SignJWT } from 'jose'
import { authenticate, optionalAuth } from '@/server/middleware/auth'

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')

async function createToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret())
}

describe('auth middleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'dev-secret'
  })

  describe('authenticate', () => {
    it('rejects request without Authorization header', async () => {
      const app = new Hono()
      app.use('*', authenticate())
      app.get('/protected', (c) => c.json({ ok: true }))

      const res = await app.request('/protected')
      const body = await res.json()

      expect(res.status).toBe(401)
      expect(body.success).toBe(false)
      expect(body.error).toContain('Missing')
    })

    it('rejects request with invalid token', async () => {
      const app = new Hono()
      app.use('*', authenticate())
      app.get('/protected', (c) => c.json({ ok: true }))

      const res = await app.request('/protected', {
        headers: { Authorization: 'Bearer invalid-token' },
      })
      const body = await res.json()

      expect(res.status).toBe(401)
      expect(body.error).toContain('Invalid')
    })

    it('accepts valid token and sets auth context', async () => {
      const app = new Hono()
      app.use('*', authenticate())
      app.get('/protected', (c) => {
        const auth = c.get('auth')
        return c.json({ auth })
      })

      const token = await createToken({ userId: 1, email: 'test@test.com', role: 'agent' })
      const res = await app.request('/protected', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.auth).toEqual({
        userId: 1,
        email: 'test@test.com',
        role: 'agent',
      })
    })
  })

  describe('authenticate with X-View-As-Role', () => {
    it('allows admin to view as agent via header', async () => {
      const app = new Hono()
      app.use('*', authenticate())
      app.get('/protected', (c) => {
        const auth = c.get('auth')
        return c.json({ auth })
      })

      const token = await createToken({ userId: 1, email: 'admin@test.com', role: 'admin' })
      const res = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-View-As-Role': 'agent',
        },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.auth.role).toBe('agent')
    })

    it('allows admin to view as client via header', async () => {
      const app = new Hono()
      app.use('*', authenticate())
      app.get('/protected', (c) => {
        const auth = c.get('auth')
        return c.json({ auth })
      })

      const token = await createToken({ userId: 1, email: 'admin@test.com', role: 'admin' })
      const res = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-View-As-Role': 'client',
        },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.auth.role).toBe('client')
    })

    it('ignores X-View-As-Role for non-admin users', async () => {
      const app = new Hono()
      app.use('*', authenticate())
      app.get('/protected', (c) => {
        const auth = c.get('auth')
        return c.json({ auth })
      })

      const token = await createToken({ userId: 2, email: 'agent@test.com', role: 'agent' })
      const res = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-View-As-Role': 'client',
        },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.auth.role).toBe('agent')
    })

    it('ignores invalid view-as roles', async () => {
      const app = new Hono()
      app.use('*', authenticate())
      app.get('/protected', (c) => {
        const auth = c.get('auth')
        return c.json({ auth })
      })

      const token = await createToken({ userId: 1, email: 'admin@test.com', role: 'admin' })
      const res = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-View-As-Role': 'superadmin',
        },
      })
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.auth.role).toBe('admin')
    })

    it('preserves userId and email when overriding role', async () => {
      const app = new Hono()
      app.use('*', authenticate())
      app.get('/protected', (c) => {
        const auth = c.get('auth')
        return c.json({ auth })
      })

      const token = await createToken({ userId: 1, email: 'admin@test.com', role: 'admin' })
      const res = await app.request('/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-View-As-Role': 'agent',
        },
      })
      const body = await res.json()

      expect(body.auth.userId).toBe(1)
      expect(body.auth.email).toBe('admin@test.com')
      expect(body.auth.role).toBe('agent')
    })
  })

  describe('optionalAuth', () => {
    it('passes through without token', async () => {
      const app = new Hono()
      app.use('*', optionalAuth())
      app.get('/public', (c) => c.json({ ok: true }))

      const res = await app.request('/public')
      expect(res.status).toBe(200)
    })

    it('sets auth when valid token provided', async () => {
      const app = new Hono()
      app.use('*', optionalAuth())
      app.get('/public', (c) => {
        const auth = c.get('auth')
        return c.json({ auth: auth || null })
      })

      const token = await createToken({ userId: 1, email: 'test@test.com', role: 'client' })
      const res = await app.request('/public', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json()

      expect(body.auth).toBeTruthy()
      expect(body.auth.role).toBe('client')
    })
  })
})
