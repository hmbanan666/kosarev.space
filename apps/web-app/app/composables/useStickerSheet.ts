import type { Paper, PlacedSticker, StickerSpace } from '~/utils/stickers/board'
import type { StickerId } from '~/utils/stickers/home-sheet'
import { advancePaper, paperPose, StickerBoard } from '~/utils/stickers/board'
import { homeSheet, isStickerKind } from '~/utils/stickers/home-sheet'

export interface StickerHost {
  viewport: HTMLElement | null
  space: StickerSpace & { refresh: () => void }
  enabled: boolean
  suspended: boolean
  reservesDrag: (target: Element) => boolean
}

export function useStickerSheet(host: StickerHost, open: Ref<boolean>, layer: Ref<HTMLElement | null>, tray: Ref<HTMLElement | null>) {
  const shared = inject(sharedBoardKey)!
  const board = shallowReactive(new StickerBoard(homeSheet, (action, item) => {
    shared.finish(action === 'stick' ? 'drop' : action, item)
  }))
  const artwork = computed(() => visibleStickers(board.artwork, shared.remote.value)
    .filter((s): s is PlacedSticker<StickerId> => isStickerKind(s.kind)))
  const remotePapers = shallowReactive(new Map<string, Paper>())
  const reducedMotion = usePreferredReducedMotion()
  let frame = 0
  let last = 0
  function animate(now: number) {
    const elapsed = Math.max(0, now - last)
    let moving = board.frame(elapsed, host.space)
    for (const [id, paper] of remotePapers) {
      const item = artwork.value.find((s) => s.id === id)
      const next = item && advancePaper(paper, item, host.space, elapsed)
      if (next) {
        remotePapers.set(id, next)
        moving = true
      } else {
        remotePapers.delete(id)
      }
    }
    last = now
    frame = moving ? requestAnimationFrame(animate) : 0
  }
  function schedule() {
    if (reducedMotion.value === 'reduce') {
      board.settlePaper()
    }
    if ((!board.paper && !remotePapers.size) || reducedMotion.value === 'reduce') {
      cancelAnimationFrame(frame)
      frame = 0
    } else if (!frame) {
      last = performance.now()
      frame = requestAnimationFrame(animate)
    }
  }
  watch([() => board.draft, () => board.landed, reducedMotion], schedule)
  watch(shared.state, (state) => {
    if (state) {
      board.placed = state.stickers.filter((s): s is PlacedSticker<StickerId> => isStickerKind(s.kind))
    }
  }, { immediate: true })
  watch(artwork, (_, previous) => {
    for (const item of shared.remote.value) {
      const prior = previous.find((s) => s.id === item.id)
      if (prior && !remotePapers.has(item.id) && (prior.x !== item.x || prior.y !== item.y)) {
        remotePapers.set(item.id, { ...prior, vx: 0, vy: 0 })
      }
    }
    schedule()
  })
  onBeforeUnmount(() => cancelAnimationFrame(frame))
  function pose(item: PlacedSticker<StickerId>) {
    return board.pose(item, host.space) ?? paperPose(remotePapers.get(item.id) ?? null, item, host.space)
  }
  function lift(id: string, kind: StickerId) {
    if (!host.viewport) {
      return
    }
    host.space.refresh()
    const view = host.viewport.getBoundingClientRect()
    const draft = board.pick(id, kind, { x: view.left + view.width / 2, y: view.top + view.height / 2 }, host.space)
    if (draft && !shared.begin(draft)) {
      board.finish('cancel')
    } else if (draft) {
      layer.value?.focus({ preventScroll: true })
    }
  }

  function selectKind(kind: StickerId) {
    const item = board.placedKind(kind)
    if (item) {
      if (shared.begin(item)) {
        board.removeKind(kind)
      }
    } else {
      lift(crypto.randomUUID(), kind)
    }
  }
  const sheetBounds = () => tray.value?.getClientRects()[0]

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
      const item = board.draft ?? board.placed.find((s) => s.id === board.lifted)!
      if (shared.active.value?.id !== item.id && !shared.begin(item)) {
        board.finish('cancel')
        return
      }
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
    if (board.move(sample(e), host.space, sheetBounds()) && board.pointerId === e.pointerId) {
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
      const result = board.up(sample(e), host.space, sheetBounds())
      swallowClick = result !== 'host'
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
  watch(() => board.draft, (draft) => {
    if (draft) {
      shared.preview(draft)
    }
  }, { flush: 'sync' })
  watch(shared.active, (active) => {
    if (!active && board.lifted) {
      cancel()
    }
  })
  useEventListener('blur', cancel)
  onBeforeUnmount(cancel)
  return { board, artwork, cancel, lift, selectKind, pose, remote: shared.remote, landed: shared.landed }
}
