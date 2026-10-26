<template>
  <UPageCard
    :title="skillCase.title"
    :description="skillCase.description"
    :icon="skillCase.icon"
    :to="localePath(`/cases/${skillCase.key}`)"
    spotlight
  >
    <template #footer>
      <p v-if="closedYear" class="mb-3 text-sm text-muted">
        {{ t('projects.closed', { year: closedYear }) }}
      </p>
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
const props = defineProps<{
  skillCase: {
    key: string
    tags: string[]
    icon: string
    title: string
    description: string
  }
}>()

const localePath = useLocalePath()
const { t } = useI18n()
const closedYear = computed(() => closedProjectYearForCase(props.skillCase.key))
</script>
