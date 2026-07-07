<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '@/stores/admin'
import { usePagination } from '@/composables/usePagination'
import { CURRENCY_OPTIONS } from '@/constants/currencies'
import SearchInput from '@/components/common/SearchInput.vue'
import Pagination from '@/components/common/Pagination.vue'
import BSelect from '@/components/base/BSelect.vue'
import BButton from '@/components/base/BButton.vue'
import BTable from '@/components/base/BTable.vue'
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

const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const { page, perPage, total, totalPages, goTo } = usePagination()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: t('admin.missions.title') },
  { key: 'status', label: t('admin.missions.status') },
  { key: 'type', label: t('admin.missions.type') },
  { key: 'agent', label: t('admin.missions.agent'), formatter: (_value: any, row: any) => row.agent ? `${row.agent.firstName} ${row.agent.lastName}` : '-' },
  { key: 'client', label: t('admin.missions.client'), formatter: (_value: any, row: any) => row.client ? `${row.client.firstName} ${row.client.lastName}` : '-' },
  { key: 'actions', label: t('admin.missions.actions') },
]

// ─── Create/Edit Modal ───
const showModal = ref(false)
const isEditing = ref(false)
const editingMissionId = ref<number | null>(null)
const formLoading = ref(false)
const form = ref({
  agentId: '',
  clientId: '',
  title: '',
  description: '',
  type: 'one_time',
  pricingType: 'fixed',
  agreedAmount: '',
  currency: 'USD',
  agreedChecklist: [] as string[],
})
const newChecklistItem = ref('')

// ─── Agent/Client dropdowns ───
const agentOptions = ref<{ value: string; label: string }[]>([])
const clientOptions = ref<{ value: string; label: string }[]>([])

async function loadFormData() {
  // Must be sequential — each fetchUsers call overwrites the shared `users` ref
  await adminStore.fetchUsers({ role: 'agent', limit: 100 })
  agentOptions.value = adminStore.users
    .map(u => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))

  await adminStore.fetchUsers({ role: 'client', limit: 100 })
  clientOptions.value = adminStore.users
    .map(u => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))
}

function resetForm() {
  form.value = {
    agentId: '',
    clientId: '',
    title: '',
    description: '',
    type: 'one_time',
    pricingType: 'fixed',
    agreedAmount: '',
    currency: 'USD',
    agreedChecklist: [],
  }
  newChecklistItem.value = ''
  editingMissionId.value = null
}

async function openCreateModal() {
  resetForm()
  isEditing.value = false
  await loadFormData()
  showModal.value = true
}

async function openEditModal(mission: any) {
  isEditing.value = true
  editingMissionId.value = mission.id
  await loadFormData()
  form.value = {
    agentId: String(mission.agentId),
    clientId: String(mission.clientId),
    title: mission.title,
    description: mission.description || '',
    type: mission.type,
    pricingType: mission.pricingType,
    agreedAmount: mission.agreedAmount ? String(mission.agreedAmount) : '',
    currency: mission.currency || 'USD',
    agreedChecklist: [...(mission.agreedChecklist || [])],
  }
  showModal.value = true
}

function addChecklistItem() {
  if (newChecklistItem.value.trim()) {
    form.value.agreedChecklist.push(newChecklistItem.value.trim())
    newChecklistItem.value = ''
  }
}

function removeChecklistItem(index: number) {
  form.value.agreedChecklist.splice(index, 1)
}

