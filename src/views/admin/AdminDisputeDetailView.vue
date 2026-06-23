<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import BCard from '@/components/base/BCard.vue'
import BInput from '@/components/base/BInput.vue'
import BButton from '@/components/base/BButton.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const route = useRoute()
const adminStore = useAdminStore()
const toast = useToast()

const disputeId = computed(() => route.params.id as string)
const resolution = ref('')

onMounted(() => {
  adminStore.fetchDispute(disputeId.value)
})

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
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <RouterLink to="/app/admin/disputes" class="ds-admin-page__back">
        <i class="bi bi-arrow-left" /> {{ t('admin.disputes.back') }}
      </RouterLink>
      <h1 class="ds-admin-page__title">{{ t('admin.disputes.detail') }}</h1>
    </div>

    <div v-if="adminStore.loading.dispute" class="ds-admin-page__loading">
      <span class="ds-spinner" />
    </div>

    <template v-else-if="adminStore.selectedDispute">
      <BCard class="ds-admin-detail__card">
        <div class="ds-admin-detail__info">
          <div class="ds-admin-detail__meta">
            <StatusBadge :status="adminStore.selectedDispute.status" />
          </div>
          <p>{{ adminStore.selectedDispute.reason }}</p>
          <div v-if="adminStore.selectedDispute.mission" class="ds-admin-detail__meta">
            <span>{{ t('admin.disputes.mission') }}: {{ adminStore.selectedDispute.mission.title }}</span>
          </div>
          <div v-if="adminStore.selectedDispute.initiator" class="ds-admin-detail__meta">
            <span>{{ t('admin.disputes.initiatedBy') }}: {{ adminStore.selectedDispute.initiator.firstName }} {{ adminStore.selectedDispute.initiator.lastName }}</span>
          </div>
        </div>
      </BCard>

      <BCard v-if="adminStore.selectedDispute.messages?.length" class="ds-admin-detail__card">
        <h3>{{ t('admin.disputes.messages') }}</h3>
        <div class="ds-admin-detail__messages">
          <div v-for="msg in adminStore.selectedDispute.messages" :key="msg.id" class="ds-admin-detail__message">
            <strong>{{ msg.sender?.firstName }} {{ msg.sender?.lastName }}</strong>
            <span class="text-muted">{{ msg.createdAt }}</span>
            <p>{{ msg.content }}</p>
          </div>
        </div>
      </BCard>

      <BCard v-if="adminStore.selectedDispute.status !== 'resolved'" class="ds-admin-detail__card">
        <h3>{{ t('admin.disputes.resolveDispute') }}</h3>
        <BInput
          v-model="resolution"
          :label="t('admin.disputes.resolution')"
          :placeholder="t('admin.disputes.resolutionPlaceholder')"
        />
        <BButton @click="handleResolve" :disabled="!resolution.trim()">
          {{ t('admin.disputes.resolve') }}
        </BButton>
      </BCard>
    </template>
  </div>
</template>
