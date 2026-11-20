import { repository } from '@kosarev/database'
import { defineWebSocketHandler } from 'h3'
import { BoardRoom } from '../utils/board-room'
import { loadSharedBoard } from '../utils/shared-board'

const board = new BoardRoom(loadSharedBoard, repository.homeBoard.update)
const peers = /* @__PURE__ */ new Map()
const nameKeys = [
  'curiousCat',
  'silentFox',
  'bravePanda',
  'luckyOwl',
  'swiftFalcon',
  'calmWhale',
  'wildTiger',
  'shyDeer',
  'boldEagle',
  'kindBear',
  'smartCrow',
  'freeWolf',
  'warmOtter',
  'coolLynx',
  'fastHare',
  'wiseTurtle',
  'deepSquid',
  'loudParrot',
  'softMoth',
  'brightBee',
]
const colors = [
  '#f43f5e',
  '#8b5cf6',
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
  '#ef4444',
  '#a855f7',
  '#0ea5e9',
]
const genders = ['male', 'female']
const clothingColors = ['amber', 'green', 'blue', 'teal', 'pink', 'violet']
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
function generateAvatarUrl(seed) {
  const gender = getRandomItem(genders)
  const emotion = Math.floor(Math.random() * 10) + 1
  const clothing = getRandomItem(clothingColors)
  return `/_live-cursors-avatar/${seed}?gender=${gender}&emotion=${emotion}&clothing=${clothing}`
}
function broadcastCursors(exclude) {
  const cursors = Array.from(peers.values())
  const message = JSON.stringify({ type: 'cursors', cursors })
  for (const peer of peers.keys()) {
    if (peer !== exclude) {
      peer.send(message)
    }
  }
}
function broadcastOnline() {
  const users = Array.from(peers.values()).map((p) => ({
    id: p.id,
    nameKey: p.nameKey,
    color: p.color,
    avatar: p.avatar,
  }))
  const msg = JSON.stringify({ type: 'online', count: peers.size, users })
  for (const p of peers.keys()) {
    p.send(msg)
  }
}
function isValidPage(page) {
  return typeof page === 'string' && page.length <= 2048 && page.startsWith('/')
}
export default defineWebSocketHandler({
  open(peer) {
    const id = peer.id
    const data = {
      id,
      x: -100,
      y: -100,
      nameKey: getRandomItem(nameKeys),
      color: getRandomItem(colors),
      avatar: generateAvatarUrl(id),
      page: '/',
    }
    peers.set(peer, data)
    peer.send(JSON.stringify({ type: 'welcome', ...data, count: peers.size }))
    const existingCursors = Array.from(peers.values()).filter((p) => p.id !== id)
    peer.send(JSON.stringify({ type: 'cursors', cursors: existingCursors }))
    broadcastOnline()
  },
  message(peer, message) {
    const data = peers.get(peer)
    if (!data) {
      return
    }
    try {
      if (message.text().length > 4096) {
        return
      }
      const msg = JSON.parse(message.text())
      if (msg.type === 'board-join' || msg.type === 'board-leave' || msg.type === 'board-action') {
        const operation = msg.type === 'board-join'
          ? board.join(data.id, (event) => peer.send(JSON.stringify(event)))
          : msg.type === 'board-leave' ? board.leave(data.id) : board.act(data.id, msg.action, msg.item)
        operation.catch(() => peer.close(1011, 'Board unavailable'))
        return
      }
      if (msg.type === 'move') {
        const x = Number(msg.x)
        const y = Number(msg.y)
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          return
        }
        data.x = Math.max(0, Math.min(1, x))
        data.y = Math.max(-1e3, Math.min(1e5, y))
        data.page = isValidPage(msg.page) ? msg.page : '/'
        broadcastCursors(peer)
      } else if (msg.type === 'shuffle') {
        data.nameKey = getRandomItem(nameKeys)
        data.color = getRandomItem(colors)
        data.avatar = generateAvatarUrl(crypto.randomUUID().slice(0, 8))
        peer.send(JSON.stringify({ type: 'updated', nameKey: data.nameKey, color: data.color, avatar: data.avatar }))
        broadcastCursors()
        broadcastOnline()
      }
    } catch {
    }
  },
  close(peer) {
    void board.leave(peer.id)
    peers.delete(peer)
    broadcastCursors()
    broadcastOnline()
  },
})
