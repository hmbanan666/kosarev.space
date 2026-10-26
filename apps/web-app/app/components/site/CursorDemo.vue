<template>
  <section class="site-section cursor-demo" aria-labelledby="cursor-demo-title">
    <div class="site-wrap cursor-demo-layout">
      <div>
        <h2 id="cursor-demo-title">
          {{ t('site.demoTitle') }}
        </h2>
        <p>{{ t('site.demoDescription') }}</p>
        <NuxtLink :to="localePath('/cases/kosarev-live-cursors')" class="site-text-link">
          {{ t('site.demoCase') }}
        </NuxtLink>
      </div>
      <div>
        <ClientOnly>
          <button
            type="button"
            class="site-button site-button-secondary"
            :aria-pressed="active"
            :disabled="!eligible"
            @click="active = !active"
          >
            {{ active ? t('site.demoStop') : t('site.demoStart') }}
          </button>
          <p v-if="!eligible" class="cursor-demo-note">
            {{ t('site.demoRestricted') }}
          </p>
          <LazySiteCursorSession v-if="active && eligible" />
          <template #fallback>
            <p class="cursor-demo-note">
              {{ t('site.demoWaiting') }}
            </p>
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const active = shallowRef(false)
const finePointer = useMediaQuery('(pointer: fine)')
const reducedMotion = usePreferredReducedMotion()
const eligible = computed(() => finePointer.value && reducedMotion.value !== 'reduce')
watch(eligible, (value) => {
  if (!value) {
    active.value = false
  }
})
</script>

<style scoped>
.cursor-demo { border-top: 1px solid var(--ui-border); }
.cursor-demo-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; }
.cursor-demo-layout p { font-size: .9rem; margin-block: 1rem !important; max-width: 60ch; }
.cursor-demo-note { color: var(--ui-text-muted); font-size: .8rem !important; }
.cursor-demo button:disabled { opacity: .6; cursor: default; }
@media (max-width: 850px) { .cursor-demo-layout { grid-template-columns: 1fr; gap: 1.5rem; } }
</style>
