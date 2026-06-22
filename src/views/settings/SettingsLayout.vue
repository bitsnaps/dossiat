<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

const tabs = computed(() => [
  { to: '/app/settings', label: t('settings.nav.account') },
  { to: '/app/settings/notifications', label: t('settings.nav.notifications') },
  { to: '/app/settings/appearance', label: t('settings.nav.appearance') },
])

function isActive(path: string) {
  if (path === '/app/settings') {
    return route.path === '/app/settings'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="ds-settings-layout">
    <h1 class="ds-page-title">{{ t('settings.title') }}</h1>

    <nav class="ds-settings-nav" aria-label="Settings navigation">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        :class="['ds-settings-nav__link', { 'ds-settings-nav__link--active': isActive(tab.to) }]"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>

    <div class="ds-settings-layout__content">
      <RouterView />
    </div>
  </div>
</template>
