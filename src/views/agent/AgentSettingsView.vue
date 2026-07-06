<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAgentProfileStore } from '@/stores/agentProfile'
import { useToast } from '@/composables/useToast'
import BCard from '@/components/base/BCard.vue'
import BInput from '@/components/base/BInput.vue'
import BButton from '@/components/base/BButton.vue'
import BAvatar from '@/components/base/BAvatar.vue'
import BTagGroup from '@/components/base/BTagGroup.vue'
import BRadioGroup from '@/components/base/BRadioGroup.vue'
import BSelect from '@/components/base/BSelect.vue'
import InviteLinkShare from '@/components/agent/InviteLinkShare.vue'

const { t } = useI18n()
const agentProfileStore = useAgentProfileStore()
const toast = useToast()

const saving = ref(false)
const saved = ref(false)

// Form state
const bio = ref('')
const timezone = ref('')
const currency = ref('USD')
const specialties = ref<string[]>([])
const acceptedClientTypes = ref<'B2B' | 'B2C' | 'Both'>('Both')
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

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

const currencyOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'DZD', label: 'DZD' },
  { value: 'GBP', label: 'GBP' },
  { value: 'MAD', label: 'MAD' },
  { value: 'AED', label: 'AED' },
  { value: 'SAR', label: 'SAR' },
  { value: 'CAD', label: 'CAD' },
  { value: 'AUD', label: 'AUD' },
  { value: 'JPY', label: 'JPY' },
  { value: 'CHF', label: 'CHF' },
]

onMounted(async () => {
  if (!agentProfileStore.profile) {
    await agentProfileStore.fetchProfile()
  }
  const p = agentProfileStore.profile
  if (p) {
    bio.value = p.bio || ''
    timezone.value = p.timezone || 'UTC'
    currency.value = p.currency || 'USD'
    specialties.value = [...(p.specialties || [])]
    acceptedClientTypes.value = p.acceptedClientTypes || 'Both'
    if (p.profilePhotoUrl) {
      avatarPreview.value = p.profilePhotoUrl
    }
  }
})

function onAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

async function handleSave() {
  saving.value = true
  saved.value = false
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

    saved.value = true
    toast.success(t('agentProfile.settings.saved'))
    setTimeout(() => { saved.value = false }, 3000)
  } catch {
    toast.error(agentProfileStore.error || 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="ds-agent-settings">
    <h1 class="ds-page-title">{{ t('agentProfile.settings.title') }}</h1>
    <p class="ds-page-subtitle">{{ t('agentProfile.settings.subtitle') }}</p>

    <!-- Profile Section -->
    <BCard variant="bordered" padding="lg" class="ds-agent-settings__section">
      <template #header>
        <h2 class="ds-section-header__title">{{ t('agentProfile.settings.profileSection') }}</h2>
      </template>

      <!-- Avatar -->
      <div class="ds-agent-settings__avatar">
        <BAvatar
          :src="avatarPreview || undefined"
          :name="`${bio}`"
          size="lg"
        />
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

      <!-- Bio -->
      <BInput
        v-model="bio"
        :label="t('agentProfile.setup.bio')"
        :placeholder="t('agentProfile.setup.bioPlaceholder')"
      />

      <!-- Timezone -->
      <BInput
        v-model="timezone"
        :label="t('agentProfile.setup.timezone')"
      />

      <!-- Currency -->
      <BSelect
        v-model="currency"
        :options="currencyOptions"
        :label="t('agentProfile.setup.currency')"
      />

      <!-- Specialties -->
      <BTagGroup
        v-model="specialties"
        :options="specialtyOptions"
        :label="t('agentProfile.setup.specialties')"
      />

      <!-- Client Types -->
      <BRadioGroup
        v-model="acceptedClientTypes"
        :options="clientTypeOptions"
        :label="t('agentProfile.setup.clientTypes')"
      />

      <BButton
        variant="accent"
        :loading="saving"
        @click="handleSave"
      >
        {{ t('agentProfile.settings.save') }}
      </BButton>
    </BCard>

    <!-- Invite Link Section -->
    <BCard
      v-if="agentProfileStore.profile?.uniqueInviteSlug"
      variant="bordered"
      padding="lg"
      class="ds-agent-settings__section"
    >
      <template #header>
        <h2 class="ds-section-header__title">{{ t('agentProfile.settings.inviteSection') }}</h2>
      </template>
      <p class="ds-hint">{{ t('agentProfile.settings.inviteLinkHint') }}</p>
      <InviteLinkShare :slug="agentProfileStore.profile.uniqueInviteSlug" />
    </BCard>
  </div>
</template>
