import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import SubscriptionManageView from '@/views/subscription/SubscriptionManageView.vue'
import { useSubscriptionsStore } from '@/stores/subscriptions'

const fetchPlans = vi.fn()
const fetchMySubscription = vi.fn()
const updatePlan = vi.fn()
const cancelPlan = vi.fn()
const openPortal = vi.fn()

vi.mock('@/stores/subscriptions', () => ({
  useSubscriptionsStore: vi.fn(() => ({
    plans: [],
    currentSubscription: null,
    currentPlan: null,
    isSubscribed: false,
    loading: false,
    error: null,
    fetchPlans,
    fetchMySubscription,
    updatePlan,
    cancelPlan,
    openPortal,
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
  return mount(SubscriptionManageView, {
    global: { plugins: [pinia, router] },
  })
}

describe('SubscriptionManageView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-manage').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-manage__title').exists()).toBe(true)
  })

  it('calls fetchPlans and fetchMySubscription on mount', () => {
    mountView()
    expect(fetchPlans).toHaveBeenCalled()
    expect(fetchMySubscription).toHaveBeenCalled()
  })

  it('shows empty state when no subscription', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-manage__empty').exists()).toBe(true)
  })

  it('shows browse plans button in empty state', () => {
    const wrapper = mountView()
    const empty = wrapper.find('.ds-subscription-manage__empty')
    expect(empty.find('a, button').exists()).toBe(true)
  })

  it('shows loading state', () => {
    vi.mocked(useSubscriptionsStore).mockReturnValueOnce({
      plans: [],
      currentSubscription: null,
      currentPlan: null,
      isSubscribed: false,
      loading: true,
      error: null,
      fetchPlans,
      fetchMySubscription,
      updatePlan,
      cancelPlan,
      openPortal,
    } as any)
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-manage__loading').exists()).toBe(true)
  })

  it('renders current plan card when subscribed', () => {
    vi.mocked(useSubscriptionsStore).mockReturnValueOnce({
      plans: [
        { id: 1, name: 'small_business', price: 29, currency: 'USD', interval: 'monthly', maxSeats: 3, maxRecurrentMissions: 10, features: {} },
        { id: 2, name: 'professional', price: 99, currency: 'USD', interval: 'monthly', maxSeats: 10, maxRecurrentMissions: -1, features: {} },
      ],
      currentSubscription: { id: 1, planId: 1, status: 'active', currentPeriodStart: '2026-01-01', currentPeriodEnd: '2026-02-01', plan: { id: 1, name: 'small_business', price: 29, currency: 'USD', interval: 'monthly', maxSeats: 3, maxRecurrentMissions: 10, features: {} } },
      currentPlan: { id: 1, name: 'small_business', price: 29, currency: 'USD', interval: 'monthly', maxSeats: 3, maxRecurrentMissions: 10, features: {} },
      isSubscribed: true,
      loading: false,
      error: null,
      fetchPlans,
      fetchMySubscription,
      updatePlan,
      cancelPlan,
      openPortal,
    } as any)
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-manage__current').exists()).toBe(true)
  })

  it('renders cancel section when subscribed', () => {
    vi.mocked(useSubscriptionsStore).mockReturnValueOnce({
      plans: [],
      currentSubscription: { id: 1, planId: 1, status: 'active', currentPeriodStart: '2026-01-01', currentPeriodEnd: '2026-02-01' },
      currentPlan: { id: 1, name: 'small_business', price: 29, currency: 'USD', interval: 'monthly', maxSeats: 3, maxRecurrentMissions: 10, features: {} },
      isSubscribed: true,
      loading: false,
      error: null,
      fetchPlans,
      fetchMySubscription,
      updatePlan,
      cancelPlan,
      openPortal,
    } as any)
    const wrapper = mountView()
    expect(wrapper.find('.ds-subscription-manage__danger').exists()).toBe(true)
  })
})
