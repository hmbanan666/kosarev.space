<template>
  <svg
    class="sticker-filters"
    width="0"
    height="0"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <filter
        id="sticker-die-cut"
        primitiveUnits="objectBoundingBox"
        color-interpolation-filters="sRGB"
      >
        <feMorphology
          in="SourceAlpha"
          operator="dilate"
          radius=".016"
        />
        <feGaussianBlur stdDeviation=".005" />
        <feComponentTransfer result="rim">
          <feFuncA
            type="linear"
            slope="2"
            intercept="-.35"
          />
        </feComponentTransfer>
        <feFlood flood-color="var(--sticker-outline)" />
        <feComposite in2="rim" operator="in" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
  <div
    v-if="enabled"
    ref="layer"
    class="sticker-layer"
    :style="{ ...timings, '--paper-width': `${homeSheet.width}px`, '--paper-height': `${homeSheet.height}px` }"
    :class="{ 'is-editing': open, 'is-carrying': draft }"
    :inert="!open"
    role="group"
    :aria-label="t('stickers.title')"
    :aria-describedby="draft ? 'sticker-help' : undefined"
    tabindex="-1"
    @keydown="keys"
    @click.stop
  >
    <button
      v-for="item in board.artwork"
      :key="item.id"
      type="button"
      class="sticker"
      :class="{ 'is-lifted': draft?.id === item.id, 'is-peeling': board.lifted === item.id, 'is-landed': board.landed === item.id }"
      :data-sticker="item.id"
      :style="{ 'transform': `translate3d(${item.x * space.width}px, ${item.y * space.height}px, 0) translate(-50%, -50%)`, '--paper-image': `url(/stickers/${item.id}.webp)`, '--angle': `${item.rotation}deg` }"
      :tabindex="open && !draft ? 0 : -1"
      :aria-label="t('stickers.move', { name: name(item.id) })"
      @click.stop="!draft && lift(item.id)"
    >
      <span
        class="paper-travel"
        :style="paperStyle(item)"
        aria-hidden="true"
      >
        <span class="paper-angle">
          <span class="paper">
            <span class="paper-face" />
            <span class="paper-corner">
              <span class="paper-fold" />
              <span class="paper-tip" />
            </span>
          </span>
        </span>
      </span>
    </button>
  </div>
  <div
    v-else-if="placed.length"
    class="sticker-strip"
    role="group"
    :aria-label="t('stickers.title')"
  >
    <img
      v-for="item in placed"
      :key="item.id"
      :src="`/stickers/${item.id}.webp`"
      :alt="name(item.id)"
      :style="{ rotate: `${item.rotation}deg` }"
      width="62"
      height="62"
    >
  </div>
  <Teleport v-if="enabled && dock" :to="dock">
    <div class="sticker-tools">
      <button
        ref="toggle"
        type="button"
        class="sheet-toggle"
        :aria-expanded="open"
        aria-controls="sticker-sheet"
        @click="open ? close() : open = true"
      >
        <UIcon name="i-lucide-sticker" aria-hidden="true" />{{ t('stickers.title') }}
      </button>
      <div
        v-show="open"
        id="sticker-sheet"
        ref="tray"
        class="sticker-sheet"
        role="group"
        :aria-label="t('stickers.sheet')"
      >
        <div class="sheet-heading">
          <strong>{{ draft ? t('stickers.placing') : t('stickers.sheet') }}</strong>
          <button
            type="button"
            :aria-label="t('stickers.close')"
            @click="close(); toggle?.focus()"
          >
            <UIcon name="i-lucide-x" aria-hidden="true" />
          </button>
        </div>
        <div v-show="!draft" class="sheet-grid">
          <button
            v-for="id in ids"
            :key="id"
            type="button"
            :data-pick="id"
            :class="{ 'on-board': isPlaced(id) }"
            :aria-label="t(isPlaced(id) ? 'stickers.move' : 'stickers.pick', { name: name(id) })"
            @click="lift(id)"
          >
            <img
              :src="`/stickers/${id}.webp`"
              alt=""
              draggable="false"
            >
          </button>
        </div>
        <p
          v-if="draft"
          id="sticker-help"
          class="sr-only"
        >
          {{ t('stickers.keyboard') }}
        </p>
        <div v-if="draft" class="sheet-actions">
          <button
            v-if="isPlaced(draft.id)"
            type="button"
            @click="finish('remove')"
          >
            {{ t('stickers.remove') }}
          </button>
          <button type="button" @click="finish('cancel')">
            {{ t('stickers.cancel') }}
          </button>
        </div>
      </div>
      <span role="status" class="sr-only">{{ message }}</span>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { StickerHost } from '~/composables/useStickerSheet'
