<template>
  <UIcon
    :name="external ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-right'"
    class="site-link-icon"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
defineProps<{ external?: boolean }>()
</script>
