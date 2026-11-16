import type { AgentMessage, KnowledgeChunk } from './knowledge'

export function validateAgentRequest(value: unknown): { messages: AgentMessage[], page: string, locale: string, sessionId?: string } | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const body = value as Record<string, unknown>
  if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 12) {
    return null
  }
  let length = 0
  for (const message of body.messages) {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string' || !message.content.trim() || message.content.length > (message.role === 'user' ? 600 : 8000)) {
      return null
    }
    length += message.content.length
  }
  if (length > 16000 || body.messages.at(-1).role !== 'user') {
    return null
  }
  if (body.sessionId !== undefined && (typeof body.sessionId !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(body.sessionId))) {
    return null
  }
  const page = typeof body.page === 'string' && /^\/(?:en(?:\/|$))?(?:projects(?:\/[\w-]+)?|cases(?:\/[\w-]+)?|writing(?:\/[\w-]+)?|cv|contact)?$/.test(body.page) ? body.page : '/'
  return { sessionId: body.sessionId as string | undefined, messages: body.messages.slice(-7).map(({ role, content }) => ({ role, content: content.slice(0, 600) })), page, locale: body.locale === 'en' ? 'en' : 'ru' }
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

export function isBlockedQuestion(question: string): boolean {
  const text = question.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '').toLowerCase().replace(/\s+/g, ' ').replace(/\bcan (?:nick|nikolai|nikolay) write code\b/g, '')
  return [
    /(?:ignore|disregard|forget).{0,50}(?:instructions|rules|prompt)|(?:игнорируй|забудь|забудьте).{0,50}(?:инструкци|правил|промпт)/,
    /system\s*(?:prompt|message)|системн.{0,15}(?:промпт|инструкци|сообщени)|(?:reveal|show|print|dump|repeat|paraphrase).{0,40}(?:prompt|instructions|secret|api.?key|environment|knowledge pack)/,
    /(?:покажи|раскрой|выведи|перескажи).{0,40}(?:промпт|инструкци|ключ|секрет|переменн|базу знаний)|model name|what model|which model|как(?:ая|ой|ую).{0,15}модел/,
    /act as|pretend (?:to be|you)|role.?play|представь.{0,20}(?:ты|себя)|(?:играй|сыграй) роль|jailbreak|\bdan\b|developer mode|режим разработчика/,
    /(?:напиши|написать|создай|создать|сгенерируй|сгенерировать).{0,35}(?:код|скрипт|программ|функци)|(?:write|generate|create).{0,35}(?:code|script|program|function)/,
    /\b(?:can|could|would) you (?:do|build|make) (?:my|a|an|the|this|that)\b/,
    /translate|переведи|перевод.{0,15}(?:текст|фраз)|homework|домашн.{0,10}задани|solve.{0,20}(?:equation|problem)|реши.{0,20}(?:задач|уравнен)/,
    /tell me a joke|расскажи анекдот|write.{0,15}(?:poem|essay)|напиши.{0,15}(?:стих|сочинени)|politic|политик|президент|weather|погод[ау]/,
  ].some((pattern) => pattern.test(text))
}

export function scopeRefusal(question: string, locale: string): string {
  const russian = /\p{Script=Cyrillic}/u.test(question) || (!/[a-z]/i.test(question) && locale !== 'en')
  return russian
    ? 'Извините, я отвечаю только о сайте и работе Николая. Спросите о его проектах, опыте или [свяжитесь с Николаем](/contact).'
    : 'Sorry, I only answer about this site and Nikolay’s work. Ask about his projects, experience, or [contact Nikolay](/en/contact).'
}

export function isSkillQuestion(question: string): boolean {
  return /\b(?:skills?|stack|experience)\b|навык|стек|опыт|\b(?:does|can|has) (?:nikolay|nikolai|nick)\b|никола.{0,30}(?:умеет|работал|пишет|знает)|(?:можешь|умеешь|умеете|можете)\s+(?:кодить|программировать|писать код|работать|в\s)|(?:ты|вы)\s+(?:работал|использовал)|\b(?:can you (?:code|program|work with|do)|do you (?:know|use)|have you (?:used|worked with))\b/i.test(question)
}

export function looksOnTopic(question: string, chunks: KnowledgeChunk[]): boolean {
  const text = question.toLowerCase()
  if (isSkillQuestion(question)) {
    return true
  }
  if (/\b(?:nick|nikolai|nikolay|kosarev|k39|context|woodlands|dostigus|site|website|pages?|projects?|products?|experience|portfolio|cv|resume|stack|contact|hire|availability|publications?|cases?)\b|ник(?:а|у|ом)?(?:\s|$|[?,.!])|никола|косарев|[кk]39|контекст|вудланд|достигус|сайт|проект|продукт|стек|опыт|кейс|публикаци|стать[яию]|резюме|связаться|контакт|нанять|доступност|сотруднич/.test(text)) {
    return true
  }
  // Include other public products without maintaining a second project catalog.
  return chunks.some(({ url }) => {
    const slug = url.match(/\/projects(?:\/|#project-)([\w-]+)/)?.[1]
    return slug && text.split(/[^\p{L}\p{N}-]+/u).includes(slug)
  })
}
