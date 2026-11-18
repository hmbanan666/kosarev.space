import type { StickerSpace } from '~/utils/stickers/board'
import { StickerBoard } from '~/utils/stickers/board'
import { homeSheet, storageKey } from '~/utils/stickers/home-sheet'

export interface StickerHost {
  viewport: HTMLElement | null
  space: StickerSpace & { refresh: () => void }
  enabled: boolean
  suspended: boolean
  reservesDrag: (target: Element) => boolean
}

export function useStickerSheet(host: StickerHost, open: Ref<boolean>, layer: Ref<HTMLElement | null>) {
  const board = shallowReactive(new StickerBoard(homeSheet, {
    read: () => localStorage.getItem(storageKey),
    write: (value) => localStorage.setItem(storageKey, value),
  }))
  onMounted(() => board.restore())

  let swallowClick = false
  const sample = (e: PointerEvent) => ({ pointerId: e.pointerId, x: e.clientX, y: e.clientY })
  const viewport = computed(() => host.viewport)
  const capture = { capture: true } as const
  function cancel() {
    const id = board.pointerId
    if (id !== undefined) {
      swallowClick = true
    }
    board.finish('cancel')
    if (id !== undefined && viewport.value?.hasPointerCapture(id)) {
      viewport.value.releasePointerCapture(id)
    }
  }

  useEventListener(viewport, 'pointerdown', (e) => {
    if (!host.enabled || host.suspended || !e.isPrimary || e.button !== 0 || !(e.target instanceof Element)) {
      return
    }
    swallowClick = false
    host.space.refresh()
    const claim = board.down({
      ...sample(e),
      editing: open.value,
      touch: e.pointerType === 'touch',
      reserved: host.reservesDrag(e.target),
    }, host.space)
    if (claim !== 'host') {
      // Reserve the drag from the pan handler. The underlying card still sees its native press and click.
      e.preventDefault()
      if (claim === 'capture') {
        viewport.value?.setPointerCapture(e.pointerId)
      }
    }
  }, capture)

  useEventListener('pointermove', (e: PointerEvent) => {
    const following = board.draft && layer.value && e.composedPath().includes(layer.value)
    if (!e.isPrimary || (board.pointerId === undefined && !following)) {
      return
    }
    if (board.move(sample(e), host.space) && board.pointerId === e.pointerId) {
      swallowClick = true
      if (!viewport.value?.hasPointerCapture(e.pointerId)) {
        viewport.value?.setPointerCapture(e.pointerId)
      }
    }
  }, capture)
  useEventListener('pointerup', (e: PointerEvent) => {
    if (board.pointerId === e.pointerId) {
      // Native scroll can take effect before its scroll event reaches the host.
      host.space.refresh()
      const result = board.up(sample(e), host.space)
      swallowClick = result !== 'host'
      if (result === 'lifted') {
        layer.value?.focus({ preventScroll: true })
      }
    }
  }, capture)
  useEventListener(viewport, 'click', (e) => {
    if (swallowClick && e.detail > 0) {
      swallowClick = false
      e.preventDefault()
      e.stopImmediatePropagation()
    }
  }, capture)

  function interrupted(e: PointerEvent) {
    if (board.pointerId === e.pointerId) {
      cancel()
    }
  }
  useEventListener('pointercancel', interrupted, capture)
  useEventListener(viewport, 'lostpointercapture', (e) => {
    if (e.target === viewport.value) {
      interrupted(e)
    }
  })
  useEventListener('blur', cancel)
  onBeforeUnmount(cancel)
  return { board, cancel }
}
