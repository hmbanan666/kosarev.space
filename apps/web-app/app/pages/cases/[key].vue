<template>
  <UPage v-if="data">
    <UPageSection>
      <article class="mx-auto max-w-2xl">
        <div class="mb-8 motion-preset-slide-up">
          <NuxtLink :to="`${localePath('/')}#skills`" class="inline-flex items-center gap-1 text-sm text-muted hover:text-highlighted transition-colors mb-6">
            <UIcon name="i-lucide-arrow-left" class="size-4" />
            {{ t('cases.backToAll') }}
          </NuxtLink>

          <h1 class="text-3xl font-bold text-highlighted sm:text-4xl">
            {{ data.title }}
          </h1>

          <p class="mt-4 text-lg text-muted leading-relaxed">
            {{ data.description }}
          </p>

          <div class="mt-4 flex flex-wrap gap-1.5">
            <UBadge
              v-for="tag in data.tags"
              :key="tag"
              :label="tag"
              variant="subtle"
              size="sm"
            />
          </div>
        </div>

        <img
          v-if="data.image"
          :src="data.image"
          :alt="data.title"
          class="my-8 max-h-150 rounded-lg ring-1 ring-default/50 mx-auto"
        >

        <USeparator v-else class="my-8" />

        <div class="space-y-8 motion-preset-slide-up motion-delay-200">
          <section>
            <h2 class="inline-flex items-center gap-2 text-xl font-semibold text-highlighted mb-3">
              <UIcon name="i-lucide-target" class="size-5 text-primary" />
              {{ t('cases.taskTitle') }}
            </h2>
            <p class="text-muted leading-relaxed case-text" v-html="renderText(data.task)" />
          </section>

          <section>
            <h2 class="inline-flex items-center gap-2 text-xl font-semibold text-highlighted mb-3">
              <UIcon name="i-lucide-lightbulb" class="size-5 text-primary" />
              {{ t('cases.solutionTitle') }}
            </h2>
            <p class="text-muted leading-relaxed case-text" v-html="renderText(data.solution)" />
          </section>

          <section>
            <h2 class="inline-flex items-center gap-2 text-xl font-semibold text-highlighted mb-3">
              <UIcon name="i-lucide-trophy" class="size-5 text-primary" />
              {{ t('cases.resultTitle') }}
            </h2>
            <p class="text-muted leading-relaxed case-text" v-html="renderText(data.result)" />
          </section>
        </div>

        <div v-if="data.stats" class="my-8 flex flex-wrap items-center gap-2">
          <button
            v-for="(count, emoji) in visibleReactions"
            :key="emoji"
            class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-200"
            :class="userReaction === String(emoji)
              ? 'border-primary bg-primary/15 text-highlighted'
              : 'border-default/50 text-muted hover:border-primary/50 hover:text-highlighted'"
            @click="setReaction(String(emoji))"
          >
            <span class="text-base">{{ emoji }}</span>
            <span class="font-medium tabular-nums">{{ count }}</span>
          </button>
          <UPopover v-model:open="pickerOpen">
            <button class="inline-flex items-center justify-center size-9 rounded-full border border-default/50 text-muted hover:border-primary/50 hover:text-highlighted transition-all duration-200">
              <UIcon name="i-lucide-plus" class="size-4" />
            </button>
            <template #content>
              <div class="grid grid-cols-5 gap-1.5 p-2.5">
                <button
                  v-for="emoji in CASE_ALLOWED_EMOJIS"
                  :key="emoji"
                  class="flex items-center justify-center size-11 cursor-pointer rounded-lg text-2xl hover:bg-linear-to-br hover:from-primary/20 hover:to-primary/5 hover:scale-110 active:scale-95 transition-all duration-150"
                  @click="setReaction(emoji)"
                >
                  {{ emoji }}
                </button>
              </div>
            </template>
          </UPopover>
          <div class="ml-auto flex items-center gap-1.5 text-sm text-muted">
            <UIcon name="i-lucide-eye" class="size-4" />
            <span class="tabular-nums">{{ data.stats.views }}</span>
          </div>
        </div>

        <USeparator class="my-8" />

        <div v-if="data.related.length" class="motion-preset-slide-up motion-delay-300">
          <h2 class="text-xl font-semibold text-highlighted mb-4">
            {{ t('cases.relatedTitle') }}
          </h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <SkillCaseCard
              v-for="related in data.related"
              :key="related.key"
              :skill-case="related"
            />
          </div>
        </div>

        <div class="mt-12 flex flex-col items-center gap-3 text-center motion-preset-slide-up motion-delay-500">
          <p class="text-muted">
            {{ t('cases.ctaText') }}
          </p>
          <UButton
            :label="t('hero.contact')"
            icon="i-lucide-send"
            size="lg"
            @click="contactOpen = true"
          />
          <ContactModal v-model:open="contactOpen" />
        </div>
      </article>
    </UPageSection>
  </UPage>
</template>

<script setup lang="ts">
import { CASE_ALLOWED_EMOJIS } from '@kosarev/database/constants'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const contactOpen = ref(false)
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
const RE_SENTENCE = /\. /g

function renderText(text: string) {
  const escaped = text.replace(RE_AMP, '&amp;').replace(RE_LT, '&lt;').replace(RE_GT, '&gt;')
  return escaped
    .replace(RE_BOLD, '<strong class="text-highlighted font-medium">$1</strong>')
    .replace(RE_SENTENCE, '.\u00A0\u00A0')
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

useSeoMeta({
  title: () => data.value?.title,
  description: () => data.value?.description,
  ogTitle: () => data.value?.title,
  ogDescription: () => data.value?.description,
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
        'description': data.value?.description,
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
