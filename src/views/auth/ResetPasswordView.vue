<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { resetPassword } from '@/services/auth'

const { t } = useI18n()
const route = useRoute()

const token = route.params.token as string
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  if (password.value !== confirmPassword.value) {
    error.value = t('auth.resetPassword.passwordMismatch')
    return
  }

  loading.value = true
  error.value = null
  try {
    await resetPassword({ token, password: password.value })
    success.value = true
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || 'Failed to reset password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2>{{ t('auth.resetPassword.title') }}</h2>
    <p class="ds-auth-subtitle">{{ t('auth.resetPassword.subtitle') }}</p>

    <div v-if="success" class="ds-alert ds-alert--success">
      <i class="bi bi-check-circle-fill" />
      <span>{{ t('auth.resetPassword.success') }}</span>
    </div>

    <form v-else class="ds-auth-form" @submit.prevent="handleSubmit">
      <div v-if="error" class="ds-alert ds-alert--danger">
        <i class="bi bi-exclamation-triangle-fill" />
        <span>{{ error }}</span>
      </div>

      <div class="ds-input-group">
        <label class="ds-input-label">{{ t('auth.resetPassword.password') }}</label>
        <div class="ds-input-wrapper">
          <i class="bi bi-lock ds-input-icon" />
          <input
            v-model="password"
            type="password"
            class="ds-input ds-input-has-icon"
            :placeholder="t('auth.resetPassword.passwordPlaceholder')"
            required
          />
        </div>
      </div>

      <div class="ds-input-group">
        <label class="ds-input-label">{{ t('auth.resetPassword.confirmPassword') }}</label>
        <div class="ds-input-wrapper">
          <i class="bi bi-lock-fill ds-input-icon" />
          <input
            v-model="confirmPassword"
            type="password"
            class="ds-input ds-input-has-icon"
            :placeholder="t('auth.resetPassword.confirmPasswordPlaceholder')"
            required
          />
        </div>
      </div>

      <button type="submit" class="ds-btn ds-btn--accent" :disabled="loading">
        <span v-if="loading" class="ds-btn-spinner" />
        {{ t('auth.resetPassword.submit') }}
      </button>
    </form>

    <div class="ds-auth-footer">
      <RouterLink to="/login">{{ t('auth.resetPassword.backToLogin') }}</RouterLink>
    </div>
  </div>
</template>
