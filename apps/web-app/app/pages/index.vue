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
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.title'),
  description: () => t('seo.description'),
  ogTitle: () => t('seo.title'),
  ogDescription: () => t('seo.description'),
  ogType: 'website',
  ogUrl: 'https://kosarev.space',
  ogImage: 'https://kosarev.space/og-image.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogSiteName: 'Nick Kosarev',
  twitterCard: 'summary_large_image',
  twitterImage: 'https://kosarev.space/og-image.png',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': 'Nick Kosarev',
        'url': 'https://kosarev.space',
        'jobTitle': 'Fullstack Developer',
        'knowsAbout': ['Vue.js', 'Nuxt', 'TypeScript', 'PostgreSQL', 'Node.js'],
        'sameAs': [
          'https://github.com/hmbanan666',
          'https://t.me/hmbanan666',
        ],
      }),
    },
  ],
})
</script>
