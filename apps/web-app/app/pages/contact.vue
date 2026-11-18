<template>
  <section class="site-wrap site-section contact-page">
    <h1>{{ t('hero.contact') }}</h1>
    <div class="contact-layout">
      <SiteContactLinks />
      <p>{{ t('site.contactDescription') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ colorMode: 'dark', hideFooterContact: true })
const { t } = useI18n()
useIndexSeo('/contact', 'hero.contact', 'site.contactDescription')
</script>

<style scoped>
.contact-page h1 { margin-bottom: 1.5rem; font: 500 clamp(2rem, 4vw, 3.5rem)/1.2 var(--font-serif); }
.contact-layout { align-items: start; padding: 0; }
</style>
