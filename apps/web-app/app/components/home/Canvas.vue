<template>
  <section
    class="home-canvas"
    :class="{ 'canvas-enabled': enabled }"
    :aria-label="t('canvas.title')"
  >
    <div class="canvas-heading">
      <BlueprintMark kind="zone">
        01 / {{ t('canvas.title') }}
      </BlueprintMark>
      <p v-if="enabled" id="canvas-help">
        {{ t('canvas.help') }}
      </p>
      <BlueprintMark kind="title">
        <span>kosarev.space</span>
        <span>01 / {{ homeCanvas.columns }} × {{ homeCanvas.rows }}</span>
      </BlueprintMark>
    </div>
    <div
      ref="viewport"
      class="canvas-viewport"
      data-live-cursors-viewport
      :class="{ 'is-dragging': dragging }"
      :tabindex="enabled ? 0 : undefined"
      :role="enabled ? 'region' : undefined"
      :aria-label="t('canvas.title')"
      :aria-describedby="enabled ? 'canvas-help' : undefined"
      @scroll="measure"
      @pointerdown="start($event)"
      @pointermove="move"
      @pointerup="end()"
      @pointercancel="end(true)"
      @lostpointercapture="end(true)"
      @keydown="key($event)"
      @wheel="wheel"
      @focusin="reveal"
    >
      <div class="canvas-size" :style="enabled ? { width: `${width * zoom}px`, height: `${height * zoom}px` } : undefined">
        <div
          class="canvas-world"
          :data-canvas-world="enabled ? '' : undefined"
          :style="enabled ? { width: `${width}px`, height: `${height}px`, transform: `scale(${zoom})` } : undefined"
        >
          <BlueprintMark kind="ruler" class="canvas-ruler" />
          <BlueprintMark
            v-for="corner in ['top-left', 'top-right', 'bottom-left', 'bottom-right']"
            :key="corner"
            kind="crosshair"
            class="canvas-crosshair"
            :class="`canvas-crosshair-${corner}`"
          />
          <BlueprintMark
            v-for="divider in dividers"
            :key="divider.key"
            kind="dimension"
            class="canvas-divider"
            :style="divider.style"
          />
          <template v-for="block in blocks" :key="block.id">
            <h2 v-if="mobileZones[block.id]" class="canvas-mobile-zone">
              {{ t(mobileZones[block.id]!) }}
            </h2>
            <BlueprintFrame
              :data-block="block.id"
              :class="[`canvas-block-${block.id}`, { 'canvas-moving': target?.id === block.id }]"
              :accent="block.id === 'hero'"
              :part="parts[block.id]"
              :style="enabled ? position(block) : undefined"
            >
              <button
                v-if="enabled"
                class="canvas-grip"
                type="button"
                :aria-label="`${t('canvas.move')}: ${blockLabel(block.id)}`"
                :title="t('canvas.moveHelp')"
                :aria-description="t('canvas.moveHelp')"
                @pointerdown.stop="start($event, block.id)"
                @keydown="key($event, block.id)"
              >
                <UIcon name="i-lucide-grip" aria-hidden="true" />
              </button>
              <HomeBlockContent :id="block.id" :latest="latest" />
              <BlueprintMark v-if="block.id === 'dostigus'" kind="hatching" />
            </BlueprintFrame>
          </template>
          <div
            v-if="target"
            class="canvas-target"
            :class="{ 'canvas-target-blocked': !targetFits }"
            :style="position(target)"
            aria-hidden="true"
          >
            <span>{{ target.x + 1 }} : {{ target.y + 1 }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="enabled" class="canvas-tools">
      <button
        class="canvas-minimap"
        :aria-label="t('canvas.minimap')"
        @click="locate"
        @keydown.enter.prevent="recenter"
        @keydown.space.prevent="recenter"
      >
        <svg :viewBox="`0 0 ${width} ${height}`" aria-hidden="true">
          <rect
            v-for="block in blocks"
            :key="block.id"
            :x="block.x * homeCanvas.cell"
            :y="block.y * homeCanvas.cell"
            :width="block.w * homeCanvas.cell - 16"
            :height="block.h * homeCanvas.cell - 16"
            class="minimap-block"
          />
          <rect
            :x="view.x"
            :y="view.y"
            :width="Math.min(view.width, width)"
            :height="Math.min(view.height, height)"
            class="minimap-view"
          />
        </svg>
      </button>
      <button type="button" @click="recenter">
        {{ t('canvas.recenter') }}
      </button>
      <div class="canvas-zoom">
        <button
          type="button"
          :aria-label="t('canvas.zoomOut')"
          :disabled="zoom <= .8"
          @click="setZoom(zoom - .05)"
        >
          −
        </button>
        <output :aria-label="t('canvas.zoom')">{{ Math.round(zoom * 100) }}%</output>
        <button
          type="button"
          :aria-label="t('canvas.zoomIn')"
          :disabled="zoom >= 1.25"
          @click="setZoom(zoom + .05)"
        >
          +
        </button>
      </div>
      <span class="canvas-local">{{ t('canvas.local') }}</span>
      <span class="sr-only" role="status">{{ feedback ? t(`canvas.${feedback}`) : '' }}</span>
      <button
        type="button"
        :disabled="!canUndo"
        @click="undo"
      >
        {{ t('canvas.undo') }}
      </button>
      <button type="button" @click="reset">
        {{ t('canvas.reset') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { sortPublications } from '~~/shared/publications'
import { homeCanvas } from '~/utils/home-canvas'

const { t } = useI18n()
const viewport = useTemplateRef<HTMLElement>('viewport')
const { enabled, blocks, canUndo, feedback, zoom, view, width, height, target, targetFits, dragging, measure, recenter, setZoom, start, move, end, key, wheel, locate, reveal, position, reset, undo } = useHomeCanvas(viewport)
const { data } = await usePublications()
// Follow the current block edges, including after a visitor rearranges the board.
const dividers = computed(() => blocks.value.filter((block) => ['hero', 'context', 'k39', 'writing'].includes(block.id) && block.y + block.h < homeCanvas.rows).map((block) => ({
  key: block.id,
  style: { left: `${block.x * homeCanvas.cell}px`, top: `${(block.y + block.h) * homeCanvas.cell - 9}px`, width: `${block.w * homeCanvas.cell - 16}px` },
})))
const parts: Record<string, string> = { hero: 'A / 01', context: 'B / 01', k39: 'B / 02', writing: 'C / 01' }
const latest = computed(() => sortPublications(data.value ?? [])[0])
const mobileZones: Record<string, string> = { hero: 'canvas.engineer', context: 'projects.title', writing: 'canvas.reading', cv: 'site.experience', live: 'canvas.now' }
function blockLabel(id: string) {
  const labels: Record<string, string> = { hero: t('hero.name'), cv: t('nav.cv'), contacts: t('hero.contact'), writing: t('writing.title'), live: 'Live', archive: t('canvas.archive'), now: t('canvas.now') }
  return labels[id] ?? [...activeProducts, ...pausedProjects].find((product) => product.key === id)?.title ?? id
}
</script>
