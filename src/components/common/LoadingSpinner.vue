<script lang="ts" setup>
withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  label?: string
}>(), {
  size: 'md',
  label: undefined,
})
</script>

<template>
  <div class="ds-loading-spinner">
    <div :class="['ds-loading-spinner__ring', `ds-loading-spinner__ring--${size}`]" />
    <span v-if="label || $slots.default" class="ds-loading-spinner__label">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>
