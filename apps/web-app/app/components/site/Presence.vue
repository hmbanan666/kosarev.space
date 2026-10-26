<template>
  <ClientOnly>
    <SitePresenceSession v-if="ready && available && enabled" />
  </ClientOnly>
</template>

<script setup lang="ts">
const route = useRoute()
const { enabled, available } = usePortfolioPresence()
const ready = shallowRef(false)
const finePointer = useMediaQuery('(pointer: fine)')
const reducedMotion = usePreferredReducedMotion()
const printing = useMediaQuery('print')
watchEffect(() => {
  available.value = ready.value && finePointer.value && reducedMotion.value !== 'reduce' && !printing.value && !route.meta.hideLiveCursors
})
onMounted(() => {
  try {
    enabled.value = localStorage.getItem('kosarev-live-cursors') !== 'off'
  } catch {}
  ready.value = true
})
</script>
