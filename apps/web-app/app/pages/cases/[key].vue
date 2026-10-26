<template>
  <div v-if="data" class="site-wrap case-page">
    <nav class="case-breadcrumb" :aria-label="t('site.caseNavigation')">
      <NuxtLink :to="backLink">
        <UIcon name="i-lucide-arrow-left" aria-hidden="true" />{{ hasContext ? t('site.backContext') : t('cases.backToAll') }}
      </NuxtLink>
      <a href="#contacts">{{ t('hero.contact') }}</a>
    </nav>
    <article>
      <header class="case-heading">
        <p
          v-if="closedYear"
          class="case-archive-note"
          data-project-archive
        >
          {{ t('cases.archiveNote', { year: closedYear }) }}
        </p>
        <h1>{{ data.title }}</h1>
        <p class="case-deck">
          {{ data.description }}
        </p>
        <div class="case-reading-nav">
          <nav :aria-label="t('site.caseNavigation')">
            <a href="#case-challenge">{{ t('cases.taskTitle') }}</a>
            <a href="#case-details" @click="revealTechnical">{{ t('site.detail') }}</a>
            <a href="#case-result">{{ t('cases.resultTitle') }}</a>
          </nav>
          <button
            type="button"
            :disabled="!mounted"
            class="site-text-link"
            @click="copyCase"
          >
            {{ t('site.shareCase') }}
          </button>
        </div>
        <p
          class="case-copy-feedback"
          role="status"
          aria-live="polite"
        >
          {{ copyFeedback ? t(`site.${copyFeedback}`) : '' }}
        </p>
      </header>
      <div class="case-reading-layout">
        <aside class="case-context">
          <h2>{{ t('site.techDetails') }}</h2>
          <p>{{ data.tags.join(', ') }}</p>
          <a href="#contacts" class="site-text-link">{{ t('cases.ctaText') }}</a>
        </aside>
        <div class="case-body">
          <img
            v-if="data.image"
            :src="data.image"
            :alt="data.title"
            class="case-image"
            width="960"
            height="540"
          >
          <section id="case-challenge" class="case-content-section">
            <h2>{{ t('cases.taskTitle') }}</h2>
            <p v-html="renderText(data.task)" />
          </section>
          <details
            id="case-details"
            ref="technicalDetails"
            class="case-solution"
          >
            <summary>{{ t('site.detail') }}</summary>
            <section class="case-content-section">
              <h2>{{ t('cases.solutionTitle') }}</h2>
              <p v-html="renderText(data.solution)" />
            </section>
          </details>
          <section id="case-result" class="case-content-section">
            <h2>{{ t('cases.resultTitle') }}</h2>
            <p v-html="renderText(data.result)" />
          </section>
          <div v-if="data.stats" class="case-reactions">
            <button
              v-for="(count, emoji) in visibleReactions"
              :key="emoji"
              type="button"
              :aria-label="`${t('site.reaction')}: ${emoji}, ${count}`"
              :aria-pressed="userReaction === String(emoji)"
              @click="setReaction(String(emoji))"
            >
              <span aria-hidden="true">{{ emoji }}</span> {{ count }}
            </button>
            <UPopover v-model:open="pickerOpen">
              <button
                class="site-icon-button"
                type="button"
                :aria-label="t('site.addReaction')"
              >
                <UIcon name="i-lucide-plus" aria-hidden="true" />
              </button>
              <template #content>
                <div class="case-emoji-picker">
                  <button
                    v-for="emoji in CASE_ALLOWED_EMOJIS"
                    :key="emoji"
                    type="button"
                    :aria-label="`${t('site.reaction')}: ${emoji}`"
                    @click="setReaction(emoji)"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </template>
            </UPopover>
            <span class="case-views"><UIcon name="i-lucide-eye" aria-hidden="true" />{{ t('site.views', { count: data.stats.views }) }}</span>
          </div>
        </div>
      </div>
    </article>
    <section
      v-if="data.related.length"
      class="case-related"
      aria-labelledby="case-related-title"
    >
      <div class="section-intro">
        <h2 id="case-related-title">
          {{ t('cases.relatedTitle') }}
        </h2><NuxtLink :to="backLink" class="site-text-link">
          {{ t('cases.backToAll') }}
        </NuxtLink>
      </div>
      <div>
        <SkillCaseCard
          v-for="related in data.related"
          :key="related.key"
          :skill-case="related"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { CASE_ALLOWED_EMOJIS } from '@kosarev/database/constants'
