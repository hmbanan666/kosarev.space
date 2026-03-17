<template>
  <UPageSection
    :title="t('cv.publicActivity')"
  >
    <div class="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-default md:before:mx-auto md:before:translate-x-0">
      <div
        v-for="(act, i) in publicActivities"
        :key="act.key"
        class="group relative flex items-start motion-preset-slide-up"
        :class="i % 2 === 0 ? 'md:flex-row-reverse' : ''"
        :style="{ animationDelay: `${i * 100}ms` }"
      >
        <div class="absolute left-5 md:left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-default ring-2 ring-primary transition-all duration-300 group-hover:ring-4">
          <UIcon :name="act.icon" class="size-5 text-primary" />
        </div>

        <div class="ml-16 md:ml-0 md:w-[calc(50%-2.5rem)]" :class="i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'">
          <UCard class="transition-shadow duration-300 hover:shadow-lg">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 class="text-lg font-semibold text-highlighted">
                  {{ act.company }}
                </h3>
                <p class="text-sm font-medium text-primary">
                  {{ t(`cv.${act.key}.role`) }}
                </p>
              </div>
              <UBadge
                :label="`${act.startYear} — ${act.present ? t('cv.present') : act.endYear}`"
                variant="subtle"
                size="sm"
              />
            </div>

            <p class="mt-2 text-sm text-muted">
              {{ t(`cv.${act.key}.description`) }}
            </p>

            <ul class="mt-3 space-y-1.5">
              <li
                v-for="(highlight, j) in getHighlights(`cv.${act.key}.highlights`)"
                :key="j"
                class="flex gap-2 text-sm text-muted"
              >
                <UIcon name="i-lucide-chevron-right" class="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{{ highlight }}</span>
              </li>
            </ul>

            <div class="mt-3 flex flex-wrap gap-1.5">
              <UBadge
                v-for="tech in act.stack"
                :key="tech"
                :label="tech"
                variant="soft"
                size="sm"
              />
            </div>

            <div v-if="act.link" class="mt-3">
              <UButton
                :to="act.link"
                target="_blank"
                rel="noopener noreferrer"
                variant="link"
                size="sm"
                icon="i-lucide-external-link"
                :padded="false"
              >
                {{ act.link.replace('https://', '') }}
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
