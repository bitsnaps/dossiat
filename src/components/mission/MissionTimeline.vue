<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  status: string
  createdAt: string
  startedAt?: string | null
  completedAt?: string | null
}

const props = defineProps<Props>()

interface Step {
  key: string
  label: string
  date: string | null
  reached: boolean
  current: boolean
}

const steps = computed<Step[]>(() => {
  const statusOrder = ['draft', 'pending_agreement', 'agreed', 'in_progress', 'completed', 'disputed', 'cancelled']
  const currentIdx = statusOrder.indexOf(props.status)

  const milestoneSteps: { key: string; label: string; date: string | null; minIdx: number }[] = [
    { key: 'created', label: t('missions.timeline.created'), date: props.createdAt, minIdx: 0 },
    { key: 'agreed', label: t('missions.timeline.agreed'), date: null, minIdx: 2 },
    { key: 'in_progress', label: t('missions.timeline.inProgress'), date: props.startedAt ?? null, minIdx: 3 },
    { key: 'completed', label: t('missions.timeline.completed'), date: props.completedAt ?? null, minIdx: 4 },
  ]

  return milestoneSteps.map((step) => ({
    key: step.key,
    label: step.label,
    date: step.date,
    reached: currentIdx >= step.minIdx,
    current: currentIdx === step.minIdx,
  }))
})

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="ds-mission-timeline">
    <div
      v-for="(step, idx) in steps"
      :key="step.key"
      class="ds-mission-timeline__step"
      :class="{
        'ds-mission-timeline__step--reached': step.reached,
        'ds-mission-timeline__step--current': step.current,
        'ds-mission-timeline__step--pending': !step.reached,
      }"
    >
      <div class="ds-mission-timeline__indicator">
        <div class="ds-mission-timeline__dot">
          <i v-if="step.reached && !step.current" class="bi bi-check-lg" />
          <i v-else-if="step.current" class="bi bi-circle-fill" style="font-size: 0.5rem;" />
        </div>
        <div
          v-if="idx < steps.length - 1"
          class="ds-mission-timeline__line"
          :class="{ 'ds-mission-timeline__line--reached': steps[idx + 1]?.reached }"
        />
      </div>
      <div class="ds-mission-timeline__content">
        <span class="ds-mission-timeline__label">{{ step.label }}</span>
        <span v-if="step.date" class="ds-mission-timeline__date font-mono">
          {{ formatDate(step.date) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ds-mission-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ds-mission-timeline__step {
  display: flex;
  gap: 1rem;
  min-height: 3rem;
}

.ds-mission-timeline__indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 1.5rem;
  flex-shrink: 0;
}

.ds-mission-timeline__dot {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  flex-shrink: 0;
  border: 2px solid var(--ds-border, #334155);
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-text-muted, #64748b);
  transition: all 0.2s ease;
}

.ds-mission-timeline__step--reached .ds-mission-timeline__dot {
  border-color: var(--ds-accent, #6366f1);
  background: var(--ds-accent, #6366f1);
  color: #fff;
}

.ds-mission-timeline__step--current .ds-mission-timeline__dot {
  border-color: var(--ds-accent, #6366f1);
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-accent, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.ds-mission-timeline__line {
  width: 2px;
  flex: 1;
  min-height: 1rem;
  background: var(--ds-border, #334155);
  transition: background 0.2s ease;
}

.ds-mission-timeline__line--reached {
  background: var(--ds-accent, #6366f1);
}

.ds-mission-timeline__content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 1rem;
}

.ds-mission-timeline__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-timeline__step--reached .ds-mission-timeline__label {
  color: var(--ds-text, #f1f5f9);
}

.ds-mission-timeline__step--current .ds-mission-timeline__label {
  color: var(--ds-accent, #6366f1);
  font-weight: 600;
}

.ds-mission-timeline__date {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
}
</style>
