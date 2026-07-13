<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useDirection } from '@/composables/useDirection'

const { t } = useI18n()
useDirection()
</script>

<template>
  <div class="ds-legal-page">
    <div class="container ds-legal-container">
      <RouterLink to="/" class="ds-legal-back">
        <i class="bi bi-arrow-left" /> {{ t('legal.backToHome') }}
      </RouterLink>

      <h1>{{ t('legal.privacy.title') }}</h1>
      <p class="ds-legal-updated">{{ t('legal.lastUpdated', { date: t('legal.privacy.lastUpdatedDate') }) }}</p>

      <section>
        <h2>{{ t('legal.privacy.section1Title') }}</h2>
        <p>{{ t('legal.privacy.section1Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.privacy.section2Title') }}</h2>
        <p>{{ t('legal.privacy.section2Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.privacy.section3Title') }}</h2>
        <p>{{ t('legal.privacy.section3Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.privacy.section4Title') }}</h2>
        <p>{{ t('legal.privacy.section4Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.privacy.section5Title') }}</h2>
        <p>{{ t('legal.privacy.section5Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.privacy.section6Title') }}</h2>
        <p>{{ t('legal.privacy.section6Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.privacy.section7Title') }}</h2>
        <p>{{ t('legal.privacy.section7Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.privacy.section8Title') }}</h2>
        <p>{{ t('legal.privacy.section8Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.privacy.section9Title') }}</h2>
        <p>{{ t('legal.privacy.section9Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.privacy.section10Title') }}</h2>
        <p>{{ t('legal.privacy.section10Body') }}</p>
      </section>
    </div>
  </div>
</template>
