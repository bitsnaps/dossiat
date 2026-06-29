<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AdminSidebar from './AdminSidebar.vue'
import TopNavbar from '@/components/layout/TopNavbar.vue'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const isMobile = ref(window.innerWidth <= 768)

function onResize() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

function handleToggleSidebar() {
  if (isMobile.value) {
    sidebarOpen.value = !sidebarOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

function closeMobileSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="ds-app-layout">
    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="ds-sidebar-overlay"
      @click="closeMobileSidebar"
    />

    <AdminSidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="sidebarOpen"
      @close-mobile="closeMobileSidebar"
    />

    <div
      class="ds-app-layout__main"
      :class="{ 'ds-app-layout__main--sidebar-collapsed': sidebarCollapsed }"
    >
      <TopNavbar @toggle-sidebar="handleToggleSidebar" />

      <main class="ds-app-layout__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
