import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockGetPlans = vi.fn()
const mockGetMySubscription = vi.fn()

vi.mock('@/services/subscriptions', () => ({
  getPlans: (...args: unknown[]) => mockGetPlans(...args),
  getMySubscription: (...args: unknown[]) => mockGetMySubscription(...args),
}))

import { useSubscriptionsStore } from '@/stores/subscriptions'

describe('Subscriptions Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('has empty plans', () => {
      const store = useSubscriptionsStore()
      expect(store.plans).toEqual([])
      expect(store.currentSubscription).toBeNull()
      expect(store.currentPlan).toBeNull()
    })
  })

  describe('fetchPlans()', () => {
    it('loads plans from API', async () => {
      const plans = [
        { id: '1', name: 'small_business', price: 29, currency: 'USD', interval: 'monthly', maxSeats: 5, maxRecurrentMissions: 10, features: [] },
      ]
      mockGetPlans.mockResolvedValueOnce({ success: true, data: plans })

      const store = useSubscriptionsStore()
      await store.fetchPlans()

      expect(store.plans).toEqual(plans)
    })
  })

  describe('fetchMySubscription()', () => {
    it('loads current subscription', async () => {
      const plan = { id: '1', name: 'professional', price: 99, currency: 'USD', interval: 'monthly', maxSeats: 20, maxRecurrentMissions: -1, features: [] }
      const subscription = { id: 'sub-1', planId: '1', status: 'active', currentPeriodStart: '2026-01-01', currentPeriodEnd: '2026-02-01', plan }
      mockGetMySubscription.mockResolvedValueOnce({ success: true, data: subscription })

      const store = useSubscriptionsStore()
      await store.fetchMySubscription()

      expect(store.currentSubscription).toEqual(subscription)
      expect(store.currentPlan).toEqual(plan)
    })

    it('clears subscription on failure', async () => {
      mockGetMySubscription.mockRejectedValueOnce(new Error('Not found'))

      const store = useSubscriptionsStore()
      await store.fetchMySubscription()

      expect(store.currentSubscription).toBeNull()
    })
  })
})
