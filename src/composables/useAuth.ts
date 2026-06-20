import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const store = useAuthStore()
  const { user, loading, error, isAuthenticated } = storeToRefs(store)
  const { hasRole } = store

  const currentUser = user

  function login(params: { email: string; password: string }) {
    return store.login(params)
  }

  function logout() {
    return store.logout()
  }

  return {
    currentUser,
    isAuthenticated,
    hasRole,
    loading,
    error,
    login,
    logout,
  }
}
