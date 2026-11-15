<template>
  <HomeCanvas />
</template>

<script setup lang="ts">
definePageMeta({ key: 'portfolio', colorMode: 'dark', canvasPresence: true })

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
function redirectLegacyAnchor() {
  const hash = window.location.hash
  const path = hash === '#skills'
    ? '/cases'
    : hash === '#projects' || hash.startsWith('#project-')
      ? '/projects'
      : hash === '#experience'
        ? '/cv'
        : hash === '#contacts' ? '/contact' : undefined
  if (path) {
    void navigateTo({ path: localePath(path), query: route.query, hash: hash.startsWith('#project-') || hash === '#experience' ? hash : '' }, { replace: true })
  } else if (!hash && ['q', 'focus', 'tech', 'all'].some((key) => route.query[key])) {
    void navigateTo({ path: localePath('/cases'), query: route.query }, { replace: true })
  }
}
onMounted(redirectLegacyAnchor)
watch(() => route.fullPath, () => nextTick(redirectLegacyAnchor))
useEventListener('hashchange', redirectLegacyAnchor)

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
        key: 'website',
        innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', 'name': t('hero.name'), 'url': 'https://kosarev.space', 'inLanguage': ['ru', 'en'] }),
      },
    ],
  }
})
</script>
