import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ClientProfileView from '@/views/client/ClientProfileView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/settings', name: 'client-settings', component: { template: '<div />' } },
  ],
})

const mockStoreFactory = vi.fn()

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 1, firstName: 'John', lastName: 'Doe', role: 'client' },
    isAuthenticated: true,
    hasRole: vi.fn(() => true),
  })),
}))

vi.mock('@/stores/clientProfile', () => ({
  useClientProfileStore: (...args: any[]) => mockStoreFactory(...args),
}))

describe('ClientProfileView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  function mountWithStore(overrides: Record<string, any> = {}) {
    const pinia = createPinia()
    setActivePinia(pinia)

    mockStoreFactory.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      fetchProfile: vi.fn(),
      ...overrides,
    })

    return mount(ClientProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('renders the profile container', () => {
    const wrapper = mountWithStore()
    expect(wrapper.find('.ds-client-profile').exists()).toBe(true)
  })

  it('shows loading state when loading is true', () => {
    const wrapper = mountWithStore({ loading: true })
    expect(wrapper.find('.ds-loading').exists()).toBe(true)
  })

  it('shows not found state when profile is null and not loading', () => {
    const wrapper = mountWithStore({ loading: false, profile: null })
    expect(wrapper.find('.ds-empty-state').exists()).toBe(true)
  })

  it('shows profile hero when profile is set', () => {
    const wrapper = mountWithStore({
      profile: {
        id: 1,
        userId: 1,
        companyName: 'Acme Corp',
        companySize: '11-50',
        industry: 'IT / Tech',
      },
    })
    expect(wrapper.find('.ds-client-profile__hero').exists()).toBe(true)
    expect(wrapper.html()).toContain('John')
    expect(wrapper.html()).toContain('Doe')
  })

  it('shows company info when available', () => {
    const wrapper = mountWithStore({
      profile: {
        id: 1,
        userId: 1,
        companyName: 'Acme Corp',
        companySize: '11-50',
        industry: 'IT / Tech',
      },
    })
    expect(wrapper.html()).toContain('Acme Corp')
    expect(wrapper.html()).toContain('11-50')
    expect(wrapper.html()).toContain('IT / Tech')
  })

  it('shows dash when no company info is set', () => {
    const wrapper = mountWithStore({
      profile: {
        id: 1,
        userId: 1,
        companyName: null,
        companySize: null,
        industry: null,
      },
    })
    expect(wrapper.find('.ds-text-muted').exists()).toBe(true)
  })

  it('shows edit profile button for own profile', () => {
    const wrapper = mountWithStore({
      profile: {
        id: 1,
        userId: 1,
        companyName: 'Acme Corp',
        companySize: null,
        industry: null,
      },
    })
    expect(wrapper.find('.ds-client-profile__actions').exists()).toBe(true)
  })
})
