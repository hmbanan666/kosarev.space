<template>
  <span v-if="items.length" class="related-publications">
    <NuxtLink
      v-for="publication in items"
      :key="publication.slug"
      :to="localePath(publicationPath(publication))"
    >
      {{ publication.locales[language].title }}<UIcon name="i-lucide-arrow-right" aria-hidden="true" />
    </NuxtLink>
  </span>
</template>

<script setup lang="ts">
import type { RelatedWork } from '~~/shared/publications'
import { publicationPath, publicationsForWork } from '~~/shared/publications'

const props = defineProps<{ kind: RelatedWork['kind'], workKey: string }>()
const { locale } = useI18n()
const localePath = useLocalePath()
const language = computed(() => locale.value === 'en' ? 'en' : 'ru')
const items = computed(() => publicationsForWork(props.kind, props.workKey))
</script>

<style scoped>
.related-publications { display: flex; flex-wrap: wrap; gap: .75rem 1rem; font-size: .85rem; }
.related-publications a { display: inline-flex; align-items: center; gap: .4rem; color: var(--ui-primary); text-decoration: underline; }
.related-publications .iconify { flex-shrink: 0; }
</style>
