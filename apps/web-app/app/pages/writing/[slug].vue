<template>
  <WritingPublicationFrame v-if="publication" :publication="publication">
    <div v-html="text.html" />
  </WritingPublicationFrame>
</template>

<script setup lang="ts">
import { publicationPath, relatedWorkPath } from '~~/shared/publications'

definePageMeta({ colorMode: 'dark', hideLiveCursors: true, key: (route) => String(route.params.slug) })

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const language = computed(() => locale.value === 'en' ? 'en' : 'ru')
const { data: publication, error } = await useFetch(() => `/api/publications/${encodeURIComponent(String(route.params.slug))}`)
if (error.value || !publication.value) {
  throw createError({ statusCode: error.value?.statusCode === 404 ? 404 : 503, statusMessage: error.value?.statusCode === 404 ? 'Publication not found' : 'Publication unavailable' })
}
const text = computed(() => publication.value!.locales[language.value])
const canonical = computed(() => `https://kosarev.space${localePath(publicationPath(publication.value!))}`)
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
    { rel: 'alternate', hreflang: 'ru', href: `https://kosarev.space${publicationPath(publication.value!)}` },
    { rel: 'alternate', hreflang: 'en', href: `https://kosarev.space/en${publicationPath(publication.value!)}` },
    { rel: 'alternate', hreflang: 'x-default', href: `https://kosarev.space${publicationPath(publication.value!)}` },
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
      'datePublished': publication.value!.publishedAt,
      'image': image,
      'author': { '@type': 'Person', 'name': t('hero.name'), 'url': 'https://kosarev.space' },
      'mentions': publication.value!.relatedWork.map((work) => ({
        '@type': 'CreativeWork',
        'name': work.title[language.value],
        'url': `https://kosarev.space${localePath(relatedWorkPath(work))}`,
      })),
    }).replace(/</g, '\\u003c'),
  }],
}))
</script>
