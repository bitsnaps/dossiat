<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Notification {
  id: number
  title: string
  body: string
  readAt?: string | null
  createdAt?: string
}

interface Props {
  notifications: Notification[]
}

defineProps<Props>()

const emit = defineEmits<{
  'mark-read': [id: number]
  'mark-all-read': []
}>()

function formatTime(dateStr?: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
</script>

<template>
  <div class="ds-notification-dropdown" @click.stop>
    <div class="ds-notification-dropdown__header">
      <span class="ds-notification-dropdown__title">{{ t('layout.notifications.title') }}</span>
      <button class="ds-notification-dropdown__mark-all" @click="emit('mark-all-read')">
        {{ t('layout.notifications.markAllRead') }}
      </button>
    </div>

    <div class="ds-notification-dropdown__list">
      <div v-if="notifications.length === 0" class="ds-notification-dropdown__empty">
        <i class="bi bi-bell" />
        <div>{{ t('layout.notifications.empty') }}</div>
      </div>

      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="ds-notification-dropdown__item"
        :class="{ 'ds-notification-dropdown__item--unread': !notification.readAt }"
        @click="emit('mark-read', notification.id)"
      >
        <div class="ds-notification-dropdown__item-icon">
          <i class="bi bi-bell" />
        </div>
        <div class="ds-notification-dropdown__item-content">
          <div class="ds-notification-dropdown__item-title">{{ notification.title }}</div>
          <div class="ds-notification-dropdown__item-body">{{ notification.body }}</div>
          <div class="ds-notification-dropdown__item-time">{{ formatTime(notification.createdAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
