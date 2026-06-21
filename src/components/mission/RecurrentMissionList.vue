<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import BCard from '@/components/base/BCard.vue'

const { t } = useI18n()

interface RecurrenceMission {
  id: number
  title?: string
}

interface RecurrenceConfig {
  id: number
  missionId: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual'
  interval: number
  dayOfMonth: number | null
  dayOfWeek: number | null
  nextRunAt: string | null
  lastRunAt: string | null
  isActive: boolean
  mission?: RecurrenceMission
}

interface Props {
  configs: RecurrenceConfig[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  edit: [missionId: number]
  disable: [missionId: number]
}>()

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function frequencyLabel(frequency: string, interval: number): string {
  const map: Record<string, string> = {
    daily: t('missions.recurrence.daily'),
    weekly: t('missions.recurrence.weekly'),
    monthly: t('missions.recurrence.monthly'),
    annual: t('missions.recurrence.annual'),
  }
  const label = map[frequency] || frequency
  return interval > 1 ? `${interval}x ${label}` : label
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="ds-recurrence-list">
    <div class="ds-recurrence-list__header">
      <h3 class="ds-recurrence-list__title">{{ t('missions.recurrence.listTitle') }}</h3>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="ds-recurrence-list__loading">
      <div class="spinner-border spinner-border-sm" role="status" />
    </div>

    <!-- Empty State -->
    <div v-else-if="configs.length === 0" class="ds-recurrence-list__empty">
      <i class="bi bi-calendar-x ds-recurrence-list__empty-icon" />
      <p>{{ t('missions.recurrence.empty') }}</p>
    </div>

    <!-- Config List -->
    <div v-else class="ds-recurrence-list__rows">
      <div
        v-for="config in configs"
        :key="config.id"
        class="ds-recurrence-list__row"
      >
        <div class="ds-recurrence-list__info">
          <div class="ds-recurrence-list__mission-name">
            {{ config.mission?.title || `Mission #${config.missionId}` }}
          </div>
          <div class="ds-recurrence-list__details">
            <span class="ds-recurrence-list__freq">{{ frequencyLabel(config.frequency, config.interval) }}</span>
            <span class="ds-recurrence-list__next-run">
              <i class="bi bi-clock" />
              {{ t('missions.recurrence.nextRun') }}: {{ formatDate(config.nextRunAt) }}
            </span>
          </div>
        </div>

        <div class="ds-recurrence-list__actions">
          <span class="ds-recurrence-list__badge" :class="{ 'ds-recurrence-list__badge--active': config.isActive }">
            {{ config.isActive ? t('missions.recurrence.active') : t('missions.recurrence.inactive') }}
          </span>
          <button
            class="ds-recurrence-list__edit ds-recurrence-list__btn"
            :title="t('missions.recurrence.edit')"
            @click="emit('edit', config.missionId)"
          >
            <i class="bi bi-pencil" />
          </button>
          <button
            class="ds-recurrence-list__disable ds-recurrence-list__btn ds-recurrence-list__btn--danger"
            :title="t('missions.recurrence.disable')"
            @click="emit('disable', config.missionId)"
          >
            <i class="bi bi-x-circle" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ds-recurrence-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ds-recurrence-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ds-recurrence-list__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-recurrence-list__loading {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

.ds-recurrence-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  color: var(--ds-text-muted, #64748b);
  font-size: 0.8125rem;
}

.ds-recurrence-list__empty-icon {
  font-size: 1.5rem;
}

.ds-recurrence-list__empty p {
  margin: 0;
}

.ds-recurrence-list__rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ds-recurrence-list__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid var(--ds-border, #334155);
  border-radius: 0.5rem;
  gap: 1rem;
}

.ds-recurrence-list__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.ds-recurrence-list__mission-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-recurrence-list__details {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-recurrence-list__freq {
  font-weight: 500;
  color: var(--ds-accent, #6366f1);
}

.ds-recurrence-list__next-run {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.ds-recurrence-list__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.ds-recurrence-list__badge {
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-text-muted, #64748b);
}

.ds-recurrence-list__badge--active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.ds-recurrence-list__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
  color: var(--ds-text-muted, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
}

.ds-recurrence-list__btn:hover {
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-text, #f1f5f9);
}

.ds-recurrence-list__btn--danger:hover {
  color: var(--ds-danger, #ef4444);
  background: rgba(239, 68, 68, 0.1);
}

@media (max-width: 640px) {
  .ds-recurrence-list__row {
    flex-direction: column;
    align-items: flex-start;
  }

  .ds-recurrence-list__actions {
    align-self: flex-end;
  }
}
</style>
