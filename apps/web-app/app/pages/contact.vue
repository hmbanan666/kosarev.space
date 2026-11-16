<template>
  <section class="site-wrap site-section contact-page">
    <div class="section-intro">
      <h1>{{ t('hero.contact') }}</h1>
      <div>
        <h2>{{ t('site.contactTitle') }}</h2>
        <p>{{ t('site.contactDescription') }}</p>
        <p class="contact-prompt">
          {{ t('site.contactPrompt') }}
        </p>
      </div>
    </div>
    <SiteContactLinks />
  </section>
</template>

<script setup lang="ts">
definePageMeta({ colorMode: 'dark' })
const { t } = useI18n()
useIndexSeo('/contact', 'hero.contact', 'site.contactDescription')
</script>
