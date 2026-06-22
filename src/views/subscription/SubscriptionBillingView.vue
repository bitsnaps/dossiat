<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'

const { t } = useI18n()
const store = useSubscriptionsStore()

onMounted(() => {
  store.fetchInvoices()
})

function statusBadgeVariant(status: string) {
  const map: Record<string, string> = {
    paid: 'success',
    pending: 'warning',
    failed: 'danger',
  }
  return map[status] || 'default'
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${Number(amount).toFixed(2)}`
}
</script>

<template>
  <div class="ds-subscription-billing">
    <div class="ds-subscription-billing__header">
      <h1 class="ds-subscription-billing__title">{{ t('subscriptions.billing.title') }}</h1>
    </div>

    <p class="ds-subscription-billing__subtitle">{{ t('subscriptions.billing.subtitle') }}</p>

    <!-- Loading -->
    <div v-if="store.loading" class="ds-subscription-billing__loading">
      <div class="spinner-border" role="status" />
    </div>

    <!-- Empty State -->
    <div v-else-if="store.invoices.length === 0" class="ds-subscription-billing__empty">
      <i class="bi bi-receipt ds-subscription-billing__empty-icon" />
      <p class="ds-subscription-billing__empty-title">{{ t('subscriptions.billing.noInvoices') }}</p>
      <p class="ds-subscription-billing__empty-hint">{{ t('subscriptions.billing.noInvoicesHint') }}</p>
    </div>

    <!-- Invoices Table -->
    <BCard v-else variant="bordered" padding="none" class="ds-subscription-billing__table-card">
      <div class="ds-subscription-billing__table">
        <div class="ds-subscription-billing__table-header">
          <span class="ds-subscription-billing__th">{{ t('subscriptions.billing.columns.date') }}</span>
          <span class="ds-subscription-billing__th">{{ t('subscriptions.billing.columns.amount') }}</span>
          <span class="ds-subscription-billing__th">{{ t('subscriptions.billing.columns.status') }}</span>
          <span class="ds-subscription-billing__th">{{ t('subscriptions.billing.columns.paidAt') }}</span>
        </div>

        <div
          v-for="invoice in store.invoices"
          :key="invoice.id"
          class="ds-subscription-billing__row"
        >
          <span class="ds-subscription-billing__td">
            {{ formatDate(invoice.createdAt) }}
          </span>
          <span class="ds-subscription-billing__td font-mono">
            {{ formatAmount(invoice.amount, invoice.currency) }}
          </span>
          <span class="ds-subscription-billing__td">
            <BBadge :variant="statusBadgeVariant(invoice.status) as any" size="sm">
              {{ t(`subscriptions.billing.status.${invoice.status}`, invoice.status) }}
            </BBadge>
          </span>
          <span class="ds-subscription-billing__td font-mono">
            {{ formatDate(invoice.paidAt) }}
          </span>
        </div>
      </div>
    </BCard>

    <BButton variant="ghost" to="/app/subscriptions/manage" class="ds-subscription-billing__back">
      {{ t('subscriptions.billing.backToManage') }}
    </BButton>
  </div>
</template>

<style scoped>
.ds-subscription-billing {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ds-subscription-billing__header {
  display: flex;
  align-items: center;
}

.ds-subscription-billing__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-subscription-billing__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-subscription-billing__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-subscription-billing__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  text-align: center;
}

.ds-subscription-billing__empty-icon {
  font-size: 3rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-subscription-billing__empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-subscription-billing__empty-hint {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-subscription-billing__table-card {
  overflow: hidden;
}

.ds-subscription-billing__table {
  overflow-x: auto;
}

.ds-subscription-billing__table-header {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  background: var(--ds-bg-elevated, #1e293b);
}

.ds-subscription-billing__th {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-subscription-billing__row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  align-items: center;
  transition: background 0.15s ease;
}

.ds-subscription-billing__row:last-child {
  border-bottom: none;
}

.ds-subscription-billing__row:hover {
  background: var(--ds-bg-hover, rgba(99, 102, 241, 0.05));
}

.ds-subscription-billing__td {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
}

.ds-subscription-billing__back {
  align-self: flex-start;
}

@media (max-width: 768px) {
  .ds-subscription-billing__table-header {
    display: none;
  }

  .ds-subscription-billing__row {
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
  }
}
</style>
