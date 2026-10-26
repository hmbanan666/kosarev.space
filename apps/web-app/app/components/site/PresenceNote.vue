<template>
  <section class="site-section presence-note" aria-labelledby="presence-note-title">
    <div class="site-wrap presence-note-layout">
      <h2 id="presence-note-title">
        {{ t('site.presenceTitle') }}
      </h2>
      <div>
        <p>{{ t('site.presenceDescription') }}</p>
        <NuxtLink :to="localePath('/cases/kosarev-live-cursors')" class="site-text-link">
          {{ t('site.demoCase') }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
.presence-note { border-top: 1px solid var(--ui-border); }
.presence-note-layout { display: grid; grid-template-columns: 1fr 1.6fr; gap: 3.5rem; }
.presence-note-layout p { max-width: 62ch; margin-bottom: 1rem; color: var(--ui-text-toned); }
@media (max-width: 850px) { .presence-note-layout { grid-template-columns: 1fr; gap: 1.5rem; } }
</style>
