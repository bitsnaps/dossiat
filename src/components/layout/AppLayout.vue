<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useUiStore } from '@/stores/ui'
import Sidebar from './Sidebar.vue'
import TopNavbar from './TopNavbar.vue'

const uiStore = useUiStore()
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
      <TopNavbar @toggle-sidebar="handleToggleSidebar" />

      <main class="ds-app-layout__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
