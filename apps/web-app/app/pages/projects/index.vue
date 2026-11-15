<template>
  <ProjectsSection />
</template>

<script setup lang="ts">
definePageMeta({ colorMode: 'dark' })
useIndexSeo('/projects', 'projects.title', 'projects.description')
const { t, locale } = useI18n()
useHead(() => ({
  script: [{
    type: 'application/ld+json',
    key: 'portfolio-projects',
    innerHTML: JSON.stringify(portfolioItemList(locale.value === 'en' ? 'en' : 'ru', t)).replace(/</g, '\\u003c'),
  }],
}))
</script>
