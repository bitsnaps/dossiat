import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  it('does not render when modelValue is false', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: false, title: 'Delete item?' },
    })
    expect(wrapper.find('.ds-modal-overlay').exists()).toBe(false)
  })

  it('renders when modelValue is true', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Delete item?' },
    })
    expect(wrapper.find('.ds-modal-overlay').exists()).toBe(true)
    expect(wrapper.text()).toContain('Delete item?')
  })

  it('renders message when provided', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        modelValue: true,
        title: 'Confirm',
        message: 'Are you sure?',
      },
    })
    expect(wrapper.text()).toContain('Are you sure?')
  })

  it('does not render message when not provided', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Confirm' },
    })
    expect(wrapper.find('p').exists()).toBe(false)
  })

  it('renders default confirm and cancel labels', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Confirm' },
    })
    expect(wrapper.text()).toContain('Confirm')
    expect(wrapper.text()).toContain('Cancel')
  })

  it('renders custom labels', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        modelValue: true,
        title: 'Confirm',
        confirmLabel: 'Yes, delete',
        cancelLabel: 'No, keep',
      },
    })
    expect(wrapper.text()).toContain('Yes, delete')
    expect(wrapper.text()).toContain('No, keep')
  })

  it('emits confirm and update:modelValue when confirm clicked', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Confirm' },
    })
    const confirmBtn = wrapper.findAll('button').find(b => b.text().includes('Confirm'))
    await confirmBtn?.trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('emits cancel and update:modelValue when cancel clicked', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Confirm' },
    })
    const cancelBtn = wrapper.findAll('button').find(b => b.text().includes('Cancel'))
    await cancelBtn?.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([false])
  })

  it('applies danger variant to confirm button', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Delete', variant: 'danger' },
    })
    const confirmBtn = wrapper.findAll('button').find(b => b.text().includes('Delete') || b.text().includes('Confirm'))
    expect(confirmBtn?.classes()).toContain('ds-btn--danger')
  })

  it('applies accent variant to confirm button by default', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Confirm' },
    })
    const confirmBtn = wrapper.findAll('button').find(b => b.text().includes('Confirm'))
    expect(confirmBtn?.classes()).toContain('ds-btn--accent')
  })
})
