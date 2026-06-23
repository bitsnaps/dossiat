import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const sidebarOpen = ref(false)
  const loadingStates = ref<Record<string, boolean>>({})
  const theme = ref<'dark' | 'light'>('dark')

  const isLoading = computed(() => {
    return Object.values(loadingStates.value).some(Boolean)
  })

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function toggleMobileSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function closeMobileSidebar() {
    sidebarOpen.value = false
  }

  function setSidebarCollapsed(value: boolean) {
    sidebarCollapsed.value = value
  }

  function setLoading(key: string, value: boolean) {
    loadingStates.value[key] = value
  }

  function clearLoading(key: string) {
    delete loadingStates.value[key]
  }

  function setTheme(newTheme: 'dark' | 'light') {
    theme.value = newTheme
  }

  return {
    sidebarCollapsed,
    sidebarOpen,
    loadingStates,
    theme,
    isLoading,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    setSidebarCollapsed,
    setLoading,
    clearLoading,
    setTheme,
  }
})
