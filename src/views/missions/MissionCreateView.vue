<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMissionsStore } from '@/stores/missions'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { CURRENCY_OPTIONS } from '@/constants/currencies'
import BCard from '@/components/base/BCard.vue'
import BInput from '@/components/base/BInput.vue'
import BButton from '@/components/base/BButton.vue'
import BRadioGroup from '@/components/base/BRadioGroup.vue'
import BSelect from '@/components/base/BSelect.vue'
import UserSelect from '@/components/common/UserSelect.vue'

const { t } = useI18n()
const router = useRouter()
const missionsStore = useMissionsStore()
const authStore = useAuthStore()
const toast = useToast()

const isAgent = computed(() => authStore.hasRole('agent'))
const isClient = computed(() => authStore.hasRole('client'))

const title = ref('')
const clientId = ref('')
const description = ref('')
const pricingType = ref<'fixed' | 'hourly' | 'task_based'>('fixed')
const agreedAmount = ref<number | ''>('')
const currency = ref('USD')
const missionType = ref<'one_time' | 'recurrent'>('one_time')
const checklistItems = ref<string[]>([''])
const submitting = ref(false)

const pricingTypeOptions = computed(() => [
  { value: 'fixed', label: t('missions.create.fields.fixed') },
  { value: 'hourly', label: t('missions.create.fields.hourly') },
  { value: 'task_based', label: t('missions.create.fields.taskBased') },
])

const missionTypeOptions = computed(() => [
  { value: 'one_time', label: t('missions.create.fields.oneTime') },
  { value: 'recurrent', label: t('missions.create.fields.recurrent') },
])

const errors = ref<Record<string, string>>({})

function validate() {
  const errs: Record<string, string> = {}
  if (!title.value.trim()) errs.title = t('missions.create.validation.titleRequired')
  if (isAgent.value && !clientId.value.trim()) errs.client = t('missions.create.validation.clientRequired')
  errors.value = errs
  return Object.keys(errs).length === 0
}

function addChecklistItem() {
  checklistItems.value.push('')
}

function removeChecklistItem(index: number) {
  checklistItems.value.splice(index, 1)
}

