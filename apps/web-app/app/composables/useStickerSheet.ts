import { computed, onMounted, readonly, shallowRef } from 'vue'

/** The center of a sticker, expressed as a fraction of the world on each axis. */
export interface StickerPoint { x: number, y: number }
export interface PlacedSticker<Id extends string> extends StickerPoint { id: Id }

export function useStickerSheet<Id extends string>(ids: readonly Id[], seeds: PlacedSticker<Id>[], storageKey: string) {
  const placed = shallowRef([...seeds])
  const draft = shallowRef<PlacedSticker<Id> | null>(null)
  const artwork = computed(() => {
    const lifted = draft.value
    return lifted ? [...placed.value.filter((item) => item.id !== lifted.id), lifted] : placed.value
  })
  const valid = (point: StickerPoint) => [point.x, point.y].every((n) => Number.isFinite(n) && n >= 0 && n <= 1)
  onMounted(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
      if (Array.isArray(saved) && new Set(saved.map((p) => p.id)).size === saved.length && saved.every((p) => ids.includes(p.id) && valid(p))) {
        placed.value = saved
      }
    } catch { /* Keep the seed sheet when storage is unavailable or invalid. */ }
  })
  function save(next: PlacedSticker<Id>[]) {
    placed.value = next
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch { /* Editing still works for this visit. */ }
  }
  function lift(id: Id, point: StickerPoint) {
    if (ids.includes(id) && valid(point)) {
      draft.value = { id, x: point.x, y: point.y }
    }
  }
  function move(point: StickerPoint) {
    if (draft.value) {
      lift(draft.value.id, point)
    }
  }
  function finish(action: 'stick' | 'remove' | 'cancel') {
    const item = draft.value
    if (item && action !== 'cancel') {
      const others = placed.value.filter((sticker) => sticker.id !== item.id)
      save(action === 'stick' ? [...others, item] : others)
    }
    draft.value = null
  }
  return { placed: readonly(placed), draft: readonly(draft), artwork, lift, move, finish }
}
