<template>
  <div class="site-wrap writing-feed">
    <header class="feed-heading">
      <h1>{{ t('writing.title') }}</h1>
      <p>{{ t('writing.description') }}</p>
    </header>
    <WritingPublicationList :items="items" />
  </div>
</template>

<script setup lang="ts">
import { publications, sortPublications } from '~~/shared/publications'

definePageMeta({ colorMode: 'dark', hideLiveCursors: true })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const items = sortPublications(publications)
const canonical = computed(() => `https://kosarev.space${localePath('/writing')}`)

useSeoMeta({
  title: () => t('writing.title'),
  description: () => t('writing.description'),
  ogTitle: () => t('writing.title'),
  ogDescription: () => t('writing.description'),
  ogType: 'website',
  ogUrl: canonical,
  ogImage: 'https://kosarev.space/og-image.png',
})
useHead(() => ({
  htmlAttrs: { lang: locale.value },
  link: [
    { rel: 'canonical', href: canonical.value },
    { rel: 'alternate', hreflang: 'ru', href: 'https://kosarev.space/writing' },
    { rel: 'alternate', hreflang: 'en', href: 'https://kosarev.space/en/writing' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://kosarev.space/writing' },
  ],
}))
</script>

<style scoped>
.writing-feed { padding-block: 3rem 5rem; }
.feed-heading { margin-bottom: 3rem; max-width: 70ch; }
.feed-heading h1 { font: 500 clamp(2.5rem, 5vw, 4rem)/1.15 var(--font-serif); letter-spacing: -.035em; }
.feed-heading p { margin-top: 1.25rem !important; color: var(--ui-text-muted); }
</style>
