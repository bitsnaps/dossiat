<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  online?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: undefined,
  name: '',
  size: 'md',
  online: false,
})

const initials = computed(() => {
  if (!props.name) return ''
  const parts = props.name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0][0].toUpperCase()
})
</script>

<template>
  <div :class="['ds-avatar', `ds-avatar--${size}`]">
    <img v-if="src" :src="src" :alt="name" class="ds-avatar-img" />
    <span v-else class="ds-avatar-initials">{{ initials }}</span>
    <span v-if="online" class="ds-avatar-online" />
  </div>
</template>
