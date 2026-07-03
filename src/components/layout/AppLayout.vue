<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import Sidebar from './Sidebar.vue'
import TopNavbar from './TopNavbar.vue'

const { t } = useI18n()
const router = useRouter()
const uiStore = useUiStore()
const authStore = useAuthStore()
const isMobile = ref(window.innerWidth <= 768)

function onResize() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

function handleToggleSidebar() {
  if (isMobile.value) {
    uiStore.toggleMobileSidebar()
  } else {
    uiStore.toggleSidebar()
  }
}

function backToAdmin() {
  authStore.clearViewAsRole()
  router.push({ name: 'admin' })
}
</script>

<template>
  <div class="ds-app-layout">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="uiStore.sidebarOpen"
      class="ds-sidebar-overlay"
      @click="uiStore.closeMobileSidebar"
    />

    <Sidebar
      :collapsed="uiStore.sidebarCollapsed"
      :mobile-open="uiStore.sidebarOpen"
      @toggle="uiStore.toggleSidebar"
      @close-mobile="uiStore.closeMobileSidebar"
    />

    <div
      class="ds-app-layout__main"
      :class="{ 'ds-app-layout__main--sidebar-collapsed': uiStore.sidebarCollapsed }"
    >
      <!-- View As banner for admins acting as another role -->
      <div v-if="authStore.isViewingAs" class="ds-view-as-banner">
        <i class="bi bi-eye" />
        <span>{{ t('layout.viewAsBanner', { role: t(`common.status.role.${authStore.viewAsRole}`) }) }}</span>
        <button class="ds-view-as-banner__back" @click="backToAdmin">
          {{ t('layout.topbar.admin') }}
        </button>
      </div>

      <TopNavbar @toggle-sidebar="handleToggleSidebar" />

      <main class="ds-app-layout__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
