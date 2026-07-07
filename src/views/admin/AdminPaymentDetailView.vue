<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { CURRENCY_OPTIONS } from '@/constants/currencies'
import BCard from '@/components/base/BCard.vue'
import BSelect from '@/components/base/BSelect.vue'
import BButton from '@/components/base/BButton.vue'
import BModal from '@/components/base/BModal.vue'
import BInput from '@/components/base/BInput.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import CurrencyDisplay from '@/components/common/CurrencyDisplay.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const toast = useToast()
const { isVisible: isConfirmVisible, title: confirmTitle, message: confirmMessage, variant: confirmVariant, showConfirm, confirm, cancel } = useConfirmDialog()

const paymentId = computed(() => route.params.id as string)
const editingStatus = ref(false)
const selectedStatus = ref('')
const showEditModal = ref(false)
const editLoading = ref(false)

const statuses = ['pending', 'confirmed', 'failed', 'refunded']
const methods = ['cash', 'stripe', 'paypal', 'bank_transfer']

const editForm = ref({
  amount: '',
  method: 'cash',
  currency: 'USD',
})

onMounted(() => {
  adminStore.fetchPayment(paymentId.value)
})

async function saveStatus() {
  try {
    await adminStore.updatePaymentStatus(paymentId.value, selectedStatus.value)
    editingStatus.value = false
    toast.success(t('admin.payments.statusUpdated'))
  } catch {
    toast.error(t('admin.payments.statusUpdateError'))
  }
}

function openEditModal() {
  const p = adminStore.selectedPayment
  if (!p) return
  editForm.value = {
    amount: String(p.amount),
    method: p.method,
    currency: p.currency || 'USD',
  }
  showEditModal.value = true
}

async function handleEditSave() {
  editLoading.value = true
  try {
    await adminStore.updatePayment(paymentId.value, {
      amount: editForm.value.amount ? Number(editForm.value.amount) : undefined,
      method: editForm.value.method,
      currency: editForm.value.currency,
    })
    toast.success(t('admin.payments.updated'))
    showEditModal.value = false
  } catch {
    toast.error(t('admin.payments.updateError'))
  } finally {
    editLoading.value = false
  }
}

