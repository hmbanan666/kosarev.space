<template>
  <UPage>
    <HeroSection />
    <USeparator />
    <ProjectsSection />
    <USeparator />
    <SkillsSection />
    <USeparator />
    <ContactsSection />
  </UPage>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const canonicalUrl = computed(() => {
  const base = 'https://kosarev.space'
  const path = localePath('/')
  return path === '/' ? base : `${base}${path}`
})

useSeoMeta({
  title: () => t('seo.title'),
  description: () => t('seo.description'),
  ogTitle: () => t('seo.title'),
  ogDescription: () => t('seo.description'),
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogImage: 'https://kosarev.space/og-image.png',
  ogImageAlt: () => t('seo.title'),
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogSiteName: () => t('hero.name'),
  twitterCard: 'summary_large_image',
  twitterImage: 'https://kosarev.space/og-image.png',
})

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl },
  ],
  htmlAttrs: {
    lang: locale,
  },
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': t('hero.name'),
        'url': 'https://kosarev.space',
        'jobTitle': 'Fullstack Developer',
        'knowsAbout': ['Vue.js', 'Nuxt', 'TypeScript', 'PostgreSQL', 'Node.js'],
        'sameAs': [
          'https://github.com/hmbanan666',
          'https://t.me/hmbanan666',
        ],
      })),
    },
  ],
})
</script>
