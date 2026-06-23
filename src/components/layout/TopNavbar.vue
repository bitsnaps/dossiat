<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useMessagesStore } from '@/stores/messages'
import { useMessagePolling } from '@/composables/useMessagePolling'
import NotificationDropdown from './NotificationDropdown.vue'
import BAvatar from '@/components/base/BAvatar.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const messagesStore = useMessagesStore()

useMessagePolling()

const emit = defineEmits<{ 'toggle-sidebar': [] }>()

const showNotifications = ref(false)
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const userName = computed(() => {
  if (!authStore.user) return ''
  return `${authStore.user.firstName} ${authStore.user.lastName}`
})

const userRole = computed(() => {
  if (!authStore.user) return ''
  return t(`layout.topbar.${authStore.user.role}`)
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

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function closeUserMenu() {
  showUserMenu.value = false
}

async function handleLogout() {
  showUserMenu.value = false
  await authStore.logout()
  router.push('/')
}

function goToSettings() {
  showUserMenu.value = false
  router.push('/app/settings')
}

function onOutsideClick(e: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', onOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', onOutsideClick))
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

      <div ref="userMenuRef" class="ds-topnavbar__user" @click.stop>
        <button class="ds-topnavbar__user-trigger" @click="toggleUserMenu">
          <BAvatar :name="userName" size="sm" />
        </button>
        <div v-if="showUserMenu" class="ds-topnavbar__user-menu">
          <div class="ds-topnavbar__user-menu-header">
            <BAvatar :name="userName" size="md" />
            <div>
              <div class="ds-topnavbar__user-menu-name">{{ userName }}</div>
              <div class="ds-topnavbar__user-menu-email">{{ authStore.user?.email }}</div>
            </div>
          </div>
          <div class="ds-topnavbar__user-menu-divider" />
          <button class="ds-topnavbar__user-menu-item" @click="goToSettings">
            <i class="bi bi-gear" />
            <span>{{ t('layout.topbar.settings') }}</span>
          </button>
          <div class="ds-topnavbar__user-menu-divider" />
          <button class="ds-topnavbar__user-menu-item ds-topnavbar__user-menu-item--danger" @click="handleLogout">
            <i class="bi bi-box-arrow-left" />
            <span>{{ t('layout.topbar.logout') }}</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
