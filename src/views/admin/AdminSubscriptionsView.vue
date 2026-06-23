<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminStore } from '@/stores/admin'
import BButton from '@/components/base/BButton.vue'
import BCard from '@/components/base/BCard.vue'
import BInput from '@/components/base/BInput.vue'
import BSelect from '@/components/base/BSelect.vue'
import BModal from '@/components/base/BModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useToast } from '@/composables/useToast'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const { t } = useI18n()
const adminStore = useAdminStore()
const toast = useToast()
const { showConfirm } = useConfirmDialog()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingPlan = ref<any>(null)

const newPlan = ref({
  name: 'small_business',
  price: 29,
  currency: 'USD',
  interval: 'monthly',
  maxSeats: 1,
  maxRecurrentMissions: 10,
})

onMounted(() => {
  adminStore.fetchPlans()
})

async function handleCreate() {
  try {
    await adminStore.createPlan(newPlan.value)
    toast.success(t('admin.subscriptions.created'))
    showCreateModal.value = false
    newPlan.value = { name: 'small_business', price: 29, currency: 'USD', interval: 'monthly', maxSeats: 1, maxRecurrentMissions: 10 }
  } catch {
    toast.error(t('admin.subscriptions.createError'))
  }
}

function openEdit(plan: any) {
  editingPlan.value = { ...plan }
  showEditModal.value = true
}

async function handleUpdate() {
  if (!editingPlan.value) return
  try {
    await adminStore.updatePlan(editingPlan.value.id.toString(), editingPlan.value)
    toast.success(t('admin.subscriptions.updated'))
    showEditModal.value = false
  } catch {
    toast.error(t('admin.subscriptions.updateError'))
  }
}

async function handleDeactivate(plan: any) {
  const confirmed = await showConfirm({ title: t('admin.subscriptions.deactivateConfirm') })
  if (!confirmed) return
  try {
    await adminStore.deletePlan(plan.id.toString())
    toast.success(t('admin.subscriptions.deactivated'))
  } catch {
    toast.error(t('admin.subscriptions.deactivateError'))
  }
}
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <h1 class="ds-admin-page__title">{{ t('admin.subscriptions.listTitle') }}</h1>
      <BButton @click="showCreateModal = true">
        <i class="bi bi-plus" /> {{ t('admin.subscriptions.create') }}
      </BButton>
    </div>

    <div class="ds-admin-subscriptions__grid">
      <BCard v-for="plan in adminStore.plans" :key="plan.id" class="ds-admin-subscriptions__card">
        <div class="ds-admin-subscriptions__card-header">
          <h3>{{ plan.name }}</h3>
          <StatusBadge :status="plan.isActive ? 'active' : 'inactive'" />
        </div>
        <div class="ds-admin-subscriptions__card-body">
          <div class="ds-admin-subscriptions__price">${{ plan.price }}<small>/{{ plan.interval }}</small></div>
          <div class="ds-admin-subscriptions__details">
            <span>{{ plan.maxSeats }} {{ t('admin.subscriptions.seats') }}</span>
            <span>{{ plan.maxRecurrentMissions }} {{ t('admin.subscriptions.recurrentMissions') }}</span>
          </div>
        </div>
        <div class="ds-admin-subscriptions__card-actions">
          <BButton size="sm" outline @click="openEdit(plan)">{{ t('admin.subscriptions.edit') }}</BButton>
          <BButton v-if="plan.isActive" size="sm" variant="danger" outline @click="handleDeactivate(plan)">
            {{ t('admin.subscriptions.deactivate') }}
          </BButton>
        </div>
      </BCard>
    </div>

    <!-- Create Modal -->
    <BModal v-model="showCreateModal" :title="t('admin.subscriptions.createTitle')">
      <div class="ds-admin-form">
        <BSelect
          v-model="newPlan.name"
          :label="t('admin.subscriptions.planName')"
          :options="[
            { value: 'small_business', label: 'Small Business' },
            { value: 'professional', label: 'Professional' },
            { value: 'enterprise', label: 'Enterprise' },
          ]"
        />
        <BInput v-model="newPlan.price" :label="t('admin.subscriptions.price')" type="number" />
        <BInput v-model="newPlan.maxSeats" :label="t('admin.subscriptions.maxSeats')" type="number" />
        <BInput v-model="newPlan.maxRecurrentMissions" :label="t('admin.subscriptions.maxRecurrentMissions')" type="number" />
      </div>
      <template #footer>
        <BButton outline @click="showCreateModal = false">{{ t('admin.subscriptions.cancel') }}</BButton>
        <BButton @click="handleCreate">{{ t('admin.subscriptions.save') }}</BButton>
      </template>
    </BModal>

    <!-- Edit Modal -->
    <BModal v-model="showEditModal" :title="t('admin.subscriptions.editTitle')">
      <div v-if="editingPlan" class="ds-admin-form">
        <BInput v-model="editingPlan.price" :label="t('admin.subscriptions.price')" type="number" />
        <BInput v-model="editingPlan.maxSeats" :label="t('admin.subscriptions.maxSeats')" type="number" />
        <BInput v-model="editingPlan.maxRecurrentMissions" :label="t('admin.subscriptions.maxRecurrentMissions')" type="number" />
      </div>
      <template #footer>
        <BButton outline @click="showEditModal = false">{{ t('admin.subscriptions.cancel') }}</BButton>
        <BButton @click="handleUpdate">{{ t('admin.subscriptions.save') }}</BButton>
      </template>
    </BModal>
  </div>
</template>
