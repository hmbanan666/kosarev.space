import { afterEach, expect, it, vi } from 'vitest'
import { publicKnowledge } from '../build/agent-knowledge'
import { agentEvidence } from '../server/agent/evidence'
import { buildPrompt, retrieve } from '../server/agent/knowledge'

afterEach(() => vi.unstubAllGlobals())

it.each(['ru', 'en'])('recomputes current public work, activity and latest publication for each request (%s)', async (locale) => {
  const pack = publicKnowledge()
  const date = new Date().toISOString()
  let title = 'First public note'
  vi.stubGlobal('repository', { publication: {
    findAll: async () => [{ slug: 'latest', publishedAt: '2026-11-16', locales: { ru: { title }, en: { title } } }],
    findBySlug: async () => null,
  } })
  vi.stubGlobal('useStorage', () => ({ getItem: async (key: string) => key === 'pack.json'
    ? pack
    : {
        fetchedAt: date, repos: [{ name: 'kosarev.space' }], items: [
          { repo: 'kosarev.space', date, title: 'Do not include commit subjects' },
          { repo: 'unlisted-repository', date, title: 'Not public' },
        ],
      } }))
  const prompt = async () => buildPrompt(retrieve(await agentEvidence(), locale === 'ru' ? 'Что Николай делает сейчас?' : 'What is Nikolay doing now?', '/', locale), [], '/', locale)[0]!.content
  const first = await prompt()
  expect(first).toContain('Now · Сейчас')
  expect(first).toContain('Context')
  expect(first).toContain('K39')
  expect(first).toContain('kosarev.space')
  expect(first).toContain(date)
  expect(first).toContain('First public note')
  expect(first).not.toContain('unlisted-repository')
  expect(first).not.toContain('Do not include commit subjects')
  title = 'New public note'
  expect(await prompt()).toContain('New public note')
})

it.each([null, '2020-01-01T00:00:00Z'])('keeps active work but omits unavailable or stale activity (%s)', async (fetchedAt) => {
  vi.stubGlobal('repository', { publication: { findAll: async () => [] } })
  vi.stubGlobal('useStorage', () => ({ getItem: async (key: string) => key === 'pack.json'
    ? []
    : { fetchedAt, repos: [{ name: 'old-repository' }], items: [{ repo: 'old-repository', date: fetchedAt }] } }))
  const chunks = await agentEvidence()
  const now = chunks.find((chunk) => chunk.title === 'Now · Сейчас' && chunk.locale === 'en')!
  expect(now.text).toContain('Context')
  expect(now.text).not.toContain('old-repository')
  expect(JSON.parse(now.text).latestPublication).toBeNull()
  expect(JSON.parse(now.text).publicActivity.items).toEqual([])
})
