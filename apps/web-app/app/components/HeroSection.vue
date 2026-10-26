<template>
  <section class="site-wrap portfolio-hero" aria-labelledby="home-name">
    <div class="hero-copy">
      <p class="hero-location">
        <span>{{ t('cv.location') }}</span>
        <span>{{ t('cv.since') }}</span>
      </p>
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
    <div class="hero-portrait">
      <img
        src="/photo.jpg"
        :alt="t('hero.name')"
        width="360"
        height="400"
        fetchpriority="high"
      >
    </div>
  </section>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const pdfPath = computed(() => locale.value === 'en' ? '/cv-en.pdf' : '/cv.pdf')
</script>

<style scoped>
.portfolio-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(15rem, 22rem); align-items: center; gap: clamp(3rem,7vw,7rem); padding-block: 4.5rem 5rem; }
.portfolio-hero > * { min-width: 0; }
.hero-location { font-size: .8rem; color: var(--ui-text-muted); margin-bottom: 1.5rem !important; }
.hero-location { display: flex; flex-wrap: wrap; gap: .3rem 1.5rem; }
.hero-copy h1 { font: 500 clamp(2.75rem,4.6vw,4rem)/1.13 var(--font-serif); letter-spacing: -.045em; max-width: 15ch; }
.hero-role { font-size: clamp(1.05rem,1.7vw,1.25rem); font-weight: 550; margin-top: 1rem !important; }
.hero-description { color: var(--ui-text-toned); font-size: 1.025rem; line-height: 1.8; max-width: 55ch; margin-top: 1.25rem !important; }
.hero-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 2rem; }
.hero-direct { display: flex; flex-wrap: wrap; gap: .65rem 1.5rem; font-size: .85rem; margin-top: 1.25rem; color: var(--ui-text-muted); }
.hero-direct a { text-decoration: underline; }
.hero-direct a:hover { color: var(--ui-primary); }
.hero-portrait { justify-self: end; width: 100%; max-width: 22rem; }
.hero-portrait img { display: block; width: 100%; height: auto; aspect-ratio: 9/10; object-fit: cover; border-radius: .75rem; }
@media (max-width: 1000px) {
  .portfolio-hero { grid-template-columns: minmax(0,1fr) 15rem; gap: 2.5rem; padding-block: 3.5rem; }
}
@media (max-width: 650px) {
  .portfolio-hero { grid-template-columns: minmax(0,1fr) 5rem; align-items: start; gap: 1rem; padding-block: 2.5rem 3rem; }
  .hero-copy { grid-column: 1/-1; grid-row: 1; }
  .hero-location { min-height: 5rem; max-width: calc(100% - 6rem); display: flex; flex-direction: column; justify-content: center; margin-bottom: 1.25rem !important; }
  .hero-location { align-items: start; gap: .2rem; }
  .hero-portrait { grid-column: 2; grid-row: 1; width: 5rem; }
  .hero-portrait img { aspect-ratio: 1; border-radius: .5rem; }
  .hero-copy h1 { max-width: none; font-size: clamp(2.2rem,8vw,3rem); }
  .hero-description { font-size: .95rem; }
}
</style>
