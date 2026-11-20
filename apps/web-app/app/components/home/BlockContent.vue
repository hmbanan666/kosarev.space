<template>
  <template v-if="id === 'hero'">
    <p class="canvas-eyebrow">
      {{ t('hero.badge') }}
    </p>
    <div class="canvas-intro">
      <img
        src="/photo.jpg"
        :alt="t('hero.name')"
        width="112"
        height="132"
        fetchpriority="high"
      >
      <div>
        <h1>{{ t('hero.name') }}</h1>
      </div>
    </div>
    <p class="canvas-role">
      {{ t('cv.subtitle') }}
    </p>
    <p class="canvas-description">
      {{ t('hero.description') }}
    </p>
    <p class="canvas-footnote canvas-current-work">
      {{ currentWork }}
    </p>
    <p class="canvas-footnote">
      {{ t('cv.location') }} · {{ t('cv.since') }}
    </p>
    <div class="canvas-links">
      <NuxtLink class="site-button" :to="localePath('/cv')">
        {{ t('site.viewCv') }}
      </NuxtLink>
      <NuxtLink class="site-text-link" :to="localePath('/cases')">
        {{ t('site.exploreWork') }}<SiteLinkIcon />
      </NuxtLink>
    </div>
  </template>
  <template v-else-if="product">
    <p class="canvas-eyebrow">
      {{ t(product.status, { year: product.closedYear ?? 0 }) }}
    </p>
    <h2>
      <NuxtLink v-if="product.page" :to="localePath(product.page)">
        {{ product.titleKey ? t(product.titleKey) : product.title }}
      </NuxtLink><a
        v-else
        :href="product.link"
        target="_blank"
        rel="noopener noreferrer"
      >{{ product.titleKey ? t(product.titleKey) : product.title }}</a>
    </h2>
    <p class="canvas-description">
      {{ t(product.pitch) }}
    </p>
    <template v-if="repo">
      <HomeActivityGraph :days="miniDays" mini />
      <p class="canvas-footnote">
        {{ lastCommit ? t('activity.lastCommit', { time: relativeTime(lastCommit.date) }) : t('activity.noActivity') }}
      </p>
    </template>
    <p v-else class="canvas-footnote">
      {{ t('activity.noRepo') }}
    </p>
    <NuxtLink
      v-if="product.page"
      class="canvas-source"
      :to="localePath(product.page)"
    >
      {{ t('activity.project') }}<SiteLinkIcon />
    </NuxtLink>
    <a
      v-else
      class="canvas-source"
      :href="product.link"
    >{{ t('activity.live') }}<SiteLinkIcon external /></a>
  </template>
  <template v-else-if="id === 'publication' && latest">
    <p class="canvas-eyebrow">
      {{ t(`writing.types.${latest.type}`) }} · {{ latest.publishedAt }}
    </p>
    <h2>
      <NuxtLink :to="localePath(`/writing/${latest.slug}`)">
        {{ latest.locales[language].title }}
      </NuxtLink>
    </h2>
    <p class="canvas-description">
      {{ latest.locales[language].description }}
    </p>
    <NuxtLink class="canvas-source" :to="localePath(`/writing/${latest.slug}`)">
      {{ t('writing.title') }}<SiteLinkIcon />
    </NuxtLink>
  </template>
  <template v-else-if="id === 'writing'">
    <p class="canvas-eyebrow">
      {{ t('canvas.reading') }}
    </p>
    <h2>
      <NuxtLink :to="localePath('/writing')">
        {{ t('writing.title') }}<SiteLinkIcon />
      </NuxtLink>
    </h2>
    <div v-if="latest" class="canvas-latest">
      <p class="canvas-footnote">
        {{ t(`writing.types.${latest.type}`) }} · {{ latest.publishedAt }}
      </p>
      <NuxtLink :to="localePath(`/writing/${latest.slug}`)">
        {{ latest.locales[language].title }}
      </NuxtLink>
    </div>
    <p v-else class="canvas-description">
      {{ t('writing.description') }}
    </p>
    <a class="canvas-source" :href="language === 'en' ? '/en/writing/feed.xml' : '/writing/feed.xml'">RSS<SiteLinkIcon /></a>
  </template>
  <template v-else-if="id === 'cv'">
    <p class="canvas-eyebrow">
      {{ t('site.experience') }}
    </p>
    <h2>
      <NuxtLink :to="localePath('/cv')">
        {{ t('nav.cv') }}<SiteLinkIcon />
      </NuxtLink>
    </h2>
    <a
      class="canvas-source"
      :href="language === 'en' ? '/cv-en.pdf' : '/cv.pdf'"
      download
    >{{ t('cv.downloadPdf') }}</a>
  </template>
  <template v-else-if="id === 'contacts'">
    <p class="canvas-eyebrow">
      <NuxtLink :to="localePath('/contact')">
        {{ t('hero.contact') }}<SiteLinkIcon />
      </NuxtLink>
    </p>
    <h2>{{ t('activity.contactTitle') }}</h2>
    <a class="canvas-source" href="mailto:nick@kosarev.space">{{ t('activity.email') }}<SiteLinkIcon external /></a>
  </template>
  <template v-else-if="id === 'live'">
    <h2>
      <NuxtLink :to="localePath('/cases/kosarev-live-cursors')">
        {{ t('activity.liveTitle') }}<SiteLinkIcon />
      </NuxtLink>
    </h2>
    <p class="board-summary">
      {{ t('activity.sharedBoard') }}
    </p>
    <p class="canvas-footnote">
      WebSocket · PostgreSQL
    </p>
  </template>
  <template v-else-if="id === 'contributions'">
    <p class="canvas-eyebrow">
      GitHub · {{ t(`activity.${activity.coverage}`) }}
    </p>
    <div class="activity-calendar-heading">
      <h2>{{ t('activity.contributions') }}</h2>
      <span v-if="activity.coverage === 'githubYear' && activity.calendarTotal !== undefined" class="activity-year-total">
        {{ t('activity.yearTotal', { count: activity.calendarTotal.toLocaleString(language) }) }}
      </span>
    </div>
    <template v-if="activity.calendar.length">
      <HomeActivityGraph :days="activity.calendar" />
      <div class="activity-calendar-footer">
        <p class="activity-calendar-stats">
          {{ t('activity.activeDays') }}: {{ contributionStats.activeDays.toLocaleString(locale) }}
        </p>
        <div
          class="activity-legend"
          role="img"
          :aria-label="t('activity.legend')"
        >
          <span>{{ t('activity.less') }}</span>
          <i
            v-for="level in 5"
            :key="level"
            :class="`activity-level-${level - 1}`"
            aria-hidden="true"
          />
          <span>{{ t('activity.more') }}</span>
        </div>
      </div>
    </template>
    <p v-else class="canvas-footnote">
      {{ t('activity.unavailable') }}
    </p>
  </template>
  <template v-else-if="id === 'feed'">
    <p class="canvas-eyebrow">
      {{ t('activity.title') }}
    </p>
    <h2>{{ t('activity.feed') }}</h2>
    <HomeActivityFeed :items="activity.items" :limit="3" />
  </template>
  <template v-else-if="id === 'skills'">
    <p class="canvas-eyebrow">
      {{ t('activity.languages') }}
    </p>
    <h2>{{ t('activity.skills') }}</h2>
    <div class="activity-languages">
      <span
        v-for="[name, bytes] in languages.slice(0, 4)"
        :key="name"
        :title="t('activity.bytes', { count: bytes.toLocaleString(language) })"
      >{{ name }} <small>{{ Math.round(bytes / languageTotal * 100) }}%</small></span>
    </div>
    <p class="canvas-footnote">
      {{ activityTechTags.join(' · ') }}
    </p>
  </template>
