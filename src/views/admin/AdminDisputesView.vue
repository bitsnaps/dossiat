<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '@/stores/admin'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/common/Pagination.vue'
import SearchInput from '@/components/common/SearchInput.vue'
import BSelect from '@/components/base/BSelect.vue'
import BTable from '@/components/base/BTable.vue'
import BButton from '@/components/base/BButton.vue'
import BModal from '@/components/base/BModal.vue'
import BInput from '@/components/base/BInput.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const adminStore = useAdminStore()
const toast = useToast()
const { isVisible: isConfirmVisible, title: confirmTitle, message: confirmMessage, variant: confirmVariant, showConfirm, confirm, cancel } = useConfirmDialog()

const statusFilter = ref('')
const searchQuery = ref('')
const { page, perPage, total, totalPages, goTo } = usePagination()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'reason', label: t('admin.disputes.reason'), formatter: (_value: any, row: any) => row.reason?.substring(0, 60) + (row.reason?.length > 60 ? '...' : '') },
  { key: 'status', label: t('admin.disputes.status') },
  { key: 'mission', label: t('admin.disputes.mission'), formatter: (_value: any, row: any) => row.mission?.title || '-' },
  { key: 'initiator', label: t('admin.disputes.initiator'), formatter: (_value: any, row: any) => row.initiator ? `${row.initiator.firstName} ${row.initiator.lastName}` : '-' },
  { key: 'actions', label: t('admin.disputes.actions') },
]

// ─── Create Modal ───
const showModal = ref(false)
const formLoading = ref(false)
const form = ref({
  missionId: '',
  initiatedBy: '',
  reason: '',
})

const missionOptions = ref<{ value: string; label: string }[]>([])
const userOptions = ref<{ value: string; label: string }[]>([])

async function loadFormData() {
  await adminStore.fetchMissions({ limit: 100 })
  missionOptions.value = adminStore.missions
    .map(m => ({ value: String(m.id), label: m.title }))

  await adminStore.fetchUsers({ limit: 100 })
  userOptions.value = adminStore.users
    .map(u => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))
}

function resetForm() {
  form.value = {
    missionId: '',
    initiatedBy: '',
    reason: '',
  }
}

async function openCreateModal() {
  resetForm()
  await loadFormData()
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.missionId) {
    toast.error(t('admin.disputes.missionRequired'))
    return
  }
  if (!form.value.initiatedBy) {
    toast.error(t('admin.disputes.initiatedByRequired'))
    return
  }
  if (!form.value.reason.trim()) {
    toast.error(t('admin.disputes.reasonRequired'))
    return
  }

  formLoading.value = true
  try {
    await adminStore.createDispute({
      missionId: Number(form.value.missionId),
      initiatedBy: Number(form.value.initiatedBy),
      reason: form.value.reason,
    })
    toast.success(t('admin.disputes.created'))
    showModal.value = false
    await loadData()
  } catch {
    toast.error(t('admin.disputes.createError'))
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(dispute: any) {
  const confirmed = await showConfirm({
    title: t('admin.disputes.deleteTitle'),
    message: t('admin.disputes.deleteConfirm'),
    variant: 'danger',
  })
  if (!confirmed) return
  try {
    await adminStore.deleteDispute(String(dispute.id))
    toast.success(t('admin.disputes.deleted'))
    await loadData()
  } catch {
    toast.error(t('admin.disputes.deleteError'))
  }
}

async function loadData() {
  await adminStore.fetchDisputes({
    page: page.value,
    limit: perPage.value,
    status: statusFilter.value || undefined,
    search: searchQuery.value || undefined,
  })
  total.value = adminStore.pagination.disputes?.total || 0
}

onMounted(loadData)

async function onStatusChange(value: string) {
  statusFilter.value = value
  goTo(1)
  await loadData()
}

async function onSearch(query: string) {
  searchQuery.value = query
  goTo(1)
  await loadData()
}
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <h1 class="ds-admin-page__title">{{ t('admin.disputes.listTitle') }}</h1>
      <BButton variant="accent" @click="openCreateModal">
        <i class="bi bi-plus-lg" /> {{ t('admin.disputes.createDispute') }}
      </BButton>
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
      <SearchInput
        :model-value="searchQuery"
        @update:model-value="onSearch"
        :placeholder="t('admin.disputes.search')"
      />
    </div>

    <BTable
      :columns="columns"
      :rows="adminStore.disputes"
      :loading="adminStore.loading.disputes"
    >
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" type="dispute" />
      </template>
      <template #cell-actions="{ row }">
        <div class="ds-admin-actions">
          <RouterLink :to="`/app/admin/disputes/${row.id}`" class="ds-btn ds-btn--sm ds-btn--outline">
            {{ t('admin.disputes.view') }}
          </RouterLink>
          <BButton size="sm" variant="danger" outline @click="handleDelete(row)">
            {{ t('admin.disputes.deleteDispute') }}
          </BButton>
        </div>
      </template>
    </BTable>

    <Pagination
      :model-value="page"
      :total-pages="totalPages"
      @update:model-value="goTo"
    />

    <!-- Create Dispute Modal -->
    <BModal v-model="showModal" :title="t('admin.disputes.createTitle')">
      <div class="ds-form">
        <div class="ds-form-group">
          <label>{{ t('admin.disputes.mission') }}</label>
          <BSelect
            v-model="form.missionId"
            :options="[{ value: '', label: t('admin.disputes.selectMission') }, ...missionOptions]"
          />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.disputes.initiator') }}</label>
          <BSelect
            v-model="form.initiatedBy"
            :options="[{ value: '', label: t('admin.disputes.selectInitiator') }, ...userOptions]"
          />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.disputes.reason') }}</label>
          <BInput
            v-model="form.reason"
            :placeholder="t('admin.disputes.resolutionPlaceholder')"
          />
        </div>
      </div>
      <template #footer>
        <BButton variant="accent" :disabled="formLoading" @click="handleSubmit">
          {{ formLoading ? t('admin.disputes.creating') : t('admin.disputes.create') }}
        </BButton>
        <BButton outline @click="showModal = false">
          {{ t('admin.disputes.cancel') }}
        </BButton>
      </template>
    </BModal>

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
.ds-admin-actions {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}
</style>
