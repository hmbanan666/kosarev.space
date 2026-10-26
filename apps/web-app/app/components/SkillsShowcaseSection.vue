<template>
  <section
    id="skills"
    class="site-section case-catalog"
    aria-labelledby="case-catalog-title"
  >
    <div class="site-wrap">
      <div class="section-intro">
        <h2 id="case-catalog-title">
          {{ t('cases.title') }}
        </h2>
        <p>{{ t('cases.description') }}</p>
      </div>
      <form
        class="case-filters"
        :action="`${localePath('/')}#skills`"
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
        <button class="site-button" type="submit">
          {{ t('site.apply') }}
        </button>
      </form>
      <div class="case-result-meta">
        <p role="status" aria-live="polite">
          {{ t('site.workCount', { count: matchingCases.length }) }}
        </p>
        <NuxtLink
          v-if="hasFilters"
          :to="`${localePath('/')}#skills`"
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
      <p v-else-if="status === 'pending'">
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
        <p>{{ t('cases.noResults') }}</p>
        <NuxtLink :to="`${localePath('/')}#skills`" class="site-text-link">
          {{ t('site.reset') }}
        </NuxtLink>
      </div>
      <NuxtLink
        v-if="showMore"
        :to="{ path: localePath('/'), query: { ...caseContextQuery(route.query), all: '1' }, hash: '#skills' }"
        class="site-button site-button-secondary case-show-all"
      >
        {{ t('site.showAll', { count: matchingCases.length }) }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { caseAreas, caseContextQuery, filterCases, readCaseFilters } from '~/utils/case-finder'

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
const visibleCases = computed(() => hasFilters.value || filters.value.all ? matchingCases.value : matchingCases.value.slice(0, 6))
const showMore = computed(() => visibleCases.value.length < matchingCases.value.length)
function applyFilters() {
  navigateTo({ path: localePath('/'), query: caseContextQuery({ ...form, all: '1' }), hash: '#skills' })
}
</script>

<style scoped>
.case-filters { display: grid; grid-template-columns: minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) auto; gap: 1rem; align-items: end; padding: 1.5rem; background: var(--ui-bg-elevated); border: 1px solid var(--ui-border); border-radius: .75rem; }
.case-search { display: grid; gap: .5rem; font-size: .8rem; font-weight: 550; min-width: 0; }
.case-search input { height: 3rem; width: 100%; min-width: 0; padding: .7rem .875rem; background: var(--ui-bg); color: var(--ui-text); border: 1px solid var(--ui-border-accented); border-radius: .375rem; font-size: .875rem; font-weight: 400; }
.case-search input:hover { border-color: var(--ui-text-muted); }
.case-search input:focus-visible { outline-offset: -2px; border-color: transparent; }
.case-result-meta { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-block: 1.5rem 1rem; color: var(--ui-text-muted); font-size: .8rem; }
.case-results { display: grid; grid-template-columns: 1fr 1fr; column-gap: 3rem; }
.case-empty { padding-block: 2rem; display: grid; justify-items: start; gap: 1rem; }
.case-show-all { margin-top: 2rem; }
@media (max-width: 1100px) {
  .case-filters { grid-template-columns: minmax(0,1fr) minmax(0,1fr); }
  .case-search, .case-filters > button { grid-column: 1/-1; }
}
@media (max-width: 650px) {
  .case-filters { grid-template-columns: minmax(0,1fr); padding: 1rem; }
  .case-results { grid-template-columns: 1fr; }
}
</style>
