<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDisputesStore } from '@/stores/disputes'
import { useMissionsStore } from '@/stores/missions'
import { useToast } from '@/composables/useToast'
import BButton from '@/components/base/BButton.vue'
import BSelect from '@/components/base/BSelect.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const disputesStore = useDisputesStore()
const missionsStore = useMissionsStore()
const toast = useToast()

const selectedMissionId = ref('')
const reason = ref('')
const submitting = ref(false)

onMounted(() => {
  missionsStore.fetchMissions()

  const queryMissionId = route.query.missionId as string
  if (queryMissionId) {
    selectedMissionId.value = queryMissionId
  }
})

const missions = computed(() => {
  return missionsStore.missions.filter(
    (m) => m.status === 'in_progress' || m.status === 'completed' || m.status === 'agreed',
  )
})

const missionOptions = computed(() => {
  return missions.value.map((m) => ({
    value: String(m.id),
    label: m.title,
  }))
})

const isValid = computed(() => {
  return selectedMissionId.value !== '' && reason.value.trim() !== ''
})

function goBack() {
  router.push('/app/disputes')
}

async function handleSubmit() {
  if (!isValid.value) return

  submitting.value = true
  try {
    await disputesStore.createDispute(selectedMissionId.value, reason.value)
    toast.success(t('disputes.initiate.submitted'))
    router.push('/app/disputes')
  } catch {
    toast.error('Failed to initiate dispute')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="ds-dispute-initiate">
    <button class="ds-dispute-initiate__back" @click="goBack">
      {{ t('disputes.initiate.back') }}
    </button>

    <div class="ds-dispute-initiate__header">
      <h1 class="ds-dispute-initiate__title">{{ t('disputes.initiate.title') }}</h1>
      <p class="ds-dispute-initiate__subtitle">{{ t('disputes.initiate.subtitle') }}</p>
    </div>

    <form class="ds-dispute-initiate__form" @submit.prevent="handleSubmit">
      <div class="ds-dispute-initiate__field">
        <label class="ds-dispute-initiate__label">{{ t('disputes.initiate.fields.mission') }}</label>
        <BSelect
          v-model="selectedMissionId"
          :options="missionOptions"
          :placeholder="t('disputes.initiate.fields.missionPlaceholder')"
          class="ds-dispute-initiate__mission"
        />
      </div>

      <div class="ds-dispute-initiate__field">
        <label class="ds-dispute-initiate__label">{{ t('disputes.initiate.fields.reason') }}</label>
        <textarea
          v-model="reason"
          class="ds-dispute-initiate__reason"
          :placeholder="t('disputes.initiate.fields.reasonPlaceholder')"
          rows="6"
        />
      </div>

      <div class="ds-dispute-initiate__actions">
        <BButton type="button" variant="ghost" @click="goBack">
          {{ t('disputes.initiate.back') }}
        </BButton>
        <BButton
          type="submit"
          variant="accent"
          class="ds-dispute-initiate__submit"
          :disabled="!isValid || submitting"
        >
          {{ submitting ? t('disputes.initiate.submitting') : t('disputes.initiate.submit') }}
        </BButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.ds-dispute-initiate {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 40rem;
}

.ds-dispute-initiate__back {
  background: none;
  border: none;
  color: var(--ds-text-muted, #64748b);
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0;
  width: fit-content;
  transition: color 0.15s ease;
}

.ds-dispute-initiate__back:hover {
  color: var(--ds-accent, #6366f1);
}

.ds-dispute-initiate__header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ds-dispute-initiate__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-dispute-initiate__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-dispute-initiate__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.ds-dispute-initiate__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.ds-dispute-initiate__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
}

.ds-dispute-initiate__reason {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--ds-border, #334155);
  background: var(--ds-bg, #0f172a);
  color: var(--ds-text, #f1f5f9);
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
}

.ds-dispute-initiate__reason:focus {
  outline: none;
  border-color: var(--ds-accent, #6366f1);
}

.ds-dispute-initiate__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .ds-dispute-initiate {
    max-width: 100%;
  }
  .ds-dispute-initiate__actions {
    flex-direction: column-reverse;
  }
}
</style>
