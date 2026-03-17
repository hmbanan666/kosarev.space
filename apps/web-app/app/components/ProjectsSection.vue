<template>
  <UPageSection
    id="projects"
    :title="t('projects.title')"
    :description="t('projects.description')"
  >
    <UPageGrid class="sm:grid-cols-2 lg:grid-cols-2">
      <UPageCard
        v-for="(project, i) in projects"
        :key="project.key"
        :title="project.titleKey ? t(project.titleKey) : project.title"
        :description="t(`projects.${project.key}.description`)"
        :icon="project.icon"
        :to="project.link"
        target="_blank"
        rel="noopener noreferrer"
        spotlight
        class="motion-preset-slide-up motion-duration-500"
        :style="{ animationDelay: `${i * 150}ms` }"
      >
        <template v-if="project.image" #header>
          <img
            :src="project.image"
            :alt="project.titleKey ? t(project.titleKey) : project.title"
            class="aspect-video w-full rounded-t-[calc(var(--ui-radius)*2)] object-cover object-top"
          >
        </template>
        <template #footer>
          <div class="flex flex-wrap gap-1.5">
            <UBadge
              v-for="tech in project.stack"
              :key="tech"
              :label="tech"
              variant="subtle"
              size="sm"
              class="motion-preset-fade-in motion-delay-500"
            />
          </div>
          <div v-if="project.link" class="mt-4 flex items-center gap-1 text-sm text-primary transition-transform duration-200 hover:translate-x-1">
            {{ project.link.includes('github') ? t('projects.source') : t('projects.visit') }}
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-4"
            />
          </div>
        </template>
      </UPageCard>
    </UPageGrid>
  </UPageSection>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
