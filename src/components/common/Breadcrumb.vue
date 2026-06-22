<script lang="ts" setup>
import { RouterLink } from 'vue-router'

interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav class="ds-breadcrumb" aria-label="Breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <span v-if="index > 0" class="ds-breadcrumb__separator">
        <i class="bi bi-chevron-right" />
      </span>
      <RouterLink
        v-if="item.to && index < items.length - 1"
        :to="item.to"
        class="ds-breadcrumb__item"
      >
        {{ item.label }}
      </RouterLink>
      <span
        v-else
        class="ds-breadcrumb__item ds-breadcrumb__item--current"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>