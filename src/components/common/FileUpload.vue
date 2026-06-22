<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
  accept?: string
  maxSize?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  maxSize: 10 * 1024 * 1024,
  loading: false,
})

const emit = defineEmits<{
  'upload:file': [file: File]
  error: [message: string]
}>()

const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateAndEmit(file: File) {
  if (file.size > props.maxSize) {
    emit('error', `File too large. Maximum size: ${formatFileSize(props.maxSize)}`)
    return
  }
  emit('upload:file', file)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    validateAndEmit(input.files[0])
    input.value = ''
  }
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) validateAndEmit(file)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function triggerUpload() {
  fileInput.value?.click()
}
</script>

<template>
  <div
    :class="['ds-file-upload', { 'ds-file-upload--dragover': dragOver }]"
    @drop="onDrop"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @click="triggerUpload"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="ds-file-upload__input"
      @change="onFileChange"
    />
    <div v-if="loading" class="ds-file-upload__uploading">
      <div class="spinner-border spinner-border-sm" role="status" />
      <span>Uploading…</span>
    </div>
    <template v-else>
      <slot>
        <i class="bi bi-cloud-arrow-up ds-file-upload__icon" />
        <span class="ds-file-upload__text">Click or drag to upload</span>
        <span class="ds-file-upload__hint">Supported formats: {{ accept }}</span>
        <span class="ds-file-upload__meta">Max size: {{ formatFileSize(maxSize) }}</span>
      </slot>
    </template>
  </div>
</template>