import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

import { get, post, put } from '@/services/api'
import { getDisputes, getDispute, sendMessage, resolveDispute, escalateDispute } from '@/services/disputes'

const mockGet = vi.mocked(get)
const mockPost = vi.mocked(post)
const mockPut = vi.mocked(put)

describe('Disputes Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDisputes()', () => {
    it('calls GET /api/disputes', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      const result = await getDisputes()

      expect(mockGet).toHaveBeenCalledWith('/disputes')
      expect(result).toEqual({ success: true, data: [] })
    })
  })

  describe('getDispute()', () => {
    it('calls GET /api/disputes/:id', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await getDispute('1')

      expect(mockGet).toHaveBeenCalledWith('/disputes/1')
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('sendMessage()', () => {
    it('calls POST /api/disputes/:id/messages with content', async () => {
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await sendMessage('1', 'I disagree')

      expect(mockPost).toHaveBeenCalledWith('/disputes/1/messages', { content: 'I disagree' })
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('resolveDispute()', () => {
    it('calls PUT /api/disputes/:id/resolve with resolution', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const result = await resolveDispute('1', 'Resolved by agreement')

      expect(mockPut).toHaveBeenCalledWith('/disputes/1/resolve', { resolution: 'Resolved by agreement' })
      expect(result).toEqual({ success: true })
    })
  })

  describe('escalateDispute()', () => {
    it('calls PUT /api/disputes/:id/escalate', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const result = await escalateDispute('1')

      expect(mockPut).toHaveBeenCalledWith('/disputes/1/escalate')
      expect(result).toEqual({ success: true })
    })
  })
})
