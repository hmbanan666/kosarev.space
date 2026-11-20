<template>
  <div class="board-overview" aria-hidden="true">
    <span
      v-for="b in blocks"
      :key="b.id"
      :data-overview-block="b.id"
      :style="{ left: pct(b.x / homeCanvas.columns), top: pct(b.y / homeCanvas.rows), width: pct(b.w / homeCanvas.columns), height: pct(b.h / homeCanvas.rows) }"
    />
    <img
      v-for="s in stickers"
      :key="s.id"
      :src="`/stickers/${s.kind}.webp`"
      alt=""
      :style="{ left: pct(s.x), top: pct(s.y), rotate: `${s.rotation}deg` }"
    >
  </div>
</template>

<script setup lang="ts">
import type { CanvasBlock } from '~/utils/canvas-layout'
import { homeCanvas } from '~/utils/home-canvas'

defineProps<{ blocks: CanvasBlock[] }>()
const shared = inject(sharedBoardKey)!
const stickers = computed(() => visibleStickers(shared.state.value?.stickers ?? [], shared.remote.value))
const pct = (value: number) => `${100 * value}%`
</script>

<style scoped>
.board-overview { position: relative; aspect-ratio: 28 / 18; margin-bottom: 12px; border: 1px solid var(--ui-border); overflow: hidden; }
.board-overview span { position: absolute; background: var(--ui-bg); border: 1px solid var(--ui-border); }
.board-overview img { position: absolute; width: 6.5%; translate: -50% -50%; }
@media (prefers-reduced-motion: no-preference) {
  .board-overview > * { transition: left 60ms linear, top 60ms linear; }
}
</style>
