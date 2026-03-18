<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <LiveCursors :locale="locale">
      <template #profile-actions="{ shuffle }">
        <div class="flex items-center gap-2">
          <UButton
            size="xs"
            variant="soft"
            icon="i-lucide-shuffle"
            @click="shuffle"
          >
            {{ t('liveCursors.shuffle') }}
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-info"
            :to="localePath('/cases/kosarev-live-cursors')"
          >
            {{ t('liveCursors.howItWorks') }}
          </UButton>
        </div>
      </template>
    </LiveCursors>
  </UApp>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
</script>
