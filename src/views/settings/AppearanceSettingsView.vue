<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import BCard from '@/components/base/BCard.vue'
import BRadioGroup from '@/components/base/BRadioGroup.vue'
import BSelect from '@/components/base/BSelect.vue'
import BButton from '@/components/base/BButton.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'

const { t, locale } = useI18n()
const uiStore = useUiStore()
const toast = useToast()

const saving = ref(false)

const selectedTheme = ref(uiStore.theme)
const selectedLanguage = ref(locale.value)

const themeOptions = [
  { value: 'dark', label: t('settings.appearance.darkMode'), icon: 'bi-moon' },
  { value: 'light', label: t('settings.appearance.lightMode'), icon: 'bi-sun' },
]

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
]

const breadcrumbs = [
  { label: t('settings.title'), to: '/app/settings' },
  { label: t('settings.appearance.title') },
]

async function handleSave() {
  saving.value = true
  try {
    uiStore.setTheme(selectedTheme.value as 'dark' | 'light')
    locale.value = selectedLanguage.value
    localStorage.setItem('ds-locale', selectedLanguage.value)
    toast.success(t('settings.appearance.saved'))
  } catch (err: any) {
    toast.error(err.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="ds-appearance-settings">
    <Breadcrumb :items="breadcrumbs" />

    <h1 class="ds-page-title">{{ t('settings.appearance.title') }}</h1>
    <p class="ds-page-subtitle">{{ t('settings.appearance.subtitle') }}</p>

    <BCard variant="bordered" padding="lg" class="ds-settings__section">
      <template #header>
        <h2 class="ds-section-header__title">{{ t('settings.appearance.theme') }}</h2>
      </template>

      <BRadioGroup
        v-model="selectedTheme"
        :options="themeOptions"
        :label="t('settings.appearance.theme')"
      />

      <BSelect
        v-model="selectedLanguage"
        :options="languageOptions"
        :label="t('settings.appearance.language')"
        :hint="t('settings.appearance.languageHint')"
      />

      <template #footer>
        <BButton variant="accent" :loading="saving" @click="handleSave">
          {{ t('settings.appearance.save') }}
        </BButton>
      </template>
    </BCard>
  </div>
</template>
