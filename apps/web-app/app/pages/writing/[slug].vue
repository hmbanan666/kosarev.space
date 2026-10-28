<template>
  <WritingPublicationFrame :publication="publication">
    <component :is="body" />
  </WritingPublicationFrame>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { findPublication, publicationPath, relatedWorkPath } from '~~/shared/publications'

definePageMeta({ colorMode: 'dark', hideLiveCursors: true })

const content = import.meta.glob<{ default: Component }>('../../components/writing/content/*.vue')
const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const language = computed(() => locale.value === 'en' ? 'en' : 'ru')
const publication = computed(() => {
  const found = findPublication(String(route.params.slug))
  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Publication not found' })
  }
  return found
})
const text = computed(() => publication.value.locales[language.value])
const body = computed(() => {
  const loader = content[`../../components/writing/content/${text.value.content}.vue`]
  if (!loader) {
    throw createError({ statusCode: 500, statusMessage: 'Publication content unavailable' })
  }
  return defineAsyncComponent(loader)
})
const canonical = computed(() => `https://kosarev.space${localePath(publicationPath(publication.value))}`)
const image = 'https://kosarev.space/og-image.png'

useSeoMeta({
  title: () => text.value.title,
  description: () => text.value.description,
  ogTitle: () => text.value.title,
  ogDescription: () => text.value.description,
  ogType: 'article',
  ogUrl: canonical,
  ogImage: image,
  twitterCard: 'summary_large_image',
  twitterImage: image,
})
useHead(() => ({
  htmlAttrs: { lang: locale.value },
  link: [
    { rel: 'canonical', href: canonical.value },
    { rel: 'alternate', hreflang: 'ru', href: `https://kosarev.space${publicationPath(publication.value)}` },
    { rel: 'alternate', hreflang: 'en', href: `https://kosarev.space/en${publicationPath(publication.value)}` },
    { rel: 'alternate', hreflang: 'x-default', href: `https://kosarev.space${publicationPath(publication.value)}` },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': text.value.title,
      'description': text.value.description,
      'url': canonical.value,
      'inLanguage': language.value,
      'datePublished': publication.value.publishedAt,
      'image': image,
      'author': { '@type': 'Person', 'name': t('hero.name'), 'url': 'https://kosarev.space' },
      'mentions': publication.value.relatedWork.map((work) => ({
        '@type': 'CreativeWork',
        'name': work.title[language.value],
        'url': `https://kosarev.space${localePath(relatedWorkPath(work))}`,
      })),
    }),
  }],
}))
</script>
