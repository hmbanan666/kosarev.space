<template>
  <UPageSection
    id="contacts"
    :title="t('contacts.title')"
    :description="t('contacts.description')"
  >
    <div class="flex flex-wrap justify-center gap-4 motion-preset-slide-up motion-delay-200">
      <UButton
        v-for="contact in contacts"
        :key="contact.label"
        :to="contact.to"
        :icon="contact.icon"
        :label="contact.label"
        target="_blank"
        rel="noopener noreferrer"
        size="lg"
        variant="soft"
        class="transition-transform duration-200 hover:-translate-y-1"
      />
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
