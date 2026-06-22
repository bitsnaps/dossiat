<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMissionsStore } from '@/stores/missions'
import { useToast } from '@/composables/useToast'
import FileUpload from '@/components/common/FileUpload.vue'

const { t } = useI18n()
const missionsStore = useMissionsStore()
const toast = useToast()

interface Attachment {
  id: number
  missionId: number
  uploadedBy: number
  fileUrl: string
  fileName: string
  fileType: string
  fileSize: number
  createdAt: string
}

interface Props {
  missionId: number
  attachments: Attachment[]
  status: string
}

const props = defineProps<Props>()

const uploading = ref(false)

const canUpload = ['agreed', 'in_progress'].includes(props.status)

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function fileIcon(fileType: string): string {
  if (fileType.includes('pdf')) return 'bi-file-earmark-pdf'
  if (fileType.includes('image')) return 'bi-file-earmark-image'
  if (fileType.includes('word') || fileType.includes('doc')) return 'bi-file-earmark-word'
  if (fileType.includes('sheet') || fileType.includes('excel')) return 'bi-file-earmark-excel'
  return 'bi-file-earmark'
}

async function handleFileUpload(file: File) {
  uploading.value = true
  try {
    await missionsStore.uploadAttachment(String(props.missionId), file)
    toast.success(t('missions.attachments.upload'))
  } catch {
    toast.error(t('missions.attachments.upload'))
  } finally {
    uploading.value = false
  }
}

function onUploadError(message: string) {
  toast.error(message)
}
</script>

<template>
  <div class="ds-mission-attachments">
    <div v-if="attachments.length === 0 && !canUpload" class="ds-mission-attachments__empty">
      <i class="bi bi-paperclip" />
      <p>{{ t('missions.attachments.empty') }}</p>
    </div>

    <div v-if="attachments.length > 0" class="ds-mission-attachments__list">
      <div
        v-for="attachment in attachments"
        :key="attachment.id"
        class="ds-mission-attachments__item"
      >
        <div class="ds-mission-attachments__icon">
          <i :class="['bi', fileIcon(attachment.fileType)]" />
        </div>
        <div class="ds-mission-attachments__info">
          <span class="ds-mission-attachments__name">{{ attachment.fileName }}</span>
          <span class="ds-mission-attachments__meta font-mono">
            {{ formatFileSize(attachment.fileSize) }} · {{ formatDate(attachment.createdAt) }}
          </span>
        </div>
        <a
          :href="attachment.fileUrl"
          target="_blank"
          rel="noopener"
          class="ds-mission-attachments__download"
        >
          <i class="bi bi-download" />
        </a>
      </div>
    </div>

    <FileUpload
      v-if="canUpload"
      :loading="uploading"
      @upload:file="handleFileUpload"
      @error="onUploadError"
    />
  </div>
</template>

<style scoped>
.ds-mission-attachments {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ds-mission-attachments__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-attachments__empty i {
  font-size: 2rem;
}

.ds-mission-attachments__list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--ds-border, #334155);
  border-radius: 0.5rem;
  overflow: hidden;
}

.ds-mission-attachments__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--ds-border, #334155);
  transition: background 0.15s ease;
}

.ds-mission-attachments__item:last-child {
  border-bottom: none;
}

.ds-mission-attachments__item:hover {
  background: var(--ds-bg-hover, rgba(99, 102, 241, 0.05));
}

.ds-mission-attachments__icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-accent, #6366f1);
  font-size: 1.125rem;
  flex-shrink: 0;
}

.ds-mission-attachments__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.ds-mission-attachments__name {
  font-size: 0.875rem;
  color: var(--ds-text, #f1f5f9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-mission-attachments__meta {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-attachments__download {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  color: var(--ds-text-muted, #64748b);
  text-decoration: none;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.ds-mission-attachments__download:hover {
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-accent, #6366f1);
}

.ds-mission-attachments__upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  border: 2px dashed var(--ds-border, #334155);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.ds-mission-attachments__upload:hover,
.ds-mission-attachments__upload--dragover {
  border-color: var(--ds-accent, #6366f1);
  background: rgba(99, 102, 241, 0.05);
}

.ds-mission-attachments__file-input {
  display: none;
}

.ds-mission-attachments__uploading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-attachments__upload i {
  font-size: 1.5rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-attachments__upload-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ds-text, #f1f5f9);
}

.ds-mission-attachments__upload-hint {
  font-size: 0.8125rem;
  color: var(--ds-text-muted, #64748b);
}

.ds-mission-attachments__upload-meta {
  font-size: 0.75rem;
  color: var(--ds-text-muted, #64748b);
  opacity: 0.7;
}
</style>
