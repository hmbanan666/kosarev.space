<template>
  <UPageCard
    :title="skillCase.title"
    :description="skillCase.description"
    :icon="skillCase.icon"
    :to="localePath(`/cases/${skillCase.key}`)"
    spotlight
  >
    <template #footer>
      <div class="flex flex-wrap gap-1.5">
        <UBadge
          v-for="tag in skillCase.tags"
          :key="tag"
          :label="tag"
          variant="subtle"
          size="sm"
        />
      </div>
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
defineProps<{
  skillCase: {
    key: string
    tags: string[]
    icon: string
    title: string
    description: string
  }
}>()

const localePath = useLocalePath()
</script>
