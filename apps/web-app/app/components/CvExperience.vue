<template>
  <UPageSection
    :title="t('cv.experience')"
  >
    <div class="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-default md:before:mx-auto md:before:translate-x-0">
      <div
        v-for="(exp, i) in experiences"
        :key="exp.key"
        class="group relative flex items-start motion-preset-slide-up"
        :class="i % 2 === 0 ? 'md:flex-row-reverse' : ''"
        :style="{ animationDelay: `${i * 100}ms` }"
      >
        <!-- Timeline dot -->
        <div class="absolute left-5 md:left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-default ring-2 ring-primary transition-all duration-300 group-hover:ring-4">
          <UIcon :name="exp.icon" class="size-5 text-primary" />
        </div>

        <!-- Card -->
        <div class="ml-16 md:ml-0 md:w-[calc(50%-2.5rem)]" :class="i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'">
          <UCard class="transition-shadow duration-300 hover:shadow-lg">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 class="text-lg font-semibold text-highlighted">
                  {{ exp.nameKey ? t(exp.nameKey) : exp.company }}
                </h3>
                <p class="text-sm font-medium text-primary">
                  {{ t(`cv.${exp.key}.role`) }}
                </p>
              </div>
              <UBadge
                :label="`${exp.startYear} — ${exp.present ? t('cv.present') : exp.endYear}`"
                variant="subtle"
                size="sm"
              />
            </div>

            <p class="mt-2 text-sm text-muted">
              {{ t(`cv.${exp.key}.description`) }}
            </p>

            <ul class="mt-3 space-y-1.5">
              <li
                v-for="(highlight, j) in getHighlights(`cv.${exp.key}.highlights`)"
                :key="j"
                class="flex gap-2 text-sm text-muted"
              >
                <UIcon name="i-lucide-chevron-right" class="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{{ highlight }}</span>
              </li>
            </ul>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <UBadge
                v-for="tech in exp.stack"
                :key="tech"
                :label="tech"
                variant="soft"
                size="sm"
              />
            </div>

            <div v-if="exp.link" class="mt-3">
              <UButton
                :to="exp.link"
                target="_blank"
                rel="noopener noreferrer"
                variant="link"
                size="sm"
                icon="i-lucide-external-link"
                :padded="false"
              >
                {{ exp.link.replace('https://', '') }}
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { getHighlights } = useHighlights()
</script>
