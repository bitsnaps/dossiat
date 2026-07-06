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
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const adminStore = useAdminStore()
const toast = useToast()
const { isVisible: isConfirmVisible, title: confirmTitle, message: confirmMessage, variant: confirmVariant, showConfirm, confirm, cancel } = useConfirmDialog()

const statusFilter = ref('')
const methodFilter = ref('')
const { page, perPage, total, totalPages, goTo } = usePagination()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'amount', label: t('admin.payments.amount') },
  { key: 'method', label: t('admin.payments.method') },
  { key: 'status', label: t('admin.payments.status') },
  { key: 'payer', label: t('admin.payments.payer'), formatter: (_value: any, row: any) => row.payer ? `${row.payer.firstName} ${row.payer.lastName}` : '-' },
  { key: 'payee', label: t('admin.payments.payee'), formatter: (_value: any, row: any) => row.payee ? `${row.payee.firstName} ${row.payee.lastName}` : '-' },
  { key: 'mission', label: t('admin.payments.mission'), formatter: (_value: any, row: any) => row.mission?.title || '-' },
  { key: 'actions', label: t('admin.payments.actions') },
]

// ─── Create/Edit Modal ───
const showModal = ref(false)
const isEditing = ref(false)
const editingPaymentId = ref<number | null>(null)
const formLoading = ref(false)
const form = ref({
  missionId: '',
  payerId: '',
  payeeId: '',
  amount: '',
  method: 'cash',
  currency: 'USD',
  status: 'pending',
})

// ─── Dropdown options ───
const missionOptions = ref<{ value: string; label: string }[]>([])
const payerOptions = ref<{ value: string; label: string }[]>([])
const payeeOptions = ref<{ value: string; label: string }[]>([])

async function loadFormData() {
  await adminStore.fetchMissions({ limit: 100 })
  missionOptions.value = adminStore.missions
    .map(m => ({ value: String(m.id), label: m.title }))

  await adminStore.fetchUsers({ role: 'client', limit: 100 })
  payerOptions.value = adminStore.users
    .map(u => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))

  await adminStore.fetchUsers({ role: 'agent', limit: 100 })
  payeeOptions.value = adminStore.users
    .map(u => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))
}

function resetForm() {
  form.value = {
    missionId: '',
    payerId: '',
    payeeId: '',
    amount: '',
    method: 'cash',
    currency: 'USD',
    status: 'pending',
  }
  editingPaymentId.value = null
}

async function openCreateModal() {
  resetForm()
  isEditing.value = false
  await loadFormData()
  showModal.value = true
}

