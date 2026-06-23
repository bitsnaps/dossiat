<script lang="ts" setup>
interface Props {
  variant?: 'text' | 'circle' | 'card' | 'line' | 'avatar' | 'badge'
  width?: string
  height?: string
  lines?: number
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  width: '100%',
  height: '',
  lines: 3,
  rounded: true,
})

const variantClass = `ds-skeleton--${props.variant}`
</script>

<template>
  <!-- Card variant: renders a card-shaped skeleton -->
  <div v-if="variant === 'card'" class="ds-skeleton ds-skeleton--card">
    <div class="ds-skeleton-card__header">
      <div class="ds-skeleton ds-skeleton--avatar" style="width: 40px; height: 40px;" />
      <div class="ds-skeleton-card__header-text">
        <div class="ds-skeleton ds-skeleton--text" style="width: 60%;" />
        <div class="ds-skeleton ds-skeleton--text" style="width: 40%; height: 10px;" />
      </div>
    </div>
    <div class="ds-skeleton-card__body">
      <div v-for="i in lines" :key="i" class="ds-skeleton ds-skeleton--line" />
    </div>
  </div>

  <!-- Text variant: renders multiple text lines -->
  <div v-else-if="variant === 'text'" class="ds-skeleton-text-group">
    <div
      v-for="i in lines"
      :key="i"
      class="ds-skeleton ds-skeleton--text"
      :style="{
        width: i === lines && lines > 1 ? '70%' : '100%',
        height: height || undefined,
      }"
    />
  </div>

  <!-- Single element variants -->
  <div
    v-else
    class="ds-skeleton"
    :class="variantClass"
    :style="{
      width: variant === 'circle' || variant === 'avatar' ? (width || '40px') : (width || '100%'),
      height: height || (variant === 'circle' || variant === 'avatar' ? (width || '40px') : variant === 'badge' ? '24px' : '16px'),
    }"
  />
</template>

<style scoped>
.ds-skeleton-text-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ds-skeleton-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.ds-skeleton-card__header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.ds-skeleton-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
