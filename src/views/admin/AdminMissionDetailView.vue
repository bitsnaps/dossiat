<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import BCard from '@/components/base/BCard.vue'
import BSelect from '@/components/base/BSelect.vue'
import BButton from '@/components/base/BButton.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useToast } from '@/composables/useToast'

const { t } = useI18n()
const route = useRoute()
const adminStore = useAdminStore()
const toast = useToast()

const missionId = computed(() => route.params.id as string)
const editingStatus = ref(false)
const selectedStatus = ref('')

const statuses = ['draft', 'pending_agreement', 'agreed', 'in_progress', 'completed', 'disputed', 'cancelled']

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
</script>

<template>
  <div class="ds-admin-page">
    <div class="ds-admin-page__header">
      <RouterLink to="/app/admin/missions" class="ds-admin-page__back">
        <i class="bi bi-arrow-left" /> {{ t('admin.missions.back') }}
      </RouterLink>
      <h1 class="ds-admin-page__title">{{ t('admin.missions.detail') }}</h1>
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
  </div>
</template>