import type { PlacedSticker } from '~/utils/stickers/board'
import type { StickerId } from '~/utils/stickers/home-sheet'
import { homeSheet, ids } from '~/utils/stickers/home-sheet'
import { paperMotion } from '~/utils/stickers/motion'

const props = defineProps<StickerHost & { dock: HTMLElement | null }>()
const timings = { '--lift-time': `${paperMotion.liftMs}ms`, '--press-time': `${paperMotion.pressMs}ms` }
const { t } = useI18n()
const open = ref(false)
const layer = useTemplateRef<HTMLElement>('layer')
const toggle = useTemplateRef<HTMLButtonElement>('toggle')
const tray = useTemplateRef<HTMLElement>('tray')
const { board, cancel } = useStickerSheet(props, open, layer)
const placed = computed(() => board.placed)
const draft = computed(() => board.draft)
const name = (id: StickerId) => t(`stickers.${id}`)
const isPlaced = (id: StickerId) => placed.value.some((s) => s.id === id)
function paperStyle(item: PlacedSticker<StickerId>) {
  const pose = board.pose(item, props.space)
  if (pose) {
    return {
      '--lag-x': `${pose.x}px`,
      '--lag-y': `${pose.y}px`,
      '--roll': `${pose.roll}deg`,
      '--pitch': `${pose.pitch}deg`,
      '--side': board.corner,
    }
  }
  if (board.landed === item.id) {
    return { '--side': board.corner }
  }
}
const message = ref('')

watch(() => board.draft?.id, (id, previous) => {
  if (id) {
    message.value = t('stickers.lifted', { name: name(id) })
  } else if (previous && open.value) {
    nextTick(() => {
      if (open.value && document.hasFocus()) {
        tray.value?.querySelector<HTMLButtonElement>(`[data-pick="${previous}"]`)?.focus({ preventScroll: true })
      }
    })
  }
}, { flush: 'sync' })
watch(placed, () => {
  const id = draft.value?.id
  if (id && isPlaced(id)) {
    message.value = t('stickers.placed', { name: name(id) })
  }
}, { flush: 'sync' })

