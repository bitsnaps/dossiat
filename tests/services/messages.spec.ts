import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

import { get, post } from '@/services/api'
import { getMessages, sendMessage, markAsRead, getUnreadCount, getConversations, markAllAsRead } from '@/services/messages'

const mockGet = vi.mocked(get)
const mockPost = vi.mocked(post)

describe('Messages Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMessages()', () => {
    it('calls GET /api/missions/:id/messages with default params', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      const result = await getMessages('1')

      expect(mockGet).toHaveBeenCalledWith('/missions/1/messages', { params: { page: 1, limit: 50 } })
      expect(result).toEqual({ success: true, data: [] })
    })
  })

  describe('sendMessage()', () => {
    it('calls POST /api/missions/:id/messages with content', async () => {
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await sendMessage('1', 'Hello!')

      expect(mockPost).toHaveBeenCalledWith('/missions/1/messages', { content: 'Hello!' })
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('markAsRead()', () => {
    it('calls POST /api/messages/:id/read', async () => {
      mockPost.mockResolvedValueOnce({ success: true } as any)

      const result = await markAsRead('1')

      expect(mockPost).toHaveBeenCalledWith('/messages/1/read')
      expect(result).toEqual({ success: true })
    })
  })

  describe('getUnreadCount()', () => {
    it('calls GET /api/messages/unread-count', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { count: 5 } } as any)

      const result = await getUnreadCount()

      expect(mockGet).toHaveBeenCalledWith('/messages/unread-count')
      expect(result).toEqual({ success: true, data: { count: 5 } })
    })
  })
})
