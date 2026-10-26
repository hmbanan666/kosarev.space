<template>
  <ClientOnly>
    <LiveCursors
      v-if="eligible"
      :locale="locale"
      position="bottom-center"
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
  </ClientOnly>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const mounted = useMounted()
const finePointer = useMediaQuery('(pointer: fine)')
const reducedMotion = usePreferredReducedMotion()
const printing = useMediaQuery('print')
const eligible = computed(() => mounted.value && finePointer.value && reducedMotion.value !== 'reduce' && !printing.value && !route.meta.hideLiveCursors)
</script>
