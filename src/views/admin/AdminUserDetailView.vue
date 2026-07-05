<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import BCard from '@/components/base/BCard.vue'
import BSelect from '@/components/base/BSelect.vue'
import BButton from '@/components/base/BButton.vue'
import BModal from '@/components/base/BModal.vue'
import BInput from '@/components/base/BInput.vue'
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

const userId = computed(() => route.params.id as string)
const editingRole = ref(false)
const selectedRole = ref('')

// ─── Edit Profile ───
const showEditModal = ref(false)
const updating = ref(false)
const editForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: 'client',
})

function openEditModal() {
  const u = adminStore.selectedUser
  if (!u) return
  editForm.value = {
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role,
  }
  showEditModal.value = true
}

async function handleEditSave() {
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
    await adminStore.updateUser(userId.value, { ...editForm.value })
    toast.success(t('admin.users.updated'))
    showEditModal.value = false
    await adminStore.fetchUser(userId.value)
  } catch {
    toast.error(t('admin.users.updateError'))
  } finally {
    updating.value = false
  }
}

// ─── Reset Password ───
const showResetModal = ref(false)
const resetting = ref(false)
const resetForm = ref({ newPassword: '', confirmPassword: '' })

function openResetModal() {
  resetForm.value = { newPassword: '', confirmPassword: '' }
  showResetModal.value = true
}

async function handleResetPassword() {
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
    await adminStore.resetUserPassword(userId.value, resetForm.value.newPassword)
    toast.success(t('admin.users.passwordReset'))
    showResetModal.value = false
  } catch {
    toast.error(t('admin.users.passwordResetError'))
  } finally {
    resetting.value = false
  }
}

async function saveRole() {
  try {
    await adminStore.updateUser(userId.value, { role: selectedRole.value })
    editingRole.value = false
    toast.success(t('admin.users.updated'))
    await adminStore.fetchUser(userId.value)
  } catch {
    toast.error(t('admin.users.updateError'))
  }
}

async function handleDeactivate() {
  const confirmed = await showConfirm({ title: t('admin.users.deactivateTitle'), message: t('admin.users.deactivateConfirm') })
  if (!confirmed) return
  try {
    await adminStore.deactivateUser(userId.value)
    toast.success(t('admin.users.deactivated'))
    await adminStore.fetchUser(userId.value)
  } catch {
    toast.error(t('admin.users.deactivateError'))
  }
}

async function handleActivate() {
  const confirmed = await showConfirm({ title: t('admin.users.activateTitle'), message: t('admin.users.activateConfirm') })
  if (!confirmed) return
  try {
    await adminStore.activateUser(userId.value)
    toast.success(t('admin.users.activated'))
    await adminStore.fetchUser(userId.value)
  } catch {
    toast.error(t('admin.users.activateError'))
  }
}

async function handleDelete() {
  const confirmed = await showConfirm({ title: t('admin.users.deleteTitle'), message: t('admin.users.deleteConfirm'), variant: 'danger' })
  if (!confirmed) return
  try {
    await adminStore.deleteUser(userId.value)
    toast.success(t('admin.users.deleted'))
    router.push('/app/admin/users')
  } catch {
    toast.error(t('admin.users.deleteError'))
  }
}

onMounted(() => {
  adminStore.fetchUser(userId.value)
})
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <RouterLink to="/app/admin/users" class="ds-admin-page__back">
        <i class="bi bi-arrow-left" /> {{ t('admin.users.back') }}
      </RouterLink>
      <h1 class="ds-admin-page__title">{{ t('admin.users.userDetail') }}</h1>
    </div>

    <div v-if="adminStore.loading.user" class="ds-admin-page__loading">
      <span class="ds-spinner" />
    </div>

    <template v-else-if="adminStore.selectedUser">
      <BCard class="ds-admin-detail__card">
        <div class="ds-admin-detail__info">
          <h2>{{ adminStore.selectedUser.firstName }} {{ adminStore.selectedUser.lastName }}</h2>
          <p>{{ adminStore.selectedUser.email }}</p>
          <div class="ds-admin-detail__meta">
            <StatusBadge :status="adminStore.selectedUser.role" type="role" />
            <span v-if="adminStore.selectedUser.emailVerified" class="text-success">
              <i class="bi bi-check-circle" /> {{ t('admin.users.verified') }}
            </span>
            <span v-else class="text-muted">
              <i class="bi bi-x-circle" /> {{ t('admin.users.notVerified') }}
            </span>
          </div>
        </div>
      </BCard>

      <BCard class="ds-admin-detail__card">
        <h3>{{ t('admin.users.editProfile') }}</h3>
        <p class="ds-admin-detail__hint">{{ t('admin.users.editProfileHint') }}</p>
        <BButton size="sm" outline @click="openEditModal">
          <i class="bi bi-pencil" /> {{ t('admin.users.edit') }}
        </BButton>
      </BCard>

      <BCard class="ds-admin-detail__card">
        <h3>{{ t('admin.users.manageRole') }}</h3>
        <div v-if="!editingRole" class="ds-admin-detail__role">
          <span>{{ t('admin.users.currentRole') }}: <strong>{{ adminStore.selectedUser.role }}</strong></span>
          <BButton size="sm" outline @click="editingRole = true; selectedRole = adminStore.selectedUser!.role">
            {{ t('admin.users.changeRole') }}
          </BButton>
        </div>
        <div v-else class="ds-admin-detail__role-edit">
          <BSelect
            v-model="selectedRole"
            :options="[
              { value: 'agent', label: 'Agent' },
              { value: 'client', label: 'Client' },
              { value: 'admin', label: 'Admin' },
            ]"
          />
          <div class="ds-admin-detail__role-actions">
            <BButton size="sm" @click="saveRole">{{ t('admin.users.save') }}</BButton>
            <BButton size="sm" outline @click="editingRole = false">{{ t('admin.users.cancel') }}</BButton>
          </div>
        </div>
      </BCard>

      <BCard class="ds-admin-detail__card">
        <h3>{{ t('admin.users.accountActions') }}</h3>
        <div class="ds-admin-detail__actions">
          <BButton
            size="sm"
            variant="outline"
            @click="openResetModal"
          >
            <i class="bi bi-key" /> {{ t('admin.users.resetPassword') }}
          </BButton>
          <BButton
            v-if="adminStore.selectedUser.emailVerified"
            size="sm"
            variant="danger"
            outline
            @click="handleDeactivate"
          >
            {{ t('admin.users.deactivate') }}
          </BButton>
          <BButton
            v-else
            size="sm"
            variant="accent"
            outline
            @click="handleActivate"
          >
            {{ t('admin.users.activate') }}
          </BButton>
          <BButton
            size="sm"
            variant="danger"
            outline
            @click="handleDelete"
          >
            {{ t('admin.users.delete') }}
          </BButton>
        </div>
      </BCard>
    </template>

    <!-- Edit Profile Modal -->
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
