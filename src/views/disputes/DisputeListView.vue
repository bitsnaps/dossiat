<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDisputesStore } from '@/stores/disputes'
import BCard from '@/components/base/BCard.vue'
import BBadge from '@/components/base/BBadge.vue'
import BButton from '@/components/base/BButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const { t } = useI18n()
const router = useRouter()
const disputesStore = useDisputesStore()

onMounted(() => {
  disputesStore.fetchDisputes()
})

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
  })
}

function viewDispute(id: number) {
  router.push(`/app/disputes/${id}`)
}

function goToInitiate() {
  router.push('/app/disputes/initiate')
}
</script>

<template>
  <div class="ds-dispute-list">
    <div class="ds-dispute-list__header">
      <div>
        <h1 class="ds-dispute-list__title">{{ t('disputes.title') }}</h1>
        <p class="ds-dispute-list__subtitle">{{ t('disputes.subtitle') }}</p>
      </div>
      <BButton variant="accent" class="ds-dispute-list__initiate-btn" @click="goToInitiate">
        {{ t('disputes.initiate') }}
      </BButton>
    </div>

    <!-- Loading -->
    <div v-if="disputesStore.loading" class="ds-dispute-list__loading">
      <div class="spinner-border" role="status" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="disputesStore.disputes.length === 0"
      icon="bi-flag"
      :title="t('disputes.noDisputes')"
      :hint="t('disputes.noDisputesHint')"
    />

    <!-- Dispute List -->
    <BCard v-else variant="bordered" padding="none" class="ds-dispute-list__card">
      <div
        v-for="dispute in disputesStore.disputes"
        :key="dispute.id"
        class="ds-dispute-list__item"
        @click="viewDispute(dispute.id)"
      >
        <div class="ds-dispute-list__item-main">
          <div class="ds-dispute-list__item-top">
            <span class="ds-dispute-list__mission-title">
              {{ dispute.mission?.title || `Mission #${dispute.missionId}` }}
            </span>
            <BBadge :variant="statusVariant(dispute.status) as any" size="sm">
              {{ t(`disputes.status.${dispute.status}`) }}
            </BBadge>
          </div>
          <div class="ds-dispute-list__item-bottom">
            <span class="ds-dispute-list__initiator">
              {{ dispute.initiator ? `${dispute.initiator.firstName} ${dispute.initiator.lastName}` : `#${dispute.initiatedBy}` }}
            </span>
            <span class="ds-dispute-list__date">{{ formatDate(dispute.createdAt) }}</span>
          </div>
        </div>
        <div class="ds-dispute-list__item-action">
          <BButton variant="ghost" size="sm">
            {{ t('disputes.view') }}
          </BButton>
        </div>
      </div>
    </BCard>
  </div>
</template>

<style scoped>
.ds-dispute-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ds-dispute-list__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.ds-dispute-list__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-dispute-list__subtitle {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0.25rem 0 0;
}

.ds-dispute-list__loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.ds-dispute-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  text-align: center;
}

.ds-dispute-list__empty-icon {
  font-size: 3rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-dispute-list__empty-title {
  font-size: 1rem;
  color: var(--ds-text, #f1f5f9);
  margin: 0;
}

.ds-dispute-list__empty-hint {
  font-size: 0.875rem;
  color: var(--ds-text-muted, #64748b);
  margin: 0;
}

.ds-dispute-list__card {
  overflow: hidden;
}

.ds-dispute-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  cursor: pointer;
  transition: background 0.15s ease;
}

.ds-dispute-list__item:last-child {
  border-bottom: none;
}

.ds-dispute-list__item:hover {
  background: var(--ds-bg-hover, rgba(99, 102, 241, 0.05));
}

.ds-dispute-list__item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.ds-dispute-list__item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.ds-dispute-list__mission-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-dispute-list__item-bottom {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ds-dispute-list__initiator {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-dispute-list__date {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-dispute-list__item-action {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .ds-dispute-list__header {
    flex-direction: column;
  }
  .ds-dispute-list__item {
    flex-direction: column;
    align-items: flex-start;
  }
  .ds-dispute-list__item-action {
    align-self: flex-end;
  }
}
</style>
