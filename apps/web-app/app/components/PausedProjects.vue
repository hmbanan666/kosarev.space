<template>
  <section class="paused-products" aria-labelledby="paused-products-title">
    <div class="section-intro">
      <h2 id="paused-products-title">
        {{ t('projects.pausedTitle') }}
      </h2>
      <p>{{ t('projects.pausedIntro') }}</p>
    </div>
    <article
      v-for="project in pausedProjects"
      :id="`project-${project.key}`"
      :key="project.key"
      :data-paused-product="project.key"
      class="paused-product"
    >
      <h3>
        <NuxtLink :to="localePath(project.page)">
          {{ project.title }}<SiteLinkIcon />
        </NuxtLink>
      </h3>
      <p class="paused-status">
        {{ t('projects.statusPaused') }}
      </p>
      <p class="paused-kind">
        {{ t(`projects.${project.key}.kind`) }}
      </p>
      <p>{{ t(`projects.${project.key}.description`) }}</p>
      <p class="paused-work">
        {{ t(`projects.${project.key}.work`) }}
      </p>
      <div class="paused-links">
        <a
          :href="project.source"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('site.source') }}<SiteLinkIcon external />
        </a>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
.paused-products { margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid var(--ui-border); }
.paused-product { scroll-margin-top: 6rem; }
.paused-product h3 { margin: 0; font: 500 1.65rem/1.25 var(--font-serif); }
.paused-product h3 a:hover, .paused-product h3 a:focus-visible { color: var(--ui-primary); text-decoration: underline; }
.paused-status, .paused-kind { margin-top: .35rem !important; }
.paused-status { font-size: .8rem; color: var(--ui-text-muted); }
.paused-kind { color: var(--ui-primary); font-size: .85rem; }
.paused-product p { max-width: 65ch; }
.paused-work { color: var(--ui-text-muted); font-size: .9rem; }
.paused-links { display: flex; flex-wrap: wrap; gap: .75rem 1.25rem; margin-top: 1.25rem; font-size: .85rem; }
.paused-links a { display: inline-flex; align-items: center; gap: .4rem; color: var(--ui-primary); text-decoration: underline; }
</style>
