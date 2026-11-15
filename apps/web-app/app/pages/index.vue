<template>
  <UPage>
    <HomeCanvas />
    <details
      ref="catalog"
      class="home-catalog"
      :open="hasCatalogQuery"
    >
      <summary class="site-wrap">
        {{ t('nav.cases') }} / {{ t('projects.archiveTitle') }}
      </summary>
      <SkillsShowcaseSection />
      <ProjectsSection />
    </details>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ key: 'portfolio', colorMode: 'dark' })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const catalog = useTemplateRef<HTMLDetailsElement>('catalog')
const hasCatalogQuery = computed(() => ['q', 'focus', 'tech', 'all'].some((key) => route.query[key]))
function openCatalog() {
  const hash = window.location.hash
  if (hash === '#skills' || hash === '#projects' || hash.startsWith('#project-')) {
    if (catalog.value) {
      catalog.value.open = true
    }
    nextTick(() => document.getElementById(hash.slice(1))?.scrollIntoView())
  }
}
onMounted(openCatalog)
watch(() => route.fullPath, () => nextTick(openCatalog))
useEventListener('hashchange', openCatalog)

const canonicalUrl = computed(() => {
  const base = 'https://kosarev.space'
  const path = localePath('/')
  return path === '/' ? base : `${base}${path}`
})
const language = computed(() => locale.value === 'en' ? 'en' : 'ru')
const ogImage = computed(() => `https://kosarev.space/og/${language.value}/home.png`)

useSeoMeta({
  title: () => t('seo.title'),
  description: () => t('seo.description'),
  ogTitle: () => t('seo.title'),
  ogDescription: () => t('seo.description'),
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogImage,
  ogImageAlt: () => t('seo.title'),
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogSiteName: () => t('hero.name'),
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
})

useHead(() => {
  let projectList = '{}'
  try {
    projectList = JSON.stringify(portfolioItemList(language.value, t)).replace(/</g, '\\u003c')
  } catch (error) {
    console.error('portfolio json-ld failed', error)
  }
  return {
    link: [
      { rel: 'canonical', href: canonicalUrl.value },
      ...writingFeedLinks,
    ],
    htmlAttrs: {
      lang: locale.value,
    },
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          'name': t('hero.name'),
          'url': 'https://kosarev.space',
          'jobTitle': 'AI Product Engineer / Fullstack Engineer',
          'knowsAbout': ['Vue.js', 'Nuxt', 'TypeScript', 'PostgreSQL', 'Node.js', 'AI agents', 'Model Context Protocol', 'LLM integration', 'n8n', 'OpenRouter', 'Codex', 'Cursor cloud agents', 'Dokploy'],
          'sameAs': [
            'https://github.com/hmbanan666',
            'https://t.me/hmbanan666',
          ],
        }),
      },
      {
        type: 'application/ld+json',
        key: 'portfolio-projects',
        innerHTML: projectList,
      },
    ],
  }
})
</script>
