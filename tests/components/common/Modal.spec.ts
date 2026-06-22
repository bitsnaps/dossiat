import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '@/components/common/Modal.vue'

describe('Modal', () => {
  it('does not render when modelValue is false', () => {
    const wrapper = mount(Modal, {
      props: { modelValue: false, title: 'Test' },
      slots: { default: 'Content' },
    })
    expect(wrapper.find('.ds-modal-overlay').exists()).toBe(false)
  })

  it('renders when modelValue is true', () => {
    const wrapper = mount(Modal, {
      props: { modelValue: true, title: 'Test' },
      slots: { default: 'Content' },
    })
    expect(wrapper.find('.ds-modal-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test')
    expect(wrapper.text()).toContain('Content')
  })

  it('renders title', () => {
    const wrapper = mount(Modal, {
      props: { modelValue: true, title: 'My Modal' },
    })
    expect(wrapper.find('.ds-modal-title').text()).toBe('My Modal')
  })

  it('renders footer with cancel and confirm buttons', () => {
    const wrapper = mount(Modal, {
      props: { modelValue: true },
    })
    expect(wrapper.find('.ds-modal-footer').exists()).toBe(true)
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('renders default cancel and confirm labels', () => {
    const wrapper = mount(Modal, {
      props: { modelValue: true },
    })
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Confirm')
  })

  it('renders custom labels', () => {
    const wrapper = mount(Modal, {
      props: {
        modelValue: true,
        confirmLabel: 'Save Changes',
        cancelLabel: 'Discard',
      },
    })
    expect(wrapper.text()).toContain('Save Changes')
    expect(wrapper.text()).toContain('Discard')
  })

  it('emits confirm when confirm button clicked', async () => {
    const wrapper = mount(Modal, { props: { modelValue: true } })
    const confirmBtn = wrapper.findAll('button').find(b => b.text().includes('Confirm'))
    await confirmBtn?.trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits cancel and update:modelValue when cancel clicked', async () => {
    const wrapper = mount(Modal, { props: { modelValue: true } })
    const cancelBtn = wrapper.findAll('button').find(b => b.text().includes('Cancel'))
    await cancelBtn?.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('hides footer when hideFooter is true', () => {
    const wrapper = mount(Modal, {
      props: { modelValue: true, hideFooter: true },
    })
    expect(wrapper.find('.ds-modal-footer').exists()).toBe(false)
  })

  it('disables buttons when loading', () => {
    const wrapper = mount(Modal, {
      props: { modelValue: true, loading: true },
    })
    const buttons = wrapper.findAll('button')
    for (const btn of buttons) {
      if (btn.attributes('disabled') === undefined) continue
      expect(btn.attributes('disabled')).toBeDefined()
    }
  })

  it('applies loading class to confirm button', () => {
    const wrapper = mount(Modal, {
      props: { modelValue: true, loading: true },
    })
    const confirmBtn = wrapper.findAll('button').find(b => b.text().includes('Confirm'))
    expect(confirmBtn?.classes()).toContain('ds-btn--loading')
  })

  it('applies size classes', () => {
    for (const s of ['sm', 'md', 'lg'] as const) {
      const wrapper = mount(Modal, {
        props: { modelValue: true, size: s },
      })
      expect(wrapper.find('.ds-modal-dialog').classes()).toContain(`ds-modal-${s}`)
    }
  })

  it('renders default slot content', () => {
    const wrapper = mount(Modal, {
      props: { modelValue: true },
      slots: { default: '<p>Modal body</p>' },
    })
    expect(wrapper.find('.ds-modal-body').html()).toContain('Modal body')
  })

  it('emits update:modelValue when overlay is clicked', async () => {
    const wrapper = mount(Modal, {
      props: { modelValue: true },
    })
    await wrapper.find('.ds-modal-overlay').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })
})
