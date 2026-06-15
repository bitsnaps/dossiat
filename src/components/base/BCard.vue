<script lang="ts" setup>
interface Props {
  variant?: 'bordered' | 'transparent' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'bordered',
  padding: 'md',
  clickable: false,
})

const emit = defineEmits<{ click: [] }>()

function handleClick() {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<template>
  <div
    :class="[
      'ds-card',
      {
        'ds-card--transparent': variant === 'transparent',
        'ds-card--elevated': variant === 'elevated',
        'ds-card--clickable': clickable,
      },
    ]"
    @click="handleClick"
  >
    <div v-if="$slots.header" class="ds-card__header">
      <slot name="header" />
    </div>
    <div :class="['ds-card__body', `ds-card__body--${padding}`]">
      <slot />
    </div>
    <div v-if="$slots.footer" class="ds-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>
