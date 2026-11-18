<template>
  <div
    v-if="enabled"
    ref="layer"
    class="sticker-layer"
    :class="{ 'is-editing': open, 'is-carrying': draft }"
    :inert="!open"
    role="group"
    :aria-label="t('stickers.title')"
    :aria-describedby="draft ? 'sticker-help' : undefined"
    tabindex="-1"
    @pointerdown.stop="down"
    @pointermove.stop="follow"
    @pointerup.stop="up"
    @pointercancel.stop="cancelPointer"
    @lostpointercapture.stop="cancelPointer"
    @keydown="keys"
    @click.stop
  >
    <button
      v-for="item in artwork"
      :key="item.id"
      type="button"
      class="sticker"
      :class="{ 'is-lifted': draft?.id === item.id, 'is-landed': landed === item.id }"
      :data-sticker="item.id"
      :style="{ left: `${item.x * 100}%`, top: `${item.y * 100}%` }"
      :tabindex="open && !draft ? 0 : -1"
      :aria-label="t('stickers.move', { name: name(item.id) })"
      @click.stop="!draft && lift(item.id, item)"
    >
      <img
        :src="`/stickers/${item.id}.svg`"
        alt=""
        draggable="false"
      >
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
      :src="`/stickers/${item.id}.svg`"
      :alt="name(item.id)"
      width="62"
      height="47"
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
          <strong>{{ draft ? name(draft.id) : t('stickers.sheet') }}</strong>
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
            :class="{ 'on-board': isPlaced(id), 'is-chosen': draft?.id === id }"
            :aria-label="t(isPlaced(id) ? 'stickers.move' : 'stickers.pick', { name: name(id) })"
            @click="lift(id)"
          >
            <img
              :src="`/stickers/${id}.svg`"
              alt=""
              draggable="false"
            >
            <span>{{ name(id) }}</span>
          </button>
        </div>
        <p id="sticker-help">
          {{ t(draft ? 'stickers.placing' : 'stickers.choose') }}
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
import type { StickerPoint } from '~/composables/useStickerSheet'

const props = defineProps<{ enabled: boolean, dock: HTMLElement | null, viewport: HTMLElement | null, suspended: boolean }>()
const { t } = useI18n()
const ids = ['orbit', 'caliper', 'contours', 'prism', 'wave', 'compass', 'spool', 'section'] as const
type Id = typeof ids[number]
const { placed, draft, artwork, lift: liftSticker, move, finish: finishSticker } = useStickerSheet<Id>(ids, [
  { id: 'orbit', x: 0.36, y: 0.192 },
  { id: 'caliper', x: 0.263, y: 0.49 },
], 'portfolio-stickers-v1')

const open = ref(false)
const layer = useTemplateRef<HTMLElement>('layer')
const toggle = useTemplateRef<HTMLButtonElement>('toggle')
const tray = useTemplateRef<HTMLElement>('tray')
const message = ref('')
const name = (id: Id) => t(`stickers.${id}`)
const isPlaced = (id: Id) => placed.value.some((s) => s.id === id)
const landed = ref<Id | null>(null)
let gesture: { pointer: number, x: number, y: number, offset: StickerPoint, liftedHere: boolean } | undefined

function clearGesture() {
  const pointer = gesture?.pointer
  gesture = undefined
  if (pointer !== undefined && layer.value?.hasPointerCapture(pointer)) {
    layer.value.releasePointerCapture(pointer)
  }
}
function close() {
  clearGesture()
  finishSticker('cancel')
  open.value = false
  message.value = ''
}
watch(() => props.enabled && !props.suspended, (available) => {
  if (!available) {
    close()
  }
})

function bounded(point: StickerPoint): StickerPoint {
  const el = layer.value!
  const xInset = Math.min(0.5, 52 / el.clientWidth)
  const yInset = Math.min(0.5, 39 / el.clientHeight)
  return {
    x: Math.min(1 - xInset, Math.max(xInset, point.x)),
    y: Math.min(1 - yInset, Math.max(yInset, point.y)),
  }
}
function worldPoint(x: number, y: number): StickerPoint {
  const rect = layer.value!.getBoundingClientRect()
  return { x: (x - rect.left) / rect.width, y: (y - rect.top) / rect.height }
}
function lift(id: Id, point?: StickerPoint) {
  clearGesture()
  const view = props.viewport!.getBoundingClientRect()
  const origin = point ?? bounded(worldPoint(view.left + view.width / 2, view.top + view.height / 2))
  liftSticker(id, origin)
  landed.value = null
  message.value = t('stickers.lifted', { name: name(id) })
  layer.value?.focus({ preventScroll: true })
}
function finish(action: 'stick' | 'remove' | 'cancel') {
  const item = draft.value
  if (!item) {
    return
  }
  clearGesture()
  finishSticker(action)
  if (action === 'stick') {
    landed.value = item.id
    message.value = t('stickers.placed', { name: name(item.id) })
  } else if (action === 'remove') {
    message.value = t('stickers.removed', { name: name(item.id) })
  } else {
    message.value = ''
  }
  nextTick(() => tray.value?.querySelector<HTMLButtonElement>(`[data-pick="${item.id}"]`)?.focus({ preventScroll: true }))
}
function down(event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0 || gesture) {
    return
  }
  const el = layer.value!
  const liftedHere = !draft.value
  if (liftedHere) {
    const id = (event.target as HTMLElement).closest<HTMLElement>('[data-sticker]')?.dataset.sticker
    const item = placed.value.find((s) => s.id === id)
    if (!item) {
      return
    }
    lift(item.id, item)
  }
  event.preventDefault()
  const point = worldPoint(event.clientX, event.clientY)
  const offset = liftedHere ? { x: draft.value!.x - point.x, y: draft.value!.y - point.y } : { x: 0, y: 0 }
  gesture = { pointer: event.pointerId, x: event.clientX, y: event.clientY, offset, liftedHere }
  el.setPointerCapture(event.pointerId)
}
function follow(event: PointerEvent) {
  if (!draft.value || !event.isPrimary || (gesture && gesture.pointer !== event.pointerId)) {
    return
  }
  const point = worldPoint(event.clientX, event.clientY)
  move(bounded({ x: point.x + (gesture?.offset.x ?? 0), y: point.y + (gesture?.offset.y ?? 0) }))
}
function up(event: PointerEvent) {
  if (!gesture || gesture.pointer !== event.pointerId) {
    return
  }
  const travel = Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y)
  if (gesture.liftedHere && travel < 5) {
    clearGesture()
    return
  }
  follow(event)
  finish('stick')
}
function cancelPointer(event: PointerEvent) {
  if (gesture?.pointer === event.pointerId) {
    finish('cancel')
  }
}
function keys(event: KeyboardEvent) {
  if (!draft.value || !layer.value) {
    return
  }
  const { clientWidth, clientHeight } = layer.value
  const arrows: Record<string, StickerPoint> = {
    ArrowLeft: { x: -24 / clientWidth, y: 0 }, ArrowRight: { x: 24 / clientWidth, y: 0 },
    ArrowUp: { x: 0, y: -24 / clientHeight }, ArrowDown: { x: 0, y: 24 / clientHeight },
  }
  const delta = arrows[event.key]
  if (delta) {
    move(bounded({ x: draft.value.x + delta.x, y: draft.value.y + delta.y }))
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
  if (!open.value || event.key !== 'Escape' || props.suspended) {
    return
  }
  if (draft.value) {
    finish('cancel')
  } else {
    close()
    toggle.value?.focus()
  }
})
</script>

