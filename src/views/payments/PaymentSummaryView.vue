<script lang="ts" setup>
import { onMounted, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePaymentsStore } from '@/stores/payments'
import { formatDate } from '@/utils/formatters'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const { t } = useI18n()
const store = usePaymentsStore()

const activeFilter = ref<string>('all')

onMounted(() => {
  store.fetchAllPayments()
})

const filteredPayments = computed(() => {
  if (activeFilter.value === 'all') return store.payments
  if (activeFilter.value === 'sent') return store.payments.filter((p) => p.status === 'confirmed')
  if (activeFilter.value === 'received') return store.payments.filter((p) => p.status === 'confirmed')
  if (activeFilter.value === 'pending') return store.payments.filter((p) => p.status === 'pending')
  if (activeFilter.value === 'confirmed') return store.payments.filter((p) => p.status === 'confirmed')
  return store.payments
})

const totalSent = computed(() =>
  store.payments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount), 0),
)

const totalReceived = computed(() =>
  store.payments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount), 0),
)

const pendingCount = computed(() =>
  store.payments.filter((p) => p.status === 'pending').length,
)

function statusBadgeVariant(status: string) {
  const map: Record<string, string> = {
    confirmed: 'success',
    pending: 'warning',
    failed: 'danger',
  }
  return map[status] || 'default'
}

function methodLabel(method: string) {
  return t(`payments.methods.${method}`, method)
}

