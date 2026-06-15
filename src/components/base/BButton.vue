<script lang="ts" setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

interface Props {
  variant?: 'accent' | 'outline' | 'gradient' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: string
  href?: string
  to?: string
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'accent',
  size: 'md',
  loading: false,
  disabled: false,
  icon: undefined,
  href: undefined,
  to: undefined,
  type: 'button',
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const tag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})

const bindAttrs = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href }
  return { type: props.type, disabled: props.disabled || props.loading }
})

function onClick(e: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', e)
  }
}
</script>

<template>
  <component
    :is="tag"
    :class="['ds-btn', `ds-btn--${variant}`, `ds-btn--${size}`, { 'ds-btn--loading': loading }]"
    v-bind="bindAttrs"
    @click="onClick"
  >
    <slot name="icon" />
    <i v-if="icon" :class="['bi', icon]" />
    <slot />
  </component>
</template>
