import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getMe,
  getClientProfile as apiGetClientProfile,
  updateClientProfile as apiUpdateClientProfile,
} from '@/services/users'

interface ClientProfile {
  id: number
  userId: number
  companyName: string | null
  companySize: string | null
  industry: string | null
}

export const useClientProfileStore = defineStore('clientProfile', () => {
  const profile = ref<ClientProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProfile() {
    loading.value = true
    error.value = null
    try {
      const response = await getMe() as ApiResponse<any>
      const userData = response.data
      if (userData?.clientProfile) {
        profile.value = userData.clientProfile
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch profile'
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data: {
    companyName?: string
    companySize?: string
    industry?: string
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await apiUpdateClientProfile(data) as ApiResponse<ClientProfile>
      profile.value = { ...profile.value, ...response.data } as ClientProfile
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
  }
})