import { caseContextQuery } from '~/utils/case-finder'

const { t, locale } = useI18n()
const route = useRoute()
const mounted = useMounted()
const localePath = useLocalePath()
const closedYear = computed(() => closedProjectYearForCase(String(route.params.key)))
const contextQuery = computed(() => caseContextQuery(route.query))
const hasContext = computed(() => Object.keys(contextQuery.value).length > 0)
const backLink = computed(() => ({ path: localePath('/'), query: contextQuery.value, hash: '#skills' }))
const technicalDetails = useTemplateRef<HTMLDetailsElement>('technicalDetails')
function revealTechnical() {
  if (technicalDetails.value) {
    technicalDetails.value.open = true
  }
}
const copyFeedback = shallowRef<'linkCopied' | 'linkManual' | ''>('')
async function copyCase() {
  try {
    await navigator.clipboard.writeText(`${window.location.origin}${localePath(`/cases/${route.params.key}`)}`)
    copyFeedback.value = 'linkCopied'
  } catch {
    copyFeedback.value = 'linkManual'
  }
}
const pickerOpen = ref(false)
const userReaction = ref<string | null>(null)
const localReactions = ref<Record<string, number>>({})

const STORAGE_KEY = 'case-reactions'

function loadSavedReaction(caseKey: string) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return stored[caseKey] ?? null
  } catch {
    return null
  }
}

function saveReaction(caseKey: string, emoji: string | null) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    if (emoji) {
      stored[caseKey] = emoji
    } else {
      delete stored[caseKey]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {}
}

const visibleReactions = computed(() => {
  const base = data.value?.stats?.reactions ?? {}
  const merged: Record<string, number> = { ...base }
  for (const [emoji, count] of Object.entries(localReactions.value)) {
    merged[emoji] = (merged[emoji] ?? 0) + count
  }

  const sorted = Object.entries(merged)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)

  const top = sorted.slice(0, 3)
  const topEmojis = new Set(top.map(([e]) => e))

  if (userReaction.value && !topEmojis.has(userReaction.value) && merged[userReaction.value]) {
    top.push([userReaction.value, merged[userReaction.value]!])
  }

  return Object.fromEntries(top)
})

function setReaction(emoji: string) {
  const caseKey = String(route.params.key)
  const current = userReaction.value

  if (current === emoji) {
    userReaction.value = null
    localReactions.value[emoji] = (localReactions.value[emoji] ?? 0) - 1
    saveReaction(caseKey, null)
  } else {
    if (current) {
      localReactions.value[current] = (localReactions.value[current] ?? 0) - 1
    }
    userReaction.value = emoji
    localReactions.value[emoji] = (localReactions.value[emoji] ?? 0) + 1
    saveReaction(caseKey, emoji)
  }
  pickerOpen.value = false

  $fetch(`/api/cases/${caseKey}/react`, {
    method: 'POST',
    body: userReaction.value ? { emoji: userReaction.value } : {},
  }).catch(() => {})
}

const RE_AMP = /&/g
const RE_LT = /</g
const RE_GT = />/g
const RE_BOLD = /\*\*(.*?)\*\*/g

function renderText(text: string) {
  const escaped = text.replace(RE_AMP, '&amp;').replace(RE_LT, '&lt;').replace(RE_GT, '&gt;')
  return escaped
    .replace(RE_BOLD, '<strong class="text-highlighted font-medium">$1</strong>')
}

const { data } = await useFetch(`/api/cases/${route.params.key}`, {
  query: { locale },
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Case not found' })
}

onMounted(() => {
  $fetch(`/api/cases/${route.params.key}/view`, { method: 'POST' }).catch(() => {})

  userReaction.value = loadSavedReaction(String(route.params.key))
})

const canonicalUrl = computed(() => {
  const base = 'https://kosarev.space'
  const path = localePath(`/cases/${route.params.key}`)
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
})

const ogImage = computed(() => {
  return data.value?.image
    ? `https://kosarev.space${data.value.image}`
    : 'https://kosarev.space/og-image.png'
})

const caseDescription = computed(() => closedYear.value
  ? `${t('cases.archiveNote', { year: closedYear.value })} ${data.value?.description ?? ''}`
  : data.value?.description)

useSeoMeta({
  title: () => data.value?.title,
  description: caseDescription,
  ogTitle: () => data.value?.title,
  ogDescription: caseDescription,
  ogType: 'article',
  ogUrl: canonicalUrl,
  ogImage,
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
})

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': data.value?.title,
        'description': caseDescription.value,
        'image': ogImage.value,
        'author': {
          '@type': 'Person',
          'name': t('hero.name'),
          'url': 'https://kosarev.space',
        },
        'publisher': {
          '@type': 'Person',
          'name': t('hero.name'),
        },
        'keywords': data.value?.tags.join(', '),
      })),
    },
  ],
})
</script>

