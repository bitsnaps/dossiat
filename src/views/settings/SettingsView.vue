<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { updateMe, changePassword, exportMyData, deleteMyAccount } from '@/services/users'
import BCard from '@/components/base/BCard.vue'
import BInput from '@/components/base/BInput.vue'
import BButton from '@/components/base/BButton.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const confirmDialog = useConfirmDialog()

const savingProfile = ref(false)
const savingPassword = ref(false)
const exportingData = ref(false)
const deletingAccount = ref(false)

// Personal info form
const firstName = ref('')
const lastName = ref('')

// Password form
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const breadcrumbs = computed(() => [
  { label: t('settings.title'), to: '/app/settings' },
  { label: t('settings.nav.account') },
])

const passwordError = computed(() => {
  if (newPassword.value && newPassword.value.length < 8) return t('settings.account.passwordMinLength')
  if (newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value) return t('settings.account.passwordMismatch')
  return undefined
})

const canSubmitPassword = computed(() => {
  return currentPassword.value && newPassword.value && confirmPassword.value && !passwordError.value
})

onMounted(() => {
  if (authStore.user) {
    firstName.value = authStore.user.firstName
    lastName.value = authStore.user.lastName
  }
})

async function handleSaveProfile() {
  savingProfile.value = true
  try {
    await updateMe({ firstName: firstName.value, lastName: lastName.value })
    if (authStore.user) {
      authStore.user.firstName = firstName.value
      authStore.user.lastName = lastName.value
    }
    toast.success(t('settings.account.saved'))
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Failed to save')
  } finally {
    savingProfile.value = false
  }
}

async function handleChangePassword() {
  if (!canSubmitPassword.value) return
  savingPassword.value = true
  try {
    await changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    toast.success(t('settings.account.saved'))
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Failed to change password')
  } finally {
    savingPassword.value = false
  }
}

async function handleExportData() {
  exportingData.value = true
  try {
    const response = await exportMyData() as any
    const data = response.data ?? response
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dossiat-data-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(t('settings.dataPrivacy.exportSuccess'))
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Failed to export data')
  } finally {
    exportingData.value = false
  }
}

async function handleDeleteAccount() {
  const confirmed = await confirmDialog.showConfirm({
    title: t('settings.dataPrivacy.deleteTitle'),
    message: t('settings.dataPrivacy.deleteConfirm'),
    confirmLabel: t('settings.dataPrivacy.deleteConfirmAction'),
    cancelLabel: t('common.confirm.cancel'),
    variant: 'danger',
  })
  if (!confirmed) return

  deletingAccount.value = true
  try {
    await deleteMyAccount()
    toast.success(t('settings.dataPrivacy.deleteSuccess'))
    await authStore.logout()
    router.push('/')
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Failed to delete account')
  } finally {
    deletingAccount.value = false
  }
}
</script>

<template>
  <div class="ds-settings">
    <Breadcrumb :items="breadcrumbs" />

    <h1 class="ds-page-title">{{ t('settings.account.title') }}</h1>

    <!-- Personal Info -->
    <BCard variant="bordered" padding="lg" class="ds-settings__section">
      <template #header>
        <h2 class="ds-section-header__title">{{ t('settings.account.personalInfo') }}</h2>
      </template>

      <BInput
        v-model="firstName"
        :label="t('settings.account.firstName')"
      />

      <BInput
        v-model="lastName"
        :label="t('settings.account.lastName')"
      />

      <BInput
        :model-value="authStore.user?.email || ''"
        :label="t('settings.account.email')"
        :hint="t('settings.account.emailReadonly')"
        disabled
      />

      <template #footer>
        <BButton variant="accent" :loading="savingProfile" @click="handleSaveProfile">
          {{ t('settings.account.save') }}
        </BButton>
      </template>
    </BCard>

    <!-- Change Password -->
    <BCard variant="bordered" padding="lg" class="ds-settings__section">
      <template #header>
        <h2 class="ds-section-header__title">{{ t('settings.account.changePassword') }}</h2>
      </template>

      <BInput
        v-model="currentPassword"
        :label="t('settings.account.currentPassword')"
        type="password"
      />

      <BInput
        v-model="newPassword"
        :label="t('settings.account.newPassword')"
        type="password"
      />

      <BInput
        v-model="confirmPassword"
        :label="t('settings.account.confirmPassword')"
        type="password"
        :error="passwordError"
      />

      <template #footer>
        <BButton
          variant="accent"
          :loading="savingPassword"
          :disabled="!canSubmitPassword"
          @click="handleChangePassword"
        >
          {{ t('settings.account.save') }}
        </BButton>
      </template>
    </BCard>

    <!-- Data & Privacy (GDPR) -->
    <BCard variant="bordered" padding="lg" class="ds-settings__section">
      <template #header>
        <h2 class="ds-section-header__title">{{ t('settings.dataPrivacy.title') }}</h2>
      </template>

      <p class="ds-settings__hint">{{ t('settings.dataPrivacy.subtitle') }}</p>

      <div class="ds-settings__data-actions">
        <div class="ds-settings__data-action">
          <div>
            <h3 class="ds-settings__data-action-title">{{ t('settings.dataPrivacy.exportTitle') }}</h3>
            <p class="ds-settings__data-action-desc">{{ t('settings.dataPrivacy.exportDesc') }}</p>
          </div>
          <BButton variant="ghost" :loading="exportingData" @click="handleExportData">
            <i class="bi bi-download me-2" />
            {{ t('settings.dataPrivacy.exportButton') }}
          </BButton>
        </div>

        <div class="ds-settings__data-action ds-settings__data-action--danger">
          <div>
            <h3 class="ds-settings__data-action-title">{{ t('settings.dataPrivacy.deleteTitle') }}</h3>
            <p class="ds-settings__data-action-desc">{{ t('settings.dataPrivacy.deleteDesc') }}</p>
          </div>
          <BButton variant="danger" :loading="deletingAccount" @click="handleDeleteAccount">
            <i class="bi bi-trash me-2" />
            {{ t('settings.dataPrivacy.deleteButton') }}
          </BButton>
        </div>
      </div>
    </BCard>

    <ConfirmDialog
      :model-value="confirmDialog.isVisible.value"
      :title="confirmDialog.title.value"
      :message="confirmDialog.message.value"
      :confirm-label="confirmDialog.confirmLabel.value"
      :cancel-label="confirmDialog.cancelLabel.value"
      :variant="confirmDialog.variant.value"
      @update:model-value="confirmDialog.isVisible.value = $event"
      @confirm="confirmDialog.confirm()"
      @cancel="confirmDialog.cancel()"
    />
  </div>
</template>
