<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClientProfileStore } from '@/stores/clientProfile'
import { useToast } from '@/composables/useToast'
import BCard from '@/components/base/BCard.vue'
import BInput from '@/components/base/BInput.vue'
import BButton from '@/components/base/BButton.vue'

const { t } = useI18n()
const clientProfileStore = useClientProfileStore()
const toast = useToast()

const saving = ref(false)
const saved = ref(false)

// Form state
const companyName = ref('')
const companySize = ref('')
const industry = ref('')

const companySizeOptions = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
]

const industryOptions = [
  'Legal',
  'Finance',
  'Real Estate',
  'Consulting',
  'IT / Tech',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Education',
  'Other',
]

onMounted(async () => {
  if (!clientProfileStore.profile) {
    await clientProfileStore.fetchProfile()
  }
  const p = clientProfileStore.profile
  if (p) {
    companyName.value = p.companyName || ''
    companySize.value = p.companySize || ''
    industry.value = p.industry || ''
  }
})

async function handleSave() {
  saving.value = true
  saved.value = false
  try {
    await clientProfileStore.updateProfile({
      companyName: companyName.value,
      companySize: companySize.value,
      industry: industry.value,
    })
    saved.value = true
    toast.success(t('clientProfile.settings.saved'))
    setTimeout(() => { saved.value = false }, 3000)
  } catch {
    toast.error(clientProfileStore.error || 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="ds-client-settings">
    <h1 class="ds-page-title">{{ t('clientProfile.settings.title') }}</h1>
    <p class="ds-page-subtitle">{{ t('clientProfile.settings.subtitle') }}</p>

    <!-- Company Section -->
    <BCard variant="bordered" padding="lg" class="ds-client-settings__section">
      <template #header>
        <h2 class="ds-section-header__title">{{ t('clientProfile.settings.companySection') }}</h2>
      </template>

      <!-- Company Name -->
      <BInput
        v-model="companyName"
        :label="t('clientProfile.settings.companyName')"
        :placeholder="t('clientProfile.settings.companyNamePlaceholder')"
      />

      <!-- Company Size -->
      <div class="ds-form-group">
        <label class="ds-label">{{ t('clientProfile.settings.companySize') }}</label>
        <select v-model="companySize" class="ds-input">
          <option value="">{{ t('clientProfile.settings.companySizePlaceholder') }}</option>
          <option v-for="s in companySizeOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- Industry -->
      <div class="ds-form-group">
        <label class="ds-label">{{ t('clientProfile.settings.industry') }}</label>
        <select v-model="industry" class="ds-input">
          <option value="">{{ t('clientProfile.settings.industryPlaceholder') }}</option>
          <option v-for="i in industryOptions" :key="i" :value="i">{{ i }}</option>
        </select>
      </div>

      <BButton
        variant="accent"
        :loading="saving"
        @click="handleSave"
      >
        {{ t('clientProfile.settings.save') }}
      </BButton>
    </BCard>
  </div>
</template>