<style scoped>
.sticker-layer { position: absolute; inset: 0; z-index: 3; pointer-events: none; outline: 0; }
.sticker-layer.is-carrying { pointer-events: auto; cursor: crosshair; touch-action: none; }
.sticker { position: absolute; width: 104px; height: 78px; transform: translate(-50%, -50%); pointer-events: none; user-select: none; touch-action: none; }
.sticker img { width: 100%; height: 100%; filter: drop-shadow(0 2px 1px #0007); pointer-events: none; }
.sticker[data-sticker="caliper"] img { rotate: -13deg; }
.is-editing .sticker { pointer-events: auto; cursor: grab; }
.is-carrying .sticker { pointer-events: none; }
.sticker.is-lifted { z-index: 1; }
.is-lifted img { transform: rotate(-7deg) scale(1.08); filter: drop-shadow(5px 9px 3px #0008); }
.sticker-tools { position: relative; width: max-content; }
.sheet-toggle, .sheet-heading button, .sheet-actions button { cursor: pointer; display: inline-flex; align-items: center; justify-content: center; min-height: 32px; }
.sheet-toggle { gap: 6px; padding: 0 8px; color: var(--ui-text-toned); border: 1px solid var(--ui-border); }
.sheet-toggle[aria-expanded=true], .sheet-toggle:hover { border-color: var(--ui-primary); color: var(--ui-primary); }
.sticker-sheet { position: absolute; left: 0; bottom: calc(100% + 12px); z-index: 5; width: 404px; padding: 12px; background: #171715; border: 1px solid #655b49; box-shadow: 0 10px 28px #0006; color: var(--ui-text-toned); }
.sheet-heading, .sheet-actions { display: flex; justify-content: space-between; align-items: center; }
.sheet-heading { margin-bottom: 8px; font: .85rem var(--font-mono); }
.sheet-heading button { width: 32px; font-size: 16px; }
.sheet-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-left: 1px solid #49453c; border-top: 1px solid #49453c; }
.sheet-grid button { position: relative; display: grid; justify-items: center; align-content: center; gap: 3px; height: 76px; border: solid #49453c; border-width: 0 1px 1px 0; font-size: 11px; cursor: pointer; }
.sheet-grid img { width: 54px; height: 41px; }
.sheet-grid .on-board img { opacity: .5; }
.sheet-grid .on-board::before { content: ''; position: absolute; top: 6px; right: 6px; width: 4px; height: 4px; background: var(--ui-primary); }
.sheet-grid button:is(:hover, :focus-visible, .is-chosen) { background: #d9ad6717; color: var(--ui-primary); }
.sticker-sheet p { margin-top: 12px; color: var(--ui-text-muted); line-height: 1.5; }
.sheet-actions { margin-top: 8px; justify-content: flex-start; gap: 16px; }
.sheet-actions button { color: var(--ui-primary); text-decoration: underline; text-underline-offset: 3px; }
.sticker-strip { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; padding-block: 12px; }
@media (prefers-reduced-motion: no-preference) {
  .sticker img, .sheet-grid img { transition: transform 130ms ease, filter 130ms ease; transform-origin: 24% 80%; }
  .is-editing .sticker:not(.is-lifted):hover img, .sheet-grid button:hover img { transform: rotate(-4deg) translateY(-2px); }
  .is-landed img { animation: press-paper 220ms ease-out; }
  @keyframes press-paper {
    from { transform: rotate(-7deg) scale(1.08); }
    65% { transform: rotate(1deg) scale(.97); }
    to { transform: none; }
  }
}
@media (prefers-reduced-motion: reduce) {
  .is-lifted img { transform: none; }
}
</style>
