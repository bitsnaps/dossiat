<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCopyToClipboard } from '@/composables/useCopyToClipboard'
import { useToast } from '@/composables/useToast'
import { useAgentProfileStore } from '@/stores/agentProfile'
import BButton from '@/components/base/BButton.vue'

const { t } = useI18n()
const { copied, copy } = useCopyToClipboard()
const toast = useToast()
const agentProfileStore = useAgentProfileStore()

interface Props {
  slug: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  regenerated: [slug: string]
}>()

const showRegenerateConfirm = ref(false)

function getFullLink() {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  return `${base}/agents/${props.slug}`
}

async function handleCopy() {
  const success = await copy(getFullLink())
  if (success) {
    toast.success(t('agentProfile.settings.copied'))
  }
}

function shareWhatsApp() {
  const text = encodeURIComponent(`Check out my Dossiat profile: ${getFullLink()}`)
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

function shareEmail() {
  const subject = encodeURIComponent('My Dossiat Profile')
  const body = encodeURIComponent(`Hi,\n\nYou can view my profile and start a mission here:\n${getFullLink()}\n\nBest regards`)
  window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
}

async function handleRegenerate() {
  try {
    const result = await agentProfileStore.regenerateInviteLink()
    showRegenerateConfirm.value = false
    toast.success(t('agentProfile.settings.linkRegenerated'))
    emit('regenerated', result!.slug)
  } catch {
    toast.error(agentProfileStore.error || 'Failed to regenerate link')
  }
}
</script>

<template>
  <div class="ds-invite-link-share">
    <div class="ds-invite-link-share__input-row">
      <input
        type="text"
        class="ds-input ds-invite-link-share__input font-mono"
        :value="getFullLink()"
        readonly
      />
      <BButton
        variant="accent"
        size="sm"
        :icon="copied ? 'bi-check-lg' : 'bi-clipboard'"
        @click="handleCopy"
      >
        {{ copied ? t('agentProfile.settings.copied') : t('agentProfile.settings.copyLink') }}
      </BButton>
    </div>

    <div class="ds-invite-link-share__actions">
      <BButton variant="ghost" size="sm" icon="bi-whatsapp" @click="shareWhatsApp">
        {{ t('agentProfile.settings.shareWhatsApp') }}
      </BButton>
      <BButton variant="ghost" size="sm" icon="bi-envelope" @click="shareEmail">
        {{ t('agentProfile.settings.shareEmail') }}
      </BButton>
      <BButton
        variant="ghost"
        size="sm"
        icon="bi-arrow-clockwise"
        @click="showRegenerateConfirm = true"
      >
        {{ t('agentProfile.settings.regenerate') }}
      </BButton>
    </div>

    <!-- Regenerate Confirmation -->
    <div v-if="showRegenerateConfirm" class="ds-invite-link-share__confirm">
      <p class="ds-invite-link-share__confirm-text">
        {{ t('agentProfile.settings.regenerateConfirm') }}
      </p>
      <div class="ds-invite-link-share__confirm-actions">
        <BButton variant="danger" size="sm" :loading="agentProfileStore.loading" @click="handleRegenerate">
          {{ t('agentProfile.settings.regenerate') }}
        </BButton>
        <BButton variant="ghost" size="sm" @click="showRegenerateConfirm = false">
          {{ t('agentProfile.setup.back') }}
        </BButton>
      </div>
    </div>
  </div>
</template>
