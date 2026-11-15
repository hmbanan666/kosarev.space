<template>
  <header class="site-header">
    <a class="site-skip" href="#main-content">{{ t('site.skip') }}</a>
    <div class="site-wrap site-header-inner">
      <NuxtLink :to="localePath('/')" class="site-brand">
        {{ t('hero.name') }}
      </NuxtLink>
      <nav class="site-desktop-nav" :aria-label="t('site.navigation')">
        <NuxtLink
          v-for="link in links"
          :key="link.label"
          :to="link.to"
          :aria-current="link.current ? 'page' : undefined"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      <div class="site-header-controls">
        <LanguageSwitcher />
        <details
          ref="menu"
          class="site-mobile-menu"
          @keydown.esc.prevent="closeMenu(true)"
          @toggle="menuOpen = ($event.target as HTMLDetailsElement).open"
        >
          <summary
            :role="mounted ? 'button' : undefined"
            :aria-label="menuOpen ? t('site.closeMenu') : t('site.menu')"
            :aria-expanded="mounted ? menuOpen : undefined"
            aria-controls="mobile-navigation"
          >
            <UIcon name="i-lucide-menu" aria-hidden="true" />
          </summary>
          <nav id="mobile-navigation" :aria-label="t('site.navigation')">
            <NuxtLink
              v-for="link in links"
              :key="link.label"
              :to="link.to"
              :aria-current="link.current ? 'page' : undefined"
              @click="closeMenu()"
            >
              {{ link.label }}
            </NuxtLink>
            <a :href="pdfPath" download>{{ t('cv.downloadPdf') }}</a>
            <a href="mailto:nick@kosarev.space">nick@kosarev.space</a>
          </nav>
        </details>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const menu = useTemplateRef<HTMLDetailsElement>('menu')
const menuOpen = shallowRef(false)
const mounted = useMounted()
onMounted(() => {
  menuOpen.value = menu.value?.open ?? false
})
const pdfPath = computed(() => locale.value === 'en' ? '/cv-en.pdf' : '/cv.pdf')
const links = computed(() => [
  { label: t('projects.title'), path: '/projects' },
  { label: t('nav.cases'), path: '/cases' },
  { label: t('writing.title'), path: '/writing' },
  { label: t('nav.cv'), path: '/cv' },
  { label: t('nav.contact'), path: '/contact' },
].map((link) => ({ ...link, to: localePath(link.path), current: route.path === localePath(link.path) || route.path.startsWith(`${localePath(link.path)}/`) })))
function closeMenu(restoreFocus = false) {
  if (menu.value) {
    menu.value.open = false
    if (restoreFocus) {
      menu.value.querySelector('summary')?.focus()
    }
  }
}
watch(() => route.path, () => closeMenu())
onClickOutside(menu, () => closeMenu())
</script>
