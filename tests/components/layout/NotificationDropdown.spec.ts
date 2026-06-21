import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NotificationDropdown from '@/components/layout/NotificationDropdown.vue'

function mountNotificationDropdown(notifications: any[] = []) {
  const pinia = createPinia()
  const wrapper = mount(NotificationDropdown, {
    props: { notifications },
    global: {
      plugins: [pinia],
    },
  })
  return { wrapper, pinia }
}

describe('NotificationDropdown', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the dropdown container', () => {
    const { wrapper } = mountNotificationDropdown()
    expect(wrapper.find('.ds-notification-dropdown').exists()).toBe(true)
  })

  it('renders the title', () => {
    const { wrapper } = mountNotificationDropdown()
    expect(wrapper.find('.ds-notification-dropdown__title').text()).toBeTruthy()
  })

  it('renders "Mark all read" button', () => {
    const { wrapper } = mountNotificationDropdown()
    expect(wrapper.find('.ds-notification-dropdown__mark-all').exists()).toBe(true)
  })

  it('shows empty state when no notifications', () => {
    const { wrapper } = mountNotificationDropdown([])
    expect(wrapper.find('.ds-notification-dropdown__empty').exists()).toBe(true)
  })

  it('renders notification items when provided', () => {
    const notifications = [
      { id: 1, title: 'New mission', body: 'You have a new mission', readAt: null },
      { id: 2, title: 'Payment received', body: '$50 received', readAt: '2026-01-01' },
    ]
    const { wrapper } = mountNotificationDropdown(notifications)
    const items = wrapper.findAll('.ds-notification-dropdown__item')
    expect(items.length).toBe(2)
  })

  it('marks unread items with unread class', () => {
    const notifications = [
      { id: 1, title: 'New mission', body: 'You have a new mission', readAt: null },
      { id: 2, title: 'Old mission', body: 'Read already', readAt: '2026-01-01' },
    ]
    const { wrapper } = mountNotificationDropdown(notifications)
    const unreadItems = wrapper.findAll('.ds-notification-dropdown__item--unread')
    expect(unreadItems.length).toBe(1)
  })

  it('emits mark-all-read when "Mark all read" is clicked', async () => {
    const notifications = [
      { id: 1, title: 'New mission', body: 'You have a new mission', readAt: null },
    ]
    const { wrapper } = mountNotificationDropdown(notifications)
    await wrapper.find('.ds-notification-dropdown__mark-all').trigger('click')
    expect(wrapper.emitted('mark-all-read')).toBeTruthy()
  })

  it('emits mark-read with notification id when item is clicked', async () => {
    const notifications = [
      { id: 1, title: 'New mission', body: 'You have a new mission', readAt: null },
    ]
    const { wrapper } = mountNotificationDropdown(notifications)
    await wrapper.find('.ds-notification-dropdown__item').trigger('click')
    expect(wrapper.emitted('mark-read')).toBeTruthy()
    expect(wrapper.emitted('mark-read')![0]).toEqual([1])
  })
})
