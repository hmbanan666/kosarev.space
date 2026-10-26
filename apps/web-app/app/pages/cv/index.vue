<template>
  <div class="cv-page">
    <a class="cv-skip" href="#cv-content">{{ t('cv.skip') }}</a>
    <nav class="cv-toolbar" :aria-label="t('cv.actions')">
      <NuxtLink
        :to="localePath('/cv/print')"
        target="_blank"
        class="cv-print-link"
      >
        {{ t('cv.printVersion') }}
      </NuxtLink>
      <div class="cv-toolbar-actions">
        <UButton
          external
          :to="pdfPath"
          :download="pdfPath.slice(1)"
          icon="i-lucide-download"
          size="lg"
        >
          {{ t('cv.downloadPdf') }}
        </UButton>
      </div>
    </nav>
    <CvDocument />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ hideLiveCursors: true, colorMode: 'dark' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const pdfPath = computed(() => locale.value === 'en' ? '/cv-en.pdf' : '/cv.pdf')
const canonical = computed(() => `https://kosarev.space${localePath('/cv')}`)

useSeoMeta({
  title: () => t('cv.seoTitle'),
  description: () => t('cv.seoDescription'),
  ogTitle: () => t('cv.seoTitle'),
  ogDescription: () => t('cv.seoDescription'),
  ogUrl: canonical,
  ogType: 'profile',
})
useHead({
  htmlAttrs: { lang: locale },
  link: [{ rel: 'canonical', href: canonical }],
})
</script>
