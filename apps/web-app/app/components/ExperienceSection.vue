<template>
  <section
    id="experience"
    class="recent-work"
    aria-labelledby="recent-work-title"
  >
    <div class="site-wrap recent-layout">
      <div>
        <h2 id="recent-work-title">
          {{ t('experience.title') }}
        </h2>
        <p class="recent-dates">
          <time :datetime="expi.period.start">{{ expi.startLabel }}</time> - <time :datetime="expi.period.end">{{ expi.endLabel }}</time>
        </p>
        <p class="recent-company">
          {{ expi.company }}
        </p>
        <p class="recent-role">
          {{ expi.role }}
        </p>
        <NuxtLink :to="`${localePath('/cv')}#cv-experience`" class="site-text-link">
          {{ t('site.fullExperience') }}
        </NuxtLink>
      </div>
      <div class="recent-evidence">
        <p class="recent-summary">
          {{ expi.summary }}
        </p>
        <ul>
          <li>{{ expi.highlights[1] }}</li>
          <li>{{ expi.highlights[4] }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { entries } = useCv()
const expi = computed(() => entries.value[0]!)
</script>

<style scoped>
.recent-work { padding-block: 2.75rem; background: var(--ui-bg-elevated); border-block: 1px solid var(--ui-border); scroll-margin-top: 5rem; }
.recent-layout { display: grid; grid-template-columns: 1fr 1.6fr; gap: 3.5rem; }
.recent-dates { color: var(--ui-text-muted); font-size: .8rem; margin-top: 1.25rem !important; }
.recent-company { font-weight: 650; margin-top: .3rem !important; }
.recent-role { font-size: .85rem; margin-block: .3rem 1rem !important; max-width: 35ch; }
.recent-summary { font-weight: 550; max-width: 65ch; }
.recent-evidence ul { padding-left: 1.2rem; list-style: disc; margin-top: .75rem; font-size: .9rem; }
.recent-evidence li { padding-left: .3rem; max-width: 72ch; }
.recent-evidence li + li { margin-top: .65rem; }
@media (max-width: 850px) { .recent-layout { grid-template-columns: 1fr; gap: 1.5rem; } }
</style>
