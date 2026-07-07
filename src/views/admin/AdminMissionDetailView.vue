<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { CURRENCY_OPTIONS } from '@/constants/currencies'
import BCard from '@/components/base/BCard.vue'
import BSelect from '@/components/base/BSelect.vue'
import BButton from '@/components/base/BButton.vue'
import BInput from '@/components/base/BInput.vue'
import BModal from '@/components/base/BModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const toast = useToast()
const { isVisible: isConfirmVisible, title: confirmTitle, message: confirmMessage, variant: confirmVariant, showConfirm, confirm, cancel } = useConfirmDialog()

const missionId = computed(() => route.params.id as string)
const editingStatus = ref(false)
const selectedStatus = ref('')
const showEditModal = ref(false)
const editLoading = ref(false)

const statuses = ['draft', 'pending_agreement', 'agreed', 'in_progress', 'completed', 'disputed', 'cancelled']

const editForm = ref({
  title: '',
  description: '',
  type: 'one_time',
  pricingType: 'fixed',
  agreedAmount: '',
  currency: 'USD',
})

onMounted(() => {
  adminStore.fetchMission(missionId.value)
})

async function saveStatus() {
  try {
    await adminStore.updateMissionStatus(missionId.value, selectedStatus.value)
    editingStatus.value = false
    toast.success(t('admin.missions.statusUpdated'))
  } catch {
    toast.error(t('admin.missions.statusUpdateError'))
  }
}

function openEditModal() {
  const m = adminStore.selectedMission
  if (!m) return
  editForm.value = {
    title: m.title,
    description: m.description || '',
    type: m.type,
    pricingType: m.pricingType,
    agreedAmount: m.agreedAmount ? String(m.agreedAmount) : '',
    currency: m.currency || 'USD',
  }
  showEditModal.value = true
}

async function handleEditSave() {
  editLoading.value = true
  try {
    await adminStore.updateMission(missionId.value, {
      title: editForm.value.title,
      description: editForm.value.description || undefined,
      type: editForm.value.type,
      pricingType: editForm.value.pricingType,
      agreedAmount: editForm.value.agreedAmount ? Number(editForm.value.agreedAmount) : undefined,
      currency: editForm.value.currency,
    })
    toast.success(t('admin.missions.updated'))
    showEditModal.value = false
  } catch {
    toast.error(t('admin.missions.updateError'))
  } finally {
    editLoading.value = false
  }
}

