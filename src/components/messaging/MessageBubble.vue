<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface MessageSender {
  id: number
  firstName: string
  lastName: string
}

interface MessageAttachment {
  id: number
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
}

interface Message {
  id: number
  conversationId: number
  senderId: number
  content: string
  readAt?: string | null
  createdAt?: string
  sender?: MessageSender
  attachments?: MessageAttachment[]
}

interface Props {
  message: Message
  isOwn: boolean
}

const props = defineProps<Props>()

const senderName = computed(() => {
  if (!props.message.sender) return ''
  return `${props.message.sender.firstName} ${props.message.sender.firstName}`
})

const formattedTime = computed(() => {
  if (!props.message.createdAt) return ''
  const date = new Date(props.message.createdAt)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return t('messages.justNow')
  if (minutes < 60) return t('messages.minutesAgo', { n: minutes })
  if (hours < 24) return t('messages.hoursAgo', { n: hours })
  return t('messages.daysAgo', { n: days })
})

const isRead = computed(() => !!props.message.readAt)
</script>

<template>
  <div class="ds-message-bubble" :class="{ 'ds-message-bubble--own': isOwn }">
    <div v-if="!isOwn && message.sender" class="ds-message-bubble__sender">
      <span class="ds-message-bubble__name">{{ senderName }}</span>
    </div>

    <div class="ds-message-bubble__body">
      <div class="ds-message-bubble__content">{{ message.content }}</div>

      <div class="ds-message-bubble__footer">
        <span class="ds-message-bubble__time">{{ formattedTime }}</span>
        <span v-if="isOwn" class="ds-message-bubble__status">
          <i v-if="isRead" class="bi bi-check2-all ds-message-bubble__icon--read" />
          <i v-else class="bi bi-check2 ds-message-bubble__icon--unread" />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ds-message-bubble {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 75%;
}

.ds-message-bubble--own {
  align-self: flex-end;
  align-items: flex-end;
}

.ds-message-bubble__sender {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.ds-message-bubble__name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ds-text-muted, #64748b);
}

.ds-message-bubble__body {
  display: flex;
  flex-direction: column;
  padding: 0.625rem 0.875rem;
  border-radius: 1rem;
  background: var(--ds-bg-elevated, #1e293b);
  border: 1px solid var(--ds-border, #334155);
}

.ds-message-bubble--own .ds-message-bubble__body {
  background: var(--ds-accent, #6366f1);
  border-color: var(--ds-accent, #6366f1);
  color: #fff;
}

.ds-message-bubble__content {
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.ds-message-bubble__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

.ds-message-bubble__time {
  font-size: 0.6875rem;
  opacity: 0.6;
}

.ds-message-bubble__status {
  display: flex;
  align-items: center;
}

.ds-message-bubble__icon--read {
  color: #60a5fa;
  font-size: 0.75rem;
}

.ds-message-bubble__icon--unread {
  opacity: 0.5;
  font-size: 0.75rem;
}

.ds-message-bubble--own .ds-message-bubble__icon--read {
  color: rgba(255, 255, 255, 0.9);
}
</style>
