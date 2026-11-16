<template>
  <SiteHeader class="cv-screen-header" />
  <main class="cv-print-page">
    <CvDocument printable />
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  colorMode: 'light',
  robots: false,
  hideLiveCursors: true,
})

const { t, locale } = useI18n()
useSeoMeta({ title: () => t('cv.seoTitle'), robots: 'noindex, nofollow' })
useHead({ htmlAttrs: { lang: locale } })
</script>

<style scoped>
@media print { .cv-screen-header { display: none; } }
</style>
