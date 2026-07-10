import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BTagGroup from '@/components/base/BTagGroup.vue'

const defaultOptions = [
  { value: 'Legal', label: 'Legal' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Admin', label: 'Admin' },
]

function mountTag(props: Record<string, unknown> = {}) {
  return mount(BTagGroup, {
    props: { options: defaultOptions, ...props },
  })
}

describe('BTagGroup', () => {
  it('renders all tags', () => {
    const wrapper = mountTag()
    const tags = wrapper.findAll('.ds-tag')
    expect(tags).toHaveLength(3)
  })

  it('renders label when provided', () => {
    const wrapper = mountTag({ label: 'Specialties' })
    expect(wrapper.find('.ds-input-label').text()).toBe('Specialties')
  })

  it('does not render label when not provided', () => {
    const wrapper = mountTag()
    expect(wrapper.find('.ds-input-label').exists()).toBe(false)
  })

  it('toggles a tag on click', async () => {
    const wrapper = mountTag({ modelValue: [] })
    await wrapper.findAll('.ds-tag')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['Legal']])
  })

  it('deselects a tag that is already selected', async () => {
    const wrapper = mountTag({ modelValue: ['Legal', 'Finance'] })
    await wrapper.findAll('.ds-tag')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['Finance']])
  })

  it('marks selected tags as active', () => {
    const wrapper = mountTag({ modelValue: ['Legal'] })
    const tags = wrapper.findAll('.ds-tag')
    expect(tags[0].classes()).toContain('ds-tag--active')
    expect(tags[1].classes()).not.toContain('ds-tag--active')
  })

  it('renders error text when error prop is provided', () => {
    const wrapper = mountTag({ error: 'Select at least one' })
    expect(wrapper.find('.ds-input-error-text').text()).toBe('Select at least one')
    expect(wrapper.find('.ds-input-group').classes()).toContain('ds-input-error')
  })

  it('renders hint text when hint prop is provided', () => {
    const wrapper = mountTag({ hint: 'Choose all that apply' })
    expect(wrapper.find('.ds-input-hint').text()).toBe('Choose all that apply')
  })

  it('disables all tags when disabled prop is true', () => {
    const wrapper = mountTag({ disabled: true })
    const tags = wrapper.findAll('.ds-tag')
    tags.forEach(tag => {
      expect(tag.attributes('disabled')).toBeDefined()
      expect(tag.classes()).toContain('ds-tag--disabled')
    })
  })

  it('does not emit update when disabled and clicked', async () => {
    const wrapper = mountTag({ disabled: true, modelValue: [] })
    await wrapper.find('.ds-tag').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('renders icon when option has icon', () => {
    const options = [{ value: 'a', label: 'Alpha', icon: 'bi-star' }]
    const wrapper = mountTag({ options })
    expect(wrapper.find('.ds-tag__icon').classes()).toContain('bi-star')
  })

  it('shows remove button on active tags when removable', async () => {
    const wrapper = mountTag({ modelValue: ['Legal'], removable: true })
    const removeBtn = wrapper.find('.ds-tag__remove')
    expect(removeBtn.exists()).toBe(true)
  })

  it('emits remove event when remove button is clicked', async () => {
    const wrapper = mountTag({ modelValue: ['Legal'], removable: true })
    await wrapper.find('.ds-tag__remove').trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
    expect(wrapper.emitted('remove')![0]).toEqual(['Legal'])
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([[]])
  })

  it('does not render custom add input when allowCustom is false', () => {
    const wrapper = mountTag()
    expect(wrapper.find('.ds-tag-group__add').exists()).toBe(false)
  })

  it('renders custom add input when allowCustom is true', () => {
    const wrapper = mountTag({ allowCustom: true })
    expect(wrapper.find('.ds-tag-group__add').exists()).toBe(true)
    expect(wrapper.find('.ds-tag-group__input').exists()).toBe(true)
    expect(wrapper.find('.ds-tag-group__add-btn').exists()).toBe(true)
  })

  it('uses customPlaceholder and customAddLabel props', () => {
    const wrapper = mountTag({
      allowCustom: true,
      customPlaceholder: 'Type a specialty…',
      customAddLabel: 'Add',
    })
    expect(wrapper.find('.ds-tag-group__input').attributes('placeholder')).toBe('Type a specialty…')
    expect(wrapper.find('.ds-tag-group__add-btn').text()).toBe('Add')
  })

  it('adds a custom value via the Add button', async () => {
    const wrapper = mountTag({ allowCustom: true, modelValue: [] })
    await wrapper.find('.ds-tag-group__input').setValue('Photography')
    await wrapper.find('.ds-tag-group__add-btn').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['Photography']])
    expect(wrapper.emitted('add')![0]).toEqual(['Photography'])
  })

  it('adds a custom value when Enter is pressed', async () => {
    const wrapper = mountTag({ allowCustom: true, modelValue: [] })
    await wrapper.find('.ds-tag-group__input').setValue('Photography')
    await wrapper.find('.ds-tag-group__input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['Photography']])
  })

  it('does not add empty custom value', async () => {
    const wrapper = mountTag({ allowCustom: true, modelValue: [] })
    await wrapper.find('.ds-tag-group__input').setValue('   ')
    await wrapper.find('.ds-tag-group__add-btn').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('does not add duplicate custom value (case-insensitive)', async () => {
    const wrapper = mountTag({ allowCustom: true, modelValue: ['Legal'] })
    await wrapper.find('.ds-tag-group__input').setValue('legal')
    await wrapper.find('.ds-tag-group__add-btn').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('clears the custom input after adding', async () => {
    const wrapper = mountTag({ allowCustom: true, modelValue: [] })
    const input = wrapper.find('.ds-tag-group__input')
    await input.setValue('Photography')
    await wrapper.find('.ds-tag-group__add-btn').trigger('click')
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('renders custom selected values as active tags', () => {
    const wrapper = mountTag({ modelValue: ['Legal', 'Photography'] })
    const tags = wrapper.findAll('.ds-tag')
    // 3 static options + 1 custom tag
    expect(tags).toHaveLength(4)
    const customTag = wrapper.find('.ds-tag--custom')
    expect(customTag.exists()).toBe(true)
    expect(customTag.classes()).toContain('ds-tag--active')
    expect(customTag.text()).toContain('Photography')
  })

  it('disables custom add input when disabled', () => {
    const wrapper = mountTag({ allowCustom: true, disabled: true })
    expect(wrapper.find('.ds-tag-group__input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.ds-tag-group__add-btn').attributes('disabled')).toBeDefined()
  })
})
