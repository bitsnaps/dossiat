import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '@/services/auth'
import { getMe } from '@/services/users'

const ACCESS_TOKEN_KEY = 'dossiat_access_token'
const REFRESH_TOKEN_KEY = 'dossiat_refresh_token'
const VIEW_AS_ROLE_KEY = 'dossiat_view_as_role'

type UserRole = 'agent' | 'client' | 'admin'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
  emailVerified?: boolean
}

interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

interface RegisterResponse extends User {
  accessToken: string
  refreshToken: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshTokenValue = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const viewAsRole = ref<UserRole>((localStorage.getItem(VIEW_AS_ROLE_KEY) as UserRole) || 'admin')

  const isAuthenticated = computed(() => !!accessToken.value)

  /** The effective role: uses viewAsRole for admins, actual role otherwise */
  const effectiveRole = computed<UserRole>(() => {
    if (user.value?.role === 'admin' && viewAsRole.value && viewAsRole.value !== 'admin') {
      return viewAsRole.value
    }
    return user.value?.role ?? 'admin'
  })

  /** True when admin is viewing as agent or client */
  const isViewingAs = computed(() => {
    return user.value?.role === 'admin' && effectiveRole.value !== 'admin'
  })

  function hasRole(role: string): boolean {
    return effectiveRole.value === role
  }

  /** Check the user's real role (ignores viewAsRole) */
  function hasRealRole(role: string): boolean {
    return user.value?.role === role
  }

  function setViewAsRole(role: UserRole) {
    viewAsRole.value = role
    localStorage.setItem(VIEW_AS_ROLE_KEY, role)
  }

  function clearViewAsRole() {
    viewAsRole.value = 'admin'
    localStorage.removeItem(VIEW_AS_ROLE_KEY)
  }

  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshTokenValue.value = refresh
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshTokenValue.value = null
    error.value = null
    clearViewAsRole()
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  async function login(params: { email: string; password: string }) {
    loading.value = true
    error.value = null
    try {
      const response = await apiLogin(params) as ApiResponse<LoginResponse>
      const data = response.data!
      user.value = data.user
      setTokens(data.accessToken, data.refreshToken)
    } catch (err: any) {
      clearAuth()
      error.value = err.response?.data?.error || err.message || 'Login failed'
    } finally {
      loading.value = false
    }
  }

  async function register(params: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'agent' | 'client'
    acceptTerms: boolean
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await apiRegister(params) as ApiResponse<RegisterResponse>
      const data = response.data!
      user.value = {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        emailVerified: data.emailVerified,
      }
      setTokens(data.accessToken, data.refreshToken)
    } catch (err: any) {
      clearAuth()
      error.value = err.response?.data?.error || err.message || 'Registration failed'
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      if (refreshTokenValue.value) {
        await apiLogout(refreshTokenValue.value)
      }
    } catch {
      // Ignore logout API errors
    }
    clearAuth()
  }

  async function loadUser() {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)

    if (!token || !refresh) {
      clearAuth()
      return
    }

    accessToken.value = token
    refreshTokenValue.value = refresh

    try {
      const response = await getMe() as ApiResponse<User>
      user.value = response.data!
    } catch {
      clearAuth()
    }
  }

  return {
    user,
    accessToken,
    refreshTokenValue,
    loading,
    error,
    viewAsRole,
    effectiveRole,
    isAuthenticated,
    isViewingAs,
    hasRole,
    hasRealRole,
    setViewAsRole,
    clearViewAsRole,
    login,
    register,
    logout,
    loadUser,
  }
})
