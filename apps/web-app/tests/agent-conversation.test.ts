import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useAgentConversation } from '../app/composables/useSiteAgent'

let mount: () => void
let stored: string | null
let session: string | null
let requests: { body: { sessionId: string, messages: { role: string, content: string }[], page: string, locale: string }, stream: ReadableStreamDefaultController<Uint8Array> }[]
const encoder = new TextEncoder()
function finish(index: number, text: string) {
  requests[index]!.stream.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'delta', text })}\n\ndata: {"type":"done"}\n\n`))
  requests[index]!.stream.close()
}
beforeEach(() => {
  stored = null
  session = null
  requests = []
  const state = new Map()
  vi.stubGlobal('useState', (key: string, init: () => unknown) => {
    if (!state.has(key)) {
      state.set(key, { value: init() })
    }
    return state.get(key)
  })
  vi.stubGlobal('onMounted', (fn: () => void) => {
    mount = fn
  })
  vi.stubGlobal('onBeforeUnmount', vi.fn())
  vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() })
  vi.stubGlobal('localStorage', { getItem: () => session, setItem: (_key: string, value: string) => {
    session = value
  } })
  vi.stubGlobal('sessionStorage', { getItem: () => stored, setItem: (_key: string, value: string) => {
    stored = value
  } })
  vi.stubGlobal('fetch', vi.fn(async (_url, options) => new Response(new ReadableStream({
    start(stream) {
      requests.push({ body: JSON.parse(options.body), stream })
      options.signal.addEventListener('abort', () => stream.error(new DOMException('Aborted', 'AbortError')))
    },
  }))))
})
afterEach(() => vi.unstubAllGlobals())

it('shows pending questions immediately and sends them in order with completed history only', async () => {
  const chat = useAgentConversation()
  mount()
  const done = chat.send('First', '/en', 'en')
  void chat.send('Second', '/en/projects/k39', 'en')
  void chat.send('Third', '/', 'ru')
  expect(chat.messages.value.filter((m) => m.role === 'user').map((m) => [m.content, m.status])).toEqual([['First', undefined], ['Second', 'pending'], ['Third', 'pending']])
  expect(requests).toHaveLength(1)
  finish(0, 'One')
  await vi.waitFor(() => expect(requests).toHaveLength(2))
  expect(requests[1]!.body).toEqual({ sessionId: expect.any(String), page: '/en/projects/k39', locale: 'en', messages: [{ role: 'user', content: 'First' }, { role: 'assistant', content: 'One' }, { role: 'user', content: 'Second' }] })
  finish(1, 'Two')
  await vi.waitFor(() => expect(requests).toHaveLength(3))
  expect(requests[2]!.body.messages.at(-1)?.content).toBe('Third')
  finish(2, 'Three')
  await done
  expect(chat.busy.value).toBe(false)
  expect(chat.messages.value.map((m) => m.content)).toEqual(['First', 'One', 'Second', 'Two', 'Third', 'Three'])
})

it('stops the current answer and continues queued work without sending the interrupted turn as history', async () => {
  const chat = useAgentConversation()
  mount()
  const done = chat.send('First', '/', 'ru')
  void chat.send('Second', '/en/contact', 'en')
  chat.stop()
  await vi.waitFor(() => expect(requests).toHaveLength(2))
  expect(chat.messages.value[1]?.status).toBe('stopped')
  expect(requests[1]!.body.messages).toEqual([{ role: 'user', content: 'Second' }])
  finish(1, 'Continued')
  await done
})

it('clears in-flight and pending messages without starting another request', async () => {
  const chat = useAgentConversation()
  mount()
  const done = chat.send('First', '/', 'ru')
  void chat.send('Second', '/', 'ru')
  chat.clear()
  await done
  expect(requests).toHaveLength(1)
  expect(chat.messages.value).toEqual([])
  expect(JSON.parse(stored!)).toEqual([])
})

it('persists pending context and restores it after an interrupted answer', async () => {
  const chat = useAgentConversation()
  mount()
  const done = chat.send('First', '/', 'ru')
  void chat.send('Second', '/en/projects/k39', 'en')
  const snapshot = stored
  expect(JSON.parse(snapshot!)[1].status).toBe('stopped')
  expect(JSON.parse(snapshot!).at(-1)).toMatchObject({ content: 'Second', status: 'pending', request: { page: '/en/projects/k39', locale: 'en' } })
  chat.clear()
  await done
  stored = snapshot
  const restored = useAgentConversation()
  mount()
  await vi.waitFor(() => expect(requests).toHaveLength(2))
  expect(requests[1]!.body).toEqual({ sessionId: expect.any(String), page: '/en/projects/k39', locale: 'en', messages: [{ role: 'user', content: 'Second' }] })
  finish(1, 'Restored')
  await vi.waitFor(() => expect(restored.busy.value).toBe(false))
})

it('enforces the length cap while busy and bounds successful history', async () => {
  const chat = useAgentConversation()
  mount()
  for (let index = 0; index < 5; index++) {
    const done = chat.send(`Question ${index}`, '/en', 'en')
    await chat.send('x'.repeat(601), '/en', 'en')
    finish(index, 'a'.repeat(800))
    await done
  }
  expect(requests[4]!.body.messages).toHaveLength(7)
  expect(requests[4]!.body.messages[0]?.content).toBe('Question 1')
  expect(requests[4]!.body.messages[1]?.content).toHaveLength(600)
})

it('keeps an anonymous session across reloads and drawer clear, rotating after storage is cleared', async () => {
  const chat = useAgentConversation()
  mount()
  const first = chat.send('First', '/', 'ru')
  finish(0, 'One')
  await first
  const id = requests[0]!.body.sessionId
  expect(id).toMatch(/^[0-9a-f-]{36}$/)
  expect(session).toBe(id)
  chat.clear()
  const reloaded = useAgentConversation()
  mount()
  const second = reloaded.send('Second', '/', 'ru')
  finish(1, 'Two')
  await second
  expect(requests[1]!.body.sessionId).toBe(id)
  session = null
  const third = reloaded.send('Third', '/', 'ru')
  finish(2, 'Three')
  await third
  expect(requests[2]!.body.sessionId).not.toBe(id)
})

it('replaces an incomplete attempt in the same turn and keeps only the fallback in follow-up history', async () => {
  const chat = useAgentConversation()
  mount()
  const done = chat.send('First', '/en', 'en')
  requests[0]!.stream.enqueue(encoder.encode('data: {"type":"delta","text":"Incomplete first attempt"}\n\n'))
  await vi.waitFor(() => expect(chat.messages.value[1]?.content).toBe('Incomplete first attempt'))
  requests[0]!.stream.enqueue(encoder.encode('data: {"type":"reset"}\n\n'))
  finish(0, 'Fallback answer')
  await done
  expect(requests).toHaveLength(1)
  expect(chat.messages.value[1]).toMatchObject({ content: 'Fallback answer', status: undefined })
  expect(JSON.parse(stored!)[1].content).toBe('Fallback answer')
  const next = chat.send('Second', '/en', 'en')
  expect(requests[1]!.body.messages[1]?.content).toBe('Fallback answer')
  finish(1, 'Next answer')
  await next
})

it('finishes on done without waiting for transport close or appending late deltas', async () => {
  const chat = useAgentConversation()
  mount()
  const done = chat.send('First', '/en', 'en')
  requests[0]!.stream.enqueue(encoder.encode('data: {"type":"delta","text":"Complete"}\n\ndata: {"type":"done"}\n\ndata: {"type":"delta","text":"Complete"}\n\n'))
  try {
    await vi.waitFor(() => expect(chat.busy.value).toBe(false), { timeout: 200 })
    await done
    expect(chat.messages.value[1]).toMatchObject({ content: 'Complete', status: undefined })
  } finally {
    chat.stop()
    await done
  }
})

it.each(['error', 'eof', 'abort', 'clear'])('releases busy after %s', async (ending) => {
  const chat = useAgentConversation()
  mount()
  const done = chat.send('First', '/en', 'en')
  if (ending === 'error') {
    requests[0]!.stream.enqueue(encoder.encode('data: {"type":"error","code":"error"}\n\n'))
  } else if (ending === 'eof') {
    requests[0]!.stream.close()
  } else if (ending === 'abort') {
    chat.stop()
  } else {
    chat.clear()
  }
  await done
  expect(chat.busy.value).toBe(false)
  expect(chat.messages.value.some((message) => message.status === 'streaming')).toBe(false)
})
