<template>
  <SiteDrawer
    id="activity-detail-panel"
    class="activity-panel"
    :open="!!id"
    :title="contentTitle"
    title-id="activity-panel-title"
    :close-label="t('activity.close')"
    @close="emit('close')"
  >
    <HomeContributionDetails v-if="contentId === 'contributions'" :activity="activity" />
    <template v-else>
      <p v-if="contentId && contentId !== 'publication'">
        {{ t(`drawer.${contentId}`) }}
      </p>
      <template v-if="product">
        <template v-if="items.length">
          <h3>{{ t('activity.days30') }}</h3>
          <HomeActivityGraph :days="miniDays" mini />
        </template>
        <template v-if="commits.length">
          <h3>{{ t('activity.commits') }}</h3>
          <HomeActivityFeed :items="commits" :limit="3" />
        </template>
        <template v-if="pulls.length">
          <h3>{{ t('activity.pulls') }}</h3>
          <HomeActivityFeed :items="pulls" :limit="3" />
        </template>
        <p v-if="stack.length" class="drawer-stack">
          {{ t('drawer.builtWith', { stack: stack.join(', ') }) }}
        </p>
      </template>
      <template v-if="contentId === 'hero' || contentId === 'cv'">
        <p class="drawer-facts">
          {{ t('cv.subtitle') }}<br>{{ t('cv.location') }} · {{ t('cv.since') }}
        </p>
      </template>
      <template v-if="contentId === 'feed' && activity.items.length">
        <h3>{{ t('activity.days30') }}</h3>
        <HomeActivityGraph :days="feedDays" mini />
        <HomeActivityFeed :items="activity.items" :limit="12" />
      </template>
      <template v-if="languages.length">
        <h3>{{ t('activity.languages') }}</h3>
        <dl class="drawer-languages">
          <div v-for="[name, bytes] in languages" :key="name">
            <dt>{{ name }}</dt>
            <dd>{{ t('activity.bytes', { count: bytes.toLocaleString(locale) }) }}</dd>
          </div>
        </dl>
      </template>
      <p v-if="contentId === 'skills'" class="drawer-stack">
        {{ t('drawer.documentedTools', { stack: activityTechTags.join(', ') }) }}
      </p>
      <p v-if="contentId === 'live'" class="drawer-facts">
        {{ t('drawer.presence') }}
      </p>
      <template v-if="latest && ['publication', 'writing', 'hero'].includes(contentId ?? '')">
        <h3 v-if="contentId !== 'publication'">
          {{ t('drawer.latest') }}
        </h3>
        <p v-if="contentId !== 'publication'">
          <NuxtLink :to="localePath(`/writing/${latest.slug}`)">
            {{ latest.locales[language].title }}<SiteLinkIcon />
          </NuxtLink>
        </p>
        <p class="drawer-facts">
          {{ latest.locales[language].description }}
        </p>
        <p class="canvas-footnote">
          {{ t(`writing.types.${latest.type}`) }} · {{ latest.publishedAt }}
        </p>
      </template>
      <nav
        v-if="links.length"
        class="activity-panel-links"
        :aria-label="t('site.navigation')"
      >
        <NuxtLink
          v-for="link in links"
          :key="link.href"
          :to="link.href"
          :external="link.external"
        >
          {{ link.label }}<SiteLinkIcon :external="link.external" />
        </NuxtLink>
      </nav>
      <p v-if="hasPublicData" class="canvas-footnote">
        {{ t('activity.partial') }} <template v-if="activity.fetchedAt">
          {{ t('activity.updated', { time: relativeTime(activity.fetchedAt) }) }}
        </template>
      </p>
    </template>
  </SiteDrawer>
</template>

<script setup lang="ts">
import type { ActivitySnapshot } from '~~/shared/activity'
import type { PublicationSummary } from '~~/shared/publications'
import { calendarDays } from '~~/shared/activity'
import { activityTechTags, canvasProducts } from '~/utils/activity-content'
import { projects } from '~/utils/data'
import { projectSectionsFor } from '~/utils/project-sections'

