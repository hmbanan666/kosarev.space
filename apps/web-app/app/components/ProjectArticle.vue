<template>
  <div class="site-wrap project-page">
    <nav class="project-breadcrumb" :aria-label="t('site.caseNavigation')">
      <NuxtLink :to="`${localePath('/')}#projects`">
        <UIcon name="i-lucide-arrow-left" aria-hidden="true" />{{ t('writing.backToProducts') }}
      </NuxtLink>
    </nav>
    <article :data-project-page="pageKey">
      <p class="project-status" :data-project-status="status">
        {{ t(status === 'active' ? 'projects.statusActive' : 'projects.statusPaused') }}
      </p>
      <h1>{{ title }}</h1>
      <p class="project-kind">
        {{ kind }}
      </p>
      <p class="project-deck">
        {{ description }}
      </p>
      <p class="project-work">
        {{ work }}
      </p>
      <div v-if="link || source" class="project-links">
        <a
          v-if="link"
          :href="link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ linkLabel }}<UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
        </a>
        <a
          v-if="source"
          :href="source"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t('site.source') }}<UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
        </a>
      </div>
      <div
        v-if="sections"
        class="project-sections"
        data-project-sections
      >
        <section
          v-if="sections.problem"
          id="project-problem"
          class="project-section"
        >
          <h2>{{ t('projects.sections.problem') }}</h2>
          <p>{{ sections.problem }}</p>
        </section>
        <section
          v-if="sections.built"
          id="project-built"
          class="project-section"
        >
          <h2>{{ t('projects.sections.built') }}</h2>
          <p>{{ sections.built }}</p>
        </section>
        <section
          v-if="sections.decisions.length"
          id="project-decisions"
          class="project-section"
        >
          <h2>{{ t('projects.sections.decisions') }}</h2>
          <ul class="project-decisions">
            <li v-for="(decision, index) in sections.decisions" :key="`${index}-${decision.title}`">
              <h3>{{ decision.title }}</h3>
              <p>{{ decision.why }}</p>
            </li>
          </ul>
        </section>
        <section
          v-if="sections.stack.length"
          id="project-stack"
          class="project-section"
        >
          <h2>{{ t('projects.sections.stack') }}</h2>
          <ul class="project-stack">
            <li v-for="(item, index) in sections.stack" :key="`${index}-${item}`">
              {{ item }}
            </li>
          </ul>
        </section>
        <section
          v-if="sections.statusNext"
          id="project-status-next"
          class="project-section"
        >
          <h2>{{ t('projects.sections.statusNext') }}</h2>
          <p>{{ sections.statusNext }}</p>
        </section>
        <section
          v-if="sections.links.length"
          id="project-links"
          class="project-section"
        >
          <h2>{{ t('projects.sections.links') }}</h2>
          <ul class="project-section-links">
            <li v-for="item in sections.links" :key="item.href">
              <a
                v-if="isExternalHref(item.href)"
                :href="item.href"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ item.label }}<UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
              </a>
              <NuxtLink v-else :to="localePath(item.href)">
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </section>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { ProjectSections } from '~/utils/project-sections'

defineProps<{
  pageKey?: string
  title: string
  status: 'active' | 'paused'
  kind: string
  description: string
  work: string
  source?: string
  link?: string
  linkLabel?: string
  sections?: ProjectSections | null
}>()

const { t } = useI18n()
const localePath = useLocalePath()

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href) || href.startsWith('mailto:')
}
</script>

<style scoped>
.project-page { padding-block: 2rem 4rem; }
.project-breadcrumb { font-size: .85rem; margin-bottom: 2.5rem; }
.project-breadcrumb a { display: inline-flex; gap: .6rem; align-items: center; color: var(--ui-text-muted); }
.project-breadcrumb a:hover { text-decoration: underline; }
.project-status { font-size: .85rem; color: var(--ui-text-muted); border-left: 3px solid var(--ui-border-accented); padding-left: 1rem; margin-bottom: 1.5rem !important; }
.project-page h1 { max-width: 22ch; font: 500 clamp(2rem, 4vw, 3.5rem)/1.15 var(--font-serif); letter-spacing: -.035em; text-wrap: balance; }
.project-kind { margin-top: .75rem !important; color: var(--ui-primary); }
.project-deck, .project-work, .project-section { max-width: 68ch; }
.project-deck { font-size: 1.1rem; line-height: 1.7; margin-top: 1.5rem !important; }
.project-work { margin-top: 1rem !important; color: var(--ui-text-muted); line-height: 1.7; }
.project-links, .project-section-links { display: flex; flex-wrap: wrap; gap: .75rem 1.25rem; font-size: .9rem; }
.project-links { margin-top: 1.75rem; }
.project-links a, .project-section-links a { display: inline-flex; align-items: center; gap: .4rem; color: var(--ui-primary); text-decoration: underline; text-underline-offset: .2em; }
.project-sections { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--ui-border); }
.project-section { margin-top: 2.5rem; scroll-margin-top: 6rem; }
.project-section h2 { font: 500 clamp(1.4rem, 2.4vw, 1.75rem)/1.25 var(--font-serif); letter-spacing: -.02em; }
.project-section p { margin-top: .75rem !important; font-size: 1.05rem; line-height: 1.8; white-space: pre-line; overflow-wrap: anywhere; }
.project-decisions, .project-stack, .project-section-links { list-style: none; margin: .9rem 0 0; padding: 0; }
.project-decisions li + li { margin-top: 1.35rem; }
.project-decisions li { padding-left: 1rem; border-left: 1px solid var(--ui-border-accented); }
.project-decisions h3 { font: 600 1.15rem/1.35 var(--font-serif); letter-spacing: -.015em; }
.project-stack { display: flex; flex-direction: column; gap: .45rem; }
.project-stack li { position: relative; padding-left: 1rem; line-height: 1.6; overflow-wrap: anywhere; }
.project-stack li::before { content: ''; position: absolute; left: 0; top: .72em; width: .4rem; height: 1px; background: var(--ui-primary); }
.project-section-links { flex-direction: column; align-items: flex-start; gap: .7rem; }
@media (max-width: 700px) {
  .project-page { padding-block: 1.5rem 3rem; }
  .project-breadcrumb { margin-bottom: 1.75rem; }
  .project-sections { margin-top: 2.25rem; }
  .project-section { margin-top: 2rem; }
}
</style>
