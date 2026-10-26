<template>
  <ClientOnly>
    <button
      class="site-icon-button"
      type="button"
      :aria-label="t('cv.theme')"
      :aria-pressed="colorMode.value === 'dark'"
      @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
    >
      <UIcon :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'" aria-hidden="true" />
    </button>
    <template #fallback>
      <span class="site-icon-placeholder" aria-hidden="true" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const { t } = useI18n()
const colorMode = useColorMode()
</script>