async function handleDelete() {
  const confirmed = await showConfirm({
    title: t('admin.missions.deleteTitle'),
    message: t('admin.missions.deleteConfirm'),
    variant: 'danger',
  })
  if (!confirmed) return
  try {
    await adminStore.deleteMission(missionId.value)
    toast.success(t('admin.missions.deleted'))
    router.push('/app/admin/missions')
  } catch {
    toast.error(t('admin.missions.deleteError'))
  }
}
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <RouterLink to="/app/admin/missions" class="ds-admin-page__back">
        <i class="bi bi-arrow-left" /> {{ t('admin.missions.back') }}
      </RouterLink>
      <h1 class="ds-admin-page__title">{{ t('admin.missions.detail') }}</h1>
      <div class="ds-admin-page__actions">
        <BButton size="sm" outline @click="openEditModal">
          {{ t('admin.missions.editMission') }}
        </BButton>
        <BButton size="sm" variant="danger" outline @click="handleDelete">
          {{ t('admin.missions.deleteMission') }}
        </BButton>
      </div>
    </div>

    <div v-if="adminStore.loading.mission" class="ds-admin-page__loading">
      <span class="ds-spinner" />
    </div>

    <template v-else-if="adminStore.selectedMission">
      <BCard class="ds-admin-detail__card">
        <div class="ds-admin-detail__info">
          <h2>{{ adminStore.selectedMission.title }}</h2>
          <p v-if="adminStore.selectedMission.description">{{ adminStore.selectedMission.description }}</p>
          <div class="ds-admin-detail__meta">
            <StatusBadge :status="adminStore.selectedMission.status" />
            <span class="text-muted">{{ adminStore.selectedMission.type }} | {{ adminStore.selectedMission.pricingType }}</span>
          </div>
          <div v-if="adminStore.selectedMission.agreedAmount" class="ds-admin-detail__meta">
            <span>{{ t('admin.missions.amount') }}: ${{ adminStore.selectedMission.agreedAmount }}</span>
          </div>
        </div>
      </BCard>

      <BCard v-if="adminStore.selectedMission.agent || adminStore.selectedMission.client" class="ds-admin-detail__card">
        <h3>{{ t('admin.missions.participants') }}</h3>
        <div class="ds-admin-detail__participants">
          <div v-if="adminStore.selectedMission.agent" class="ds-admin-detail__participant">
            <strong>{{ t('admin.missions.agent') }}:</strong>
            {{ adminStore.selectedMission.agent.firstName }} {{ adminStore.selectedMission.agent.lastName }}
            <span class="text-muted">({{ adminStore.selectedMission.agent.email }})</span>
          </div>
          <div v-if="adminStore.selectedMission.client" class="ds-admin-detail__participant">
            <strong>{{ t('admin.missions.client') }}:</strong>
            {{ adminStore.selectedMission.client.firstName }} {{ adminStore.selectedMission.client.lastName }}
            <span class="text-muted">({{ adminStore.selectedMission.client.email }})</span>
          </div>
        </div>
      </BCard>

      <BCard class="ds-admin-detail__card">
        <h3>{{ t('admin.missions.manageStatus') }}</h3>
        <div v-if="!editingStatus" class="ds-admin-detail__role">
          <span>{{ t('admin.missions.currentStatus') }}: <strong>{{ adminStore.selectedMission.status }}</strong></span>
          <BButton size="sm" outline @click="editingStatus = true; selectedStatus = adminStore.selectedMission!.status">
            {{ t('admin.missions.changeStatus') }}
          </BButton>
        </div>
        <div v-else class="ds-admin-detail__role-edit">
          <BSelect
            v-model="selectedStatus"
            :options="statuses.map(s => ({ value: s, label: s }))"
          />
          <div class="ds-admin-detail__role-actions">
            <BButton size="sm" @click="saveStatus">{{ t('admin.missions.save') }}</BButton>
            <BButton size="sm" outline @click="editingStatus = false">{{ t('admin.missions.cancel') }}</BButton>
          </div>
        </div>
      </BCard>
    </template>

    <!-- Edit Mission Modal -->
    <BModal v-model="showEditModal" :title="t('admin.missions.editTitle')">
      <div class="ds-form">
        <div class="ds-form-group">
          <label>{{ t('admin.missions.title') }}</label>
          <BInput v-model="editForm.title" :placeholder="t('admin.missions.title')" />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.missions.description') }}</label>
          <textarea
            v-model="editForm.description"
            class="ds-textarea"
            :placeholder="t('admin.missions.descriptionPlaceholder')"
            rows="3"
          />
        </div>
        <div class="ds-form-row">
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.missions.missionType') }}</label>
            <BSelect
              v-model="editForm.type"
              :options="[
                { value: 'one_time', label: t('admin.missions.oneTime') },
                { value: 'recurrent', label: t('admin.missions.recurrent') },
              ]"
            />
          </div>
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.missions.pricingType') }}</label>
            <BSelect
              v-model="editForm.pricingType"
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
            <BInput v-model="editForm.agreedAmount" type="number" :placeholder="t('admin.missions.amountPlaceholder')" />
          </div>
          <div class="ds-form-group ds-form-group--half">
            <label>{{ t('admin.missions.currency') }}</label>
            <BSelect
              v-model="editForm.currency"
              :options="CURRENCY_OPTIONS"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <BButton variant="accent" :disabled="editLoading" @click="handleEditSave">
          {{ editLoading ? t('admin.missions.updating') : t('admin.missions.save') }}
        </BButton>
        <BButton outline @click="showEditModal = false">
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
.ds-textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--ds-border);
  border-radius: 0.375rem;
  background: var(--ds-bg-secondary);
  color: var(--ds-text);
  resize: vertical;
}
</style>
