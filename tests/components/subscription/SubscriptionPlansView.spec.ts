import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import SubscriptionPlansView from '@/views/subscription/SubscriptionPlansView.vue'
import { useSubscriptionsStore } from '@/stores/subscriptions'

const fetchPlans = vi.fn()
const fetchMySubscription = vi.fn()
const subscribeToPlan = vi.fn()

vi.mock('@/stores/subscriptions', () => ({
  useSubscriptionsStore: vi.fn(() => ({
    plans: [],
    currentSubscription: null,
    loading: false,
    error: null,
    fetchPlans,
    fetchMySubscription,
    subscribeToPlan,
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/subscriptions/plans', name: 'subscription-plans', component: { template: '<div />' } },
    { path: '/app/subscriptions/manage', name: 'subscription-manage', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(SubscriptionPlansView, {
    global: { plugins: [pinia, router] },
  })
}

describe('SubscriptionPlansView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-plans').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-plans__title').exists()).toBe(true)
  })

  it('calls fetchPlans and fetchMySubscription on mount', () => {
    mountView()
    expect(fetchPlans).toHaveBeenCalled()
    expect(fetchMySubscription).toHaveBeenCalled()
  })

  it('shows loading state', () => {
    vi.mocked(useSubscriptionsStore).mockReturnValueOnce({
      plans: [],
      currentSubscription: null,
      loading: true,
      error: null,
      fetchPlans,
      fetchMySubscription,
      subscribeToPlan,
    } as any)
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-plans__loading').exists()).toBe(true)
  })

  it('renders plan cards when plans are available', () => {
    vi.mocked(useSubscriptionsStore).mockReturnValueOnce({
      plans: [
        { id: 1, name: 'small_business', price: 29, currency: 'USD', interval: 'monthly', maxSeats: 3, maxRecurrentMissions: 10, features: { missions: true, messaging: true } },
        { id: 2, name: 'professional', price: 99, currency: 'USD', interval: 'monthly', maxSeats: 10, maxRecurrentMissions: -1, features: { missions: true, messaging: true, priority_support: true } },
        { id: 3, name: 'enterprise', price: 499, currency: 'USD', interval: 'monthly', maxSeats: -1, maxRecurrentMissions: -1, features: { missions: true, messaging: true, csv_import: true } },
      ],
      currentSubscription: null,
      loading: false,
      error: null,
      fetchPlans,
      fetchMySubscription,
      subscribeToPlan,
    } as any)
    const wrapper = mountView()
    expect(wrapper.findAll('.ds-subscription-plans__card').length).toBe(3)
  })

  it('shows subscribed badge on current plan', () => {
    vi.mocked(useSubscriptionsStore).mockReturnValueOnce({
      plans: [
        { id: 1, name: 'small_business', price: 29, currency: 'USD', interval: 'monthly', maxSeats: 3, maxRecurrentMissions: 10, features: { missions: true } },
      ],
      currentSubscription: { id: 1, planId: 1, status: 'active', currentPeriodStart: '2026-01-01', currentPeriodEnd: '2026-02-01' },
      loading: false,
      error: null,
      fetchPlans,
      fetchMySubscription,
      subscribeToPlan,
    } as any)
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-plans__current-label').exists()).toBe(true)
  })

  it('renders currency note', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-plans__note').exists()).toBe(true)
  })
})
