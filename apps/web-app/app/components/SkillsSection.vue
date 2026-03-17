<template>
  <UPageSection
    id="skills"
    :title="t('skills.title')"
    :description="t('skills.description')"
  >
    <UPageGrid>
      <UPageCard
        v-for="(group, i) in skillGroups"
        :key="group.key"
        :title="t(`skills.${group.key}`)"
        :icon="group.icon"
        variant="outline"
        class="motion-preset-slide-up motion-duration-500"
        :class="['motion-delay-0', 'motion-delay-150', 'motion-delay-300'][i]"
      >
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="(skill, j) in group.items"
            :key="skill"
            :label="skill"
            variant="soft"
            size="md"
            class="motion-preset-pop"
            :style="{ animationDelay: `${(i * 100) + (j * 75)}ms` }"
          />
        </div>
      </UPageCard>
    </UPageGrid>
  </UPageSection>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
