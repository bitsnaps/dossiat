<script lang="ts" setup>
import BAvatar from '@/components/base/BAvatar.vue'

interface Props {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  online?: boolean
  ring?: boolean
}

withDefaults(defineProps<Props>(), {
  src: undefined,
  name: '',
  size: 'md',
  online: false,
  ring: false,
})

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <div
    :class="{ 'ds-cursor-pointer': $attrs.onClick }"
    @click="emit('click')"
  >
    <BAvatar
      :src="src"
      :name="name"
      :size="size"
      :online="online"
      :class="{ 'ds-avatar--ring': ring }"
    />
  </div>
</template>