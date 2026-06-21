import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getMe,
  updateAgentProfile as apiUpdateAgentProfile,
  getAgentProfile as apiGetAgentProfile,
  generateInviteLink as apiGenerateInviteLink,
  uploadAvatar as apiUploadAvatar,
} from '@/services/users'

interface AgentProfile {
  id: number
  userId: number
  bio: string | null
  specialties: string[]
  acceptedClientTypes: 'B2B' | 'B2C' | 'Both'
  uniqueInviteSlug: string
  currency: string
  timezone: string
  profilePhotoUrl: string | null
}

interface PublicAgentProfile {
  id: number
  bio: string | null
  specialties: string[]
  acceptedClientTypes: 'B2B' | 'B2C' | 'Both'
  currency?: string
  timezone: string
  profilePhotoUrl: string | null
  user: {
    id: number
    firstName: string
    lastName: string
    email?: string
  }
}

export const useAgentProfileStore = defineStore('agentProfile', () => {
  const profile = ref<AgentProfile | null>(null)
  const publicProfile = ref<PublicAgentProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isComplete = computed(() => {
    if (!profile.value) return false
    return !!(
      profile.value.bio &&
      profile.value.specialties.length > 0
    )
  })

  const inviteLink = computed(() => {
    if (!profile.value?.uniqueInviteSlug) return null
    return `/agents/${profile.value.uniqueInviteSlug}`
  })

  async function fetchProfile() {
    loading.value = true
    error.value = null
    try {
      const response = await getMe() as ApiResponse<any>
      const userData = response.data
      if (userData?.agentProfile) {
        profile.value = userData.agentProfile
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch profile'
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data: {
    bio?: string
    specialties?: string[]
    acceptedClientTypes?: 'B2B' | 'B2C' | 'Both'
    currency?: string
    timezone?: string
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await apiUpdateAgentProfile(data) as ApiResponse<AgentProfile>
      profile.value = { ...profile.value, ...response.data } as AgentProfile
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function regenerateInviteLink() {
    loading.value = true
    error.value = null
    try {
      const response = await apiGenerateInviteLink() as ApiResponse<{ inviteLink: string; slug: string }>
      if (profile.value) {
        profile.value.uniqueInviteSlug = response.data!.slug
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to regenerate invite link'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function uploadAvatar(file: File) {
    loading.value = true
    error.value = null
    try {
      const response = await apiUploadAvatar(file) as ApiResponse<{ profilePhotoUrl: string }>
      if (profile.value) {
        profile.value.profilePhotoUrl = response.data!.profilePhotoUrl
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to upload avatar'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchPublicProfile(slug: string) {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetAgentProfile(slug) as ApiResponse<PublicAgentProfile>
      publicProfile.value = response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch profile'
      publicProfile.value = null
    } finally {
      loading.value = false
    }
  }

  function clearPublicProfile() {
    publicProfile.value = null
  }

  return {
    profile,
    publicProfile,
    loading,
    error,
    isComplete,
    inviteLink,
    fetchProfile,
    updateProfile,
    regenerateInviteLink,
    uploadAvatar,
    fetchPublicProfile,
    clearPublicProfile,
  }
})
