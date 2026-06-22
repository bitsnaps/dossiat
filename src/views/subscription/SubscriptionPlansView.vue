<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSubscriptionsStore, type Plan } from '@/stores/subscriptions'
import BCard from '@/components/base/BCard.vue'
import BButton from '@/components/base/BButton.vue'
import BAlert from '@/components/base/BAlert.vue'
import BBadge from '@/components/base/BBadge.vue'

const { t } = useI18n()
const router = useRouter()
const store = useSubscriptionsStore()

onMounted(() => {
  store.fetchPlans()
  store.fetchMySubscription()
})

const currentPlanId = computed(() => store.currentSubscription?.planId)

function isCurrentPlan(plan: Plan) {
  return currentPlanId.value === plan.id
}

function planPrice(plan: Plan) {
  return Number(plan.price).toFixed(0)
}

function formatSeats(maxSeats: number) {
  return maxSeats === -1 ? t('subscriptions.plans.maxSeatsUnlimited') : t('subscriptions.plans.maxSeats', { count: maxSeats })
}

function formatRecurrent(maxRecurrent: number) {
  return maxRecurrent === -1 ? t('subscriptions.plans.maxRecurrentUnlimited') : t('subscriptions.plans.maxRecurrent', { count: maxRecurrent })
}

function planNameKey(name: string) {
  const map: Record<string, string> = {
    small_business: 'smallBusiness',
    professional: 'professional',
    enterprise: 'enterprise',
  }
  return map[name] || name
}

function planFeatureKeys(plan: Plan): string[] {
  const features: Record<string, boolean> = plan.features as Record<string, boolean>
  return Object.entries(features).filter(([, v]) => v === true).map(([k]) => k)
}

function featureLabel(key: string) {
  const map: Record<string, string> = {
    missions: 'Missions',
    messaging: 'Messaging',
    payments: 'Payments',
    recurrent_missions: 'Recurrent Missions',
    csv_import: 'CSV Import',
    priority_support: 'Priority Support',
  }
  return map[key] || key
}

async function handleSubscribe(plan: Plan) {
  try {
    await store.subscribeToPlan(plan.id)
    router.push({ name: 'subscription-manage' })
  } catch { /* handled by store */ }
}
</script>

<template>
  <div class="ds-subscription-plans">
    <div class="ds-subscription-plans__header">
      <h1 class="ds-subscription-plans__title">{{ t('subscriptions.plans.title') }}</h1>
    </div>

    <p class="ds-subscription-plans__subtitle">{{ t('subscriptions.plans.subtitle') }}</p>

    <BAlert v-if="store.error" variant="danger">
      {{ store.error }}
    </BAlert>

    <!-- Loading -->
    <div v-if="store.loading && store.plans.length === 0" class="ds-subscription-plans__loading">
      <div class="spinner-border" role="status" />
    </div>

    <!-- Plan Cards -->
    <div v-else class="ds-subscription-plans__grid">
      <BCard
        v-for="plan in store.plans"
        :key="plan.id"
        variant="bordered"
        padding="md"
        :class="[
          'ds-subscription-plans__card',
          { 'ds-subscription-plans__card--popular': plan.name === 'professional' },
          { 'ds-subscription-plans__card--current': isCurrentPlan(plan) },
        ]"
      >
        <BBadge
          v-if="plan.name === 'professional'"
          variant="accent"
          size="sm"
          class="ds-subscription-plans__popular-badge"
        >
          {{ t('subscriptions.plans.popular') }}
        </BBadge>

        <div v-if="isCurrentPlan(plan)" class="ds-subscription-plans__current-label">
          <BBadge variant="success" size="sm">{{ t('subscriptions.plans.subscribed') }}</BBadge>
        </div>

        <div class="ds-subscription-plans__plan-name">{{ t(`pricing.${planNameKey(plan.name)}`) }}</div>

        <div class="ds-subscription-plans__price">
          <span class="ds-subscription-plans__currency">$</span>
          <span class="ds-subscription-plans__amount">{{ planPrice(plan) }}</span>
          <span class="ds-subscription-plans__interval">{{ t('subscriptions.plans.perMonth') }}</span>
        </div>

        <div class="ds-subscription-plans__limits">
          <div class="ds-subscription-plans__limit">
            <i class="bi bi-people" /> {{ formatSeats(plan.maxSeats) }}
          </div>
          <div class="ds-subscription-plans__limit">
            <i class="bi bi-arrow-repeat" /> {{ formatRecurrent(plan.maxRecurrentMissions) }}
          </div>
        </div>

        <div class="ds-subscription-plans__divider" />

        <ul class="ds-subscription-plans__features">
          <li v-for="key in planFeatureKeys(plan)" :key="key">
            <i class="bi bi-check2-circle" /> {{ featureLabel(key) }}
          </li>
        </ul>

        <BButton
          v-if="isCurrentPlan(plan)"
          variant="outline"
          disabled
          class="ds-subscription-plans__cta w-100"
        >
          {{ t('subscriptions.plans.subscribed') }}
        </BButton>
        <BButton
          v-else
          :variant="plan.name === 'professional' ? 'accent' : 'outline'"
          class="ds-subscription-plans__cta w-100"
          :disabled="store.loading"
          @click="handleSubscribe(plan)"
        >
          {{ store.loading ? t('subscriptions.plans.subscribing') : t('subscriptions.plans.cta') }}
        </BButton>
      </BCard>
    </div>

    <p class="ds-subscription-plans__note">{{ t('subscriptions.plans.currencyNote') }}</p>
  </div>
</template>

<style scoped>
.ds-subscription-plans {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ds-subscription-plans__header {
  display: flex;
  align-items: center;
}

.ds-subscription-plans__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-subscription-plans__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-subscription-plans__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-subscription-plans__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.ds-subscription-plans__card {
  display: flex;
  flex-direction: column;
  position: relative;
}

.ds-subscription-plans__card--popular {
  border-color: var(--ds-accent, #6366f1);
}

.ds-subscription-plans__card--current {
  border-color: var(--ds-success, #22c55e);
}

.ds-subscription-plans__popular-badge {
  position: absolute;
  top: -0.5rem;
  right: 1rem;
}

.ds-subscription-plans__current-label {
  margin-bottom: 0.5rem;
}

.ds-subscription-plans__plan-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin-bottom: 0.5rem;
}

.ds-subscription-plans__price {
  display: flex;
  align-items: baseline;
  gap: 0.125rem;
  margin-bottom: 0.75rem;
}

.ds-subscription-plans__currency {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
}

.ds-subscription-plans__amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--ds-text, #f1f5f9);
  line-height: 1;
}

.ds-subscription-plans__interval {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin-inline-start: 0.25rem;
}

.ds-subscription-plans__limits {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.ds-subscription-plans__limit {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ds-subscription-plans__divider {
  height: 1px;
  background: var(--ds-border, #334155);
  margin-bottom: 1rem;
}

.ds-subscription-plans__features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.ds-subscription-plans__features li {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ds-subscription-plans__features li i {
  color: var(--ds-accent, #6366f1);
}

.ds-subscription-plans__note {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  text-align: center;
  margin: 0;
}

@media (max-width: 992px) {
  .ds-subscription-plans__grid {
    grid-template-columns: 1fr;
    max-width: 480px;
  }
}
</style>
