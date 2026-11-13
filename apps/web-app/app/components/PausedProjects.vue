<template>
  <section class="paused-products" aria-labelledby="paused-products-title">
    <div class="section-intro">
      <h3 id="paused-products-title">
        {{ t('projects.pausedTitle') }}
      </h3>
      <p>{{ t('projects.pausedIntro') }}</p>
    </div>
    <article
      v-for="project in pausedProjects"
      :id="`project-${project.key}`"
      :key="project.key"
      :data-paused-product="project.key"
      class="paused-product"
    >
      <div class="paused-mark" aria-hidden="true">
        {{ project.title }}
      </div>
      <div>
        <h4>{{ project.title }}</h4>
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
          <NuxtLink :to="localePath(project.page)">
            {{ t('projects.pageLink') }}<UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
          </NuxtLink>
          <a
            :href="project.source"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('site.source') }}<UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
          </a>
        </div>
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
.paused-product { display: grid; grid-template-columns: 11rem minmax(0, 1fr); gap: 1.5rem; align-items: start; }
.paused-mark { display: flex; align-items: center; justify-content: center; min-height: 8rem; padding: 1rem; background: #242019; border: 1px solid #51432C; border-radius: .5rem; font: 500 1.4rem/1.2 var(--font-serif); text-align: center; }
.paused-product h4 { margin: 0; font: 600 1.3rem/1.4 var(--font-sans); }
.paused-status, .paused-kind { margin-top: .35rem !important; }
.paused-status { font-size: .8rem; color: var(--ui-text-muted); }
.paused-kind { color: var(--ui-primary); font-size: .85rem; }
.paused-product p { max-width: 65ch; }
.paused-work { color: var(--ui-text-muted); font-size: .9rem; }
.paused-links { display: flex; flex-wrap: wrap; gap: .75rem 1.25rem; margin-top: 1.25rem; font-size: .85rem; }
.paused-links a { display: inline-flex; align-items: center; gap: .4rem; color: var(--ui-primary); text-decoration: underline; }
@media (max-width: 700px) {
  .paused-product { grid-template-columns: 1fr; }
}
</style>
