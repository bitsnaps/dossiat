<script lang="ts" setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSubscriptionsStore, type Plan } from '@/stores/subscriptions'
import { formatDate } from '@/utils/formatters'
import BCard from '@/components/base/BCard.vue'
import BButton from '@/components/base/BButton.vue'
import BAlert from '@/components/base/BAlert.vue'
import BBadge from '@/components/base/BBadge.vue'
import BModal from '@/components/base/BModal.vue'

const { t } = useI18n()
const router = useRouter()
const store = useSubscriptionsStore()

const selectedPlanId = ref<number | null>(null)
const changing = ref(false)
const cancelling = ref(false)
const successMessage = ref<string | null>(null)
const showCancelModal = ref(false)

onMounted(() => {
  store.fetchPlans()
  store.fetchMySubscription()
})

const subscription = computed(() => store.currentSubscription)
const currentPlan = computed(() => store.currentPlan)
const otherPlans = computed(() => store.plans.filter((p) => p.id !== subscription.value?.planId))

function planNameKey(name: string) {
  const map: Record<string, string> = {
    small_business: 'smallBusiness',
    professional: 'professional',
    enterprise: 'enterprise',
  }
  return map[name] || name
}

function planPrice(plan: Plan) {
  return Number(plan.price).toFixed(0)
}

function statusBadgeVariant(status: string) {
  const map: Record<string, string> = {
    active: 'success',
    past_due: 'warning',
    cancelled: 'danger',
  }
  return map[status] || 'default'
}

function statusLabel(status: string) {
  return t(`subscriptions.manage.${status}`, status)
}

async function handleChangePlan() {
  if (!selectedPlanId.value) return
  changing.value = true
  successMessage.value = null
  try {
    await store.updatePlan(selectedPlanId.value)
    selectedPlanId.value = null
    successMessage.value = t('subscriptions.manage.planChanged')
  } catch { /* handled by store */ } finally {
    changing.value = false
  }
}

async function handleCancel() {
  cancelling.value = true
  try {
    await store.cancelPlan()
    showCancelModal.value = false
    successMessage.value = t('subscriptions.manage.cancelledSuccess')
  } catch { /* handled by store */ } finally {
    cancelling.value = false
  }
}

async function handleOpenPortal() {
  try {
    const url = await store.openPortal()
    window.open(url, '_blank')
  } catch { /* handled by store */ }
}
</script>

