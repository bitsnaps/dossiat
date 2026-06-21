<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useMessagesStore } from '@/stores/messages'
import { useMessagePolling } from '@/composables/useMessagePolling'
import NotificationDropdown from './NotificationDropdown.vue'
import BAvatar from '@/components/base/BAvatar.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const messagesStore = useMessagesStore()

useMessagePolling()

const emit = defineEmits<{ 'toggle-sidebar': [] }>()

const showNotifications = ref(false)

const userName = computed(() => {
  if (!authStore.user) return ''
  return `${authStore.user.firstName} ${authStore.user.lastName}`
})

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    notificationsStore.fetchNotifications()
  }
}

function closeNotifications() {
  showNotifications.value = false
}
</script>

<template>
  <header class="ds-topnavbar">
    <button class="ds-topnavbar__toggle" @click="emit('toggle-sidebar')">
      <i class="bi bi-list" />
    </button>

    <!-- Unread messages badge in topbar -->
    <RouterLink
      v-if="messagesStore.unreadCount > 0"
      to="/app/messages"
      class="ds-topnavbar__messages-badge"
    >
      <i class="bi bi-chat-dots" />
      <span class="ds-topnavbar__messages-badge-count">
        {{ messagesStore.unreadCount > 9 ? '9+' : messagesStore.unreadCount }}
      </span>
    </RouterLink>

    <div class="ds-topnavbar__search">
      <i class="bi bi-search ds-topnavbar__search-icon" />
      <input
        type="text"
        class="ds-topnavbar__search-input"
        :placeholder="t('layout.topbar.search')"
      />
    </div>

    <div class="ds-topnavbar__actions">
      <div style="position: relative;">
        <button class="ds-topnavbar__notifications" @click="toggleNotifications">
          <i class="bi bi-bell" />
          <span
            v-if="notificationsStore.unreadCount > 0"
            class="ds-topnavbar__notifications-badge"
          >
            {{ notificationsStore.unreadCount > 9 ? '9+' : notificationsStore.unreadCount }}
          </span>
        </button>

        <NotificationDropdown
          v-if="showNotifications"
          :notifications="notificationsStore.notifications"
          @mark-read="notificationsStore.markAsRead($event)"
          @mark-all-read="notificationsStore.markAllAsRead()"
          @click-outside="closeNotifications"
        />
      </div>

      <div class="ds-topnavbar__user">
        <BAvatar :name="userName" size="sm" />
      </div>
    </div>
  </header>
</template>
