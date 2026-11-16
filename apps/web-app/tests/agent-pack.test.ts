import { expect, it } from 'vitest'
import { publicKnowledge } from '../build/agent-knowledge'
import ru from '../i18n/locales/ru.json'
import { retrieve } from '../server/agent/knowledge'

it('retains long project descriptions, career chronology and public destinations', () => {
  const pack = publicKnowledge()
  const project = pack.filter((chunk) => chunk.url === '/projects/k39')
  const allText = project.map((chunk) => chunk.text).join('')
  expect(allText).toContain('https://k39.online')
  function strings(value: unknown): string[] {
    return typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : []
  }
  for (const text of strings(ru.projects.k39)) {
    // Chunk overlaps must preserve even text split at boundaries.
    for (let index = 0; index < text.length; index += 100) {
      expect(allText).toContain(text.slice(index, index + 100))
    }
  }
  expect(pack.some((chunk) => chunk.url === '/cv' && chunk.text.includes('2026-10-27'))).toBe(true)
  expect(pack.some((chunk) => chunk.url === '/projects#project-woodlands')).toBe(true)
  const found = retrieve(pack, 'Что такое K39?', '/', 'ru')
  expect(found[0]?.url).toBe('/projects/k39')
  expect(found.map((chunk) => chunk.text).join('')).toContain('https://k39.online')
})
