import type { CanvasBlock } from '~/utils/canvas-layout'
import { createCanvasLayout } from '~/utils/canvas-layout'
import { homeBlocks, homeCanvas } from '~/utils/home-canvas'

export function useHomeCanvas(viewport: Ref<HTMLElement | null>) {
  const mounted = useMounted()
  const desktop = useMediaQuery('(min-width: 768px)')
  const enabled = computed(() => mounted.value && desktop.value)
  const storage = { getItem: (key: string) => localStorage.getItem(key), setItem: (key: string, value: string) => localStorage.setItem(key, value) }
  const layout = createCanvasLayout(homeBlocks, homeCanvas, storage)
  const blocks = shallowRef(layout.blocks)
  const canUndo = ref(false)
  const feedback = ref('')
  const zoom = ref(1)
  const view = reactive({ x: 0, y: 0, width: 0, height: 0 })
  const width = homeCanvas.columns * homeCanvas.cell
  const height = homeCanvas.rows * homeCanvas.cell
  const target = ref<CanvasBlock | null>(null)
  const targetFits = computed(() => !target.value || layout.preview(target.value.id, target.value.x, target.value.y) !== null)
  const dragging = ref(false)
  let gesture: { id?: string, pointer: number, x: number, y: number, left: number, top: number, block?: CanvasBlock } | null = null
  function sync() {
    blocks.value = layout.blocks
    canUndo.value = layout.canUndo
  }
  function measure() {
    const el = viewport.value
    if (el) {
      Object.assign(view, { x: el.scrollLeft / zoom.value, y: el.scrollTop / zoom.value, width: el.clientWidth / zoom.value, height: el.clientHeight / zoom.value })
    }
    window.dispatchEvent(new Event('live-cursors:coordinates'))
  }
  function recenter() {
    viewport.value?.scrollTo({ left: 0, top: 0, behavior: 'instant' })
    measure()
  }
  async function setZoom(value: number) {
    const center = { x: view.x + view.width / 2, y: view.y + view.height / 2 }
    zoom.value = Math.max(0.8, Math.min(1.25, Math.round(value * 100) / 100))
    await nextTick()
    viewport.value?.scrollTo({ left: center.x * zoom.value - (viewport.value?.clientWidth ?? 0) / 2, top: center.y * zoom.value - (viewport.value?.clientHeight ?? 0) / 2 })
    measure()
  }
  function start(event: PointerEvent, id?: string) {
    if (!enabled.value || event.button !== 0 || !viewport.value) {
      return
    }
    if (!id && (event.target as HTMLElement).closest('a, button, input, select, summary, article')) {
      return
    }
    event.preventDefault()
    const block = blocks.value.find((block) => block.id === id)
    gesture = { id, pointer: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.value.scrollLeft, top: viewport.value.scrollTop, block }
    viewport.value.setPointerCapture(event.pointerId)
    dragging.value = true
    if (block) {
      target.value = { ...block }
    }
  }
  function move(event: PointerEvent) {
    if (!gesture || event.pointerId !== gesture.pointer || !viewport.value) {
      return
    }
    const dx = event.clientX - gesture.x
    const dy = event.clientY - gesture.y
    if (gesture.block) {
      const block = gesture.block
      const candidate = { ...block, x: Math.max(0, Math.min(homeCanvas.columns - block.w, block.x + Math.round(dx / zoom.value / homeCanvas.cell))), y: Math.max(0, Math.min(homeCanvas.rows - block.h, block.y + Math.round(dy / zoom.value / homeCanvas.cell))) }
      if (target.value?.x !== candidate.x || target.value?.y !== candidate.y) {
        target.value = candidate
      }
    } else {
      const el = viewport.value
      // Approach each hard limit with a short resistance zone, without overscroll.
      const resist = (value: number, max: number) => value < 24 ? Math.max(0, value * 0.65) : value > max - 24 ? Math.min(max, max - (max - value) * 0.65) : value
      el.scrollTo(resist(gesture.left - dx, el.scrollWidth - el.clientWidth), resist(gesture.top - dy, el.scrollHeight - el.clientHeight))
    }
  }
  function end(cancel = false) {
    if (!gesture) {
      return
    }
    if (!cancel && target.value) {
      feedback.value = layout.move(target.value.id, target.value.x, target.value.y) ? 'updated' : 'blocked'
      sync()
    }
    if (viewport.value?.hasPointerCapture(gesture.pointer)) {
      viewport.value.releasePointerCapture(gesture.pointer)
    }
    gesture = null
    target.value = null
    dragging.value = false
  }
  function key(event: KeyboardEvent, id?: string) {
    if (!enabled.value) {
      return
    }
    if (event.key === 'Escape') {
      end(true)
      return
    }
    const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
    const direction = directions[event.key]
    if (!direction) {
      return
    }
    if (!id && event.target !== viewport.value) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    if (id) {
      const block = blocks.value.find((block) => block.id === id)!
      feedback.value = layout.move(id, block.x + direction[0], block.y + direction[1]) ? 'updated' : 'blocked'
      sync()
    } else {
      viewport.value?.scrollBy(direction[0] * homeCanvas.cell, direction[1] * homeCanvas.cell)
    }
  }
  function wheel(event: WheelEvent) {
    if (!enabled.value) {
      return
    }
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      void setZoom(zoom.value - event.deltaY * 0.002)
    }
    // Ordinary wheels and trackpads retain native scroll and hard limits.
  }
  function locate(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    viewport.value?.scrollTo((event.clientX - rect.left) / rect.width * width * zoom.value - view.width * zoom.value / 2, (event.clientY - rect.top) / rect.height * height * zoom.value - view.height * zoom.value / 2)
  }
  async function reveal(event: FocusEvent) {
    if (!enabled.value) {
      return
    }
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-block]')
    const block = blocks.value.find((block) => block.id === element?.dataset.block)
    if (!block) {
      return
    }
    await nextTick()
    const el = viewport.value!
    const left = block.x * homeCanvas.cell * zoom.value
    const top = block.y * homeCanvas.cell * zoom.value
    if (left < el.scrollLeft || left + block.w * homeCanvas.cell * zoom.value > el.scrollLeft + el.clientWidth) {
      el.scrollLeft = left
    }
    if (top < el.scrollTop || top + block.h * homeCanvas.cell * zoom.value > el.scrollTop + el.clientHeight) {
      el.scrollTop = top
    }
  }
  function position(block: CanvasBlock) {
    return { left: `${block.x * homeCanvas.cell}px`, top: `${block.y * homeCanvas.cell}px`, width: `${block.w * homeCanvas.cell - 16}px`, height: `${block.h * homeCanvas.cell - 16}px` }
  }
  onMounted(() => {
    layout.restore()
    sync()
    zoom.value = window.innerWidth >= 1400 ? 0.85 : 1
  })
  useResizeObserver(viewport, measure)
  watch(enabled, async () => {
    end(true)
    await nextTick()
    recenter()
  })
  useEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      end(true)
    }
  })
  onBeforeUnmount(() => end(true))
  return { enabled, blocks, canUndo, feedback, zoom, view, width, height, target, targetFits, dragging, measure, recenter, setZoom, start, move, end, key, wheel, locate, reveal, position, reset: () => {
    layout.reset()
    feedback.value = 'updated'
    sync()
    recenter()
  }, undo: () => {
    layout.undo()
    feedback.value = 'updated'
    sync()
  } }
}
