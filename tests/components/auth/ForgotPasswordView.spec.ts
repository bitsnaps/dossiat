import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/forgot-password', component: ForgotPasswordView, name: 'forgot-password' },
    { path: '/login', component: { template: '<div />' }, name: 'login' },
  ],
})

function mountForgotPassword() {
  return mount(ForgotPasswordView, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('ForgotPasswordView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders the form', () => {
    const wrapper = mountForgotPassword()
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('renders email input', () => {
    const wrapper = mountForgotPassword()
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('renders a submit button', () => {
    const wrapper = mountForgotPassword()
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('renders "Back to login" link', () => {
    const wrapper = mountForgotPassword()
    const loginLink = wrapper.find('a[href*="login"]')
    expect(loginLink.exists()).toBe(true)
  })

  it('does not show success or error message initially', () => {
    const wrapper = mountForgotPassword()
    expect(wrapper.find('.ds-alert').exists()).toBe(false)
  })
})
