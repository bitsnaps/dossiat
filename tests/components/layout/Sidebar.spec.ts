import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 1, role: 'agent' },
    isAuthenticated: true,
    hasRole: vi.fn((role: string) => role === 'agent'),
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/dashboard', name: 'dashboard', component: { template: '<div />' } },
    { path: '/app/missions', name: 'missions', component: { template: '<div />' } },
    { path: '/app/messages', name: 'messages', component: { template: '<div />' } },
    { path: '/app/payments', name: 'payments', component: { template: '<div />' } },
    { path: '/app/credits', name: 'credits', component: { template: '<div />' } },
    { path: '/app/settings', name: 'settings', component: { template: '<div />' } },
    { path: '/app/discover', name: 'discover-agents', component: { template: '<div />' } },
    { path: '/app/client/settings', name: 'client-settings', component: { template: '<div />' } },
  ],
})

function mountSidebar(props = {}) {
  return mount(Sidebar, {
    props: {
      collapsed: false,
      ...props,
    },
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('Sidebar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders the sidebar container', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.ds-sidebar').exists()).toBe(true)
  })

  it('renders the brand name', () => {
    const wrapper = mountSidebar()
    expect(wrapper.find('.ds-sidebar__brand-name').text()).toBeTruthy()
  })

  it('renders navigation links', () => {
    const wrapper = mountSidebar()
    const links = wrapper.findAll('.ds-sidebar__link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders Dashboard link', () => {
    const wrapper = mountSidebar()
    const html = wrapper.html()
    expect(html).toContain('Dashboard')
  })

  it('renders Missions link', () => {
    const wrapper = mountSidebar()
    const html = wrapper.html()
    expect(html).toContain('Missions')
  })

  it('renders Settings link', () => {
    const wrapper = mountSidebar()
    const html = wrapper.html()
    expect(html).toContain('Settings')
  })

  it('applies collapsed class when collapsed prop is true', () => {
    const wrapper = mountSidebar({ collapsed: true })
    expect(wrapper.find('.ds-sidebar').classes()).toContain('ds-sidebar--collapsed')
  })

  it('does not apply collapsed class when collapsed prop is false', () => {
    const wrapper = mountSidebar({ collapsed: false })
    expect(wrapper.find('.ds-sidebar').classes()).not.toContain('ds-sidebar--collapsed')
  })

  it('renders section titles', () => {
    const wrapper = mountSidebar()
    const sections = wrapper.findAll('.ds-sidebar__section-title')
    expect(sections.length).toBeGreaterThan(0)
  })

  it('emits toggle event when brand is clicked', async () => {
    const wrapper = mountSidebar()
    const brand = wrapper.find('.ds-sidebar__brand')
    await brand.trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
  })
})
