<template>
  <section class="site-wrap portfolio-hero" aria-labelledby="home-name">
    <div class="hero-copy">
      <div class="hero-identity">
        <img
          src="/photo.jpg"
          :alt="t('hero.name')"
          width="64"
          height="64"
          fetchpriority="high"
        >
        <p>{{ t('cv.location') }}<br>{{ t('cv.since') }}</p>
      </div>
      <h1 id="home-name">
        {{ t('hero.name') }}
      </h1>
      <p class="hero-role">
        {{ t('cv.subtitle') }}
      </p>
      <p class="hero-description">
        {{ t('hero.description') }}
      </p>
      <div class="hero-actions">
        <NuxtLink class="site-button" :to="localePath('/cv')">
          {{ t('site.viewCv') }}
        </NuxtLink>
        <NuxtLink class="site-button site-button-secondary" :to="`${localePath('/')}#skills`">
          {{ t('site.exploreWork') }}
        </NuxtLink>
      </div>
      <div class="hero-direct">
        <a href="mailto:nick@kosarev.space">nick@kosarev.space</a>
        <a :href="pdfPath" download>{{ t('cv.downloadPdf') }}</a>
      </div>
    </div>
    <SiteOwnershipMap />
  </section>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const pdfPath = computed(() => locale.value === 'en' ? '/cv-en.pdf' : '/cv.pdf')
</script>

<style scoped>
.portfolio-hero { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); align-items: center; gap: clamp(2rem,5vw,5rem); padding-block: 3.75rem 4rem; }
.portfolio-hero > * { min-width: 0; }
.hero-identity { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.hero-identity img { border-radius: .5rem; object-fit: cover; }
.hero-identity p { font-size: .8rem; line-height: 1.6; color: var(--ui-text-muted); }
.hero-copy h1 { font: 500 clamp(2.5rem,4.4vw,3.75rem)/1.1 var(--font-serif); letter-spacing: -.045em; max-width: 14ch; }
.hero-role { font-size: 1.1rem; font-weight: 550; margin-top: 1rem !important; }
.hero-description { font-size: 1.05rem; line-height: 1.75; max-width: 54ch; margin-top: 1rem !important; }
.hero-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.75rem; }
.hero-direct { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; font-size: .85rem; margin-top: 1rem; color: var(--ui-text-muted); }
.hero-direct a { text-decoration: underline; }
@media (max-width: 850px) {
  .portfolio-hero { grid-template-columns: minmax(0, 1fr); gap: 2rem; padding-block: 2.5rem 3rem; }
  .hero-description { max-width: 65ch; }
  .hero-copy h1 { max-width: none; }
}
</style>
