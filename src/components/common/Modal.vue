<script lang="ts" setup>
import BModal from '@/components/base/BModal.vue'
import BButton from '@/components/base/BButton.vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  confirmLabel?: string
  cancelLabel?: string
  hideFooter?: boolean
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  size: 'md',
  loading: false,
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  hideFooter: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<template>
  <BModal
    :model-value="modelValue"
    :title="title"
    :size="size"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />

    <template v-if="!hideFooter" #footer>
      <BButton variant="ghost" :disabled="loading" @click="onCancel">
        {{ cancelLabel }}
      </BButton>
      <BButton variant="accent" :loading="loading" :disabled="loading" @click="onConfirm">
        {{ confirmLabel }}
      </BButton>
    </template>
  </BModal>
</template>
