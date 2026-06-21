import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export function useDirection() {
  const { locale } = useI18n()

  const dir = computed(() => (locale.value === 'ar' ? 'rtl' : 'ltr'))

  watch(dir, (newDir) => {
    document.documentElement.setAttribute('dir', newDir)
    document.documentElement.setAttribute('lang', locale.value)
  }, { immediate: true })

  watch(locale, (newLocale) => {
    localStorage.setItem('ds-locale', newLocale)
  })

  return { dir }
}
