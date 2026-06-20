import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

import { get, put } from '@/services/api'
import { useNotificationsStore } from '@/stores/notifications'

const mockGet = vi.mocked(get)
const mockPut = vi.mocked(put)

describe('Notifications Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('has empty notifications', () => {
      const store = useNotificationsStore()
      expect(store.notifications).toEqual([])
      expect(store.unreadCount).toBe(0)
    })
  })

  describe('fetchNotifications()', () => {
    it('loads notifications from API', async () => {
      const notifications = [
        { id: 1, userId: 1, type: 'mission', title: 'New Mission', body: 'You have a new mission', readAt: null },
        { id: 2, userId: 1, type: 'message', title: 'New Message', body: 'Hello', readAt: '2026-01-01' },
      ]
      mockGet.mockResolvedValueOnce({ success: true, data: notifications } as any)

      const store = useNotificationsStore()
      await store.fetchNotifications()

      expect(store.notifications).toEqual(notifications)
    })
  })

  describe('unreadCount', () => {
    it('counts unread notifications', async () => {
      mockGet.mockResolvedValueOnce({
        success: true,
        data: [
          { id: 1, userId: 1, type: 'a', title: 'A', body: '', readAt: null },
          { id: 2, userId: 1, type: 'b', title: 'B', body: '', readAt: '2026-01-01' },
          { id: 3, userId: 1, type: 'c', title: 'C', body: '', readAt: null },
        ],
      } as any)

      const store = useNotificationsStore()
      await store.fetchNotifications()

      expect(store.unreadCount).toBe(2)
    })
  })

  describe('markAsRead()', () => {
    it('marks notification as read', async () => {
      mockGet.mockResolvedValueOnce({
        success: true,
        data: [{ id: 1, userId: 1, type: 'a', title: 'A', body: '', readAt: null }],
      } as any)
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const store = useNotificationsStore()
      await store.fetchNotifications()
      await store.markAsRead('1')

      expect(store.notifications[0].readAt).toBeDefined()
    })
  })

  describe('markAllAsRead()', () => {
    it('marks all notifications as read', async () => {
      mockGet.mockResolvedValueOnce({
        success: true,
        data: [
          { id: 1, userId: 1, type: 'a', title: 'A', body: '', readAt: null },
          { id: 2, userId: 1, type: 'b', title: 'B', body: '', readAt: null },
        ],
      } as any)
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const store = useNotificationsStore()
      await store.fetchNotifications()
      await store.markAllAsRead()

      expect(store.unreadCount).toBe(0)
    })
  })
})
