import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/reset-password/:token', component: ResetPasswordView, name: 'reset-password' },
    { path: '/login', component: { template: '<div />' }, name: 'login' },
  ],
})

function mountResetPassword(routeToken = 'test-token-123') {
  router.push(`/reset-password/${routeToken}`)
  return mount(ResetPasswordView, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('ResetPasswordView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders the form', () => {
    const wrapper = mountResetPassword()
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('renders password input', () => {
    const wrapper = mountResetPassword()
    const passwordInputs = wrapper.findAll('input[type="password"]')
    expect(passwordInputs.length).toBeGreaterThanOrEqual(1)
  })

  it('renders confirm password input', () => {
    const wrapper = mountResetPassword()
    const passwordInputs = wrapper.findAll('input[type="password"]')
    expect(passwordInputs.length).toBe(2)
  })

  it('renders a submit button', () => {
    const wrapper = mountResetPassword()
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('renders "Back to login" link', () => {
    const wrapper = mountResetPassword()
    const loginLink = wrapper.find('a[href*="login"]')
    expect(loginLink.exists()).toBe(true)
  })

  it('does not show success or error message initially', () => {
    const wrapper = mountResetPassword()
    expect(wrapper.find('.ds-alert').exists()).toBe(false)
  })
})
