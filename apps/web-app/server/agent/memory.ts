import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { useLogger } from '../utils/logger'

export interface MemoryConfig {
  contextUrl: string
  contextToken: string
  contextScope: string
  contextProject: string
  contextTimeoutMs: number
}
export interface MemoryEvidence { grounding: 'strong' | 'weak', excerpts: string[] }
interface Connection { url: string, token: string, client: Client, ready: Promise<void>, closed: boolean }
let connection: Connection | undefined

function discard(current: Connection) {
  if (current.closed) {
    return
  }
  current.closed = true
  if (connection === current) {
    connection = undefined
  }
  // Closing aborts the transport, including initialization and open SSE responses.
  void current.client.close().catch(() => {})
}

function connect(config: MemoryConfig, signal: AbortSignal): Connection {
  if (connection && (connection.url !== config.contextUrl || connection.token !== config.contextToken)) {
    discard(connection)
  }
  if (!connection) {
    const transport = new StreamableHTTPClientTransport(new URL(config.contextUrl), {
      requestInit: { headers: { Authorization: `Bearer ${config.contextToken}` }, redirect: 'error' },
    })
    const client = new Client({ name: 'kosarev-space-memory', version: '1.0.0' })
    const current: Connection = { url: config.contextUrl, token: config.contextToken, client, ready: Promise.resolve(), closed: false }
    connection = current
    client.onerror = () => discard(current)
    client.onclose = () => discard(current)
    current.ready = client.connect(transport, { signal }).catch(() => {
      discard(current)
      throw new Error('Memory connection failed')
    })
    return current
  }
  return connection
}

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function parseMemory(response: unknown, scope: string): MemoryEvidence | null {
  if (!object(response) || response.isError) {
    throw new Error('Memory tool failed')
  }
  let data = response.structuredContent
  if (data === undefined && Array.isArray(response.content)) {
    const first = response.content[0]
    if (object(first) && first.type === 'text' && typeof first.text === 'string') {
      data = JSON.parse(first.text)
    }
  }
  if (!object(data) || !['string', 'number'].includes(typeof data.version) || data.scope !== scope || data.mode !== 'search'
    || !['strong', 'weak', 'none'].includes(String(data.grounding)) || !Array.isArray(data.sources) || !Array.isArray(data.items)) {
    throw new Error('Invalid memory result')
  }
  if (data.grounding === 'none') {
    return null
  }
  const excerpts: string[] = []
  for (const source of data.sources.slice(0, 4)) {
    if (!object(source) || !object(source.excerpt) || typeof source.excerpt.text !== 'string' || typeof source.excerpt.truncated !== 'boolean') {
      throw new Error('Invalid memory excerpt')
    }
    const text = source.excerpt.text.trim().slice(0, 600)
    if (text) {
      excerpts.push(text)
    }
  }
  return excerpts.length ? { grounding: data.grounding as 'strong' | 'weak', excerpts } : null
}

export async function lookupMemory(config: MemoryConfig, question: string): Promise<MemoryEvidence | null> {
  const started = Date.now()
  let status: 'disabled' | 'ok' | 'timeout' | 'error' = 'disabled'
  let memory: MemoryEvidence | null = null
  let current: Connection | undefined
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  let onAbort: (() => void) | undefined
  try {
    if (!config.contextUrl || !config.contextToken) {
      return null
    }
    status = 'error'
    const timeout = Number(config.contextTimeoutMs)
    timer = setTimeout(() => controller.abort(), Number.isFinite(timeout) && timeout > 0 ? timeout : 1500)
    const aborted = new Promise<never>((_resolve, reject) => {
      onAbort = () => reject(new Error('Memory timeout'))
      controller.signal.addEventListener('abort', onAbort, { once: true })
    })
    const active = connect(config, controller.signal)
    current = active
    const lookup = async () => {
      await active.ready
      controller.signal.throwIfAborted()
      if (active.closed) {
        throw new Error('Memory disconnected')
      }
      return active.client.callTool({ name: 'search', arguments: {
        scope: config.contextScope, project: config.contextProject, query: question.trim().slice(0, 500), k: 4,
      } }, undefined, { signal: controller.signal })
    }
    memory = parseMemory(await Promise.race([lookup(), aborted]), config.contextScope)
    status = 'ok'
    return memory
  } catch {
    status = controller.signal.aborted ? 'timeout' : 'error'
    if (current) {
      discard(current)
    }
    return null
  } finally {
    clearTimeout(timer)
    if (onAbort) {
      controller.signal.removeEventListener('abort', onAbort)
    }
    useLogger().info(JSON.stringify({ event: 'agent_memory', status, grounding: memory?.grounding ?? 'none', hits: memory?.excerpts.length ?? 0, ms: Date.now() - started }))
  }
}
