<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useMissionsStore } from '@/stores/missions'
import { usePaymentsStore } from '@/stores/payments'
import { useMessagesStore } from '@/stores/messages'
import { useNotificationsStore } from '@/stores/notifications'
import AgentDashboard from './agent/AgentDashboard.vue'
import ClientDashboard from './client/ClientDashboard.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const missionsStore = useMissionsStore()
const paymentsStore = usePaymentsStore()
const messagesStore = useMessagesStore()
const notificationsStore = useNotificationsStore()

const isAgent = computed(() => authStore.hasRole('agent'))
const isClient = computed(() => authStore.hasRole('client'))
const userName = computed(() => {
  const user = authStore.user
  return user ? `${user.firstName}` : ''
})

onMounted(() => {
  missionsStore.fetchMissions()
  paymentsStore.fetchCreditBalance()
  messagesStore.fetchUnreadCount()
  notificationsStore.fetchNotifications()
})
</script>

<template>
  <div class="ds-dashboard">
    <div class="ds-dashboard__header">
      <h1 class="ds-dashboard__title">
        {{ t('dashboard.welcome', { name: userName }) }}
      </h1>
    </div>

    <AgentDashboard v-if="isAgent" />
    <ClientDashboard v-else-if="isClient" />
  </div>
</template>
