<script lang="ts" setup>
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMissionsStore } from '@/stores/missions'
import { useAuthStore } from '@/stores/auth'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'

const { t } = useI18n()
const missionsStore = useMissionsStore()
const authStore = useAuthStore()

onMounted(() => {
  missionsStore.fetchMissions()
})

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

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatPricingType(type: string) {
  const map: Record<string, string> = {
    fixed: t('missions.detail.fixed'),
    hourly: t('missions.detail.hourly'),
    task_based: t('missions.detail.taskBased'),
  }
  return map[type] || type
}

function counterpartyName(mission: any) {
  if (authStore.hasRole('agent')) {
    return mission.client ? `${mission.client.firstName} ${mission.client.lastName}` : '—'
  }
  return mission.agent ? `${mission.agent.firstName} ${mission.agent.lastName}` : '—'
}
</script>

<template>
  <div class="ds-mission-list-view">
    <div class="ds-mission-list-view__header">
      <h1 class="ds-mission-list-view__title">{{ t('missions.list.title') }}</h1>
      <BButton v-if="authStore.hasRole('agent')" variant="accent" to="/app/missions/create" icon="bi-plus-circle">
        {{ t('missions.list.create') }}
      </BButton>
    </div>

    <!-- Filters -->
    <BCard variant="bordered" padding="sm" class="ds-mission-list-view__filters">
      <div class="ds-mission-list-view__filter-row">
        <div class="ds-mission-list-view__filter">
          <label class="ds-mission-list-view__filter-label">{{ t('missions.list.filters.status') }}</label>
          <select
            class="ds-mission-list-view__select"
            :value="missionsStore.filters.status || ''"
            @change="missionsStore.setFilter('status', ($event.target as HTMLSelectElement).value || undefined)"
          >
            <option value="">{{ t('missions.list.filters.allStatuses') }}</option>
            <option value="draft">{{ t('missions.status.draft') }}</option>
            <option value="pending_agreement">{{ t('missions.status.pending_agreement') }}</option>
            <option value="agreed">{{ t('missions.status.agreed') }}</option>
            <option value="in_progress">{{ t('missions.status.in_progress') }}</option>
            <option value="completed">{{ t('missions.status.completed') }}</option>
            <option value="disputed">{{ t('missions.status.disputed') }}</option>
            <option value="cancelled">{{ t('missions.status.cancelled') }}</option>
          </select>
        </div>

        <div class="ds-mission-list-view__filter">
          <label class="ds-mission-list-view__filter-label">{{ t('missions.list.filters.type') }}</label>
          <select
            class="ds-mission-list-view__select"
            :value="missionsStore.filters.type || ''"
            @change="missionsStore.setFilter('type', ($event.target as HTMLSelectElement).value || undefined)"
          >
            <option value="">{{ t('missions.list.filters.allTypes') }}</option>
            <option value="one_time">{{ t('missions.list.filters.oneTime') }}</option>
            <option value="recurrent">{{ t('missions.list.filters.recurrent') }}</option>
          </select>
        </div>

        <BButton
          v-if="missionsStore.filters.status || missionsStore.filters.type"
          variant="ghost"
          size="sm"
          @click="missionsStore.clearFilters(); missionsStore.fetchMissions()"
        >
          {{ t('missions.list.filters.clear') }}
        </BButton>
      </div>
    </BCard>

    <!-- Loading -->
    <div v-if="missionsStore.loading" class="ds-mission-list-view__loading">
      <div class="spinner-border" role="status" />
    </div>

    <!-- Empty State -->
    <div v-else-if="missionsStore.missions.length === 0" class="ds-mission-list-view__empty">
      <i class="bi bi-clipboard ds-mission-list-view__empty-icon" />
      <p class="ds-mission-list-view__empty-title">{{ t('missions.list.noResults') }}</p>
      <p class="ds-mission-list-view__empty-hint">{{ t('missions.list.noResultsHint') }}</p>
      <BButton v-if="authStore.hasRole('agent')" variant="accent" to="/app/missions/create">
        {{ t('missions.list.create') }}
      </BButton>
    </div>

    <!-- Mission Table -->
    <BCard v-else variant="bordered" padding="none" class="ds-mission-list-view__table-card">
      <div class="ds-mission-table">
        <div class="ds-mission-table__header">
          <span class="ds-mission-table__th ds-mission-table__th--title">{{ t('missions.list.columns.title') }}</span>
          <span class="ds-mission-table__th">{{ t('missions.list.columns.status') }}</span>
          <span class="ds-mission-table__th">{{ t('missions.list.columns.pricing') }}</span>
          <span class="ds-mission-table__th">{{ t('missions.list.columns.amount') }}</span>
          <span class="ds-mission-table__th">{{ t('missions.list.columns.counterparty') }}</span>
          <span class="ds-mission-table__th">{{ t('missions.list.columns.created') }}</span>
          <span class="ds-mission-table__th">{{ t('missions.list.columns.actions') }}</span>
        </div>

        <div
          v-for="mission in missionsStore.filteredMissions"
          :key="mission.id"
          class="ds-mission-table__row"
        >
          <span class="ds-mission-table__td ds-mission-table__td--title">
            <RouterLink :to="`/app/missions/${mission.id}`" class="ds-mission-table__link">
              {{ mission.title }}
            </RouterLink>
          </span>
          <span class="ds-mission-table__td">
            <BBadge :variant="statusBadgeVariant(mission.status) as any" size="sm">
              {{ statusLabel(mission.status) }}
            </BBadge>
          </span>
          <span class="ds-mission-table__td font-mono">
            {{ formatPricingType(mission.pricingType) }}
          </span>
          <span class="ds-mission-table__td font-mono">
            {{ mission.currency && mission.agreedAmount ? `${mission.currency} ${mission.agreedAmount}` : '—' }}
          </span>
          <span class="ds-mission-table__td">
            {{ counterpartyName(mission) }}
          </span>
          <span class="ds-mission-table__td font-mono">
            {{ formatDate(mission.createdAt) }}
          </span>
          <span class="ds-mission-table__td">
            <BButton variant="ghost" size="sm" :to="`/app/missions/${mission.id}`">
              {{ t('missions.list.view') }}
            </BButton>
          </span>
        </div>
      </div>
    </BCard>
  </div>
