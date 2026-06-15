import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BModal from '@/components/base/BModal.vue'

describe('BModal', () => {
  it('does not render when modelValue is false', () => {
    const wrapper = mount(BModal, {
      props: { modelValue: false, title: 'Test' },
      slots: { default: 'Body' },
    })
    expect(wrapper.find('.ds-modal-overlay').exists()).toBe(false)
  })

  it('renders when modelValue is true', () => {
    const wrapper = mount(BModal, {
      props: { modelValue: true, title: 'Test' },
      slots: { default: 'Body' },
    })
    expect(wrapper.find('.ds-modal-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test')
    expect(wrapper.text()).toContain('Body')
  })

  it('renders title', () => {
    const wrapper = mount(BModal, {
      props: { modelValue: true, title: 'My Title' },
      slots: { default: 'Content' },
    })
    expect(wrapper.find('.ds-modal-title').text()).toBe('My Title')
  })

  it('emits close when close button clicked', async () => {
    const wrapper = mount(BModal, {
      props: { modelValue: true, title: 'X' },
      slots: { default: 'Content' },
    })
    await wrapper.find('.ds-modal-close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('renders size classes', () => {
    for (const s of ['sm', 'md', 'lg'] as const) {
      const wrapper = mount(BModal, {
        props: { modelValue: true, title: 'X', size: s },
        slots: { default: 'C' },
      })
      expect(wrapper.find('.ds-modal-dialog').classes()).toContain(`ds-modal-${s}`)
    }
  })

  it('renders footer slot', () => {
    const wrapper = mount(BModal, {
      props: { modelValue: true, title: 'X' },
      slots: { default: 'Body', footer: '<button>Save</button>' },
    })
    expect(wrapper.find('.ds-modal-footer').exists()).toBe(true)
    expect(wrapper.find('.ds-modal-footer').html()).toContain('Save')
  })
})
