import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getPlans as apiGetPlans,
  getMySubscription as apiGetMySubscription,
} from '@/services/subscriptions'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  maxSeats: number
  maxRecurrentMissions: number
  features: string[]
}

interface Subscription {
  id: string
  planId: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  plan?: Plan
}

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const plans = ref<Plan[]>([])
  const currentSubscription = ref<Subscription | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentPlan = computed(() => currentSubscription.value?.plan || null)

  async function fetchPlans() {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetPlans() as ApiResponse<Plan[]>
      plans.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch plans'
    } finally {
      loading.value = false
    }
  }

  async function fetchMySubscription() {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetMySubscription() as ApiResponse<Subscription>
      currentSubscription.value = response.data!
    } catch {
      currentSubscription.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    plans,
    currentSubscription,
    loading,
    error,
    currentPlan,
    fetchPlans,
    fetchMySubscription,
  }
})
