import { afterEach, expect, it, vi } from 'vitest'

const log = vi.hoisted(() => vi.fn())
vi.mock('../server/utils/logger', () => ({ useLogger: () => ({ info: log }) }))
afterEach(() => vi.unstubAllGlobals())

it.each(['application/json', 'text/event-stream'])('reads a stateless %s MCP response using the real SDK and an entirely synthetic fetch', async (contentType) => {
  vi.resetModules()
  const token = 'synthetic-transport-credential'
  const fetch = vi.fn(async (url: URL, options: RequestInit) => {
    expect(String(url)).toBe('https://memory.invalid/mcp')
    expect(new Headers(options.headers).get('authorization')).toBe(`Bearer ${token}`)
    expect(new Headers(options.headers).has('mcp-session-id')).toBe(false)
    expect(options.body ?? '').not.toContain(token)
    if (options.method === 'GET') {
      return new Response(null, { status: 405 })
    }
    const message = JSON.parse(options.body as string)
    if (message.method === 'notifications/initialized') {
      return new Response(null, { status: 202 })
    }
    const result = message.method === 'initialize'
      ? { protocolVersion: message.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: 'fixture', version: '1' } }
      : { structuredContent: { version: 1, scope: 'site', mode: 'search', grounding: 'strong', items: [], sources: [{ excerpt: { text: 'Synthetic owner note.', truncated: false } }] }, content: [] }
    if (message.method !== 'initialize') {
      expect(message).toMatchObject({ method: 'tools/call', params: { name: 'search', arguments: { scope: 'site', project: 'kosarev-space', query: 'Why K39?', k: 4 } } })
    }
    const body = JSON.stringify({ jsonrpc: '2.0', id: message.id, result })
    return new Response(contentType === 'application/json' ? body : `event: message\ndata: ${body}\n\n`, { headers: { 'Content-Type': contentType } })
  })
  vi.stubGlobal('fetch', fetch)
  const { lookupMemory } = await import('../server/agent/memory')
  const config = { contextUrl: 'https://memory.invalid/mcp', contextToken: token, contextScope: 'site', contextProject: 'kosarev-space', contextTimeoutMs: 1500 }
  for (let index = 0; index < 2; index++) {
    expect(await lookupMemory(config, 'Why K39?')).toEqual({ grounding: 'strong', excerpts: ['Synthetic owner note.'] })
  }
  const messages = fetch.mock.calls.filter(([, options]) => options.body).map(([, options]) => JSON.parse(options.body as string).method)
  expect(messages).toEqual(['initialize', 'notifications/initialized', 'tools/call', 'tools/call'])
  expect(JSON.stringify(log.mock.calls)).not.toContain(token)
})
