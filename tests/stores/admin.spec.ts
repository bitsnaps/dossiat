import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/admin', () => ({
  getStats: vi.fn(),
  getRevenueStats: vi.fn(),
  getActivityFeed: vi.fn(),
  getUsers: vi.fn(),
  getUser: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  resetUserPassword: vi.fn(),
  deactivateUser: vi.fn(),
  activateUser: vi.fn(),
  deleteUser: vi.fn(),
  getMissions: vi.fn(),
  getMission: vi.fn(),
  createMission: vi.fn(),
  updateMission: vi.fn(),
  deleteMission: vi.fn(),
  updateMissionStatus: vi.fn(),
  getPayments: vi.fn(),
  getPayment: vi.fn(),
  createPayment: vi.fn(),
  updatePayment: vi.fn(),
  deletePayment: vi.fn(),
  updatePaymentStatus: vi.fn(),
  getDisputes: vi.fn(),
  getDispute: vi.fn(),
  createDispute: vi.fn(),
  updateDispute: vi.fn(),
  deleteDispute: vi.fn(),
  resolveDispute: vi.fn(),
  escalateDispute: vi.fn(),
  updateDisputeStatus: vi.fn(),
  sendDisputeMessage: vi.fn(),
  getPlans: vi.fn(),
  createPlan: vi.fn(),
  updatePlan: vi.fn(),
  deletePlan: vi.fn(),
}))

import * as adminService from '@/services/admin'
import { useAdminStore } from '@/stores/admin'

const mockGetStats = vi.mocked(adminService.getStats)
const mockGetRevenueStats = vi.mocked(adminService.getRevenueStats)
const mockGetActivityFeed = vi.mocked(adminService.getActivityFeed)
const mockGetUsers = vi.mocked(adminService.getUsers)
const mockGetUser = vi.mocked(adminService.getUser)
const mockCreateUser = vi.mocked(adminService.createUser)
const mockUpdateUser = vi.mocked(adminService.updateUser)
const mockResetUserPassword = vi.mocked(adminService.resetUserPassword)
const mockDeactivateUser = vi.mocked(adminService.deactivateUser)
const mockActivateUser = vi.mocked(adminService.activateUser)
const mockDeleteUser = vi.mocked(adminService.deleteUser)
const mockGetMissions = vi.mocked(adminService.getMissions)
const mockGetMission = vi.mocked(adminService.getMission)
const mockCreateMission = vi.mocked(adminService.createMission)
const mockUpdateMission = vi.mocked(adminService.updateMission)
const mockDeleteMission = vi.mocked(adminService.deleteMission)
const mockGetPayments = vi.mocked(adminService.getPayments)
const mockGetPayment = vi.mocked(adminService.getPayment)
const mockCreatePayment = vi.mocked(adminService.createPayment)
const mockUpdatePayment = vi.mocked(adminService.updatePayment)
const mockDeletePayment = vi.mocked(adminService.deletePayment)
const mockUpdatePaymentStatus = vi.mocked(adminService.updatePaymentStatus)
const mockGetDisputes = vi.mocked(adminService.getDisputes)
const mockGetDispute = vi.mocked(adminService.getDispute)
const mockCreateDispute = vi.mocked(adminService.createDispute)
const mockUpdateDispute = vi.mocked(adminService.updateDispute)
const mockDeleteDispute = vi.mocked(adminService.deleteDispute)
const mockResolveDispute = vi.mocked(adminService.resolveDispute)
const mockEscalateDispute = vi.mocked(adminService.escalateDispute)
const mockUpdateDisputeStatus = vi.mocked(adminService.updateDisputeStatus)
const mockSendDisputeMessage = vi.mocked(adminService.sendDisputeMessage)
const mockGetPlans = vi.mocked(adminService.getPlans)
const mockCreatePlan = vi.mocked(adminService.createPlan)