<style scoped>
.case-page { padding-block: 2rem 4rem; }
.case-breadcrumb { display: flex; justify-content: space-between; gap: 1rem; font-size: .85rem; margin-bottom: 2.5rem; }
.case-breadcrumb a { display: inline-flex; gap: .6rem; align-items: center; color: var(--ui-text-muted); }
.case-breadcrumb a:hover { text-decoration: underline; }
.case-heading { max-width: 63rem; }
.case-heading h1 { font: 500 clamp(2rem,4vw,3.5rem)/1.15 var(--font-serif); letter-spacing: -.035em; max-width: 26ch; }
.case-archive-note { font-size: .85rem; color: var(--ui-text-muted); border-left: 3px solid var(--ui-border-accented); padding-left: 1rem; margin-bottom: 1.5rem !important; max-width: 75ch; }
.case-deck { font-size: 1.1rem; max-width: 70ch; margin-top: 1.5rem !important; }
.case-reading-nav { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid var(--ui-border); font-size: .85rem; }
.case-reading-nav nav { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.case-reading-nav a { text-decoration: underline; }
.case-copy-feedback { min-height: 2.5rem; font-size: .8rem; color: var(--ui-text-muted); }
.case-reading-layout { display: grid; grid-template-columns: 13rem minmax(0,1fr); gap: 4rem; }
.case-context { align-self: start; position: sticky; top: 7rem; border-left: 1px solid var(--ui-border-accented); padding-left: 1.25rem; font-size: .85rem; }
.case-context h2 { font: 600 .85rem/1.4 var(--font-sans); }
.case-context p { color: var(--ui-text-muted); margin-block: .75rem 1.5rem !important; }
.case-body { max-width: 75ch; font-size: 1.05rem; line-height: 1.8; }
.case-image { max-width: 100%; height: auto; max-height: 32rem; object-fit: contain; margin-bottom: 2rem; border-radius: .4rem; }
.case-content-section { scroll-margin-top: 6rem; margin-bottom: 2.5rem; }
.case-content-section h2 { font: 550 1.5rem/1.35 var(--font-sans); margin-bottom: .75rem; }
.case-solution { margin-bottom: 2.5rem; padding-block: 1.25rem; border-block: 1px solid var(--ui-border); scroll-margin-top: 6rem; }
.case-solution summary { font-size: 1rem; font-weight: 550; min-height: 2.75rem; }
.case-solution .case-content-section { margin-top: 1.5rem; margin-bottom: .5rem; }
.case-related { margin-top: 4rem; }
.case-related > div:last-child { display: grid; grid-template-columns: 1fr 1fr; gap: 0 3rem; }
.case-reactions { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; border-top: 1px solid var(--ui-border); padding-top: 1.5rem; font-size: .85rem; }
.case-reactions > button { padding: .4rem .7rem; min-height: 2.75rem; border: 1px solid var(--ui-border); border-radius: .35rem; }
.case-reactions > button[aria-pressed=true] { border-color: var(--ui-primary); }
.case-views { display: flex; align-items: center; gap: .4rem; margin-left: auto; color: var(--ui-text-muted); font-size: .8rem; }
.case-emoji-picker { display: grid; grid-template-columns: repeat(5,1fr); gap: .25rem; padding: .75rem; }
.case-emoji-picker button { width: 2.75rem; height: 2.75rem; font-size: 1.4rem; }
@media (max-width: 850px) { .case-reading-layout { grid-template-columns: 1fr; gap: 2rem; } .case-context { position: static; } }
@media (max-width: 600px) { .case-related > div:last-child { grid-template-columns: 1fr; } .case-reading-nav nav { gap: 1rem; } }
</style>