const props = defineProps<{ id?: string, title: string, activity: ActivitySnapshot, latest?: PublicationSummary }>()
const emit = defineEmits<{ close: [] }>()
const { t, locale, te, tm, rt } = useI18n()
const localePath = useLocalePath()
const relativeTime = useActivityTime()
// Keep the last card's contents in place while its modal animates closed.
const contentId = ref(props.id)
const contentTitle = ref(props.title)
watch(() => [props.id, props.title] as const, ([id, title]) => {
  if (id) {
    contentId.value = id
    contentTitle.value = title
  }
})
const language = computed(() => locale.value === 'en' ? 'en' : 'ru')
const product = computed(() => canvasProducts.find((product) => product.key === contentId.value))
const repo = computed(() => props.activity.repos.find((repo) => repo.project === contentId.value))
const stack = computed(() => {
  if (!product.value) {
    return []
  }
  return projectSectionsFor(product.value.key, { te, tm, resolve: (message) => rt(message as Parameters<typeof rt>[0]) })?.stack.slice(0, 4)
    ?? projects.find((project) => project.key === product.value?.key)?.stack ?? []
})
const items = computed(() => props.activity.items.filter((item) => item.repo === repo.value?.name))
const commits = computed(() => items.value.filter((item) => item.kind === 'commit'))
const pulls = computed(() => items.value.filter((item) => item.kind === 'pr'))
const miniDays = computed(() => calendarDays(items.value, props.activity.fetchedAt ?? new Date(0).toISOString(), 30))
const feedDays = computed(() => calendarDays(props.activity.items, props.activity.fetchedAt ?? new Date(0).toISOString(), 30))
const languages = computed(() => {
  const totals: Record<string, number> = {}
  const repos = contentId.value === 'skills' ? props.activity.repos : repo.value ? [repo.value] : []
  for (const repo of repos) {
    for (const [name, bytes] of Object.entries(repo.languages)) {
      if (bytes > 0) {
        totals[name] = (totals[name] ?? 0) + bytes
      }
    }
  }
  return Object.entries(totals).sort((a, b) => b[1] - a[1])
})
const hasPublicData = computed(() => languages.value.length || items.value.length || (contentId.value === 'feed' && props.activity.items.length))
const links = computed(() => {
  const result: { href: string, label: string, external: boolean }[] = []
  function add(href: string | undefined, label: string, external = false) {
    if (href && !result.some((link) => link.href === href)) {
      result.push({ href, label, external })
    }
  }
  function local(path: string, key: string) {
    add(localePath(path), t(key))
  }
  if (product.value) {
    if (product.value.page) {
      local(product.value.page, contentId.value === 'space' ? 'drawer.cursorCase' : 'activity.project')
    }
    add(product.value.link, t('activity.live'), true)
    add(repo.value?.url, t('activity.source'), true)
  }
  switch (contentId.value) {
    case 'hero':
      local('/projects', 'hero.projects')
      local('/cv', 'site.viewCv')
      local('/contact', 'hero.contact')
      break
    case 'cv':
      local('/cv', 'site.viewCv')
      add(language.value === 'en' ? '/cv-en.pdf' : '/cv.pdf', t('cv.downloadPdf'), true)
      break
    case 'contacts':
      add('mailto:nick@kosarev.space', 'nick@kosarev.space', true)
      add('https://t.me/hmbanan666', 'Telegram', true)
      add('https://github.com/hmbanan666', 'GitHub', true)
      break
    case 'live':
      local('/cases/kosarev-live-cursors', 'drawer.cursorCase')
      break
    case 'skills':
      local('/cv', 'site.viewCv')
      local('/projects', 'hero.projects')
      break
    case 'feed':
      add('https://github.com/hmbanan666', t('activity.githubProfile'), true)
      break
    case 'publication':
      if (props.latest) {
        local(`/writing/${props.latest.slug}`, 'drawer.read')
      }
      break
    case 'writing':
      local('/writing', 'writing.title')
      add(language.value === 'en' ? '/en/writing/feed.xml' : '/writing/feed.xml', 'RSS', true)
      break
  }
  return result
})
</script>
