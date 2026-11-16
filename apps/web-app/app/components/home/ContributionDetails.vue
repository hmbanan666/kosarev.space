<template>
  <p>{{ t('activity.contributionExplanation') }}</p>
  <nav class="activity-panel-links" :aria-label="t('site.navigation')">
    <a
      class="site-button"
      href="https://github.com/hmbanan666"
      target="_blank"
      rel="noopener noreferrer"
    >{{ t('activity.githubProfile') }}<SiteLinkIcon external /></a>
  </nav>
  <template v-if="activity.calendar.length">
    <p class="canvas-footnote">
      {{ range }} · {{ t(`activity.${activity.coverage}`) }}
    </p>
    <dl class="contribution-stats">
      <div>
        <dt>{{ t('activity.total') }}</dt>
        <dd>{{ summary.total.toLocaleString(locale) }}</dd>
      </div>
      <div>
        <dt>{{ t('activity.activeDays') }}</dt>
        <dd>{{ summary.activeDays.toLocaleString(locale) }}</dd>
      </div>
      <div>
        <dt>{{ t('activity.longestStreak') }}</dt>
        <dd>{{ t('activity.dayCount', { count: summary.longestStreak }) }}</dd>
      </div>
      <div v-if="summary.busiestDay">
        <dt>{{ t('activity.busiestDay') }}</dt>
        <dd>{{ formatDate(summary.busiestDay.date) }}<small>{{ t('activity.contributionCount', { count: summary.busiestDay.count }) }}</small></dd>
      </div>
    </dl>
    <h3>{{ t('activity.byMonth') }}</h3>
    <ol class="contribution-months">
      <li v-for="month in summary.months" :key="month.month">
        <time :datetime="month.month">{{ formatMonth(month.month) }}</time>
        <span class="contribution-month-track" aria-hidden="true"><i :style="{ width: `${month.count / (summary.busiestMonth?.count || 1) * 100}%` }" /></span>
        <span>{{ month.count.toLocaleString(locale) }}</span>
      </li>
    </ol>
  </template>
  <p v-else class="canvas-footnote">
    {{ t('activity.unavailable') }}
  </p>
  <h3>{{ t('activity.recentPublic') }}</h3>
  <HomeActivityFeed :items="activity.items" :limit="3" />
  <p v-if="activity.coverage === 'rest90'" class="canvas-footnote">
    {{ t('activity.partial') }}
  </p>
  <p v-if="activity.fetchedAt" class="canvas-footnote">
    {{ t('activity.updated', { time: relativeTime(activity.fetchedAt) }) }}
  </p>
</template>

<script setup lang="ts">
import type { ActivitySnapshot } from '~~/shared/activity'
import { contributionSummary } from '~~/shared/contribution-calendar'

const props = defineProps<{ activity: ActivitySnapshot }>()
const { t, locale } = useI18n()
const relativeTime = useActivityTime()
const summary = computed(() => contributionSummary(props.activity.calendar))
function formatDate(date: string) {
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}
function formatMonth(month: string) {
  return new Intl.DateTimeFormat(locale.value, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`))
}
const range = computed(() => {
  const dates = props.activity.calendar.map((day) => day.date).sort()
  return dates.length ? `${formatDate(dates[0]!)} – ${formatDate(dates.at(-1)!)}` : ''
})
</script>
