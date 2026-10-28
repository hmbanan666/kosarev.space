<template>
  <div class="site-wrap writing-page">
    <nav class="writing-navigation" :aria-label="t('writing.navigation')">
      <NuxtLink :to="localePath('/writing')">
        <UIcon name="i-lucide-arrow-left" aria-hidden="true" />{{ t('writing.backToWriting') }}
      </NuxtLink>
      <a href="#contacts">{{ t('hero.contact') }}</a>
    </nav>
    <article>
      <header class="writing-heading">
        <p class="writing-label">
          {{ t(`writing.types.${publication.type}`) }} ·
          <time :datetime="publication.publishedAt">{{ formatPublicationDate(publication.publishedAt, language) }}</time>
        </p>
        <h1 class="writing-title">
          {{ text.title }}
        </h1>
        <p class="writing-deck">
          {{ text.description }}
        </p>
      </header>
      <div class="writing-body">
        <slot />
      </div>
    </article>
    <section
      v-if="publication.relatedWork.length"
      class="writing-related"
      aria-labelledby="related-work-title"
    >
      <h2 id="related-work-title">
        {{ t('writing.relatedWork') }}
      </h2>
      <ul>
        <li v-for="work in publication.relatedWork" :key="`${work.kind}:${work.key}`">
          <NuxtLink :to="localePath(relatedWorkPath(work))">
            {{ work.title[language] }}
          </NuxtLink>
          <span>{{ t(`writing.workTypes.${work.kind}`) }}</span>
        </li>
      </ul>
    </section>
    <nav class="writing-navigation writing-end" :aria-label="t('writing.navigation')">
      <NuxtLink :to="localePath('/writing')">
        {{ t('writing.backToWriting') }}
      </NuxtLink>
      <NuxtLink :to="`${localePath('/')}#projects`">
        {{ t('writing.backToProducts') }}
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { Publication } from '~~/shared/publications'
import { formatPublicationDate, relatedWorkPath } from '~~/shared/publications'

const props = defineProps<{ publication: Publication }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const language = computed(() => locale.value === 'en' ? 'en' : 'ru')
const text = computed(() => props.publication.locales[language.value])
</script>

<style scoped>
.writing-page { padding-block: 2rem 4rem; }
.writing-navigation { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: .85rem; }
.writing-navigation a { display: inline-flex; align-items: center; gap: .5rem; text-decoration: underline; }
.writing-heading { max-width: 63rem; margin-block: 3rem; }
.writing-label { color: var(--ui-primary); font-size: .85rem; margin-bottom: 1rem !important; }
.writing-title { font: 500 clamp(2rem,4vw,3.5rem)/1.15 var(--font-serif); letter-spacing: -.035em; max-width: 28ch; text-wrap: balance; }
.writing-deck { max-width: 68ch; font-size: 1.1rem; color: var(--ui-text-muted); margin-top: 1.5rem !important; }
.writing-body { max-width: 75ch; font-size: 1.05rem; line-height: 1.8; overflow-wrap: anywhere; }
.writing-body :deep(p) { margin-block: 0 1.25rem; }
.writing-body :deep(h2) { font: 550 1.5rem/1.35 var(--font-sans); margin-block: 2.5rem 1rem; scroll-margin-top: 6rem; }
.writing-body :deep(a) { color: var(--ui-primary); text-decoration: underline; text-underline-offset: .2em; }
.writing-body :deep(code) { font-size: .85em; background: var(--ui-bg-elevated); padding: .1em .3em; border-radius: .2rem; }
.writing-body :deep(pre) { padding: 1rem; margin-block: 1.5rem; border: 1px solid var(--ui-border); border-radius: .35rem; background: var(--ui-bg-elevated); white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.6; }
.writing-body :deep(pre code) { padding: 0; background: none; }
.writing-body :deep(ol) { list-style: decimal; padding-left: 1.5rem; margin-block: 1.25rem; }
.writing-body :deep(li) { padding-left: .25rem; margin-bottom: .6rem; }
.writing-end { max-width: 75ch; border-top: 1px solid var(--ui-border); margin-top: 3rem; padding-top: 1.5rem; }
.writing-related { margin-top: 3rem; max-width: 75ch; }
.writing-related h2 { font: 550 1.2rem/1.4 var(--font-sans); }
.writing-related ul { list-style: none; padding: 0; margin-top: .8rem; }
.writing-related li { display: flex; gap: 1rem; align-items: baseline; }
.writing-related a { color: var(--ui-primary); text-decoration: underline; }
.writing-related span { color: var(--ui-text-muted); font-size: .8rem; }
@media (max-width: 600px) { .writing-heading { margin-block: 2rem; } .writing-body { font-size: 1rem; } }
</style>