</template>

<script setup lang="ts">
import type { ActivitySnapshot } from '~~/shared/activity'
import type { PublicationSummary } from '~~/shared/publications'
import { calendarDays, projectScores } from '~~/shared/activity'
import { contributionSummary } from '~~/shared/contribution-calendar'
import { activityTechTags, canvasProducts } from '~/utils/activity-content'

const props = defineProps<{ id: string, latest?: PublicationSummary, activity: ActivitySnapshot }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const contributionStats = computed(() => contributionSummary(props.activity.calendar))
const language = computed(() => locale.value === 'en' ? 'en' : 'ru')
const product = computed(() => canvasProducts.find((product) => product.key === props.id))
const repo = computed(() => props.activity.repos.find((repo) => repo.project === props.id))
const items = computed(() => props.activity.items.filter((item) => item.repo === repo.value?.name))
const lastCommit = computed(() => items.value.find((item) => item.kind === 'commit'))
const relativeTime = useActivityTime()
const miniDays = computed(() => calendarDays(items.value, props.activity.fetchedAt ?? new Date(0).toISOString(), 30))
const languages = computed(() => {
  const totals: Record<string, number> = {}
  for (const repo of props.activity.repos) {
    for (const [name, bytes] of Object.entries(repo.languages)) {
      totals[name] = (totals[name] ?? 0) + bytes
    }
  }
  return Object.entries(totals).sort((a, b) => b[1] - a[1])
})
const languageTotal = computed(() => languages.value.reduce((sum, [, bytes]) => sum + bytes, 0))
const currentWork = computed(() => {
  const scores = projectScores(props.activity)
  const key = Object.keys(scores).sort((a, b) => scores[b]! - scores[a]! || a.localeCompare(b))[0]
  if (!key || !scores[key] || !props.activity.fetchedAt) {
    return t('activity.fallback')
  }
  const count = props.activity.items.filter((item) => item.kind === 'commit' && item.repo === props.activity.repos.find((repo) => repo.project === key)?.name && Date.parse(props.activity.fetchedAt!) - Date.parse(item.date) < 7 * 86400000).length
  return t('activity.now', { project: canvasProducts.find((product) => product.key === key)?.title, count })
})
</script>
