<template>
  <UPageSection
    id="skills"
    :title="t('cases.title')"
    :description="t('cases.description')"
  >
    <div class="flex flex-col items-center gap-6">
      <SkillTagCloud
        v-model="selectedTags"
        v-model:search-query="searchQuery"
        :tags="visibleTags"
        :search-placeholder="t('cases.searchPlaceholder')"
      />

      <button
        v-if="selectedTags.length"
        class="text-xs text-muted underline underline-offset-2 hover:text-highlighted transition-colors"
        @click="selectedTags = []"
      >
        {{ t('cases.clearFilters') }}
      </button>
    </div>

    <TransitionGroup
      tag="div"
      name="case"
      class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <SkillCaseCard
        v-for="item in filteredCases"
        :key="item.key"
        :skill-case="item"
      />
    </TransitionGroup>

    <div v-if="!filteredCases.length && (selectedTags.length || searchQuery)" class="mt-8 flex flex-col items-center gap-2 text-muted">
      <UIcon name="i-lucide-search-x" class="size-8" />
      <p class="text-sm">
        {{ t('cases.noResults') }}
      </p>
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

const searchQuery = ref('')
const selectedTags = ref<string[]>([])

const { data: casesData } = await useFetch('/api/cases', {
  query: { locale },
})

const allTags = computed(() => {
  if (!casesData.value) {
    return []
  }
  const countMap = new Map<string, number>()
  for (const c of casesData.value) {
    for (const tag of c.tags) {
      countMap.set(tag, (countMap.get(tag) || 0) + 1)
    }
  }
  return Array.from(countMap.entries(), ([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const visibleTags = computed(() => {
  if (!searchQuery.value) {
    return allTags.value
  }
  const q = searchQuery.value.toLowerCase()
  return allTags.value.filter((tag) => tag.name.toLowerCase().includes(q))
})

const filteredCases = computed(() => {
  if (!casesData.value) {
    return []
  }

  const hasTags = selectedTags.value.length > 0
  const hasSearch = searchQuery.value.length > 0

  if (!hasTags && !hasSearch) {
    return casesData.value.slice(0, 9)
  }

  return casesData.value.filter((c) => {
    const matchesTags = hasTags
      ? c.tags.some((tag) => selectedTags.value.includes(tag))
      : true

    const matchesSearch = hasSearch
      ? c.tags.some((tag) => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
      || c.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true

    return matchesTags && matchesSearch
  })
})
</script>

<style scoped>
.case-enter-active {
  transition: all 0.3s ease-out;
}

.case-leave-active {
  transition: all 0.2s ease-in;
}

.case-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.case-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
