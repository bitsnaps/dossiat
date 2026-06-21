<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

async function handleSubmit() {
  await authStore.login({ email: email.value, password: password.value })
  if (authStore.isAuthenticated) {
    const redirect = (route.query.redirect as string) || '/app/dashboard'
    router.push(redirect)
  }
}
</script>

<template>
  <div>
    <h2>{{ t('auth.login.title') }}</h2>
    <p class="ds-auth-subtitle">{{ t('auth.login.subtitle') }}</p>

    <div v-if="authStore.error" class="ds-alert ds-alert--danger">
      <i class="bi bi-exclamation-triangle-fill" />
      <span>{{ authStore.error }}</span>
    </div>

    <form class="ds-auth-form" @submit.prevent="handleSubmit">
      <div class="ds-input-group">
        <label class="ds-input-label">{{ t('auth.login.email') }}</label>
        <div class="ds-input-wrapper">
          <i class="bi bi-envelope ds-input-icon" />
          <input
            v-model="email"
            type="email"
            class="ds-input ds-input-has-icon"
            :placeholder="t('auth.login.emailPlaceholder')"
            required
          />
        </div>
      </div>

      <div class="ds-input-group">
        <label class="ds-input-label">{{ t('auth.login.password') }}</label>
        <div class="ds-input-wrapper">
          <i class="bi bi-lock ds-input-icon" />
          <input
            v-model="password"
            type="password"
            class="ds-input ds-input-has-icon"
            :placeholder="t('auth.login.passwordPlaceholder')"
            required
          />
        </div>
      </div>

      <div style="text-align: end; margin-top: -0.25rem;">
        <RouterLink to="/forgot-password" class="ds-auth-link">
          {{ t('auth.login.forgotPassword') }}
        </RouterLink>
      </div>

      <button type="submit" class="ds-btn ds-btn--accent" :disabled="authStore.loading">
        <span v-if="authStore.loading" class="ds-btn-spinner" />
        {{ t('auth.login.submit') }}
      </button>
    </form>

    <div class="ds-auth-footer">
      {{ t('auth.login.noAccount') }}
      <RouterLink to="/register">{{ t('auth.login.register') }}</RouterLink>
    </div>
  </div>
</template>
