import type { BoardEvent } from '~~/shared/board'
import { createSharedComposable, useWebSocket } from '@vueuse/core'

interface Profile { id: string, nameKey: string, color: string, avatar: string }
interface Cursor extends Profile { x: number, y: number, page: string }

type Message = BoardEvent
  | ({ type: 'welcome', count: number } & Profile)
  | ({ type: 'updated' } & Omit<Profile, 'id'>)
  | { type: 'cursors', cursors: Cursor[] }
  | { type: 'online', count: number, users: Profile[] }

export const useSiteSocket = createSharedComposable(() => {
  const profile = shallowRef<Profile>()
  const peers = shallowRef<Cursor[]>([])
  const count = ref(0)
  const users = shallowRef<Profile[]>([])
  const boardEvents = createEventHook<BoardEvent>()
  const url = import.meta.client ? new URL('/_live-cursors-ws', window.location.href) : undefined
  if (url) {
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  }
  const socket = useWebSocket(url?.href, {
    immediate: import.meta.client,
    autoReconnect: { delay: 1200 },
    onDisconnected() {
      profile.value = undefined
      peers.value = []
      users.value = []
      count.value = 0
    },
    onMessage(_, event) {
      const msg: Message = JSON.parse(event.data)
      switch (msg.type) {
        case 'welcome':
          profile.value = msg
          count.value = msg.count
          break
        case 'updated':
          if (profile.value) {
            profile.value = { ...profile.value, ...msg }
          }
          break
        case 'cursors':
          peers.value = msg.cursors
          break
        case 'online':
          users.value = msg.users
          count.value = msg.count
          break
        default: void boardEvents.trigger(msg)
      }
    },
  })
  return { status: socket.status, profile, peers, users, count, boardEvents, send: (msg: object) => socket.send(JSON.stringify(msg), false) }
})

export const useLiveCursors = createSharedComposable(() => {
  const { send, peers, users, count, profile, status } = useSiteSocket()
  const route = useRoute()
  const page = computed(() => route.path.replace(/^\/en(?=\/|$)/, '') || '/')
  const cursorsHidden = useState('hide-live-cursors', () => false)
  let pointer: { x: number, y: number } | undefined
  const sendPointer = useThrottleFn(() => {
    if (!pointer) {
      return
    }
    const world = document.querySelector('[data-canvas-world]')
    const rect = world?.getBoundingClientRect()
    const clip = world?.closest('[data-live-cursors-viewport]')?.getBoundingClientRect()
    const { x, y } = pointer
    if (rect?.width && clip && x >= clip.left && x <= clip.right && y >= clip.top && y <= clip.bottom) {
      send({ type: 'move', x: (x - rect.left) / rect.width, y: (y - rect.top) / rect.height * 10000, page: `${page.value}#coordinates-v2` })
    } else {
      send({ type: 'move', x: x / innerWidth, y: y + scrollY, page: page.value })
    }
  }, 40, true)
  useEventListener('pointermove', (e: PointerEvent) => {
    pointer = { x: e.clientX, y: e.clientY }
    void sendPointer()
  })
  useEventListener('scroll', sendPointer, { capture: true, passive: true })
  useEventListener(import.meta.client ? window : undefined, 'live-cursors:coordinates', sendPointer)
  return {
    cursors: computed(() => peers.value.filter((p) => p.id !== profile.value?.id && (p.page === page.value || p.page === `${page.value}#coordinates-v2`))),
    cursorsHidden,
    onlineUsers: users,
    onlineCount: count,
    isConnected: computed(() => status.value === 'OPEN'),
    myNameKey: computed(() => profile.value?.nameKey),
    myAvatar: computed(() => profile.value?.avatar),
    myColor: computed(() => profile.value?.color),
    shuffle: () => send({ type: 'shuffle' }),
  }
})
