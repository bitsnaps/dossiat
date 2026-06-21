<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import RecurrencePreview from './RecurrencePreview.vue'

const { t } = useI18n()

interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual'
  interval: number
  dayOfMonth?: number | null
  dayOfWeek?: number | null
}

interface Props {
  missionId: number
  existingConfig?: RecurrenceConfig | null
}

const props = withDefaults(defineProps<Props>(), {
  existingConfig: null,
})

const emit = defineEmits<{
  save: [data: RecurrenceConfig]
  disable: []
}>()

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const frequency = ref<string>(props.existingConfig?.frequency || 'weekly')
const interval = ref(props.existingConfig?.interval || 1)
const dayOfWeek = ref<number | null>(props.existingConfig?.dayOfWeek ?? 1)
const dayOfMonth = ref<number | null>(props.existingConfig?.dayOfMonth ?? 1)

const isEdit = computed(() => !!props.existingConfig)

const showDayOfWeek = computed(() => frequency.value === 'weekly')
const showDayOfMonth = computed(() => frequency.value === 'monthly')

// Reset day selectors when frequency changes
watch(frequency, (val) => {
  if (val !== 'weekly') dayOfWeek.value = null
  if (val !== 'monthly') dayOfMonth.value = null
})

const unitLabel = computed(() => {
  const map: Record<string, string> = {
    daily: t('missions.recurrence.unitDays'),
    weekly: t('missions.recurrence.unitWeeks'),
    monthly: t('missions.recurrence.unitMonths'),
    annual: t('missions.recurrence.unitYears'),
  }
  return map[frequency.value] || ''
})

function handleSave() {
  const data: RecurrenceConfig = {
    frequency: frequency.value as RecurrenceConfig['frequency'],
    interval: Number(interval.value),
  }
  if (showDayOfWeek.value && dayOfWeek.value != null) {
    data.dayOfWeek = dayOfWeek.value
  }
  if (showDayOfMonth.value && dayOfMonth.value != null) {
    data.dayOfMonth = dayOfMonth.value
  }
  emit('save', data)
}

function handleDisable() {
  emit('disable')
}
</script>

<template>
  <div class="ds-recurrence-setup">
    <div class="ds-recurrence-setup__header">
      <h3 class="ds-recurrence-setup__title">{{ t('missions.recurrence.title') }}</h3>
      <p class="ds-recurrence-setup__subtitle">{{ t('missions.recurrence.subtitle') }}</p>
    </div>

    <div class="ds-recurrence-setup__form">
      <!-- Frequency -->
      <div class="ds-recurrence-setup__field">
        <label class="ds-recurrence-setup__label">{{ t('missions.recurrence.frequency') }}</label>
        <select v-model="frequency" class="ds-recurrence-setup__frequency ds-recurrence-setup__select">
          <option value="daily">{{ t('missions.recurrence.daily') }}</option>
          <option value="weekly">{{ t('missions.recurrence.weekly') }}</option>
          <option value="monthly">{{ t('missions.recurrence.monthly') }}</option>
          <option value="annual">{{ t('missions.recurrence.annual') }}</option>
        </select>
      </div>

      <!-- Interval -->
      <div class="ds-recurrence-setup__field">
        <label class="ds-recurrence-setup__label">{{ t('missions.recurrence.interval') }}</label>
        <div class="ds-recurrence-setup__interval-row">
          <input
            v-model.number="interval"
            type="number"
            min="1"
            max="365"
            class="ds-recurrence-setup__interval ds-recurrence-setup__input"
          />
          <span class="ds-recurrence-setup__unit">{{ unitLabel }}</span>
        </div>
      </div>

      <!-- Day of Week -->
      <div v-if="showDayOfWeek" class="ds-recurrence-setup__field">
        <label class="ds-recurrence-setup__label">{{ t('missions.recurrence.dayOfWeek') }}</label>
        <select v-model.number="dayOfWeek" class="ds-recurrence-setup__day-of-week ds-recurrence-setup__select">
          <option v-for="(name, index) in DAY_NAMES" :key="index" :value="index">{{ name }}</option>
        </select>
      </div>

      <!-- Day of Month -->
      <div v-if="showDayOfMonth" class="ds-recurrence-setup__field">
        <label class="ds-recurrence-setup__label">{{ t('missions.recurrence.dayOfMonth') }}</label>
        <select v-model.number="dayOfMonth" class="ds-recurrence-setup__day-of-month ds-recurrence-setup__select">
          <option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>

      <!-- Preview -->
      <div class="ds-recurrence-setup__preview">
        <RecurrencePreview
          :frequency="frequency"
          :interval="interval"
          :day-of-week="dayOfWeek"
          :day-of-month="dayOfMonth"
        />
      </div>

      <!-- Actions -->
      <div class="ds-recurrence-setup__actions">
        <button class="ds-recurrence-setup__save ds-recurrence-setup__btn ds-recurrence-setup__btn--accent" @click="handleSave">
          {{ t('missions.recurrence.save') }}
        </button>
        <button
          v-if="isEdit"
          class="ds-recurrence-setup__disable ds-recurrence-setup__btn ds-recurrence-setup__btn--danger"
          @click="handleDisable"
        >
          {{ t('missions.recurrence.disable') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ds-recurrence-setup {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ds-recurrence-setup__header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ds-recurrence-setup__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-recurrence-setup__subtitle {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-recurrence-setup__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ds-recurrence-setup__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.ds-recurrence-setup__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-recurrence-setup__select,
.ds-recurrence-setup__input {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--ds-border, #334155);
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-text, #f1f5f9);
  font-size: 0.8125rem;
}

.ds-recurrence-setup__input {
  width: 5rem;
}

.ds-recurrence-setup__interval-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ds-recurrence-setup__unit {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-recurrence-setup__preview {
  padding: 0.75rem;
  border: 1px solid var(--ds-border, #334155);
  border-radius: 0.5rem;
  background: var(--ds-bg, #0f172a);
}

.ds-recurrence-setup__actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.ds-recurrence-setup__btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ds-recurrence-setup__btn--accent {
  background: var(--ds-accent, #6366f1);
  color: #fff;
}

.ds-recurrence-setup__btn--accent:hover {
  opacity: 0.9;
}

.ds-recurrence-setup__btn--danger {
  background: transparent;
  color: var(--ds-danger, #ef4444);
  border: 1px solid var(--ds-danger, #ef4444);
}

.ds-recurrence-setup__btn--danger:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>
