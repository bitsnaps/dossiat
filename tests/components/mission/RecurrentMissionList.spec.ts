import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import RecurrentMissionList from '@/components/mission/RecurrentMissionList.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      missions: {
        recurrence: {
          listTitle: 'Recurrent Missions',
          empty: 'No active recurrent missions',
          frequency: 'Frequency',
          nextRun: 'Next Run',
          lastRun: 'Last Run',
          daily: 'Daily',
          weekly: 'Weekly',
          monthly: 'Monthly',
          annual: 'Annual',
          edit: 'Edit',
          disable: 'Disable',
          mission: 'Mission',
          active: 'Active',
          inactive: 'Inactive',
        },
      },
    },
  },
})

const mockConfigs = [
  {
    id: 1,
    missionId: 10,
    frequency: 'weekly' as const,
    interval: 1,
    dayOfWeek: 1,
    dayOfMonth: null,
    nextRunAt: '2026-06-22T10:00:00Z',
    lastRunAt: '2026-06-15T10:00:00Z',
    isActive: true,
    mission: { id: 10, title: 'Weekly Audit', agentId: 1, clientId: 2 },
  },
  {
    id: 2,
    missionId: 11,
    frequency: 'monthly' as const,
    interval: 2,
    dayOfWeek: null,
    dayOfMonth: 1,
    nextRunAt: '2026-08-01T10:00:00Z',
    lastRunAt: null,
    isActive: true,
    mission: { id: 11, title: 'Bi-monthly Review', agentId: 1, clientId: 3 },
  },
]

function createWrapper(props: Record<string, any> = {}) {
  return mount(RecurrentMissionList, {
    props: {
      configs: mockConfigs,
      loading: false,
      ...props,
    },
    global: { plugins: [i18n] },
  })
}

describe('RecurrentMissionList', () => {
  it('renders the list title', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-recurrence-list').exists()).toBe(true)
    expect(wrapper.html()).toContain('Recurrent Missions')
  })

  it('renders config rows', () => {
    const wrapper = createWrapper()
    const rows = wrapper.findAll('.ds-recurrence-list__row')
    expect(rows.length).toBe(2)
  })

  it('shows mission titles', () => {
    const wrapper = createWrapper()
    expect(wrapper.html()).toContain('Weekly Audit')
    expect(wrapper.html()).toContain('Bi-monthly Review')
  })

  it('shows frequency labels', () => {
    const wrapper = createWrapper()
    expect(wrapper.html()).toContain('Weekly')
    expect(wrapper.html()).toContain('Monthly')
  })

  it('shows next run dates', () => {
    const wrapper = createWrapper()
    const nextRuns = wrapper.findAll('.ds-recurrence-list__next-run')
    expect(nextRuns.length).toBe(2)
    nextRuns.forEach((el) => {
      expect(el.text()).toMatch(/\d/)
    })
  })

  it('shows empty state when no configs', () => {
    const wrapper = createWrapper({ configs: [] })
    expect(wrapper.find('.ds-recurrence-list__empty').exists()).toBe(true)
    expect(wrapper.html()).toContain('No active recurrent missions')
  })

  it('shows loading spinner', () => {
    const wrapper = createWrapper({ loading: true })
    expect(wrapper.find('.ds-recurrence-list__loading').exists()).toBe(true)
  })

  it('shows edit button for each config', () => {
    const wrapper = createWrapper()
    const editBtns = wrapper.findAll('.ds-recurrence-list__edit')
    expect(editBtns.length).toBe(2)
  })

  it('emits edit event with mission id', async () => {
    const wrapper = createWrapper()
    const editBtn = wrapper.find('.ds-recurrence-list__edit')
    await editBtn.trigger('click')
    const emitted = wrapper.emitted('edit')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toBe(10)
  })

  it('shows disable button for each config', () => {
    const wrapper = createWrapper()
    const disableBtns = wrapper.findAll('.ds-recurrence-list__disable')
    expect(disableBtns.length).toBe(2)
  })

  it('emits disable event with mission id', async () => {
    const wrapper = createWrapper()
    const disableBtn = wrapper.find('.ds-recurrence-list__disable')
    await disableBtn.trigger('click')
    const emitted = wrapper.emitted('disable')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toBe(10)
  })

  it('shows active badge for active configs', () => {
    const wrapper = createWrapper()
    const badges = wrapper.findAll('.ds-recurrence-list__badge')
    expect(badges.length).toBe(2)
    badges.forEach((badge) => {
      expect(badge.text()).toContain('Active')
    })
  })
})
