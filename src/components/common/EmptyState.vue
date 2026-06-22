<script lang="ts" setup>
withDefaults(defineProps<{
  icon?: string
  title?: string
  hint?: string
}>(), {
  icon: 'bi-inbox',
  title: undefined,
  hint: undefined,
})
</script>

<template>
  <div class="ds-empty-state">
    <slot name="icon">
      <i :class="['bi', icon, 'ds-empty-state__icon']" />
    </slot>
    <p v-if="title" class="ds-empty-state__title">{{ title }}</p>
    <p v-if="hint" class="ds-empty-state__hint">{{ hint }}</p>
    <slot />
  </div>
</template>
