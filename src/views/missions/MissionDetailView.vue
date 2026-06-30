<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMissionsStore } from '@/stores/missions'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { formatDateTime } from '@/utils/formatters'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import MissionTimeline from '@/components/mission/MissionTimeline.vue'
import MissionChecklist from '@/components/mission/MissionChecklist.vue'
import MissionAttachments from '@/components/mission/MissionAttachments.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const missionsStore = useMissionsStore()
const authStore = useAuthStore()
const toast = useToast()

const missionId = computed(() => route.params.id as string)

onMounted(async () => {
  await missionsStore.fetchMission(missionId.value)
})

const mission = computed(() => missionsStore.currentMission)

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

function statusLabel(status: string) {
  const key = `missions.status.${status}`
  const translated = t(key)
  return translated !== key ? translated : status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function pricingLabel(type: string) {
  const map: Record<string, string> = {
    fixed: t('missions.detail.fixed'),
    hourly: t('missions.detail.hourly'),
    task_based: t('missions.detail.taskBased'),
  }
  return map[type] || type
}

const isAgent = computed(() => authStore.hasRole('agent'))
const isClient = computed(() => authStore.hasRole('client'))

const canSendForAgreement = computed(() => isAgent.value && mission.value?.status === 'draft')
const canStart = computed(() => isAgent.value && mission.value?.status === 'agreed')
const canComplete = computed(() => isAgent.value && mission.value?.status === 'in_progress')
const canAgree = computed(() => isClient.value && mission.value?.status === 'pending_agreement')
const canCancel = computed(() =>
  mission.value?.status !== 'completed' && mission.value?.status !== 'cancelled' && mission.value?.status !== 'disputed'
)

async function handleSendForAgreement() {
  try {
    await missionsStore.updateMissionStatus(missionId.value, 'pending_agreement')
    toast.success(t('missions.detail.actions.sendForAgreement'))
  } catch {
    toast.error('Failed to send for agreement')
  }
}

async function handleStartMission() {
  try {
    await missionsStore.updateMissionStatus(missionId.value, 'in_progress')
    toast.success(t('missions.detail.actions.startMission'))
  } catch {
    toast.error('Failed to start mission')
  }
}

async function handleMarkComplete() {
  try {
    await missionsStore.updateMissionStatus(missionId.value, 'completed')
    toast.success(t('missions.detail.actions.markComplete'))
  } catch {
    toast.error('Failed to mark complete')
  }
}

async function handleAgree() {
  try {
    await missionsStore.agreeMission(missionId.value)
    toast.success(t('missions.detail.actions.agree'))
  } catch {
    toast.error('Failed to agree')
  }
}

async function handleCancel() {
  if (!confirm(t('missions.detail.confirmActions.cancelMessage'))) return
  try {
    await missionsStore.deleteMission(missionId.value)
    toast.success(t('missions.detail.actions.cancel'))
    router.push('/app/missions')
  } catch {
    toast.error('Failed to cancel mission')
  }
}

function goBack() {
  router.push('/app/missions')
}
</script>

<template>
  <div class="ds-mission-detail">
    <!-- Back Link -->
    <button class="ds-mission-detail__back" @click="goBack">
      {{ t('missions.detail.backToList') }}
    </button>

    <!-- Loading — Skeleton -->
    <template v-if="missionsStore.loading && !mission">
      <div class="ds-mission-detail__loading">
        <div class="ds-mission-detail ds-gap-6">
          <SkeletonLoader variant="text" width="120px" height="14px" />
          <div class="ds-flex ds-items-center ds-gap-3">
            <SkeletonLoader variant="text" width="300px" height="28px" />
            <SkeletonLoader variant="badge" width="80px" height="24px" />
          </div>
          <div class="ds-mission-detail__info-cards">
            <SkeletonLoader v-for="i in 4" :key="i" variant="card" />
          </div>
          <div class="ds-mission-detail__content-grid">
            <div class="ds-mission-detail__content-main">
              <SkeletonLoader variant="card" :lines="3" />
              <SkeletonLoader variant="card" :lines="4" />
            </div>
            <div class="ds-mission-detail__content-aside">
              <SkeletonLoader variant="card" :lines="3" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else-if="!mission" class="ds-mission-detail__empty">
      <p>{{ t('missions.list.noResults') }}</p>
    </div>

    <!-- Mission Detail -->
    <template v-else>
      <!-- Header -->
      <div class="ds-mission-detail__header">
        <div class="ds-mission-detail__header-info">
          <h1 class="ds-mission-detail__title">{{ mission.title }}</h1>
          <div class="ds-mission-detail__badges">
            <BBadge :variant="statusBadgeVariant(mission.status) as any">
              {{ statusLabel(mission.status) }}
            </BBadge>
            <BBadge variant="default">
              {{ mission.type === 'recurrent' ? t('missions.detail.recurrent') : t('missions.detail.oneTime') }}
            </BBadge>
          </div>
        </div>

        <!-- Actions -->
        <div class="ds-mission-detail__actions">
          <BButton
            v-if="canSendForAgreement"
            variant="accent"
            @click="handleSendForAgreement"
          >
            {{ t('missions.detail.actions.sendForAgreement') }}
          </BButton>
          <BButton
            v-if="canStart"
            variant="accent"
            @click="handleStartMission"
          >
            {{ t('missions.detail.actions.startMission') }}
          </BButton>
          <BButton
            v-if="canComplete"
            variant="accent"
            @click="handleMarkComplete"
          >
            {{ t('missions.detail.actions.markComplete') }}
          </BButton>
          <BButton
            v-if="canAgree"
            variant="accent"
            :to="`/app/missions/${missionId}/agree`"
          >
            {{ t('missions.detail.actions.agree') }}
          </BButton>
          <BButton
            v-if="canCancel"
            variant="danger"
            @click="handleCancel"
          >
            {{ t('missions.detail.actions.cancel') }}
          </BButton>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="ds-mission-detail__info-cards">
        <BCard variant="bordered" padding="md" class="ds-mission-detail__info-card">
          <span class="ds-mission-detail__info-label">{{ t('missions.detail.pricing') }}</span>
          <span class="ds-mission-detail__info-value">{{ pricingLabel(mission.pricingType) }}</span>
        </BCard>
        <BCard variant="bordered" padding="md" class="ds-mission-detail__info-card">
          <span class="ds-mission-detail__info-label">{{ t('missions.detail.amount') }}</span>
          <span class="ds-mission-detail__info-value font-mono">
            {{ mission.currency && mission.agreedAmount ? `${mission.currency} ${mission.agreedAmount}` : '—' }}
          </span>
        </BCard>
        <BCard variant="bordered" padding="md" class="ds-mission-detail__info-card">
          <span class="ds-mission-detail__info-label">{{ t('missions.detail.created') }}</span>
          <span class="ds-mission-detail__info-value font-mono">{{ formatDateTime(mission.createdAt) }}</span>
        </BCard>
        <BCard variant="bordered" padding="md" class="ds-mission-detail__info-card">
          <span class="ds-mission-detail__info-label">{{ t('missions.detail.started') }}</span>
          <span class="ds-mission-detail__info-value font-mono">{{ formatDateTime(mission.startedAt) }}</span>
        </BCard>
      </div>

      <!-- Agent & Client -->
      <div class="ds-mission-detail__parties">
        <BCard variant="bordered" padding="md" class="ds-mission-detail__party-card">
          <span class="ds-mission-detail__party-label">{{ t('missions.detail.agent') }}</span>
          <span v-if="mission.agent" class="ds-mission-detail__party-name">
            {{ mission.agent.firstName }} {{ mission.agent.lastName }}
          </span>
          <span v-if="mission.agent" class="ds-mission-detail__party-email font-mono">
            {{ mission.agent.email }}
          </span>
        </BCard>
        <BCard variant="bordered" padding="md" class="ds-mission-detail__party-card">
          <span class="ds-mission-detail__party-label">{{ t('missions.detail.client') }}</span>
          <span v-if="mission.client" class="ds-mission-detail__party-name">
            {{ mission.client.firstName }} {{ mission.client.lastName }}
          </span>
          <span v-if="mission.client" class="ds-mission-detail__party-email font-mono">
            {{ mission.client.email }}
          </span>
        </BCard>
      </div>

      <!-- Two Column Layout -->
      <div class="ds-mission-detail__content-grid">
        <!-- Left Column -->
        <div class="ds-mission-detail__content-main">
          <!-- Timeline -->
          <BCard variant="bordered" padding="md" class="ds-mission-detail__section">
            <template #header>
              <h2 class="ds-section-header__title">{{ t('missions.detail.timeline') }}</h2>
            </template>
            <MissionTimeline
              :status="mission.status"
              :created-at="mission.createdAt || ''"
              :started-at="mission.startedAt"
              :completed-at="mission.completedAt"
            />
          </BCard>

          <!-- Description -->
          <BCard variant="bordered" padding="md" class="ds-mission-detail__section">
            <template #header>
              <h2 class="ds-section-header__title">{{ t('missions.detail.description') }}</h2>
            </template>
            <p v-if="mission.description" class="ds-mission-detail__description">
              {{ mission.description }}
            </p>
            <p v-else class="ds-mission-detail__description ds-mission-detail__description--empty">
              {{ t('missions.detail.noDescription') }}
            </p>
          </BCard>
        </div>

        <!-- Right Column -->
        <div class="ds-mission-detail__content-aside">
          <!-- Checklist -->
          <BCard variant="bordered" padding="md" class="ds-mission-detail__section">
            <template #header>
              <h2 class="ds-section-header__title">{{ t('missions.detail.checklist') }}</h2>
            </template>
            <MissionChecklist
              :agreed-checklist="mission.agreedChecklist || []"
              :completed-checklist="mission.completedChecklist || []"
              :status="mission.status"
              :mission-id="mission.id"
              :editable="mission.status === 'in_progress'"
            />
          </BCard>

          <!-- Attachments -->
          <BCard variant="bordered" padding="md" class="ds-mission-detail__section">
            <template #header>
              <h2 class="ds-section-header__title">{{ t('missions.detail.attachments') }}</h2>
            </template>
            <MissionAttachments
              :mission-id="mission.id"
              :attachments="mission.attachments || []"
              :status="mission.status"
            />
          </BCard>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ds-mission-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ds-mission-detail__back {
  background: none;
  border: none;
  color: var(--ds-text-muted, #64748b);
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0;
  width: fit-content;
  transition: color 0.15s ease;
}

.ds-mission-detail__back:hover {
  color: var(--ds-accent, #6366f1);
}

.ds-mission-detail__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-mission-detail__empty {
  display: flex;
  justify-content: center;
  padding: 3rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-detail__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.ds-mission-detail__header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ds-mission-detail__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-mission-detail__badges {
  display: flex;
  gap: 0.5rem;
}

.ds-mission-detail__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ds-mission-detail__info-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.ds-mission-detail__info-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ds-mission-detail__info-label {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-mission-detail__info-value {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
}

.ds-mission-detail__parties {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.ds-mission-detail__party-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ds-mission-detail__party-label {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-mission-detail__party-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
}

.ds-mission-detail__party-email {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-detail__content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
}

.ds-mission-detail__content-main,
.ds-mission-detail__content-aside {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ds-mission-detail__section {
  overflow: hidden;
}

.ds-mission-detail__description {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
  line-height: 1.6;
  margin: 0;
}

.ds-mission-detail__description--empty {
  color: var(--ds-text-muted, #64748b);
  font-style: italic;
}

@media (max-width: 768px) {
  .ds-mission-detail__info-cards {
    grid-template-columns: 1fr 1fr;
  }

  .ds-mission-detail__parties {
    grid-template-columns: 1fr;
  }

  .ds-mission-detail__content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
