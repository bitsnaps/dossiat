<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMissionsStore } from '@/stores/missions'
import { useToast } from '@/composables/useToast'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import MissionChecklist from '@/components/mission/MissionChecklist.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const missionsStore = useMissionsStore()
const toast = useToast()

const missionId = computed(() => route.params.id as string)

const checkedItems = ref<string[]>([])
const agreeChecked = ref(false)
const submitting = ref(false)

onMounted(async () => {
  if (!missionsStore.currentMission || missionsStore.currentMission.id !== Number(missionId.value)) {
    await missionsStore.fetchMission(missionId.value)
  }
})

const mission = computed(() => missionsStore.currentMission)

watch(mission, (m) => {
  if (m && m.status !== 'pending_agreement') {
    router.replace(`/app/missions/${missionId.value}`)
  }
}, { immediate: true })

function statusLabel(status: string) {
  const key = `missions.status.${status}`
  const translated = t(key)
  return translated !== key ? translated : status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function statusBadgeVariant(status: string) {
  const map: Record<string, string> = {
    in_progress: 'info',
    agreed: 'accent',
    pending_agreement: 'warning',
    completed: 'success',
    disputed: 'danger',
    draft: 'default',
    cancelled: 'default',
  }
  return map[status] || 'default'
}

function formatPricingType(type: string) {
  const map: Record<string, string> = {
    fixed: t('missions.detail.fixed'),
    hourly: t('missions.detail.hourly'),
    task_based: t('missions.detail.taskBased'),
  }
  return map[type] || type
}

const allChecked = computed(() => {
  const checklist = mission.value?.agreedChecklist || []
  return checklist.length > 0 && checklist.every((item) => checkedItems.value.includes(item))
})

const canSubmit = computed(() => allChecked.value && agreeChecked.value)

function onUpdateChecklist(items: string[]) {
  checkedItems.value = items
}

async function handleAgree() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    await missionsStore.agreeMission(missionId.value)
    await missionsStore.updateMissionStatus(missionId.value, 'agreed')
    toast.success(t('missions.agreement.agreed'))
    router.push(`/app/missions/${missionId.value}`)
  } catch {
    toast.error('Failed to confirm agreement')
  } finally {
    submitting.value = false
  }
}

async function handleDecline() {
  if (!confirm(t('missions.agreement.confirmDecline'))) return
  try {
    await missionsStore.deleteMission(missionId.value)
    toast.info(t('missions.detail.actions.cancel'))
    router.push('/app/missions')
  } catch {
    toast.error('Failed to decline mission')
  }
}
</script>

