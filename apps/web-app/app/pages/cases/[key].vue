<template>
  <UPage v-if="data">
    <UPageSection>
      <article class="mx-auto max-w-2xl">
        <div class="mb-8 motion-preset-slide-up">
          <NuxtLink :to="`${localePath('/')}#skills`" class="inline-flex items-center gap-1 text-sm text-muted hover:text-highlighted transition-colors mb-6">
            <UIcon name="i-lucide-arrow-left" class="size-4" />
            {{ t('cases.backToAll') }}
          </NuxtLink>

          <h1 class="text-3xl font-bold text-highlighted sm:text-4xl">
            {{ data.title }}
          </h1>

          <p class="mt-4 text-lg text-muted leading-relaxed">
            {{ data.description }}
          </p>

          <div class="mt-4 flex flex-wrap gap-1.5">
            <UBadge
              v-for="tag in data.tags"
              :key="tag"
              :label="tag"
              variant="subtle"
              size="sm"
            />
          </div>
        </div>

        <img
          v-if="data.image"
          :src="data.image"
          :alt="data.title"
          class="my-8 max-h-[600px] rounded-lg ring-1 ring-default/50 mx-auto"
        >

        <USeparator v-else class="my-8" />

        <div class="space-y-8 motion-preset-slide-up motion-delay-200">
          <section>
            <h2 class="text-xl font-semibold text-highlighted mb-3">
              <UIcon name="i-lucide-target" class="size-5 text-primary" />
              {{ t('cases.taskTitle') }}
            </h2>
            <p class="text-muted leading-relaxed">
              {{ data.task }}
            </p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-highlighted mb-3">
              <UIcon name="i-lucide-lightbulb" class="size-5 text-primary" />
              {{ t('cases.solutionTitle') }}
            </h2>
            <p class="text-muted leading-relaxed">
              {{ data.solution }}
            </p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-highlighted mb-3">
              <UIcon name="i-lucide-trophy" class="size-5 text-primary" />
              {{ t('cases.resultTitle') }}
            </h2>
            <p class="text-muted leading-relaxed">
              {{ data.result }}
            </p>
          </section>
        </div>

        <USeparator class="my-8" />

        <div v-if="data.related.length" class="motion-preset-slide-up motion-delay-300">
          <h2 class="text-xl font-semibold text-highlighted mb-4">
            {{ t('cases.relatedTitle') }}
          </h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <SkillCaseCard
              v-for="related in data.related"
              :key="related.key"
              :skill-case="related"
            />
          </div>
        </div>

        <div class="mt-12 flex flex-col items-center gap-3 text-center motion-preset-slide-up motion-delay-500">
          <p class="text-muted">
            {{ t('cases.ctaText') }}
          </p>
          <UButton
            :label="t('hero.contact')"
            icon="i-lucide-send"
            size="lg"
            @click="contactOpen = true"
          />
          <ContactModal v-model:open="contactOpen" />
        </div>
      </article>
    </UPageSection>
  </UPage>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const contactOpen = ref(false)

const { data } = await useFetch(`/api/cases/${route.params.key}`, {
  query: { locale },
})

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Case not found' })
}

const canonicalUrl = computed(() => {
  const base = 'https://kosarev.space'
  const path = localePath(`/cases/${route.params.key}`)
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
})

const ogImage = computed(() => {
  return data.value?.image
    ? `https://kosarev.space${data.value.image}`
    : 'https://kosarev.space/og-image.png'
})

useSeoMeta({
  title: () => data.value?.title,
  description: () => data.value?.description,
  ogTitle: () => data.value?.title,
  ogDescription: () => data.value?.description,
  ogType: 'article',
  ogUrl: canonicalUrl,
  ogImage,
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
})

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': data.value?.title,
        'description': data.value?.description,
        'image': ogImage.value,
        'datePublished': '2025-01-01',
        'author': {
          '@type': 'Person',
          'name': t('hero.name'),
          'url': 'https://kosarev.space',
        },
        'publisher': {
          '@type': 'Person',
          'name': t('hero.name'),
        },
        'keywords': data.value?.tags.join(', '),
      })),
    },
  ],
})
</script>
