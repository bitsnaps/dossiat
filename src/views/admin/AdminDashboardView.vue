<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '@/stores/admin'

const { t } = useI18n()
const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchStats()
})

const statCards = [
  { key: 'totalUsers', icon: 'bi-people', color: '#4f46e5' },
  { key: 'totalMissions', icon: 'bi-clipboard-check', color: '#059669' },
  { key: 'totalDisputes', icon: 'bi-flag', color: '#d97706' },
  { key: 'openDisputes', icon: 'bi-exclamation-triangle', color: '#dc2626' },
  { key: 'totalRevenue', icon: 'bi-currency-dollar', color: '#7c3aed', format: 'currency' },
]
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
  </div>
</template>
