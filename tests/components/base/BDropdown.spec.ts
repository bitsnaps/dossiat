import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BDropdown from '@/components/base/BDropdown.vue'

describe('BDropdown', () => {
  it('renders trigger and menu', () => {
    const wrapper = mount(BDropdown, {
      slots: {
        trigger: '<button>Open</button>',
        default: '<div class="menu-item">Item 1</div>',
      },
    })
    expect(wrapper.text()).toContain('Open')
    expect(wrapper.text()).toContain('Item 1')
  })

  it('menu is hidden by default', () => {
    const wrapper = mount(BDropdown, {
      slots: {
        trigger: '<button>Open</button>',
        default: '<div>Menu</div>',
      },
    })
    expect(wrapper.find('.ds-dropdown-menu').classes()).not.toContain('ds-dropdown-open')
  })

  it('toggles menu on trigger click', async () => {
    const wrapper = mount(BDropdown, {
      slots: {
        trigger: '<button>Open</button>',
        default: '<div>Menu</div>',
      },
    })
    await wrapper.find('.ds-dropdown-trigger').trigger('click')
    expect(wrapper.find('.ds-dropdown-menu').classes()).toContain('ds-dropdown-open')
    await wrapper.find('.ds-dropdown-trigger').trigger('click')
    expect(wrapper.find('.ds-dropdown-menu').classes()).not.toContain('ds-dropdown-open')
  })

  it('emits select event when menu item is clicked', async () => {
    const wrapper = mount(BDropdown, {
      slots: {
        trigger: '<button>Open</button>',
        default: '<div class="ds-dropdown-item">Option A</div>',
      },
    })
    await wrapper.find('.ds-dropdown-trigger').trigger('click')
    await wrapper.find('.ds-dropdown-item').trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })
})
