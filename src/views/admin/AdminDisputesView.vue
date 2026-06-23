<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '@/stores/admin'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/common/Pagination.vue'
import BSelect from '@/components/base/BSelect.vue'
import BTable from '@/components/base/BTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const { t } = useI18n()
const adminStore = useAdminStore()

const statusFilter = ref('')
const { page, perPage, total, totalPages, goTo } = usePagination()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'reason', label: t('admin.disputes.reason'), formatter: (row: any) => row.reason?.substring(0, 60) + (row.reason?.length > 60 ? '...' : '') },
  { key: 'status', label: t('admin.disputes.status') },
  { key: 'mission', label: t('admin.disputes.mission'), formatter: (row: any) => row.mission?.title || '-' },
  { key: 'initiator', label: t('admin.disputes.initiator'), formatter: (row: any) => row.initiator ? `${row.initiator.firstName} ${row.initiator.lastName}` : '-' },
  { key: 'actions', label: '' },
]

async function loadData() {
  await adminStore.fetchDisputes({
    page: page.value,
    limit: perPage.value,
    status: statusFilter.value || undefined,
  })
  total.value = adminStore.pagination.disputes?.total || 0
}

onMounted(loadData)

async function onStatusChange(value: string) {
  statusFilter.value = value
  goTo(1)
  await loadData()
}
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <h1 class="ds-admin-page__title">{{ t('admin.disputes.listTitle') }}</h1>
    </div>

    <div class="ds-admin-page__filters">
      <BSelect
        :model-value="statusFilter"
        @update:model-value="onStatusChange"
        :options="[
          { value: '', label: t('admin.disputes.allStatuses') },
          { value: 'open', label: 'Open' },
          { value: 'reconciling', label: 'Reconciling' },
          { value: 'resolved', label: 'Resolved' },
          { value: 'escalated', label: 'Escalated' },
        ]"
      />
    </div>

    <BTable
      :columns="columns"
      :rows="adminStore.disputes"
      :loading="adminStore.loading.disputes"
    >
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
      <template #cell-actions="{ row }">
        <RouterLink :to="`/app/admin/disputes/${row.id}`" class="ds-btn ds-btn--sm ds-btn--outline">
          {{ t('admin.disputes.view') }}
        </RouterLink>
      </template>
    </BTable>

    <Pagination
      :model-value="page"
      :total-pages="totalPages"
      @update:model-value="goTo"
    />
  </div>
</template>
