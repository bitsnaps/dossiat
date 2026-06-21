<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()

interface Props {
  collapsed?: boolean
}

withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<{ toggle: [] }>()

const agentLinks = [
  { to: '/app/dashboard', icon: 'bi-grid-1x2', label: 'layout.sidebar.dashboard' },
  { to: '/app/missions', icon: 'bi-clipboard-check', label: 'layout.sidebar.missions' },
  { to: '/app/messages', icon: 'bi-chat-dots', label: 'layout.sidebar.messages' },
  { to: '/app/discover', icon: 'bi-people', label: 'layout.sidebar.discover', roles: ['client'] },
]

const financeLinks = [
  { to: '/app/payments', icon: 'bi-wallet2', label: 'layout.sidebar.payments' },
  { to: '/app/credits', icon: 'bi-coin', label: 'layout.sidebar.credits', roles: ['agent'] },
  { to: '/app/invoices', icon: 'bi-receipt', label: 'layout.sidebar.invoices', roles: ['agent'] },
  { to: '/app/subscriptions', icon: 'bi-arrow-repeat', label: 'layout.sidebar.subscriptions', roles: ['client'] },
]

const systemLinks = [
  { to: '/app/disputes', icon: 'bi-flag', label: 'layout.sidebar.disputes' },
  { to: '/app/settings', icon: 'bi-gear', label: 'layout.sidebar.settings', roles: ['agent'] },
  { to: '/app/client/settings', icon: 'bi-gear', label: 'layout.sidebar.settings', roles: ['client'] },
  { to: '/app/admin', icon: 'bi-shield-lock', label: 'layout.sidebar.admin', roles: ['admin'] },
]

function isVisible(link: { roles?: string[] }) {
  if (!link.roles) return true
  return link.roles.some((role) => authStore.hasRole(role))
}

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="ds-sidebar" :class="{ 'ds-sidebar--collapsed': collapsed }">
    <div class="ds-sidebar__brand" @click="emit('toggle')">
      <span class="ds-sidebar__brand-dot" />
      <span class="ds-sidebar__brand-name">{{ t('layout.sidebar.brand') }}</span>
    </div>

    <nav class="ds-sidebar__nav">
      <div class="ds-sidebar__section-title">{{ t('layout.sidebar.sectionMain') }}</div>
      <RouterLink
        v-for="link in agentLinks"
        :key="link.to"
        :to="link.to"
        class="ds-sidebar__link"
        :class="{ 'ds-sidebar__link--active': isActive(link.to) }"
      >
        <i :class="['bi', link.icon]" />
        <span class="ds-sidebar__link-label">{{ t(link.label) }}</span>
      </RouterLink>

      <div class="ds-sidebar__section-title">{{ t('layout.sidebar.sectionFinance') }}</div>
      <template v-for="link in financeLinks" :key="link.to">
        <RouterLink
          v-if="isVisible(link)"
          :to="link.to"
          class="ds-sidebar__link"
          :class="{ 'ds-sidebar__link--active': isActive(link.to) }"
        >
          <i :class="['bi', link.icon]" />
          <span class="ds-sidebar__link-label">{{ t(link.label) }}</span>
        </RouterLink>
      </template>

      <div class="ds-sidebar__section-title">{{ t('layout.sidebar.sectionSystem') }}</div>
      <template v-for="link in systemLinks" :key="link.to">
        <RouterLink
          v-if="isVisible(link)"
          :to="link.to"
          class="ds-sidebar__link"
          :class="{ 'ds-sidebar__link--active': isActive(link.to) }"
        >
          <i :class="['bi', link.icon]" />
          <span class="ds-sidebar__link-label">{{ t(link.label) }}</span>
        </RouterLink>
      </template>
    </nav>

    <div class="ds-sidebar__footer">
      <RouterLink to="/" class="ds-sidebar__link">
        <i class="bi bi-box-arrow-left" />
        <span class="ds-sidebar__link-label">{{ t('layout.topbar.logout') }}</span>
      </RouterLink>
    </div>
  </aside>
</template>