function statusLabel(status: string) {
  return t(`payments.status.${status}`, status)
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${Number(amount).toFixed(2)}`
}
</script>

<template>
  <div class="ds-payment-summary">
    <div class="ds-payment-summary__header">
      <h1 class="ds-payment-summary__title">{{ t('payments.summary.title') }}</h1>
      <BButton variant="accent" to="/app/payments/record" icon="bi-plus-circle" class="ds-payment-summary__record-btn">
        {{ t('payments.record.title') }}
      </BButton>
    </div>

    <p class="ds-payment-summary__subtitle">{{ t('payments.summary.subtitle') }}</p>

    <!-- Stat Cards — Skeleton -->
    <div v-if="store.loading" class="ds-payment-summary__stats">
      <BCard v-for="i in 3" :key="i" variant="bordered" padding="sm">
        <div class="ds-payment-summary__stat">
          <SkeletonLoader variant="text" width="60%" height="10px" />
          <SkeletonLoader variant="text" width="40%" height="18px" />
        </div>
      </BCard>
    </div>

    <!-- Stat Cards -->
    <div v-else class="ds-payment-summary__stats">
      <BCard variant="bordered" padding="sm" class="ds-payment-summary__stat">
        <span class="ds-payment-summary__stat-label">{{ t('payments.summary.totalSent') }}</span>
        <span class="ds-payment-summary__stat-value">{{ formatAmount(totalSent, 'USD') }}</span>
      </BCard>
      <BCard variant="bordered" padding="sm" class="ds-payment-summary__stat">
        <span class="ds-payment-summary__stat-label">{{ t('payments.summary.totalReceived') }}</span>
        <span class="ds-payment-summary__stat-value">{{ formatAmount(totalReceived, 'USD') }}</span>
      </BCard>
      <BCard variant="bordered" padding="sm" class="ds-payment-summary__stat">
        <span class="ds-payment-summary__stat-label">{{ t('payments.summary.pendingCount') }}</span>
        <span class="ds-payment-summary__stat-value">{{ pendingCount }}</span>
      </BCard>
    </div>

    <!-- Filters -->
    <BCard variant="bordered" padding="sm" class="ds-payment-summary__filters">
      <div class="ds-payment-summary__filter-row">
        <button
          v-for="filter in ['all', 'sent', 'received', 'pending', 'confirmed']"
          :key="filter"
          class="ds-payment-summary__filter"
          :class="{ 'ds-payment-summary__filter--active': activeFilter === filter }"
          @click="activeFilter = filter"
        >
          {{ t(`payments.summary.filters.${filter}`) }}
        </button>
      </div>
    </BCard>

    <!-- Loading -->
    <div v-if="store.loading" class="ds-payment-summary__loading">
      <div class="spinner-border" role="status" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPayments.length === 0" class="ds-payment-summary__empty">
      <i class="bi bi-credit-card ds-payment-summary__empty-icon" />
      <p class="ds-payment-summary__empty-title">{{ t('payments.summary.noPayments') }}</p>
      <p class="ds-payment-summary__empty-hint">{{ t('payments.summary.noPaymentsHint') }}</p>
    </div>

    <!-- Payments Table -->
    <BCard v-else variant="bordered" padding="none" class="ds-payment-summary__table-card">
      <div class="ds-payment-table">
        <div class="ds-payment-table__header">
          <span class="ds-payment-table__th">{{ t('payments.summary.columns.status') }}</span>
          <span class="ds-payment-table__th">{{ t('payments.summary.columns.amount') }}</span>
          <span class="ds-payment-table__th">{{ t('payments.summary.columns.method') }}</span>
          <span class="ds-payment-table__th">{{ t('payments.summary.columns.mission') }}</span>
          <span class="ds-payment-table__th">{{ t('payments.summary.columns.date') }}</span>
          <span class="ds-payment-table__th">{{ t('payments.summary.columns.actions') }}</span>
        </div>

        <div
          v-for="payment in filteredPayments"
          :key="payment.id"
          class="ds-payment-table__row"
        >
          <span class="ds-payment-table__td">
            <BBadge :variant="statusBadgeVariant(payment.status) as any" size="sm">
              {{ statusLabel(payment.status) }}
            </BBadge>
          </span>
          <span class="ds-payment-table__td font-mono">
            {{ formatAmount(payment.amount, payment.currency) }}
          </span>
          <span class="ds-payment-table__td">
            {{ methodLabel(payment.method) }}
          </span>
          <span class="ds-payment-table__td">
            {{ payment.mission?.title || '—' }}
          </span>
          <span class="ds-payment-table__td font-mono">
            {{ formatDate(payment.createdAt) }}
          </span>
          <span class="ds-payment-table__td">
            <BButton
              v-if="payment.status === 'pending'"
              variant="ghost"
              size="sm"
              :to="`/app/payments/${payment.id}/confirm`"
            >
              {{ t('payments.confirm.title') }}
            </BButton>
          </span>
        </div>
      </div>
    </BCard>
  </div>
</template>

<style scoped>
.ds-payment-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ds-payment-summary__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ds-payment-summary__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-payment-summary__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-payment-summary__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.ds-payment-summary__stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ds-payment-summary__stat-label {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-payment-summary__stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
}

.ds-payment-summary__filter-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ds-payment-summary__filter {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--ds-border, #334155);
  background: transparent;
  color: var(--ds-text-muted, #64748b);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ds-payment-summary__filter:hover {
  border-color: var(--ds-accent, #6366f1);
  color: var(--ds-text, #f1f5f9);
}

.ds-payment-summary__filter--active {
  background: var(--ds-accent, #6366f1);
  border-color: var(--ds-accent, #6366f1);
  color: white;
}

.ds-payment-summary__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-payment-summary__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  text-align: center;
}

.ds-payment-summary__empty-icon {
  font-size: 3rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-payment-summary__empty-title {
  font-size: 1rem;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-payment-summary__empty-hint {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-payment-summary__table-card {
  overflow: hidden;
}

.ds-payment-table {
  overflow-x: auto;
}

.ds-payment-table__header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.5fr 1fr 0.75fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  background: var(--ds-bg-elevated, #1e293b);
}

.ds-payment-table__th {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-payment-table__row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.5fr 1fr 0.75fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  align-items: center;
  transition: background 0.15s ease;
}

.ds-payment-table__row:last-child {
  border-bottom: none;
}

.ds-payment-table__row:hover {
  background: var(--ds-bg-hover, rgba(99, 102, 241, 0.05));
}

.ds-payment-table__td {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
}

@media (max-width: 768px) {
  .ds-payment-summary__stats {
    grid-template-columns: 1fr;
  }

  .ds-payment-table__header {
    display: none;
  }

  .ds-payment-table__row {
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
  }
}
</style>
