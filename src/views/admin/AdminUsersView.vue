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
const roleFilter = ref('')
const { page, perPage, total, totalPages, goTo } = usePagination()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: t('admin.users.name'), formatter: (_value: any, row: any) => `${row.firstName} ${row.lastName}` },
  { key: 'email', label: t('admin.users.email') },
  { key: 'role', label: t('admin.users.role') },
  { key: 'emailVerified', label: t('admin.users.verified') },
  { key: 'actions', label: t('admin.users.actions') },
]

// ─── Create User Modal ───
const showCreateModal = ref(false)
const creating = ref(false)
const newUser = ref({
  email: '',
  firstName: '',
  lastName: '',
  role: 'client',
  password: '',
})

// ─── Edit User Modal ───
const showEditModal = ref(false)
const updating = ref(false)
const editingId = ref<number | null>(null)
const editForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: 'client',
})

// ─── Reset Password Modal ───
const showResetModal = ref(false)
const resetting = ref(false)
const resettingId = ref<number | null>(null)
const resetForm = ref({ newPassword: '', confirmPassword: '' })

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

function openCreateModal() {
  newUser.value = { email: '', firstName: '', lastName: '', role: 'client', password: '' }
  showCreateModal.value = true
}

async function handleCreate() {
  creating.value = true
  try {
    await adminStore.createUser(newUser.value)
    toast.success(t('admin.users.created'))
    showCreateModal.value = false
    await loadData()
  } catch {
    toast.error(t('admin.users.createError'))
  } finally {
    creating.value = false
  }
}

function openEditModal(row: any) {
  editingId.value = row.id
  editForm.value = {
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    role: row.role,
  }
  showEditModal.value = true
}

async function handleEditSave() {
  if (!editingId.value) return
  if (!editForm.value.firstName || !editForm.value.lastName || !editForm.value.email) {
    toast.error(t('admin.users.updateError'))
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.value.email)) {
    toast.error(t('admin.users.emailInvalid'))
    return
  }
  updating.value = true
  try {
    await adminStore.updateUser(String(editingId.value), { ...editForm.value })
    toast.success(t('admin.users.updated'))
    showEditModal.value = false
    await loadData()
  } catch {
    toast.error(t('admin.users.updateError'))
  } finally {
    updating.value = false
  }
}

function openResetModal(row: any) {
  resettingId.value = row.id
  resetForm.value = { newPassword: '', confirmPassword: '' }
  showResetModal.value = true
}

async function handleResetPassword() {
  if (!resettingId.value) return
  if (resetForm.value.newPassword.length < 8) {
    toast.error(t('admin.users.passwordMinLength'))
    return
  }
  if (resetForm.value.newPassword !== resetForm.value.confirmPassword) {
    toast.error(t('admin.users.passwordMismatch'))
    return
  }
  resetting.value = true
  try {
    await adminStore.resetUserPassword(String(resettingId.value), resetForm.value.newPassword)
    toast.success(t('admin.users.passwordReset'))
    showResetModal.value = false
  } catch {
    toast.error(t('admin.users.passwordResetError'))
  } finally {
    resetting.value = false
  }
}

async function handleDeactivate(id: number) {
  const confirmed = await showConfirm({ title: t('admin.users.deactivateTitle'), message: t('admin.users.deactivateConfirm') })
  if (!confirmed) return
  try {
    await adminStore.deactivateUser(id.toString())
    toast.success(t('admin.users.deactivated'))
    await loadData()
  } catch {
    toast.error(t('admin.users.deactivateError'))
  }
}

async function handleActivate(id: number) {
  const confirmed = await showConfirm({ title: t('admin.users.activateTitle'), message: t('admin.users.activateConfirm') })
  if (!confirmed) return
  try {
    await adminStore.activateUser(id.toString())
    toast.success(t('admin.users.activated'))
    await loadData()
  } catch {
    toast.error(t('admin.users.activateError'))
  }
}

