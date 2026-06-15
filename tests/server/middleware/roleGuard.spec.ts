import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { roleGuard, agentOnly, clientOnly, adminOnly } from '@/server/middleware/roleGuard'
import { SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')

async function createToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret)
}

function setupApp(...guards: ReturnType<typeof roleGuard>[]) {
  const app = new Hono()
  // Fake auth middleware that sets auth from token
  app.use('*', async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (authHeader) {
      try {
        const token = authHeader.slice(7)
        const { payload } = await import('jose').then(m => m.jwtVerify(token, secret))
        c.set('auth', {
          userId: payload.userId as number,
          email: payload.email as string,
          role: payload.role as any,
        })
      } catch {}
    }
    await next()
  })
  app.use('*', ...guards)
  app.get('/test', (c) => c.json({ ok: true }))
  return app
}

describe('roleGuard middleware', () => {
  it('returns 401 when no auth context', async () => {
    const app = setupApp(agentOnly())
    const res = await app.request('/test')
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toContain('Authentication required')
  })

  it('returns 403 when role does not match', async () => {
    const app = setupApp(agentOnly())
    const token = await createToken({ userId: 1, email: 'c@test.com', role: 'client' })
    const res = await app.request('/test', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.error).toContain('Insufficient permissions')
  })

  it('allows access when role matches', async () => {
    const app = setupApp(agentOnly())
    const token = await createToken({ userId: 1, email: 'a@test.com', role: 'agent' })
    const res = await app.request('/test', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
  })

  it('allows multiple roles', async () => {
    const app = setupApp(roleGuard('agent', 'admin'))
    const agentToken = await createToken({ userId: 1, email: 'a@test.com', role: 'agent' })
    const adminToken = await createToken({ userId: 2, email: 'ad@test.com', role: 'admin' })

    const res1 = await app.request('/test', {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    const res2 = await app.request('/test', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
  })

  it('clientOnly blocks agent', async () => {
    const app = setupApp(clientOnly())
    const token = await createToken({ userId: 1, email: 'a@test.com', role: 'agent' })
    const res = await app.request('/test', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status).toBe(403)
  })

  it('adminOnly blocks non-admin', async () => {
    const app = setupApp(adminOnly())
    const token = await createToken({ userId: 1, email: 'a@test.com', role: 'agent' })
    const res = await app.request('/test', {
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status).toBe(403)
  })
})
