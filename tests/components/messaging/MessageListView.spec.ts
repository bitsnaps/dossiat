import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import MessageListView from '@/views/messages/MessageListView.vue'
import { useMessagesStore } from '@/stores/messages'

const fetchConversations = vi.fn()

const defaultStoreState = {
  conversations: [] as any[],
  loading: false,
  error: null as string | null,
  fetchConversations,
}

vi.mock('@/stores/messages', () => ({
  useMessagesStore: vi.fn(() => ({ ...defaultStoreState })),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 1, firstName: 'John', lastName: 'Doe' },
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
  return mount(MessageListView, {
    global: { plugins: [pinia, router] },
  })
}

describe('MessageListView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    router.push('/app/messages')
  })

  it('renders the container', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-message-list-view').exists()).toBe(true)
  })

  it('renders the page title', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-message-list-view__title').exists()).toBe(true)
  })

  it('calls fetchConversations on mount', () => {
    mountView()
    expect(fetchConversations).toHaveBeenCalled()
  })

  it('shows loading skeleton when loading', () => {
    vi.mocked(useMessagesStore).mockReturnValueOnce({
      ...defaultStoreState,
      loading: true,
    } as any)

    const wrapper = mountView()
    expect(wrapper.find('.ds-message-list-view__loading').exists()).toBe(true)
  })

  it('shows empty state when no conversations', () => {
    const wrapper = mountView()
    expect(wrapper.find('.ds-empty-state').exists()).toBe(true)
  })

  it('renders conversation card when conversations exist', () => {
    vi.mocked(useMessagesStore).mockReturnValueOnce({
      ...defaultStoreState,
      conversations: [
        {
          id: 1,
          missionId: 10,
          missionTitle: 'Electricity Bill',
          lastMessage: { content: 'Hello', senderId: 1, createdAt: '2026-06-30T10:00:00Z' },
          unreadCount: 0,
        },
      ],
    } as any)

    const wrapper = mountView()
    expect(wrapper.find('.ds-message-list-view__card').exists()).toBe(true)
  })

  it('renders mission title for each conversation', () => {
    vi.mocked(useMessagesStore).mockReturnValueOnce({
      ...defaultStoreState,
      conversations: [
        {
          id: 1,
          missionId: 10,
          missionTitle: 'Electricity Bill',
          lastMessage: { content: 'Hello', senderId: 1, createdAt: '2026-06-30T10:00:00Z' },
          unreadCount: 0,
        },
      ],
    } as any)

    const wrapper = mountView()
    expect(wrapper.find('.ds-message-list-view__mission').text()).toContain('Electricity Bill')
  })

  it('shows unread dot for conversations with unread messages', () => {
    vi.mocked(useMessagesStore).mockReturnValueOnce({
      ...defaultStoreState,
      conversations: [
        {
          id: 1,
          missionId: 10,
          missionTitle: 'Electricity Bill',
          lastMessage: { content: 'Hello', senderId: 2, createdAt: '2026-06-30T10:00:00Z' },
          unreadCount: 3,
        },
      ],
    } as any)

    const wrapper = mountView()
    expect(wrapper.find('.ds-message-list-view__unread-dot').exists()).toBe(true)
  })

  it('shows last message preview', () => {
    vi.mocked(useMessagesStore).mockReturnValueOnce({
      ...defaultStoreState,
      conversations: [
        {
          id: 1,
          missionId: 10,
          missionTitle: 'Electricity Bill',
          lastMessage: { content: 'Hello there!', senderId: 2, createdAt: '2026-06-30T10:00:00Z' },
          unreadCount: 0,
        },
      ],
    } as any)

    const wrapper = mountView()
    expect(wrapper.find('.ds-message-list-view__preview').text()).toContain('Hello there!')
  })

  it('shows "You:" prefix for own messages in preview', () => {
    vi.mocked(useMessagesStore).mockReturnValueOnce({
      ...defaultStoreState,
      conversations: [
        {
          id: 1,
          missionId: 10,
          missionTitle: 'Electricity Bill',
          lastMessage: { content: 'Thanks!', senderId: 1, createdAt: '2026-06-30T10:00:00Z' },
          unreadCount: 0,
        },
      ],
    } as any)

    const wrapper = mountView()
    const preview = wrapper.find('.ds-message-list-view__preview').text()
    expect(preview).toContain('Thanks!')
  })
})
