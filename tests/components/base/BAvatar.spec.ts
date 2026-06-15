import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BAvatar from '@/components/base/BAvatar.vue'

describe('BAvatar', () => {
  it('renders image when src is provided', () => {
    const wrapper = mount(BAvatar, { props: { src: '/photo.jpg', name: 'John Doe' } })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/photo.jpg')
  })

  it('renders initials when no src', () => {
    const wrapper = mount(BAvatar, { props: { name: 'John Doe' } })
    expect(wrapper.find('.ds-avatar-initials').exists()).toBe(true)
    expect(wrapper.text()).toBe('JD')
  })

  it('handles single name for initials', () => {
    const wrapper = mount(BAvatar, { props: { name: 'John' } })
    expect(wrapper.text()).toBe('J')
  })

  it('renders size classes', () => {
    for (const s of ['sm', 'md', 'lg'] as const) {
      const wrapper = mount(BAvatar, { props: { name: 'A', size: s } })
      expect(wrapper.find('.ds-avatar').classes()).toContain(`ds-avatar--${s}`)
    }
  })

  it('shows online indicator when online is true', () => {
    const wrapper = mount(BAvatar, { props: { name: 'A', online: true } })
    expect(wrapper.find('.ds-avatar-online').exists()).toBe(true)
  })

  it('does not show online indicator by default', () => {
    const wrapper = mount(BAvatar, { props: { name: 'A' } })
    expect(wrapper.find('.ds-avatar-online').exists()).toBe(false)
  })
})
