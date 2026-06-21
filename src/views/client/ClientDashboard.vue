<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMissionsStore } from '@/stores/missions'
import { usePaymentsStore } from '@/stores/payments'
import { useMessagesStore } from '@/stores/messages'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'

const { t } = useI18n()
const missionsStore = useMissionsStore()
const paymentsStore = usePaymentsStore()
const messagesStore = useMessagesStore()

const pendingAgreements = computed(() =>
  missionsStore.missions.filter((m) => m.status === 'pending_agreement'),
)

const totalSpending = computed(() => {
  const confirmed = paymentsStore.payments.filter((p) => p.status === 'confirmed')
  if (confirmed.length === 0) return null
  const total = confirmed.reduce((sum, p) => sum + Number(p.amount), 0)
  const currency = confirmed[0]?.currency || 'USD'
  return `${currency} ${total.toFixed(2)}`
})

const stats = computed(() => [
  {
    label: t('dashboard.activeMissions'),
    value: missionsStore.activeMissions.length,
    icon: 'bi-clipboard-check',
    variant: 'accent',
  },
  {
    label: t('dashboard.pendingAgreements'),
    value: pendingAgreements.value.length,
    icon: 'bi-clock-history',
    variant: 'warning',
  },
  {
    label: t('dashboard.unreadMessages'),
    value: messagesStore.unreadCount,
    icon: 'bi-chat-dots',
    variant: 'info',
  },
  {
    label: t('dashboard.totalSpending'),
    value: totalSpending.value || '—',
    icon: 'bi-wallet2',
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
</script>

<template>
  <div class="ds-client-dashboard">
    <!-- Stats Cards -->
    <div class="ds-client-dashboard__stats">
      <BCard
        v-for="stat in stats"
        :key="stat.label"
        variant="elevated"
        padding="md"
        class="ds-client-dashboard__stat-card"
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

    <!-- Pending Agreements -->
    <BCard
      v-if="pendingAgreements.length > 0"
      variant="bordered"
      padding="none"
      class="ds-client-dashboard__section"
    >
      <template #header>
        <div class="ds-section-header">
          <h2 class="ds-section-header__title">{{ t('dashboard.pendingAgreements') }}</h2>
        </div>
      </template>

      <div class="ds-mission-list">
        <div
          v-for="mission in pendingAgreements"
          :key="mission.id"
          class="ds-mission-row"
        >
          <div class="ds-mission-row__info">
            <span class="ds-mission-row__title">{{ mission.title }}</span>
            <span class="ds-mission-row__meta font-mono">
              {{ mission.currency }} {{ mission.agreedAmount ?? '—' }}
            </span>
          </div>
          <BBadge variant="warning" size="sm">
            {{ statusLabel(mission.status) }}
          </BBadge>
        </div>
      </div>
    </BCard>

    <!-- Active Missions -->
    <BCard variant="bordered" padding="none" class="ds-client-dashboard__section">
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

    <!-- Recent Payments -->
    <BCard variant="bordered" padding="none" class="ds-client-dashboard__section">
      <template #header>
        <div class="ds-section-header">
          <h2 class="ds-section-header__title">{{ t('dashboard.recentPayments') }}</h2>
          <BButton variant="ghost" size="sm" to="/app/payments">
            {{ t('dashboard.viewAll') }}
          </BButton>
        </div>
      </template>

      <div v-if="paymentsStore.payments.length === 0" class="ds-empty-state">
        <i class="bi bi-wallet2 ds-empty-state__icon" />
        <p>{{ t('dashboard.noPayments') }}</p>
      </div>

      <div v-else class="ds-mission-list">
        <div
          v-for="payment in paymentsStore.payments.slice(0, 5)"
          :key="payment.id"
          class="ds-mission-row"
        >
          <div class="ds-mission-row__info">
            <span class="ds-mission-row__title">
              {{ t('dashboard.mission') }} #{{ payment.missionId }}
            </span>
            <span class="ds-mission-row__meta font-mono">
              {{ payment.currency }} {{ payment.amount }}
            </span>
          </div>
          <BBadge
            :variant="payment.status === 'confirmed' ? 'success' : 'warning' as any"
            size="sm"
          >
            {{ statusLabel(payment.status) }}
          </BBadge>
        </div>
      </div>
    </BCard>
  </div>
</template>
