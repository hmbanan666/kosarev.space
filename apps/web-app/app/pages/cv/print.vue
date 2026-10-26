<template>
  <main class="cv-print-page">
    <CvDocument printable />
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  robots: false,
  hideLiveCursors: true,
})

const { t, locale } = useI18n()
useSeoMeta({ title: () => t('cv.seoTitle'), robots: 'noindex, nofollow' })
useHead({ htmlAttrs: { lang: locale } })
</script>
