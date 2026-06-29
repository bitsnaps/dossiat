import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/admin', () => ({
  getStats: vi.fn(),
  getUsers: vi.fn(),
  getUser: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deactivateUser: vi.fn(),
  activateUser: vi.fn(),
  deleteUser: vi.fn(),
  getMissions: vi.fn(),
  getMission: vi.fn(),
  updateMissionStatus: vi.fn(),
  getPayments: vi.fn(),
  getPayment: vi.fn(),
  getDisputes: vi.fn(),
  getDispute: vi.fn(),
  resolveDispute: vi.fn(),
  getPlans: vi.fn(),
  createPlan: vi.fn(),
  updatePlan: vi.fn(),
  deletePlan: vi.fn(),
}))

import * as adminService from '@/services/admin'
import { useAdminStore } from '@/stores/admin'

const mockGetStats = vi.mocked(adminService.getStats)
const mockGetUsers = vi.mocked(adminService.getUsers)
const mockGetUser = vi.mocked(adminService.getUser)
const mockCreateUser = vi.mocked(adminService.createUser)
const mockUpdateUser = vi.mocked(adminService.updateUser)
const mockDeactivateUser = vi.mocked(adminService.deactivateUser)
const mockActivateUser = vi.mocked(adminService.activateUser)
const mockDeleteUser = vi.mocked(adminService.deleteUser)
const mockGetMissions = vi.mocked(adminService.getMissions)
const mockGetPayments = vi.mocked(adminService.getPayments)
const mockGetDisputes = vi.mocked(adminService.getDisputes)
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

  describe('fetchDisputes()', () => {
    it('loads disputes from API', async () => {
      mockGetDisputes.mockResolvedValueOnce({
        data: [{ id: 1, reason: 'Test dispute' }],
      } as any)

      const store = useAdminStore()
      await store.fetchDisputes()

      expect(store.disputes.length).toBe(1)
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
