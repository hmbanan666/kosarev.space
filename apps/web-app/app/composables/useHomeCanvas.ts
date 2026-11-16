import type { CanvasBlock } from '~/utils/canvas-layout'
import { createCanvasLayout } from '~/utils/canvas-layout'
import { homeCanvas } from '~/utils/home-canvas'

export function useHomeCanvas(viewport: Ref<HTMLElement | null>, defaults: ComputedRef<CanvasBlock[]>) {
  const mounted = useMounted()
  const desktop = useMediaQuery('(min-width: 768px)')
  const enabled = computed(() => mounted.value && desktop.value)
  const storage = { getItem: (key: string) => localStorage.getItem(key), setItem: (key: string, value: string) => localStorage.setItem(key, value) }
  let layout = createCanvasLayout(defaults.value, homeCanvas, storage)
  const blocks = shallowRef(layout.blocks)
  const canUndo = ref(false)
  const feedback = ref('')
  const zoom = ref(1)
  const fitZoom = ref(1)
  const initialZoom = ref(1)
  const minZoom = ref(0.25)
  let defaultView = true
  const view = reactive({ x: 0, y: 0, width: 0, height: 0 })
  const width = ref(homeCanvas.columns * homeCanvas.cell - homeCanvas.gap)
  const height = ref(homeCanvas.rows * homeCanvas.cell - homeCanvas.gap)
  const cellWidth = computed(() => (width.value + homeCanvas.gap) / homeCanvas.columns)
  const cellHeight = computed(() => (height.value + homeCanvas.gap) / homeCanvas.rows)
  const target = ref<CanvasBlock | null>(null)
  const targetFits = computed(() => !target.value || layout.preview(target.value.id, target.value.x, target.value.y) !== null)
  const dragging = ref(false)
  let gesture: { id?: string, pointer: number, x: number, y: number, left: number, top: number, block?: CanvasBlock } | null = null
  let deferredLayout = false
  function updateDefaults() {
    if (gesture) {
      deferredLayout = true
      return
    }
    deferredLayout = false
    layout = createCanvasLayout(defaults.value, homeCanvas, storage)
    if (mounted.value) {
      layout.restore()
    }
    sync()
  }
  // Metadata refreshes must not interrupt a gesture on an unchanged grid.
  watch(() => JSON.stringify(defaults.value), updateDefaults)
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
  function resize() {
    if (enabled.value && viewport.value) {
      const gutter = Number.parseFloat(getComputedStyle(viewport.value).paddingLeft)
      const availableWidth = Math.max(1, viewport.value.clientWidth - 2 * gutter)
      const availableHeight = Math.max(1, viewport.value.clientHeight - 2 * gutter)
      // Start on the main cluster; the wider finite board extends beyond it.
      initialZoom.value = Math.min(1, availableWidth / (19 * homeCanvas.cell - homeCanvas.gap), availableHeight / (11 * homeCanvas.cell - homeCanvas.gap))
      width.value = (availableWidth / initialZoom.value + homeCanvas.gap) / 19 * homeCanvas.columns - homeCanvas.gap
      height.value = (availableHeight / initialZoom.value + homeCanvas.gap) / 11 * homeCanvas.rows - homeCanvas.gap
      fitZoom.value = Math.min(1, availableWidth / width.value, availableHeight / height.value)
      if (defaultView) {
        zoom.value = initialZoom.value
      } else {
        zoom.value = Math.max(minZoom.value, zoom.value)
      }
    }
    measure()
  }
  function recenter() {
    defaultView = true
    resize()
    zoom.value = initialZoom.value
    viewport.value?.scrollTo({ left: 0, top: 0, behavior: 'instant' })
    measure()
  }
  async function setZoom(value: number) {
    const center = { x: view.x + view.width / 2, y: view.y + view.height / 2 }
    defaultView = false
    zoom.value = Math.max(minZoom.value, Math.min(1.25, Math.round(value * 100) / 100))
    await nextTick()
    viewport.value?.scrollTo({ left: center.x * zoom.value - (viewport.value?.clientWidth ?? 0) / 2, top: center.y * zoom.value - (viewport.value?.clientHeight ?? 0) / 2 })
    measure()
  }
  function start(event: PointerEvent, id?: string) {
    if (gesture || !event.isPrimary || !enabled.value || event.button !== 0 || !viewport.value) {
      return
    }
    if (!id && (event.target as HTMLElement).closest('a, button, input, select, summary, article')) {
      return
    }
    event.preventDefault()
    const block = blocks.value.find((block) => block.id === id)
    gesture = { id, pointer: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.value.scrollLeft, top: viewport.value.scrollTop, block }
    viewport.value.setPointerCapture(event.pointerId)
    dragging.value = false
  }
  function move(event: PointerEvent) {
    if (!gesture || event.pointerId !== gesture.pointer || !viewport.value) {
      return
    }
    const dx = event.clientX - gesture.x
    const dy = event.clientY - gesture.y
    if (!dragging.value && Math.hypot(dx, dy) < 6) {
      return
    }
    dragging.value = true
    if (gesture.block) {
      const block = gesture.block
      const candidate = { ...block, x: Math.max(0, Math.min(homeCanvas.columns - block.w, block.x + Math.round(dx / zoom.value / cellWidth.value))), y: Math.max(0, Math.min(homeCanvas.rows - block.h, block.y + Math.round(dy / zoom.value / cellHeight.value))) }
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
    if (!cancel && target.value && (target.value.x !== gesture.block?.x || target.value.y !== gesture.block?.y)) {
      feedback.value = layout.move(target.value.id, target.value.x, target.value.y) ? 'updated' : 'blocked'
      sync()
    }
    if (viewport.value?.hasPointerCapture(gesture.pointer)) {
      viewport.value.releasePointerCapture(gesture.pointer)
    }
    gesture = null
    target.value = null
    dragging.value = false
    if (deferredLayout) {
      updateDefaults()
    }
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
    viewport.value?.scrollTo((event.clientX - rect.left) / rect.width * width.value * zoom.value - view.width * zoom.value / 2, (event.clientY - rect.top) / rect.height * height.value * zoom.value - view.height * zoom.value / 2)
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
    const left = block.x * cellWidth.value * zoom.value
    const top = block.y * cellHeight.value * zoom.value
    if (left < el.scrollLeft || left + block.w * cellWidth.value * zoom.value > el.scrollLeft + el.clientWidth) {
      el.scrollLeft = left
    }
    if (top < el.scrollTop || top + block.h * cellHeight.value * zoom.value > el.scrollTop + el.clientHeight) {
      el.scrollTop = top
    }
  }
  function position(block: CanvasBlock) {
    return { left: `${block.x * cellWidth.value}px`, top: `${block.y * cellHeight.value}px`, width: `${block.w * cellWidth.value - homeCanvas.gap}px`, height: `${block.h * cellHeight.value - homeCanvas.gap}px` }
  }
  onMounted(() => {
    layout.restore()
    sync()
  })
  useResizeObserver(viewport, resize)
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
  return { enabled, blocks, canUndo, feedback, zoom, fitZoom, initialZoom, minZoom, view, width, height, cellWidth, cellHeight, target, targetFits, dragging, measure, recenter, setZoom, start, move, end, key, wheel, locate, reveal, position, reset: () => {
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
