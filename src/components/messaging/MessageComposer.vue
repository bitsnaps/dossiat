<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  send: [content: string]
}>()

const input = ref('')

function handleSend() {
  const trimmed = input.value.trim()
  if (!trimmed) return
  emit('send', trimmed)
  input.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="ds-message-composer">
    <textarea
      v-model="input"
      class="ds-message-composer__input"
      :placeholder="t('messages.composerPlaceholder')"
      :disabled="disabled"
      rows="1"
      @keydown="handleKeydown"
    />
    <button
      class="ds-message-composer__send"
      :disabled="disabled || !input.trim()"
      @click="handleSend"
    >
      <i class="bi bi-send" />
    </button>
  </div>
</template>

<style scoped>
.ds-message-composer {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid var(--ds-border, #334155);
  background: var(--ds-bg, #0f172a);
}

.ds-message-composer__input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  border-radius: 1rem;
  border: 1px solid var(--ds-border, #334155);
  background: var(--ds-bg-elevated, #1e293b);
  color: var(--ds-text, #f1f5f9);
  font-size: 0.875rem;
  font-family: inherit;
  resize: none;
  outline: none;
  line-height: 1.5;
  max-height: 6rem;
  transition: border-color 0.15s ease;
}

.ds-message-composer__input:focus {
  border-color: var(--ds-accent, #6366f1);
}

.ds-message-composer__input:disabled {
  opacity: 0.5;
}

.ds-message-composer__input::placeholder {
  color: var(--ds-text-muted, #64748b);
}

.ds-message-composer__send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: none;
  background: var(--ds-accent, #6366f1);
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.ds-message-composer__send:hover:not(:disabled) {
  opacity: 0.9;
  transform: scale(1.05);
}

.ds-message-composer__send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
