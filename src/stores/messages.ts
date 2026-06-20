import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getMessages as apiGetMessages,
  sendMessage as apiSendMessage,
  markAsRead as apiMarkAsRead,
  getUnreadCount as apiGetUnreadCount,
} from '@/services/messages'

interface Message {
  id: number
  conversationId: number
  senderId: number
  content: string
  readAt?: string
  createdAt?: string
}

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref<Message[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMessages(missionId: string) {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetMessages(missionId) as ApiResponse<Message[]>
      messages.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch messages'
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(missionId: string, content: string) {
    try {
      const response = await apiSendMessage(missionId, content) as ApiResponse<Message>
      const newMessage = response.data!
      messages.value.push(newMessage)
      return newMessage
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to send message'
      throw err
    }
  }

  async function markAsRead(messageId: string) {
    try {
      await apiMarkAsRead(messageId)
      const message = messages.value.find((m) => m.id === Number(messageId))
      if (message) {
        message.readAt = new Date().toISOString()
      }
      if (unreadCount.value > 0) {
        unreadCount.value--
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to mark as read'
    }
  }

  async function fetchUnreadCount() {
    try {
      const response = await apiGetUnreadCount() as ApiResponse<{ count: number }>
      unreadCount.value = response.data?.count || 0
    } catch {
      // Silently fail for unread count
    }
  }

  return {
    messages,
    unreadCount,
    loading,
    error,
    fetchMessages,
    sendMessage,
    markAsRead,
    fetchUnreadCount,
  }
})
