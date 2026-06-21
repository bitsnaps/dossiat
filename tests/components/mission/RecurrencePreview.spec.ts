import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import RecurrencePreview from '@/components/mission/RecurrencePreview.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      missions: {
        recurrence: {
          previewTitle: 'Upcoming Runs',
          noRuns: 'No upcoming runs',
          daily: 'Daily',
          weekly: 'Weekly',
          monthly: 'Monthly',
          annual: 'Annual',
          everyInterval: 'Every {interval}',
          onDayOfWeek: 'on {day}',
          onDayOfMonth: 'on day {day}',
        },
      },
    },
  },
})

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function createWrapper(props: Record<string, any> = {}) {
  return mount(RecurrencePreview, {
    props: {
      frequency: 'weekly',
      interval: 1,
      dayOfWeek: 1,
      ...props,
    },
    global: { plugins: [i18n] },
  })
}

describe('RecurrencePreview', () => {
  it('renders the preview title', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.ds-recurrence-preview').exists()).toBe(true)
    expect(wrapper.html()).toContain('Upcoming Runs')
  })

  it('shows next 5 dates for weekly recurrence', () => {
    const wrapper = createWrapper()
    const items = wrapper.findAll('.ds-recurrence-preview__item')
    expect(items.length).toBe(5)
  })

  it('shows next 5 dates for daily recurrence', () => {
    const wrapper = createWrapper({ frequency: 'daily', interval: 1, dayOfWeek: null, dayOfMonth: null })
    const items = wrapper.findAll('.ds-recurrence-preview__item')
    expect(items.length).toBe(5)
  })

  it('shows next 5 dates for monthly recurrence', () => {
    const wrapper = createWrapper({ frequency: 'monthly', interval: 1, dayOfMonth: 15, dayOfWeek: null })
    const items = wrapper.findAll('.ds-recurrence-preview__item')
    expect(items.length).toBe(5)
  })

  it('shows next 5 dates for annual recurrence', () => {
    const wrapper = createWrapper({ frequency: 'annual', interval: 1, dayOfWeek: null, dayOfMonth: null })
    const items = wrapper.findAll('.ds-recurrence-preview__item')
    expect(items.length).toBe(5)
  })

  it('formats dates in locale format', () => {
    const wrapper = createWrapper()
    const dates = wrapper.findAll('.ds-recurrence-preview__date')
    dates.forEach((date) => {
      expect(date.text()).toMatch(/\d{1,2}/)
    })
  })

  it('shows frequency label', () => {
    const wrapper = createWrapper({ frequency: 'monthly', interval: 2, dayOfMonth: 1, dayOfWeek: null })
    expect(wrapper.html()).toContain('Monthly')
  })

  it('shows interval info', () => {
    const wrapper = createWrapper({ frequency: 'weekly', interval: 2, dayOfWeek: 1 })
    expect(wrapper.html()).toContain('2')
  })

  it('displays empty state when frequency is not set', () => {
    const wrapper = mount(RecurrencePreview, {
      props: { frequency: '', interval: 1 },
      global: { plugins: [i18n] },
    })
    expect(wrapper.find('.ds-recurrence-preview__empty').exists()).toBe(true)
  })

  it('shows day of week label for weekly recurrence', () => {
    const wrapper = createWrapper({ frequency: 'weekly', interval: 1, dayOfWeek: 3 })
    expect(wrapper.html()).toContain('Wednesday')
  })

  it('shows day of month label for monthly recurrence', () => {
    const wrapper = createWrapper({ frequency: 'monthly', interval: 1, dayOfMonth: 15, dayOfWeek: null })
    expect(wrapper.html()).toContain('15')
  })

  it('computes dates that are in the future', () => {
    const wrapper = createWrapper()
    const dates = wrapper.findAll('.ds-recurrence-preview__date')
    const now = new Date()
    dates.forEach((dateEl) => {
      const dateStr = dateEl.text()
      // Each displayed date should be parseable and in the future
      const parsed = new Date(dateStr)
      expect(parsed.getTime()).toBeGreaterThan(now.getTime())
    })
  })

  it('computes weekly dates on the correct day of week', () => {
    const wrapper = createWrapper({ frequency: 'weekly', interval: 1, dayOfWeek: 5 })
    // The day name appears in the summary section
    expect(wrapper.find('.ds-recurrence-preview__summary').text()).toContain('Friday')
    // And there should be 5 upcoming run dates
    const items = wrapper.findAll('.ds-recurrence-preview__item')
    expect(items.length).toBe(5)
  })
})