<template>
  <div class="ds-mission-agreement">
    <button class="ds-mission-agreement__back" @click="router.push(`/app/missions/${missionId}`)">
      {{ t('missions.detail.backToList') }}
    </button>

    <div v-if="missionsStore.loading && !mission" class="ds-mission-agreement__loading">
      <div class="spinner-border" role="status" />
    </div>

    <template v-else-if="mission">
      <BCard variant="bordered" padding="lg" class="ds-mission-agreement__card">
        <h1 class="ds-mission-agreement__title">{{ t('missions.agreement.title') }}</h1>
        <p class="ds-mission-agreement__subtitle">{{ t('missions.agreement.subtitle') }}</p>

        <!-- Mission Summary -->
        <div class="ds-mission-agreement__summary">
          <h3 class="ds-mission-agreement__section-title">{{ t('missions.agreement.missionSummary') }}</h3>
          <div class="ds-mission-agreement__summary-grid">
            <div class="ds-mission-agreement__summary-item">
              <span class="ds-mission-agreement__summary-label">{{ t('missions.detail.title') }}</span>
              <span class="ds-mission-agreement__summary-value">{{ mission.title }}</span>
            </div>
            <div class="ds-mission-agreement__summary-item">
              <span class="ds-mission-agreement__summary-label">{{ t('missions.detail.pricing') }}</span>
              <span class="ds-mission-agreement__summary-value">{{ formatPricingType(mission.pricingType) }}</span>
            </div>
            <div class="ds-mission-agreement__summary-item">
              <span class="ds-mission-agreement__summary-label">{{ t('missions.detail.amount') }}</span>
              <span class="ds-mission-agreement__summary-value font-mono">
                {{ mission.currency && mission.agreedAmount ? `${mission.currency} ${mission.agreedAmount}` : '—' }}
              </span>
            </div>
            <div class="ds-mission-agreement__summary-item">
              <span class="ds-mission-agreement__summary-label">{{ t('missions.detail.status') }}</span>
              <BBadge :variant="statusBadgeVariant(mission.status) as any" size="sm">
                {{ statusLabel(mission.status) }}
              </BBadge>
            </div>
          </div>
        </div>

        <!-- Checklist -->
        <div class="ds-mission-agreement__checklist">
          <h3 class="ds-mission-agreement__section-title">{{ t('missions.agreement.checklistTitle') }}</h3>
          <p class="ds-mission-agreement__checklist-hint">{{ t('missions.agreement.checklistHint') }}</p>
          <MissionChecklist
            :agreed-checklist="mission.agreedChecklist || []"
            :completed-checklist="checkedItems"
            :status="mission.status"
            :mission-id="mission.id"
            :editable="true"
            @update:completed-checklist="onUpdateChecklist"
          />
        </div>

        <!-- Agreement Checkbox -->
        <label class="ds-mission-agreement__confirm">
          <input
            v-model="agreeChecked"
            type="checkbox"
            class="ds-mission-agreement__checkbox"
            :disabled="!allChecked"
          />
          <span class="ds-mission-agreement__confirm-text">{{ t('missions.agreement.agreeConfirm') }}</span>
        </label>

        <p v-if="!allChecked && mission.agreedChecklist?.length" class="ds-mission-agreement__hint">
          {{ t('missions.agreement.notAgreed') }}
        </p>

        <!-- Actions -->
        <div class="ds-mission-agreement__actions">
          <BButton variant="ghost" @click="handleDecline">
            {{ t('missions.agreement.decline') }}
          </BButton>
          <BButton
            variant="accent"
            :disabled="!canSubmit"
            :loading="submitting"
            @click="handleAgree"
          >
            {{ t('missions.agreement.confirmAgreement') }}
          </BButton>
        </div>
      </BCard>
    </template>
  </div>
</template>

<style scoped>
.ds-mission-agreement {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 48rem;
  margin: 0 auto;
}

.ds-mission-agreement__back {
  background: none;
  border: none;
  color: var(--ds-text-muted, #64748b);
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0;
  width: fit-content;
  transition: color 0.15s ease;
}

.ds-mission-agreement__back:hover {
  color: var(--ds-accent, #6366f1);
}

.ds-mission-agreement__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-mission-agreement__card {
  overflow: hidden;
}

.ds-mission-agreement__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0 0 0.25rem;
}

.ds-mission-agreement__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0 0 1.5rem;
}

.ds-mission-agreement__summary {
  margin-bottom: 1.5rem;
}

.ds-mission-agreement__section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0 0 0.75rem;
}

.ds-mission-agreement__summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.ds-mission-agreement__summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ds-mission-agreement__summary-label {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-mission-agreement__summary-value {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
}

.ds-mission-agreement__checklist {
  margin-bottom: 1.5rem;
}

.ds-mission-agreement__checklist-hint {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0 0 0.75rem;
}

.ds-mission-agreement__confirm {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--ds-border, #334155);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.ds-mission-agreement__confirm:hover {
  border-color: var(--ds-accent, #6366f1);
}

.ds-mission-agreement__checkbox {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: var(--ds-accent, #6366f1);
}

.ds-mission-agreement__confirm-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
}

.ds-mission-agreement__hint {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0.5rem 0 0;
}

.ds-mission-agreement__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ds-border, #334155);
}
</style>
