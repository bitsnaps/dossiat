import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import { get, put } from '@/services/api'

interface Notification {
  id: number
  userId: number
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  readAt?: string
  createdAt?: string
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)

  const unreadCount = computed(() =>
    notifications.value.filter((n) => !n.readAt).length,
  )

  async function fetchNotifications() {
    loading.value = true
    try {
      const response = await get('/notifications') as ApiResponse<Notification[]>
      notifications.value = response.data || []
    } catch {
      // Silently fail
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: number) {
    try {
      await put(`/notifications/${id}/read`)
      const notification = notifications.value.find((n) => n.id === id)
      if (notification) {
        notification.readAt = new Date().toISOString()
      }
    } catch {
      // Silently fail
    }
  }

  async function markAllAsRead() {
    try {
      await put('/notifications/read-all')
      const now = new Date().toISOString()
      notifications.value.forEach((n) => {
        if (!n.readAt) n.readAt = now
      })
    } catch {
      // Silently fail
    }
  }

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
})
