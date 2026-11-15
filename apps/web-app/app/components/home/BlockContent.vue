<template>
  <template v-if="id === 'hero'">
    <p class="canvas-eyebrow">
      {{ t('hero.badge') }}
    </p>
    <div class="canvas-intro">
      <img
        src="/photo.jpg"
        :alt="t('hero.name')"
        width="112"
        height="132"
        fetchpriority="high"
      >
      <div>
        <h1>{{ t('hero.name') }}</h1>
      </div>
    </div>
    <p class="canvas-role">
      {{ t('cv.subtitle') }}
    </p>
    <p class="canvas-description">
      {{ heroIntro }}
    </p>
    <p class="canvas-footnote">
      {{ t('cv.location') }} · {{ t('cv.since') }}
    </p>
    <div class="canvas-links">
      <NuxtLink class="site-button" :to="localePath('/cv')">
        {{ t('site.viewCv') }}
      </NuxtLink>
      <NuxtLink class="site-text-link" :to="localePath('/cases')">
        {{ t('site.exploreWork') }}<SiteLinkIcon />
      </NuxtLink>
    </div>
  </template>
  <template v-else-if="product">
    <p class="canvas-eyebrow">
      {{ t(id === 'dostigus' ? 'projects.statusPaused' : 'projects.statusActive') }}
    </p>
    <h2>
      <NuxtLink v-if="product.page" :to="localePath(product.page)">
        {{ product.title }}
      </NuxtLink><a
        v-else
        :href="product.link"
        target="_blank"
        rel="noopener noreferrer"
      >{{ product.title }}</a>
    </h2>
    <p class="canvas-description">
      {{ t(`projects.${id}.${id === 'context' || id === 'dostigus' ? 'description' : 'kind'}`) }}
    </p>
    <figure v-if="id === 'k39'" class="canvas-map">
      <div class="canvas-map-image">
        <img
          src="/projects/k39.png"
          :alt="t('projects.k39.imageAlt')"
          width="1000"
          height="700"
        >
      </div>
      <figcaption>© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · <a href="https://protomaps.com">Protomaps</a></figcaption>
    </figure>
    <a
      v-if="product.source"
      class="canvas-source"
      :href="product.source"
      target="_blank"
      rel="noopener noreferrer"
    >{{ t('site.source') }}<SiteLinkIcon external /></a>
    <a
      v-else
      class="canvas-source"
      :href="product.link"
      target="_blank"
      rel="noopener noreferrer"
    >{{ t(`projects.${id}.visit`) }}<SiteLinkIcon external /></a>
  </template>
  <template v-else-if="id === 'writing'">
    <p class="canvas-eyebrow">
      {{ t('canvas.reading') }}
    </p>
    <h2>
      <NuxtLink :to="localePath('/writing')">
        {{ t('writing.title') }}<SiteLinkIcon />
      </NuxtLink>
    </h2>
    <div v-if="latest" class="canvas-latest">
      <p class="canvas-footnote">
        {{ t(`writing.types.${latest.type}`) }} · {{ latest.publishedAt }}
      </p>
      <NuxtLink :to="localePath(`/writing/${latest.slug}`)">
        {{ latest.locales[language].title }}
      </NuxtLink>
    </div>
    <p v-else class="canvas-description">
      {{ t('writing.description') }}
    </p>
    <a class="canvas-source" :href="language === 'en' ? '/en/writing/feed.xml' : '/writing/feed.xml'">RSS<SiteLinkIcon /></a>
  </template>
  <template v-else-if="id === 'cv'">
    <p class="canvas-eyebrow">
      {{ t('site.experience') }}
    </p>
    <h2>
      <NuxtLink :to="localePath('/cv')">
        {{ t('nav.cv') }}<SiteLinkIcon />
      </NuxtLink>
    </h2>
    <a
      class="canvas-source"
      :href="language === 'en' ? '/cv-en.pdf' : '/cv.pdf'"
      download
    >{{ t('cv.downloadPdf') }}</a>
  </template>
  <template v-else-if="id === 'contacts'">
    <p class="canvas-eyebrow">
      <NuxtLink :to="localePath('/contact')">
        {{ t('hero.contact') }}<SiteLinkIcon />
      </NuxtLink>
    </p>
    <h2 class="canvas-email">
      <a href="mailto:nick@kosarev.space">nick@kosarev.space<SiteLinkIcon external /></a>
    </h2>
    <div class="canvas-links">
      <a href="https://t.me/hmbanan666">Telegram<SiteLinkIcon external /></a><a href="https://github.com/hmbanan666">GitHub<SiteLinkIcon external /></a>
    </div>
  </template>
  <template v-else-if="id === 'live'">
    <p class="canvas-eyebrow">
      Live
    </p>
    <h2>
      <NuxtLink :to="localePath('/cases/kosarev-live-cursors')">
        {{ t('site.presenceTitle') }}<SiteLinkIcon />
      </NuxtLink>
    </h2>
    <p class="canvas-footnote">
      nuxt-live-cursors · WebSocket
    </p>
  </template>
  <template v-else-if="id === 'archive'">
    <p class="canvas-eyebrow">
      {{ t('canvas.archive') }}
    </p>
    <h2>
      <NuxtLink :to="localePath('/projects')">
        {{ t('projects.title') }}<SiteLinkIcon />
      </NuxtLink>
    </h2>
    <p class="canvas-footnote">
      {{ projects.map(project => project.title).join(' · ') }}
    </p>
    <NuxtLink class="canvas-source" :to="localePath('/cases')">
      {{ t('nav.cases') }}<SiteLinkIcon />
    </NuxtLink>
  </template>
  <template v-else-if="id === 'now'">
    <p class="canvas-eyebrow">
      {{ t('canvas.now') }}
    </p>
    <h2>{{ t('projects.activeTitle') }}</h2>
    <p class="canvas-footnote">
      {{ activeProducts.map(product => product.title).join(' · ') }}
    </p>
  </template>
</template>

<script setup lang="ts">
import type { PublicationSummary } from '~~/shared/publications'

const props = defineProps<{ id: string, latest?: PublicationSummary }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
// Use the existing introduction verbatim; the project blocks carry its examples.
const heroIntro = computed(() => t('hero.description').match(/^[^.]+\./)?.[0] ?? t('hero.description'))
const language = computed(() => locale.value === 'en' ? 'en' : 'ru')
const product = computed(() => [...activeProducts, ...pausedProjects].find((product) => product.key === props.id) as { title: string, page?: string, link?: string, source?: string } | undefined)
</script>
