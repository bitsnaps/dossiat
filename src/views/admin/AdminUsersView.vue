<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '@/stores/admin'
import { usePagination } from '@/composables/usePagination'
import SearchInput from '@/components/common/SearchInput.vue'
import Pagination from '@/components/common/Pagination.vue'
import BSelect from '@/components/base/BSelect.vue'
import BButton from '@/components/base/BButton.vue'
import BTable from '@/components/base/BTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const adminStore = useAdminStore()
const toast = useToast()
const { showConfirm } = useConfirmDialog()

const search = ref('')
const roleFilter = ref('')
const { page, perPage, total, totalPages, goTo } = usePagination()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: t('admin.users.name'), formatter: (row: any) => `${row.firstName} ${row.lastName}` },
  { key: 'email', label: t('admin.users.email') },
  { key: 'role', label: t('admin.users.role') },
  { key: 'emailVerified', label: t('admin.users.verified') },
  { key: 'actions', label: t('admin.users.actions') },
]

async function loadData() {
  await adminStore.fetchUsers({ page: page.value, limit: perPage.value, search: search.value || undefined, role: roleFilter.value || undefined })
  total.value = adminStore.pagination.users?.total || 0
}

onMounted(loadData)

async function onSearch(value: string) {
  search.value = value
  goTo(1)
  await loadData()
}

async function onRoleChange(value: string) {
  roleFilter.value = value
  goTo(1)
  await loadData()
}

async function handleDeactivate(id: number) {
  const confirmed = await showConfirm({ title: t('admin.users.deactivateConfirm') })
  if (!confirmed) return
  try {
    await adminStore.deleteUser(id.toString())
    toast.success(t('admin.users.deactivated'))
    await loadData()
  } catch {
    toast.error(t('admin.users.deactivateError'))
  }
}
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <h1 class="ds-admin-page__title">{{ t('admin.users.title') }}</h1>
    </div>

    <div class="ds-admin-page__filters">
      <SearchInput :model-value="search" @update:model-value="onSearch" :placeholder="t('admin.users.search')" />
      <BSelect
        :model-value="roleFilter"
        @update:model-value="onRoleChange"
        :options="[
          { value: '', label: t('admin.users.allRoles') },
          { value: 'agent', label: 'Agent' },
          { value: 'client', label: 'Client' },
          { value: 'admin', label: 'Admin' },
        ]"
      />
    </div>

    <BTable
      :columns="columns"
      :rows="adminStore.users"
      :loading="adminStore.loading.users"
    >
      <template #cell-role="{ row }">
        <StatusBadge :status="row.role" />
      </template>
      <template #cell-emailVerified="{ row }">
        <i :class="['bi', row.emailVerified ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted']" />
      </template>
      <template #cell-actions="{ row }">
        <div class="ds-admin-actions">
          <RouterLink :to="`/app/admin/users/${row.id}`" class="ds-btn ds-btn--sm ds-btn--outline">
            {{ t('admin.users.view') }}
          </RouterLink>
          <BButton
            size="sm"
            variant="danger"
            outline
            @click="handleDeactivate(row.id)"
          >
            {{ t('admin.users.deactivate') }}
          </BButton>
        </div>
      </template>
    </BTable>

    <Pagination
      :model-value="page"
      :total-pages="totalPages"
      @update:model-value="goTo"
    />
  </div>
</template>
