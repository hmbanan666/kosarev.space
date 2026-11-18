<template>
  <div
    v-if="enabled"
    ref="layer"
    class="sticker-layer"
    :style="{ '--paper-width': `${homeSheet.width}px`, '--paper-height': `${homeSheet.height}px` }"
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
      :class="{ 'is-lifted': draft?.id === item.id, 'is-landed': landed === item.id }"
      :data-sticker="item.id"
      :style="{ 'transform': `translate3d(${item.x * space.width}px, ${item.y * space.height}px, 0) translate(-50%, -50%)`, '--paper-image': `url(/stickers/${item.id}.webp)` }"
      :tabindex="open && !draft ? 0 : -1"
      :aria-label="t('stickers.move', { name: name(item.id) })"
      @click.stop="!draft && lift(item.id)"
    >
      <span class="paper" aria-hidden="true">
        <span class="paper-face" />
        <span class="paper-corner" />
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
              :src="`/stickers/${id}.webp`"
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
import type { StickerHost } from '~/composables/useStickerSheet'
import type { StickerId } from '~/utils/stickers/home-sheet'
import { homeSheet, ids } from '~/utils/stickers/home-sheet'

const props = defineProps<StickerHost & { dock: HTMLElement | null }>()
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
const landed = ref<StickerId | null>(null)
const message = ref('')

watch(() => board.draft?.id, (id, previous) => {
  if (id) {
    landed.value = null
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
    landed.value = id
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
.sticker-layer { position: absolute; inset: 0; z-index: 3; pointer-events: none; outline: 0; }
.sticker-layer.is-carrying { pointer-events: auto; cursor: crosshair; touch-action: none; }
.sticker { position: absolute; top: 0; left: 0; width: var(--paper-width); height: var(--paper-height); pointer-events: none; user-select: none; touch-action: none; }
.paper, .paper-face, .paper-corner { position: absolute; inset: 0; pointer-events: none; }
.paper, .sheet-grid img, .sticker-strip img {
  --rim: 2px;
  --die-cut: drop-shadow(var(--rim) 0 0 white) drop-shadow(calc(-1 * var(--rim)) 0 0 white)
    drop-shadow(0 var(--rim) 0 white) drop-shadow(0 calc(-1 * var(--rim)) 0 white);
  filter: var(--die-cut) drop-shadow(0 2px 1.5px #0009);
}
.sheet-grid img, .sticker-strip img { --rim: 1px; }
.paper-face, .paper-corner { background: var(--paper-image) center / contain no-repeat; }
/* Both halves share a diagonal hinge through the printed upper-right edge. */
.paper-face { clip-path: polygon(0 0, 50% 0, 100% 75%, 100% 100%, 0 100%); }
.paper-corner { clip-path: polygon(49.5% 0, 100% 0, 100% 76%); transform-origin: 50% 0; }
.paper-corner::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 45%, #fff4cd 76%, #a49c87); mask: var(--paper-image) center / contain no-repeat; opacity: 0; }
.is-editing .sticker { pointer-events: auto; cursor: grab; }
.is-carrying .sticker { pointer-events: none; }
.sticker.is-lifted { z-index: 1; }
.is-lifted .paper { filter: var(--die-cut) drop-shadow(4px 9px 4px #0009); }
.sticker-tools { position: relative; width: max-content; }
.sheet-toggle, .sheet-heading button, .sheet-actions button { cursor: pointer; display: inline-flex; align-items: center; justify-content: center; min-height: 32px; }
.sheet-toggle { gap: 6px; padding: 0 8px; color: var(--ui-text-toned); border: 1px solid var(--ui-border); }
.sheet-toggle[aria-expanded=true], .sheet-toggle:hover { border-color: var(--ui-primary); color: var(--ui-primary); }
.sticker-sheet { position: absolute; left: 0; bottom: calc(100% + 12px); z-index: 5; width: 404px; padding: 12px; background: #171715; border: 1px solid #655b49; box-shadow: 0 10px 28px #0006; color: var(--ui-text-toned); }
.sheet-heading, .sheet-actions { display: flex; justify-content: space-between; align-items: center; }
.sheet-heading { margin-bottom: 8px; font: .85rem var(--font-mono); }
.sheet-heading button { width: 32px; font-size: 16px; }
.sheet-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-left: 1px solid #49453c; border-top: 1px solid #49453c; }
.sheet-grid button { position: relative; display: grid; justify-items: center; align-content: center; gap: 3px; height: 76px; border: solid #49453c; border-width: 0 1px 1px 0; font-size: 11px; cursor: pointer; }
.sheet-grid img { width: 48px; height: 48px; }
.sheet-grid .on-board img { opacity: .78; }
.sheet-grid .on-board::before { content: ''; position: absolute; top: 6px; right: 6px; width: 4px; height: 4px; background: var(--ui-primary); }
.sheet-grid button:is(:hover, :focus-visible, .is-chosen) { background: #d9ad6717; color: var(--ui-primary); }
.sticker-sheet p { margin-top: 12px; color: var(--ui-text-muted); line-height: 1.5; }
.sheet-actions { margin-top: 8px; justify-content: flex-start; gap: 16px; }
.sheet-actions button { color: var(--ui-primary); text-decoration: underline; text-underline-offset: 3px; }
.sticker-strip { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; padding-block: 12px; }
@media (prefers-reduced-motion: no-preference) {
  .paper { transform-origin: 20% 78%; transition: filter 150ms ease-out, transform 160ms ease-out; }
  .paper-corner { transition: transform 140ms ease-out; }
  .paper-corner::after { transition: opacity 140ms ease-out; }
  .is-lifted .paper { transform: perspective(260px) translateY(-3px) rotateX(9deg) rotate(-4deg); }
  .is-lifted .paper-corner { transform: perspective(140px) rotate3d(2, 3, 0, -39deg); }
  .is-lifted .paper-corner::after { opacity: .85; }
  .is-landed .paper { animation: press-paper 210ms ease-out; }
  @keyframes press-paper {
    from { transform: perspective(260px) translateY(-3px) rotateX(9deg) rotate(-4deg); }
    72% { transform: scale(1.014, .982); }
    to { transform: none; }
  }
}
</style>
