<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePaymentsStore } from '@/stores/payments'
import { useAuthStore } from '@/stores/auth'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import BAlert from '@/components/base/BAlert.vue'

const { t } = useI18n()
const route = useRoute()
const store = usePaymentsStore()
const authStore = useAuthStore()

onMounted(() => {
  const missionId = String(store.payments[0]?.missionId || route.params.id)
  if (missionId) store.fetchPayments(missionId)
})

const payment = computed(() => {
  const id = Number(route.params.id)
  return store.payments.find((p) => p.id === id) || store.payments[0]
})

const isPayer = computed(() => payment.value && authStore.user?.id === payment.value.payerId)
const isPayee = computed(() => payment.value && authStore.user?.id === payment.value.payeeId)

const confirmationStatus = computed(() => {
  if (!payment.value) return 'pending'
  if (payment.value.confirmedByPayer && payment.value.confirmedByPayee) return 'confirmed'
  if (!payment.value.confirmedByPayer && !payment.value.confirmedByPayee) return 'awaitingBoth'
  if (!payment.value.confirmedByPayer) return 'awaitingPayer'
  return 'awaitingPayee'
})

function statusBadgeVariant(status: string) {
  const map: Record<string, string> = {
    confirmed: 'success',
    pending: 'warning',
    awaitingBoth: 'warning',
    awaitingPayer: 'info',
    awaitingPayee: 'info',
  }
  return map[status] || 'default'
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatAmount(amount: number | undefined, currency: string | undefined) {
  if (!amount) return '—'
  return `${currency || ''} ${Number(amount).toFixed(2)}`
}

async function handleConfirmPayer() {
  if (!payment.value) return
  try {
    await store.confirmPayer(String(payment.value.id))
  } catch { /* handled by store */ }
}

async function handleConfirmPayee() {
  if (!payment.value) return
  try {
    await store.confirmPayee(String(payment.value.id))
  } catch { /* handled by store */ }
}
</script>

<template>
  <div class="ds-payment-confirm">
    <div class="ds-payment-confirm__header">
      <h1 class="ds-payment-confirm__title">{{ t('payments.confirm.title') }}</h1>
    </div>

    <p class="ds-payment-confirm__subtitle">{{ t('payments.confirm.subtitle') }}</p>

    <BAlert v-if="store.error" variant="danger">
      {{ store.error }}
    </BAlert>

    <div v-if="payment" class="ds-payment-confirm__content">
      <!-- Status Banner -->
      <div class="ds-payment-confirm__status">
        <BBadge :variant="statusBadgeVariant(confirmationStatus) as any" size="md">
          {{ t(`payments.confirm.status.${confirmationStatus}`) }}
        </BBadge>
      </div>

      <!-- Payment Details -->
      <BCard variant="bordered" padding="md" class="ds-payment-confirm__details">
        <div class="ds-payment-confirm__detail-grid">
          <div class="ds-payment-confirm__detail">
            <span class="ds-payment-confirm__detail-label">{{ t('payments.confirm.details.amount') }}</span>
            <span class="ds-payment-confirm__detail-value font-mono">{{ formatAmount(payment.amount, payment.currency) }}</span>
          </div>
          <div class="ds-payment-confirm__detail">
            <span class="ds-payment-confirm__detail-label">{{ t('payments.confirm.details.method') }}</span>
            <span class="ds-payment-confirm__detail-value">{{ t(`payments.methods.${payment.method}`, payment.method) }}</span>
          </div>
          <div class="ds-payment-confirm__detail">
            <span class="ds-payment-confirm__detail-label">{{ t('payments.confirm.details.date') }}</span>
            <span class="ds-payment-confirm__detail-value font-mono">{{ formatDate(payment.createdAt) }}</span>
          </div>
          <div class="ds-payment-confirm__detail">
            <span class="ds-payment-confirm__detail-label">{{ t('payments.confirm.details.mission') }}</span>
            <span class="ds-payment-confirm__detail-value">{{ payment.mission?.title || '—' }}</span>
          </div>
          <div v-if="payment.platformFee" class="ds-payment-confirm__detail">
            <span class="ds-payment-confirm__detail-label">{{ t('payments.confirm.details.platformFee') }}</span>
            <span class="ds-payment-confirm__detail-value font-mono">{{ formatAmount(payment.platformFee, payment.currency) }}</span>
          </div>
          <div v-if="payment.netAmount" class="ds-payment-confirm__detail">
            <span class="ds-payment-confirm__detail-label">{{ t('payments.confirm.details.netAmount') }}</span>
            <span class="ds-payment-confirm__detail-value font-mono">{{ formatAmount(payment.netAmount, payment.currency) }}</span>
          </div>
        </div>
      </BCard>

      <!-- Confirmation Toggles -->
      <div class="ds-payment-confirm__toggles">
        <!-- Payer Confirmation -->
        <BCard variant="bordered" padding="md" class="ds-payment-confirm__payer">
          <div class="ds-payment-confirm__toggle-row">
            <div>
              <p class="ds-payment-confirm__toggle-label">{{ t('payments.confirm.details.payerConfirmation') }}</p>
              <BBadge
                :variant="(payment.confirmedByPayer ? 'success' : 'warning') as any"
                size="sm"
              >
                {{ payment.confirmedByPayer ? t('payments.confirm.confirmed') : t('payments.confirm.pending') }}
              </BBadge>
            </div>
            <BButton
              v-if="isPayer && !payment.confirmedByPayer"
              variant="accent"
              size="sm"
              class="ds-payment-confirm__payer-btn"
              @click="handleConfirmPayer"
            >
              {{ t('payments.confirm.payerConfirm') }}
            </BButton>
          </div>
        </BCard>

        <!-- Payee Confirmation -->
        <BCard variant="bordered" padding="md" class="ds-payment-confirm__payee">
          <div class="ds-payment-confirm__toggle-row">
            <div>
              <p class="ds-payment-confirm__toggle-label">{{ t('payments.confirm.details.payeeConfirmation') }}</p>
              <BBadge
                :variant="(payment.confirmedByPayee ? 'success' : 'warning') as any"
                size="sm"
              >
                {{ payment.confirmedByPayee ? t('payments.confirm.confirmed') : t('payments.confirm.pending') }}
              </BBadge>
            </div>
            <BButton
              v-if="isPayee && !payment.confirmedByPayee"
              variant="accent"
              size="sm"
              class="ds-payment-confirm__payee-btn"
              @click="handleConfirmPayee"
            >
              {{ t('payments.confirm.payeeConfirm') }}
            </BButton>
          </div>
        </BCard>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!store.loading" class="ds-payment-confirm__empty">
      <p>Payment not found.</p>
    </div>
  </div>
</template>

<style scoped>
.ds-payment-confirm {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 720px;
}

.ds-payment-confirm__header {
  display: flex;
  align-items: center;
}

.ds-payment-confirm__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-payment-confirm__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-payment-confirm__status {
  display: flex;
  justify-content: center;
}

.ds-payment-confirm__content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ds-payment-confirm__detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.ds-payment-confirm__detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ds-payment-confirm__detail-label {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-payment-confirm__detail-value {
  font-size: 0.9375rem;
  color: var(--ds-text, #f1f5f9);
}

.ds-payment-confirm__toggles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.ds-payment-confirm__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ds-payment-confirm__toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
  margin: 0 0 0.375rem;
}

.ds-payment-confirm__empty {
  display: flex;
  justify-content: center;
  padding: 3rem;
  color: var(--ds-text-muted, #64748b);
}

@media (max-width: 768px) {
  .ds-payment-confirm__detail-grid {
    grid-template-columns: 1fr;
  }

  .ds-payment-confirm__toggles {
    grid-template-columns: 1fr;
  }
}
</style>