async function handleDelete(id: number) {
  const confirmed = await showConfirm({ title: t('admin.users.deleteTitle'), message: t('admin.users.deleteConfirm'), variant: 'danger' })
  if (!confirmed) return
  try {
    await adminStore.deleteUser(id.toString())
    toast.success(t('admin.users.deleted'))
    await loadData()
  } catch {
    toast.error(t('admin.users.deleteError'))
  }
}
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <h1 class="ds-admin-page__title">{{ t('admin.users.title') }}</h1>
      <BButton variant="accent" @click="openCreateModal">
        <i class="bi bi-plus-lg" /> {{ t('admin.users.createUser') }}
      </BButton>
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
        <StatusBadge :status="row.role" type="role" />
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
            variant="outline"
            @click="openEditModal(row)"
          >
            {{ t('admin.users.edit') }}
          </BButton>
          <BButton
            size="sm"
            variant="outline"
            @click="openResetModal(row)"
          >
            {{ t('admin.users.resetPassword') }}
          </BButton>
          <BButton
            v-if="row.emailVerified"
            size="sm"
            variant="danger"
            outline
            @click="handleDeactivate(row.id)"
          >
            {{ t('admin.users.deactivate') }}
          </BButton>
          <BButton
            v-else
            size="sm"
            variant="accent"
            outline
            @click="handleActivate(row.id)"
          >
            {{ t('admin.users.activate') }}
          </BButton>
          <BButton
            size="sm"
            variant="danger"
            outline
            @click="handleDelete(row.id)"
          >
            {{ t('admin.users.delete') }}
          </BButton>
        </div>
      </template>
    </BTable>

    <Pagination
      :model-value="page"
      :total-pages="totalPages"
      @update:model-value="goTo"
    />

    <!-- Create User Modal -->
    <BModal v-model="showCreateModal" :title="t('admin.users.createUser')">
      <div class="ds-form">
        <div class="ds-form-group">
          <label>{{ t('admin.users.firstName') }}</label>
          <BInput v-model="newUser.firstName" :placeholder="t('admin.users.firstNamePlaceholder')" />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.users.lastName') }}</label>
          <BInput v-model="newUser.lastName" :placeholder="t('admin.users.lastNamePlaceholder')" />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.users.email') }}</label>
          <BInput v-model="newUser.email" type="email" placeholder="user@example.com" />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.users.role') }}</label>
          <BSelect
            v-model="newUser.role"
            :options="[
              { value: 'agent', label: 'Agent' },
              { value: 'client', label: 'Client' },
              { value: 'admin', label: 'Admin' },
            ]"
          />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.users.password') }}</label>
          <BInput v-model="newUser.password" type="password" :placeholder="t('admin.users.passwordPlaceholder')" />
        </div>
      </div>
      <template #footer>
        <BButton variant="accent" :disabled="creating" @click="handleCreate">
          {{ creating ? t('admin.users.creating') : t('admin.users.create') }}
        </BButton>
        <BButton outline @click="showCreateModal = false">
          {{ t('admin.users.cancel') }}
        </BButton>
      </template>
    </BModal>

    <!-- Edit User Modal -->
    <BModal v-model="showEditModal" :title="t('admin.users.editUser')">
      <div class="ds-form">
        <div class="ds-form-group">
          <label>{{ t('admin.users.firstName') }}</label>
          <BInput v-model="editForm.firstName" :placeholder="t('admin.users.firstNamePlaceholder')" />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.users.lastName') }}</label>
          <BInput v-model="editForm.lastName" :placeholder="t('admin.users.lastNamePlaceholder')" />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.users.email') }}</label>
          <BInput v-model="editForm.email" type="email" placeholder="user@example.com" />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.users.role') }}</label>
          <BSelect
            v-model="editForm.role"
            :options="[
              { value: 'agent', label: 'Agent' },
              { value: 'client', label: 'Client' },
              { value: 'admin', label: 'Admin' },
            ]"
          />
        </div>
      </div>
      <template #footer>
        <BButton variant="accent" :disabled="updating" @click="handleEditSave">
          {{ updating ? t('admin.users.updating') : t('admin.users.save') }}
        </BButton>
        <BButton outline @click="showEditModal = false">
          {{ t('admin.users.cancel') }}
        </BButton>
      </template>
    </BModal>

    <!-- Reset Password Modal -->
    <BModal v-model="showResetModal" :title="t('admin.users.resetPasswordTitle')">
      <p class="ds-admin-detail__hint">{{ t('admin.users.resetPasswordHint') }}</p>
      <div class="ds-form">
        <div class="ds-form-group">
          <label>{{ t('admin.users.newPassword') }}</label>
          <BInput v-model="resetForm.newPassword" type="password" :placeholder="t('admin.users.passwordPlaceholder')" />
        </div>
        <div class="ds-form-group">
          <label>{{ t('admin.users.confirmPassword') }}</label>
          <BInput v-model="resetForm.confirmPassword" type="password" :placeholder="t('admin.users.passwordPlaceholder')" />
        </div>
      </div>
      <template #footer>
        <BButton variant="accent" :disabled="resetting" @click="handleResetPassword">
          {{ resetting ? t('admin.users.resetting') : t('admin.users.resetPassword') }}
        </BButton>
        <BButton outline @click="showResetModal = false">
          {{ t('admin.users.cancel') }}
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
