import { describe, expect, it } from 'vitest'
import { caseContextQuery, filterCases, readCaseFilters } from '../app/utils/case-finder'

const examples = [
  { key: 'legacy-import', title: 'Data migration', description: 'Invoice reconciliation and retry handling', tags: ['PostgreSQL', 'Node.js'] },
  { key: 'web-catalog', title: 'Catalog', description: 'Каталог товаров с поиском', tags: ['Nuxt'] },
  { key: 'build-cache', title: 'Cached builds', description: 'Repeated delivery builds', tags: ['Docker', 'CI/CD'] },
]

describe('case discovery and shared context', () => {
  it('finds problems in descriptions as well as titles, technology and project keys', () => {
    expect(filterCases(examples, readCaseFilters({ q: 'INVOICE' })).map((item) => item.key)).toEqual(['legacy-import'])
    expect(filterCases(examples, readCaseFilters({ q: 'товаров' })).map((item) => item.key)).toEqual(['web-catalog'])
    expect(filterCases(examples, readCaseFilters({ q: 'build-cache' })).map((item) => item.key)).toEqual(['build-cache'])
  })
  it('combines responsibility and technology without treating every backend task as infrastructure', () => {
    expect(filterCases(examples, readCaseFilters({ focus: 'delivery' })).map((item) => item.key)).toEqual(['build-cache'])
    expect(filterCases(examples, readCaseFilters({ focus: 'systems', tech: 'Nuxt' }))).toEqual([])
  })
  it('ignores malformed route values and limits user-provided text', () => {
    expect(readCaseFilters({ q: ['a', 'b'], focus: 'unknown', tech: { name: 'Docker' } })).toEqual({ q: '', focus: '', tech: '', all: false })
    expect(readCaseFilters({ q: 'x'.repeat(300) }).q).toHaveLength(100)
  })
  it('preserves only supported context when moving between results and cases', () => {
    expect(caseContextQuery({ q: ' cache ', focus: 'delivery', all: '1', next: 'https://example.com' })).toEqual({ q: 'cache', focus: 'delivery', all: '1' })
    expect(caseContextQuery({ focus: 'invalid', all: 'false' })).toEqual({})
  })
})
