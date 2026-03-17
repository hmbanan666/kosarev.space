<template>
  <UPageHero
    orientation="horizontal"
    :links="[
      { label: t('hero.projects'), to: '#projects', icon: 'i-lucide-folder-open', size: 'lg' as const },
      { label: t('cv.title'), to: localePath('/cv'), icon: 'i-lucide-file-text', variant: 'outline' as const, size: 'lg' as const },
      { label: t('hero.contact'), to: '#contacts', icon: 'i-lucide-send', variant: 'outline' as const, size: 'lg' as const },
    ]"
    :ui="{ links: 'motion-preset-slide-up motion-delay-300' }"
  >
    <template #headline>
      <UBadge
        :label="t('hero.badge')"
        variant="subtle"
        size="md"
        class="motion-preset-fade-in"
      />
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
      <div class="relative size-full min-h-64 flex items-center justify-center motion-preset-fade-in motion-delay-500">
        <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/20 via-primary-400/10 to-transparent blur-2xl motion-preset-expand motion-duration-1000" />
        <div class="relative flex flex-col items-center gap-6">
          <img
            src="/photo.jpg"
            :alt="t('hero.name')"
            class="size-40 rounded-2xl object-cover ring-2 ring-primary/20 motion-preset-pop"
          >
          <div class="flex gap-4">
            <UIcon
              v-for="(icon, i) in heroIcons"
              :key="icon"
              :name="icon"
              class="size-8 text-dimmed transition-all duration-300 hover:text-primary hover:scale-125 motion-preset-pop"
              :style="{ animationDelay: `${500 + i * 100}ms` }"
            />
          </div>
        </div>
      </div>
    </template>
  </UPageHero>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>
