<script lang="ts" setup>
import AdminSidebar from './AdminSidebar.vue'
</script>

<template>
  <div class="ds-layout ds-layout--admin">
    <AdminSidebar />
    <main class="ds-layout__main">
      <RouterView />
    </main>
  </div>
</template>
