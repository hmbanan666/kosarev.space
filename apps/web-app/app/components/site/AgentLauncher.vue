<template>
  <button
    v-show="!open"
    class="site-agent-launcher"
    :class="{ 'above-canvas': route.meta.canvasPresence }"
    :aria-label="t('agent.label')"
    aria-haspopup="dialog"
    @click="open = true"
  >
    <UIcon name="i-lucide-bot" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { open } = useSiteAgent()
const route = useRoute()
</script>

<style scoped>
.site-agent-launcher { position: fixed; z-index: 39; right: max(20px, env(safe-area-inset-right)); bottom: calc(20px + env(safe-area-inset-bottom)); width: 52px; height: 52px; display: grid; place-items: center; border: 1px solid #d9ad67; border-radius: 50%; background: #151515; color: #d9ad67; box-shadow: 0 4px 20px #0006; font-size: 24px; cursor: pointer; }
.site-agent-launcher:hover { background: #292319; }
.site-agent-launcher:focus-visible { outline: 2px solid #d9ad67; outline-offset: 4px; }
@media (min-width: 768px) { .site-agent-launcher.above-canvas { bottom: calc(68px + env(safe-area-inset-bottom)); } }
@media print { .site-agent-launcher { display: none; } }
</style>
