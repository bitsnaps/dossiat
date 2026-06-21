import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getRecurrences as apiGetRecurrences,
  createRecurrence as apiCreateRecurrence,
  updateRecurrence as apiUpdateRecurrence,
  deleteRecurrence as apiDeleteRecurrence,
  type RecurrenceData,
} from '@/services/recurrence'

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

export const useRecurrenceStore = defineStore('recurrence', () => {
  const configs = ref<RecurrenceConfig[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRecurrences() {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetRecurrences() as ApiResponse<RecurrenceConfig[]>
      configs.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch recurrences'
    } finally {
      loading.value = false
    }
  }

  async function createConfig(missionId: string, data: RecurrenceData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiCreateRecurrence(missionId, data) as ApiResponse<RecurrenceConfig>
      const config = response.data!
      configs.value.push(config)
      return config
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to create recurrence'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateConfig(missionId: string, data: RecurrenceData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiUpdateRecurrence(missionId, data) as ApiResponse<RecurrenceConfig>
      const updated = response.data!
      const index = configs.value.findIndex((c) => c.missionId === Number(missionId))
      if (index !== -1) {
        configs.value[index] = updated
      }
      return updated
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to update recurrence'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteConfig(missionId: string) {
    loading.value = true
    error.value = null
    try {
      await apiDeleteRecurrence(missionId)
      configs.value = configs.value.filter((c) => c.missionId !== Number(missionId))
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to delete recurrence'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    configs,
    loading,
    error,
    fetchRecurrences,
    createConfig,
    updateConfig,
    deleteConfig,
  }
})
