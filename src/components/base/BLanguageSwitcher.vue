<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

interface LocaleOption {
  code: string
  label: string
}

const locales: LocaleOption[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
]

const open = ref(false)
const root = ref<HTMLElement | null>(null)

const currentLabel = () =>
  locales.find(l => l.code === locale.value)?.label ?? locale.value

function select(code: string) {
  locale.value = code
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function onOutsideClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', onOutsideClick))
</script>

<template>
  <div ref="root" class="ds-dropdown" @click.stop>
    <div class="ds-dropdown-trigger" @click="toggle">
      <button type="button" class="ds-btn ds-btn--ghost ds-btn--sm">
        <i class="bi bi-globe"></i>
        {{ currentLabel() }}
        <i class="bi bi-chevron-down"></i>
      </button>
    </div>
    <div :class="['ds-dropdown-menu', { 'ds-dropdown-open': open }]">
      <div
        v-for="loc in locales"
        :key="loc.code"
        :class="['ds-dropdown-item', { 'ds-dropdown-item--active': locale === loc.code }]"
        @click="select(loc.code)"
      >
        <span v-if="locale === loc.code">✓</span>
        {{ loc.label }}
      </div>
    </div>
  </div>
</template>
