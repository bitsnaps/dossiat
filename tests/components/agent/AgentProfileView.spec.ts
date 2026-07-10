import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AgentProfileView from '@/views/agent/AgentProfileView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/agents/:slug', name: 'agent-profile', component: { template: '<div />' } },
    { path: '/app/missions/create', name: 'mission-create', component: { template: '<div />' } },
  ],
})

const mockStoreFactory = vi.fn()
const mockAuthReturnValue = {
  user: null as any,
  isAuthenticated: false,
  hasRole: vi.fn((_role: string) => false),
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => mockAuthReturnValue),
}))

vi.mock('@/stores/agentProfile', () => ({
  useAgentProfileStore: (...args: any[]) => mockStoreFactory(...args),
}))

describe('AgentProfileView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  function mountWithStore(overrides: Record<string, any> = {}) {
    const pinia = createPinia()
    setActivePinia(pinia)

    mockStoreFactory.mockReturnValue({
      profile: null,
      publicProfile: null,
      loading: false,
      error: null,
      fetchPublicProfile: vi.fn(),
      fetchProfile: vi.fn(),
      clearPublicProfile: vi.fn(),
      ...overrides,
    })

    return mount(AgentProfileView, {
      global: {
        plugins: [pinia, router],
      },
    })
  }

  it('renders the profile container', () => {
    const wrapper = mountWithStore()
    expect(wrapper.find('.ds-agent-profile').exists()).toBe(true)
  })

  it('shows loading state when loading is true', () => {
    const wrapper = mountWithStore({ loading: true })
    expect(wrapper.find('.ds-loading').exists()).toBe(true)
  })

  it('shows not found state when publicProfile is null and not loading', () => {
    const wrapper = mountWithStore({ loading: false, publicProfile: null })
    expect(wrapper.find('.ds-empty-state').exists()).toBe(true)
  })

  it('shows profile hero when publicProfile is set', () => {
    const wrapper = mountWithStore({
      publicProfile: {
        id: 1,
        bio: 'Test bio',
        specialties: ['Finance'],
        acceptedClientTypes: 'Both',
        currency: 'USD',
        timezone: 'UTC',
        profilePhotoUrl: null,
        user: { id: 1, firstName: 'John', lastName: 'Doe' },
      },
    })
    expect(wrapper.find('.ds-agent-profile__hero').exists()).toBe(true)
    expect(wrapper.html()).toContain('John')
    expect(wrapper.html()).toContain('Doe')
  })

  it('shows specialties when available', () => {
    const wrapper = mountWithStore({
      publicProfile: {
        id: 1,
        bio: 'Bio',
        specialties: ['Finance', 'Legal'],
        acceptedClientTypes: 'Both',
        timezone: 'UTC',
        profilePhotoUrl: null,
        user: { id: 1, firstName: 'Jane', lastName: 'Smith' },
      },
    })
    expect(wrapper.html()).toContain('Finance')
    expect(wrapper.html()).toContain('Legal')
  })

  it('shows Start a Mission CTA for authenticated clients viewing another agent', () => {
    mockAuthReturnValue.user = { id: 100, firstName: 'Client', lastName: 'User', role: 'client' }
    mockAuthReturnValue.isAuthenticated = true
    mockAuthReturnValue.hasRole = vi.fn((role: string) => role === 'client')

    const wrapper = mountWithStore({
      publicProfile: {
        id: 1,
        bio: 'Bio',
        specialties: ['Finance'],
        acceptedClientTypes: 'Both',
        timezone: 'UTC',
        profilePhotoUrl: null,
        user: { id: 200, firstName: 'Agent', lastName: 'Profile' },
      },
    })

    const cta = wrapper.find('.ds-agent-profile__cta')
    expect(cta.exists()).toBe(true)
    const link = cta.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toContain('/app/missions/create?agentId=200')

    // Reset
    mockAuthReturnValue.user = null
    mockAuthReturnValue.isAuthenticated = false
    mockAuthReturnValue.hasRole = vi.fn((_role: string) => false)
  })

  it('does not show Start a Mission CTA for authenticated agents viewing another agent', () => {
    mockAuthReturnValue.user = { id: 300, firstName: 'Agent', lastName: 'User', role: 'agent' }
    mockAuthReturnValue.isAuthenticated = true
    mockAuthReturnValue.hasRole = vi.fn((role: string) => role === 'agent')

    const wrapper = mountWithStore({
      publicProfile: {
        id: 1,
        bio: 'Bio',
        specialties: ['Finance'],
        acceptedClientTypes: 'Both',
        timezone: 'UTC',
        profilePhotoUrl: null,
        user: { id: 400, firstName: 'Other', lastName: 'Agent' },
      },
    })

    const cta = wrapper.find('.ds-agent-profile__cta')
    expect(cta.exists()).toBe(false)

    // Reset
    mockAuthReturnValue.user = null
    mockAuthReturnValue.isAuthenticated = false
    mockAuthReturnValue.hasRole = vi.fn((_role: string) => false)
  })
})
