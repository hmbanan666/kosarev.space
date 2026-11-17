<template>
  <dialog
    ref="dialog"
    class="site-drawer"
    :class="{ 'site-drawer-fixed-body': fixedBody }"
    :aria-labelledby="titleId"
    :data-state="state"
    :style="viewportStyle"
    @cancel.prevent="requestClose"
    @click="outside"
    @keydown.tab="trapFocus"
    @keydown.esc.prevent.stop="requestClose"
    @transitionend.self="endTransition"
  >
    <header class="site-drawer-heading">
      <h2 :id="titleId">
        {{ title }}
      </h2>
      <div class="site-drawer-actions">
        <slot name="actions" />
        <button
          type="button"
          :aria-label="closeLabel"
          :title="closeLabel"
          @click="requestClose"
        >
          <UIcon name="i-lucide-x" />
        </button>
      </div>
    </header>
    <div class="site-drawer-body">
      <slot />
    </div>
  </dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean, title: string, titleId: string, closeLabel: string, fixedBody?: boolean }>()
const emit = defineEmits<{ close: [], opened: [] }>()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const state = ref<'closed' | 'opening' | 'open' | 'closing'>('closed')
let timer: ReturnType<typeof setTimeout> | undefined
let frame = 0
let returnFocus: HTMLElement | null = null
const viewportStyle = ref<Record<string, string>>({})
function measureViewport() {
  const viewport = window.visualViewport
  viewportStyle.value = viewport
    ? {
        '--drawer-viewport-height': `${viewport.height}px`,
        '--drawer-viewport-bottom': `${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`,
      }
    : {}
}

function cancelMotion() {
  clearTimeout(timer)
  cancelAnimationFrame(frame)
}
function finishClose() {
  cancelMotion()
  dialog.value?.close()
  state.value = 'closed'
  if (returnFocus?.isConnected) {
    returnFocus.focus({ preventScroll: true })
  }
}
function close() {
  if (!dialog.value?.open || state.value === 'closing') {
    return
  }
  cancelMotion()
  state.value = 'closing'
  // Keep the modal, focus containment and scroll lock until the exit finishes.
  // A timer also works when transitionend is absent or interrupted in Safari.
  timer = setTimeout(finishClose, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280)
}
function endTransition(event: TransitionEvent) {
  if (state.value === 'closing' && event.propertyName === 'transform') {
    finishClose()
  }
}
function requestClose() {
  if (!dialog.value?.open || state.value === 'closing') {
    return
  }
  close()
  emit('close')
}
function sync() {
  if (!props.open) {
    close()
    return
  }
  cancelMotion()
  if (!dialog.value?.open) {
    returnFocus = document.activeElement as HTMLElement | null
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    state.value = reducedMotion ? 'open' : 'opening'
    dialog.value?.showModal()
    emit('opened')
    if (reducedMotion) {
      return
    }
    // Two frames establish the starting transform without @starting-style.
    // Hidden or headless tabs can stop delivering frames, so opening is bounded too.
    const finishOpen = () => {
      cancelMotion()
      state.value = 'open'
    }
    timer = setTimeout(finishOpen, 80)
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(finishOpen)
    })
  } else {
    state.value = 'open'
    emit('opened')
  }
}
function outside(event: MouseEvent) {
  if (event.target !== dialog.value || !dialog.value) {
    return
  }
  const rect = dialog.value.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
    requestClose()
  }
}
function trapFocus(event: KeyboardEvent) {
  const controls = [...(dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, textarea, summary, [tabindex="0"]') ?? [])].filter((element) => element.getClientRects().length)
  const first = controls[0]
  const last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
onMounted(() => {
  measureViewport()
  window.visualViewport?.addEventListener('resize', measureViewport)
  window.visualViewport?.addEventListener('scroll', measureViewport)
  sync()
})
watch(() => props.open, sync, { flush: 'post' })
onBeforeUnmount(() => {
  cancelMotion()
  window.visualViewport?.removeEventListener('resize', measureViewport)
  window.visualViewport?.removeEventListener('scroll', measureViewport)
})
</script>

<style>
.site-drawer { --canvas-type-scale: 1; position: fixed; inset: 0 0 0 auto; margin: 0; width: min(560px, 100%); height: var(--drawer-viewport-height, 100dvh); max-height: 100dvh; max-width: 100%; padding: 0; overflow: hidden; color: var(--ui-text); background: #10100f; border: 0; border-left: 1px solid #d9ad6760; transform: translateX(100%); transition: transform 240ms ease-out; }
.site-drawer[open] { display: flex; flex-direction: column; }
.site-drawer[data-state="open"] { transform: translate(0, 0); }
.site-drawer::backdrop { background: #0009; backdrop-filter: blur(3px); opacity: 0; transition: opacity 240ms ease-out; }
.site-drawer[data-state="open"]::backdrop { opacity: 1; }
body:has(.site-drawer[open]) { overflow: hidden; }
.site-drawer-heading { display: flex; flex: none; align-items: start; justify-content: space-between; gap: 20px; padding: 24px 32px; border-bottom: 1px solid var(--ui-border); }
.site-drawer-heading h2 { margin: 0; font-size: 1.5rem; line-height: 1.4; overflow-wrap: anywhere; }
.site-drawer-actions { display: flex; flex: none; gap: 8px; }
.site-drawer-actions button { flex: none; width: 44px; height: 44px; display: grid; place-items: center; border: 1px solid var(--ui-border); color: var(--ui-text-muted); cursor: pointer; }
.site-drawer-actions button:hover { color: var(--ui-primary); border-color: var(--ui-primary); }
.site-drawer-actions button:disabled { opacity: .35; cursor: default; }
.site-drawer-actions button:focus-visible { outline: 2px solid var(--ui-primary); outline-offset: 3px; }
.site-drawer-body { flex: 1; min-height: 0; padding: 28px 32px calc(32px + env(safe-area-inset-bottom)); overflow-y: auto; scroll-padding-block: 28px; overscroll-behavior: contain; }
.site-drawer-fixed-body .site-drawer-body { padding: 0; overflow: hidden; }
@media (max-width: 767px) {
  .site-drawer { inset: auto 0 var(--drawer-viewport-bottom, 0px); width: 100%; height: min(88dvh, var(--drawer-viewport-height, 100dvh)); border-top: 1px solid #d9ad6760; border-left: 0; transform: translateY(100%); }
  .site-drawer-heading { padding: 16px 20px; gap: 12px; }
  .site-drawer-heading h2 { font-size: 1.25rem; }
  .site-drawer-body { padding: 24px 20px calc(24px + env(safe-area-inset-bottom)); }
}
@media (prefers-reduced-motion: reduce) {
  .site-drawer, .site-drawer[data-state="open"] { transform: translate(0, 0); transition: none; }
  .site-drawer::backdrop { transition: none; }
}
@media print { .site-drawer { display: none !important; } }
</style>
