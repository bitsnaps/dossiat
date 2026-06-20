import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/missions', () => ({
  getMissions: vi.fn(),
  createMission: vi.fn(),
  getMission: vi.fn(),
  updateMission: vi.fn(),
  deleteMission: vi.fn(),
}))

import * as missionsService from '@/services/missions'
import { useMissionsStore } from '@/stores/missions'

const mockGetMissions = vi.mocked(missionsService.getMissions)
const mockCreateMission = vi.mocked(missionsService.createMission)
const mockGetMission = vi.mocked(missionsService.getMission)
const mockUpdateMission = vi.mocked(missionsService.updateMission)
const mockDeleteMission = vi.mocked(missionsService.deleteMission)

describe('Missions Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('has empty missions list', () => {
      const store = useMissionsStore()
      expect(store.missions).toEqual([])
      expect(store.currentMission).toBeNull()
    })

    it('has no filters', () => {
      const store = useMissionsStore()
      expect(store.filters).toEqual({})
    })

    it('is not loading', () => {
      const store = useMissionsStore()
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchMissions()', () => {
    it('loads missions from API', async () => {
      const missions = [{ id: 1, title: 'Test', status: 'active', type: 'one_time', pricingType: 'fixed' }]
      mockGetMissions.mockResolvedValueOnce({ success: true, data: missions } as any)

      const store = useMissionsStore()
      await store.fetchMissions()

      expect(store.missions).toEqual(missions)
    })

    it('sets error on failure', async () => {
      mockGetMissions.mockRejectedValueOnce({ response: { data: { error: 'Failed' } } })

      const store = useMissionsStore()
      await store.fetchMissions()

      expect(store.error).toBe('Failed')
    })
  })

  describe('fetchMission()', () => {
    it('loads single mission', async () => {
      const mission = { id: 1, title: 'Test', status: 'active', type: 'one_time', pricingType: 'fixed' }
      mockGetMission.mockResolvedValueOnce({ success: true, data: mission } as any)

      const store = useMissionsStore()
      await store.fetchMission('1')

      expect(store.currentMission).toEqual(mission)
    })
  })

  describe('createMission()', () => {
    it('adds new mission to list', async () => {
      const newMission = { id: 2, title: 'New', status: 'draft', type: 'one_time', pricingType: 'fixed' }
      mockCreateMission.mockResolvedValueOnce({ success: true, data: newMission } as any)

      const store = useMissionsStore()
      const result = await store.createMission({ title: 'New', pricingType: 'fixed' })

      expect(store.missions).toContainEqual(newMission)
      expect(result).toEqual(newMission)
    })
  })

  describe('updateMission()', () => {
    it('updates mission in list', async () => {
      const existing = { id: 1, title: 'Old', status: 'draft', type: 'one_time', pricingType: 'fixed' }
      const updated = { id: 1, title: 'Updated' }
      mockGetMissions.mockResolvedValueOnce({ success: true, data: [existing] } as any)
      mockUpdateMission.mockResolvedValueOnce({ success: true, data: updated } as any)

      const store = useMissionsStore()
      await store.fetchMissions()
      await store.updateMission('1', { title: 'Updated' } as any)

      expect(store.missions[0].title).toBe('Updated')
    })
  })

  describe('deleteMission()', () => {
    it('removes mission from list', async () => {
      const missions = [{ id: 1, title: 'Test', status: 'draft', type: 'one_time', pricingType: 'fixed' }]
      mockGetMissions.mockResolvedValueOnce({ success: true, data: missions } as any)
      mockDeleteMission.mockResolvedValueOnce({ success: true } as any)

      const store = useMissionsStore()
      await store.fetchMissions()
      await store.deleteMission('1')

      expect(store.missions).toEqual([])
    })
  })

  describe('computed: filteredMissions', () => {
    it('filters by status', async () => {
      const missions = [
        { id: 1, title: 'A', status: 'active', type: 'one_time', pricingType: 'fixed' },
        { id: 2, title: 'B', status: 'completed', type: 'one_time', pricingType: 'fixed' },
      ]
      mockGetMissions.mockResolvedValueOnce({ success: true, data: missions } as any)

      const store = useMissionsStore()
      await store.fetchMissions()
      store.setFilter('status', 'active')

      expect(store.filteredMissions).toHaveLength(1)
      expect(store.filteredMissions[0].id).toBe(1)
    })
  })

  describe('computed: activeMissions', () => {
    it('returns in_progress and agreed missions', async () => {
      const missions = [
        { id: 1, title: 'A', status: 'in_progress', type: 'one_time', pricingType: 'fixed' },
        { id: 2, title: 'B', status: 'agreed', type: 'one_time', pricingType: 'fixed' },
        { id: 3, title: 'C', status: 'completed', type: 'one_time', pricingType: 'fixed' },
      ]
      mockGetMissions.mockResolvedValueOnce({ success: true, data: missions } as any)

      const store = useMissionsStore()
      await store.fetchMissions()

      expect(store.activeMissions).toHaveLength(2)
    })
  })
})
