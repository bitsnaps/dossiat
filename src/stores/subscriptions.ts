import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiResponse } from '@/server/utils/apiResponse'
import {
  getPlans as apiGetPlans,
  getMySubscription as apiGetMySubscription,
  getSubscriptionInvoices as apiGetSubscriptionInvoices,
  subscribe as apiSubscribe,
  updateSubscription as apiUpdateSubscription,
  cancelSubscription as apiCancelSubscription,
  openBillingPortal as apiOpenBillingPortal,
} from '@/services/subscriptions'

export interface Plan {
  id: number
  name: string
  price: number
  currency: string
  interval: string
  maxSeats: number
  maxRecurrentMissions: number
  features: Record<string, unknown>
}

export interface Subscription {
  id: number
  planId: number
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  plan?: Plan
}

export interface SubscriptionInvoice {
  id: number
  subscriptionId: number
  amount: number
  currency: string
  status: string
  paidAt: string | null
  createdAt: string
}

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const plans = ref<Plan[]>([])
  const currentSubscription = ref<Subscription | null>(null)
  const invoices = ref<SubscriptionInvoice[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentPlan = computed(() => currentSubscription.value?.plan || null)
  const isSubscribed = computed(() => !!currentSubscription.value && currentSubscription.value.status === 'active')

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

  async function fetchInvoices() {
    loading.value = true
    error.value = null
    try {
      const response = await apiGetSubscriptionInvoices() as ApiResponse<SubscriptionInvoice[]>
      invoices.value = response.data || []
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to fetch invoices'
    } finally {
      loading.value = false
    }
  }

  async function subscribeToPlan(planId: number) {
    loading.value = true
    error.value = null
    try {
      await apiSubscribe(String(planId))
      await fetchMySubscription()
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to subscribe'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePlan(planId: number) {
    loading.value = true
    error.value = null
    try {
      await apiUpdateSubscription(String(planId))
      await fetchMySubscription()
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to update plan'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelPlan() {
    loading.value = true
    error.value = null
    try {
      await apiCancelSubscription()
      currentSubscription.value = null
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to cancel subscription'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function openPortal() {
    error.value = null
    try {
      const response = await apiOpenBillingPortal() as ApiResponse<{ url: string }>
      return response.data!.url
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Failed to open billing portal'
      throw err
    }
  }

  return {
    plans,
    currentSubscription,
    invoices,
    loading,
    error,
    currentPlan,
    isSubscribed,
    fetchPlans,
    fetchMySubscription,
    fetchInvoices,
    subscribeToPlan,
    updatePlan,
    cancelPlan,
    openPortal,
  }
})
