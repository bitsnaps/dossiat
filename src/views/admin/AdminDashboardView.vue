<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '@/stores/admin'

const { t } = useI18n()
const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchStats()
  adminStore.fetchActivityFeed()
})

const statCards = [
  { key: 'totalUsers', icon: 'bi-people', color: '#4f46e5' },
  { key: 'totalMissions', icon: 'bi-clipboard-check', color: '#059669' },
  { key: 'totalDisputes', icon: 'bi-flag', color: '#d97706' },
  { key: 'openDisputes', icon: 'bi-exclamation-triangle', color: '#dc2626' },
  { key: 'totalRevenue', icon: 'bi-currency-dollar', color: '#7c3aed', format: 'currency' },
]

const activityIcon: Record<string, string> = {
  mission_created: 'bi-clipboard-plus',
  mission_completed: 'bi-clipboard-check',
  payment_confirmed: 'bi-cash-coin',
  dispute_opened: 'bi-flag',
  dispute_resolved: 'bi-check-circle',
  user_registered: 'bi-person-plus',
}

function activityIconFor(type: string) {
  return activityIcon[type] || 'bi-activity'
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('admin.dashboard.justNow')
  if (mins < 60) return t('admin.dashboard.minutesAgo', { n: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('admin.dashboard.hoursAgo', { n: hours })
  const days = Math.floor(hours / 24)
  return t('admin.dashboard.daysAgo', { n: days })
}

const hasActivity = computed(() => (adminStore.activityFeed || []).length > 0)
</script>

<template>
  <div class="ds-admin-dashboard">
    <div class="ds-admin-dashboard__header">
      <h1 class="ds-admin-dashboard__title">{{ t('admin.dashboard.title') }}</h1>
      <p class="ds-admin-dashboard__subtitle">{{ t('admin.dashboard.subtitle', { date: new Date().toLocaleDateString() }) }}</p>
    </div>

    <div v-if="adminStore.loading.stats" class="ds-admin-dashboard__loading">
      <span class="ds-spinner" />
    </div>

    <div v-else class="ds-admin-dashboard__stats">
      <div
        v-for="card in statCards"
        :key="card.key"
        class="ds-admin-dashboard__stat-card"
      >
        <div class="ds-admin-dashboard__stat-icon" :style="{ backgroundColor: card.color + '20', color: card.color }">
          <i :class="['bi', card.icon]" />
        </div>
        <div class="ds-admin-dashboard__stat-content">
          <div class="ds-admin-dashboard__stat-value">
            {{ card.format === 'currency' ? `$${Number(adminStore.stats?.[card.key as keyof typeof adminStore.stats] || 0).toLocaleString() }` : (adminStore.stats?.[card.key as keyof typeof adminStore.stats] || 0) }}
          </div>
          <div class="ds-admin-dashboard__stat-label">{{ t(`admin.dashboard.${card.key}`) }}</div>
        </div>
      </div>
    </div>

    <div class="ds-admin-dashboard__activity">
      <h2 class="ds-admin-dashboard__section-title">{{ t('admin.dashboard.recentActivity') }}</h2>

      <div v-if="adminStore.loading.activityFeed" class="ds-admin-dashboard__loading">
        <span class="ds-spinner" />
      </div>

      <div v-else-if="hasActivity" class="ds-admin-dashboard__activity-list">
        <div
          v-for="item in adminStore.activityFeed"
          :key="item.id"
          class="ds-admin-dashboard__activity-item"
        >
          <div class="ds-admin-dashboard__activity-icon">
            <i :class="['bi', activityIconFor(item.type)]" />
          </div>
          <div class="ds-admin-dashboard__activity-body">
            <div class="ds-admin-dashboard__activity-summary">{{ item.summary }}</div>
            <div class="ds-admin-dashboard__activity-meta">
              <span v-if="item.actor" class="ds-admin-dashboard__activity-actor">
                {{ item.actor.firstName }} {{ item.actor.lastName }}
              </span>
              <span class="ds-admin-dashboard__activity-time">{{ relativeTime(item.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="ds-admin-dashboard__activity-empty">
        {{ t('admin.dashboard.noActivity') }}
      </div>
    </div>
  </div>
</template>
