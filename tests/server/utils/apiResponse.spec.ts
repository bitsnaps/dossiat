import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import { successResponse, errorResponse, paginatedResponse } from '@/server/utils/apiResponse'

function createTestApp(handler: (c: any) => any) {
  const app = new Hono()
  app.get('/test', handler)
  return app
}

describe('apiResponse', () => {
  describe('successResponse', () => {
    it('returns success with data', async () => {
      const app = createTestApp((c) => successResponse(c, { id: 1 }))
      const res = await app.request('/test')
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toEqual({ id: 1 })
    })

    it('includes message when provided', async () => {
      const app = createTestApp((c) => successResponse(c, { id: 1 }, 'Created'))
      const res = await app.request('/test')
      const body = await res.json()

      expect(body.message).toBe('Created')
    })

    it('uses custom status code', async () => {
      const app = createTestApp((c) => successResponse(c, { id: 1 }, undefined, 201))
      const res = await app.request('/test')

      expect(res.status).toBe(201)
    })
  })

  describe('errorResponse', () => {
    it('returns error with 400 by default', async () => {
      const app = createTestApp((c) => errorResponse(c, 'Bad request'))
      const res = await app.request('/test')
      const body = await res.json()

      expect(res.status).toBe(400)
      expect(body.success).toBe(false)
      expect(body.error).toBe('Bad request')
    })

    it('uses custom status code', async () => {
      const app = createTestApp((c) => errorResponse(c, 'Not found', 404))
      const res = await app.request('/test')

      expect(res.status).toBe(404)
    })
  })

  describe('paginatedResponse', () => {
    it('returns paginated data with meta', async () => {
      const app = createTestApp((c) => paginatedResponse(c, [{ id: 1 }, { id: 2 }], 50, 1, 10))
      const res = await app.request('/test')
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(2)
      expect(body.meta).toEqual({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
      })
    })

    it('calculates totalPages correctly for uneven division', async () => {
      const app = createTestApp((c) => paginatedResponse(c, [], 11, 1, 10))
      const res = await app.request('/test')
      const body = await res.json()

      expect(body.meta.totalPages).toBe(2)
    })
  })
})
