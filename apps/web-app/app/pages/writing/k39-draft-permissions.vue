<template>
  <WritingArticleFrame :title="article.title" :description="article.description">
    <WritingK39ArticleEn v-if="locale === 'en'" />
    <WritingK39ArticleRu v-else />
  </WritingArticleFrame>
</template>

<script setup lang="ts">
import { k39Article } from '~/utils/writing'

definePageMeta({ colorMode: 'dark', hideLiveCursors: true })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const article = computed(() => k39Article[locale.value === 'en' ? 'en' : 'ru'])
const canonical = computed(() => `https://kosarev.space${localePath(k39Article.path)}`)
const image = 'https://kosarev.space/og-image.png'

useSeoMeta({
  title: () => article.value.title,
  description: () => article.value.description,
  ogTitle: () => article.value.title,
  ogDescription: () => article.value.description,
  ogType: 'article',
  ogUrl: canonical,
  ogImage: image,
  twitterCard: 'summary_large_image',
  twitterImage: image,
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: canonical.value },
    { rel: 'alternate', hreflang: 'ru', href: `https://kosarev.space${k39Article.path}` },
    { rel: 'alternate', hreflang: 'en', href: `https://kosarev.space/en${k39Article.path}` },
    { rel: 'alternate', hreflang: 'x-default', href: `https://kosarev.space${k39Article.path}` },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.value.title,
      'description': article.value.description,
      'url': canonical.value,
      'inLanguage': locale.value,
      'image': image,
      'author': { '@type': 'Person', 'name': t('hero.name'), 'url': 'https://kosarev.space' },
      'about': { '@type': 'SoftwareApplication', 'name': 'K39', 'url': 'https://k39.online' },
    }),
  }],
}))
</script>
