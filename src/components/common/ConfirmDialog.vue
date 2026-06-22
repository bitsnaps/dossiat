<script lang="ts" setup>
import BModal from '@/components/base/BModal.vue'
import BButton from '@/components/base/BButton.vue'

interface Props {
  modelValue: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'accent'
}

withDefaults(defineProps<Props>(), {
  message: undefined,
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'accent',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function onConfirm() {
  emit('update:modelValue', false)
  emit('confirm')
}

function onCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<template>
  <BModal :model-value="modelValue" :title="title" size="sm" @update:model-value="emit('update:modelValue', $event)">
    <p v-if="message" style="color: var(--ds-text-muted); margin: 0; font-size: 0.875rem;">{{ message }}</p>
    <template #footer>
      <BButton variant="ghost" @click="onCancel">
        {{ cancelLabel }}
      </BButton>
      <BButton :variant="variant" @click="onConfirm">
        {{ confirmLabel }}
      </BButton>
    </template>
  </BModal>
</template>