describe('Admin Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('has empty arrays for all entities', () => {
      const store = useAdminStore()
      expect(store.users).toEqual([])
      expect(store.missions).toEqual([])
      expect(store.payments).toEqual([])
      expect(store.disputes).toEqual([])
      expect(store.plans).toEqual([])
      expect(store.stats).toBeNull()
      expect(store.selectedUser).toBeNull()
    })

    it('is not loading initially', () => {
      const store = useAdminStore()
      expect(store.loading).toEqual({})
      expect(store.error).toBeNull()
    })
  })

  describe('fetchStats()', () => {
    it('loads stats from API', async () => {
      mockGetStats.mockResolvedValueOnce({
        data: { totalUsers: 10, totalMissions: 5, totalDisputes: 2, openDisputes: 1, totalRevenue: 500 },
      } as any)

      const store = useAdminStore()
      await store.fetchStats()

      expect(store.stats).toEqual({ totalUsers: 10, totalMissions: 5, totalDisputes: 2, openDisputes: 1, totalRevenue: 500 })
    })

    it('sets error on failure', async () => {
      mockGetStats.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await store.fetchStats()

      expect(store.error).toBe('Failed')
      expect(store.stats).toBeNull()
    })
  })

  describe('fetchRevenueStats()', () => {
    it('loads revenue stats from API', async () => {
      mockGetRevenueStats.mockResolvedValueOnce({
        data: {
          period: 'monthly',
          from: '2025-08-01',
          to: '2026-07-08',
          breakdown: [{ periodStart: '2026-07-01', periodEnd: '2026-08-01', label: 'Jul 2026', grossAmount: 1000, platformFee: 10, gatewayFee: 30, netAmount: 960, paymentCount: 5 }],
          totals: { grossAmount: 1000, platformFee: 10, gatewayFee: 30, netAmount: 960, paymentCount: 5 },
          byMethod: [{ method: 'cash', grossAmount: 1000, platformFee: 10, gatewayFee: 0, netAmount: 990, paymentCount: 5 }],
        },
      } as any)

      const store = useAdminStore()
      await store.fetchRevenueStats({ period: 'monthly' })

      expect(mockGetRevenueStats).toHaveBeenCalledWith({ period: 'monthly' })
      expect(store.revenueStats).not.toBeNull()
      expect(store.revenueStats!.period).toBe('monthly')
      expect(store.revenueStats!.breakdown.length).toBe(1)
    })

    it('sets error on failure', async () => {
      mockGetRevenueStats.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await store.fetchRevenueStats()

      expect(store.error).toBe('Failed')
      expect(store.revenueStats).toBeNull()
    })
  })

  describe('fetchActivityFeed()', () => {
    it('loads activity feed from API', async () => {
      mockGetActivityFeed.mockResolvedValueOnce({
        data: [
          { type: 'mission_created', id: 'mission:1', createdAt: '2026-07-08T10:00:00.000Z', summary: 'Mission created', actor: null, context: {} },
          { type: 'user_registered', id: 'user:2', createdAt: '2026-07-08T09:00:00.000Z', summary: 'New agent registered', actor: null, context: {} },
        ],
      } as any)

      const store = useAdminStore()
      await store.fetchActivityFeed({ limit: 50 })

      expect(mockGetActivityFeed).toHaveBeenCalledWith({ limit: 50 })
      expect(store.activityFeed.length).toBe(2)
      expect(store.activityFeed[0].type).toBe('mission_created')
    })

    it('sets error on failure', async () => {
      mockGetActivityFeed.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await store.fetchActivityFeed()

      expect(store.error).toBe('Failed')
      expect(store.activityFeed).toEqual([])
    })
  })

  describe('fetchUsers()', () => {
    it('loads users from API', async () => {
      mockGetUsers.mockResolvedValueOnce({
        data: [{ id: 1, firstName: 'John', role: 'agent' }],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      } as any)

      const store = useAdminStore()
      await store.fetchUsers()

      expect(store.users.length).toBe(1)
      expect(store.users[0].firstName).toBe('John')
    })
  })

  describe('fetchUser()', () => {
    it('loads selected user from API', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { id: 1, firstName: 'John', role: 'agent' },
      } as any)

      const store = useAdminStore()
      await store.fetchUser('1')

      expect(store.selectedUser).toEqual({ id: 1, firstName: 'John', role: 'agent' })
    })
  })

  describe('createUser()', () => {
    it('adds new user to store', async () => {
      mockCreateUser.mockResolvedValueOnce({
        data: { id: 3, firstName: 'New', lastName: 'User', role: 'client', emailVerified: false },
      } as any)

      const store = useAdminStore()
      await store.createUser({ email: 'new@test.com', firstName: 'New', lastName: 'User', role: 'client', password: 'Pass123!' })

      expect(store.users.length).toBe(1)
      expect(store.users[0].firstName).toBe('New')
    })

    it('throws on failure', async () => {
      mockCreateUser.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.createUser({ email: 'new@test.com', firstName: 'New', lastName: 'User', password: 'Pass123!' })).rejects.toThrow()
    })
  })

  describe('updateUser()', () => {
    it('updates user in store', async () => {
      mockGetUsers.mockResolvedValueOnce({
        data: [{ id: 1, firstName: 'John', role: 'client' }],
      } as any)
      mockUpdateUser.mockResolvedValueOnce({
        data: { id: 1, firstName: 'John', role: 'agent' },
      } as any)

      const store = useAdminStore()
      await store.fetchUsers()
      await store.updateUser('1', { role: 'agent' })

      expect(store.users[0].role).toBe('agent')
    })

    it('updates firstName, lastName and email', async () => {
      mockUpdateUser.mockResolvedValueOnce({
        data: { id: 1, firstName: 'New', lastName: 'Name', email: 'new@test.com', role: 'client' },
      } as any)

      const store = useAdminStore()
      await store.updateUser('1', { firstName: 'New', lastName: 'Name', email: 'new@test.com' })

      expect(mockUpdateUser).toHaveBeenCalledWith('1', { firstName: 'New', lastName: 'Name', email: 'new@test.com' })
    })
  })

  describe('resetUserPassword()', () => {
    it('calls the service with id and password', async () => {
      mockResetUserPassword.mockResolvedValueOnce({
        data: { id: 1 },
      } as any)

      const store = useAdminStore()
      const result = await store.resetUserPassword('1', 'NewPass456!')

      expect(mockResetUserPassword).toHaveBeenCalledWith('1', 'NewPass456!')
      expect(result).toEqual({ id: 1 })
    })

    it('throws on failure', async () => {
      mockResetUserPassword.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.resetUserPassword('1', 'NewPass456!')).rejects.toThrow()
    })
  })

  describe('deactivateUser()', () => {
    it('sets user emailVerified to false in store', async () => {
      mockGetUsers.mockResolvedValueOnce({
        data: [{ id: 1, firstName: 'John', emailVerified: true }],
      } as any)
      mockDeactivateUser.mockResolvedValueOnce({
        data: { id: 1, firstName: 'John', emailVerified: false },
      } as any)

      const store = useAdminStore()
      await store.fetchUsers()
      expect(store.users[0].emailVerified).toBe(true)

      await store.deactivateUser('1')
      expect(store.users[0].emailVerified).toBe(false)
    })

    it('throws on failure', async () => {
      mockDeactivateUser.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.deactivateUser('1')).rejects.toThrow()
    })
  })

  describe('activateUser()', () => {
    it('sets user emailVerified to true in store', async () => {
      mockGetUsers.mockResolvedValueOnce({
        data: [{ id: 1, firstName: 'John', emailVerified: false }],
      } as any)
      mockActivateUser.mockResolvedValueOnce({
        data: { id: 1, firstName: 'John', emailVerified: true },
      } as any)

      const store = useAdminStore()
      await store.fetchUsers()
      expect(store.users[0].emailVerified).toBe(false)

      await store.activateUser('1')
      expect(store.users[0].emailVerified).toBe(true)
    })

    it('throws on failure', async () => {
      mockActivateUser.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.activateUser('1')).rejects.toThrow()
    })
  })

  describe('deleteUser()', () => {
    it('removes user from store', async () => {
      mockGetUsers.mockResolvedValueOnce({
        data: [{ id: 1, firstName: 'John' }, { id: 2, firstName: 'Jane' }],
      } as any)
      mockDeleteUser.mockResolvedValueOnce({} as any)

      const store = useAdminStore()
      await store.fetchUsers()
      expect(store.users.length).toBe(2)

      await store.deleteUser('1')
      expect(store.users.length).toBe(1)
      expect(store.users[0].id).toBe(2)
    })
  })

  describe('fetchMissions()', () => {
    it('loads missions from API', async () => {
      mockGetMissions.mockResolvedValueOnce({
        data: [{ id: 1, title: 'Test', status: 'in_progress' }],
      } as any)

      const store = useAdminStore()
      await store.fetchMissions()

      expect(store.missions.length).toBe(1)
    })
  })

  describe('fetchMission()', () => {
    it('loads selected mission from API', async () => {
      mockGetMission.mockResolvedValueOnce({
        data: { id: 1, title: 'Detail', status: 'draft' },
      } as any)

      const store = useAdminStore()
      await store.fetchMission('1')

      expect(store.selectedMission).toEqual({ id: 1, title: 'Detail', status: 'draft' })
    })
  })

  describe('createMission()', () => {
    it('adds new mission to store', async () => {
      mockCreateMission.mockResolvedValueOnce({
        data: { id: 10, title: 'New Mission', status: 'draft' },
      } as any)

      const store = useAdminStore()
      await store.createMission({ agentId: 1, clientId: 2, title: 'New Mission', pricingType: 'fixed' })

      expect(store.missions.length).toBe(1)
      expect(store.missions[0].title).toBe('New Mission')
    })

    it('throws on failure', async () => {
      mockCreateMission.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.createMission({ agentId: 1, clientId: 2, title: 'Fail', pricingType: 'fixed' })).rejects.toThrow()
    })
  })

  describe('updateMission()', () => {
    it('updates mission in store', async () => {
      mockGetMissions.mockResolvedValueOnce({
        data: [{ id: 1, title: 'Old Title', status: 'draft' }],
      } as any)
      mockUpdateMission.mockResolvedValueOnce({
        data: { id: 1, title: 'New Title', status: 'draft' },
      } as any)

      const store = useAdminStore()
      await store.fetchMissions()
      await store.updateMission('1', { title: 'New Title' })

      expect(store.missions[0].title).toBe('New Title')
    })

    it('updates selectedMission if viewing detail', async () => {
      mockGetMission.mockResolvedValueOnce({
        data: { id: 1, title: 'Old', status: 'draft' },
      } as any)
      mockUpdateMission.mockResolvedValueOnce({
        data: { id: 1, title: 'Updated', status: 'draft' },
      } as any)

      const store = useAdminStore()
      await store.fetchMission('1')
      await store.updateMission('1', { title: 'Updated' })

      expect(store.selectedMission!.title).toBe('Updated')
    })

    it('throws on failure', async () => {
      mockUpdateMission.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.updateMission('1', { title: 'Fail' })).rejects.toThrow()
    })
  })

  describe('deleteMission()', () => {
    it('removes mission from store', async () => {
      mockGetMissions.mockResolvedValueOnce({
        data: [{ id: 1, title: 'Keep' }, { id: 2, title: 'Remove' }],
      } as any)
      mockDeleteMission.mockResolvedValueOnce({} as any)

      const store = useAdminStore()
      await store.fetchMissions()
      expect(store.missions.length).toBe(2)

      await store.deleteMission('2')
      expect(store.missions.length).toBe(1)
      expect(store.missions[0].id).toBe(1)
    })

    it('throws on failure', async () => {
      mockDeleteMission.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.deleteMission('1')).rejects.toThrow()
    })
  })

  describe('fetchPayments()', () => {
    it('loads payments from API', async () => {
      mockGetPayments.mockResolvedValueOnce({
        data: [{ id: 1, amount: 500, method: 'cash' }],
      } as any)

      const store = useAdminStore()
      await store.fetchPayments()

      expect(store.payments.length).toBe(1)
    })
  })

  describe('fetchPayment()', () => {
    it('loads selected payment from API', async () => {
      mockGetPayment.mockResolvedValueOnce({
        data: { id: 1, amount: 100, method: 'stripe' },
      } as any)

      const store = useAdminStore()
      await store.fetchPayment('1')

      expect(store.selectedPayment).toEqual({ id: 1, amount: 100, method: 'stripe' })
    })
  })

  describe('createPayment()', () => {
    it('adds new payment to store', async () => {
      mockCreatePayment.mockResolvedValueOnce({
        data: { id: 10, amount: 200, method: 'cash' },
      } as any)

      const store = useAdminStore()
      await store.createPayment({ missionId: 1, payerId: 2, payeeId: 3, amount: 200, method: 'cash' })

      expect(store.payments.length).toBe(1)
      expect(store.payments[0].amount).toBe(200)
    })

    it('throws on failure', async () => {
      mockCreatePayment.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.createPayment({ missionId: 1, payerId: 2, payeeId: 3, amount: 200, method: 'cash' })).rejects.toThrow()
    })
  })

  describe('updatePayment()', () => {
    it('updates payment in store', async () => {
      mockGetPayments.mockResolvedValueOnce({
        data: [{ id: 1, amount: 100, method: 'cash' }],
      } as any)
      mockUpdatePayment.mockResolvedValueOnce({
        data: { id: 1, amount: 300, method: 'stripe' },
      } as any)

      const store = useAdminStore()
      await store.fetchPayments()
      await store.updatePayment('1', { amount: 300, method: 'stripe' })

      expect(store.payments[0].amount).toBe(300)
    })

    it('updates selectedPayment if viewing detail', async () => {
      mockGetPayment.mockResolvedValueOnce({
        data: { id: 1, amount: 100, method: 'cash' },
      } as any)
      mockUpdatePayment.mockResolvedValueOnce({
        data: { id: 1, amount: 500, method: 'cash' },
      } as any)

      const store = useAdminStore()
      await store.fetchPayment('1')
      await store.updatePayment('1', { amount: 500 })

      expect(store.selectedPayment!.amount).toBe(500)
    })

    it('throws on failure', async () => {
      mockUpdatePayment.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.updatePayment('1', { amount: 500 })).rejects.toThrow()
    })
  })

  describe('deletePayment()', () => {
    it('removes payment from store', async () => {
      mockGetPayments.mockResolvedValueOnce({
        data: [{ id: 1, amount: 100 }, { id: 2, amount: 200 }],
      } as any)
      mockDeletePayment.mockResolvedValueOnce({} as any)

      const store = useAdminStore()
      await store.fetchPayments()
      expect(store.payments.length).toBe(2)

      await store.deletePayment('1')
      expect(store.payments.length).toBe(1)
      expect(store.payments[0].id).toBe(2)
    })

    it('throws on failure', async () => {
      mockDeletePayment.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.deletePayment('1')).rejects.toThrow()
    })
  })

  describe('updatePaymentStatus()', () => {
    it('updates status on selectedPayment', async () => {
      mockGetPayment.mockResolvedValueOnce({
        data: { id: 1, amount: 100, status: 'pending' },
      } as any)
      mockUpdatePaymentStatus.mockResolvedValueOnce({
        data: { id: 1, amount: 100, status: 'confirmed' },
      } as any)

      const store = useAdminStore()
      await store.fetchPayment('1')
      await store.updatePaymentStatus('1', 'confirmed')

      expect(store.selectedPayment!.status).toBe('confirmed')
    })

    it('throws on failure', async () => {
      mockUpdatePaymentStatus.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.updatePaymentStatus('1', 'confirmed')).rejects.toThrow()
    })
  })

  describe('fetchDisputes()', () => {
    it('loads disputes from API', async () => {
      mockGetDisputes.mockResolvedValueOnce({
        data: [{ id: 1, reason: 'Test dispute' }],
      } as any)

      const store = useAdminStore()
      await store.fetchDisputes()

      expect(store.disputes.length).toBe(1)
    })

    it('sets error on failure', async () => {
      mockGetDisputes.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await store.fetchDisputes()

      expect(store.error).toBe('Failed')
    })
  })

  describe('fetchDispute()', () => {
    it('loads selected dispute from API', async () => {
      mockGetDispute.mockResolvedValueOnce({
        data: { id: 1, reason: 'Test dispute', status: 'open' },
      } as any)

      const store = useAdminStore()
      await store.fetchDispute('1')

      expect(store.selectedDispute).toEqual({ id: 1, reason: 'Test dispute', status: 'open' })
    })

    it('sets error on failure', async () => {
      mockGetDispute.mockRejectedValueOnce({ response: { data: { error: 'Not found' } } })

      const store = useAdminStore()
      await store.fetchDispute('999')

      expect(store.error).toBe('Not found')
    })
  })

  describe('createDispute()', () => {
    it('adds new dispute to store', async () => {
      mockCreateDispute.mockResolvedValueOnce({
        data: { id: 10, missionId: 1, reason: 'Issue', status: 'open' },
      } as any)

      const store = useAdminStore()
      await store.createDispute({ missionId: 1, initiatedBy: 1, reason: 'Issue' })

      expect(store.disputes.length).toBe(1)
      expect(store.disputes[0].reason).toBe('Issue')
    })

    it('throws on failure', async () => {
      mockCreateDispute.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.createDispute({ missionId: 1, initiatedBy: 1, reason: 'Issue' })).rejects.toThrow()
    })
  })

  describe('updateDispute()', () => {
    it('updates dispute in store', async () => {
      mockGetDisputes.mockResolvedValueOnce({
        data: [{ id: 1, reason: 'Old reason', status: 'open' }],
      } as any)
      mockUpdateDispute.mockResolvedValueOnce({
        data: { id: 1, reason: 'Updated reason', status: 'open' },
      } as any)

      const store = useAdminStore()
      await store.fetchDisputes()
      await store.updateDispute('1', { reason: 'Updated reason' })

      expect(store.disputes[0].reason).toBe('Updated reason')
    })

    it('updates selectedDispute if viewing detail', async () => {
      mockGetDispute.mockResolvedValueOnce({
        data: { id: 1, reason: 'Old', status: 'open' },
      } as any)
      mockUpdateDispute.mockResolvedValueOnce({
        data: { id: 1, reason: 'Updated', status: 'open' },
      } as any)

      const store = useAdminStore()
      await store.fetchDispute('1')
      await store.updateDispute('1', { reason: 'Updated' })

      expect(store.selectedDispute!.reason).toBe('Updated')
    })

    it('throws on failure', async () => {
      mockUpdateDispute.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.updateDispute('1', { reason: 'Fail' })).rejects.toThrow()
    })
  })

  describe('deleteDispute()', () => {
    it('removes dispute from store', async () => {
      mockGetDisputes.mockResolvedValueOnce({
        data: [{ id: 1, reason: 'Keep' }, { id: 2, reason: 'Remove' }],
      } as any)
      mockDeleteDispute.mockResolvedValueOnce({} as any)

      const store = useAdminStore()
      await store.fetchDisputes()
      expect(store.disputes.length).toBe(2)

      await store.deleteDispute('2')
      expect(store.disputes.length).toBe(1)
      expect(store.disputes[0].id).toBe(1)
    })

    it('throws on failure', async () => {
      mockDeleteDispute.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.deleteDispute('1')).rejects.toThrow()
    })
  })

  describe('resolveDispute()', () => {
    it('updates dispute status to resolved', async () => {
      mockGetDispute.mockResolvedValueOnce({
        data: { id: 1, status: 'open' },
      } as any)
      mockResolveDispute.mockResolvedValueOnce({
        data: { id: 1, status: 'resolved' },
      } as any)

      const store = useAdminStore()
      await store.fetchDispute('1')
      await store.resolveDispute('1', 'Resolved')

      expect(store.selectedDispute!.status).toBe('resolved')
    })

    it('throws on failure', async () => {
      mockResolveDispute.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.resolveDispute('1', 'Done')).rejects.toThrow()
    })
  })

  describe('escalateDispute()', () => {
    it('updates dispute status to escalated', async () => {
      mockGetDispute.mockResolvedValueOnce({
        data: { id: 1, status: 'open' },
      } as any)
      mockEscalateDispute.mockResolvedValueOnce({
        data: { id: 1, status: 'escalated' },
      } as any)

      const store = useAdminStore()
      await store.fetchDispute('1')
      await store.escalateDispute('1')

      expect(store.selectedDispute!.status).toBe('escalated')
    })

    it('throws on failure', async () => {
      mockEscalateDispute.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.escalateDispute('1')).rejects.toThrow()
    })
  })

  describe('updateDisputeStatus()', () => {
    it('updates dispute status', async () => {
      mockGetDispute.mockResolvedValueOnce({
        data: { id: 1, status: 'open' },
      } as any)
      mockUpdateDisputeStatus.mockResolvedValueOnce({
        data: { id: 1, status: 'reconciling' },
      } as any)

      const store = useAdminStore()
      await store.fetchDispute('1')
      await store.updateDisputeStatus('1', 'reconciling')

      expect(store.selectedDispute!.status).toBe('reconciling')
    })

    it('throws on failure', async () => {
      mockUpdateDisputeStatus.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.updateDisputeStatus('1', 'reconciling')).rejects.toThrow()
    })
  })

  describe('sendDisputeMessage()', () => {
    it('appends message to selectedDispute', async () => {
      mockGetDispute.mockResolvedValueOnce({
        data: { id: 1, status: 'open', messages: [] },
      } as any)
      mockSendDisputeMessage.mockResolvedValueOnce({
        data: { id: 1, content: 'Hello' },
      } as any)

      const store = useAdminStore()
      await store.fetchDispute('1')
      await store.sendDisputeMessage('1', 'Hello')

      expect(store.selectedDispute!.messages).toHaveLength(1)
      expect(store.selectedDispute!.messages![0].content).toBe('Hello')
    })

    it('throws on failure', async () => {
      mockSendDisputeMessage.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useAdminStore()
      await expect(store.sendDisputeMessage('1', 'Hello')).rejects.toThrow()
    })
  })

  describe('fetchPlans()', () => {
    it('loads plans from API', async () => {
      mockGetPlans.mockResolvedValueOnce({
        data: [{ id: 1, name: 'professional', price: 99 }],
      } as any)

      const store = useAdminStore()
      await store.fetchPlans()

      expect(store.plans.length).toBe(1)
    })
  })

  describe('createPlan()', () => {
    it('adds new plan to store', async () => {
      mockCreatePlan.mockResolvedValueOnce({
        data: { id: 2, name: 'enterprise', price: 499 },
      } as any)

      const store = useAdminStore()
      await store.createPlan({ name: 'enterprise', price: 499 })

      expect(store.plans.length).toBe(1)
      expect(store.plans[0].name).toBe('enterprise')
    })
  })
})
