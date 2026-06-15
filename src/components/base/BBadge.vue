<script lang="ts" setup>
defineProps<{
  variant?: 'success' | 'info' | 'warning' | 'danger' | 'accent' | 'default'
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span
    class="ds-badge font-mono"
    :class="[
      variant && variant !== 'default' ? `ds-badge--${variant}` : '',
      size === 'sm' ? 'ds-badge--sm' : ''
    ]"
  >
    <slot />
  </span>
</template>
