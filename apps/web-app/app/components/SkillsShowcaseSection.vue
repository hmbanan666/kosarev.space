<template>
  <section
    id="skills"
    class="site-section case-catalog"
    aria-labelledby="case-catalog-title"
  >
    <div class="site-wrap">
      <div class="section-intro">
        <h1 id="case-catalog-title">
          {{ t('cases.title') }}
        </h1>
        <p>{{ t('cases.description') }}</p>
      </div>
      <form
        class="case-filters"
        :action="localePath('/cases')"
        method="get"
        @submit.prevent="applyFilters"
      >
        <label class="case-search">
          {{ t('site.search') }}
          <input
            v-model="form.q"
            name="q"
            type="search"
            maxlength="100"
            :placeholder="t('site.searchPlaceholder')"
          >
        </label>
        <details class="case-refine" :open="Boolean(filters.focus || filters.tech)">
          <summary>{{ t('site.refineCases') }}</summary>
          <div class="case-refine-fields">
            <SiteCaseSelect
              id="case-area"
              v-model="form.focus"
              name="focus"
              :label="t('site.area')"
              :items="areaItems"
            />
            <SiteCaseSelect
              id="case-technology"
              v-model="form.tech"
              name="tech"
              :label="t('site.technology')"
              :items="technologyItems"
            />
          </div>
        </details>
        <button class="site-button" type="submit">
          {{ t('site.apply') }}
        </button>
      </form>
      <div v-if="!error && status !== 'pending' && matchingCases.length" class="case-result-meta">
        <p role="status" aria-live="polite">
          {{ showMore ? t('site.featuredCount', { shown: visibleCases.length, total: matchingCases.length }) : t('site.workCount', { count: matchingCases.length }) }}
        </p>
        <NuxtLink
          v-if="hasFilters"
          :to="localePath('/cases')"
          class="site-text-link"
        >
          {{ t('site.reset') }}
        </NuxtLink>
      </div>
      <div
        v-if="error"
        class="case-empty"
        role="alert"
      >
        <p>{{ t('site.loadError') }}</p>
        <button
          class="site-button site-button-secondary"
          type="button"
          @click="refresh()"
        >
          {{ t('site.retry') }}
        </button>
      </div>
      <p v-else-if="status === 'pending'" role="status">
        {{ t('site.loading') }}
      </p>
      <div
        v-else-if="visibleCases.length"
        class="case-results"
        :aria-label="t('site.results')"
      >
        <SkillCaseCard
          v-for="item in visibleCases"
          :key="item.key"
          :skill-case="item"
        />
      </div>
      <div v-else class="case-empty">
        <p role="status">
          {{ hasFilters ? t('cases.noResults') : t('cases.empty') }}
        </p>
        <NuxtLink
          v-if="hasFilters"
          :to="localePath('/cases')"
          class="site-text-link"
        >
          {{ t('site.reset') }}
        </NuxtLink>
        <NuxtLink
          v-else
          :to="localePath('/projects')"
          class="site-text-link"
        >
          {{ t('projects.title') }}
        </NuxtLink>
      </div>
      <NuxtLink
        v-if="showMore"
        :to="{ path: localePath('/cases'), query: { ...caseContextQuery(route.query), all: '1' } }"
        class="site-button site-button-secondary case-show-all"
      >
        {{ t('site.showAll', { count: matchingCases.length }) }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { caseAreas, caseContextQuery, filterCases, readCaseFilters, selectFeaturedCases } from '~/utils/case-finder'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const filters = computed(() => readCaseFilters(route.query))
const form = reactive({ ...filters.value })
watch(() => JSON.stringify(filters.value), () => Object.assign(form, filters.value))
const { data, error, status, refresh } = await useFetch('/api/cases', { query: { locale } })
const allTags = computed(() => [...new Set((data.value ?? []).flatMap((item) => item.tags))].sort())
const areaItems = computed(() => [
  { label: t('site.allWork'), value: '' },
  ...caseAreas.map((area) => ({ label: t(`site.layers.${area}.title`), value: area })),
])
const technologyItems = computed(() => [
  { label: t('site.allTechnologies'), value: '' },
  ...[...new Set([...(form.tech ? [form.tech] : []), ...allTags.value])].map((tag) => ({ label: tag, value: tag })),
])
const matchingCases = computed(() => filterCases(data.value ?? [], filters.value))
const hasFilters = computed(() => Boolean(filters.value.q || filters.value.tech || filters.value.focus))
const visibleCases = computed(() => hasFilters.value || filters.value.all ? matchingCases.value : selectFeaturedCases(matchingCases.value))
const showMore = computed(() => visibleCases.value.length < matchingCases.value.length)
function applyFilters() {
  navigateTo({ path: localePath('/cases'), query: caseContextQuery({ ...form, all: '1' }) })
}
</script>

<style scoped>
.case-filters { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 1rem; align-items: end; padding: 1rem; background: var(--ui-bg-elevated); border: 1px solid var(--ui-border); border-radius: .75rem; }
.case-search { display: grid; gap: .5rem; font-size: .8rem; font-weight: 550; min-width: 0; }
.case-search input { height: 3rem; width: 100%; min-width: 0; padding: .7rem .875rem; background: var(--ui-bg); color: var(--ui-text); border: 1px solid var(--ui-border-accented); border-radius: .375rem; font-size: .875rem; font-weight: 400; }
.case-search input:hover { border-color: var(--ui-text-muted); }
.case-search input:focus-visible { outline-offset: -2px; border-color: transparent; }
.case-result-meta { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-block: 1.5rem 1rem; color: var(--ui-text-muted); font-size: .8rem; }
.case-results { display: grid; grid-template-columns: 1fr 1fr; column-gap: 3rem; }
.case-empty { padding-block: 2rem; display: grid; justify-items: start; gap: 1rem; }
.case-show-all { margin-top: 2rem; }
.case-filters .case-search { grid-column: 1 / -1; }
.case-refine { grid-column: 1; align-self: center; }
.case-refine[open] { grid-column: 1 / -1; }
.case-filters > button { grid-column: 2; }
.case-refine summary { width: fit-content; padding-block: .5rem; font-size: .875rem; color: var(--ui-primary); cursor: pointer; }
.case-refine-fields { display: grid; gap: 1rem; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: .5rem; }
@media (min-width: 651px) {
  .case-filters:not(:has(details[open])) { grid-template-columns: minmax(0, 1fr) auto auto; }
  .case-filters:not(:has(details[open])) > * { grid-column: auto; }
  .case-refine:not([open]) { align-self: end; min-height: 3rem; align-content: center; }
}
@media (max-width: 650px) {
  .case-filters { gap: .5rem .75rem; }
  .case-refine-fields { grid-template-columns: 1fr; }
  .case-results { grid-template-columns: 1fr; }
}
</style>
