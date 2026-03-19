<template>
  <UPageSection
    id="experience"
    :title="t('experience.title')"
    :description="t('experience.description')"
  >
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <div
        v-for="(stat, i) in stats"
        :key="stat.key"
        class="flex flex-col items-center gap-1.5 rounded-lg border border-default/50 bg-elevated/50 py-5 text-center motion-preset-slide-up"
        :style="{ animationDelay: `${i * 100}ms` }"
      >
        <UIcon :name="stat.icon" class="size-5 sm:size-6 text-primary" />
        <span class="text-2xl sm:text-3xl font-bold text-highlighted">{{ t(`experience.${stat.key}`) }}</span>
        <span class="text-xs sm:text-sm text-muted">{{ t(`experience.${stat.key}Label`) }}</span>
      </div>
    </div>
    <div class="mt-4 flex justify-center motion-preset-slide-up motion-delay-500">
      <UButton
        :label="t('experience.viewCv')"
        :to="localePath('/cv')"
        icon="i-lucide-arrow-right"
        trailing
        variant="ghost"
        size="lg"
      />
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const stats = [
  { key: 'years', icon: 'i-lucide-calendar-range' },
  { key: 'products', icon: 'i-lucide-rocket' },
  { key: 'clients', icon: 'i-lucide-users' },
  { key: 'opensource', icon: 'i-lucide-star' },
]
</script>
