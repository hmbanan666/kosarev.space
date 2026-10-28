<template>
  <ol class="publication-list">
    <li
      v-for="publication in items"
      :key="publication.slug"
      class="publication-entry"
    >
      <article>
        <p class="publication-meta">
          <time :datetime="publication.publishedAt">{{ formatPublicationDate(publication.publishedAt, language) }}</time>
          <span aria-hidden="true">·</span>
          <span>{{ t(`writing.types.${publication.type}`) }}</span>
        </p>
        <h2 class="publication-title">
          <NuxtLink :to="localePath(publicationPath(publication))">
            {{ publication.locales[language].title }}
          </NuxtLink>
        </h2>
        <p class="publication-description">
          {{ publication.locales[language].description }}
        </p>
      </article>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { PublicationSummary } from '~~/shared/publications'
import { formatPublicationDate, publicationPath } from '~~/shared/publications'

defineProps<{ items: readonly PublicationSummary[] }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const language = computed(() => locale.value === 'en' ? 'en' : 'ru')
</script>

<style scoped>
.publication-list { list-style: none; padding: 0; max-width: 75ch; }
.publication-entry { padding-block: 2rem; border-top: 1px solid var(--ui-border); }
.publication-meta { display: flex; flex-wrap: wrap; gap: .65rem; font-size: .8rem; color: var(--ui-text-muted); margin-bottom: .9rem !important; }
.publication-title { font: 500 clamp(1.5rem, 3vw, 2rem)/1.3 var(--font-serif); letter-spacing: -.02em; }
.publication-title a { text-decoration: underline; text-decoration-color: var(--ui-border-accented); }
.publication-title a:hover { text-decoration-color: var(--ui-primary); }
.publication-description { margin-top: 1rem !important; max-width: 65ch; color: var(--ui-text-muted); }
</style>
