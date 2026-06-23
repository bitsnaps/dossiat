<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '@/stores/admin'
import { usePagination } from '@/composables/usePagination'
import SearchInput from '@/components/common/SearchInput.vue'
import Pagination from '@/components/common/Pagination.vue'
import BSelect from '@/components/base/BSelect.vue'
import BTable from '@/components/base/BTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const { t } = useI18n()
const adminStore = useAdminStore()

const search = ref('')
const statusFilter = ref('')
const { page, perPage, total, totalPages, goTo } = usePagination()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: t('admin.missions.title') },
  { key: 'status', label: t('admin.missions.status') },
  { key: 'type', label: t('admin.missions.type') },
  { key: 'agent', label: t('admin.missions.agent'), formatter: (row: any) => row.agent ? `${row.agent.firstName} ${row.agent.lastName}` : '-' },
  { key: 'client', label: t('admin.missions.client'), formatter: (row: any) => row.client ? `${row.client.firstName} ${row.client.lastName}` : '-' },
  { key: 'actions', label: '' },
]

async function loadData() {
  await adminStore.fetchMissions({ page: page.value, limit: perPage.value, search: search.value || undefined, status: statusFilter.value || undefined })
  total.value = adminStore.pagination.missions?.total || 0
}

onMounted(loadData)

async function onSearch(value: string) {
  search.value = value
  goTo(1)
  await loadData()
}

async function onStatusChange(value: string) {
  statusFilter.value = value
  goTo(1)
  await loadData()
}
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <h1 class="ds-admin-page__title">{{ t('admin.missions.listTitle') }}</h1>
    </div>

    <div class="ds-admin-page__filters">
      <SearchInput :model-value="search" @update:model-value="onSearch" :placeholder="t('admin.missions.search')" />
      <BSelect
        :model-value="statusFilter"
        @update:model-value="onStatusChange"
        :options="[
          { value: '', label: t('admin.missions.allStatuses') },
          { value: 'draft', label: 'Draft' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'disputed', label: 'Disputed' },
          { value: 'cancelled', label: 'Cancelled' },
        ]"
      />
    </div>

    <BTable
      :columns="columns"
      :rows="adminStore.missions"
      :loading="adminStore.loading.missions"
    >
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
      <template #cell-actions="{ row }">
        <RouterLink :to="`/app/admin/missions/${row.id}`" class="ds-btn ds-btn--sm ds-btn--outline">
          {{ t('admin.missions.view') }}
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
