<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import BCard from '@/components/base/BCard.vue'
import BSelect from '@/components/base/BSelect.vue'
import BButton from '@/components/base/BButton.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const toast = useToast()
const { showConfirm } = useConfirmDialog()

const userId = computed(() => route.params.id as string)
const editingRole = ref(false)
const selectedRole = ref('')

onMounted(() => {
  adminStore.fetchUser(userId.value)
})

async function saveRole() {
  try {
    await adminStore.updateUser(userId.value, { role: selectedRole.value })
    editingRole.value = false
    toast.success(t('admin.users.updated'))
  } catch {
    toast.error(t('admin.users.updateError'))
  }
}

async function handleDeactivate() {
  const confirmed = await showConfirm({ title: t('admin.users.deactivateConfirm') })
  if (!confirmed) return
  try {
    await adminStore.deactivateUser(userId.value)
    toast.success(t('admin.users.deactivated'))
  } catch {
    toast.error(t('admin.users.deactivateError'))
  }
}

async function handleActivate() {
  const confirmed = await showConfirm({ title: t('admin.users.activateConfirm') })
  if (!confirmed) return
  try {
    await adminStore.activateUser(userId.value)
    toast.success(t('admin.users.activated'))
  } catch {
    toast.error(t('admin.users.activateError'))
  }
}

async function handleDelete() {
  const confirmed = await showConfirm({ title: t('admin.users.deleteConfirm') })
  if (!confirmed) return
  try {
    await adminStore.deleteUser(userId.value)
    toast.success(t('admin.users.deleted'))
    router.push('/app/admin/users')
  } catch {
    toast.error(t('admin.users.deleteError'))
  }
}
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
  </div>
</template>
