<template>
  <UApp>
    <UPage>
      <UPageHero
        :title="error?.statusCode === 404 ? '404' : String(error?.statusCode || 500)"
        :description="error?.statusCode === 404 ? 'Page not found' : 'Something went wrong'"
        orientation="horizontal"
      >
        <template #links>
          <UButton
            label="Go home"
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

function handleError() {
  clearError({ redirect: '/' })
}
</script>
