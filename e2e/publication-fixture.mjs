import { createRequire } from 'node:module'
import process from 'node:process'
import { publishRevision, saveDraft } from '../packages/database/scripts/publication.mjs'

const require = createRequire(new URL('../packages/database/package.json', import.meta.url))
const { Client } = require('pg')

export const fixture = {
  slug: 'k39-draft-permissions',
  type: 'article',
  locales: {
    ru: { title: 'Тестовая публикация', description: 'Синтетическое описание для проверки интерфейса.', body: 'Тестовый текст из базы.\n\n## Проверка {#verification}\n\n- Первый пункт\n- Второй пункт\n\n[Источник](https://example.com/source)\n\n```sh\necho test\n  indented\n```' },
    en: { title: 'Fixture publication', description: 'Synthetic description for interface verification.', body: 'Fixture text from the database.\n\n## Verification {#verification}\n\n- First item\n- Second item\n\n[Source](https://example.com/source)\n\n```sh\necho test\n  indented\n```' },
  },
  relatedWork: [{ kind: 'project', key: 'k39', title: { ru: 'K39', en: 'K39' } }],
}

export async function openTestDatabase() {
  const url = process.env.CASE_CONTENT_TEST_DATABASE_URL
  if (!url || url !== process.env.NUXT_DATABASE_URL) {
    throw new Error('E2E requires matching explicit CASE_CONTENT_TEST_DATABASE_URL and NUXT_DATABASE_URL')
  }
  const parsed = new URL(url)
  if (!['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) || !parsed.pathname.endsWith('_test')) {
    throw new Error('Publication E2E fixtures require a local database ending in _test')
  }
  const client = new Client({ connectionString: url })
  await client.connect()
  return client
}

export async function removeFixture(client, slug) {
  await client.query('BEGIN')
  try {
    await client.query('UPDATE publications SET published_revision = NULL WHERE slug = $1', [slug])
    await client.query('DELETE FROM publication_revisions WHERE slug = $1', [slug])
    await client.query('DELETE FROM publications WHERE slug = $1', [slug])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

export default async function setup() {
  const client = await openTestDatabase()
  try {
    await removeFixture(client, fixture.slug)
    await removeFixture(client, 'unpublished-fixture')
    const saved = await saveDraft(client, fixture)
    await publishRevision(client, saved.slug, saved.revision, null, '2026-10-28')
    await saveDraft(client, { ...fixture, slug: 'unpublished-fixture' })
  } finally {
    await client.end()
  }
}
