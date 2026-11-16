import { afterEach, expect, it, vi } from 'vitest'
import { cvSkillGroups } from '../app/utils/cv'
import { publicKnowledge } from '../build/agent-knowledge'
import { agentEvidence } from '../server/agent/evidence'
import { buildPrompt, retrieve } from '../server/agent/knowledge'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

it.each(['ru', 'en'])('supplies the live Profile without a knowledge pack or keyword overlap (%s)', async (locale) => {
  vi.stubGlobal('repository', { publication: { findAll: async () => [] } })
  vi.stubGlobal('useStorage', () => ({ getItem: async () => null }))
  const chunks = await agentEvidence()
  const profile = chunks.find((chunk) => chunk.title === 'Profile · Стек' && chunk.locale === locale)!
  const prefix = locale === 'en' ? '/en' : ''
  expect(profile).toBeDefined()
  expect(profile.url).toBe(`${prefix}/cv#cv-skills`)
  // The exact public fields exclude role/company copy and other CV data.
  expect(JSON.parse(profile.text)).toEqual({ stack: cvSkillGroups, links: expect.any(String) })
  expect(profile.text).toContain(`](${prefix}/cv)`)
  expect(profile.text).toContain(`](${prefix}/contact)`)
  for (const question of [locale === 'ru' ? 'можешь кодить на golang?' : 'Can you code in golang?', 'K39', 'contact', 'now']) {
    const selected = retrieve(chunks, question, prefix || '/', locale)
    expect(selected).toContain(profile)
    const prompt = buildPrompt(selected, [], '/', locale)[0]!.content
    for (const tool of ['TypeScript', 'Vue', 'Nuxt', 'Node.js', 'PostgreSQL']) {
      expect(prompt).toContain(tool)
    }
    expect(prompt).toContain('If the asked tool (for example Go/golang) is absent')
    expect(prompt).toContain('then state the documented core stack from Profile')
    expect(prompt).toContain(`](${prefix}/contact)`)
  }
})

it.each(['ru', 'en'])('recomputes current public work, activity and latest publication for each request (%s)', async (locale) => {
  const pack = publicKnowledge()
  const date = '2026-11-16T22:00:00.000Z'
  vi.setSystemTime(new Date(date))
  let title = 'First public note'
  vi.stubGlobal('repository', { publication: {
    findAll: async () => [{ slug: 'latest', publishedAt: '2026-11-16', locales: { ru: { title }, en: { title } } }],
    findBySlug: async () => null,
  } })
  vi.stubGlobal('useStorage', () => ({ getItem: async (key: string) => key === 'pack.json'
    ? pack
    : {
        fetchedAt: date, repos: [{ name: 'kosarev.space' }], items: [
          { kind: 'commit', repo: 'kosarev.space', date, title: 'Do not include commit subjects' },
          { kind: 'commit', repo: 'unlisted-repository', date, title: 'Not public' },
          { kind: 'pr', repo: 'kosarev.space', date: '2026-11-16T23:00:00Z' },
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
  expect(first).toContain('include 1-2 latest public commits')
  expect(first).toContain('repository name plus readable time')
  expect(first).toContain(locale === 'en' ? '16 Nov 2026' : '16 нояб. 2026')
  title = 'New public note'
  expect(await prompt()).toContain('New public note')
})

it('keeps at most three recent allowlisted commits in newest-first order, excluding other events', async () => {
  vi.setSystemTime(new Date('2026-11-16T22:00:00Z'))
  vi.stubGlobal('repository', { publication: { findAll: async () => [] } })
  vi.stubGlobal('useStorage', () => ({ getItem: async (key: string) => key === 'pack.json'
    ? []
    : {
        fetchedAt: '2026-11-16T21:00:00Z', repos: [{ name: 'kosarev.space' }], items: [
          ...['2026-11-10', '2026-11-13', '2026-11-12', '2026-11-11', '2026-01-01', '2027-01-01'].map((date) => ({ kind: 'commit', repo: 'kosarev.space', date })),
          { kind: 'pr', repo: 'kosarev.space', date: '2026-11-15' },
          { kind: 'release', repo: 'kosarev.space', date: '2026-11-14' },
          { kind: 'commit', repo: 'unlisted-repository', date: '2026-11-16' },
        ],
      } }))
  const now = (await agentEvidence()).find((chunk) => chunk.title === 'Now · Сейчас' && chunk.locale === 'en')!
  expect(JSON.parse(now.text).publicActivity.items).toEqual([
    { repo: 'kosarev.space', date: '2026-11-13', displayDate: '13 Nov 2026' },
    { repo: 'kosarev.space', date: '2026-11-12', displayDate: '12 Nov 2026' },
    { repo: 'kosarev.space', date: '2026-11-11', displayDate: '11 Nov 2026' },
  ])
})

it.each([null, '2020-01-01T00:00:00Z', '2099-01-01T00:00:00Z'])('keeps active work but omits unavailable, stale or future activity (%s)', async (fetchedAt) => {
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

it('omits old commits even when the snapshot itself is fresh', async () => {
  vi.setSystemTime(new Date('2026-11-16T22:00:00Z'))
  vi.stubGlobal('repository', { publication: { findAll: async () => [] } })
  vi.stubGlobal('useStorage', () => ({ getItem: async (key: string) => key === 'pack.json'
    ? []
    : { fetchedAt: '2026-11-16T21:00:00Z', repos: [{ name: 'kosarev.space' }], items: [{ kind: 'commit', repo: 'kosarev.space', date: '2026-01-01' }] } }))
  const now = (await agentEvidence()).find((chunk) => chunk.title === 'Now · Сейчас' && chunk.locale === 'en')!
  expect(JSON.parse(now.text).publicActivity.items).toEqual([])
})
