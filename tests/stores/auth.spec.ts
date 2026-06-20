import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
}))

vi.mock('@/services/users', () => ({
  getMe: vi.fn(),
}))

import * as authService from '@/services/auth'
import * as usersService from '@/services/users'
import { useAuthStore } from '@/stores/auth'

const mockLogin = vi.mocked(authService.login)
const mockRegister = vi.mocked(authService.register)
const mockLogout = vi.mocked(authService.logout)
const mockRefreshToken = vi.mocked(authService.refreshToken)
const mockGetMe = vi.mocked(usersService.getMe)

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('has no user when not authenticated', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('has no tokens initially', () => {
      const store = useAuthStore()
      expect(store.accessToken).toBeNull()
      expect(store.refreshTokenValue).toBeNull()
    })

    it('is not loading initially', () => {
      const store = useAuthStore()
      expect(store.loading).toBe(false)
    })

    it('has no error initially', () => {
      const store = useAuthStore()
      expect(store.error).toBeNull()
    })
  })

  describe('login()', () => {
    it('calls auth service and stores user + tokens', async () => {
      const userData = { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe', role: 'agent' }
      mockLogin.mockResolvedValueOnce({
        data: { user: userData, accessToken: 'access-123', refreshToken: 'refresh-123' },
      } as any)

      const store = useAuthStore()
      await store.login({ email: 'test@example.com', password: 'password123' })

      expect(store.user).toEqual(userData)
      expect(store.accessToken).toBe('access-123')
      expect(store.refreshTokenValue).toBe('refresh-123')
      expect(store.isAuthenticated).toBe(true)
    })

    it('persists tokens to localStorage', async () => {
      mockLogin.mockResolvedValueOnce({
        data: { user: { id: 1 }, accessToken: 'at', refreshToken: 'rt' },
      } as any)

      const store = useAuthStore()
      await store.login({ email: 'test@example.com', password: 'pass' })

      expect(localStorage.getItem('dossiat_access_token')).toBe('at')
      expect(localStorage.getItem('dossiat_refresh_token')).toBe('rt')
    })

    it('sets error on failure', async () => {
      mockLogin.mockRejectedValueOnce({ response: { data: { error: 'Invalid credentials' } } })

      const store = useAuthStore()
      await store.login({ email: 'test@example.com', password: 'wrong' })

      expect(store.user).toBeNull()
      expect(store.error).toBe('Invalid credentials')
      expect(store.isAuthenticated).toBe(false)
    })

    it('sets loading state during login', async () => {
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise((resolve) => { resolvePromise = resolve })
      mockLogin.mockReturnValueOnce(pendingPromise as any)

      const store = useAuthStore()
      const loginPromise = store.login({ email: 'test@example.com', password: 'pass' })

      expect(store.loading).toBe(true)

      resolvePromise!({ data: { user: { id: 1 }, accessToken: 'at', refreshToken: 'rt' } })
      await loginPromise

      expect(store.loading).toBe(false)
    })
  })

  describe('register()', () => {
    it('calls auth service and stores user + tokens', async () => {
      const userData = { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe', role: 'agent' }
      mockRegister.mockResolvedValueOnce({
        data: { ...userData, accessToken: 'at', refreshToken: 'rt' },
      } as any)

      const store = useAuthStore()
      await store.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'agent',
      })

      expect(store.user).toEqual(userData)
      expect(store.isAuthenticated).toBe(true)
    })

    it('sets error on failure', async () => {
      mockRegister.mockRejectedValueOnce({ response: { data: { error: 'Email already registered' } } })

      const store = useAuthStore()
      await store.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'agent',
      })

      expect(store.user).toBeNull()
      expect(store.error).toBe('Email already registered')
    })
  })

  describe('logout()', () => {
    it('clears user and tokens', async () => {
      mockLogin.mockResolvedValueOnce({
        data: { user: { id: 1 }, accessToken: 'at', refreshToken: 'rt' },
      } as any)
      mockLogout.mockResolvedValueOnce({} as any)

      const store = useAuthStore()
      await store.login({ email: 'test@example.com', password: 'pass' })
      expect(store.isAuthenticated).toBe(true)

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('clears localStorage', async () => {
      localStorage.setItem('dossiat_access_token', 'at')
      localStorage.setItem('dossiat_refresh_token', 'rt')
      mockLogout.mockResolvedValueOnce({} as any)

      const store = useAuthStore()
      await store.logout()

      expect(localStorage.getItem('dossiat_access_token')).toBeNull()
      expect(localStorage.getItem('dossiat_refresh_token')).toBeNull()
    })
  })

  describe('loadUser()', () => {
    it('loads user from API when tokens exist in localStorage', async () => {
      localStorage.setItem('dossiat_access_token', 'at')
      localStorage.setItem('dossiat_refresh_token', 'rt')
      mockGetMe.mockResolvedValueOnce({
        data: { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe', role: 'agent' },
      } as any)

      const store = useAuthStore()
      await store.loadUser()

      expect(store.user).toBeDefined()
      expect(store.isAuthenticated).toBe(true)
    })

    it('clears tokens if no tokens in localStorage', async () => {
      const store = useAuthStore()
      await store.loadUser()

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('clears tokens if API call fails', async () => {
      localStorage.setItem('dossiat_access_token', 'invalid')
      localStorage.setItem('dossiat_refresh_token', 'invalid')
      mockGetMe.mockRejectedValueOnce(new Error('Unauthorized'))

      const store = useAuthStore()
      await store.loadUser()

      expect(store.user).toBeNull()
      expect(localStorage.getItem('dossiat_access_token')).toBeNull()
    })
  })

  describe('computed: hasRole()', () => {
    it('returns true for matching role', async () => {
      mockLogin.mockResolvedValueOnce({
        data: { user: { id: 1, role: 'agent' }, accessToken: 'at', refreshToken: 'rt' },
      } as any)

      const store = useAuthStore()
      await store.login({ email: 'test@example.com', password: 'pass' })

      expect(store.hasRole('agent')).toBe(true)
      expect(store.hasRole('client')).toBe(false)
    })

    it('returns false when no user', () => {
      const store = useAuthStore()
      expect(store.hasRole('agent')).toBe(false)
    })
  })
})
