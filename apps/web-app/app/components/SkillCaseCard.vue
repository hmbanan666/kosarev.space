<template>
  <article class="case-preview">
    <p v-if="closedYear" class="case-preview-status">
      {{ t('projects.closed', { year: closedYear }) }}
    </p>
    <h3>
      <NuxtLink :to="caseLink">
        {{ skillCase.title }}
      </NuxtLink>
    </h3>
    <p class="case-preview-description">
      {{ skillCase.description }}
    </p>
    <details class="case-preview-details">
      <summary>{{ t('site.techDetails') }}</summary>
      <p>{{ skillCase.tags.join(', ') }}</p>
    </details>
    <NuxtLink
      :to="caseLink"
      class="site-text-link"
      :aria-label="`${t('site.readCase')}: ${skillCase.title}`"
    >
      {{ t('site.readCase') }}
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import type { CasePreview } from '~/utils/case-finder'
import { caseContextQuery } from '~/utils/case-finder'

const props = defineProps<{ skillCase: CasePreview }>()
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const closedYear = computed(() => closedProjectYearForCase(props.skillCase.key))
const caseLink = computed(() => ({ path: localePath(`/cases/${props.skillCase.key}`), query: caseContextQuery(route.query) }))
</script>

<style scoped>
.case-preview { padding-block: 1.75rem; border-top: 1px solid var(--ui-border); display: flex; flex-direction: column; align-items: start; }
.case-preview h3 { max-width: 42ch; font: 550 1.2rem/1.4 var(--font-sans); }
.case-preview h3 a:hover { text-decoration: underline; }
.case-preview-status { color: var(--ui-text-muted); font-size: .75rem; margin-bottom: .5rem !important; }
.case-preview-description { font-size: .9rem; max-width: 65ch; margin-top: .75rem !important; }
.case-preview-details { margin-block: 1rem; font-size: .8rem; color: var(--ui-text-muted); width: 100%; }
.case-preview-details summary { width: fit-content; padding-block: .25rem; min-height: 2rem; }
.case-preview-details p { padding-top: .5rem; max-width: 60ch; }
.case-preview > .site-text-link { margin-top: auto; }
</style>
