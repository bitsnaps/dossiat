import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getMissions as apiGetMissions,
  createMission as apiCreateMission,
  getMission as apiGetMission,
  updateMission as apiUpdateMission,
  deleteMission as apiDeleteMission,
  type CreateMissionData,
} from '@/services/missions'

interface Mission {
  id: number
  title: string
  description?: string
  status: string
  type: string
  pricingType: string
  agreedAmount?: number
  currency?: string
  agentId?: number
  clientId?: number
  createdAt?: string
  updatedAt?: string
}

interface MissionFilters {
  status?: string
  type?: string
}

export const useMissionsStore = defineStore('missions', () => {
  const missions = ref<Mission[]>([])
  const currentMission = ref<Mission | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<MissionFilters>({})
  const total = ref(0)
  const page = ref(1)

  const filteredMissions = computed(() => {
    return missions.value.filter((m) => {
      if (filters.value.status && m.status !== filters.value.status) return false
      if (filters.value.type && m.type !== filters.value.type) return false
      return true
    })
  })

  const activeMissions = computed(() => {
    return missions.value.filter((m) =>
      m.status === 'in_progress' || m.status === 'agreed',
    )
  })

  function setFilter(key: keyof MissionFilters, value: string | undefined) {
    filters.value[key] = value
  }

  function clearFilters() {
    filters.value = {}
  }

  async function fetchMissions(params?: MissionFilters & { page?: number }) {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetMissions(params) as ApiResponse<Mission[]>
      missions.value = response.data || []
      total.value = response.meta?.total || missions.value.length
      if (params?.page) page.value = params.page
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch missions'
    } finally {
      loading.value = false
    }
  }

  async function fetchMission(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetMission(id) as ApiResponse<Mission>
      currentMission.value = response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch mission'
    } finally {
      loading.value = false
    }
  }

  async function createMission(data: CreateMissionData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiCreateMission(data) as ApiResponse<Mission>
      const newMission = response.data!
      missions.value.unshift(newMission)
      return newMission
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to create mission'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateMission(id: string, data: Partial<CreateMissionData>) {
    loading.value = true
    error.value = null
    try {
      const response = await apiUpdateMission(id, data) as ApiResponse<Mission>
      const updated = response.data!
      const index = missions.value.findIndex((m) => m.id === Number(id))
      if (index !== -1) {
        missions.value[index] = { ...missions.value[index], ...updated }
      }
      if (currentMission.value?.id === Number(id)) {
        currentMission.value = { ...currentMission.value, ...updated }
      }
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to update mission'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteMission(id: string) {
    loading.value = true
    error.value = null
    try {
      await apiDeleteMission(id)
      missions.value = missions.value.filter((m) => m.id !== Number(id))
      if (currentMission.value?.id === Number(id)) {
        currentMission.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to delete mission'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    missions,
    currentMission,
    loading,
    error,
    filters,
    total,
    page,
    filteredMissions,
    activeMissions,
    setFilter,
    clearFilters,
    fetchMissions,
    fetchMission,
    createMission,
    updateMission,
    deleteMission,
  }
})
