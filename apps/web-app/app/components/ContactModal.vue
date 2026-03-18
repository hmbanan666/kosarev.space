<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-sm' }">
    <template #content>
      <div class="flex flex-col items-stretch gap-4 p-6">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-highlighted">
            {{ t('contacts.title') }}
          </h3>
          <p class="mt-1 text-sm text-muted">
            {{ t('contacts.description') }}
          </p>
        </div>

        <UButton
          to="https://t.me/hmbanan666"
          target="_blank"
          rel="noopener noreferrer"
          icon="i-simple-icons-telegram"
          size="xl"
          class="justify-center"
          aria-label="Telegram"
        >
          Telegram
        </UButton>

        <div class="grid grid-cols-3 gap-2">
          <UButton
            v-for="contact in secondaryContacts"
            :key="contact.label"
            :to="contact.to"
            :icon="contact.icon"
            :aria-label="contact.label"
            target="_blank"
            rel="noopener noreferrer"
            variant="soft"
            size="md"
            class="justify-center"
          >
            {{ contact.label }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const { t } = useI18n()

const secondaryContacts = contacts.filter((c) => c.label !== 'Telegram')
</script>
