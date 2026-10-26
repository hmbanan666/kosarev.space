<template>
  <header class="cv-header">
    <div class="cv-identity">
      <div>
        <p class="cv-eyebrow">
          {{ t('cv.eyebrow') }}
        </p>
        <h1 id="cv-name" data-cv-name>
          {{ t('hero.name') }}
        </h1>
        <p class="cv-headline">
          {{ t('cv.subtitle') }}
        </p>
      </div>
      <img
        src="/photo.jpg"
        :alt="t('hero.name')"
        class="cv-portrait"
        width="96"
        height="96"
      >
    </div>
    <p class="cv-location">
      {{ t('cv.location') }} · {{ t('cv.remote') }} · {{ t('cv.since') }}
    </p>
    <ul class="cv-contacts" :aria-label="t('cv.contactLinks')">
      <li v-for="contact in cvContactLinks" :key="contact.href">
        <a :href="contact.href">{{ contact.label }}</a>
      </li>
    </ul>
    <p class="cv-summary" data-cv-summary>
      {{ t('cv.summary') }}
    </p>
  </header>
</template>

<script setup lang="ts">
import { cvContactLinks } from '~/utils/cv'

const { t } = useI18n()
</script>
