<template>
  <div class="cursor-session" data-live-demo>
    <p role="status" aria-live="polite">
      {{ isConnected ? t('site.demoConnected', { count: onlineCount }) : t('site.demoConnecting') }}
    </p>
    <div
      class="cursor-miniature"
      role="img"
      :aria-label="t('site.demoMap')"
    >
      <div class="miniature-header" aria-hidden="true" />
      <div class="miniature-hero" aria-hidden="true" />
      <div class="miniature-lines" aria-hidden="true" />
      <UIcon
        v-for="marker in markers"
        :key="marker.id"
        name="i-lucide-mouse-pointer-2"
        class="miniature-cursor"
        aria-hidden="true"
        :style="{ left: `${marker.x}%`, top: `${marker.y}%`, color: marker.color }"
      />
    </div>
    <p class="cursor-session-hint">
      {{ t('site.demoWaiting') }}
    </p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { cursors, onlineCount, isConnected } = useLiveCursors()
onBeforeMount(() => {
  isConnected.value = false
  onlineCount.value = 0
  cursors.value = []
})
const mouse = useMouse()
const { width } = useWindowSize()
const pageHeight = shallowRef(1)
function measurePage() {
  pageHeight.value = Math.max(document.documentElement.scrollHeight, 1)
}
const pageRoot = shallowRef<HTMLElement>()
onMounted(() => {
  pageRoot.value = document.documentElement
  measurePage()
})
useResizeObserver(pageRoot, measurePage)
const markers = computed(() => [
  ...cursors.value.map((cursor) => ({ id: cursor.id, x: cursor.x * 100, y: cursor.y / pageHeight.value * 100, color: cursor.color })),
  { id: 'self', x: mouse.x.value / Math.max(width.value, 1) * 100, y: mouse.y.value / pageHeight.value * 100, color: 'var(--ui-primary)' },
].map((marker) => ({ ...marker, x: Math.max(2, Math.min(96, marker.x)), y: Math.max(2, Math.min(94, marker.y)) })))
</script>

<style scoped>
.cursor-session { margin-top: 1.25rem; font-size: .8rem; }
.cursor-miniature { height: 12rem; position: relative; overflow: hidden; border: 1px solid var(--ui-border-accented); border-radius: .4rem; background: var(--ui-bg-elevated); margin-top: .75rem; }
.miniature-header { height: 1.5rem; border-bottom: 1px solid var(--ui-border); }
.miniature-hero { width: 70%; margin: 1rem auto; height: 3rem; background: var(--ui-bg-muted); border-radius: .2rem; }
.miniature-lines { width: 70%; margin: auto; height: 4rem; border-block: 1px solid var(--ui-border); position: relative; }
.miniature-lines::after { content: ''; position: absolute; top: 50%; width: 100%; border-top: 1px solid var(--ui-border); }
.miniature-cursor { position: absolute; width: 1.3rem; height: 1.3rem; pointer-events: none; }
.cursor-session-hint { margin-top: .75rem !important; color: var(--ui-text-muted); }
</style>