<template>
  <div class="ds-subscription-manage">
    <div class="ds-subscription-manage__header">
      <h1 class="ds-subscription-manage__title">{{ t('subscriptions.manage.title') }}</h1>
    </div>

    <p class="ds-subscription-manage__subtitle">{{ t('subscriptions.manage.subtitle') }}</p>

    <BAlert v-if="successMessage" variant="success">
      {{ successMessage }}
    </BAlert>

    <BAlert v-if="store.error" variant="danger">
      {{ store.error }}
    </BAlert>

    <!-- Loading -->
    <div v-if="store.loading && !subscription" class="ds-subscription-manage__loading">
      <div class="spinner-border" role="status" />
    </div>

    <!-- No Subscription -->
    <div v-else-if="!subscription" class="ds-subscription-manage__empty">
      <i class="bi bi-arrow-repeat ds-subscription-manage__empty-icon" />
      <h3>{{ t('subscriptions.manage.noSubscription') }}</h3>
      <p>{{ t('subscriptions.manage.noSubscriptionHint') }}</p>
      <BButton variant="accent" to="/app/subscriptions/plans">
        {{ t('subscriptions.manage.browsePlans') }}
      </BButton>
    </div>

    <!-- Active Subscription -->
    <template v-else>
      <!-- Current Plan Card -->
      <BCard variant="bordered" padding="md" class="ds-subscription-manage__current">
        <h2 class="ds-subscription-manage__section-title">{{ t('subscriptions.manage.currentPlan') }}</h2>
        <div class="ds-subscription-manage__plan-info">
          <div class="ds-subscription-manage__plan-main">
            <div class="ds-subscription-manage__plan-name">{{ t(`pricing.${planNameKey(currentPlan?.name || '')}`) }}</div>
            <div class="ds-subscription-manage__plan-price">
              <span class="ds-subscription-manage__currency">$</span>
              <span class="ds-subscription-manage__amount">{{ currentPlan ? planPrice(currentPlan) : '0' }}</span>
              <span class="ds-subscription-manage__interval">/mo</span>
            </div>
          </div>
          <div class="ds-subscription-manage__plan-meta">
            <div class="ds-subscription-manage__meta-item">
              <span class="ds-subscription-manage__meta-label">{{ t('subscriptions.manage.status') }}</span>
              <BBadge :variant="statusBadgeVariant(subscription.status) as any" size="sm">
                {{ statusLabel(subscription.status) }}
              </BBadge>
            </div>
            <div class="ds-subscription-manage__meta-item">
              <span class="ds-subscription-manage__meta-label">{{ t('subscriptions.manage.periodStart') }}</span>
              <span class="ds-subscription-manage__meta-value">{{ formatDate(subscription.currentPeriodStart) }}</span>
            </div>
            <div class="ds-subscription-manage__meta-item">
              <span class="ds-subscription-manage__meta-label">{{ t('subscriptions.manage.periodEnd') }}</span>
              <span class="ds-subscription-manage__meta-value">{{ formatDate(subscription.currentPeriodEnd) }}</span>
            </div>
          </div>
        </div>
      </BCard>

      <!-- Plan Switcher -->
      <BCard v-if="otherPlans.length > 0 && subscription.status === 'active'" variant="bordered" padding="md">
        <h2 class="ds-subscription-manage__section-title">{{ t('subscriptions.manage.switchPlan') }}</h2>
        <p class="ds-subscription-manage__section-sub">{{ t('subscriptions.manage.selectPlan') }}</p>

        <div class="ds-subscription-manage__plan-options">
          <label
            v-for="plan in otherPlans"
            :key="plan.id"
            :class="[
              'ds-subscription-manage__plan-option',
              { 'ds-subscription-manage__plan-option--selected': selectedPlanId === plan.id },
            ]"
          >
            <input
              v-model="selectedPlanId"
              type="radio"
              :value="plan.id"
              class="ds-subscription-manage__radio"
            />
            <div class="ds-subscription-manage__option-info">
              <div class="ds-subscription-manage__option-name">{{ t(`pricing.${planNameKey(plan.name)}`) }}</div>
              <div class="ds-subscription-manage__option-price">${{ planPrice(plan) }}/mo</div>
            </div>
            <BBadge
              :variant="(currentPlan && plan.price > currentPlan.price) ? 'info' : 'default' as any"
              size="sm"
            >
              {{ (currentPlan && plan.price > currentPlan.price) ? t('subscriptions.manage.upgrade') : t('subscriptions.manage.downgrade') }}
            </BBadge>
          </label>
        </div>

        <div class="ds-subscription-manage__plan-actions">
          <BButton
            variant="accent"
            :disabled="!selectedPlanId || changing"
            :loading="changing"
            @click="handleChangePlan"
          >
            {{ changing ? t('subscriptions.manage.changing') : t('subscriptions.manage.changePlan') }}
          </BButton>
        </div>
      </BCard>

      <!-- Billing Portal -->
      <BCard v-if="subscription.status === 'active'" variant="bordered" padding="md">
        <h2 class="ds-subscription-manage__section-title">{{ t('subscriptions.manage.manageBilling') }}</h2>
        <p class="ds-subscription-manage__section-sub">{{ t('subscriptions.manage.manageBillingHint') }}</p>
        <BButton variant="outline" icon="bi-box-arrow-up-right" @click="handleOpenPortal">
          {{ t('subscriptions.manage.openPortal') }}
        </BButton>
      </BCard>

      <!-- Cancel -->
      <BCard v-if="subscription.status === 'active'" variant="bordered" padding="md" class="ds-subscription-manage__danger">
        <h2 class="ds-subscription-manage__section-title ds-subscription-manage__section-title--danger">
          {{ t('subscriptions.manage.cancelSubscription') }}
        </h2>
        <BButton variant="danger" @click="showCancelModal = true">
          {{ t('subscriptions.manage.cancelSubscription') }}
        </BButton>
      </BCard>
    </template>

    <!-- Cancel Confirmation Modal -->
    <BModal v-model="showCancelModal" :title="t('subscriptions.manage.cancelConfirmTitle')" size="sm">
      <p>{{ t('subscriptions.manage.cancelConfirmMessage') }}</p>
      <template #footer>
        <BButton variant="ghost" @click="showCancelModal = false">
          {{ t('subscriptions.manage.cancelConfirmDeny') }}
        </BButton>
        <BButton variant="danger" :loading="cancelling" @click="handleCancel">
          {{ t('subscriptions.manage.cancelConfirm') }}
        </BButton>
      </template>
    </BModal>
  </div>
</template>

<style scoped>
.ds-subscription-manage {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 720px;
}

.ds-subscription-manage__header {
  display: flex;
  align-items: center;
}

.ds-subscription-manage__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-subscription-manage__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-subscription-manage__section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0 0 0.25rem;
}

.ds-subscription-manage__section-title--danger {
  color: var(--ds-danger, #ef4444);
}

.ds-subscription-manage__section-sub {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0 0 1rem;
}

.ds-subscription-manage__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-subscription-manage__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  text-align: center;
}

.ds-subscription-manage__empty-icon {
  font-size: 3rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-subscription-manage__empty h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-subscription-manage__empty p {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-subscription-manage__plan-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-top: 1rem;
}

.ds-subscription-manage__plan-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin-bottom: 0.25rem;
}

.ds-subscription-manage__plan-price {
  display: flex;
  align-items: baseline;
}

.ds-subscription-manage__currency {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
}

.ds-subscription-manage__amount {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ds-text, #f1f5f9);
  line-height: 1;
}

.ds-subscription-manage__interval {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin-inline-start: 0.25rem;
}

.ds-subscription-manage__plan-meta {
  display: flex;
  gap: 1.5rem;
}

.ds-subscription-manage__meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ds-subscription-manage__meta-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-subscription-manage__meta-value {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
}

.ds-subscription-manage__plan-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.ds-subscription-manage__plan-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--ds-border, #334155);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.ds-subscription-manage__plan-option:hover {
  border-color: var(--ds-accent, #6366f1);
  background: rgba(99, 102, 241, 0.05);
}

.ds-subscription-manage__plan-option--selected {
  border-color: var(--ds-accent, #6366f1);
  background: rgba(99, 102, 241, 0.1);
}

.ds-subscription-manage__radio {
  margin: 0;
  accent-color: var(--ds-accent, #6366f1);
}

.ds-subscription-manage__option-info {
  flex-grow: 1;
}

.ds-subscription-manage__option-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
}

.ds-subscription-manage__option-price {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-subscription-manage__plan-actions {
  display: flex;
  justify-content: flex-end;
}

.ds-subscription-manage__danger {
  border-color: rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .ds-subscription-manage__plan-info {
    flex-direction: column;
  }

  .ds-subscription-manage__plan-meta {
    flex-wrap: wrap;
    gap: 1rem;
  }
}
</style>
