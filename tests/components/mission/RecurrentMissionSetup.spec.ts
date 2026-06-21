import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import RecurrentMissionSetup from '@/components/mission/RecurrentMissionSetup.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      missions: {
        recurrence: {
          title: 'Recurrence Settings',
          subtitle: 'Configure how often this mission repeats',
          frequency: 'Frequency',
          interval: 'Repeat every',
          dayOfWeek: 'Day of week',
          dayOfMonth: 'Day of month',
          daily: 'Daily',
          weekly: 'Weekly',
          monthly: 'Monthly',
          annual: 'Annual',
          save: 'Save',
          cancel: 'Cancel',
          disable: 'Disable Recurrence',
          enabled: 'Recurrence is active',
          disabled: 'Recurrence is not configured',
          unitDays: 'day(s)',
          unitWeeks: 'week(s)',
          unitMonths: 'month(s)',
          unitYears: 'year(s)',
          next: 'Next',
          previewTitle: 'Upcoming Runs',
          noRuns: 'No upcoming runs',
          everyInterval: 'Every {interval}',
          onDayOfWeek: 'on {day}',
          onDayOfMonth: 'on day {day}',
        },
      },
    },
  },
})

function createWrapper(props: Record<string, any> = {}) {
  return mount(RecurrentMissionSetup, {
    props: {
      missionId: 1,
      ...props,
    },
    global: { plugins: [i18n] },
  })
}

describe('RecurrentMissionSetup', () => {
  it('renders the setup form', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-recurrence-setup').exists()).toBe(true)
  })

  it('shows title', () => {
    const wrapper = createWrapper()
    expect(wrapper.html()).toContain('Recurrence Settings')
  })

  it('shows frequency select with all options', () => {
    const wrapper = createWrapper()
    const select = wrapper.find('.ds-recurrence-setup__frequency')
    expect(select.exists()).toBe(true)
    const options = select.findAll('option')
    expect(options.length).toBe(4)
  })

  it('shows interval input', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-recurrence-setup__interval').exists()).toBe(true)
  })

  it('shows save button', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-recurrence-setup__save').exists()).toBe(true)
  })

  it('loads existing config values', () => {
    const wrapper = createWrapper({
      existingConfig: {
        frequency: 'weekly',
        interval: 2,
        dayOfWeek: 3,
        dayOfMonth: null,
      },
    })
    const select = wrapper.find('.ds-recurrence-setup__frequency') as any
    expect(select.element.value).toBe('weekly')
  })

  it('emits save event with form data', async () => {
    const wrapper = createWrapper()
    
    const select = wrapper.find('.ds-recurrence-setup__frequency')
    await select.setValue('monthly')

    const saveBtn = wrapper.find('.ds-recurrence-setup__save')
    await saveBtn.trigger('click')

    const emitted = wrapper.emitted('save')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toMatchObject({
      frequency: 'monthly',
      interval: expect.any(Number),
    })
  })

  it('shows disable button when existing config exists', () => {
    const wrapper = createWrapper({
      existingConfig: {
        frequency: 'weekly',
        interval: 1,
        dayOfWeek: 1,
        dayOfMonth: null,
      },
    })
    expect(wrapper.find('.ds-recurrence-setup__disable').exists()).toBe(true)
  })

  it('emits disable event', async () => {
    const wrapper = createWrapper({
      existingConfig: {
        frequency: 'weekly',
        interval: 1,
        dayOfWeek: 1,
        dayOfMonth: null,
      },
    })
    const disableBtn = wrapper.find('.ds-recurrence-setup__disable')
    await disableBtn.trigger('click')
    expect(wrapper.emitted('disable')).toBeTruthy()
  })

  it('shows day of week select when frequency is weekly', async () => {
    const wrapper = createWrapper()
    const select = wrapper.find('.ds-recurrence-setup__frequency')
    await select.setValue('weekly')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ds-recurrence-setup__day-of-week').exists()).toBe(true)
  })

  it('shows day of month select when frequency is monthly', async () => {
    const wrapper = createWrapper()
    const select = wrapper.find('.ds-recurrence-setup__frequency')
    await select.setValue('monthly')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ds-recurrence-setup__day-of-month').exists()).toBe(true)
  })

  it('hides day of week when frequency is daily', async () => {
    const wrapper = createWrapper()
    const select = wrapper.find('.ds-recurrence-setup__frequency')
    await select.setValue('daily')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ds-recurrence-setup__day-of-week').exists()).toBe(false)
  })
})
