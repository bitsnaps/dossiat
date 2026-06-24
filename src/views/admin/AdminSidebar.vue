<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const links = [
  { to: '/app/admin', icon: 'bi-speedometer2', label: 'admin.sidebar.dashboard' },
  { to: '/app/admin/users', icon: 'bi-people', label: 'admin.sidebar.users' },
  { to: '/app/admin/missions', icon: 'bi-clipboard-check', label: 'admin.sidebar.missions' },
  { to: '/app/admin/payments', icon: 'bi-wallet2', label: 'admin.sidebar.payments' },
  { to: '/app/admin/disputes', icon: 'bi-flag', label: 'admin.sidebar.disputes' },
  { to: '/app/admin/subscriptions', icon: 'bi-arrow-repeat', label: 'admin.sidebar.subscriptions' },
]

function isActive(path: string) {
  if (path === '/app/admin') return route.path === '/app/admin'
  return route.path.startsWith(path)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <aside class="ds-sidebar ds-sidebar--admin">
    <div class="ds-sidebar__brand">
      <RouterLink to="/app/admin" class="ds-sidebar__brand-name">
        <i class="bi bi-shield-lock me-2" />
        {{ t('admin.sidebar.title') }}
      </RouterLink>
    </div>

    <nav class="ds-sidebar__nav">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="ds-sidebar__link"
        :class="{ 'ds-sidebar__link--active': isActive(link.to) }"
      >
        <i :class="['bi', link.icon]" />
        <span class="ds-sidebar__link-label">{{ t(link.label) }}</span>
      </RouterLink>
    </nav>

    <div class="ds-sidebar__footer">
      <RouterLink to="/app/dashboard" class="ds-sidebar__link">
        <i class="bi bi-arrow-left" />
        <span class="ds-sidebar__link-label">{{ t('admin.sidebar.backToApp') }}</span>
      </RouterLink>
      <RouterLink to="/" class="ds-sidebar__link ds-sidebar__link--logout" @click="handleLogout">
        <i class="bi bi-box-arrow-left" />
        <span class="ds-sidebar__link-label">{{ t('layout.topbar.logout') }}</span>
      </RouterLink>
    </div>
  </aside>
</template>
