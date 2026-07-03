<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import BCard from '@/components/base/BCard.vue'
import BInput from '@/components/base/BInput.vue'
import BButton from '@/components/base/BButton.vue'
import BSelect from '@/components/base/BSelect.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const toast = useToast()
const { isVisible: isConfirmVisible, title: confirmTitle, message: confirmMessage, variant: confirmVariant, showConfirm, confirm, cancel } = useConfirmDialog()

const disputeId = computed(() => route.params.id as string)
const resolution = ref('')
const messageContent = ref('')
const statusValue = ref('')
const messageSending = ref(false)

onMounted(async () => {
  await adminStore.fetchDispute(disputeId.value)
  if (adminStore.selectedDispute) {
    statusValue.value = adminStore.selectedDispute.status
  }
})

// ─── Resolve ───
async function handleResolve() {
  if (!resolution.value.trim()) return
  try {
    await adminStore.resolveDispute(disputeId.value, resolution.value)
    toast.success(t('admin.disputes.resolved'))
    resolution.value = ''
  } catch {
    toast.error(t('admin.disputes.resolveError'))
  }
}

// ─── Escalate ───
async function handleEscalate() {
  const confirmed = await showConfirm({
    title: t('admin.disputes.escalate'),
    message: t('admin.disputes.escalateConfirm'),
    variant: 'accent',
  })
  if (!confirmed) return
  try {
    await adminStore.escalateDispute(disputeId.value)
    toast.success(t('admin.disputes.escalated'))
  } catch {
    toast.error(t('admin.disputes.escalateError'))
  }
}

// ─── Status Update ───
async function handleStatusUpdate() {
  if (!statusValue.value) return
  try {
    await adminStore.updateDisputeStatus(disputeId.value, statusValue.value)
    toast.success(t('admin.disputes.statusUpdated'))
  } catch {
    toast.error(t('admin.disputes.statusUpdateError'))
  }
}

// ─── Send Message ───
async function handleSendMessage() {
  if (!messageContent.value.trim()) return
  messageSending.value = true
  try {
    await adminStore.sendDisputeMessage(disputeId.value, messageContent.value)
    toast.success(t('admin.disputes.messageSent'))
    messageContent.value = ''
  } catch {
    toast.error(t('admin.disputes.messageError'))
  } finally {
    messageSending.value = false
  }
}

