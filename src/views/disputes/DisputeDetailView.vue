<script lang="ts" setup>
import { onMounted, computed, ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDisputesStore } from '@/stores/disputes'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import BModal from '@/components/base/BModal.vue'
import MessageBubble from '@/components/messaging/MessageBubble.vue'
import MessageComposer from '@/components/messaging/MessageComposer.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const disputesStore = useDisputesStore()
const authStore = useAuthStore()
const toast = useToast()

const disputeId = computed(() => route.params.id as string)
const messagesContainer = ref<HTMLElement | null>(null)
const showResolveModal = ref(false)
const resolutionText = ref('')

onMounted(async () => {
  await disputesStore.fetchDispute(disputeId.value)
  scrollToBottom()
})

const userId = computed(() => authStore.user?.id)

const dispute = computed(() => disputesStore.currentDispute)

const isOpen = computed(() => dispute.value?.status === 'open' || dispute.value?.status === 'reconciling')
const isResolved = computed(() => dispute.value?.status === 'resolved')

function statusVariant(status: string) {
  const map: Record<string, string> = {
    open: 'accent',
    reconciling: 'info',
    resolved: 'success',
    escalated: 'warning',
  }
  return map[status] || 'default'
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function goBack() {
  router.push('/app/disputes')
}

async function handleSend(content: string) {
  await disputesStore.sendMessage(disputeId.value, content)
  toast.success(t('disputes.detail.messageSent'))
  await nextTick()
  scrollToBottom()
}

async function handleResolve() {
  if (!resolutionText.value.trim()) return
  try {
    await disputesStore.resolveDispute(disputeId.value, resolutionText.value)
    showResolveModal.value = false
    resolutionText.value = ''
    toast.success(t('disputes.detail.resolved'))
  } catch {
    toast.error('Failed to resolve dispute')
  }
}

async function handleEscalate() {
  if (!confirm(t('disputes.detail.escalateConfirm'))) return
  try {
    await disputesStore.escalateDispute(disputeId.value)
    toast.success(t('disputes.detail.escalated'))
  } catch {
    toast.error('Failed to escalate dispute')
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => dispute.value?.messages?.length, () => {
  nextTick(scrollToBottom)
})
</script>

<template>
  <div class="ds-dispute-detail">
    <!-- Header -->
    <div class="ds-dispute-detail__header">
      <button class="ds-dispute-detail__back" @click="goBack">
        <i class="bi bi-arrow-left" />
        {{ t('disputes.detail.actions.back') }}
      </button>
      <div class="ds-dispute-detail__header-info" v-if="dispute">
        <h2 class="ds-dispute-detail__title">{{ t('disputes.detail.title', { id: dispute.id }) }}</h2>
        <div class="ds-dispute-detail__badges">
          <BBadge :variant="statusVariant(dispute.status) as any">
            {{ t(`disputes.status.${dispute.status}`) }}
          </BBadge>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="disputesStore.loading && !dispute" class="ds-dispute-detail__loading">
      <div class="spinner-border" role="status" />
    </div>

    <!-- Not Found -->
    <div v-else-if="!dispute" class="ds-dispute-detail__empty">
      <p>Dispute not found.</p>
    </div>

    <!-- Dispute Content -->
    <template v-else>
      <!-- Info Cards -->
      <div class="ds-dispute-detail__info">
        <BCard variant="bordered" padding="md" class="ds-dispute-detail__info-card">
          <span class="ds-dispute-detail__info-label">{{ t('disputes.detail.mission') }}</span>
          <span class="ds-dispute-detail__info-value">
            {{ dispute.mission?.title || `Mission #${dispute.missionId}` }}
          </span>
        </BCard>
        <BCard variant="bordered" padding="md" class="ds-dispute-detail__info-card">
          <span class="ds-dispute-detail__info-label">{{ t('disputes.detail.initiator') }}</span>
          <span class="ds-dispute-detail__info-value">
            {{ dispute.initiator ? `${dispute.initiator.firstName} ${dispute.initiator.lastName}` : `#${dispute.initiatedBy}` }}
          </span>
        </BCard>
        <BCard variant="bordered" padding="md" class="ds-dispute-detail__info-card">
          <span class="ds-dispute-detail__info-label">{{ t('disputes.detail.reason') }}</span>
          <span class="ds-dispute-detail__info-value">{{ dispute.reason }}</span>
        </BCard>
      </div>

      <!-- Resolution Info (if resolved) -->
      <BCard v-if="isResolved && dispute.resolution" variant="bordered" padding="md" class="ds-dispute-detail__resolution">
        <h3 class="ds-dispute-detail__section-title">{{ t('disputes.detail.resolution') }}</h3>
        <p class="ds-dispute-detail__resolution-text">{{ dispute.resolution }}</p>
        <span class="ds-dispute-detail__resolution-date" v-if="dispute.resolvedAt">
          {{ t('disputes.detail.resolvedAt') }}: {{ formatDate(dispute.resolvedAt) }}
        </span>
      </BCard>

      <!-- Actions -->
      <div v-if="isOpen" class="ds-dispute-detail__actions">
        <BButton variant="accent" @click="showResolveModal = true">
          {{ t('disputes.detail.actions.resolve') }}
        </BButton>
        <BButton variant="outline" @click="handleEscalate">
          {{ t('disputes.detail.actions.escalate') }}
        </BButton>
      </div>

      <!-- Messages -->
      <BCard variant="bordered" padding="none" class="ds-dispute-detail__messages-card">
        <template #header>
          <h3 class="ds-dispute-detail__section-title">{{ t('disputes.detail.messages') }}</h3>
        </template>

        <div ref="messagesContainer" class="ds-dispute-detail__messages">
          <div v-if="!dispute.messages || dispute.messages.length === 0" class="ds-dispute-detail__no-messages">
            <i class="bi bi-chat-dots" />
            <p>{{ t('disputes.detail.noMessages') }}</p>
          </div>

          <MessageBubble
            v-for="msg in dispute.messages"
            :key="msg.id"
            :message="{ ...msg, conversationId: msg.disputeId } as any"
            :is-own="msg.senderId === userId"
          />
        </div>

        <MessageComposer
          v-if="isOpen"
          :disabled="disputesStore.loading"
          @send="handleSend"
        />
      </BCard>
    </template>

    <!-- Resolve Modal -->
    <BModal
      :modelValue="showResolveModal"
      :title="t('disputes.detail.resolveModal.title')"
      @update:modelValue="showResolveModal = $event"
    >
      <div class="ds-dispute-detail__resolve-form">
        <p>{{ t('disputes.detail.resolveModal.message') }}</p>
        <textarea
          v-model="resolutionText"
          class="ds-dispute-detail__resolve-textarea"
          :placeholder="t('disputes.detail.resolveModal.placeholder')"
          rows="4"
        />
      </div>
      <template #footer>
        <BButton variant="ghost" @click="showResolveModal = false">
          {{ t('disputes.detail.resolveModal.cancel') }}
        </BButton>
        <BButton variant="accent" :disabled="!resolutionText.trim()" @click="handleResolve">
          {{ t('disputes.detail.resolveModal.confirm') }}
        </BButton>
      </template>
    </BModal>
  </div>
</template>

<style scoped>
.ds-dispute-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ds-dispute-detail__header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.ds-dispute-detail__back {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: none;
  border: none;
  color: var(--ds-text-muted, #64748b);
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0;
  transition: color 0.15s ease;
}

.ds-dispute-detail__back:hover {
  color: var(--ds-accent, #6366f1);
}

.ds-dispute-detail__header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ds-dispute-detail__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-dispute-detail__badges {
  display: flex;
  gap: 0.5rem;
}

.ds-dispute-detail__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-dispute-detail__empty {
  display: flex;
  justify-content: center;
  padding: 3rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-dispute-detail__info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.ds-dispute-detail__info-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ds-dispute-detail__info-label {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ds-dispute-detail__info-value {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
}

.ds-dispute-detail__resolution {
  background: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.2);
}

.ds-dispute-detail__section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-dispute-detail__resolution-text {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
  line-height: 1.6;
  margin: 0.5rem 0 0;
}

.ds-dispute-detail__resolution-date {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
  margin-top: 0.5rem;
  display: block;
}

.ds-dispute-detail__actions {
  display: flex;
  gap: 0.5rem;
}

.ds-dispute-detail__messages-card {
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ds-dispute-detail__messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 200px;
}

.ds-dispute-detail__no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  text-align: center;
  color: var(--ds-text-muted, #64748b);
}

.ds-dispute-detail__no-messages i {
  font-size: 2rem;
}

.ds-dispute-detail__resolve-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ds-dispute-detail__resolve-textarea {
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

.ds-dispute-detail__resolve-textarea:focus {
  outline: none;
  border-color: var(--ds-accent, #6366f1);
}

@media (max-width: 768px) {
  .ds-dispute-detail__info {
    grid-template-columns: 1fr;
  }
}
</style>
