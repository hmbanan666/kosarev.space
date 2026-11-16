import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import pg from 'pg'
import { expect, it } from 'vitest'
import { repository, useCreateDatabase, useDatabase } from '../src/index.ts'

it('migrates and saves anonymous user and filtered assistant turns with queryable metadata', async () => {
  const url = new URL(process.env.CASE_CONTENT_TEST_DATABASE_URL)
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !url.pathname.endsWith('_test')) {
    throw new Error('A local test database is required')
  }
  const client = new pg.Client({ connectionString: url.href })
  const schema = `agent_${randomUUID().replaceAll('-', '')}`
  await client.connect()
  try {
    await client.query(`CREATE SCHEMA "${schema}"`)
    await client.query(`SET search_path TO "${schema}"`)
    await client.query(await readFile(new URL('../migrations/0003_agent_messages.sql', import.meta.url), 'utf8'))
    url.searchParams.set('options', `-c search_path=${schema}`)
    useCreateDatabase(url.href)
    const sessionId = randomUUID()
    const common = { sessionId, page: '/contact', locale: 'ru', model: 'fixture', filtered: true, filteredReason: 'blocked_question', sources: [], latencyMs: 12 }
    await repository.agentMessage.save([
      { ...common, role: 'user', content: 'Synthetic question' },
      { ...common, role: 'assistant', content: 'Synthetic refusal' },
    ])
    const { rows } = await client.query('SELECT * FROM agent_messages WHERE session_id = $1 AND created_at > now() - interval \'1 minute\' ORDER BY role DESC', [sessionId])
    expect(rows).toHaveLength(2)
    expect(rows.map(({ role }) => role)).toEqual(['user', 'assistant'])
    for (const row of rows) {
      expect(row).toMatchObject({ session_id: sessionId, page: '/contact', locale: 'ru', model: 'fixture', filtered: true, filtered_reason: 'blocked_question', sources: [], latency_ms: 12 })
      expect(row.id).toBeTruthy()
      expect(row.created_at).toBeInstanceOf(Date)
      expect(row).not.toHaveProperty('ip')
      expect(row).not.toHaveProperty('user_agent')
    }
    expect(rows[0].id).not.toBe(rows[1].id)
  } finally {
    await useDatabase().$client.end()
    await client.query(`DROP SCHEMA "${schema}" CASCADE`)
    await client.end()
  }
})
