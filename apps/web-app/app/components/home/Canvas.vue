<template>
  <section
    class="home-canvas site-wrap"
    :data-board-ready="shared.ready.value"
    :style="{ '--grid-gap': `${homeCanvas.gap}px`, '--canvas-type-scale': enabled ? Math.max(1, .78 / Math.max(zoom, initialZoom)) : 1 }"
    :class="{ 'canvas-enabled': enabled }"
    :aria-label="t('canvas.title')"
  >
    <p
      v-if="enabled"
      id="canvas-help"
      class="sr-only"
    >
      {{ t('canvas.help') }}
    </p>
    <div class="canvas-stage">
      <div
        ref="viewport"
        class="canvas-viewport"
        data-live-cursors-viewport
        :class="{ 'is-dragging': dragging, 'canvas-fitted': zoom <= fitZoom }"
        :tabindex="enabled ? 0 : undefined"
        :role="enabled ? 'region' : undefined"
        :aria-label="t('canvas.title')"
        :aria-describedby="enabled ? 'canvas-help' : undefined"
        @scroll="measure(); measureStickerOrigin()"
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
            ref="world"
            class="canvas-world"
            :data-canvas-world="enabled ? '' : undefined"
            :style="enabled ? { 'width': `${width}px`, 'height': `${height}px`, 'transform': `scale(${zoom})`, '--canvas-cell-width': `${cellWidth}px`, '--canvas-cell-height': `${cellHeight}px` } : undefined"
          >
            <BlueprintMark
              v-for="corner in ['top-left', 'top-right', 'bottom-left', 'bottom-right']"
              :key="corner"
              kind="crosshair"
              class="canvas-crosshair"
              :class="`canvas-crosshair-${corner}`"
            />
            <template v-for="block in blocks" :key="block.id">
              <BlueprintFrame
                :data-block="block.id"
                :class="[`canvas-block-${block.id}`, { 'canvas-moving': target?.id === block.id }]"
                :accent="block.id === 'hero'"
                :part="parts[block.id]"
                :data-held-by="shared.remote.value.find((h) => h.id === block.id)?.owner"
                :style="enabled ? position(target?.id === block.id ? target : block) : undefined"
                @pointerdown="rememberPointer"
                @click="openCard($event, block.id)"
              >
                <span
                  v-for="edge in enabled ? ['top', 'right', 'bottom', 'left'] : []"
                  :key="edge"
                  class="canvas-edge"
                  :class="`canvas-edge-${edge}`"
                  :style="{ '--edge-band': `${14 / zoom}px` }"
                  aria-hidden="true"
                  @pointerdown.stop="rememberPointer($event); start($event, block.id)"
                  @click.stop
                />
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
                <button
                  v-if="mounted"
                  type="button"
                  class="canvas-open"
                  aria-haspopup="dialog"
                  aria-controls="activity-detail-panel"
                  :aria-label="t('activity.open', { name: blockLabel(block.id) })"
                  @click.stop="showCard(block.id)"
                >
                  <UIcon name="i-lucide-maximize-2" aria-hidden="true" />
                </button>
                <HomeBoardOverview v-if="!enabled && block.id === 'live'" :blocks="blocks" />
                <HomeBlockContent
                  :id="block.id"
                  :latest="latest"
                  :activity="activity"
                />
              </BlueprintFrame>
            </template>
            <HomeStickers
              :enabled="enabled"
              :dock="stickerDock"
              :viewport="viewport"
              :space="stickerSpace"
              :reserves-drag="reservesDrag"
              :suspended="!!selectedCard"
            />
            <div
              v-if="target"
              class="canvas-target"
              :class="{ 'canvas-target-blocked': !targetFits }"
              :style="position({ ...target, x: Math.round(target.x), y: Math.round(target.y) })"
              aria-hidden="true"
            >
              <span>{{ Math.round(target.x) + 1 }} : {{ Math.round(target.y) + 1 }}</span>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="enabled"
        class="canvas-edge-details"
        aria-hidden="true"
      >
        <span>00 : 00</span><span>{{ homeCanvas.columns }} : {{ homeCanvas.rows }}</span>
      </div>
    </div>
    <footer v-if="enabled" class="canvas-chrome">
      <div class="canvas-tools">
        <div class="canvas-footer-start">
          <p class="canvas-copyright">
            {{ t('footer.copyright', { year: new Date().getFullYear() }) }}
          </p>
          <div ref="stickerDock" />
        </div>
        <div ref="presenceDock" class="canvas-presence" />
        <div class="canvas-credits">
          <nav :aria-label="t('site.navigation')">
            <NuxtLink :to="localePath('/contact')">
              {{ t('hero.contact') }}<SiteLinkIcon />
            </NuxtLink>
            <a href="https://t.me/hmbanan666">Telegram<SiteLinkIcon external /></a>
            <a href="https://github.com/hmbanan666">GitHub<SiteLinkIcon external /></a>
          </nav>
        </div>
      </div>
      <span class="sr-only" role="status">{{ feedback ? t(`canvas.${feedback}`) : '' }}</span>
    </footer>
    <HomeDetailPanel
      :id="selectedCard"
      :title="blockLabel(selectedCard ?? '')"
      :activity="activity"
      :latest="latest"
      @close="closeCard"
    />
  </section>
