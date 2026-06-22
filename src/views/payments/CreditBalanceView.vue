<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePaymentsStore } from '@/stores/payments'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import BInput from '@/components/base/BInput.vue'
import BAlert from '@/components/base/BAlert.vue'

const { t } = useI18n()
const store = usePaymentsStore()

const purchaseAmount = ref('')
const purchaseSuccess = ref(false)
const purchasing = ref(false)

onMounted(() => {
  store.fetchCreditBalance()
  store.fetchCreditTransactions()
})

function formatAmount(amount: number) {
  return Number(amount).toFixed(2)
}

function transactionTypeBadge(type: string) {
  const map: Record<string, string> = {
    purchase: 'success',
    deduction: 'danger',
    refund: 'info',
    adjustment: 'warning',
  }
  return map[type] || 'default'
}

function transactionTypeLabel(type: string) {
  return t(`payments.credits.types.${type}`, type)
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

async function handlePurchase() {
  const amt = Number(purchaseAmount.value)
  if (!amt || amt <= 0) return
  purchasing.value = true
  try {
    await store.purchaseCredits(amt)
    purchaseSuccess.value = true
    purchaseAmount.value = ''
    store.fetchCreditTransactions()
  } catch { /* handled by store */ } finally {
    purchasing.value = false
  }
}
</script>

<template>
  <div class="ds-credit-balance">
    <div class="ds-credit-balance__header">
      <h1 class="ds-credit-balance__title">{{ t('payments.credits.title') }}</h1>
    </div>

    <p class="ds-credit-balance__subtitle">{{ t('payments.credits.subtitle') }}</p>

    <BAlert v-if="purchaseSuccess" variant="success">
      {{ t('payments.credits.purchased') }}
    </BAlert>

    <BAlert v-if="store.error" variant="danger">
      {{ store.error }}
    </BAlert>

    <!-- Balance Card -->
    <BCard variant="bordered" padding="md" class="ds-credit-balance__balance">
      <div class="ds-credit-balance__balance-content">
        <span class="ds-credit-balance__balance-label">{{ t('payments.credits.balance') }}</span>
        <span class="ds-credit-balance__balance-value">
          {{ store.creditBalance?.currency || 'USD' }}
          {{ formatAmount(store.creditBalance?.balance || 0) }}
        </span>
      </div>
    </BCard>

    <!-- Purchase Form -->
    <BCard variant="bordered" padding="md" class="ds-credit-balance__purchase">
      <h2 class="ds-credit-balance__section-title">{{ t('payments.credits.purchaseTitle') }}</h2>
      <div class="ds-credit-balance__purchase-form">
        <BInput
          v-model="purchaseAmount"
          type="number"
          :placeholder="t('payments.credits.purchaseAmountPlaceholder')"
          class="ds-credit-balance__amount"
        />
        <BButton
          variant="accent"
          :disabled="purchasing || !purchaseAmount"
          class="ds-credit-balance__purchase-btn"
          @click="handlePurchase"
        >
          {{ purchasing ? t('payments.credits.purchasing') : t('payments.credits.purchaseButton') }}
        </BButton>
      </div>
    </BCard>

    <!-- Transaction History -->
    <BCard variant="bordered" padding="md" class="ds-credit-balance__transactions">
      <h2 class="ds-credit-balance__section-title">{{ t('payments.credits.transactionsTitle') }}</h2>

      <div v-if="store.creditTransactions.length === 0" class="ds-credit-balance__empty">
        <i class="bi bi-receipt ds-credit-balance__empty-icon" />
        <p>{{ t('payments.credits.noTransactions') }}</p>
      </div>

      <div v-else class="ds-credit-transaction-list">
        <div class="ds-credit-transaction-list__header">
          <span class="ds-credit-transaction-list__th">{{ t('payments.credits.columns.type') }}</span>
          <span class="ds-credit-transaction-list__th">{{ t('payments.credits.columns.amount') }}</span>
          <span class="ds-credit-transaction-list__th">{{ t('payments.credits.columns.description') }}</span>
          <span class="ds-credit-transaction-list__th">{{ t('payments.credits.columns.date') }}</span>
        </div>
        <div
          v-for="tx in store.creditTransactions"
          :key="tx.id"
          class="ds-credit-transaction-list__row"
        >
          <span class="ds-credit-transaction-list__td">
            <BBadge :variant="transactionTypeBadge(tx.type) as any" size="sm">
              {{ transactionTypeLabel(tx.type) }}
            </BBadge>
          </span>
          <span class="ds-credit-transaction-list__td font-mono">
            {{ formatAmount(tx.amount) }}
          </span>
          <span class="ds-credit-transaction-list__td">
            {{ tx.description }}
          </span>
          <span class="ds-credit-transaction-list__td font-mono">
            {{ formatDate(tx.createdAt) }}
          </span>
        </div>
      </div>
    </BCard>
  </div>
</template>

<style scoped>
.ds-credit-balance {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
}

.ds-credit-balance__header {
  display: flex;
  align-items: center;
}

.ds-credit-balance__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-credit-balance__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-credit-balance__section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0 0 1rem;
}

.ds-credit-balance__balance-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
}

.ds-credit-balance__balance-label {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-credit-balance__balance-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ds-accent, #6366f1);
}

.ds-credit-balance__purchase-form {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.ds-credit-balance__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
  color: var(--ds-text-muted, #64748b);
}

.ds-credit-balance__empty-icon {
  font-size: 2rem;
}

.ds-credit-transaction-list {
  overflow-x: auto;
}

.ds-credit-transaction-list__header {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--ds-border, #334155);
}

.ds-credit-transaction-list__th {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-credit-transaction-list__row {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--ds-border, #334155);
  align-items: center;
}

.ds-credit-transaction-list__row:last-child {
  border-bottom: none;
}

.ds-credit-transaction-list__td {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
}

@media (max-width: 768px) {
  .ds-credit-transaction-list__header {
    display: none;
  }

  .ds-credit-transaction-list__row {
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
  }
}
</style>
