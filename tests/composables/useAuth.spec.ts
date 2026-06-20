import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@/services/users', () => ({
  getMe: vi.fn(),
}))

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('isAuthenticated', () => {
    it('is false when not logged in', () => {
      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(false)
    })

    it('reflects store authentication state', () => {
      const { isAuthenticated } = useAuth()
      const store = useAuthStore()
      store.accessToken = 'test-token'
      expect(isAuthenticated.value).toBe(true)
    })
  })

  describe('currentUser', () => {
    it('is null when not logged in', () => {
      const { currentUser } = useAuth()
      expect(currentUser.value).toBeNull()
    })

    it('reflects store user', () => {
      const { currentUser } = useAuth()
      const store = useAuthStore()
      store.user = { id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'agent' }
      expect(currentUser.value).toEqual(store.user)
    })
  })

  describe('hasRole()', () => {
    it('returns true for matching role', () => {
      const { hasRole } = useAuth()
      const store = useAuthStore()
      store.user = { id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'agent' }
      expect(hasRole('agent')).toBe(true)
    })

    it('returns false for non-matching role', () => {
      const { hasRole } = useAuth()
      const store = useAuthStore()
      store.user = { id: 1, email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'agent' }
      expect(hasRole('client')).toBe(false)
    })

    it('returns false when no user', () => {
      const { hasRole } = useAuth()
      expect(hasRole('agent')).toBe(false)
    })
  })

  describe('loading / error', () => {
    it('defaults to loading false', () => {
      const { loading } = useAuth()
      expect(loading.value).toBe(false)
    })

    it('defaults to error null', () => {
      const { error } = useAuth()
      expect(error.value).toBeNull()
    })
  })

  describe('login()', () => {
    it('delegates to store login', async () => {
      const { login } = useAuth()
      const store = useAuthStore()
      vi.spyOn(store, 'login').mockResolvedValue()

      await login({ email: 'test@test.com', password: 'pass' })
      expect(store.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'pass' })
    })
  })

  describe('logout()', () => {
    it('delegates to store logout', async () => {
      const { logout } = useAuth()
      const store = useAuthStore()
      vi.spyOn(store, 'logout').mockResolvedValue()

      await logout()
      expect(store.logout).toHaveBeenCalled()
    })
  })
})
