<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  frequency: string
  interval: number
  dayOfMonth?: number | null
  dayOfWeek?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  dayOfMonth: null,
  dayOfWeek: null,
})

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const frequencyLabel = computed(() => {
  const map: Record<string, string> = {
    daily: t('missions.recurrence.daily'),
    weekly: t('missions.recurrence.weekly'),
    monthly: t('missions.recurrence.monthly'),
    annual: t('missions.recurrence.annual'),
  }
  return map[props.frequency] || props.frequency
})

const dayLabel = computed(() => {
  if (props.frequency === 'weekly' && props.dayOfWeek != null) {
    return DAY_NAMES[props.dayOfWeek]
  }
  if (props.frequency === 'monthly' && props.dayOfMonth != null) {
    return String(props.dayOfMonth)
  }
  return null
})

function calculateNextRuns(): Date[] {
  if (!props.frequency) return []

  const runs: Date[] = []
  const now = new Date()

  for (let i = 0; i < 5; i++) {
    const next = new Date(now)

    switch (props.frequency) {
      case 'daily':
        next.setDate(next.getDate() + props.interval * (i + 1))
        break
      case 'weekly':
        if (props.dayOfWeek != null) {
          const currentDay = next.getDay()
          let daysUntil = props.dayOfWeek - currentDay
          if (daysUntil <= 0) daysUntil += 7
          next.setDate(next.getDate() + daysUntil + (props.interval - 1) * 7 + i * props.interval * 7)
        } else {
          next.setDate(next.getDate() + props.interval * 7 * (i + 1))
        }
        break
      case 'monthly':
        if (props.dayOfMonth != null) {
          next.setDate(props.dayOfMonth)
          if (next <= now) next.setMonth(next.getMonth() + props.interval)
          if (i > 0) next.setMonth(next.getMonth() + props.interval * i)
        } else {
          next.setMonth(next.getMonth() + props.interval * (i + 1))
        }
        break
      case 'annual':
        next.setFullYear(next.getFullYear() + props.interval * (i + 1))
        break
    }

    runs.push(new Date(next))
  }

  return runs
}

const upcomingRuns = computed(() => calculateNextRuns())

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="ds-recurrence-preview">
    <div class="ds-recurrence-preview__header">
      <i class="bi bi-calendar-event ds-recurrence-preview__icon" />
      <span class="ds-recurrence-preview__title">{{ t('missions.recurrence.previewTitle') }}</span>
    </div>

    <div v-if="!frequency" class="ds-recurrence-preview__empty">
      {{ t('missions.recurrence.noRuns') }}
    </div>

    <div v-else class="ds-recurrence-preview__list">
      <div class="ds-recurrence-preview__summary">
        <span class="ds-recurrence-preview__freq">{{ frequencyLabel }}</span>
        <span v-if="interval > 1" class="ds-recurrence-preview__interval">
          · {{ t('missions.recurrence.everyInterval', { interval }) }}
        </span>
        <span v-if="dayLabel" class="ds-recurrence-preview__day">
          · {{ t('missions.recurrence.onDayOfWeek', { day: dayLabel }) }}
        </span>
      </div>

      <div
        v-for="(date, index) in upcomingRuns"
        :key="index"
        class="ds-recurrence-preview__item"
      >
        <div class="ds-recurrence-preview__marker">
          <div class="ds-recurrence-preview__dot" :class="{ 'ds-recurrence-preview__dot--first': index === 0 }" />
          <div v-if="index < upcomingRuns.length - 1" class="ds-recurrence-preview__line" />
        </div>
        <div class="ds-recurrence-preview__content">
          <span class="ds-recurrence-preview__date">{{ formatDate(date) }}</span>
          <span v-if="index === 0" class="ds-recurrence-preview__label">{{ t('missions.recurrence.next') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ds-recurrence-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ds-recurrence-preview__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ds-recurrence-preview__icon {
  color: var(--ds-accent, #6366f1);
  font-size: 1rem;
}

.ds-recurrence-preview__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
}

.ds-recurrence-preview__empty {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  font-style: italic;
  padding: 0.5rem 0;
}

.ds-recurrence-preview__summary {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  margin-bottom: 0.25rem;
}

.ds-recurrence-preview__freq {
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
}

.ds-recurrence-preview__list {
  display: flex;
  flex-direction: column;
}

.ds-recurrence-preview__item {
  display: flex;
  gap: 0.75rem;
}

.ds-recurrence-preview__marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 1rem;
}

.ds-recurrence-preview__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ds-border, #334155);
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.ds-recurrence-preview__dot--first {
  background: var(--ds-accent, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.ds-recurrence-preview__line {
  width: 2px;
  flex: 1;
  background: var(--ds-border, #334155);
  min-height: 1.5rem;
}

.ds-recurrence-preview__content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
}

.ds-recurrence-preview__date {
  font-size: 0.8125rem;
  color: var(--ds-text, #f1f5f9);
}

.ds-recurrence-preview__label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--ds-accent, #6366f1);
  background: rgba(99, 102, 241, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}
</style>
