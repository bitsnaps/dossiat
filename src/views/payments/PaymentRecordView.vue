<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePaymentsStore } from '@/stores/payments'
import { useMissionsStore } from '@/stores/missions'
import { CURRENCY_OPTIONS } from '@/constants/currencies'
import BCard from '@/components/base/BCard.vue'
import BButton from '@/components/base/BButton.vue'
import BInput from '@/components/base/BInput.vue'
import BSelect from '@/components/base/BSelect.vue'
import BAlert from '@/components/base/BAlert.vue'

const { t } = useI18n()
const router = useRouter()
const store = usePaymentsStore()
const missionsStore = useMissionsStore()

const amount = ref('')
const currency = ref('USD')
const method = ref<string>('cash')
const missionId = ref<string>('')
const success = ref(false)
const validationError = ref('')

const methodOptions = [
  { value: 'cash', label: t('payments.record.methods.cash') },
  { value: 'bank_transfer', label: t('payments.record.methods.bankTransfer') },
  { value: 'stripe', label: t('payments.record.methods.stripe') },
  { value: 'paypal', label: t('payments.record.methods.paypal') },
]

onMounted(() => {
  missionsStore.fetchMissions()
})

function validate(): boolean {
  const amt = Number(amount.value)
  if (!amt || amt <= 0) {
    validationError.value = t('payments.record.validation.amountRequired')
    return false
  }
  if (!missionId.value) {
    validationError.value = t('payments.record.validation.missionRequired')
    return false
  }
  validationError.value = ''
  return true
}

async function handleSubmit() {
  if (!validate()) return

  try {
    await store.recordPayment(missionId.value, {
      amount: Number(amount.value),
      currency: currency.value,
      method: method.value as any,
    })
    success.value = true
    setTimeout(() => {
      router.push('/app/payments')
    }, 1500)
  } catch {
    // Error handled by store
  }
}
</script>

<template>
  <div class="ds-payment-record">
    <div class="ds-payment-record__header">
      <h1 class="ds-payment-record__title">{{ t('payments.record.title') }}</h1>
    </div>

    <p class="ds-payment-record__subtitle">{{ t('payments.record.subtitle') }}</p>

    <BAlert v-if="success" variant="success" class="ds-payment-record__success">
      {{ t('payments.record.recorded') }}
    </BAlert>

    <BAlert v-if="store.error" variant="danger" class="ds-payment-record__error">
      {{ store.error }}
    </BAlert>

    <BAlert v-if="validationError" variant="danger" class="ds-payment-record__error">
      {{ validationError }}
    </BAlert>

    <BCard variant="bordered" padding="md" class="ds-payment-record__form-card">
      <form class="ds-payment-record__form" @submit.prevent="handleSubmit">
        <div class="ds-payment-record__field">
          <label class="ds-payment-record__label">{{ t('payments.record.fields.amount') }}</label>
          <BInput
            v-model="amount"
            type="number"
            :placeholder="t('payments.record.fields.amountPlaceholder')"
            class="ds-payment-record__amount"
          />
        </div>

        <div class="ds-payment-record__field">
          <label class="ds-payment-record__label">{{ t('payments.record.fields.currency') }}</label>
          <BSelect
            v-model="currency"
            :options="CURRENCY_OPTIONS"
            class="ds-payment-record__currency"
          />
        </div>

        <div class="ds-payment-record__field">
          <label class="ds-payment-record__label">{{ t('payments.record.fields.method') }}</label>
          <div class="ds-payment-record__methods">
            <label
              v-for="opt in methodOptions"
              :key="opt.value"
              class="ds-payment-record__method"
              :class="{ 'ds-payment-record__method--active': method === opt.value }"
            >
              <input
                v-model="method"
                type="radio"
                :value="opt.value"
                class="ds-payment-record__radio"
              >
              <span>{{ opt.label }}</span>
            </label>
          </div>
        </div>

        <div class="ds-payment-record__field">
          <label class="ds-payment-record__label">{{ t('payments.record.fields.mission') }}</label>
          <BSelect
            v-model="missionId"
            :options="missionsStore.missions.map((m: any) => ({ value: String(m.id), label: m.title }))"
            :placeholder="t('payments.record.fields.missionPlaceholder')"
            class="ds-payment-record__mission"
          />
        </div>

        <div class="ds-payment-record__actions">
          <BButton
            variant="ghost"
            class="ds-payment-record__cancel"
            @click="router.back()"
          >
            {{ t('payments.record.cancel') }}
          </BButton>
          <BButton
            variant="accent"
            type="submit"
            :disabled="store.loading"
            class="ds-payment-record__submit"
          >
            {{ store.loading ? t('payments.record.recording') : t('payments.record.submit') }}
          </BButton>
        </div>
      </form>
    </BCard>
  </div>
</template>

<style scoped>
.ds-payment-record {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 640px;
}

.ds-payment-record__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ds-payment-record__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-payment-record__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-payment-record__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ds-payment-record__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.ds-payment-record__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
}

.ds-payment-record__methods {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.ds-payment-record__method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--ds-border, #334155);
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
  transition: all 0.15s ease;
}

.ds-payment-record__method:hover {
  border-color: var(--ds-accent, #6366f1);
}

.ds-payment-record__method--active {
  border-color: var(--ds-accent, #6366f1);
  background: rgba(99, 102, 241, 0.1);
}

.ds-payment-record__radio {
  accent-color: var(--ds-accent, #6366f1);
}

.ds-payment-record__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .ds-payment-record {
    max-width: 100%;
  }
  .ds-payment-record__actions {
    flex-direction: column-reverse;
  }
}
</style>
