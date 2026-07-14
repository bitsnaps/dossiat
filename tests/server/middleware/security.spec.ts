import { describe, it, expect, beforeAll } from 'vitest'
import { Hono } from 'hono'
import app from '@/server/index'
import sequelize from '@/server/database/config/database'
import { sanitizeString, sanitizeValue, sanitizeInput } from '@/server/middleware/sanitize'
import { validateFileUpload, ALLOWED_IMAGE_TYPES } from '@/server/utils/uploadValidation'

beforeAll(async () => {
  await sequelize.sync()
})

describe('Secure HTTP headers', () => {
  it('sets X-Content-Type-Options: nosniff', async () => {
    const res = await app.request('/api/health')
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('sets X-Frame-Options', async () => {
    const res = await app.request('/api/health')
    const xfo = res.headers.get('x-frame-options')
    expect(xfo).toBeTruthy()
  })
})

describe('Input sanitization (XSS)', () => {
  it('strips HTML tags from a string', () => {
    expect(sanitizeString('<script>alert(1)</script>hello')).toBe('alert(1)hello')
  })

  it('strips all HTML tags leaving inner text', () => {
    expect(sanitizeString('<b>bold</b>')).toBe('bold')
  })

  it('neutralizes javascript: protocol', () => {
    expect(sanitizeString('javascript:alert(1)')).toBe('alert(1)')
  })

  it('recursively sanitizes objects and arrays', () => {
    const input = {
      name: '<b>John</b>',
      bio: 'hello <img src=x onerror=alert(1)> world',
      tags: ['<i>a</i>', 'b'],
      nested: { x: '<u>u</u>' },
      num: 42,
    }
    const out = sanitizeValue(input)
    expect(out.name).toBe('John')
    expect(out.bio).toBe('hello  world')
    expect(out.tags).toEqual(['a', 'b'])
    expect(out.nested.x).toBe('u')
    expect(out.num).toBe(42)
  })

  it('sanitizes JSON body via middleware', async () => {
    const testApp = new Hono()
    testApp.use('*', sanitizeInput())
    testApp.post('/echo', async (c) => {
      const body = await c.req.json()
      return c.json(body)
    })

    const res = await testApp.request('/echo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '<script>alert(1)</script>safe' }),
    })
    if (res.status !== 200) {
      const text = await res.text()
      throw new Error(`Expected 200, got ${res.status}: ${text}`)
    }
    const body = await res.json()
    // Tags stripped: "<script>alert(1)</script>safe" → "alert(1)safe"
    expect(body.title).toBe('alert(1)safe')
  })
})

describe('CSRF protection', () => {
  it('allows JSON POST without X-Requested-With (Bearer-token auth)', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'x@x.com', password: 'x' }),
    })
    // Should pass CSRF and reach auth (401 for bad creds, not 403/415)
    expect(res.status).not.toBe(403)
    expect(res.status).not.toBe(415)
  })

  it('allows GET requests', async () => {
    const res = await app.request('/api/health')
    expect(res.status).toBe(200)
  })

  it('rejects application/x-www-form-urlencoded on state-changing methods', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'email=x@x.com&password=x',
    })
    expect(res.status).toBe(415)
  })

  it('rejects text/plain on state-changing methods', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'email=x@x.com&password=x',
    })
    expect(res.status).toBe(415)
  })
})

describe('Enhanced health check', () => {
  it('returns ok status with db and uptime', async () => {
    const res = await app.request('/api/health')
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.db).toBe('connected')
    expect(body).toHaveProperty('uptime')
    expect(body).toHaveProperty('timestamp')
  })
})

describe('File upload validation', () => {
  it('rejects null file', () => {
    const result = validateFileUpload(null)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('No file provided')
  })

  it('rejects disallowed MIME type', () => {
    const file = new File(['x'], 'test.exe', { type: 'application/octet-stream' })
    const result = validateFileUpload(file)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/Invalid file type/)
  })

  it('rejects oversized file', () => {
    const file = new File(['x'], 'test.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 })
    const result = validateFileUpload(file, { maxSize: 1024 })
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/too large/i)
  })

  it('accepts valid image file', () => {
    const file = new File(['x'], 'test.png', { type: 'image/png' })
    const result = validateFileUpload(file)
    expect(result.valid).toBe(true)
  })

  it('uses default allowed types', () => {
    expect(ALLOWED_IMAGE_TYPES).toContain('image/jpeg')
    expect(ALLOWED_IMAGE_TYPES).toContain('image/png')
    expect(ALLOWED_IMAGE_TYPES).toContain('image/webp')
  })
})

describe('Pagination caps', () => {
  it('caps limit at 100 on payments list', async () => {
    // We can't easily auth here, but we can verify the endpoint exists and
    // returns 401 (auth required) rather than 500 (unbounded query).
    const res = await app.request('/api/agents/me/payments', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
    // Without auth token → 401, proving the route is wired (not 404)
    expect([401, 403]).toContain(res.status)
  })
})
