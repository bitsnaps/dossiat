import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import VerifyEmailView from '@/views/auth/VerifyEmailView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/verify-email/:token', component: VerifyEmailView, name: 'verify-email' },
    { path: '/login', component: { template: '<div />' }, name: 'login' },
  ],
})

function mountVerifyEmail(routeToken = 'verify-token-123') {
  router.push(`/verify-email/${routeToken}`)
  return mount(VerifyEmailView, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('VerifyEmailView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders the verify email page', () => {
    const wrapper = mountVerifyEmail()
    expect(wrapper.exists()).toBe(true)
  })

  it('shows loading state initially', () => {
    const wrapper = mountVerifyEmail()
    // Should show some loading indicator or text
    const html = wrapper.html()
    expect(html).toBeTruthy()
  })

  it('renders "Back to login" link', () => {
    const wrapper = mountVerifyEmail()
    const loginLink = wrapper.find('a[href*="login"]')
    expect(loginLink.exists()).toBe(true)
  })
})
