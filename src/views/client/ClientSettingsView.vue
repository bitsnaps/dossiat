<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useClientProfileStore } from '@/stores/clientProfile'
import { useToast } from '@/composables/useToast'
import BCard from '@/components/base/BCard.vue'
import BInput from '@/components/base/BInput.vue'
import BButton from '@/components/base/BButton.vue'
import BSelect from '@/components/base/BSelect.vue'

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
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-500', label: '201-500' },
  { value: '500+', label: '500+' },
]

const industryOptions = [
  { value: 'Legal', label: 'Legal' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'IT / Tech', label: 'IT / Tech' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Education', label: 'Education' },
  { value: 'Other', label: 'Other' },
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
      <BSelect
        v-model="companySize"
        :options="companySizeOptions"
        :label="t('clientProfile.settings.companySize')"
        :placeholder="t('clientProfile.settings.companySizePlaceholder')"
      />

      <!-- Industry -->
      <BSelect
        v-model="industry"
        :options="industryOptions"
        :label="t('clientProfile.settings.industry')"
        :placeholder="t('clientProfile.settings.industryPlaceholder')"
      />

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
