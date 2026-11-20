import type { BoardData } from '@kosarev/database'
import type { BoardAction, BoardMove, HeldItem } from '~~/shared/board'

export function useSharedBoard(initial: Ref<BoardData | undefined>) {
  const { status, boardEvents, send, profile } = useSiteSocket()
  const state = shallowRef(initial.value)
  const held = shallowRef<HeldItem[]>([])
  const active = shallowRef<BoardMove>()
  const landed = shallowRef<string>()
  const ready = ref(false)
  function action(action: BoardAction, item: BoardMove) {
    return send({ type: 'board-action', action, item })
  }
  boardEvents.on((event) => {
    if (event.type === 'board-state') {
      state.value = event.state
      held.value = event.held
      landed.value = event.landed
      ready.value = true
    } else if (event.type === 'board-held') {
      held.value = [...held.value.filter((i) => i.id !== event.item.id), event.item]
      if (landed.value === event.item.id) {
        landed.value = undefined
      }
    } else if (active.value?.id === event.id) {
      active.value = undefined
    }
  })
  watch(status, (s) => {
    ready.value = false
    held.value = []
    active.value = undefined
    if (s === 'OPEN') {
      send({ type: 'board-join' })
    }
  }, { immediate: true, flush: 'sync' })
  onScopeDispose(() => send({ type: 'board-leave' }))
  const remote = computed(() => held.value.filter((i) => i.owner !== profile.value?.id))
  function begin(item: BoardMove) {
    if (!ready.value || active.value || remote.value.some((h) => h.id === item.id) || !action('begin', item)) {
      return false
    }
    active.value = item
    return true
  }
  const publish = useThrottleFn(() => {
    if (active.value) {
      action('preview', active.value)
    }
  }, 40, true)
  function preview(item: BoardMove) {
    if (active.value?.id === item.id) {
      active.value = item
      void publish()
    }
  }
  function finish(kind: 'drop' | 'cancel' | 'remove', item: BoardMove) {
    if (active.value?.id === item.id) {
      action(kind, item)
      active.value = undefined
    }
  }
  return { state, active, ready, remote, landed, begin, preview, finish }
}

export const sharedBoardKey: InjectionKey<ReturnType<typeof useSharedBoard>> = Symbol('home-board')

export function visibleStickers(placed: BoardData['stickers'], previews: HeldItem[]) {
  const moving = previews.flatMap((item) => item.rotation === undefined || !item.kind ? [] : [{ ...item, kind: item.kind, rotation: item.rotation }])
  return [...placed.filter((s) => !moving.some((p) => p.id === s.id)), ...moving]
}
