<template>
  <ProjectArticle
    v-if="copy"
    page-key="section-fixture"
    :title="copy.title"
    status="active"
    :kind="copy.kind"
    :description="copy.description"
    :work="copy.work"
    link="https://example.com/fixture"
    :link-label="copy.linkLabel"
    :sections="copy.sections"
    data-project-fixture
  />
</template>

<script setup lang="ts">
definePageMeta({
  colorMode: 'dark',
  hideLiveCursors: true,
  sitemap: false,
})

// Layout fixture for review screenshots. The import stays behind the dev
// flag so a production build does not serve this route.
const sampleProjectPage = import.meta.dev
  ? (await import('~/utils/project-section-fixture')).sampleProjectPage
  : null
if (!sampleProjectPage) {
  throw createError({ statusCode: 404, statusMessage: 'Not found' })
}

const { locale } = useI18n()
const language = computed(() => locale.value === 'en' ? 'en' : 'ru')
const copy = computed(() => sampleProjectPage[language.value])

useSeoMeta({
  title: () => copy.value.title,
  robots: 'noindex, nofollow',
})
</script>
