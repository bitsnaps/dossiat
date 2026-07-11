<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMissionsStore } from '@/stores/missions'
import { usePaymentsStore } from '@/stores/payments'
import { useMessagesStore } from '@/stores/messages'
import { useAgentProfileStore } from '@/stores/agentProfile'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import BAlert from '@/components/base/BAlert.vue'
import BModal from '@/components/base/BModal.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import InviteLinkShare from '@/components/agent/InviteLinkShare.vue'

const { t } = useI18n()
const missionsStore = useMissionsStore()
const paymentsStore = usePaymentsStore()
const messagesStore = useMessagesStore()
const agentProfileStore = useAgentProfileStore()

const showInviteModal = ref(false)

const inviteSlug = computed(() => agentProfileStore.profile?.uniqueInviteSlug || '')

onMounted(() => {
  if (!agentProfileStore.profile) {
    agentProfileStore.fetchProfile()
  }
})

const stats = computed(() => [
  {
    label: t('dashboard.activeMissions'),
    value: missionsStore.activeMissions.length,
    icon: 'bi-clipboard-check',
    variant: 'accent',
  },
  {
    label: t('dashboard.creditBalance'),
    value: paymentsStore.creditBalance
      ? `${paymentsStore.creditBalance.currency} ${paymentsStore.creditBalance.balance}`
      : '—',
    icon: 'bi-coin',
    variant: 'info',
  },
  {
    label: t('dashboard.unreadMessages'),
    value: messagesStore.unreadCount,
    icon: 'bi-chat-dots',
    variant: 'warning',
  },
  {
    label: t('dashboard.pendingAgreements'),
    value: missionsStore.missions.filter((m) => m.status === 'pending_agreement').length,
    icon: 'bi-clock-history',
    variant: 'accent',
  },
])

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
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const isLoading = computed(() => missionsStore.loading && missionsStore.missions.length === 0)
</script>

<template>
  <div class="ds-agent-dashboard">
    <!-- Stats Cards — Skeleton -->
    <div v-if="isLoading" class="ds-agent-dashboard__stats">
      <BCard v-for="i in 4" :key="i" variant="elevated" padding="md">
        <div class="ds-stat">
          <SkeletonLoader variant="avatar" width="40px" height="40px" />
          <div class="ds-stat__info ds-gap-1">
            <SkeletonLoader variant="text" width="48px" height="20px" />
            <SkeletonLoader variant="text" width="80px" height="12px" />
          </div>
        </div>
      </BCard>
    </div>

    <!-- Stats Cards -->
    <div v-else class="ds-agent-dashboard__stats">
      <BCard
        v-for="stat in stats"
        :key="stat.label"
        variant="elevated"
        padding="md"
        class="ds-agent-dashboard__stat-card"
      >
        <div class="ds-stat">
          <div class="ds-stat__icon">
            <i :class="['bi', stat.icon]" />
          </div>
          <div class="ds-stat__info">
            <span class="ds-stat__value font-mono">{{ stat.value }}</span>
            <span class="ds-stat__label">{{ stat.label }}</span>
          </div>
        </div>
      </BCard>
    </div>

    <!-- Profile Setup Banner -->
    <BAlert
      v-if="!agentProfileStore.isComplete"
      variant="accent"
      dismissible
      icon="bi-person-gear"
      :title="t('dashboard.profileSetup')"
      class="ds-agent-dashboard__profile-alert"
    >
      <BButton
        variant="accent"
        size="sm"
        to="/app/onboarding"
      >
        {{ t('dashboard.setupProfile') }}
      </BButton>
    </BAlert>

    <!-- Active Missions -->
    <BCard variant="bordered" padding="none" class="ds-agent-dashboard__section">
      <template #header>
        <div class="ds-section-header">
          <h2 class="ds-section-header__title">{{ t('dashboard.activeMissions') }}</h2>
          <BButton variant="ghost" size="sm" to="/app/missions">
            {{ t('dashboard.viewAll') }}
          </BButton>
        </div>
      </template>

      <div v-if="missionsStore.activeMissions.length === 0" class="ds-empty-state">
        <i class="bi bi-clipboard ds-empty-state__icon" />
        <p>{{ t('dashboard.noMissions') }}</p>
      </div>

      <div v-else class="ds-mission-list">
        <div
          v-for="mission in missionsStore.activeMissions.slice(0, 5)"
          :key="mission.id"
          class="ds-mission-row"
        >
          <div class="ds-mission-row__info">
            <span class="ds-mission-row__title">{{ mission.title }}</span>
            <span class="ds-mission-row__meta font-mono">
              {{ mission.currency }} {{ mission.agreedAmount ?? '—' }}
            </span>
          </div>
          <BBadge :variant="statusBadgeVariant(mission.status) as any" size="sm">
            {{ statusLabel(mission.status) }}
          </BBadge>
        </div>
      </div>
    </BCard>

    <!-- Quick Actions -->
    <BCard variant="bordered" padding="md" class="ds-agent-dashboard__section">
      <template #header>
        <div class="ds-section-header">
          <h2 class="ds-section-header__title">{{ t('dashboard.quickActions') }}</h2>
        </div>
      </template>

      <div class="ds-quick-actions">
        <BButton variant="accent" to="/app/missions/create" icon="bi-plus-circle">
          {{ t('dashboard.createMission') }}
        </BButton>
        <BButton variant="outline" to="/app/credits" icon="bi-coin">
          {{ t('dashboard.viewCredits') }}
        </BButton>
        <BButton variant="outline" icon="bi-link-45deg" :disabled="!inviteSlug" @click="showInviteModal = true">
          {{ t('dashboard.shareInviteLink') }}
        </BButton>
      </div>
    </BCard>

    <!-- Invite Link Modal -->
    <BModal v-model="showInviteModal" :title="t('dashboard.shareInviteLink')" size="md">
      <InviteLinkShare v-if="inviteSlug" :slug="inviteSlug" />
    </BModal>
  </div>
</template>
