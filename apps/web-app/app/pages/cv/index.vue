<template>
  <main class="cv-page">
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
        <ClientOnly>
          <UButton
            :aria-label="t('cv.theme')"
            :aria-pressed="colorMode.value === 'dark'"
            :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
            variant="ghost"
            color="neutral"
            @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
          />
        </ClientOnly>
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
  </main>
</template>

<script setup lang="ts">
definePageMeta({ hideLiveCursors: true })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const colorMode = useColorMode()
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
