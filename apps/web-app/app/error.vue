<template>
  <UApp>
    <UPage>
      <UPageHero
        :title="error?.statusCode === 404 ? '404' : String(error?.statusCode || 500)"
        :description="error?.statusCode === 404 ? t('error.notFound') : t('error.serverError')"
        orientation="horizontal"
      >
        <template #links>
          <UButton
            :label="t('error.goHome')"
            icon="i-lucide-home"
            size="lg"
            @click="handleError"
          />
        </template>
      </UPageHero>
    </UPage>
  </UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()

function handleError() {
  clearError({ redirect: '/' })
}
</script>
