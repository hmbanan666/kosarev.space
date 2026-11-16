<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <SiteAgent />
      <SiteAgentLauncher />
      <Teleport :to="presenceTarget" :disabled="presenceTarget === 'body'">
        <div class="site-presence-root">
          <SitePresence />
        </div>
      </Teleport>
    </ClientOnly>
  </UApp>
</template>

<script setup lang="ts">
const route = useRoute()
const presenceDocked = useState('canvas-presence-docked', () => false)
const footerDocked = useState('footer-presence-docked', () => false)
const presenceTarget = computed(() => route.meta.canvasPresence && presenceDocked.value ? '.canvas-presence' : footerDocked.value ? '.site-footer-presence' : 'body')
</script>
