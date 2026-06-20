import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { AxiosResponse } from 'axios'

function createMockResponse(data: unknown, status = 200): AxiosResponse {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  }
}

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      defaults: { baseURL: 'http://localhost:3000/api' },
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}))

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:3000/api')
    mockGet.mockReset()
    mockPost.mockReset()
    mockPut.mockReset()
    mockDelete.mockReset()
  })

  describe('axios instance', () => {
    it('creates an axios instance with correct base URL', async () => {
      const axios = await import('axios')
      const { default: api } = await import('@/services/api')

      expect(axios.default.create).toHaveBeenCalledWith(
        expect.objectContaining({ baseURL: 'http://localhost:3000/api' }),
      )
      expect(api).toBeDefined()
    })

    it('exports the axios instance as default', async () => {
      const { default: api } = await import('@/services/api')
      expect(api).toBeDefined()
      expect(api.interceptors).toBeDefined()
    })
  })

  describe('get()', () => {
    it('calls GET with the given URL', async () => {
      mockGet.mockResolvedValueOnce(createMockResponse({ data: 'test' }))
      const { get } = await import('@/services/api')

      const result = await get('/missions')

      expect(mockGet).toHaveBeenCalledWith('/missions', undefined)
      expect(result).toEqual({ data: 'test' })
    })

    it('passes query params', async () => {
      mockGet.mockResolvedValueOnce(createMockResponse({ data: [] }))
      const { get } = await import('@/services/api')

      await get('/missions', { params: { status: 'active' } })

      expect(mockGet).toHaveBeenCalledWith('/missions', { params: { status: 'active' } })
    })
  })

  describe('post()', () => {
    it('calls POST with URL and data', async () => {
      mockPost.mockResolvedValueOnce(createMockResponse({ id: 1 }))
      const { post } = await import('@/services/api')

      const result = await post('/missions', { title: 'Test' })

      expect(mockPost).toHaveBeenCalledWith('/missions', { title: 'Test' }, undefined)
      expect(result).toEqual({ id: 1 })
    })
  })

  describe('put()', () => {
    it('calls PUT with URL and data', async () => {
      mockPut.mockResolvedValueOnce(createMockResponse({ updated: true }))
      const { put } = await import('@/services/api')

      const result = await put('/missions/1', { title: 'Updated' })

      expect(mockPut).toHaveBeenCalledWith('/missions/1', { title: 'Updated' }, undefined)
      expect(result).toEqual({ updated: true })
    })
  })

  describe('del()', () => {
    it('calls DELETE with URL', async () => {
      mockDelete.mockResolvedValueOnce(createMockResponse({ deleted: true }))
      const { del } = await import('@/services/api')

      const result = await del('/missions/1')

      expect(mockDelete).toHaveBeenCalledWith('/missions/1', undefined)
      expect(result).toEqual({ deleted: true })
    })
  })

  describe('response unwrapping', () => {
    it('returns full API response object', async () => {
      mockGet.mockResolvedValueOnce(
        createMockResponse({ success: true, data: { id: 1 }, message: 'OK' }),
      )
      const { get } = await import('@/services/api')

      const result = await get('/missions/1')

      expect(result).toEqual({ success: true, data: { id: 1 }, message: 'OK' })
    })
  })
})
