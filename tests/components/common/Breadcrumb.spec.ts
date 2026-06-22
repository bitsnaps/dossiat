import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Breadcrumb from '@/components/common/Breadcrumb.vue'

describe('Breadcrumb', () => {
  it('renders breadcrumb nav element', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        items: [{ label: 'Home', to: '/' }, { label: 'Settings' }],
      },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    expect(wrapper.find('nav[aria-label="Breadcrumb"]').exists()).toBe(true)
  })

  it('renders items with separators', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', to: '/' },
          { label: 'Settings', to: '/settings' },
          { label: 'Account' },
        ],
      },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    const separators = wrapper.findAll('.ds-breadcrumb__separator')
    expect(separators).toHaveLength(2) // between 3 items there are 2 separators
  })

  it('renders RouterLink for non-current items with to prop', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        items: [{ label: 'Home', to: '/' }, { label: 'Current' }],
      },
      global: { stubs: { RouterLink: { template: '<a class="stub-link"><slot /></a>' } } },
    })
    expect(wrapper.find('.stub-link').exists()).toBe(true)
    expect(wrapper.find('.stub-link').text()).toContain('Home')
  })

  it('renders current item as span (no link)', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        items: [{ label: 'Home', to: '/' }, { label: 'Current Page' }],
      },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    const currentItem = wrapper.find('.ds-breadcrumb__item--current')
    expect(currentItem.exists()).toBe(true)
    expect(currentItem.text()).toBe('Current Page')
  })

  it('renders single item as current', () => {
    const wrapper = mount(Breadcrumb, {
      props: {
        items: [{ label: 'Dashboard' }],
      },
    })
    const currentItem = wrapper.find('.ds-breadcrumb__item--current')
    expect(currentItem.exists()).toBe(true)
    expect(currentItem.text()).toBe('Dashboard')
  })
})
