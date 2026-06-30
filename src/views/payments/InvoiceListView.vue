<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePaymentsStore } from '@/stores/payments'
import { formatDate } from '@/utils/formatters'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'

const { t } = useI18n()
const store = usePaymentsStore()

onMounted(() => {
  store.fetchInvoices()
})

function statusBadgeVariant(status: string) {
  const map: Record<string, string> = {
    paid: 'success',
    sent: 'info',
    draft: 'default',
  }
  return map[status] || 'default'
}

function formatPeriod(start: string, end: string) {
  return `${formatDate(start)} — ${formatDate(end)}`
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${Number(amount).toFixed(2)}`
}
</script>

<template>
  <div class="ds-invoice-list">
    <div class="ds-invoice-list__header">
      <h1 class="ds-invoice-list__title">{{ t('payments.invoices.title') }}</h1>
    </div>

    <p class="ds-invoice-list__subtitle">{{ t('payments.invoices.subtitle') }}</p>

    <!-- Loading -->
    <div v-if="store.loading" class="ds-invoice-list__loading">
      <div class="spinner-border" role="status" />
    </div>

    <!-- Empty State -->
    <div v-else-if="store.invoices.length === 0" class="ds-invoice-list__empty">
      <i class="bi bi-receipt ds-invoice-list__empty-icon" />
      <p class="ds-invoice-list__empty-title">{{ t('payments.invoices.noInvoices') }}</p>
    </div>

    <!-- Invoices Table -->
    <BCard v-else variant="bordered" padding="none" class="ds-invoice-list__table-card">
      <div class="ds-invoice-table">
        <div class="ds-invoice-table__header">
          <span class="ds-invoice-table__th">{{ t('payments.invoices.columns.period') }}</span>
          <span class="ds-invoice-table__th">{{ t('payments.invoices.columns.totalFees') }}</span>
          <span class="ds-invoice-table__th">{{ t('payments.invoices.columns.status') }}</span>
          <span class="ds-invoice-table__th">{{ t('payments.invoices.columns.paidAt') }}</span>
        </div>

        <div
          v-for="invoice in store.invoices"
          :key="invoice.id"
          class="ds-invoice-table__row"
        >
          <span class="ds-invoice-table__td">
            {{ formatPeriod(invoice.periodStart, invoice.periodEnd) }}
          </span>
          <span class="ds-invoice-table__td font-mono">
            {{ formatAmount(invoice.totalFees, invoice.currency) }}
          </span>
          <span class="ds-invoice-table__td">
            <BBadge :variant="statusBadgeVariant(invoice.status) as any" size="sm">
              {{ t(`payments.invoices.status.${invoice.status}`, invoice.status) }}
            </BBadge>
          </span>
          <span class="ds-invoice-table__td font-mono">
            {{ formatDate(invoice.paidAt) }}
          </span>
        </div>
      </div>
    </BCard>
  </div>
</template>

<style scoped>
.ds-invoice-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ds-invoice-list__header {
  display: flex;
  align-items: center;
}

.ds-invoice-list__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-invoice-list__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-invoice-list__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-invoice-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  text-align: center;
}

.ds-invoice-list__empty-icon {
  font-size: 3rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-invoice-list__empty-title {
  font-size: 1rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-invoice-list__table-card {
  overflow: hidden;
}

.ds-invoice-table {
  overflow-x: auto;
}

.ds-invoice-table__header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  background: var(--ds-bg-elevated, #1e293b);
}

.ds-invoice-table__th {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-invoice-table__row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  align-items: center;
  transition: background 0.15s ease;
}

.ds-invoice-table__row:last-child {
  border-bottom: none;
}

.ds-invoice-table__row:hover {
  background: var(--ds-bg-hover, rgba(99, 102, 241, 0.05));
}

.ds-invoice-table__td {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
}

@media (max-width: 768px) {
  .ds-invoice-table__header {
    display: none;
  }

  .ds-invoice-table__row {
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
  }
}
</style>
