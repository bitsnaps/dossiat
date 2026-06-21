<script lang="ts" setup>
import { onMounted, computed, ref, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessagesStore } from '@/stores/messages'
import { useAuthStore } from '@/stores/auth'
import MessageBubble from '@/components/messaging/MessageBubble.vue'
import MessageComposer from '@/components/messaging/MessageComposer.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const messagesStore = useMessagesStore()
const authStore = useAuthStore()

const missionId = computed(() => route.params.missionId as string)
const messagesContainer = ref<HTMLElement | null>(null)

onMounted(async () => {
  await messagesStore.fetchMessages(missionId.value)
  const conv = messagesStore.conversations.find((c) => c.missionId === Number(missionId.value))
  if (conv) {
    await messagesStore.markAllAsRead(conv.id.toString())
  }
  scrollToBottom()
})

const userId = computed(() => authStore.user?.id)

const missionTitle = computed(() => {
  const conv = messagesStore.conversations.find((c) => c.missionId === Number(missionId.value))
  return conv?.missionTitle || `Mission #${missionId.value}`
})

async function handleSend(content: string) {
  await messagesStore.sendMessage(missionId.value, content)
  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => messagesStore.messages.length, () => {
  nextTick(scrollToBottom)
})

function goBack() {
  router.push('/app/messages')
}
</script>

<template>
  <div class="ds-message-thread">
    <!-- Header -->
    <div class="ds-message-thread__header">
      <button class="ds-message-thread__back" @click="goBack">
        <i class="bi bi-arrow-left" />
      </button>
      <div class="ds-message-thread__header-info">
        <h2 class="ds-message-thread__title">{{ missionTitle }}</h2>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="messagesStore.loading && messagesStore.messages.length === 0" class="ds-message-thread__loading">
      <div class="spinner-border" role="status" />
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="ds-message-thread__messages">
      <div v-if="messagesStore.messages.length === 0 && !messagesStore.loading" class="ds-message-thread__empty">
        <i class="bi bi-chat-dots" />
        <p>{{ t('messages.noMessages') }}</p>
      </div>

      <MessageBubble
        v-for="msg in messagesStore.messages"
        :key="msg.id"
        :message="msg"
        :is-own="msg.senderId === userId"
      />
    </div>

    <!-- Composer -->
    <MessageComposer
      :disabled="messagesStore.loading"
      @send="handleSend"
    />
  </div>
</template>

<style scoped>
.ds-message-thread {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem);
  max-height: calc(100vh - 4rem);
}

.ds-message-thread__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  flex-shrink: 0;
}

.ds-message-thread__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
  color: var(--ds-text-muted, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
}

.ds-message-thread__back:hover {
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-text, #f1f5f9);
}

.ds-message-thread__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-message-thread__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-message-thread__messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ds-message-thread__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 3rem;
  text-align: center;
  color: var(--ds-text-muted, #64748b);
}

.ds-message-thread__empty i {
  font-size: 2rem;
}
</style>
