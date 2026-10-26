<template>
  <NuxtLink
    :to="switchLocalePath(nextLocale.code)"
    class="site-language"
    :aria-label="nextLocale.name"
    :hreflang="nextLocale.code"
    :lang="nextLocale.code"
  >
    {{ nextLocale.code.toUpperCase() }}
  </NuxtLink>
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const nextLocale = computed(() => locales.value.find((item) => item.code !== locale.value)!)
</script>
