import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '@/stores/ui'

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('sidebar', () => {
    it('sidebar is expanded by default', () => {
      const store = useUiStore()
      expect(store.sidebarCollapsed).toBe(false)
    })

    it('toggleSidebar toggles collapsed state', () => {
      const store = useUiStore()
      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(true)
      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(false)
    })

    it('setSidebarCollapsed sets value directly', () => {
      const store = useUiStore()
      store.setSidebarCollapsed(true)
      expect(store.sidebarCollapsed).toBe(true)
    })
  })

  describe('loading states', () => {
    it('isLoading is false when no states', () => {
      const store = useUiStore()
      expect(store.isLoading).toBe(false)
    })

    it('setLoading sets a loading key', () => {
      const store = useUiStore()
      store.setLoading('missions', true)
      expect(store.isLoading).toBe(true)
      expect(store.loadingStates.missions).toBe(true)
    })

    it('clearLoading removes a loading key', () => {
      const store = useUiStore()
      store.setLoading('missions', true)
      store.clearLoading('missions')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('theme', () => {
    it('defaults to dark theme', () => {
      const store = useUiStore()
      expect(store.theme).toBe('dark')
    })

    it('setTheme changes theme', () => {
      const store = useUiStore()
      store.setTheme('light')
      expect(store.theme).toBe('light')
    })
  })
})
