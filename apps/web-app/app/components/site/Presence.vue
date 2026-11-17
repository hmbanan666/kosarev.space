<template>
  <ClientOnly>
    <SitePresenceSession v-if="eligible" />
  </ClientOnly>
</template>

<script setup lang="ts">
const route = useRoute()
const mounted = useMounted()
const finePointer = useMediaQuery('(pointer: fine)')
const reducedMotion = usePreferredReducedMotion()
const printing = useMediaQuery('print')
const eligible = computed(() => mounted.value && finePointer.value && reducedMotion.value !== 'reduce' && !printing.value && !route.meta.hideLiveCursors)
</script>