async function openEditModal(payment: any) {
  isEditing.value = true
  editingPaymentId.value = payment.id
  await loadFormData()
  form.value = {
    missionId: String(payment.missionId),
    payerId: String(payment.payerId),
    payeeId: String(payment.payeeId),
    amount: String(payment.amount),
    method: payment.method,
    currency: payment.currency || 'USD',
    status: payment.status,
  }
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.missionId) {
    toast.error(t('admin.payments.missionRequired'))
    return
  }
  if (!form.value.payerId) {
    toast.error(t('admin.payments.payerRequired'))
    return
  }
  if (!form.value.payeeId) {
    toast.error(t('admin.payments.payeeRequired'))
    return
  }
  if (!form.value.amount || Number(form.value.amount) <= 0) {
    toast.error(t('admin.payments.amountRequired'))
    return
  }
  if (!form.value.method) {
    toast.error(t('admin.payments.methodRequired'))
    return
  }

  formLoading.value = true
  try {
    if (isEditing.value && editingPaymentId.value) {
      await adminStore.updatePayment(String(editingPaymentId.value), {
        amount: Number(form.value.amount),
        method: form.value.method,
        currency: form.value.currency,
        status: form.value.status,
      })
      toast.success(t('admin.payments.updated'))
    } else {
      await adminStore.createPayment({
        missionId: Number(form.value.missionId),
        payerId: Number(form.value.payerId),
        payeeId: Number(form.value.payeeId),
        amount: Number(form.value.amount),
        method: form.value.method,
        currency: form.value.currency,
        status: form.value.status,
      })
      toast.success(t('admin.payments.created'))
    }
    showModal.value = false
    await loadData()
  } catch {
    toast.error(isEditing.value ? t('admin.payments.updateError') : t('admin.payments.createError'))
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(payment: any) {
  const confirmed = await showConfirm({
    title: t('admin.payments.deleteTitle'),
    message: t('admin.payments.deleteConfirm'),
    variant: 'danger',
  })
  if (!confirmed) return
  try {
    await adminStore.deletePayment(String(payment.id))
    toast.success(t('admin.payments.deleted'))
    await loadData()
  } catch {
    toast.error(t('admin.payments.deleteError'))
  }
}

async function loadData() {
  await adminStore.fetchPayments({
    page: page.value,
    limit: perPage.value,
    status: statusFilter.value || undefined,
    method: methodFilter.value || undefined,
  })
  total.value = adminStore.pagination.payments?.total || 0
}

onMounted(loadData)

async function onStatusChange(value: string) {
  statusFilter.value = value
  goTo(1)
  await loadData()
}

async function onMethodChange(value: string) {
  methodFilter.value = value
  goTo(1)
  await loadData()
}
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <h1 class="ds-admin-page__title">{{ t('admin.payments.listTitle') }}</h1>
      <BButton variant="accent" @click="openCreateModal">
        <i class="bi bi-plus-lg" /> {{ t('admin.payments.createPayment') }}
      </BButton>
    </div>

    <div class="ds-admin-page__filters">
      <BSelect
        :model-value="statusFilter"
        @update:model-value="onStatusChange"
        :options="[
          { value: '', label: t('admin.payments.allStatuses') },
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'failed', label: 'Failed' },
          { value: 'refunded', label: 'Refunded' },
        ]"
      />
      <BSelect
        :model-value="methodFilter"
        @update:model-value="onMethodChange"
        :options="[
          { value: '', label: t('admin.payments.allMethods') },
          { value: 'cash', label: 'Cash' },
          { value: 'stripe', label: 'Stripe' },
          { value: 'paypal', label: 'PayPal' },
          { value: 'bank_transfer', label: 'Bank Transfer' },
        ]"
      />
    </div>

    <BTable
      :columns="columns"
      :rows="adminStore.payments"
      :loading="adminStore.loading.payments"
    >
      <template #cell-amount="{ row }">
        <CurrencyDisplay :amount="row.amount" :currency="row.currency" />
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
      <template #cell-actions="{ row }">
        <div class="ds-admin-actions">
          <RouterLink :to="`/app/admin/payments/${row.id}`" class="ds-btn ds-btn--sm ds-btn--outline">
            {{ t('admin.payments.view') }}
          </RouterLink>
          <BButton size="sm" outline @click="openEditModal(row)">
            {{ t('admin.payments.editPayment') }}
          </BButton>
          <BButton size="sm" variant="danger" outline @click="handleDelete(row)">
            {{ t('admin.payments.deletePayment') }}
          </BButton>
        </div>
      </template>
    </BTable>

    <Pagination
      :model-value="page"
      :total-pages="totalPages"
      @update:model-value="goTo"
    />

    <!-- Create/Edit Payment Modal -->
    <BModal v-model="showModal" :title="isEditing ? t('admin.payments.editTitle') : t('admin.payments.createTitle')">
      <div class="ds-form">
        <div class="ds-form-group">
          <label>{{ t('admin.payments.mission') }}</label>
          <BSelect
            v-model="form.missionId"
            :options="[{ value: '', label: t('admin.payments.selectMission') }, ...missionOptions]"
            :disabled="isEditing"
          />
        </div>
        <div class="ds-form-row">
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.payments.payer') }}</label>
            <BSelect
              v-model="form.payerId"
              :options="[{ value: '', label: t('admin.payments.selectPayer') }, ...payerOptions]"
              :disabled="isEditing"
            />
          </div>
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.payments.payee') }}</label>
            <BSelect
              v-model="form.payeeId"
              :options="[{ value: '', label: t('admin.payments.selectPayee') }, ...payeeOptions]"
              :disabled="isEditing"
            />
          </div>
        </div>
        <div class="ds-form-row">
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.payments.amount') }}</label>
            <BInput v-model="form.amount" type="number" placeholder="0.00" />
          </div>
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.payments.currency') }}</label>
            <BSelect
              v-model="form.currency"
              :options="[
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'DZD', label: 'DZD' },
                { value: 'GBP', label: 'GBP' },
                { value: 'MAD', label: 'MAD' },
                { value: 'AED', label: 'AED' },
                { value: 'SAR', label: 'SAR' },
                { value: 'CAD', label: 'CAD' },
              ]"
            />
          </div>
        </div>
        <div class="ds-form-row">
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.payments.method') }}</label>
            <BSelect
              v-model="form.method"
              :options="[
                { value: 'cash', label: 'Cash' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'stripe', label: 'Stripe' },
                { value: 'paypal', label: 'PayPal' },
              ]"
            />
          </div>
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.payments.status') }}</label>
            <BSelect
              v-model="form.status"
              :options="[
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' },
              ]"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <BButton variant="accent" :disabled="formLoading" @click="handleSubmit">
          {{ formLoading ? (isEditing ? t('admin.payments.updating') : t('admin.payments.creating')) : t('admin.payments.save') }}
        </BButton>
        <BButton outline @click="showModal = false">
          {{ t('admin.payments.cancel') }}
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
.ds-admin-actions {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}
</style>
