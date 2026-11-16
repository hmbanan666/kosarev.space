import { readSse } from '~~/shared/agent-stream'

interface AgentSource { title: string, url: string }
interface ConversationMessage { role: 'user' | 'assistant', content: string, sources?: AgentSource[], status?: string, request?: { page: string, locale: string } }
const storageKey = 'site-agent-v1'

export function useSiteAgent() {
  const open = useState('site-agent-open', () => false)
  const messages = useState<ConversationMessage[]>('site-agent-messages', () => [])
  const busy = useState('site-agent-busy', () => false)
  return { open, messages, busy }
}

// One controller belongs to the persistent, client-mounted drawer.
export function useAgentConversation() {
  const state = useSiteAgent()
  const { messages, busy } = state
  let controller: AbortController | undefined
  let draining: Promise<void> | undefined
  let disposed = false
  function retained() {
    const firstPending = messages.value.findIndex((message) => message.status === 'pending')
    const start = Math.max(0, (firstPending < 0 ? messages.value.length : firstPending) - 24)
    return messages.value.slice(start)
  }
  function save() {
    try {
      const saved = retained().map((message) => message.status === 'streaming' ? { ...message, status: 'stopped' } : message)
      sessionStorage.setItem(storageKey, JSON.stringify(saved))
    } catch { /* Storage may be unavailable in private browsing. */ }
  }
  onMounted(() => {
    window.addEventListener('pagehide', save)
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? '[]')
      if (Array.isArray(saved)) {
        messages.value = saved.filter((item) => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string' && item.content.length <= 8000).map((item) => ({
          role: item.role, content: item.content, status: typeof item.status === 'string' && ['offline', 'rateLimit', 'error', 'invalid', 'stopped', 'pending'].includes(item.status) ? item.status : undefined,
          request: item.role === 'user' && item.status === 'pending' ? { page: typeof item.request?.page === 'string' ? item.request.page : '/', locale: item.request?.locale === 'en' ? 'en' : 'ru' } : undefined,
          sources: Array.isArray(item.sources) ? item.sources.filter((source: AgentSource) => typeof source.title === 'string' && typeof source.url === 'string' && /^\/(?!\/)/.test(source.url)).slice(0, 10) : [],
        }))
      }
    } catch { /* Start an empty session if stored data is invalid. */ }
    void drain()
  })
  function stop() {
    controller?.abort()
  }
  function clear() {
    stop()
    messages.value = []
    save()
  }
  function send(question: string, page: string, locale: string) {
    const content = question.trim()
    if (!content || content.length > 600 || disposed) {
      return Promise.resolve()
    }
    messages.value.push({ role: 'user', content, status: 'pending', request: { page, locale } })
    save()
    return drain()
  }
  function drain(): Promise<void> {
    if (draining) {
      return draining
    }
    if (disposed || !messages.value.some((message) => message.role === 'user' && message.status === 'pending')) {
      return Promise.resolve()
    }
    busy.value = true
    draining = (async () => {
      while (true) {
        if (disposed) {
          break
        }
        const question = messages.value.find((message) => message.role === 'user' && message.status === 'pending')
        if (!question) {
          break
        }
        await respond(question)
      }
    })().finally(() => {
      busy.value = false
      draining = undefined
      messages.value = retained()
      save()
    })
    return draining
  }
  async function respond(question: ConversationMessage) {
    const index = messages.value.indexOf(question)
    const { page, locale } = question.request!
    question.status = undefined
    question.request = undefined
    // Failed or interrupted turns do not become model-authored history.
    const history = messages.value.slice(0, index).filter((item, index) => !item.status && !(item.role === 'user' && messages.value[index + 1]?.status)).slice(-6)
    const requestMessages = [...history.map(({ role, content }) => ({ role, content: content.slice(0, 600) })), { role: 'user', content: question.content }]
    while (requestMessages.length > 1 && requestMessages.reduce((sum, item) => sum + item.content.length, 0) > 16000) {
      requestMessages.shift()
    }
    messages.value.splice(index + 1, 0, { role: 'assistant', content: '', sources: [], status: 'streaming' })
    const answer = messages.value[index + 1]!
    save()
    const active = new AbortController()
    controller = active
    const timeout = setTimeout(() => active.abort(), 50000)
    try {
      const response = await fetch('/api/agent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: active.signal,
        body: JSON.stringify({ messages: requestMessages, page, locale }),
      })
      if (!response.ok) {
        answer.status = response.status === 503 ? 'offline' : response.status === 429 ? 'rateLimit' : 'error'
        return
      }
      if (!response.body) {
        throw new Error('Missing stream')
      }
      let done = false
      for await (const data of readSse(response.body)) {
        const event = JSON.parse(data)
        if (event.type === 'delta' && typeof event.text === 'string') {
          answer.content += event.text
        } else if (event.type === 'sources') {
          answer.sources = event.sources
        } else if (event.type === 'error') {
          answer.status = ['offline', 'rateLimit'].includes(event.code) ? event.code : 'error'
          done = true
        } else if (event.type === 'done') {
          done = true
        }
      }
      if (!done) {
        answer.status = 'error'
      } else if (answer.status === 'streaming') {
        answer.status = undefined
      }
    } catch {
      answer.status = active.signal.aborted ? 'stopped' : 'error'
    } finally {
      clearTimeout(timeout)
      controller = undefined
      save()
    }
  }
  onBeforeUnmount(() => {
    window.removeEventListener('pagehide', save)
    disposed = true
    stop()
  })
  return { ...state, send, stop, clear }
}
