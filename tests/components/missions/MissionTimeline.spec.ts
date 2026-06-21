import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import MissionTimeline from '@/components/mission/MissionTimeline.vue'

interface TimelineProps {
  status: string
  createdAt: string
  startedAt?: string | null
  completedAt?: string | null
}

function createWrapper(props: TimelineProps) {
  const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { missions: { timeline: { created: 'Created', agreed: 'Agreed', inProgress: 'In Progress', completed: 'Completed' } } } } })

  return mount(MissionTimeline, {
    props,
    global: { plugins: [i18n] },
  })
}

describe('MissionTimeline', () => {
  it('renders all four milestone steps', () => {
    const wrapper = createWrapper({ status: 'draft', createdAt: '2026-01-01T10:00:00Z' })
    const steps = wrapper.findAll('.ds-mission-timeline__step')
    expect(steps.length).toBe(4)
  })

  it('marks created step as reached for draft status', () => {
    const wrapper = createWrapper({ status: 'draft', createdAt: '2026-01-01T10:00:00Z' })
    const firstStep = wrapper.find('.ds-mission-timeline__step')
    expect(firstStep.classes()).toContain('ds-mission-timeline__step--reached')
  })

  it('marks created and agreed steps as reached for agreed status', () => {
    const wrapper = createWrapper({ status: 'agreed', createdAt: '2026-01-01T10:00:00Z' })
    const steps = wrapper.findAll('.ds-mission-timeline__step')
    expect(steps[0].classes()).toContain('ds-mission-timeline__step--reached')
    expect(steps[1].classes()).toContain('ds-mission-timeline__step--reached')
    expect(steps[2].classes()).not.toContain('ds-mission-timeline__step--reached')
  })

  it('marks all steps as reached for completed status', () => {
    const wrapper = createWrapper({
      status: 'completed',
      createdAt: '2026-01-01T10:00:00Z',
      startedAt: '2026-01-02T10:00:00Z',
      completedAt: '2026-01-03T10:00:00Z',
    })
    const steps = wrapper.findAll('.ds-mission-timeline__step')
    steps.forEach((step) => {
      expect(step.classes()).toContain('ds-mission-timeline__step--reached')
    })
  })

  it('highlights current step for in_progress status', () => {
    const wrapper = createWrapper({
      status: 'in_progress',
      createdAt: '2026-01-01T10:00:00Z',
      startedAt: '2026-01-02T10:00:00Z',
    })
    const steps = wrapper.findAll('.ds-mission-timeline__step')
    expect(steps[2].classes()).toContain('ds-mission-timeline__step--current')
  })

  it('shows date when reached', () => {
    const wrapper = createWrapper({ status: 'draft', createdAt: '2026-01-01T10:00:00Z' })
    const dates = wrapper.findAll('.ds-mission-timeline__date')
    expect(dates.length).toBeGreaterThanOrEqual(1)
  })

  it('does not show dates for unreached steps', () => {
    const wrapper = createWrapper({ status: 'draft', createdAt: '2026-01-01T10:00:00Z' })
    const dates = wrapper.findAll('.ds-mission-timeline__date')
    expect(dates.length).toBe(1) // only the created date
  })
})
