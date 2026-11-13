<template>
  <div class="site-wrap project-page">
    <nav class="project-breadcrumb" :aria-label="t('site.caseNavigation')">
      <NuxtLink :to="`${localePath('/')}#projects`">
        <UIcon name="i-lucide-arrow-left" aria-hidden="true" />{{ t('writing.backToProducts') }}
      </NuxtLink>
    </nav>
    <article :data-project-page="entry.key">
      <p class="project-status" :data-project-status="entry.status">
        {{ t(entry.status === 'active' ? 'projects.statusActive' : 'projects.statusPaused') }}
      </p>
      <h1>{{ entry.title }}</h1>
      <p class="project-kind">
        {{ t(`projects.${entry.key}.kind`) }}
      </p>
      <p class="project-deck">
        {{ t(`projects.${entry.key}.description`) }}
      </p>
      <p class="project-work">
        {{ t(`projects.${entry.key}.work`) }}
      </p>
      <div class="project-links">
        <a
          :href="entry.source"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('site.source') }}<UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
        </a>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { projectPageEntity } from '~/utils/structured-data'

definePageMeta({
  colorMode: 'dark',
  hideLiveCursors: true,
  key: (route) => String(route.params.key),
})

const { t, locale } = useI18n()
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

<style scoped>
.project-page { padding-block: 2rem 4rem; }
.project-breadcrumb { font-size: .85rem; margin-bottom: 2.5rem; }
.project-breadcrumb a { display: inline-flex; gap: .6rem; align-items: center; color: var(--ui-text-muted); }
.project-breadcrumb a:hover { text-decoration: underline; }
.project-status { font-size: .85rem; color: var(--ui-text-muted); border-left: 3px solid var(--ui-border-accented); padding-left: 1rem; margin-bottom: 1.5rem !important; }
.project-page h1 { font: 500 clamp(2rem, 4vw, 3.5rem)/1.15 var(--font-serif); letter-spacing: -.035em; }
.project-kind { margin-top: .75rem !important; color: var(--ui-primary); }
.project-deck, .project-work { max-width: 70ch; }
.project-deck { font-size: 1.1rem; margin-top: 1.5rem !important; }
.project-work { margin-top: 1rem !important; color: var(--ui-text-muted); }
.project-links { display: flex; flex-wrap: wrap; gap: .75rem 1.25rem; margin-top: 1.75rem; font-size: .9rem; }
.project-links a { display: inline-flex; align-items: center; gap: .4rem; color: var(--ui-primary); text-decoration: underline; }
</style>
