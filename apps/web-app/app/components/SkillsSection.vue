<template>
  <UPageSection
    id="skills"
    :title="t('skills.title')"
    :description="t('skills.description')"
  >
    <UPageGrid>
      <UPageCard
        v-for="(group, i) in skills"
        :key="group.key"
        :title="t(`skills.${group.key}`)"
        :icon="group.icon"
        variant="outline"
        class="motion-preset-slide-up motion-duration-500"
        :class="`motion-delay-${i * 150}`"
      >
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="(skill, j) in group.items"
            :key="skill"
            :label="skill"
            variant="soft"
            size="md"
            class="motion-preset-pop"
            :class="`motion-delay-${(i * 100) + (j * 75)}`"
          />
        </div>
      </UPageCard>
    </UPageGrid>
  </UPageSection>
</template>

<script setup lang="ts">
const { t } = useI18n()

const skills = [
  {
    key: 'frontend',
    icon: 'i-lucide-layout-dashboard',
    items: ['Vue 3', 'Nuxt', 'TypeScript', 'Tailwind CSS', 'Pinia', 'VueUse'],
  },
  {
    key: 'backend',
    icon: 'i-lucide-server',
    items: ['Nitro', 'Node.js', 'PostgreSQL', 'Drizzle ORM', 'S3'],
  },
  {
    key: 'tools',
    icon: 'i-lucide-wrench',
    items: ['Git', 'Docker', 'pnpm', 'Vitest', 'Playwright', 'GitHub Actions'],
  },
]
</script>
