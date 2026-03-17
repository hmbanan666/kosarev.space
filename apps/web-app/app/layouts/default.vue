<template>
  <div>
    <header class="fixed top-0 right-0 z-50 p-4">
      <LanguageSwitcher />
    </header>

    <slot />

    <USeparator />
    <footer class="py-8 text-center text-sm text-dimmed">
      <UContainer>
        <p>{{ t('footer.copyright', { year: new Date().getFullYear() }) }}</p>
      </UContainer>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
