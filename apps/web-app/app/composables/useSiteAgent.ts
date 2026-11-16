import { readSse } from '~~/shared/agent-stream'

interface AgentSource { title: string, url: string }
interface ConversationMessage { role: 'user' | 'assistant', content: string, sources?: AgentSource[], status?: string }
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
  function save() {
    try {
      const saved = messages.value.slice(-24).map((message, index, all) => busy.value && index === all.length - 1 ? { ...message, status: 'stopped' } : message)
      sessionStorage.setItem(storageKey, JSON.stringify(saved))
    } catch { /* Storage may be unavailable in private browsing. */ }
  }
  onMounted(() => {
    window.addEventListener('pagehide', save)
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? '[]')
      if (Array.isArray(saved)) {
        messages.value = saved.slice(-24).filter((item) => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string' && item.content.length <= 8000).map((item) => ({
          role: item.role, content: item.content, status: typeof item.status === 'string' && ['offline', 'rateLimit', 'error', 'invalid', 'stopped'].includes(item.status) ? item.status : undefined,
          sources: Array.isArray(item.sources) ? item.sources.filter((source: AgentSource) => typeof source.title === 'string' && typeof source.url === 'string' && /^\/(?!\/)/.test(source.url)).slice(0, 10) : [],
        }))
      }
    } catch { /* Start an empty session if stored data is invalid. */ }
  })
  function stop() {
    controller?.abort()
  }
  function clear() {
    stop()
    messages.value = []
    save()
  }
  async function send(question: string, page: string, locale: string) {
    const content = question.trim()
    if (busy.value || !content || content.length > 2000) {
      return
    }
    // Failed or interrupted turns do not become model-authored history.
    const history = messages.value.filter((item, index) => !item.status && !(item.role === 'user' && messages.value[index + 1]?.status)).slice(-8)
    const requestMessages = [...history.map(({ role, content }) => ({ role, content })), { role: 'user', content }]
    while (requestMessages.length > 1 && requestMessages.reduce((sum, item) => sum + item.content.length, 0) > 16000) {
      requestMessages.shift()
    }
    messages.value.push({ role: 'user', content }, { role: 'assistant', content: '', sources: [] })
    const answer = messages.value.at(-1)!
    busy.value = true
    save()
    controller = new AbortController()
    const timeout = setTimeout(() => controller?.abort(), 50000)
    try {
      const response = await fetch('/api/agent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
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
      }
    } catch {
      answer.status = controller.signal.aborted ? 'stopped' : 'error'
    } finally {
      clearTimeout(timeout)
      busy.value = false
      controller = undefined
      messages.value = messages.value.slice(-24)
      save()
    }
  }
  onBeforeUnmount(() => {
    window.removeEventListener('pagehide', save)
    stop()
  })
  return { ...state, send, stop, clear }
}
