<template>
  <div>
    <header class="fixed top-0 left-0 z-50 w-full border-b border-default/50 bg-default/80 backdrop-blur-sm">
      <UContainer class="flex h-12 items-center justify-between">
        <div class="flex items-center gap-3 sm:gap-6">
          <NuxtLink :to="localePath('/')" class="text-sm font-semibold text-highlighted hover:text-primary transition-colors truncate">
            {{ t('hero.name') }}
          </NuxtLink>
          <nav aria-label="Main navigation" class="flex items-center gap-2 sm:gap-4">
            <NuxtLink
              :to="localePath('/cv')"
              class="text-sm text-muted hover:text-highlighted transition-colors"
              active-class="!text-primary"
            >
              {{ t('nav.cv') }}
            </NuxtLink>
            <NuxtLink
              :to="`${localePath('/')}#skills`"
              class="text-sm text-muted hover:text-highlighted transition-colors"
            >
              {{ t('nav.cases') }}
            </NuxtLink>
          </nav>
        </div>
        <LanguageSwitcher />
      </UContainer>
    </header>

    <div class="pt-12">
      <slot />
    </div>

    <footer id="contacts" class="border-t border-default/50 py-10 pb-24">
      <UContainer class="flex flex-col items-center gap-4">
        <p class="text-sm text-muted">
          {{ t('contacts.description') }}
        </p>
        <div class="flex gap-3">
          <UButton
            v-for="contact in contacts"
            :key="contact.label"
            :to="contact.to"
            :icon="contact.icon"
            :aria-label="contact.label"
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="lg"
            class="transition-transform duration-200 hover:-translate-y-1"
          />
        </div>
        <p class="mt-2 text-xs text-dimmed">
          {{ t('footer.copyright', { year: new Date().getFullYear() }) }}
        </p>
      </UContainer>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>