// ─── Delete ───
async function handleDelete() {
  const confirmed = await showConfirm({
    title: t('admin.disputes.deleteTitle'),
    message: t('admin.disputes.deleteConfirm'),
    variant: 'danger',
  })
  if (!confirmed) return
  try {
    await adminStore.deleteDispute(disputeId.value)
    toast.success(t('admin.disputes.deleted'))
    router.push('/app/admin/disputes')
  } catch {
    toast.error(t('admin.disputes.deleteError'))
  }
}
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <RouterLink to="/app/admin/disputes" class="ds-admin-page__back">
        <i class="bi bi-arrow-left" /> {{ t('admin.disputes.back') }}
      </RouterLink>
      <h1 class="ds-admin-page__title">{{ t('admin.disputes.detail') }}</h1>
      <div v-if="adminStore.selectedDispute" class="ds-admin-page__actions">
        <BButton
          v-if="adminStore.selectedDispute.status !== 'resolved' && adminStore.selectedDispute.status !== 'escalated'"
          size="sm"
          outline
          @click="handleEscalate"
        >
          <i class="bi bi-arrow-up-right" /> {{ t('admin.disputes.escalate') }}
        </BButton>
        <BButton size="sm" variant="danger" outline @click="handleDelete">
          <i class="bi bi-trash" /> {{ t('admin.disputes.deleteDispute') }}
        </BButton>
      </div>
    </div>

    <div v-if="adminStore.loading.dispute" class="ds-admin-page__loading">
      <span class="ds-spinner" />
    </div>

    <template v-else-if="adminStore.selectedDispute">
      <!-- Dispute Info Card -->
      <BCard class="ds-admin-detail__card">
        <div class="ds-admin-detail__info">
          <div class="ds-admin-detail__meta">
            <StatusBadge :status="adminStore.selectedDispute.status" type="dispute" />
          </div>
          <p>{{ adminStore.selectedDispute.reason }}</p>
          <div v-if="adminStore.selectedDispute.mission" class="ds-admin-detail__meta">
            <span>{{ t('admin.disputes.mission') }}: {{ adminStore.selectedDispute.mission.title }}</span>
          </div>
          <div v-if="adminStore.selectedDispute.initiator" class="ds-admin-detail__meta">
            <span>{{ t('admin.disputes.initiatedBy') }}: {{ adminStore.selectedDispute.initiator.firstName }} {{ adminStore.selectedDispute.initiator.lastName }}</span>
          </div>
          <div v-if="adminStore.selectedDispute.resolution" class="ds-admin-detail__meta">
            <span>{{ t('admin.disputes.resolution') }}: {{ adminStore.selectedDispute.resolution }}</span>
          </div>
        </div>
      </BCard>

      <!-- Status Management -->
      <BCard v-if="adminStore.selectedDispute.status !== 'resolved'" class="ds-admin-detail__card">
        <h3>{{ t('admin.disputes.manageStatus') }}</h3>
        <div class="ds-status-row">
          <BSelect
            v-model="statusValue"
            :options="[
              { value: 'open', label: 'Open' },
              { value: 'reconciling', label: 'Reconciling' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'escalated', label: 'Escalated' },
            ]"
          />
          <BButton size="sm" variant="accent" @click="handleStatusUpdate">
            {{ t('admin.disputes.save') }}
          </BButton>
        </div>
      </BCard>

      <!-- Messages -->
      <BCard class="ds-admin-detail__card">
        <h3>{{ t('admin.disputes.messages') }}</h3>
        <div v-if="adminStore.selectedDispute.messages?.length" class="ds-admin-detail__messages">
          <div v-for="msg in adminStore.selectedDispute.messages" :key="msg.id" class="ds-admin-detail__message">
            <strong>{{ msg.sender?.firstName }} {{ msg.sender?.lastName }}</strong>
            <span class="text-muted">{{ msg.createdAt }}</span>
            <p>{{ msg.content }}</p>
          </div>
        </div>
        <p v-else class="text-muted">{{ t('disputes.detail.noMessages') }}</p>
        <div class="ds-message-composer">
          <BInput
            v-model="messageContent"
            :placeholder="t('admin.disputes.messagePlaceholder')"
          />
          <BButton
            size="sm"
            variant="accent"
            :disabled="!messageContent.trim() || messageSending"
            @click="handleSendMessage"
          >
            {{ messageSending ? '...' : t('admin.disputes.sendMessage') }}
          </BButton>
        </div>
      </BCard>

      <!-- Resolve (only if not resolved) -->
      <BCard v-if="adminStore.selectedDispute.status !== 'resolved'" class="ds-admin-detail__card">
        <h3>{{ t('admin.disputes.resolveDispute') }}</h3>
        <BInput
          v-model="resolution"
          :label="t('admin.disputes.resolution')"
          :placeholder="t('admin.disputes.resolutionPlaceholder')"
        />
        <BButton variant="accent" @click="handleResolve" :disabled="!resolution.trim()">
          {{ t('admin.disputes.resolve') }}
        </BButton>
      </BCard>
    </template>

    <ConfirmDialog
      :model-value="isConfirmVisible"
      :title="confirmTitle"
      :message="confirmMessage"
      :variant="confirmVariant"
      @confirm="confirm"
      @cancel="cancel"
    />
  </div>
</template>

<style scoped>
.ds-admin-page__actions {
  display: flex;
  gap: 0.5rem;
  margin-inline-start: auto;
}
.ds-status-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.5rem;
}
.ds-message-composer {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  margin-top: 1rem;
}
.ds-message-composer > *:first-child {
  flex: 1;
}
</style>
