import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/messages', () => ({
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
  markAsRead: vi.fn(),
  getUnreadCount: vi.fn(),
}))

import * as messagesService from '@/services/messages'
import { useMessagesStore } from '@/stores/messages'

const mockGetMessages = vi.mocked(messagesService.getMessages)
const mockSendMessage = vi.mocked(messagesService.sendMessage)
const mockMarkAsRead = vi.mocked(messagesService.markAsRead)
const mockGetUnreadCount = vi.mocked(messagesService.getUnreadCount)

describe('Messages Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('has empty messages list', () => {
      const store = useMessagesStore()
      expect(store.messages).toEqual([])
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('fetchMessages()', () => {
    it('loads messages from API', async () => {
      const messages = [{ id: 1, conversationId: 1, senderId: 1, content: 'Hello' }]
      mockGetMessages.mockResolvedValueOnce({ success: true, data: messages } as any)

      const store = useMessagesStore()
      await store.fetchMessages('1')

      expect(store.messages).toEqual(messages)
    })

    it('sets error on failure', async () => {
      mockGetMessages.mockRejectedValueOnce(new Error('Failed'))

      const store = useMessagesStore()
      await store.fetchMessages('1')

      expect(store.error).toBe('Failed')
    })
  })

  describe('sendMessage()', () => {
    it('appends new message to list', async () => {
      const newMessage = { id: 2, conversationId: 1, senderId: 1, content: 'Hi there' }
      mockSendMessage.mockResolvedValueOnce({ success: true, data: newMessage } as any)

      const store = useMessagesStore()
      const result = await store.sendMessage('1', 'Hi there')

      expect(store.messages).toContainEqual(newMessage)
      expect(result).toEqual(newMessage)
    })
  })

  describe('markAsRead()', () => {
    it('marks message as read', async () => {
      mockMarkAsRead.mockResolvedValueOnce({ success: true } as any)

      const store = useMessagesStore()
      store.messages = [{ id: 1, conversationId: 1, senderId: 1, content: 'Hello' }]
      store.unreadCount = 1

      await store.markAsRead('1')

      expect(store.messages[0].readAt).toBeDefined()
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('fetchUnreadCount()', () => {
    it('loads unread count', async () => {
      mockGetUnreadCount.mockResolvedValueOnce({ success: true, data: { count: 5 } } as any)

      const store = useMessagesStore()
      await store.fetchUnreadCount()

      expect(store.unreadCount).toBe(5)
    })
  })
})
