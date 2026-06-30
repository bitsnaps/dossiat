import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import MessageThreadView from '@/views/messages/MessageThreadView.vue'
import { useMessagesStore } from '@/stores/messages'

const fetchMessages = vi.fn()
const sendMessage = vi.fn().mockResolvedValue({ id: 99 })
const markAllAsRead = vi.fn()

const defaultStoreState = {
  messages: [] as any[],
  conversations: [] as any[],
  loading: false,
  error: null as string | null,
  fetchMessages,
  sendMessage,
  markAllAsRead,
}

vi.mock('@/stores/messages', () => ({
  useMessagesStore: vi.fn(() => ({ ...defaultStoreState })),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 1, firstName: 'John', lastName: 'Doe' },
    hasRole: (role: string) => role === 'agent',
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/app/messages', name: 'messages', component: { template: '<div />' } },
    { path: '/app/messages/:missionId', name: 'message-thread', component: { template: '<div />' } },
  ],
})

function mountView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(MessageThreadView, {
    global: { plugins: [pinia, router] },
  })
}

describe('MessageThreadView', () => {
  beforeEach(async () => {
    localStorage.clear()
    vi.clearAllMocks()
    await router.push('/app/messages/1')
    await router.isReady()
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-message-thread').exists()).toBe(true)
  })

  it('renders the header', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-message-thread__header').exists()).toBe(true)
  })

  it('renders the back button', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-message-thread__back').exists()).toBe(true)
  })

  it('renders the messages container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-message-thread__messages').exists()).toBe(true)
  })

  it('renders the composer', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-message-composer').exists()).toBe(true)
  })

  it('calls fetchMessages on mount', () => {
    mountView()
    expect(fetchMessages).toHaveBeenCalled()
  })

  it('shows empty state when no messages', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-message-thread__empty').exists()).toBe(true)
  })

  it('renders mission title from conversations', () => {
    vi.mocked(useMessagesStore).mockReturnValueOnce({
      ...defaultStoreState,
      conversations: [{ id: 1, missionId: 1, missionTitle: 'Electricity Bill' }],
    } as any)

    const wrapper = mountView()
    expect(wrapper.find('.ds-message-thread__title').text()).toContain('Electricity Bill')
  })

  it('falls back to mission ID when no matching conversation', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-message-thread__title').text()).toContain('Mission')
  })
})
