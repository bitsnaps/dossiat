<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAgentProfileStore } from '@/stores/agentProfile'
import { useToast } from '@/composables/useToast'
import { CURRENCY_OPTIONS } from '@/constants/currencies'
import BCard from '@/components/base/BCard.vue'
import BButton from '@/components/base/BButton.vue'
import BInput from '@/components/base/BInput.vue'
import BTagGroup from '@/components/base/BTagGroup.vue'
import BRadioGroup from '@/components/base/BRadioGroup.vue'
import BSelect from '@/components/base/BSelect.vue'

const { t } = useI18n()
const router = useRouter()
const agentProfileStore = useAgentProfileStore()
const toast = useToast()

const currentStep = ref(1)
const totalSteps = 5
const saving = ref(false)

// Form data
const bio = ref('')
const timezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
const currency = ref('USD')
const specialties = ref<string[]>([])
const acceptedClientTypes = ref<'B2B' | 'B2C' | 'Both'>('Both')
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

// Validation errors
const errors = ref<Record<string, string>>({})

const specialtyOptions = [
  { value: 'Legal', label: 'Legal' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Admin', label: 'Admin' },
  { value: 'IT / Tech', label: 'IT / Tech' },
  { value: 'HR', label: 'HR' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Other', label: 'Other' },
]

const clientTypeOptions = [
  { value: 'B2B', label: 'B2B' },
  { value: 'B2C', label: 'B2C' },
  { value: 'Both', label: 'Both' },
]

const progress = computed(() => Math.round((currentStep.value / totalSteps) * 100))

const stepLabels = computed(() => [
  t('agentProfile.setup.stepBasics'),
  t('agentProfile.setup.stepSpecialties'),
  t('agentProfile.setup.stepClientTypes'),
  t('agentProfile.setup.stepPhoto'),
  t('agentProfile.setup.stepReview'),
])

function validateStep(): boolean {
  errors.value = {}
  let valid = true

  if (currentStep.value === 1) {
    if (!bio.value.trim()) {
      errors.value.bio = t('agentProfile.setup.bioRequired')
      valid = false
    }
    if (!timezone.value) {
      errors.value.timezone = t('agentProfile.setup.timezoneRequired')
      valid = false
    }
    if (!currency.value) {
      errors.value.currency = t('agentProfile.setup.currencyRequired')
      valid = false
    }
  } else if (currentStep.value === 2) {
    if (specialties.value.length === 0) {
      errors.value.specialties = t('agentProfile.setup.specialtiesRequired')
      valid = false
    }
  } else if (currentStep.value === 3) {
    if (!acceptedClientTypes.value) {
      errors.value.clientTypes = t('agentProfile.setup.clientTypeRequired')
      valid = false
    }
  }

  return valid
}

function nextStep() {
  if (!validateStep()) return
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function onAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

async function handleSubmit() {
  saving.value = true
  try {
    await agentProfileStore.updateProfile({
      bio: bio.value,
      specialties: specialties.value,
      acceptedClientTypes: acceptedClientTypes.value,
      currency: currency.value,
      timezone: timezone.value,
    })

    if (avatarFile.value) {
      await agentProfileStore.uploadAvatar(avatarFile.value)
    }

    toast.success(t('agentProfile.setup.completed'))
    router.push('/app/dashboard')
  } catch {
    toast.error(agentProfileStore.error || 'Failed to save profile')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="ds-agent-setup">
    <BCard variant="elevated" padding="lg" class="ds-agent-setup__card">
      <h1 class="ds-agent-setup__title">{{ t('agentProfile.setup.title') }}</h1>
      <p class="ds-agent-setup__subtitle">{{ t('agentProfile.setup.subtitle') }}</p>

      <!-- Progress Bar -->
      <div class="ds-agent-setup__progress">
        <div class="ds-agent-setup__progress-bar">
          <div
            class="ds-agent-setup__progress-fill"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <div class="ds-agent-setup__steps">
          <span
            v-for="(label, idx) in stepLabels"
            :key="label"
            :class="[
              'ds-agent-setup__step',
              { 'ds-agent-setup__step--active': currentStep === idx + 1 },
              { 'ds-agent-setup__step--completed': currentStep > idx + 1 },
            ]"
          >
            {{ label }}
          </span>
        </div>
      </div>

      <!-- Step 1: Basics -->
      <div v-if="currentStep === 1" class="ds-agent-setup__step-content">
        <BInput
          v-model="bio"
          :label="t('agentProfile.setup.bio')"
          :placeholder="t('agentProfile.setup.bioPlaceholder')"
          :error="errors.bio"
        />
        <BInput
          v-model="timezone"
          :label="t('agentProfile.setup.timezone')"
          :error="errors.timezone"
        />
        <BSelect
          v-model="currency"
          :options="CURRENCY_OPTIONS"
          :label="t('agentProfile.setup.currency')"
          :error="errors.currency"
        />
      </div>

      <!-- Step 2: Specialties -->
      <div v-if="currentStep === 2" class="ds-agent-setup__step-content">
        <p class="ds-hint">{{ t('agentProfile.setup.specialtiesHint') }}</p>
        <BTagGroup
          v-model="specialties"
          :options="specialtyOptions"
          :error="errors.specialties"
        />
      </div>

      <!-- Step 3: Client Types -->
      <div v-if="currentStep === 3" class="ds-agent-setup__step-content">
        <p class="ds-hint">{{ t('agentProfile.setup.clientTypesHint') }}</p>
        <BRadioGroup
          v-model="acceptedClientTypes"
          :options="clientTypeOptions"
          :error="errors.clientTypes"
        />
      </div>

      <!-- Step 4: Photo -->
      <div v-if="currentStep === 4" class="ds-agent-setup__step-content">
        <div class="ds-agent-setup__photo-upload">
          <div class="ds-agent-setup__photo-preview">
            <img v-if="avatarPreview" :src="avatarPreview" alt="Preview" />
            <i v-else class="bi bi-person ds-agent-setup__photo-placeholder" />
          </div>
          <label class="ds-btn ds-btn--outline ds-btn--sm">
            {{ avatarFile ? t('agentProfile.setup.changePhoto') : t('agentProfile.setup.uploadPhoto') }}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="ds-hidden-input"
              @change="onAvatarChange"
            />
          </label>
        </div>
      </div>

      <!-- Step 5: Review -->
      <div v-if="currentStep === 5" class="ds-agent-setup__step-content">
        <h3 class="ds-agent-setup__review-title">{{ t('agentProfile.setup.review') }}</h3>
        <div class="ds-review-grid">
          <div class="ds-review-item">
            <span class="ds-review-item__label">{{ t('agentProfile.setup.bio') }}</span>
            <span class="ds-review-item__value">{{ bio }}</span>
          </div>
          <div class="ds-review-item">
            <span class="ds-review-item__label">{{ t('agentProfile.setup.timezone') }}</span>
            <span class="ds-review-item__value font-mono">{{ timezone }}</span>
          </div>
          <div class="ds-review-item">
            <span class="ds-review-item__label">{{ t('agentProfile.setup.currency') }}</span>
            <span class="ds-review-item__value font-mono">{{ currency }}</span>
          </div>
          <div class="ds-review-item">
            <span class="ds-review-item__label">{{ t('agentProfile.setup.specialties') }}</span>
            <span class="ds-review-item__value">{{ specialties.join(', ') }}</span>
          </div>
          <div class="ds-review-item">
            <span class="ds-review-item__label">{{ t('agentProfile.setup.clientTypes') }}</span>
            <span class="ds-review-item__value">{{ acceptedClientTypes }}</span>
          </div>
          <div v-if="avatarPreview" class="ds-review-item">
            <span class="ds-review-item__label">{{ t('agentProfile.setup.stepPhoto') }}</span>
            <img :src="avatarPreview" alt="Avatar" class="ds-review-item__avatar" />
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="ds-agent-setup__nav">
        <BButton
          v-if="currentStep > 1"
          variant="ghost"
          @click="prevStep"
        >
          {{ t('agentProfile.setup.back') }}
        </BButton>
        <div class="ds-agent-setup__nav-spacer" />
        <BButton
          v-if="currentStep < totalSteps"
          variant="accent"
          @click="nextStep"
        >
          {{ t('agentProfile.setup.next') }}
        </BButton>
        <BButton
          v-else
          variant="accent"
          :loading="saving"
          icon="bi-check-lg"
          @click="handleSubmit"
        >
          {{ t('agentProfile.setup.complete') }}
        </BButton>
      </div>
    </BCard>
  </div>
</template>


<style lang="css" scoped>
.ds-review-item, .ds-review-item_label {
  margin-top: 1rem;
}
</style>