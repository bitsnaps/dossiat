<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '@/stores/admin'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/common/Pagination.vue'
import BSelect from '@/components/base/BSelect.vue'
import BTable from '@/components/base/BTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue'

const { t } = useI18n()
const adminStore = useAdminStore()

const statusFilter = ref('')
const methodFilter = ref('')
const { page, perPage, total, totalPages, goTo } = usePagination()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'amount', label: t('admin.payments.amount') },
  { key: 'method', label: t('admin.payments.method') },
  { key: 'status', label: t('admin.payments.status') },
  { key: 'payer', label: t('admin.payments.payer'), formatter: (row: any) => row.payer ? `${row.payer.firstName} ${row.payer.lastName}` : '-' },
  { key: 'payee', label: t('admin.payments.payee'), formatter: (row: any) => row.payee ? `${row.payee.firstName} ${row.payee.lastName}` : '-' },
  { key: 'mission', label: t('admin.payments.mission'), formatter: (row: any) => row.mission?.title || '-' },
]

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
    </BTable>

    <Pagination
      :model-value="page"
      :total-pages="totalPages"
      @update:model-value="goTo"
    />
  </div>
</template>
