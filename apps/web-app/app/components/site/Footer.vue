<template>
  <footer id="contacts" class="site-footer">
    <div class="site-wrap">
      <div class="contact-layout">
        <div>
          <h2>{{ t('site.contactTitle') }}</h2>
          <p>{{ t('site.contactDescription') }}</p>
          <p class="contact-prompt">
            {{ t('site.contactPrompt') }}
          </p>
        </div>
        <SiteContactLinks />
      </div>
      <div class="site-footer-bottom">
        <p>{{ t('footer.copyright', { year: new Date().getFullYear() }) }}</p>
        <div>
          <NuxtLink :to="localePath('/cv')">
            {{ t('nav.cv') }}
          </NuxtLink>
          <a :href="pdfPath" download>{{ t('cv.downloadPdf') }}</a>
          <a
            href="https://twitch.tv/hmbanan666"
            target="_blank"
            rel="noopener noreferrer"
          >{{ t('site.liveCodingArchive') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const pdfPath = computed(() => locale.value === 'en' ? '/cv-en.pdf' : '/cv.pdf')
</script>
