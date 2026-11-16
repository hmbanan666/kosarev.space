<template>
  <dialog
    id="activity-detail-panel"
    ref="dialog"
    class="activity-panel"
    aria-labelledby="activity-panel-title"
    @cancel.prevent="emit('close')"
    @click="outside"
  >
    <header class="activity-panel-heading">
      <div>
        <p class="canvas-eyebrow">
          {{ t('activity.open', { name: title }) }}
        </p><h2 id="activity-panel-title">
          {{ title }}
        </h2>
      </div>
      <button
        type="button"
        :aria-label="t('activity.close')"
        @click="emit('close')"
      >
        <UIcon name="i-lucide-x" />
      </button>
    </header>
    <template v-if="product">
      <p class="canvas-eyebrow">
        {{ t('activity.status') }}
      </p>
      <p>{{ id === 'space' ? t('activity.spacePitch') : t(`projects.${id}.${id === 'context' ? 'description' : 'kind'}`) }}</p>
      <template v-if="repo">
        <h3>{{ t('activity.days30') }}</h3>
        <HomeActivityGraph :days="miniDays" mini />
        <h3>{{ t('activity.commits') }}</h3>
        <HomeActivityFeed :items="items.filter(item => item.kind === 'commit').slice(0, 8)" />
        <h3>{{ t('activity.pulls') }}</h3>
        <HomeActivityFeed :items="items.filter(item => item.kind === 'pr').slice(0, 5)" />
        <h3>{{ t('activity.languages') }}</h3>
        <p class="activity-tags">
          <span v-for="[name, bytes] in Object.entries(repo.languages).sort((a, b) => b[1] - a[1])" :key="name">{{ name }} <small>{{ t('activity.bytes', { count: bytes.toLocaleString(locale) }) }}</small></span>
        </p>
      </template>
      <p v-else class="canvas-footnote">
        {{ t('activity.noRepo') }}
      </p>
      <template v-if="stack.length">
        <h3>{{ t('activity.stack') }}</h3>
        <p class="activity-tags">
          <span v-for="tag in stack" :key="tag">{{ tag }}</span>
        </p>
      </template>
      <nav class="activity-panel-links" :aria-label="t('site.navigation')">
        <NuxtLink v-if="product.page" :to="localePath(product.page)">
          {{ t('activity.project') }}<SiteLinkIcon />
        </NuxtLink>
        <a v-if="product.link" :href="product.link">{{ t('activity.live') }}<SiteLinkIcon external /></a>
        <a v-if="repo" :href="repo.url">{{ t('activity.source') }}<SiteLinkIcon external /></a>
      </nav>
    </template>
    <template v-else>
      <div class="activity-panel-content">
        <HomeBlockContent
          v-if="id"
          :id="id"
          :activity="activity"
          :latest="latest"
        />
      </div>
      <p v-if="id === 'live'">
        {{ t('site.presenceDescription') }}
      </p>
      <p v-if="id === 'cv' || id === 'hero'">
        {{ t('hero.description') }}
      </p>
      <nav
        v-if="id === 'contacts'"
        class="activity-panel-links"
        :aria-label="t('site.navigation')"
      >
        <a href="mailto:nick@kosarev.space">nick@kosarev.space</a><a href="https://t.me/hmbanan666">Telegram</a><a href="https://github.com/hmbanan666">GitHub</a>
      </nav>
    </template>
    <p v-if="product || ['hero', 'feed', 'skills', 'contributions'].includes(id ?? '')" class="canvas-footnote">
      {{ t('activity.partial') }} <template v-if="activity.fetchedAt">
        {{ t('activity.updated', { time: relativeTime(activity.fetchedAt) }) }}
      </template>
    </p>
  </dialog>
</template>

<script setup lang="ts">
import type { ActivitySnapshot } from '~~/shared/activity'
import type { PublicationSummary } from '~~/shared/publications'
import { calendarDays } from '~~/shared/activity'
import { canvasProducts } from '~/utils/activity-content'
import { projectSectionsFor } from '~/utils/project-sections'

const props = defineProps<{ id?: string, title: string, activity: ActivitySnapshot, latest?: PublicationSummary }>()
const emit = defineEmits<{ close: [] }>()
const { t, locale, te, tm, rt } = useI18n()
const localePath = useLocalePath()
const relativeTime = useActivityTime()
const dialog = useTemplateRef('dialog')
const product = computed(() => canvasProducts.find((product) => product.key === props.id))
const repo = computed(() => props.activity.repos.find((repo) => repo.project === props.id))
const stack = computed(() => props.id ? projectSectionsFor(props.id, { te, tm, resolve: (message) => rt(message as Parameters<typeof rt>[0]) })?.stack ?? [] : [])
const items = computed(() => props.activity.items.filter((item) => item.repo === repo.value?.name))
const miniDays = computed(() => calendarDays(items.value, props.activity.fetchedAt ?? new Date(0).toISOString(), 30))
function sync() {
  if (props.id && !dialog.value?.open) {
    dialog.value?.showModal()
  }
  if (!props.id && dialog.value?.open) {
    dialog.value.close()
  }
}
onMounted(sync)
watch(() => props.id, () => nextTick(sync))
function outside(event: MouseEvent) {
  if (!dialog.value || event.target !== dialog.value) {
    return
  }
  const rect = dialog.value.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
    emit('close')
  }
}
</script>
