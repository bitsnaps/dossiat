<script lang="ts" setup>
import { useUiStore } from '@/stores/ui'
import Sidebar from './Sidebar.vue'
import TopNavbar from './TopNavbar.vue'

const uiStore = useUiStore()
</script>

<template>
  <div class="ds-app-layout">
    <Sidebar :collapsed="uiStore.sidebarCollapsed" @toggle="uiStore.toggleSidebar" />

    <div
      class="ds-app-layout__main"
      :class="{ 'ds-app-layout__main--sidebar-collapsed': uiStore.sidebarCollapsed }"
    >
      <TopNavbar @toggle-sidebar="uiStore.toggleSidebar" />

      <main class="ds-app-layout__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
