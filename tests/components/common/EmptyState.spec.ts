import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '@/components/common/EmptyState.vue'

describe('EmptyState', () => {
  it('renders with default icon class', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.find('.ds-empty-state').exists()).toBe(true)
    expect(wrapper.find('.bi-inbox').exists()).toBe(true)
  })

  it('renders custom icon when icon prop provided', () => {
    const wrapper = mount(EmptyState, {
      props: { icon: 'bi-folder' },
    })
    expect(wrapper.find('.bi-folder').exists()).toBe(true)
    expect(wrapper.find('.bi-inbox').exists()).toBe(false)
  })

  it('renders title when provided', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No results found' },
    })
    expect(wrapper.find('.ds-empty-state__title').text()).toBe('No results found')
  })

  it('does not render title when not provided', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.find('.ds-empty-state__title').exists()).toBe(false)
  })

  it('renders hint when provided', () => {
    const wrapper = mount(EmptyState, {
      props: { hint: 'Try a different search' },
    })
    expect(wrapper.find('.ds-empty-state__hint').text()).toBe('Try a different search')
  })

  it('does not render hint when not provided', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.find('.ds-empty-state__hint').exists()).toBe(false)
  })

  it('renders default slot content', () => {
    const wrapper = mount(EmptyState, {
      slots: { default: '<button>Action</button>' },
    })
    expect(wrapper.html()).toContain('Action')
  })

  it('renders icon slot to override default icon', () => {
    const wrapper = mount(EmptyState, {
      slots: { icon: '<span class="custom-icon">★</span>' },
    })
    expect(wrapper.find('.custom-icon').exists()).toBe(true)
  })
})
