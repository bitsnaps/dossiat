<script lang="ts" setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()

onMounted(() => {
  uiStore.initTheme()
})
</script>

<template>
  <RouterView />
</template>
