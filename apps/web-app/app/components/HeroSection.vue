<template>
  <UPageHero
    orientation="horizontal"
    :ui="{ links: 'motion-preset-slide-up motion-delay-300' }"
  >
    <template #links>
      <div class="flex flex-wrap items-center gap-2 motion-preset-slide-up motion-delay-300">
        <UButton
          :label="t('nav.cv')"
          :to="localePath('/cv')"
          icon="i-lucide-file-text"
          size="lg"
        />
        <UButton
          :label="t('hero.contact')"
          icon="i-lucide-send"
          variant="outline"
          size="lg"
          @click="contactOpen = true"
        />
      </div>
      <ContactModal v-model:open="contactOpen" />
    </template>
    <template #title>
      <span class="motion-preset-slide-up motion-delay-100">
        {{ t('hero.name') }}
      </span>
    </template>

    <template #description>
      <span class="motion-preset-slide-up motion-delay-200">
        {{ t('hero.description') }}
      </span>
    </template>

    <template #default>
      <div class="flex flex-col items-center justify-center gap-6 motion-preset-fade-in motion-delay-500">
        <div class="relative">
          <div class="absolute -inset-8 rounded-3xl bg-primary/15 blur-3xl" />
          <img
            src="/photo.jpg"
            :alt="t('hero.name')"
            class="relative size-48 rounded-2xl object-cover ring-2 ring-primary/30 motion-preset-pop"
          >
        </div>
        <div class="flex gap-3">
          <UTooltip
            v-for="(icon, i) in heroIcons"
            :key="icon.name"
            :text="icon.label"
          >
            <UIcon
              :name="icon.name"
              class="size-7 text-muted transition-all duration-300 hover:text-primary hover:scale-150 animate-float"
              :style="{ animationDelay: `${i * 200}ms`, animationDuration: '2.5s' }"
            />
          </UTooltip>
        </div>
      </div>
    </template>
  </UPageHero>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const contactOpen = ref(false)

const heroIcons = [
  { name: 'i-simple-icons-vuedotjs', label: 'Vue.js' },
  { name: 'i-simple-icons-nuxtdotjs', label: 'Nuxt' },
  { name: 'i-simple-icons-typescript', label: 'TypeScript' },
  { name: 'i-simple-icons-postgresql', label: 'PostgreSQL' },
  { name: 'i-simple-icons-tailwindcss', label: 'Tailwind CSS' },
  { name: 'i-simple-icons-docker', label: 'Docker' },
]
</script>
