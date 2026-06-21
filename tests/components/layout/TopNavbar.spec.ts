import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import TopNavbar from '@/components/layout/TopNavbar.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/dashboard', component: { template: '<div />' } },
  ],
})

function mountTopNavbar() {
  return mount(TopNavbar, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('TopNavbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the navbar container', () => {
    const wrapper = mountTopNavbar()
    expect(wrapper.find('.ds-topnavbar').exists()).toBe(true)
  })

  it('renders the hamburger toggle button', () => {
    const wrapper = mountTopNavbar()
    expect(wrapper.find('.ds-topnavbar__toggle').exists()).toBe(true)
  })

  it('renders the search input', () => {
    const wrapper = mountTopNavbar()
    expect(wrapper.find('.ds-topnavbar__search-input').exists()).toBe(true)
  })

  it('renders the notifications button', () => {
    const wrapper = mountTopNavbar()
    expect(wrapper.find('.ds-topnavbar__notifications').exists()).toBe(true)
  })

  it('renders the user avatar area', () => {
    const wrapper = mountTopNavbar()
    expect(wrapper.find('.ds-topnavbar__user').exists()).toBe(true)
  })

  it('emits toggle-sidebar when hamburger is clicked', async () => {
    const wrapper = mountTopNavbar()
    await wrapper.find('.ds-topnavbar__toggle').trigger('click')
    expect(wrapper.emitted('toggle-sidebar')).toBeTruthy()
  })
})
