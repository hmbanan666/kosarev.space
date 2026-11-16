import { createHmac, randomBytes, randomUUID } from 'node:crypto'
import { readSse } from '../../shared/agent-stream'
import { agentEvidence } from '../agent/evidence'
import { createRateLimit, isBlockedQuestion, looksOnTopic, scopeRefusal, validateAgentRequest } from '../agent/guard'
import { buildPrompt, retrieve } from '../agent/knowledge'
import { createOutputGuard } from '../agent/output'
import { createAnswerWording } from '../agent/wording'

const limit = createRateLimit()
const salt = randomBytes(32)

export default defineEventHandler(async (event) => {
  const started = Date.now()
  setHeader(event, 'Cache-Control', 'no-store')
  const config = useRuntimeConfig(event)
  if (!config.openrouterApiKey) {
    setResponseStatus(event, 503)
    return { code: 'offline' }
  }
  const ip = getRequestIP(event, { xForwardedFor: config.agentTrustProxy === true }) ?? 'unknown'
  const retry = limit(createHmac('sha256', salt).update(ip).digest('hex'))
  if (retry) {
    setHeader(event, 'Retry-After', retry)
    setResponseStatus(event, 429)
    return { code: 'rateLimit' }
  }
  // Bound actual bytes, including chunked requests, before parsing JSON.
  const body = getRequestWebStream(event)
  const reader = body?.getReader()
  let raw = ''
  let bytes = 0
  const decoder = new TextDecoder()
  try {
    if (reader) {
      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          raw += decoder.decode()
          break
        }
        bytes += value.length
        if (bytes > 65536) {
          // Stop buffering an oversized chunked upload; close it after the 413 is sent.
          event.node.req.pause()
          event.node.res.once('finish', () => event.node.req.destroy())
          throw new Error('Body too large')
        }
        raw += decoder.decode(value, { stream: true })
      }
    }
  } catch {
    setResponseStatus(event, 413)
    return { code: 'invalid' }
  } finally {
    reader?.releaseLock()
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = null
  }
  const request = validateAgentRequest(parsed)
  if (!request) {
    setResponseStatus(event, 400)
    return { code: 'invalid' }
  }
  const question = request.messages.at(-1)!.content
  const sessionId = request.sessionId ?? randomUUID()
  const persist = (content: string, sources: { title: string, url: string }[], reason: string | null = null) => {
    const common = { sessionId, page: request.page, locale: request.locale, model: String(config.agentModel), filtered: reason === 'blocked_question' || reason === 'off_topic' || reason === 'output_guard', filteredReason: reason, latencyMs: Date.now() - started }
    // Retain background work for the request lifecycle, never await it on the SSE path.
    const write = Promise.resolve().then(() => repository.agentMessage.save([
      { ...common, role: 'user', content: question, sources: [] },
      { ...common, role: 'assistant', content, sources },
    ])).catch(() => {})
    event.waitUntil?.(write)
  }
  const blocked = isBlockedQuestion(question)
  const chunks = blocked ? [] : await agentEvidence()
  const relevant = retrieve(chunks, question, '', request.locale, 6000, 0.35)
  if (blocked || (!relevant.length && !looksOnTopic(question, chunks))) {
    const stream = createEventStream(event)
    setHeader(event, 'X-Accel-Buffering', 'no')
    const refusal = scopeRefusal(question, request.locale)
    const send = async () => {
      try {
        await stream.push(JSON.stringify({ type: 'delta', text: refusal }))
        await stream.push(JSON.stringify({ type: 'sources', sources: [] }))
        await stream.push(JSON.stringify({ type: 'done' }))
      } finally {
        persist(refusal, [], blocked ? 'blocked_question' : 'off_topic')
        await stream.close()
      }
    }
    void send().catch(() => {})
    return stream.send()
  }
  const query = request.messages.filter((message) => message.role === 'user').slice(-3).map((message) => message.content).join(' ')
  const evidence = retrieve(chunks, query, request.page, request.locale)
  const sources = [...new Map(evidence.map(({ title, url }) => [url, { title, url }])).values()]
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 45000)
  const stream = createEventStream(event)
  stream.onClosed(() => {
    controller.abort()
    clearTimeout(timer)
  })
  setHeader(event, 'X-Accel-Buffering', 'no')
  let answer = ''
  let savedSources: { title: string, url: string }[] = []
  let reason: string | null = null
  const push = (value: { type: string, text?: string, sources?: { title: string, url: string }[], code?: string }) => {
    if (value.type === 'delta') {
      answer += value.text ?? ''
    }
    if (value.sources) {
      savedSources = value.sources
    }
    return stream.push(JSON.stringify(value))
  }
  const run = async () => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${config.openrouterApiKey}`, 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ model: config.agentModel, messages: buildPrompt(evidence, request.messages, request.page, request.locale), stream: true, max_tokens: 2000, reasoning: { effort: 'low', exclude: true } }),
      })
      if (!response.ok || !response.body) {
        reason = 'provider_unavailable'
        await push({ type: 'error', code: response.status === 429 ? 'rateLimit' : 'offline' })
        return
      }
      const output = createOutputGuard(evidence)
      const wording = createAnswerWording()
      let length = 0
      let finished = false
      for await (const data of readSse(response.body)) {
        if (data === '[DONE]') {
          finished = true
          break
        }
        const chunk = JSON.parse(data)
        if (chunk.error) {
          throw new Error('Provider stream failed')
        }
        const token = chunk.choices?.[0]?.delta?.content
        if (typeof token === 'string' && token) {
          length += token.length
          const text = output.push(wording(token))
          if (text) {
            await push({ type: 'delta', text })
          }
          if (output.full) {
            finished = true
            break
          }
        }
      }
      if (!finished || !length) {
        throw new Error('Incomplete stream')
      }
      const tail = output.push(wording('', true), true)
      if (tail) {
        await push({ type: 'delta', text: tail })
      }
      if (output.filtered) {
        reason = 'output_guard'
      }
      if (output.empty) {
        await push({ type: 'delta', text: scopeRefusal(question, request.locale) })
      }
      await push({ type: 'sources', sources: output.empty ? [] : sources })
      await push({ type: 'done' })
    } catch {
      reason = controller.signal.aborted ? 'interrupted' : 'provider_error'
      await push({ type: 'error', code: 'error' }).catch(() => {})
    } finally {
      persist(answer, savedSources, reason)
      clearTimeout(timer)
      controller.abort()
      await stream.close()
    }
  }
  void run()
  return stream.send()
})
