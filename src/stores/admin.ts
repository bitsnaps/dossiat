import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import * as adminApi from '@/services/admin'

export interface AdminUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'agent' | 'client' | 'admin'
  emailVerified: boolean
  createdAt?: string
  agentProfile?: any
  clientProfile?: any
}

export interface AdminMission {
  id: number
  agentId: number
  clientId: number
  title: string
  description?: string
  status: string
  type: string
  pricingType: string
  agreedAmount?: number
  currency: string
  agent?: { id: number; firstName: string; lastName: string; email: string }
  client?: { id: number; firstName: string; lastName: string; email: string }
  payments?: any[]
  createdAt?: string
}

export interface AdminPayment {
  id: number
  missionId: number
  payerId: number
  payeeId: number
  amount: number
  currency: string
  method: string
  platformFee: number
  gatewayFee: number
  netAmount: number
  status: string
  payer?: { id: number; firstName: string; lastName: string; email: string }
  payee?: { id: number; firstName: string; lastName: string; email: string }
  mission?: { id: number; title: string }
  createdAt?: string
}

export interface AdminDispute {
  id: number
  missionId: number
  initiatedBy: number
  reason: string
  status: string
  resolution?: string | null
  resolvedAt?: string | null
  mission?: { id: number; title: string }
  initiator?: { id: number; firstName: string; lastName: string; email: string }
  messages?: any[]
  createdAt?: string
}

export interface AdminPlan {
  id: number
  name: string
  price: number
  currency: string
  interval: string
  maxSeats: number
  maxRecurrentMissions: number
  features: Record<string, unknown>
  isActive: boolean
}

