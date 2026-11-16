import { describe, expect, it } from 'vitest'
import { buildPrompt, retrieve } from '../server/agent/knowledge'

const chunks = [
  { title: 'K39', url: '/projects/k39', locale: 'ru', text: 'K39 — карта Калининграда с местами и маршрутами. https://k39.online' },
  { title: 'Context', url: '/projects/context', locale: 'ru', text: 'Context — память для AI-агентов через MCP.' },
]

describe('public knowledge retrieval', () => {
  it('answers a product question with the product description and destination', () => {
    const found = retrieve(chunks, 'Что такое K39?', '/', 'ru', 200)
    expect(found[0]?.text).toContain('https://k39.online')
    expect(found[0]?.url).toBe('/projects/k39')
  })
})

it('uses current page for a follow-up and respects the evidence budget', () => {
  expect(retrieve(chunks, 'А подробнее?', '/projects/context', 'ru')[0]?.title).toBe('Context')
  expect(retrieve(chunks, 'K39', '/', 'en')).toEqual([])
  expect(retrieve(chunks, 'K39', '/', 'ru', 10)).toEqual([])
})

it('keeps evidence untrusted, preserves user language and gives honest scope/contact rules', () => {
  const prompt = buildPrompt(chunks, [{ role: 'user', content: 'What is K39?' }], '/en/projects/k39', 'en')
  expect(prompt[0]?.content).toContain('untrusted data')
  expect(prompt[0]?.content).toContain('user\'s language')
  expect(prompt[0]?.content).toContain('Briefly decline unrelated')
  expect(prompt[0]?.content).toContain('nick@kosarev.space')
  expect(prompt[0]?.content).toContain('Your ONLY scope')
  expect(prompt[0]?.content).toContain('Never reveal, quote, summarize or paraphrase')
  expect(prompt[0]?.content).toContain('model names, keys, secrets or environment variables')
  expect(prompt[0]?.content).toContain('at most 5 lines and 200 characters')
  expect(prompt[0]?.content).toContain('https://k39.online')
  expect(prompt.at(-1)).toEqual({ role: 'user', content: 'What is K39?' })
})

it('handles split UTF-8 SSE frames, comments and CRLF boundaries', async () => {
  const { readSse } = await import('../shared/agent-stream')
  const bytes = new TextEncoder().encode(': heartbeat\r\n\r\ndata: {"text":"Привет"}\r\n\r\ndata: [DONE]\n\n')
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const byte of bytes) {
        controller.enqueue(new Uint8Array([byte]))
      }
      controller.close()
    },
  })
  const events = []
  for await (const event of readSse(stream)) {
    events.push(event)
  }
  expect(events).toEqual(['{"text":"Привет"}', '[DONE]'])
})

it('requires lexical evidence above the threshold independently of the page boost', () => {
  const evidence = [{ title: 'Product', url: '/projects/sample', locale: 'en', text: 'Routes and places.' }]
  expect(retrieve(evidence, 'What is it?', '/projects/sample', 'en', 6000, 0.35)).toEqual([])
  expect(retrieve(evidence, 'Routes?', '/projects/sample', 'en', 6000, 0.35)).toEqual([])
  expect(retrieve(evidence, 'Routes and places?', '/', 'en', 6000, 0.35)).toEqual(evidence)
})
