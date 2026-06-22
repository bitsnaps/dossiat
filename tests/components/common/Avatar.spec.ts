import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from '@/components/common/Avatar.vue'

describe('Avatar', () => {
  it('renders BAvatar with name', () => {
    const wrapper = mount(Avatar, {
      props: { name: 'John Doe' },
    })
    expect(wrapper.find('.ds-avatar').exists()).toBe(true)
  })

  it('renders image when src is provided', () => {
    const wrapper = mount(Avatar, {
      props: { src: '/photo.jpg', name: 'John Doe' },
    })
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('img').attributes('src')).toBe('/photo.jpg')
  })

  it('renders initials when no src', () => {
    const wrapper = mount(Avatar, {
      props: { name: 'John Doe' },
    })
    expect(wrapper.find('.ds-avatar-initials').exists()).toBe(true)
    expect(wrapper.text()).toContain('JD')
  })

  it('renders size classes', () => {
    for (const s of ['sm', 'md', 'lg'] as const) {
      const wrapper = mount(Avatar, { props: { name: 'A', size: s } })
      expect(wrapper.find('.ds-avatar').classes()).toContain(`ds-avatar--${s}`)
    }
  })

  it('shows online indicator when online=true', () => {
    const wrapper = mount(Avatar, {
      props: { name: 'A', online: true },
    })
    expect(wrapper.find('.ds-avatar-online').exists()).toBe(true)
  })

  it('does not show online indicator by default', () => {
    const wrapper = mount(Avatar, { props: { name: 'A' } })
    expect(wrapper.find('.ds-avatar-online').exists()).toBe(false)
  })

  it('applies ring class when ring is true', () => {
    const wrapper = mount(Avatar, {
      props: { name: 'A', ring: true },
    })
    expect(wrapper.find('.ds-avatar--ring').exists()).toBe(true)
  })

  it('does not apply ring class by default', () => {
    const wrapper = mount(Avatar, { props: { name: 'A' } })
    expect(wrapper.find('.ds-avatar--ring').exists()).toBe(false)
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Avatar, {
      props: { name: 'A' },
    })
    await wrapper.find('.ds-avatar').trigger('click')
    // The click is on the wrapper div, need to check parent
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
