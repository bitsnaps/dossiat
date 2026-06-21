import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getConversations as apiGetConversations,
  getMessages as apiGetMessages,
  sendMessage as apiSendMessage,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
  getUnreadCount as apiGetUnreadCount,
} from '@/services/messages'

interface MessageSender {
  id: number
  firstName: string
  lastName: string
}

interface MessageAttachment {
  id: number
  messageId: number
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
}

export interface Message {
  id: number
  conversationId: number
  senderId: number
  content: string
  readAt?: string
  createdAt?: string
  sender?: MessageSender
  attachments?: MessageAttachment[]
}

export interface Conversation {
  id: number
  missionId: number
  missionTitle: string
  counterpartyId: number
  lastMessage: {
    id: number
    content: string
    createdAt: string
    senderId: number
    sender?: MessageSender
  } | null
  unreadCount: number
  createdAt: string
}

export const useMessagesStore = defineStore('messages', () => {
  const conversations = ref<Conversation[]>([])
  const messages = ref<Message[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchConversations() {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetConversations() as ApiResponse<Conversation[]>
      conversations.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch conversations'
    } finally {
      loading.value = false
    }
  }

  async function fetchMessages(missionId: string, page = 1) {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetMessages(missionId, page) as ApiResponse<Message[]>
      const fetched = response.data || []
      if (page > 1) {
        messages.value = [...fetched, ...messages.value]
      } else {
        messages.value = fetched
      }
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

      // Update conversation's last message
      const conv = conversations.value.find((c) => c.missionId === Number(missionId))
      if (conv) {
        conv.lastMessage = {
          id: newMessage.id,
          content: newMessage.content,
          createdAt: newMessage.createdAt || new Date().toISOString(),
          senderId: newMessage.senderId,
        }
      }

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

  async function markAllAsRead(conversationId: string) {
    try {
      await apiMarkAllAsRead(conversationId)
      const now = new Date().toISOString()
      messages.value.forEach((m) => {
        if (!m.readAt) m.readAt = now
      })
      const conv = conversations.value.find((c) => c.id === Number(conversationId))
      if (conv) {
        unreadCount.value -= conv.unreadCount
        conv.unreadCount = 0
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to mark all as read'
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
    conversations,
    messages,
    unreadCount,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    markAllAsRead,
    fetchUnreadCount,
  }
})
