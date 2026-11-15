<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <SitePresence v-if="!route.meta.canvasPresence" />
  </UApp>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
