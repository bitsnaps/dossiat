<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessagesStore } from '@/stores/messages'
import { useAuthStore } from '@/stores/auth'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const { t } = useI18n()
const router = useRouter()
const messagesStore = useMessagesStore()
const authStore = useAuthStore()

onMounted(() => {
  messagesStore.fetchConversations()
})

const userId = computed(() => authStore.user?.id)

function formatTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return t('messages.justNow')
  if (minutes < 60) return t('messages.minutesAgo', { n: minutes })
  if (hours < 24) return t('messages.hoursAgo', { n: hours })
  return t('messages.daysAgo', { n: days })
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '…'
}

function openConversation(missionId: number) {
  router.push(`/app/messages/${missionId}`)
}

function hasUnread(conv: any): boolean {
  return conv.unreadCount > 0
}

function lastMessagePreview(conv: any): string {
  if (!conv.lastMessage) return t('messages.noMessages')
  const prefix = conv.lastMessage.senderId === userId.value ? `${t('messages.you')}: ` : ''
  return prefix + truncate(conv.lastMessage.content, 60)
}
</script>

<template>
  <div class="ds-message-list-view">
    <div class="ds-message-list-view__header">
      <h1 class="ds-message-list-view__title">{{ t('messages.title') }}</h1>
    </div>

    <!-- Loading — Skeleton -->
    <div v-if="messagesStore.loading" class="ds-message-list-view__loading">
      <BCard variant="bordered" padding="none">
        <div v-for="i in 5" :key="i" class="ds-message-list-view__item">
          <SkeletonLoader variant="avatar" width="40px" height="40px" />
          <div class="ds-message-list-view__content">
            <SkeletonLoader variant="text" width="60%" height="12px" />
            <SkeletonLoader variant="text" width="80%" height="10px" />
          </div>
        </div>
      </BCard>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="messagesStore.conversations.length === 0"
      icon="bi-chat-dots"
      :title="t('messages.noConversations')"
      :hint="t('messages.noConversationsHint')"
    />

    <!-- Conversation List -->
    <BCard v-else variant="bordered" padding="none" class="ds-message-list-view__card">
      <div
        v-for="conv in messagesStore.conversations"
        :key="conv.id"
        class="ds-message-list-view__item"
        :class="{ 'ds-message-list-view__item--unread': hasUnread(conv) }"
        @click="openConversation(conv.missionId)"
      >
        <div class="ds-message-list-view__avatar">
          <div class="ds-message-list-view__avatar-circle">
            <i class="bi bi-person" />
          </div>
          <span v-if="hasUnread(conv)" class="ds-message-list-view__unread-dot" />
        </div>

        <div class="ds-message-list-view__content">
          <div class="ds-message-list-view__top">
            <span class="ds-message-list-view__mission">{{ conv.missionTitle }}</span>
            <span class="ds-message-list-view__time">{{ conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : '' }}</span>
          </div>
          <div class="ds-message-list-view__bottom">
            <span class="ds-message-list-view__preview" :class="{ 'ds-message-list-view__preview--unread': hasUnread(conv) }">
              {{ lastMessagePreview(conv) }}
            </span>
            <BBadge v-if="hasUnread(conv)" variant="accent" size="sm">
              {{ conv.unreadCount }}
            </BBadge>
          </div>
        </div>
      </div>
    </BCard>
  </div>
</template>

<style scoped>
.ds-message-list-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ds-message-list-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ds-message-list-view__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-message-list-view__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-message-list-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  text-align: center;
}

.ds-message-list-view__empty-icon {
  font-size: 3rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-message-list-view__empty-title {
  font-size: 1rem;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-message-list-view__empty-hint {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-message-list-view__card {
  overflow: hidden;
}

.ds-message-list-view__item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  cursor: pointer;
  transition: background 0.15s ease;
}

.ds-message-list-view__item:last-child {
  border-bottom: none;
}

.ds-message-list-view__item:hover {
  background: var(--ds-bg-hover, rgba(99, 102, 241, 0.05));
}

.ds-message-list-view__item--unread {
  background: rgba(99, 102, 241, 0.05);
}

.ds-message-list-view__avatar {
  position: relative;
  flex-shrink: 0;
}

.ds-message-list-view__avatar-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--ds-bg-elevated, #1e293b);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ds-text-muted, #64748b);
}

.ds-message-list-view__unread-dot {
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ds-accent, #6366f1);
}

.ds-message-list-view__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.ds-message-list-view__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ds-message-list-view__mission {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-message-list-view__time {
  font-size: 0.6875rem;
  color: var(--ds-text-muted, #64748b);
  flex-shrink: 0;
}

.ds-message-list-view__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ds-message-list-view__preview {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-message-list-view__preview--unread {
  color: var(--ds-text, #f1f5f9);
  font-weight: 500;
}

@media (max-width: 640px) {
  .ds-message-list-view__item {
    padding: 0.75rem;
  }
}
</style>
