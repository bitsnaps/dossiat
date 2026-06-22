<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/composables/useToast'
import BCard from '@/components/base/BCard.vue'
import BCheckbox from '@/components/base/BCheckbox.vue'
import BButton from '@/components/base/BButton.vue'
import Breadcrumb from '@/components/common/Breadcrumb.vue'

const { t } = useI18n()
const toast = useToast()

const saving = ref(false)

const missionUpdates = ref(true)
const paymentNotifications = ref(true)
const newMessages = ref(true)
const disputeUpdates = ref(false)
const marketingEmails = ref(false)

const breadcrumbs = [
  { label: t('settings.title'), to: '/app/settings' },
  { label: t('settings.nav.notifications') },
]

async function handleSave() {
  saving.value = true
  try {
    // In a real app, this would call an API to save notification preferences
    toast.success(t('settings.notifications.saved'))
  } catch (err: any) {
    toast.error(err.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="ds-notification-settings">
    <Breadcrumb :items="breadcrumbs" />

    <h1 class="ds-page-title">{{ t('settings.notifications.title') }}</h1>
    <p class="ds-page-subtitle">{{ t('settings.notifications.subtitle') }}</p>

    <BCard variant="bordered" padding="lg" class="ds-settings__section">
      <BCheckbox
        v-model="missionUpdates"
        :label="t('settings.notifications.missionUpdates')"
        :hint="t('settings.notifications.missionUpdatesHint')"
      />

      <BCheckbox
        v-model="paymentNotifications"
        :label="t('settings.notifications.paymentNotifications')"
        :hint="t('settings.notifications.paymentNotificationsHint')"
      />

      <BCheckbox
        v-model="newMessages"
        :label="t('settings.notifications.newMessages')"
        :hint="t('settings.notifications.newMessagesHint')"
      />

      <BCheckbox
        v-model="disputeUpdates"
        :label="t('settings.notifications.disputeUpdates')"
        :hint="t('settings.notifications.disputeUpdatesHint')"
      />

      <BCheckbox
        v-model="marketingEmails"
        :label="t('settings.notifications.marketingEmails')"
        :hint="t('settings.notifications.marketingEmailsHint')"
      />

      <template #footer>
        <BButton variant="accent" :loading="saving" @click="handleSave">
          {{ t('settings.notifications.save') }}
        </BButton>
      </template>
    </BCard>
  </div>
</template>
