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

      <h1>{{ t('legal.terms.title') }}</h1>
      <p class="ds-legal-updated">{{ t('legal.lastUpdated', { date: t('legal.terms.lastUpdatedDate') }) }}</p>

      <section>
        <h2>{{ t('legal.terms.section1Title') }}</h2>
        <p>{{ t('legal.terms.section1Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.terms.section2Title') }}</h2>
        <p>{{ t('legal.terms.section2Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.terms.section3Title') }}</h2>
        <p>{{ t('legal.terms.section3Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.terms.section4Title') }}</h2>
        <p>{{ t('legal.terms.section4Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.terms.section5Title') }}</h2>
        <p>{{ t('legal.terms.section5Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.terms.section6Title') }}</h2>
        <p>{{ t('legal.terms.section6Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.terms.section7Title') }}</h2>
        <p>{{ t('legal.terms.section7Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.terms.section8Title') }}</h2>
        <p>{{ t('legal.terms.section8Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.terms.section9Title') }}</h2>
        <p>{{ t('legal.terms.section9Body') }}</p>
      </section>

      <section>
        <h2>{{ t('legal.terms.section10Title') }}</h2>
        <p>{{ t('legal.terms.section10Body') }}</p>
      </section>
    </div>
  </div>
</template>
