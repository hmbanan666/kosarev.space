import type { AgentMessage } from './knowledge'

export function validateAgentRequest(value: unknown): { messages: AgentMessage[], page: string, locale: string } | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const body = value as Record<string, unknown>
  if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 12) {
    return null
  }
  let length = 0
  for (const message of body.messages) {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string' || !message.content.trim() || message.content.length > (message.role === 'user' ? 2000 : 8000)) {
      return null
    }
    length += message.content.length
  }
  if (length > 16000 || body.messages.at(-1).role !== 'user') {
    return null
  }
  const page = typeof body.page === 'string' && /^\/(?:en(?:\/|$))?(?:projects(?:\/[\w-]+)?|cases(?:\/[\w-]+)?|writing(?:\/[\w-]+)?|cv|contact)?$/.test(body.page) ? body.page : '/'
  return { messages: body.messages.map(({ role, content }) => ({ role, content })), page, locale: body.locale === 'en' ? 'en' : 'ru' }
}

export function createRateLimit(now = Date.now) {
  const counters = new Map<string, { count: number, until: number }>()
  return (identity: string): number => {
    const time = now()
    for (const [key, entry] of counters) {
      if (entry.until <= time) {
        counters.delete(key)
      }
    }
    const entry = counters.get(identity) ?? { count: 0, until: time + 3600000 }
    if (entry.count >= 20 || (!counters.has(identity) && counters.size >= 10000)) {
      return Math.max(1, Math.ceil((entry.until - time) / 1000))
    }
    entry.count++
    counters.set(identity, entry)
    return 0
  }
}
