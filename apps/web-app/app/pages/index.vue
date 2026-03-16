<template>
  <UPage>
    <HeroSection />
    <USeparator />
    <ProjectsSection />
    <USeparator />
    <SkillsSection />
    <USeparator />
    <ContactsSection />

    <USeparator />
    <footer class="py-8 text-center text-sm text-dimmed">
      <UContainer>
        <p>&copy; {{ new Date().getFullYear() }} Nick Kosarev</p>
      </UContainer>
    </footer>
  </UPage>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.title'),
  description: () => t('seo.description'),
  ogTitle: () => t('seo.title'),
  ogDescription: () => t('seo.description'),
})
</script>