async function handleSubmit() {
  if (!form.value.title) {
    toast.error(t('admin.missions.titleRequired'))
    return
  }
  if (!form.value.agentId) {
    toast.error(t('admin.missions.agentRequired'))
    return
  }
  if (!form.value.clientId) {
    toast.error(t('admin.missions.clientRequired'))
    return
  }
  if (!form.value.pricingType) {
    toast.error(t('admin.missions.pricingTypeRequired'))
    return
  }

  formLoading.value = true
  try {
    const data: any = {
      agentId: Number(form.value.agentId),
      clientId: Number(form.value.clientId),
      title: form.value.title,
      description: form.value.description || undefined,
      type: form.value.type,
      pricingType: form.value.pricingType,
      agreedAmount: form.value.agreedAmount ? Number(form.value.agreedAmount) : undefined,
      currency: form.value.currency,
      agreedChecklist: form.value.agreedChecklist.length > 0 ? form.value.agreedChecklist : undefined,
    }

    if (isEditing.value && editingMissionId.value) {
      await adminStore.updateMission(String(editingMissionId.value), data)
      toast.success(t('admin.missions.updated'))
    } else {
      await adminStore.createMission(data)
      toast.success(t('admin.missions.created'))
    }
    showModal.value = false
    await loadData()
  } catch {
    toast.error(isEditing.value ? t('admin.missions.updateError') : t('admin.missions.createError'))
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(mission: any) {
  const confirmed = await showConfirm({
    title: t('admin.missions.deleteTitle'),
    message: t('admin.missions.deleteConfirm'),
    variant: 'danger',
  })
  if (!confirmed) return
  try {
    await adminStore.deleteMission(String(mission.id))
    toast.success(t('admin.missions.deleted'))
    await loadData()
  } catch {
    toast.error(t('admin.missions.deleteError'))
  }
}

async function loadData() {
  await adminStore.fetchMissions({
    page: page.value,
    limit: perPage.value,
    search: search.value || undefined,
    status: statusFilter.value || undefined,
    type: typeFilter.value || undefined,
  })
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

async function onTypeChange(value: string) {
  typeFilter.value = value
  goTo(1)
  await loadData()
}
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <h1 class="ds-admin-page__title">{{ t('admin.missions.listTitle') }}</h1>
      <BButton variant="accent" @click="openCreateModal">
        <i class="bi bi-plus-lg" /> {{ t('admin.missions.createMission') }}
      </BButton>
    </div>

    <div class="ds-admin-page__filters">
      <SearchInput :model-value="search" @update:model-value="onSearch" :placeholder="t('admin.missions.search')" />
      <BSelect
        :model-value="statusFilter"
        @update:model-value="onStatusChange"
        :options="[
          { value: '', label: t('admin.missions.allStatuses') },
          { value: 'draft', label: 'Draft' },
          { value: 'pending_agreement', label: 'Pending Agreement' },
          { value: 'agreed', label: 'Agreed' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'disputed', label: 'Disputed' },
          { value: 'cancelled', label: 'Cancelled' },
        ]"
      />
      <BSelect
        :model-value="typeFilter"
        @update:model-value="onTypeChange"
        :options="[
          { value: '', label: t('admin.missions.allTypes') },
          { value: 'one_time', label: t('admin.missions.oneTime') },
          { value: 'recurrent', label: t('admin.missions.recurrent') },
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
        <div class="ds-admin-actions">
          <RouterLink :to="`/app/admin/missions/${row.id}`" class="ds-btn ds-btn--sm ds-btn--outline">
            {{ t('admin.missions.view') }}
          </RouterLink>
          <BButton size="sm" outline @click="openEditModal(row)">
            {{ t('admin.missions.editMission') }}
          </BButton>
          <BButton size="sm" variant="danger" outline @click="handleDelete(row)">
            {{ t('admin.missions.deleteMission') }}
          </BButton>
        </div>
      </template>
    </BTable>

    <Pagination
      :model-value="page"
      :total-pages="totalPages"
      @update:model-value="goTo"
    />

    <!-- Create/Edit Mission Modal -->
    <BModal v-model="showModal" :title="isEditing ? t('admin.missions.editTitle') : t('admin.missions.createTitle')">
      <div class="ds-form">
        <div class="ds-form-group">
          <label>{{ t('admin.missions.title') }}</label>
          <BInput v-model="form.title" :placeholder="t('admin.missions.title')" />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.missions.description') }}</label>
          <textarea
            v-model="form.description"
            class="ds-textarea"
            :placeholder="t('admin.missions.descriptionPlaceholder')"
            rows="3"
          />
        </div>
        <div class="ds-form-row">
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.missions.agent') }}</label>
            <BSelect
              v-model="form.agentId"
              :options="[{ value: '', label: t('admin.missions.selectAgent') }, ...agentOptions]"
            />
          </div>
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.missions.client') }}</label>
            <BSelect
              v-model="form.clientId"
              :options="[{ value: '', label: t('admin.missions.selectClient') }, ...clientOptions]"
            />
          </div>
        </div>
        <div class="ds-form-row">
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.missions.missionType') }}</label>
            <BSelect
              v-model="form.type"
              :options="[
                { value: 'one_time', label: t('admin.missions.oneTime') },
                { value: 'recurrent', label: t('admin.missions.recurrent') },
              ]"
            />
          </div>
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.missions.pricingType') }}</label>
            <BSelect
              v-model="form.pricingType"
              :options="[
                { value: 'fixed', label: t('admin.missions.fixed') },
                { value: 'hourly', label: t('admin.missions.hourly') },
                { value: 'task_based', label: t('admin.missions.taskBased') },
              ]"
            />
          </div>
        </div>
        <div class="ds-form-row">
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.missions.amountLabel') }}</label>
            <BInput v-model="form.agreedAmount" type="number" :placeholder="t('admin.missions.amountPlaceholder')" />
          </div>
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.missions.currency') }}</label>
            <BSelect
              v-model="form.currency"
              :options="CURRENCY_OPTIONS"
            />
          </div>
        </div>
        <div class="ds-form-group">
          <label>{{ t('missions.create.checklist.title') }}</label>
          <div class="ds-checklist-editor">
            <div v-for="(item, idx) in form.agreedChecklist" :key="idx" class="ds-checklist-editor__item">
              <span>{{ item }}</span>
              <BButton size="sm" variant="danger" outline @click="removeChecklistItem(idx)">
                <i class="bi bi-x" />
              </BButton>
            </div>
            <div class="ds-checklist-editor__add">
              <BInput v-model="newChecklistItem" :placeholder="t('missions.create.checklist.placeholder')" @keyup.enter="addChecklistItem" />
              <BButton size="sm" outline @click="addChecklistItem">{{ t('missions.create.checklist.add') }}</BButton>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <BButton variant="accent" :disabled="formLoading" @click="handleSubmit">
          {{ formLoading ? (isEditing ? t('admin.missions.updating') : t('admin.missions.creating')) : t('admin.missions.save') }}
        </BButton>
        <BButton outline @click="showModal = false">
          {{ t('admin.missions.cancel') }}
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
.ds-form-row {
  display: flex;
  gap: 1rem;
}
.ds-form-group--half {
  flex: 1;
}
.ds-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--ds-border);
  border-radius: 0.375rem;
  background: var(--ds-bg-secondary);
  color: var(--ds-text);
  resize: vertical;
}
.ds-checklist-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ds-checklist-editor__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.75rem;
  background: var(--ds-bg-secondary);
  border-radius: 0.375rem;
  border: 1px solid var(--ds-border);
}
.ds-checklist-editor__add {
  display: flex;
  gap: 0.5rem;
}
.ds-admin-actions {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}
</style>
