import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { validateRequest, validators } from '@/server/middleware/validateRequest'

describe('validateRequest middleware', () => {
  it('passes when validation succeeds', async () => {
    const app = new Hono()
    app.post('/test', validateRequest({
      body: {
        name: validators.required(),
        email: validators.email(),
      },
    }), (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John', email: 'john@test.com' }),
    })

    expect(res.status).toBe(200)
  })

  it('returns 422 when required field is missing', async () => {
    const app = new Hono()
    app.post('/test', validateRequest({
      body: { name: validators.required() },
    }), (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.success).toBe(false)
    expect(body.error).toContain('name: is required')
  })

  it('returns 422 for invalid email', async () => {
    const app = new Hono()
    app.post('/test', validateRequest({
      body: { email: validators.email() },
    }), (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    })
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.error).toContain('email')
  })

  it('returns 400 for invalid JSON body', async () => {
    const app = new Hono()
    app.post('/test', validateRequest({
      body: { name: validators.required() },
    }), (c) => c.json({ ok: true }))

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    })

    expect(res.status).toBe(400)
  })

  it('validates query parameters', async () => {
    const app = new Hono()
    app.get('/test', validateRequest({
      query: { page: validators.required() },
    }), (c) => c.json({ ok: true }))

    const res = await app.request('/test')
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.error).toContain('page')
  })

  it('validates route params', async () => {
    const app = new Hono()
    app.get('/test/:id', validateRequest({
      params: { id: validators.required() },
    }), (c) => c.json({ ok: true }))

    const res = await app.request('/test/123')
    expect(res.status).toBe(200)
  })
})

describe('validators', () => {
  it('required returns error for empty values', () => {
    const v = validators.required()
    expect(v('')).not.toBeNull()
    expect(v(null)).not.toBeNull()
    expect(v(undefined)).not.toBeNull()
    expect(v('hello')).toBeNull()
  })

  it('email validates format', () => {
    const v = validators.email()
    expect(v('bad')).not.toBeNull()
    expect(v('a@b.com')).toBeNull()
  })

  it('minLength validates', () => {
    const v = validators.minLength(3)
    expect(v('ab')).not.toBeNull()
    expect(v('abc')).toBeNull()
  })

  it('isIn validates', () => {
    const v = validators.isIn(['a', 'b', 'c'])
    expect(v('d')).not.toBeNull()
    expect(v('a')).toBeNull()
  })

  it('skips validation for undefined/null in optional validators', () => {
    expect(validators.email()(undefined)).toBeNull()
    expect(validators.minLength(3)(null)).toBeNull()
  })
})
