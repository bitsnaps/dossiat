import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
}))

import { get, post, put, patch, del } from '@/services/api'
import * as admin from '@/services/admin'

const mockGet = vi.mocked(get)
const mockPost = vi.mocked(post)
const mockPut = vi.mocked(put)
const mockPatch = vi.mocked(patch)
const mockDel = vi.mocked(del)

describe('Admin Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Stats ───

  describe('getStats()', () => {
    it('calls GET /admin/stats', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { totalUsers: 10 } } as any)

      const result = await admin.getStats()

      expect(mockGet).toHaveBeenCalledWith('/admin/stats')
      expect(result).toEqual({ success: true, data: { totalUsers: 10 } })
    })
  })

  describe('getRevenueStats()', () => {
    it('calls GET /admin/stats/revenue without params', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { breakdown: [] } } as any)

      const result = await admin.getRevenueStats()

      expect(mockGet).toHaveBeenCalledWith('/admin/stats/revenue', { params: undefined })
      expect(result).toEqual({ success: true, data: { breakdown: [] } })
    })

    it('calls GET /admin/stats/revenue with params', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { breakdown: [] } } as any)

      await admin.getRevenueStats({ period: 'daily', from: '2026-01-01', to: '2026-07-08' })

      expect(mockGet).toHaveBeenCalledWith('/admin/stats/revenue', { params: { period: 'daily', from: '2026-01-01', to: '2026-07-08' } })
    })
  })

  describe('getActivityFeed()', () => {
    it('calls GET /admin/stats/activity without params', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      const result = await admin.getActivityFeed()

      expect(mockGet).toHaveBeenCalledWith('/admin/stats/activity', { params: undefined })
      expect(result).toEqual({ success: true, data: [] })
    })

    it('calls GET /admin/stats/activity with limit', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      await admin.getActivityFeed({ limit: 50 })

      expect(mockGet).toHaveBeenCalledWith('/admin/stats/activity', { params: { limit: 50 } })
    })
  })

  // ─── Users ───

  describe('getUsers()', () => {
    it('calls GET /admin/users with params', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      await admin.getUsers({ page: 1, role: 'agent', search: 'John' })

      expect(mockGet).toHaveBeenCalledWith('/admin/users', { params: { page: 1, role: 'agent', search: 'John' } })
    })

    it('calls GET /admin/users without params', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      await admin.getUsers()

      expect(mockGet).toHaveBeenCalledWith('/admin/users', { params: undefined })
    })
  })

  describe('getUser()', () => {
    it('calls GET /admin/users/:id', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await admin.getUser('1')

      expect(mockGet).toHaveBeenCalledWith('/admin/users/1')
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('createUser()', () => {
    it('calls POST /admin/users with data', async () => {
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1, email: 'new@test.com' } } as any)

      const data = { email: 'new@test.com', firstName: 'New', lastName: 'User', role: 'client', password: 'Pass123!' }
      const result = await admin.createUser(data)

      expect(mockPost).toHaveBeenCalledWith('/admin/users', data)
      expect(result).toEqual({ success: true, data: { id: 1, email: 'new@test.com' } })
    })
  })

  describe('updateUser()', () => {
    it('calls PUT /admin/users/:id with data', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const result = await admin.updateUser('1', { role: 'agent', emailVerified: true })

      expect(mockPut).toHaveBeenCalledWith('/admin/users/1', { role: 'agent', emailVerified: true })
      expect(result).toEqual({ success: true })
    })

    it('sends firstName, lastName and email in payload', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      const payload = { firstName: 'New', lastName: 'Name', email: 'new@test.com' }
      await admin.updateUser('1', payload)

      expect(mockPut).toHaveBeenCalledWith('/admin/users/1', payload)
    })
  })

  describe('resetUserPassword()', () => {
    it('calls PATCH /admin/users/:id/reset-password with password', async () => {
      mockPatch.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const result = await admin.resetUserPassword('1', 'NewPass456!')

      expect(mockPatch).toHaveBeenCalledWith('/admin/users/1/reset-password', { password: 'NewPass456!' })
      expect(result).toEqual({ success: true, data: { id: 1 } })
    })
  })

  describe('deactivateUser()', () => {
    it('calls PATCH /admin/users/:id/deactivate', async () => {
      mockPatch.mockResolvedValueOnce({ success: true, data: { id: 1, emailVerified: false } } as any)

      const result = await admin.deactivateUser('1')

      expect(mockPatch).toHaveBeenCalledWith('/admin/users/1/deactivate')
      expect(result).toEqual({ success: true, data: { id: 1, emailVerified: false } })
    })
  })

  describe('activateUser()', () => {
    it('calls PATCH /admin/users/:id/activate', async () => {
      mockPatch.mockResolvedValueOnce({ success: true, data: { id: 1, emailVerified: true } } as any)

      const result = await admin.activateUser('1')

      expect(mockPatch).toHaveBeenCalledWith('/admin/users/1/activate')
      expect(result).toEqual({ success: true, data: { id: 1, emailVerified: true } })
    })
  })

  describe('deleteUser()', () => {
    it('calls DELETE /admin/users/:id', async () => {
      mockDel.mockResolvedValueOnce({ success: true } as any)

      const result = await admin.deleteUser('1')

      expect(mockDel).toHaveBeenCalledWith('/admin/users/1')
      expect(result).toEqual({ success: true })
    })
  })

  // ─── Missions ───

  describe('getMissions()', () => {
    it('calls GET /admin/missions with params', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      await admin.getMissions({ status: 'in_progress', search: 'test' })

      expect(mockGet).toHaveBeenCalledWith('/admin/missions', { params: { status: 'in_progress', search: 'test' } })
    })
  })

  describe('getMission()', () => {
    it('calls GET /admin/missions/:id', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      await admin.getMission('1')

      expect(mockGet).toHaveBeenCalledWith('/admin/missions/1')
    })
  })

  describe('createMission()', () => {
    it('calls POST /admin/missions with data', async () => {
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1, title: 'New Mission' } } as any)

      const data = { agentId: 1, clientId: 2, title: 'New Mission', type: 'one_time', pricingType: 'fixed' }
      const result = await admin.createMission(data)

      expect(mockPost).toHaveBeenCalledWith('/admin/missions', data)
      expect(result).toEqual({ success: true, data: { id: 1, title: 'New Mission' } })
    })
  })

  describe('updateMission()', () => {
    it('calls PUT /admin/missions/:id with data', async () => {
      mockPut.mockResolvedValueOnce({ success: true, data: { id: 1, title: 'Updated' } } as any)

      const result = await admin.updateMission('1', { title: 'Updated', agreedAmount: 200 })

      expect(mockPut).toHaveBeenCalledWith('/admin/missions/1', { title: 'Updated', agreedAmount: 200 })
      expect(result).toEqual({ success: true, data: { id: 1, title: 'Updated' } })
    })
  })

  describe('deleteMission()', () => {
    it('calls DELETE /admin/missions/:id', async () => {
      mockDel.mockResolvedValueOnce({ success: true } as any)

      const result = await admin.deleteMission('1')

      expect(mockDel).toHaveBeenCalledWith('/admin/missions/1')
      expect(result).toEqual({ success: true })
    })
  })

  describe('updateMissionStatus()', () => {
    it('calls PUT /admin/missions/:id/status', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      await admin.updateMissionStatus('1', 'completed')

      expect(mockPut).toHaveBeenCalledWith('/admin/missions/1/status', { status: 'completed' })
    })
  })

  // ─── Payments ───

  describe('getPayments()', () => {
    it('calls GET /admin/payments with params', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      await admin.getPayments({ status: 'confirmed', method: 'stripe' })

      expect(mockGet).toHaveBeenCalledWith('/admin/payments', { params: { status: 'confirmed', method: 'stripe' } })
    })
  })

  describe('getPayment()', () => {
    it('calls GET /admin/payments/:id', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      await admin.getPayment('1')

      expect(mockGet).toHaveBeenCalledWith('/admin/payments/1')
    })
  })

  describe('createPayment()', () => {
    it('calls POST /admin/payments with data', async () => {
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1, amount: 100, method: 'cash' } } as any)

      const data = { missionId: 1, payerId: 2, payeeId: 3, amount: 100, method: 'cash' }
      const result = await admin.createPayment(data)

      expect(mockPost).toHaveBeenCalledWith('/admin/payments', data)
      expect(result).toEqual({ success: true, data: { id: 1, amount: 100, method: 'cash' } })
    })
  })

  describe('updatePayment()', () => {
    it('calls PUT /admin/payments/:id with data', async () => {
      mockPut.mockResolvedValueOnce({ success: true, data: { id: 1, amount: 200 } } as any)

      const result = await admin.updatePayment('1', { amount: 200, method: 'stripe' })

      expect(mockPut).toHaveBeenCalledWith('/admin/payments/1', { amount: 200, method: 'stripe' })
      expect(result).toEqual({ success: true, data: { id: 1, amount: 200 } })
    })
  })

  describe('deletePayment()', () => {
    it('calls DELETE /admin/payments/:id', async () => {
      mockDel.mockResolvedValueOnce({ success: true } as any)

      const result = await admin.deletePayment('1')

      expect(mockDel).toHaveBeenCalledWith('/admin/payments/1')
      expect(result).toEqual({ success: true })
    })
  })

  describe('updatePaymentStatus()', () => {
    it('calls PATCH /admin/payments/:id/status', async () => {
      mockPatch.mockResolvedValueOnce({ success: true } as any)

      await admin.updatePaymentStatus('1', 'confirmed')

      expect(mockPatch).toHaveBeenCalledWith('/admin/payments/1/status', { status: 'confirmed' })
    })
  })

  // ─── Disputes ───

  describe('getDisputes()', () => {
    it('calls GET /admin/disputes with params', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      await admin.getDisputes({ status: 'open' })

      expect(mockGet).toHaveBeenCalledWith('/admin/disputes', { params: { status: 'open' } })
    })
  })

  describe('getDispute()', () => {
    it('calls GET /admin/disputes/:id', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      await admin.getDispute('1')

      expect(mockGet).toHaveBeenCalledWith('/admin/disputes/1')
    })
  })

  describe('createDispute()', () => {
    it('calls POST /admin/disputes with data', async () => {
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1, reason: 'Issue' } } as any)

      const data = { missionId: 1, initiatedBy: 2, reason: 'Issue' }
      const result = await admin.createDispute(data)

      expect(mockPost).toHaveBeenCalledWith('/admin/disputes', data)
      expect(result).toEqual({ success: true, data: { id: 1, reason: 'Issue' } })
    })
  })

  describe('updateDispute()', () => {
    it('calls PUT /admin/disputes/:id with data', async () => {
      mockPut.mockResolvedValueOnce({ success: true, data: { id: 1, reason: 'Updated' } } as any)

      const result = await admin.updateDispute('1', { reason: 'Updated' })

      expect(mockPut).toHaveBeenCalledWith('/admin/disputes/1', { reason: 'Updated' })
      expect(result).toEqual({ success: true, data: { id: 1, reason: 'Updated' } })
    })
  })

  describe('deleteDispute()', () => {
    it('calls DELETE /admin/disputes/:id', async () => {
      mockDel.mockResolvedValueOnce({ success: true } as any)

      const result = await admin.deleteDispute('1')

      expect(mockDel).toHaveBeenCalledWith('/admin/disputes/1')
      expect(result).toEqual({ success: true })
    })
  })

  describe('resolveDispute()', () => {
    it('calls PUT /admin/disputes/:id/resolve', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      await admin.resolveDispute('1', 'Issue resolved by admin')

      expect(mockPut).toHaveBeenCalledWith('/admin/disputes/1/resolve', { resolution: 'Issue resolved by admin' })
    })
  })

  describe('escalateDispute()', () => {
    it('calls PUT /admin/disputes/:id/escalate', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      await admin.escalateDispute('1')

      expect(mockPut).toHaveBeenCalledWith('/admin/disputes/1/escalate')
    })
  })

  describe('updateDisputeStatus()', () => {
    it('calls PATCH /admin/disputes/:id/status', async () => {
      mockPatch.mockResolvedValueOnce({ success: true } as any)

      await admin.updateDisputeStatus('1', 'reconciling')

      expect(mockPatch).toHaveBeenCalledWith('/admin/disputes/1/status', { status: 'reconciling' })
    })
  })

  describe('sendDisputeMessage()', () => {
    it('calls POST /admin/disputes/:id/messages', async () => {
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1, content: 'Hello' } } as any)

      await admin.sendDisputeMessage('1', 'Hello')

      expect(mockPost).toHaveBeenCalledWith('/admin/disputes/1/messages', { content: 'Hello' })
    })
  })

  // ─── Subscription Plans ───

  describe('getPlans()', () => {
    it('calls GET /admin/subscription-plans', async () => {
      mockGet.mockResolvedValueOnce({ success: true, data: [] } as any)

      await admin.getPlans()

      expect(mockGet).toHaveBeenCalledWith('/admin/subscription-plans')
    })
  })

  describe('createPlan()', () => {
    it('calls POST /admin/subscription-plans', async () => {
      mockPost.mockResolvedValueOnce({ success: true, data: { id: 1 } } as any)

      const data = { name: 'enterprise', price: 999 }
      await admin.createPlan(data as any)

      expect(mockPost).toHaveBeenCalledWith('/admin/subscription-plans', data)
    })
  })

  describe('updatePlan()', () => {
    it('calls PUT /admin/subscription-plans/:id', async () => {
      mockPut.mockResolvedValueOnce({ success: true } as any)

      await admin.updatePlan('1', { price: 599 })

      expect(mockPut).toHaveBeenCalledWith('/admin/subscription-plans/1', { price: 599 })
    })
  })

  describe('deletePlan()', () => {
    it('calls DELETE /admin/subscription-plans/:id', async () => {
      mockDel.mockResolvedValueOnce({ success: true } as any)

      await admin.deletePlan('1')

      expect(mockDel).toHaveBeenCalledWith('/admin/subscription-plans/1')
    })
  })
})
