<template>
  <UPageSection
    id="projects"
    :title="t('projects.title')"
    :description="t('projects.description')"
  >
    <UPageGrid>
      <UPageCard
        v-for="(project, i) in projects"
        :key="project.key"
        :title="project.title"
        :description="t(`projects.${project.key}.description`)"
        :icon="project.icon"
        :to="project.link"
        target="_blank"
        spotlight
        class="motion-preset-slide-up motion-duration-500"
        :class="`motion-delay-${i * 150}`"
      >
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
          <div class="mt-4 flex items-center gap-1 text-sm text-primary transition-transform duration-200 hover:translate-x-1">
            {{ project.link?.includes('github') ? t('projects.source') : t('projects.visit') }}
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

interface Project {
  key: string
  title: string
  icon: string
  stack: string[]
  link?: string
}

const projects: Project[] = [
  {
    key: 'meloteka',
    title: 'Meloteka',
    icon: 'i-lucide-music',
    stack: ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'S3', 'Tailwind CSS'],
    link: 'https://meloteka.ru',
  },
  {
    key: 'startodel',
    title: 'Startodel',
    icon: 'i-lucide-utensils',
    stack: ['Nuxt', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'Tailwind CSS'],
    link: 'https://startodel.ru',
  },
  {
    key: 'chatgame',
    title: 'ChatGame',
    icon: 'i-lucide-gamepad-2',
    stack: ['TypeScript', 'Canvas API', 'WebSocket'],
    link: 'https://github.com/hmbanan666/chatgame',
  },
]
</script>
