<template>
  <LiveCursors
    :locale="locale"
    position="bottom-center"
    coordinate-target="[data-canvas-world]"
  >
    <template #profile-actions="{ shuffle, cursorsHidden, toggleCursors, labels }">
      <div class="native-cursor-actions">
        <button
          class="native-cursor-action"
          type="button"
          @click="shuffle"
        >
          <UIcon name="i-lucide-shuffle" aria-hidden="true" />{{ labels.shuffle }}
        </button>
        <button
          class="native-cursor-action"
          type="button"
          :aria-pressed="cursorsHidden"
          @click="toggleCursors"
        >
          <UIcon :name="cursorsHidden ? 'i-lucide-eye' : 'i-lucide-eye-off'" aria-hidden="true" />
          {{ cursorsHidden ? labels.showCursors : labels.hideCursors }}
        </button>
        <NuxtLink :to="localePath('/cases/kosarev-live-cursors')" class="native-cursor-action native-cursor-about">
          <UIcon name="i-lucide-info" aria-hidden="true" />{{ t('liveCursors.howItWorks') }}
        </NuxtLink>
      </div>
    </template>
  </LiveCursors>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
// Read the library's shared session; LiveCursors keeps ownership of pointer rendering.
const { onlineCount, isConnected } = useLiveCursors({ coordinateTarget: () => '[data-canvas-world]' })
const presenceCount = useState<number | null>('site-presence-count', () => null)
watch([onlineCount, isConnected], ([count, connected]) => {
  presenceCount.value = connected && count > 0 ? count : null
}, { immediate: true })
onBeforeUnmount(() => {
  presenceCount.value = null
})
</script>
