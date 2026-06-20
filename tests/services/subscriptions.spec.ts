import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

import { get, post, put, del } from '@/services/api'
import { getPlans, subscribe, getMySubscription, updateSubscription, cancelSubscription } from '@/services/subscriptions'

const mockGet = vi.mocked(get)
const mockPost = vi.mocked(post)
const mockPut = vi.mocked(put)
const mockDel = vi.mocked(del)

describe('Subscriptions Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPlans()', () => {
    it('calls GET /api/subscriptions/plans', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      const result = await getPlans()

      expect(mockGet).toHaveBeenCalledWith('/subscriptions/plans')
      expect(result).toEqual({ success: true, data: [] })
    })
  })

  describe('subscribe()', () => {
    it('calls POST /api/subscriptions with planId', async () => {
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await subscribe('plan-1')

      expect(mockPost).toHaveBeenCalledWith('/subscriptions', { planId: 'plan-1' })
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('getMySubscription()', () => {
    it('calls GET /api/subscriptions/me', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { id: 1, status: 'active' } } as any)

      const result = await getMySubscription()

      expect(mockGet).toHaveBeenCalledWith('/subscriptions/me')
      expect(result).toEqual({ success: true, data: { id: 1, status: 'active' } })
    })
  })

  describe('updateSubscription()', () => {
    it('calls PUT /api/subscriptions/me with planId', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const result = await updateSubscription('new-plan')

      expect(mockPut).toHaveBeenCalledWith('/subscriptions/me', { planId: 'new-plan' })
      expect(result).toEqual({ success: true })
    })
  })

  describe('cancelSubscription()', () => {
    it('calls DELETE /api/subscriptions/me', async () => {
      mockDel.mockResolvedValueOnce({ success: true } as any)

      const result = await cancelSubscription()

      expect(mockDel).toHaveBeenCalledWith('/subscriptions/me')
      expect(result).toEqual({ success: true })
    })
  })
})
