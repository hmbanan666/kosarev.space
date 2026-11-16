<template>
  <NuxtLink
    :to="destination"
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
const mounted = useMounted()
const destination = computed(() => {
  const path = switchLocalePath(nextLocale.value.code)
  return mounted.value ? path : path?.split('#')[0]
})
const nextLocale = computed(() => locales.value.find((item) => item.code !== locale.value)!)
</script>
