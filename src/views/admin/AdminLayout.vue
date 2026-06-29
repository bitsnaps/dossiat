<script lang="ts" setup>
import { ref } from 'vue'
import AdminSidebar from './AdminSidebar.vue'
import TopNavbar from '@/components/layout/TopNavbar.vue'

const sidebarOpen = ref(false)

function toggleMobileSidebar() {
  sidebarOpen.value = !sidebarOpen.value
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

    <AdminSidebar :mobile-open="sidebarOpen" @close-mobile="closeMobileSidebar" />

    <div class="ds-app-layout__main">
      <TopNavbar @toggle-sidebar="toggleMobileSidebar" />

      <main class="ds-app-layout__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