</template>

<script setup lang="ts">
import { projectScores } from '~~/shared/activity'
import { sortPublications } from '~~/shared/publications'
import { canvasProducts } from '~/utils/activity-content'
import { activityLayout, homeCanvas } from '~/utils/home-canvas'

const { t, locale } = useI18n()
const mounted = useMounted()
const localePath = useLocalePath()
const viewport = useTemplateRef<HTMLElement>('viewport')
const { data: activity } = await useActivity()
const { data } = await usePublications()
const latest = computed(() => sortPublications(data.value ?? [])[0])
const defaults = computed(() => activityLayout(projectScores(activity.value), !!latest.value))
const { data: initialBoard } = await useFetch('/api/board')
const shared = useSharedBoard(initialBoard)
provide(sharedBoardKey, shared)
const { enabled, blocks, feedback, zoom, fitZoom, initialZoom, width, height, cellWidth, cellHeight, target, targetFits, dragging, measure, start, move, end, key, wheel, reveal, position } = useHomeCanvas(viewport, defaults, shared)
const world = useTemplateRef<HTMLElement>('world')
const stickerSpace = reactive({ left: 0, top: 0, width, height, scale: zoom, refresh: measureStickerOrigin })
function measureStickerOrigin() {
  if (enabled.value && world.value) {
    const { left, top } = world.value.getBoundingClientRect()
    stickerSpace.left = left
    stickerSpace.top = top
  }
}
watch([enabled, width, height, zoom], measureStickerOrigin, { flush: 'post' })
function reservesDrag(target: Element) {
  return !!target.closest('.canvas-grip, .canvas-edge, a, button, input, select, textarea, summary, [role="button"], [contenteditable="true"]')
}
const stickerDock = useTemplateRef<HTMLElement>('stickerDock')
const presenceDock = useTemplateRef<HTMLElement>('presenceDock')
const presenceDocked = useState('canvas-presence-docked', () => false)
// Move the existing presence instance after its dock exists. Route changes
// preserve the connection and profile instead of mounting a second instance.
watch(presenceDock, (element) => {
  presenceDocked.value = !!element
}, { flush: 'post' })
onBeforeUnmount(() => {
  presenceDocked.value = false
})
const parts: Record<string, string> = { hero: 'A / 01', context: 'B / 01', k39: 'B / 02', writing: 'C / 01' }
function blockLabel(id: string) {
  const labels: Record<string, string> = { hero: t('drawer.name'), cv: t('nav.cv'), contacts: t('hero.contact'), writing: t('writing.title'), live: t('activity.liveTitle'), contributions: t('activity.contributions'), feed: t('activity.feed'), skills: t('activity.skills') }
  const product = canvasProducts.find((product) => product.key === id)
  return labels[id] ?? (id === 'publication' ? latest.value?.locales[locale.value === 'en' ? 'en' : 'ru'].title : undefined) ?? (product?.titleKey ? t(product.titleKey) : product?.title) ?? id
}
const route = useRoute()
const router = useRouter()
const selectedCard = computed(() => typeof route.query.card === 'string' && defaults.value.some((block) => block.id === route.query.card) ? route.query.card : undefined)
let openedHere = false
let pointer = { x: 0, y: 0 }
function rememberPointer(event: PointerEvent) {
  pointer = { x: event.clientX, y: event.clientY }
}
function openCard(event: MouseEvent, id: string) {
  if ((event.target as HTMLElement).closest('a, button, input, summary') || Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 6) {
    return
  }
  showCard(id)
}
function showCard(id: string) {
  const trigger = document.querySelector<HTMLElement>(`[data-block="${id}"] .canvas-open`)
  trigger?.focus({ preventScroll: true })
  openedHere = true
  void router.push({ query: { ...route.query, card: id } })
}
function closeCard() {
  if (openedHere) {
    router.back()
  } else {
    const { card: _, ...query } = route.query
    void router.replace({ query })
  }
}
watch(selectedCard, (value) => {
  if (!value) {
    openedHere = false
  }
})
</script>

<style scoped>
.canvas-footer-start { display: flex; align-items: center; gap: clamp(8px, 1.8vw, 28px); }
@media (prefers-reduced-motion: no-preference) {
  .canvas-enabled .blueprint-frame:is(.canvas-moving, [data-held-by]) { transition: left 65ms linear, top 65ms linear; }
}
.canvas-enabled .blueprint-frame[data-held-by] { border-color: var(--ui-primary); z-index: 2; }
</style>
