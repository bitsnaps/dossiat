<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { verifyEmail } from '@/services/auth'

const { t } = useI18n()
const route = useRoute()

const token = route.params.token as string
const loading = ref(true)
const success = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    await verifyEmail(token)
    success.value = true
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || 'Verification failed'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h2>{{ t('auth.verifyEmail.title') }}</h2>

    <div v-if="loading" class="ds-auth-loading">
      <div class="ds-btn-spinner" style="width: 32px; height: 32px; border-width: 3px;" />
      <p class="ds-auth-subtitle">{{ t('auth.verifyEmail.verifying') }}</p>
    </div>

    <div v-else-if="success" class="ds-alert ds-alert--success">
      <i class="bi bi-check-circle-fill" />
      <span>{{ t('auth.verifyEmail.success') }}</span>
    </div>

    <div v-else-if="error" class="ds-alert ds-alert--danger">
      <i class="bi bi-exclamation-triangle-fill" />
      <span>{{ error }}</span>
    </div>

    <div class="ds-auth-footer">
      <RouterLink to="/login">{{ t('auth.verifyEmail.backToLogin') }}</RouterLink>
    </div>
  </div>
</template>
