<template>
  <UApp>
    <div class="site-shell">
      <SiteHeader />
      <ClientOnly><SiteAgent /></ClientOnly>
      <main
        id="main-content"
        class="site-wrap site-section error-page"
        tabindex="-1"
      >
        <h1>{{ message }}</h1>
        <p class="error-code">
          {{ error.statusCode }}
        </p>
        <div class="error-actions">
          <a
            v-if="catalog"
            class="site-button"
            :href="localePath(catalog.path)"
          >
            {{ t(catalog.label) }}<SiteLinkIcon />
          </a>
          <a :class="catalog ? 'site-text-link' : 'site-button'" :href="localePath('/')">
            {{ t('error.goHome') }}
          </a>
        </div>
      </main>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const message = computed(() => t(props.error.statusCode === 404 ? 'error.notFound' : 'error.serverError'))
const catalogs = [
  { path: '/cases', label: 'cases.backToAll' },
  { path: '/projects', label: 'writing.backToProducts' },
  { path: '/writing', label: 'writing.backToWriting' },
]
const catalog = computed(() => {
  const path = router.currentRoute.value.path
  return catalogs.find((item) => path.startsWith(`${localePath(item.path)}/`))
})
useHead(() => ({ title: message.value, htmlAttrs: { lang: locale.value } }))
</script>

<style scoped>
.error-page h1 { font: 500 clamp(2rem, 4vw, 3.5rem)/1.2 var(--font-serif); }
.error-code { margin-block: .75rem 2rem; color: var(--ui-text-muted); font-family: var(--font-mono); }
.error-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; }
</style>
