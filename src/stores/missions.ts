import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getMissions as apiGetMissions,
  createMission as apiCreateMission,
  getMission as apiGetMission,
  updateMission as apiUpdateMission,
  deleteMission as apiDeleteMission,
  agreeMission as apiAgreeMission,
  getAgreementStatus as apiGetAgreementStatus,
  createBulkMissions as apiCreateBulkMissions,
  updateMissionStatus as apiUpdateMissionStatus,
  getAttachments as apiGetAttachments,
  uploadAttachment as apiUploadAttachment,
  type CreateMissionData,
} from '@/services/missions'

interface MissionUser {
  id: number
  firstName: string
  lastName: string
  email: string
}

interface Attachment {
  id: number
  missionId: number
  uploadedBy: number
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
  createdAt: string
}

interface RecurrenceConfig {
  id: number
  missionId: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual'
  interval: number
  dayOfMonth: number | null
  dayOfWeek: number | null
  nextRunAt: string | null
  lastRunAt: string | null
  isActive: boolean
}

interface Mission {
  id: number
  title: string
  description?: string | null
  status: string
  type: string
  pricingType: string
  agreedAmount?: number | null
  currency?: string
  agreedChecklist?: string[]
  completedChecklist?: string[]
  startedAt?: string | null
  completedAt?: string | null
  agentId?: number
  clientId?: number
  agent?: MissionUser
  client?: MissionUser
  attachments?: Attachment[]
  recurrenceConfig?: RecurrenceConfig | null
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
  const agreementStatus = ref<{ agreedByAgent: boolean; agreedByClient: boolean; bothAgreed: boolean } | null>(null)

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

  async function fetchAgreementStatus(id: string) {
    try {
      const response = await apiGetAgreementStatus(id) as ApiResponse<{ agreedByAgent: boolean; agreedByClient: boolean; bothAgreed: boolean }>
      agreementStatus.value = response.data!
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch agreement status'
      return null
    }
  }

  async function agreeMission(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await apiAgreeMission(id) as ApiResponse<Mission>
      const updated = response.data!
      const index = missions.value.findIndex((m) => m.id === Number(id))
      if (index !== -1) {
        missions.value[index] = { ...missions.value[index], ...updated }
      }
      if (currentMission.value?.id === Number(id)) {
        currentMission.value = { ...currentMission.value, ...updated }
      }
      // Refresh agreement status
      await fetchAgreementStatus(id)
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to agree mission'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateMissionStatus(id: string, status: string) {
    loading.value = true
    error.value = null
    try {
      const response = await apiUpdateMissionStatus(id, status) as ApiResponse<Mission>
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
      error.value = err.response?.data?.error || err.message || 'Failed to update mission status'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAttachments(missionId: string) {
    try {
      const response = await apiGetAttachments(missionId) as ApiResponse<Attachment[]>
      const attachments = response.data || []
      if (currentMission.value?.id === Number(missionId)) {
        currentMission.value = { ...currentMission.value, attachments }
      }
      return attachments
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch attachments'
      return []
    }
  }

  async function uploadAttachment(missionId: string, file: File) {
    loading.value = true
    error.value = null
    try {
      const response = await apiUploadAttachment(missionId, file) as ApiResponse<Attachment>
      const attachment = response.data!
      if (currentMission.value?.id === Number(missionId)) {
        const existing = currentMission.value.attachments || []
        currentMission.value = { ...currentMission.value, attachments: [...existing, attachment] }
      }
      return attachment
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to upload attachment'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createBulkMissions(data: CreateMissionData[]) {
    loading.value = true
    error.value = null
    try {
      const response = await apiCreateBulkMissions(data) as ApiResponse<{ count: number; missions: Mission[] }>
      const created = response.data!.missions || []
      if (created.length) {
        missions.value = [...created, ...missions.value]
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to create missions in bulk'
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
    agreementStatus,
    filteredMissions,
    activeMissions,
    setFilter,
    clearFilters,
    fetchMissions,
    fetchMission,
    createMission,
    updateMission,
    deleteMission,
    fetchAgreementStatus,
    agreeMission,
    updateMissionStatus,
    fetchAttachments,
    uploadAttachment,
    createBulkMissions,
  }
})