</template>

<style scoped>
.ds-mission-list-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ds-mission-list-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ds-mission-list-view__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-mission-list-view__filters {
  flex-shrink: 0;
}

.ds-mission-list-view__filter-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.ds-mission-list-view__filter {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.ds-mission-list-view__filter-label {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-list-view__select {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--ds-border, #334155);
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-text, #f1f5f9);
  font-size: 0.8125rem;
  min-width: 10rem;
}

.ds-mission-list-view__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-mission-list-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  text-align: center;
}

.ds-mission-list-view__empty-icon {
  font-size: 3rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-list-view__empty-title {
  font-size: 1rem;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-mission-list-view__empty-hint {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-mission-list-view__table-card {
  overflow: hidden;
}

.ds-mission-table {
  overflow-x: auto;
}

.ds-mission-table__header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 0.75fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  background: var(--ds-bg-elevated, #1e293b);
}

.ds-mission-table__th {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-mission-table__row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 0.75fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  align-items: center;
  transition: background 0.15s ease;
}

.ds-mission-table__row:last-child {
  border-bottom: none;
}

.ds-mission-table__row:hover {
  background: var(--ds-bg-hover, rgba(99, 102, 241, 0.05));
}

.ds-mission-table__td {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
}

.ds-mission-table__td--title {
  font-weight: 500;
}

.ds-mission-table__link {
  color: var(--ds-text, #f1f5f9);
  text-decoration: none;
  transition: color 0.15s ease;
}

.ds-mission-table__link:hover {
  color: var(--ds-accent, #6366f1);
}

@media (max-width: 768px) {
  .ds-mission-table__header {
    display: none;
  }

  .ds-mission-table__row {
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
  }

  .ds-mission-table__td--title {
    grid-column: 1 / -1;
  }
}
</style>
