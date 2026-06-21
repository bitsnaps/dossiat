import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import MissionChecklist from '@/components/mission/MissionChecklist.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      missions: {
        checklist: { empty: 'No checklist items defined.', completed: '{count} of {total} items completed' },
        agreement: { checkAll: 'Check all' },
      },
    },
  },
})

function createWrapper(props: Record<string, any> = {}) {
  return mount(MissionChecklist, {
    props: {
      agreedChecklist: ['Task 1', 'Task 2', 'Task 3'],
      completedChecklist: [],
      status: 'pending_agreement',
      missionId: 1,
      ...props,
    },
    global: { plugins: [i18n] },
  })
}

describe('MissionChecklist', () => {
  it('renders empty state when no checklist items', () => {
    const wrapper = mount(MissionChecklist, {
      props: {
        agreedChecklist: [],
        completedChecklist: [],
        status: 'pending_agreement',
        missionId: 1,
      },
      global: { plugins: [i18n] },
    })
    expect(wrapper.find('.ds-mission-checklist__empty').exists()).toBe(true)
  })

  it('renders checklist items', () => {
    const wrapper = createWrapper()
    const items = wrapper.findAll('.ds-mission-checklist__item')
    expect(items.length).toBe(3)
  })

  it('shows item text', () => {
    const wrapper = createWrapper()
    expect(wrapper.html()).toContain('Task 1')
    expect(wrapper.html()).toContain('Task 2')
    expect(wrapper.html()).toContain('Task 3')
  })

  it('emits update:completedChecklist when clicking an item', async () => {
    const wrapper = createWrapper()
    const item = wrapper.find('.ds-mission-checklist__item')
    await item.trigger('click')
    const emitted = wrapper.emitted('update:completedChecklist')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toContain('Task 1')
  })

  it('check-all toggle selects all items when all unchecked', async () => {
    const wrapper = createWrapper()
    const checkbox = wrapper.find('.ds-mission-checklist__check-all input[type="checkbox"]')
    const input = checkbox.element as HTMLInputElement
    input.checked = true
    input.dispatchEvent(new Event('change'))
    await wrapper.vm.$nextTick()
    const emitted = wrapper.emitted('update:completedChecklist')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual(['Task 1', 'Task 2', 'Task 3'])
  })

  it('check-all toggle deselects all items when all checked', async () => {
    const wrapper = createWrapper({
      completedChecklist: ['Task 1', 'Task 2', 'Task 3'],
    })
    const checkbox = wrapper.find('.ds-mission-checklist__check-all input[type="checkbox"]')
    const input = checkbox.element as HTMLInputElement
    input.checked = false
    input.dispatchEvent(new Event('change'))
    await wrapper.vm.$nextTick()
    const emitted = wrapper.emitted('update:completedChecklist')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual([])
  })

  it('shows progress bar in in_progress mode', () => {
    const wrapper = createWrapper({
      status: 'in_progress',
      completedChecklist: ['Task 1'],
    })
    expect(wrapper.find('.ds-mission-checklist__progress').exists()).toBe(true)
  })

  it('does not show check-all in review mode (completed)', () => {
    const wrapper = createWrapper({
      status: 'completed',
      completedChecklist: ['Task 1', 'Task 2', 'Task 3'],
    })
    expect(wrapper.find('.ds-mission-checklist__check-all').exists()).toBe(false)
  })

  it('renders readonly checkboxes in review mode', () => {
    const wrapper = createWrapper({
      status: 'completed',
      completedChecklist: ['Task 1'],
    })
    const checkboxes = wrapper.findAll('.ds-mission-checklist__checkbox')
    checkboxes.forEach((cb) => {
      expect((cb.element as HTMLInputElement).disabled).toBe(true)
    })
  })
})
