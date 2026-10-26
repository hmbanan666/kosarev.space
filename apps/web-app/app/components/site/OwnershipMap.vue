<template>
  <nav class="ownership-map" :aria-label="t('site.mapLabel')">
    <p class="ownership-map-title">
      {{ t('site.mapTitle') }}
    </p>
    <div class="ownership-path">
      <NuxtLink
        v-for="layer in layers"
        :key="layer.key"
        :to="{ path: localePath('/'), query: { focus: layer.key }, hash: '#skills' }"
        class="ownership-layer"
      >
        <UIcon :name="layer.icon" aria-hidden="true" />
        <span><strong>{{ t(`site.layers.${layer.key}.title`) }}</strong><small>{{ t(`site.layers.${layer.key}.text`) }}</small></span>
        <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
      </NuxtLink>
    </div>
    <p class="ownership-caption">
      {{ t('site.mapCaption') }}
    </p>
  </nav>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const layers = [
  { key: 'interface', icon: 'i-lucide-panels-top-left' },
  { key: 'systems', icon: 'i-lucide-workflow' },
  { key: 'delivery', icon: 'i-lucide-server' },
]
</script>

<style scoped>
.ownership-map { padding: 2rem; color: var(--site-paper); background: var(--site-blue); border-radius: .6rem 2.5rem .6rem .6rem; }
.ownership-map-title { font: 500 1.35rem/1.4 var(--font-serif); max-width: 23ch; }
.ownership-path { margin-block: 1.75rem; display: grid; gap: 1rem; position: relative; }
.ownership-path::before { content: ''; position: absolute; left: 1.5rem; top: 1rem; bottom: 1.5rem; border-left: 1px solid var(--site-glass); }
.ownership-layer { display: flex; gap: 1rem; align-items: center; position: relative; padding: .9rem 1rem; background: var(--site-blue); border: 1px solid var(--site-glass); border-radius: .35rem; }
.ownership-layer:nth-child(2) { margin-left: 1.5rem; }
.ownership-layer:nth-child(3) { margin-left: 3rem; }
.ownership-layer strong { font: 550 1rem/1.4 var(--font-sans); display: block; }
.ownership-layer small { display: block; font-size: .75rem; color: var(--site-line); }
.ownership-layer > .iconify { flex-shrink: 0; }
.ownership-layer > .iconify:last-child { margin-left: auto; }
.ownership-layer:hover { background: color-mix(in srgb, var(--site-paper) 8%, var(--site-blue)); }
.ownership-caption { font-size: .8rem; max-width: 45ch; color: var(--site-line); }
@media (max-width: 600px) {
  .ownership-map { padding: 1.5rem; }
  .ownership-layer { padding: .65rem .75rem; gap: .5rem; }
  .ownership-layer > .iconify:first-child { display: none; }
  .ownership-layer:nth-child(2) { margin-left: .5rem; }
  .ownership-layer:nth-child(3) { margin-left: 1rem; }
  .ownership-layer span { min-width: 0; }
  .ownership-layer strong { overflow-wrap: anywhere; }
  .ownership-path { margin-block: 1.25rem; }
}
</style>
