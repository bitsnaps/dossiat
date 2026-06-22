import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getDisputes as apiGetDisputes,
  getDispute as apiGetDispute,
  sendMessage as apiSendMessage,
  resolveDispute as apiResolveDispute,
  escalateDispute as apiEscalateDispute,
  createDispute as apiCreateDispute,
} from '@/services/disputes'

interface DisputeUser {
  id: number
  firstName: string
  lastName: string
}

interface DisputeMission {
  id: number
  title: string
  status: string
}

export interface DisputeMessage {
  id: number
  disputeId: number
  senderId: number
  content: string
  createdAt?: string
  sender?: DisputeUser
}

export interface Dispute {
  id: number
  missionId: number
  initiatedBy: number
  reason: string
  status: 'open' | 'reconciling' | 'resolved' | 'escalated'
  resolution?: string | null
  resolvedAt?: string | null
  mission?: DisputeMission
  initiator?: DisputeUser
  messages?: DisputeMessage[]
  createdAt?: string
  updatedAt?: string
}

export const useDisputesStore = defineStore('disputes', () => {
  const disputes = ref<Dispute[]>([])
  const currentDispute = ref<Dispute | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDisputes() {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetDisputes() as ApiResponse<Dispute[]>
      disputes.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch disputes'
    } finally {
      loading.value = false
    }
  }

  async function fetchDispute(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetDispute(id) as ApiResponse<Dispute>
      currentDispute.value = response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch dispute'
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(disputeId: string, content: string) {
    try {
      const response = await apiSendMessage(disputeId, content) as ApiResponse<DisputeMessage>
      const newMessage = response.data!
      if (currentDispute.value?.id === Number(disputeId)) {
        const messages = currentDispute.value.messages || []
        currentDispute.value = {
          ...currentDispute.value,
          messages: [...messages, newMessage],
        }
      }
      return newMessage
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to send message'
      throw err
    }
  }

  async function resolveDispute(id: string, resolution: string) {
    try {
      const response = await apiResolveDispute(id, resolution) as ApiResponse<Dispute>
      if (currentDispute.value?.id === Number(id)) {
        currentDispute.value = {
          ...currentDispute.value,
          status: 'resolved',
          resolution,
          ...response.data,
        }
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to resolve dispute'
      throw err
    }
  }

  async function escalateDispute(id: string) {
    try {
      const response = await apiEscalateDispute(id) as ApiResponse<Dispute>
      if (currentDispute.value?.id === Number(id)) {
        currentDispute.value = {
          ...currentDispute.value,
          status: 'escalated',
          ...response.data,
        }
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to escalate dispute'
      throw err
    }
  }

  async function createDispute(missionId: string, reason: string) {
    try {
      const response = await apiCreateDispute(missionId, reason) as ApiResponse<Dispute>
      return response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to create dispute'
      throw err
    }
  }

  return {
    disputes,
    currentDispute,
    loading,
    error,
    fetchDisputes,
    fetchDispute,
    sendMessage,
    resolveDispute,
    escalateDispute,
    createDispute,
  }
})
