<template>
  <ProjectArticle
    :page-key="entry.key"
    :title="entry.title"
    :status="entry.status"
    :kind="t(`projects.${entry.key}.kind`)"
    :description="t(`projects.${entry.key}.description`)"
    :work="t(`projects.${entry.key}.work`)"
    :source="entry.source"
    :link="entry.link"
    :link-label="entry.link ? t(`projects.${entry.key}.visit`) : undefined"
    :sections="sections"
  />
</template>

<script setup lang="ts">
import { projectSectionsFor } from '~/utils/project-sections'
import { projectPageEntity } from '~/utils/structured-data'

definePageMeta({
  colorMode: 'dark',
  hideLiveCursors: true,
  key: (route) => String(route.params.key),
})

const { t, te, tm, rt, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const key = String(route.params.key)
const found = portfolioPages.find((item) => item.key === key)
if (!found) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}
const entry = found

const language = computed(() => locale.value === 'en' ? 'en' : 'ru')
const canonical = computed(() => `https://kosarev.space${localePath(`/projects/${entry.key}`)}`)
const summary = computed(() => entry.status === 'paused'
  ? `${t('projects.statusPaused')}. ${t(`projects.${entry.key}.description`)}`
  : t(`projects.${entry.key}.description`))
const image = computed(() => `https://kosarev.space/og/${language.value}/projects/${entry.key}.png`)
const entity = computed(() => projectPageEntity(language.value, entry.key, t))
const sections = computed(() => projectSectionsFor(entry.key, {
  te,
  tm,
  resolve: (message) => rt(message as Parameters<typeof rt>[0]),
}))

useSeoMeta({
  title: () => entry.title,
  description: summary,
  ogTitle: () => entry.title,
  ogDescription: summary,
  ogType: 'website',
  ogUrl: canonical,
  ogImage: image,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterImage: image,
})

useHead(() => ({
  htmlAttrs: { lang: locale.value },
  link: [
    { rel: 'canonical', href: canonical.value },
    { rel: 'alternate', hreflang: 'ru', href: `https://kosarev.space/projects/${entry.key}` },
    { rel: 'alternate', hreflang: 'en', href: `https://kosarev.space/en/projects/${entry.key}` },
    { rel: 'alternate', hreflang: 'x-default', href: `https://kosarev.space/projects/${entry.key}` },
    ...writingFeedLinks,
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({ '@context': 'https://schema.org', ...entity.value }).replace(/</g, '\\u003c'),
  }],
}))
</script>
