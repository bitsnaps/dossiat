<script lang="ts" setup>
import { useUiStore } from '@/stores/ui'
import Sidebar from './Sidebar.vue'
import TopNavbar from './TopNavbar.vue'

const uiStore = useUiStore()
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
      <TopNavbar @toggle-sidebar="uiStore.toggleMobileSidebar" />

      <main class="ds-app-layout__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