function close() {
  cancel()
  open.value = false
  message.value = ''
}
watch(() => props.enabled && !props.suspended, (available) => {
  if (!available) {
    close()
  }
})
function lift(id: StickerId) {
  const view = props.viewport!.getBoundingClientRect()
  props.space.refresh()
  board.pick(id, { x: view.left + view.width / 2, y: view.top + view.height / 2 }, props.space)
  layer.value?.focus({ preventScroll: true })
}
function finish(action: 'stick' | 'remove' | 'cancel') {
  const item = draft.value
  if (!item) {
    return
  }
  if (action === 'cancel') {
    cancel()
    message.value = ''
  } else {
    board.finish(action)
    if (action === 'remove') {
      message.value = t('stickers.removed', { name: name(item.id) })
    }
  }
}
function keys(event: KeyboardEvent) {
  if (!draft.value) {
    return
  }
  const arrows: Record<string, [number, number]> = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }
  const delta = arrows[event.key]
  if (delta) {
    board.nudge(...delta, props.space)
    message.value = t('stickers.position', { x: Math.round(draft.value.x * 100), y: Math.round(draft.value.y * 100) })
    nextTick(() => layer.value?.querySelector('.is-lifted')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }))
  } else if (event.key === 'Enter' || event.key === ' ') {
    finish('stick')
  } else if (event.key === 'Delete' && isPlaced(draft.value.id)) {
    finish('remove')
  } else if (event.key === 'Tab') {
    tray.value?.querySelector<HTMLButtonElement>('.sheet-actions button')?.focus()
  } else {
    return
  }
  event.preventDefault()
  event.stopPropagation()
}
useEventListener('pointerdown', (event: PointerEvent) => {
  const path = event.composedPath()
  if (open.value && ![tray.value, toggle.value, layer.value].some((el) => el && path.includes(el))) {
    close()
  }
}, { capture: true })
useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key !== 'Escape' || props.suspended) {
    return
  }
  if (draft.value) {
    finish('cancel')
  } else if (open.value) {
    close()
    toggle.value?.focus()
  } else {
    cancel()
  }
})
</script>

