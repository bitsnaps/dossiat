import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { errorHandler } from '@/server/middleware/errorHandler'

describe('errorHandler middleware', () => {
  it('catches errors and returns 500 with generic message', async () => {
    const app = new Hono()
    app.onError(errorHandler)
    app.get('/test', () => {
      throw new Error('Something broke')
    })

    const res = await app.request('/test')
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Internal server error')
  })

  it('catches custom AppError with specific status', async () => {
    const app = new Hono()
    app.onError(errorHandler)
    app.get('/test', () => {
      const err = new Error('Not found') as any
      err.status = 404
      throw err
    })

    const res = await app.request('/test')
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Not found')
  })

  it('passes through successful responses', async () => {
    const app = new Hono()
    app.onError(errorHandler)
    app.get('/test', (c) => c.json({ success: true }))

    const res = await app.request('/test')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})
