<template>
  <section class="py-16 sm:py-24 lg:py-36">
    <UContainer>
      <div class="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-24">
        <div class="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-highlighted motion-preset-slide-up motion-delay-100">
            {{ t('hero.name') }}
          </h1>
          <p class="mt-4 max-w-lg text-lg lg:text-xl text-toned motion-preset-slide-up motion-delay-200">
            {{ t('hero.description') }}
          </p>
          <div class="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start motion-preset-slide-up motion-delay-300">
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
        </div>

        <div class="flex shrink-0 flex-col items-center justify-center gap-6 lg:flex-1 motion-preset-fade-in motion-delay-500">
          <div class="relative">
            <div class="absolute -inset-8 rounded-3xl bg-primary/15 blur-3xl" />
            <img
              src="/photo.jpg"
              :alt="t('hero.name')"
              class="relative size-48 lg:size-60 rounded-2xl object-cover ring-2 ring-primary/30 motion-preset-pop"
            >
          </div>
          <div class="flex flex-wrap justify-center gap-3">
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
      </div>
    </UContainer>
  </section>
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