const filteredChecklist = computed(() =>
  checklistItems.value.filter((item) => item.trim() !== ''),
)

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  try {
    const newMission = await missionsStore.createMission({
      title: title.value.trim(),
      clientId: isAgent.value ? clientId.value.trim() : undefined,
      description: description.value.trim() || undefined,
      pricingType: pricingType.value,
      agreedAmount: agreedAmount.value ? Number(agreedAmount.value) : undefined,
      currency: currency.value,
      agreedChecklist: filteredChecklist.value.length > 0 ? filteredChecklist.value : undefined,
    })
    toast.success(t('missions.create.created'))
    router.push(`/app/missions/${newMission.id}`)
  } catch {
    // Error handled by store
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="ds-mission-create">
    <div class="ds-mission-create__header">
      <h1 class="ds-mission-create__title">{{ t('missions.create.title') }}</h1>
      <p class="ds-mission-create__subtitle">
        {{ isClient ? t('missions.create.subtitleClient') : t('missions.create.subtitle') }}
      </p>
    </div>

    <BCard variant="bordered" padding="lg" class="ds-mission-create__card">
      <form @submit.prevent="handleSubmit" class="ds-mission-create__form">
        <!-- Title -->
        <BInput
          v-model="title"
          :label="t('missions.create.fields.title')"
          :placeholder="t('missions.create.fields.titlePlaceholder')"
          :error="errors.title"
        />

        <!-- Client (Agent only) -->
        <UserSelect
          v-if="isAgent"
          v-model="clientId"
          role="client"
          :label="t('missions.create.fields.client')"
          :placeholder="t('missions.create.fields.clientPlaceholder')"
          :error="errors.client"
        />

        <!-- Description -->
        <div class="ds-form-group">
          <label class="ds-form-label">{{ t('missions.create.fields.description') }}</label>
          <textarea
            v-model="description"
            :placeholder="t('missions.create.fields.descriptionPlaceholder')"
            class="ds-textarea"
            rows="4"
          />
        </div>

        <!-- Pricing Type -->
        <BRadioGroup
          v-model="pricingType"
          :options="pricingTypeOptions"
          :label="t('missions.create.fields.pricingType')"
        />

        <!-- Amount -->
        <BInput
          v-model="agreedAmount"
          :label="isClient ? t('missions.create.fields.proposedAmount') : t('missions.create.fields.amount')"
          :placeholder="t('missions.create.fields.amountPlaceholder')"
          type="number"
        />

        <!-- Currency -->
        <BSelect
          v-model="currency"
          :options="CURRENCY_OPTIONS"
          :label="t('missions.create.fields.currency')"
        />

        <!-- Mission Type -->
        <BRadioGroup
          v-model="missionType"
          :options="missionTypeOptions"
          :label="t('missions.create.fields.missionType')"
        />

        <!-- Checklist -->
        <div class="ds-form-group">
          <label class="ds-form-label">{{ t('missions.create.checklist.title') }}</label>
          <p class="ds-form-hint">{{ t('missions.create.checklist.hint') }}</p>
          <div class="ds-checklist-builder">
            <div
              v-for="(item, idx) in checklistItems"
              :key="idx"
              class="ds-checklist-builder__row"
            >
              <input
                v-model="checklistItems[idx]"
                :placeholder="t('missions.create.checklist.placeholder')"
                class="ds-checklist-builder__input"
              />
              <button
                type="button"
                class="ds-checklist-builder__remove"
                @click="removeChecklistItem(idx)"
              >
                <i class="bi bi-x-lg" />
              </button>
            </div>
            <button
              type="button"
              class="ds-checklist-builder__add"
              @click="addChecklistItem"
            >
              <i class="bi bi-plus-circle" />
              {{ t('missions.create.checklist.add') }}
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="ds-mission-create__actions">
          <BButton variant="ghost" @click="router.back()">
            {{ t('missions.create.cancel') }}
          </BButton>
          <BButton type="submit" variant="accent" :loading="submitting">
            {{ submitting ? t('missions.create.creating') : t('missions.create.submit') }}
          </BButton>
        </div>
      </form>
    </BCard>
  </div>
</template>

<style scoped>
.ds-mission-create {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 48rem;
}

.ds-mission-create__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-mission-create__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0.25rem 0 0;
}

.ds-mission-create__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ds-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ds-form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
}

.ds-form-hint {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.ds-textarea {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--ds-border, #334155);
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-text, #f1f5f9);
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
}

.ds-textarea:focus {
  outline: none;
  border-color: var(--ds-accent, #6366f1);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.ds-checklist-builder {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ds-checklist-builder__row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.ds-checklist-builder__input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--ds-border, #334155);
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-text, #f1f5f9);
  font-size: 0.875rem;
}

.ds-checklist-builder__input:focus {
  outline: none;
  border-color: var(--ds-accent, #6366f1);
}

.ds-checklist-builder__remove {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: var(--ds-text-muted, #64748b);
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.ds-checklist-builder__remove:hover {
  color: var(--ds-danger, #ef4444);
  background: rgba(239, 68, 68, 0.1);
}

.ds-checklist-builder__add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px dashed var(--ds-border, #334155);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: var(--ds-text-muted, #64748b);
  cursor: pointer;
  font-size: 0.8125rem;
  transition: all 0.15s ease;
}

.ds-checklist-builder__add:hover {
  border-color: var(--ds-accent, #6366f1);
  color: var(--ds-accent, #6366f1);
}

.ds-mission-create__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ds-border, #334155);
}

@media (max-width: 768px) {
  .ds-mission-create {
    max-width: 100%;
  }
  .ds-form-row {
    grid-template-columns: 1fr;
  }
  .ds-mission-create__actions {
    flex-direction: column-reverse;
  }
}
</style>
