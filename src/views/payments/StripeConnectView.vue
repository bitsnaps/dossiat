<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePaymentsStore } from '@/stores/payments'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import BAlert from '@/components/base/BAlert.vue'

const { t } = useI18n()
const store = usePaymentsStore()

onMounted(() => {
  store.fetchStripeStatus()
})

async function handleConnect() {
  try {
    const data = await store.connectStripe()
    if (data?.url) {
      window.location.href = data.url
    }
  } catch { /* handled by store */ }
}
</script>

<template>
  <div class="ds-stripe-connect">
    <div class="ds-stripe-connect__header">
      <h1 class="ds-stripe-connect__title">{{ t('payments.stripe.title') }}</h1>
    </div>

    <p class="ds-stripe-connect__subtitle">{{ t('payments.stripe.subtitle') }}</p>

    <BAlert v-if="store.error" variant="danger">
      {{ store.error }}
    </BAlert>

    <!-- Status Card -->
    <BCard variant="bordered" padding="md" class="ds-stripe-connect__status">
      <div class="ds-stripe-connect__status-content">
        <div class="ds-stripe-connect__status-row">
          <span class="ds-stripe-connect__status-label">Connection</span>
          <BBadge
            :variant="(store.stripeStatus?.connected ? 'success' : 'warning') as any"
            size="md"
          >
            {{ store.stripeStatus?.connected
              ? t('payments.stripe.status.connected')
              : t('payments.stripe.status.notConnected')
            }}
          </BBadge>
        </div>

        <div v-if="store.stripeStatus?.detailsSubmitted !== undefined" class="ds-stripe-connect__status-row">
          <span class="ds-stripe-connect__status-label">Setup</span>
          <BBadge
            :variant="(store.stripeStatus.detailsSubmitted ? 'success' : 'warning') as any"
            size="sm"
          >
            {{ store.stripeStatus.detailsSubmitted
              ? t('payments.stripe.detailsSubmitted')
              : t('payments.stripe.detailsPending')
            }}
          </BBadge>
        </div>
      </div>
    </BCard>

    <!-- Not Configured -->
    <div v-if="store.stripeStatus && !store.stripeStatus.configured" class="ds-stripe-connect__configured">
      <BCard variant="bordered" padding="md">
        <i class="bi bi-info-circle" />
        <p>{{ t('payments.stripe.notConfigured') }}</p>
      </BCard>
    </div>

    <!-- Connect Action -->
    <BCard v-if="store.stripeStatus?.configured && !store.stripeStatus?.connected" variant="bordered" padding="md">
      <div class="ds-stripe-connect__action">
        <p class="ds-stripe-connect__action-text">{{ t('payments.stripe.notConnectedMessage') }}</p>
        <BButton
          variant="accent"
          icon="bi-credit-card"
          class="ds-stripe-connect__connect-btn"
          @click="handleConnect"
        >
          {{ t('payments.stripe.connect') }}
        </BButton>
      </div>
    </BCard>

    <!-- Connected Message -->
    <BCard v-if="store.stripeStatus?.connected" variant="bordered" padding="md">
      <BAlert variant="success">
        {{ t('payments.stripe.connectedMessage') }}
      </BAlert>
    </BCard>
  </div>
</template>

<style scoped>
.ds-stripe-connect {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 640px;
}

.ds-stripe-connect__header {
  display: flex;
  align-items: center;
}

.ds-stripe-connect__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-stripe-connect__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-stripe-connect__status-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ds-stripe-connect__status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ds-stripe-connect__status-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
}

.ds-stripe-connect__configured {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-stripe-connect__action {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ds-stripe-connect__action-text {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}
</style>