export interface AdminStats {
  totalUsers: number
  totalMissions: number
  totalDisputes: number
  openDisputes: number
  totalRevenue: number
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export const useAdminStore = defineStore('admin', () => {
  const users = ref<AdminUser[]>([])
  const selectedUser = ref<AdminUser | null>(null)
  const missions = ref<AdminMission[]>([])
  const selectedMission = ref<AdminMission | null>(null)
  const payments = ref<AdminPayment[]>([])
  const selectedPayment = ref<AdminPayment | null>(null)
  const disputes = ref<AdminDispute[]>([])
  const selectedDispute = ref<AdminDispute | null>(null)
  const plans = ref<AdminPlan[]>([])
  const stats = ref<AdminStats | null>(null)
  const loading = ref<Record<string, boolean>>({})
  const error = ref<string | null>(null)
  const pagination = ref<Record<string, PaginationMeta>>({})

  function setLoading(key: string, value: boolean) {
    loading.value = { ...loading.value, [key]: value }
  }

  // ─── Stats ───

  async function fetchStats() {
    setLoading('stats', true)
    error.value = null
    try {
      const response = await adminApi.getStats() as ApiResponse<AdminStats>
      stats.value = response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch stats'
    } finally {
      setLoading('stats', false)
    }
  }

  // ─── Users ───

  async function fetchUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    setLoading('users', true)
    error.value = null
    try {
      const response = await adminApi.getUsers(params) as ApiResponse<AdminUser[]>
      users.value = response.data || []
      if (response.meta) {
        pagination.value = { ...pagination.value, users: response.meta }
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch users'
    } finally {
      setLoading('users', false)
    }
  }

  async function fetchUser(id: string) {
    setLoading('user', true)
    error.value = null
    try {
      const response = await adminApi.getUser(id) as ApiResponse<AdminUser>
      selectedUser.value = response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch user'
    } finally {
      setLoading('user', false)
    }
  }

  async function createUser(data: { email: string; firstName: string; lastName: string; role?: string; password: string }) {
    try {
      const response = await adminApi.createUser(data) as ApiResponse<AdminUser>
      users.value.unshift(response.data!)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to create user'
      throw err
    }
  }

  async function updateUser(id: string, data: { role?: string; emailVerified?: boolean }) {
    try {
      const response = await adminApi.updateUser(id, data) as ApiResponse<AdminUser>
      selectedUser.value = response.data!
      const idx = users.value.findIndex((u) => u.id === Number(id))
      if (idx >= 0) users.value[idx] = response.data!
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to update user'
      throw err
    }
  }

  async function deactivateUser(id: string) {
    try {
      const response = await adminApi.deactivateUser(id) as ApiResponse<AdminUser>
      const idx = users.value.findIndex((u) => u.id === Number(id))
      if (idx >= 0) users.value[idx] = response.data!
      if (selectedUser.value?.id === Number(id)) selectedUser.value = response.data!
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to deactivate user'
      throw err
    }
  }

  async function activateUser(id: string) {
    try {
      const response = await adminApi.activateUser(id) as ApiResponse<AdminUser>
      const idx = users.value.findIndex((u) => u.id === Number(id))
      if (idx >= 0) users.value[idx] = response.data!
      if (selectedUser.value?.id === Number(id)) selectedUser.value = response.data!
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to activate user'
      throw err
    }
  }

  async function deleteUser(id: string) {
    try {
      await adminApi.deleteUser(id)
      users.value = users.value.filter((u) => u.id !== Number(id))
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to delete user'
      throw err
    }
  }

  // ─── Missions ───

  async function fetchMissions(params?: { page?: number; limit?: number; status?: string; search?: string; type?: string }) {
    setLoading('missions', true)
    error.value = null
    try {
      const response = await adminApi.getMissions(params) as ApiResponse<AdminMission[]>
      missions.value = response.data || []
      if (response.meta) {
        pagination.value = { ...pagination.value, missions: response.meta }
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch missions'
    } finally {
      setLoading('missions', false)
    }
  }

  async function fetchMission(id: string) {
    setLoading('mission', true)
    error.value = null
    try {
      const response = await adminApi.getMission(id) as ApiResponse<AdminMission>
      selectedMission.value = response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch mission'
    } finally {
      setLoading('mission', false)
    }
  }

  async function createMission(data: {
    agentId: number
    clientId: number
    title: string
    description?: string
    type?: string
    pricingType: string
    agreedAmount?: number
    currency?: string
    agreedChecklist?: string[]
  }) {
    try {
      const response = await adminApi.createMission(data) as ApiResponse<AdminMission>
      missions.value.unshift(response.data!)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to create mission'
      throw err
    }
  }

  async function updateMission(id: string, data: {
    title?: string
    description?: string
    type?: string
    pricingType?: string
    agreedAmount?: number
    currency?: string
    agreedChecklist?: string[]
  }) {
    try {
      const response = await adminApi.updateMission(id, data) as ApiResponse<AdminMission>
      const idx = missions.value.findIndex((m) => m.id === Number(id))
      if (idx >= 0) missions.value[idx] = response.data!
      if (selectedMission.value?.id === Number(id)) selectedMission.value = response.data!
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to update mission'
      throw err
    }
  }

  async function deleteMission(id: string) {
    try {
      await adminApi.deleteMission(id)
      missions.value = missions.value.filter((m) => m.id !== Number(id))
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to delete mission'
      throw err
    }
  }

  async function updateMissionStatus(id: string, status: string) {
    try {
      const response = await adminApi.updateMissionStatus(id, status) as ApiResponse<AdminMission>
      selectedMission.value = { ...selectedMission.value!, ...response.data! }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to update mission status'
      throw err
    }
  }

  // ─── Payments ───

  async function fetchPayments(params?: { page?: number; limit?: number; status?: string; method?: string }) {
    setLoading('payments', true)
    error.value = null
    try {
      const response = await adminApi.getPayments(params) as ApiResponse<AdminPayment[]>
      payments.value = response.data || []
      if (response.meta) {
        pagination.value = { ...pagination.value, payments: response.meta }
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch payments'
    } finally {
      setLoading('payments', false)
    }
  }

  async function fetchPayment(id: string) {
    setLoading('payment', true)
    error.value = null
    try {
      const response = await adminApi.getPayment(id) as ApiResponse<AdminPayment>
      selectedPayment.value = response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch payment'
    } finally {
      setLoading('payment', false)
    }
  }

  // ─── Disputes ───

  async function fetchDisputes(params?: { page?: number; limit?: number; status?: string }) {
    setLoading('disputes', true)
    error.value = null
    try {
      const response = await adminApi.getDisputes(params) as ApiResponse<AdminDispute[]>
      disputes.value = response.data || []
      if (response.meta) {
        pagination.value = { ...pagination.value, disputes: response.meta }
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch disputes'
    } finally {
      setLoading('disputes', false)
    }
  }

  async function fetchDispute(id: string) {
    setLoading('dispute', true)
    error.value = null
    try {
      const response = await adminApi.getDispute(id) as ApiResponse<AdminDispute>
      selectedDispute.value = response.data!
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch dispute'
    } finally {
      setLoading('dispute', false)
    }
  }

  async function resolveDispute(id: string, resolution: string) {
    try {
      const response = await adminApi.resolveDispute(id, resolution) as ApiResponse<AdminDispute>
      selectedDispute.value = { ...selectedDispute.value!, ...response.data! }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to resolve dispute'
      throw err
    }
  }

  // ─── Subscription Plans ───

  async function fetchPlans() {
    setLoading('plans', true)
    error.value = null
    try {
      const response = await adminApi.getPlans() as ApiResponse<AdminPlan[]>
      plans.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch plans'
    } finally {
      setLoading('plans', false)
    }
  }

  async function createPlan(data: { name: string; price: number; currency?: string; interval?: string; maxSeats?: number; maxRecurrentMissions?: number; features?: Record<string, unknown> }) {
    try {
      const response = await adminApi.createPlan(data) as ApiResponse<AdminPlan>
      plans.value.push(response.data!)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to create plan'
      throw err
    }
  }

  async function updatePlan(id: string, data: Record<string, unknown>) {
    try {
      const response = await adminApi.updatePlan(id, data) as ApiResponse<AdminPlan>
      const idx = plans.value.findIndex((p) => p.id === Number(id))
      if (idx >= 0) plans.value[idx] = response.data!
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to update plan'
      throw err
    }
  }

  async function deletePlan(id: string) {
    try {
      await adminApi.deletePlan(id)
      const idx = plans.value.findIndex((p) => p.id === Number(id))
      if (idx >= 0) plans.value[idx].isActive = false
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to delete plan'
      throw err
    }
  }

  return {
    users, selectedUser,
    missions, selectedMission,
    payments, selectedPayment,
    disputes, selectedDispute,
    plans, stats, loading, error, pagination,
    fetchStats,
    fetchUsers, fetchUser, createUser, updateUser, deactivateUser, activateUser, deleteUser,
    fetchMissions, fetchMission, createMission, updateMission, deleteMission, updateMissionStatus,
    fetchPayments, fetchPayment,
    fetchDisputes, fetchDispute, resolveDispute,
    fetchPlans, createPlan, updatePlan, deletePlan,
  }
})
