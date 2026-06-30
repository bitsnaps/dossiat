<script lang="ts" setup>
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<template>
  <div v-if="modelValue" class="ds-modal-overlay" @click.self="close">
    <div :class="['ds-modal-dialog', `ds-modal-${size}`]">
      <div v-if="title" class="ds-modal-header">
        <h3 class="ds-modal-title">{{ title }}</h3>
        <button class="ds-modal-close" @click="close">
          <i class="bi bi-x-lg" />
        </button>
      </div>
      <template v-if="!title">
        <button class="ds-modal-close ds-modal-close--top" @click="close">
          <i class="bi bi-x-lg" />
        </button>
      </template>
      <div class="ds-modal-body">
        <slot />
      </div>
      <div v-if="$slots.footer" class="ds-modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