async function handleDelete() {
  const confirmed = await showConfirm({
    title: t('admin.payments.deleteTitle'),
    message: t('admin.payments.deleteConfirm'),
    variant: 'danger',
  })
  if (!confirmed) return
  try {
    await adminStore.deletePayment(paymentId.value)
    toast.success(t('admin.payments.deleted'))
    router.push('/app/admin/payments')
  } catch {
    toast.error(t('admin.payments.deleteError'))
  }
}
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <RouterLink to="/app/admin/payments" class="ds-admin-page__back">
        <i class="bi bi-arrow-left" /> {{ t('admin.payments.back') }}
      </RouterLink>
      <h1 class="ds-admin-page__title">{{ t('admin.payments.detail') }}</h1>
      <div class="ds-admin-page__actions">
        <BButton size="sm" outline @click="openEditModal">
          {{ t('admin.payments.editPayment') }}
        </BButton>
        <BButton size="sm" variant="danger" outline @click="handleDelete">
          {{ t('admin.payments.deletePayment') }}
        </BButton>
      </div>
    </div>

    <div v-if="adminStore.loading.payment" class="ds-admin-page__loading">
      <span class="ds-spinner" />
    </div>

    <template v-else-if="adminStore.selectedPayment">
      <BCard class="ds-admin-detail__card">
        <h3>{{ t('admin.payments.details') }}</h3>
        <div class="ds-admin-detail__info">
          <div class="ds-admin-detail__meta">
            <span>{{ t('admin.payments.amount') }}: <CurrencyDisplay :amount="adminStore.selectedPayment.amount" :currency="adminStore.selectedPayment.currency" /></span>
            <StatusBadge :status="adminStore.selectedPayment.status" />
          </div>
          <div class="ds-admin-detail__meta">
            <span>{{ t('admin.payments.method') }}: {{ adminStore.selectedPayment.method }}</span>
            <span>{{ t('admin.payments.currency') }}: {{ adminStore.selectedPayment.currency }}</span>
          </div>
          <div class="ds-admin-detail__meta">
            <span>{{ t('admin.payments.platformFee') }}: <CurrencyDisplay :amount="adminStore.selectedPayment.platformFee" :currency="adminStore.selectedPayment.currency" /></span>
            <span>{{ t('admin.payments.gatewayFee') }}: <CurrencyDisplay :amount="adminStore.selectedPayment.gatewayFee" :currency="adminStore.selectedPayment.currency" /></span>
            <span>{{ t('admin.payments.netAmount') }}: <CurrencyDisplay :amount="adminStore.selectedPayment.netAmount" :currency="adminStore.selectedPayment.currency" /></span>
          </div>
          <div class="ds-admin-detail__meta">
            <span v-if="adminStore.selectedPayment.confirmedAt">{{ t('admin.payments.confirmedAt') }}: {{ new Date(adminStore.selectedPayment.confirmedAt).toLocaleString() }}</span>
            <span>{{ t('admin.payments.createdAt') }}: {{ adminStore.selectedPayment.createdAt ? new Date(adminStore.selectedPayment.createdAt).toLocaleString() : '-' }}</span>
          </div>
        </div>
      </BCard>

      <BCard class="ds-admin-detail__card">
        <h3>{{ t('admin.payments.payer') }} & {{ t('admin.payments.payee') }}</h3>
        <div class="ds-admin-detail__participants">
          <div v-if="adminStore.selectedPayment.payer" class="ds-admin-detail__participant">
            <strong>{{ t('admin.payments.payer') }}:</strong>
            {{ adminStore.selectedPayment.payer.firstName }} {{ adminStore.selectedPayment.payer.lastName }}
            <span class="text-muted">({{ adminStore.selectedPayment.payer.email }})</span>
          </div>
          <div v-if="adminStore.selectedPayment.payee" class="ds-admin-detail__participant">
            <strong>{{ t('admin.payments.payee') }}:</strong>
            {{ adminStore.selectedPayment.payee.firstName }} {{ adminStore.selectedPayment.payee.lastName }}
            <span class="text-muted">({{ adminStore.selectedPayment.payee.email }})</span>
          </div>
        </div>
      </BCard>

      <BCard v-if="adminStore.selectedPayment.mission" class="ds-admin-detail__card">
        <h3>{{ t('admin.payments.mission') }}</h3>
        <div class="ds-admin-detail__meta">
          <RouterLink :to="`/app/admin/missions/${adminStore.selectedPayment.mission.id}`">
            {{ adminStore.selectedPayment.mission.title }}
          </RouterLink>
        </div>
      </BCard>

      <BCard class="ds-admin-detail__card">
        <h3>{{ t('admin.payments.manageStatus') }}</h3>
        <div v-if="!editingStatus" class="ds-admin-detail__role">
          <span>{{ t('admin.payments.currentStatus') }}: <strong>{{ adminStore.selectedPayment.status }}</strong></span>
          <BButton size="sm" outline @click="editingStatus = true; selectedStatus = adminStore.selectedPayment!.status">
            {{ t('admin.payments.changeStatus') }}
          </BButton>
        </div>
        <div v-else class="ds-admin-detail__role-edit">
          <BSelect
            v-model="selectedStatus"
            :options="statuses.map(s => ({ value: s, label: s }))"
          />
          <div class="ds-admin-detail__role-actions">
            <BButton size="sm" @click="saveStatus">{{ t('admin.payments.save') }}</BButton>
            <BButton size="sm" outline @click="editingStatus = false">{{ t('admin.payments.cancel') }}</BButton>
          </div>
        </div>
      </BCard>
    </template>

    <!-- Edit Payment Modal -->
    <BModal v-model="showEditModal" :title="t('admin.payments.editTitle')">
      <div class="ds-form">
        <div class="ds-form-row">
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.payments.amount') }}</label>
            <BInput v-model="editForm.amount" type="number" placeholder="0.00" />
          </div>
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.payments.currency') }}</label>
            <BSelect
              v-model="editForm.currency"
              :options="CURRENCY_OPTIONS"
            />
          </div>
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.payments.method') }}</label>
          <BSelect
            v-model="editForm.method"
            :options="methods.map(m => ({ value: m, label: m }))"
          />
        </div>
      </div>
      <template #footer>
        <BButton variant="accent" :disabled="editLoading" @click="handleEditSave">
          {{ editLoading ? t('admin.payments.updating') : t('admin.payments.save') }}
        </BButton>
        <BButton outline @click="showEditModal = false">
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
.ds-admin-page__actions {
  display: flex;
  gap: 0.5rem;
  margin-inline-start: auto;
}
.ds-form-row {
  display: flex;
  gap: 1rem;
}
.ds-form-group--half {
  flex: 1;
}
</style>