<style scoped>
.sticker-filters { position: absolute; pointer-events: none; }
.sticker-layer { position: absolute; inset: 0; z-index: 3; pointer-events: none; outline: 0; }
.sticker-layer.is-carrying { pointer-events: auto; cursor: crosshair; touch-action: none; }
.sticker { position: absolute; top: 0; left: 0; width: var(--paper-width); height: var(--paper-height); pointer-events: none; user-select: none; touch-action: none; }
.paper-travel, .paper-angle, .paper, .paper-face, .paper-corner, .paper-fold, .paper-tip { position: absolute; inset: 0; pointer-events: none; }
.paper-angle { transform: rotate(var(--angle)); }
.paper, .sheet-grid img, .sticker-strip img {
  --die-cut: url(#sticker-die-cut);
  filter: var(--die-cut);
}
.sheet-grid img, .sticker-strip img { filter: var(--die-cut) drop-shadow(0 1px 1px #0007); }
.paper-angle {
  --rest-shadow: drop-shadow(0 1px 1px #0007);
  --lift-shadow: drop-shadow(3px 11px 5px #0009);
  filter: var(--rest-shadow);
  transition: filter var(--lift-time) ease-out;
}
.is-landed .paper-angle { animation: press-shadow var(--press-time) ease-out; }
@keyframes press-shadow {
  from { filter: var(--lift-shadow); }
  35% { filter: drop-shadow(0 0 .2px #0003); }
  to { filter: var(--rest-shadow); }
}
.paper-face, .paper-fold, .paper-tip { background: var(--paper-image) center / contain no-repeat; }
.paper-corner { display: none; }
.is-editing .sticker { pointer-events: auto; cursor: grab; }
.is-carrying .sticker { pointer-events: none; }
.sticker:is(.is-peeling, .is-landed) { z-index: 1; }
.is-peeling .paper-angle { filter: var(--lift-shadow); }
.sticker-tools { position: relative; width: max-content; }
.sheet-toggle, .sheet-heading button, .sheet-actions button { cursor: pointer; display: inline-flex; align-items: center; justify-content: center; min-height: 32px; }
.sheet-toggle { gap: 6px; padding: 0 8px; color: var(--ui-text-toned); border: 1px solid var(--ui-border); }
.sheet-toggle[aria-expanded=true], .sheet-toggle:hover { border-color: var(--ui-primary); color: var(--ui-primary); }
.sticker-sheet { position: absolute; left: 0; bottom: calc(100% + 12px); z-index: 5; width: 304px; max-height: calc(100dvh - 8rem); overflow-y: auto; padding: 12px; background: #171715; border: 1px solid #655b49; box-shadow: 0 10px 28px #0006; color: var(--ui-text-toned); }
.sheet-heading, .sheet-actions { display: flex; justify-content: space-between; align-items: center; }
.sheet-heading { margin-bottom: 8px; font: .85rem var(--font-mono); }
.sheet-heading button { width: 32px; font-size: 16px; }
.sheet-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-left: 1px solid #49453c; border-top: 1px solid #49453c; }
.sheet-grid button { position: relative; display: grid; justify-items: center; align-content: center; min-height: 84px; border: solid #49453c; border-width: 0 1px 1px 0; cursor: pointer; }
.sheet-grid img { width: 72px; height: 72px; }
.sheet-grid .on-board img { opacity: .78; }
.sheet-grid .on-board::before { content: ''; position: absolute; top: 6px; right: 6px; width: 4px; height: 4px; background: var(--ui-primary); }
.sheet-grid button:is(:hover, :focus-visible) { background: #d9ad6717; color: var(--ui-primary); }
.sheet-actions { margin-top: 8px; justify-content: flex-start; gap: 16px; }
.sheet-actions button { color: var(--ui-primary); text-decoration: underline; text-underline-offset: 3px; }
.sticker-strip { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; padding-block: 12px; }
@media (prefers-reduced-motion: no-preference) {
  .paper-travel {
    transform: translate3d(var(--lag-x, 0px), var(--lag-y, 0px), 0) perspective(450px)
      rotateX(var(--pitch, 0deg)) rotateY(var(--roll, 0deg)) rotate(calc(var(--roll, 0deg) * .65));
    --side: 1;
    --near: calc(50% + var(--side) * 50%);
    --far: calc(100% - var(--near));
    --hinge: calc(50% - var(--side) * 6%);
    --tip: calc(50% + var(--side) * 16%);
  }
  .paper {
    --lift-pose: perspective(450px) translateY(-4px) rotateX(6deg) rotateY(calc(-4deg * var(--side))) rotate(calc(-2deg * var(--side)));
    transition: transform var(--lift-time) ease-out;
  }
  .is-peeling .paper { transform: var(--lift-pose); }
  /* Two shallow bends share their hinge lines with the adjacent print. */
  .paper-face { clip-path: polygon(var(--far) 0, var(--hinge) 0, var(--near) 56%, var(--near) 100%, var(--far) 100%); }
  .paper-corner { display: block; transform-origin: var(--hinge) 0; }
  .paper-fold { clip-path: polygon(calc(var(--hinge) - var(--side) * .5%) 0, var(--tip) 0, var(--near) 34%, var(--near) 56.5%); }
  .paper-tip { clip-path: polygon(calc(var(--tip) - var(--side) * .5%) 0, var(--near) 0, var(--near) 34.5%); transform-origin: var(--tip) 0; }
  .paper-corner, .paper-tip { transition: transform var(--lift-time) ease-out; }
  .is-peeling .paper-corner { transform: perspective(420px) rotate3d(var(--side), 1, 0, calc(-19deg * var(--side) - var(--roll, 0deg) * .8 - var(--pitch, 0deg) * var(--side) * .5)); }
  .is-peeling .paper-tip { transform: rotate3d(var(--side), 1, 0, calc(-21deg * var(--side))); }
  .paper-fold::after, .paper-tip::after {
    content: ''; position: absolute; inset: 0; opacity: 0;
    background: linear-gradient(calc(45deg * var(--side)), transparent 67%, #ffeecf66 79%, transparent 95%);
    mask: var(--paper-image) center / contain no-repeat;
    transition: opacity var(--lift-time) ease-out;
  }
  .is-peeling :is(.paper-fold, .paper-tip)::after { opacity: 1; }
  .is-landed .paper { animation: press-paper var(--press-time) both; }
  @keyframes press-paper {
    from { transform: var(--lift-pose); animation-timing-function: ease-in; }
    35% { transform: scale(.97, .935); animation-timing-function: ease-out; }
    72% { transform: scale(1.005, 1.009); }
    to { transform: none; }
  }
}
</style>
