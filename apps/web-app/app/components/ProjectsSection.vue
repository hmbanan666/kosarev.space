<template>
  <section
    id="projects"
    class="site-section project-section"
    aria-labelledby="project-section-title"
  >
    <div class="site-wrap">
      <div class="section-intro">
        <h2 id="project-section-title">
          {{ t('projects.title') }}
        </h2>
        <p>{{ t('projects.description') }}</p>
      </div>
      <ActiveProducts />
      <div class="section-intro archive-intro">
        <h3>{{ t('projects.archiveTitle') }}</h3>
        <p>{{ t('site.archiveIntro') }}</p>
      </div>
      <div class="project-list">
        <article
          v-for="project in orderedProjects"
          :id="`project-${project.key}`"
          :key="project.key"
          class="project-entry"
        >
          <div class="project-visual">
            <img
              :src="project.image"
              :alt="project.titleKey ? t(project.titleKey) : project.title"
              width="480"
              height="270"
              loading="lazy"
            >
          </div>
          <div class="project-copy">
            <h4 class="project-title">
              {{ project.titleKey ? t(project.titleKey) : project.title }}
            </h4>
            <p
              v-if="closedProjectYears[project.key]"
              :data-project-archive="project.key"
              class="project-status"
            >
              {{ t('projects.closed', { year: closedProjectYears[project.key] }) }}
            </p>
            <p class="project-description">
              {{ t(`projects.${project.key}.description`) }}
            </p>
            <div class="project-links">
              <NuxtLink :to="{ path: localePath('/'), query: { q: project.key }, hash: '#skills' }">
                {{ t('site.projectCases') }}
              </NuxtLink>
              <a
                v-if="project.link"
                :href="project.link"
                target="_blank"
                rel="noopener noreferrer"
              >{{ t('site.source') }}<UIcon name="i-lucide-arrow-up-right" aria-hidden="true" /></a>
              <WritingRelatedPublications kind="project" :work-key="project.key" />
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const orderedProjects = computed(() => [...projects].sort((a, b) => Number(b.key === 'nextorders') - Number(a.key === 'nextorders')))
</script>

<style scoped>
.project-section { border-top: 1px solid var(--ui-border); }
.archive-intro { margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid var(--ui-border); }
.project-title { margin: 0; font: 600 1.15rem/1.4 var(--font-sans); }
.project-list { display: grid; grid-template-columns: 1.1fr 1fr; gap: 0 3rem; }
.project-entry { scroll-margin-top: 6rem; display: grid; grid-template-columns: 7rem 1fr; gap: 1rem; padding-block: 1.25rem; border-bottom: 1px solid var(--ui-border); }
.project-visual { min-width: 0; }
.project-entry img { width: 100%; aspect-ratio: 16/10; object-fit: cover; object-position: top; border: 1px solid var(--ui-border); border-radius: .3rem; }
.project-entry:first-child { grid-row: span 3; display: block; padding: 0; border: none; background: var(--ui-bg-elevated); border-radius: .5rem; overflow: hidden; align-self: start; }
.project-entry:first-child .project-visual { padding: 1.5rem 1.5rem 0; overflow: hidden; background: #242019; border-bottom: 1px solid #51432C; }
.project-entry:first-child img { border: 1px solid #625641; border-radius: .5rem .5rem 0 0; aspect-ratio: 16/10; transform: rotate(-2deg) translateY(.5rem); transform-origin: bottom left; box-shadow: 0 14px 28px #0007; transition: transform 180ms ease; }
.project-entry:first-child:focus-within img, .project-entry:first-child:hover img { transform: rotate(0) translateY(.25rem); }
.project-entry:first-child .project-copy { padding: 1.75rem; }
.project-status { font-size: .75rem; color: var(--ui-text-muted); margin-top: .35rem !important; }
.project-description { font-size: .85rem; max-width: 65ch; margin-top: .5rem !important; }
.project-links { display: flex; flex-wrap: wrap; gap: .75rem 1rem; margin-top: 1rem; font-size: .8rem; }
.project-links a { display: inline-flex; align-items: center; gap: .4rem; text-decoration: underline; color: var(--ui-primary); }
@media (max-width: 850px) { .project-list { grid-template-columns: 1fr; gap: 1rem; } .project-entry:first-child { grid-row: auto; } }
@media (max-width: 370px) { .project-entry { grid-template-columns: 5rem 1fr; } }
</style>
