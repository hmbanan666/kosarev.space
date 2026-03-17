<template>
  <UPage>
    <UPageSection>
      <div class="flex flex-col items-center gap-6 text-center motion-preset-slide-up">
        <img
          src="/photo.jpg"
          :alt="t('hero.name')"
          class="size-32 rounded-2xl object-cover ring-2 ring-primary/20"
        >
        <div>
          <h1 class="text-4xl font-bold text-highlighted sm:text-5xl">
            {{ t('hero.name') }}
          </h1>
          <p class="mt-2 text-lg font-medium text-primary">
            {{ t('cv.subtitle') }}
          </p>
          <div class="mt-2 flex flex-wrap justify-center gap-3 text-sm text-muted">
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-map-pin" class="size-4" />
              {{ t('cv.location') }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-lucide-monitor" class="size-4" />
              {{ t('cv.remote') }}
            </span>
          </div>
        </div>
        <div class="flex gap-3">
          <UButton
            :label="t('cv.downloadPdf')"
            icon="i-lucide-download"
            size="lg"
            :to="locale === 'ru' ? '/cv.pdf' : '/cv-en.pdf'"
            target="_blank"
          />
          <UButton
            :label="t('hero.contact')"
            to="#contacts"
            icon="i-lucide-send"
            variant="outline"
            size="lg"
          />
        </div>
      </div>
    </UPageSection>

    <CvExperience />

    <USeparator />

    <CvPublicActivity />

    <USeparator />

    <UPageSection :title="t('cv.education')">
      <UCard class="motion-preset-slide-up">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-graduation-cap" class="mt-0.5 size-5 text-primary" />
          <p class="text-muted">
            {{ t('cv.educationText') }}
          </p>
        </div>
      </UCard>
    </UPageSection>

    <USeparator />

    <UPageSection :title="t('cv.languages')">
      <div class="flex flex-wrap gap-4 motion-preset-slide-up">
        <UCard v-for="lang in languages" :key="lang.key">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-languages" class="size-5 text-primary" />
            <div>
              <p class="font-medium text-highlighted">
                {{ t(`cv.${lang.key}`) }}
              </p>
              <p class="text-sm text-muted">
                {{ lang.level === 'native' ? t('cv.native') : lang.level }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </UPageSection>

    <USeparator />
    <ContactsSection />
  </UPage>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

useSeoMeta({
  title: () => t('cv.seoTitle'),
  description: () => t('cv.seoDescription'),
  ogTitle: () => t('cv.seoTitle'),
  ogDescription: () => t('cv.seoDescription'),
})
</script>
