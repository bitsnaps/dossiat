import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import MessageBubble from '@/components/messaging/MessageBubble.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      messages: {
        read: 'Read',
        unread: 'Unread',
        justNow: 'Just now',
        minutesAgo: '{n}m ago',
        hoursAgo: '{n}h ago',
        daysAgo: '{n}d ago',
      },
    },
  },
})

const baseMessage = {
  id: 1,
  conversationId: 1,
  senderId: 1,
  content: 'Hello, how are you?',
  readAt: null as string | null,
  createdAt: new Date().toISOString(),
  sender: { id: 1, firstName: 'John', lastName: 'Doe' },
}

function createWrapper(props: Record<string, any> = {}) {
  return mount(MessageBubble, {
    props: {
      message: { ...baseMessage },
      isOwn: false,
      ...props,
    },
    global: { plugins: [i18n] },
  })
}

describe('MessageBubble', () => {
  it('renders the message content', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-message-bubble').exists()).toBe(true)
    expect(wrapper.html()).toContain('Hello, how are you?')
  })

  it('applies own class when isOwn is true', () => {
    const wrapper = createWrapper({ isOwn: true })
    expect(wrapper.find('.ds-message-bubble--own').exists()).toBe(true)
  })

  it('does not apply own class when isOwn is false', () => {
    const wrapper = createWrapper({ isOwn: false })
    expect(wrapper.find('.ds-message-bubble--own').exists()).toBe(false)
  })

  it('shows sender name when not own message', () => {
    const wrapper = createWrapper({ isOwn: false })
    expect(wrapper.html()).toContain('John')
  })

  it('hides sender name when own message', () => {
    const wrapper = createWrapper({ isOwn: true })
    expect(wrapper.find('.ds-message-bubble__sender').exists()).toBe(false)
  })

  it('shows timestamp', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-message-bubble__time').exists()).toBe(true)
  })

  it('shows read status for own messages when read', () => {
    const wrapper = createWrapper({ isOwn: true, message: { ...baseMessage, readAt: new Date().toISOString() } })
    expect(wrapper.find('.ds-message-bubble__status').exists()).toBe(true)
  })

  it('shows unread indicator when readAt is null for own message', () => {
    const wrapper = createWrapper({ isOwn: true, message: { ...baseMessage, readAt: null } })
    expect(wrapper.find('.ds-message-bubble__status').exists()).toBe(true)
  })

  it('shows read indicator when readAt is set for own message', () => {
    const wrapper = createWrapper({ isOwn: true, message: { ...baseMessage, readAt: '2026-06-21T10:00:00Z' } })
    expect(wrapper.find('.ds-message-bubble__status').exists()).toBe(true)
  })

  it('does not show status for received messages', () => {
    const wrapper = createWrapper({ isOwn: false })
    expect(wrapper.find('.ds-message-bubble__status').exists()).toBe(false)
  })

  it('renders long message content', () => {
    const longMessage = 'A'.repeat(500)
    const wrapper = createWrapper({ message: { ...baseMessage, content: longMessage } })
    expect(wrapper.html()).toContain(longMessage)
  })
})
