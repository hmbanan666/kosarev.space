import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import pg from 'pg'
import { it } from 'vitest'
import { exportRevision, publishRevision, revisionOf, saveDraft, validatePublication } from '../scripts/publication.mjs'

const connectionString = process.env.CASE_CONTENT_TEST_DATABASE_URL
if (!connectionString) {
  throw new Error('Set CASE_CONTENT_TEST_DATABASE_URL to an isolated test database')
}

function content(title = 'Original', slug = 'example') {
  return { slug, type: 'note', locales: { ru: { title, description: 'Описание', body: 'Исходный текст' }, en: { title, description: 'Description', body: 'Original text' } }, relatedWork: [] }
}

async function withDatabase(run) {
  const client = new pg.Client({ connectionString })
  const schema = `publication_${randomUUID().replaceAll('-', '')}`
  await client.connect()
  try {
    await client.query(`CREATE SCHEMA "${schema}"`)
    await client.query(`SET search_path TO "${schema}"`)
    const sql = await readFile(new URL('../migrations/0002_workable_captain_britain.sql', import.meta.url), 'utf8')
    await client.query(sql.replaceAll('"public".', `"${schema}".`))
    await run(client, schema)
  } finally {
    await client.query('ROLLBACK')
    await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
    await client.end()
  }
}

async function live(client) {
  return (await client.query('SELECT p.slug, p.published_at::text, r.content FROM publications p JOIN publication_revisions r ON r.slug = p.slug AND r.id = p.published_revision ORDER BY p.slug')).rows
}

it('validates both locales, bounded fields and relationships before saving', () => {
  assert.throws(() => validatePublication({ ...content(), locales: { ru: content().locales.ru } }), /RU and EN/)
  assert.throws(() => validatePublication({ ...content(), slug: '../unsafe' }), /valid slug/)
  assert.throws(() => validatePublication({ ...content(), type: 'news' }), /publication type/)
  assert.throws(() => validatePublication({ ...content(), relatedWork: [{ kind: 'project', key: 'a', title: { ru: '', en: '' } }] }), /Related work/)
  assert.equal(revisionOf(content()), revisionOf({ relatedWork: [], locales: content().locales, type: 'note', slug: 'example' }))
})

it('keeps drafts private and publishes both languages of the exact reviewed revision', async () => {
  await withDatabase(async (client) => {
    const first = await saveDraft(client, content())
    const second = await saveDraft(client, content('Later unapproved'))
    assert.deepEqual(await live(client), [])
    await publishRevision(client, first.slug, first.revision, null, '2026-10-28')
    const [row] = await live(client)
    assert.equal(row.content.locales.ru.title, 'Original')
    assert.equal(row.content.locales.en.title, 'Original')
    assert.equal(row.published_at, '2026-10-28')
    assert.equal((await exportRevision(client, second.slug, second.revision)).locales.en.title, 'Later unapproved')
    assert.equal((await client.query('SELECT * FROM publication_revisions')).rowCount, 2)
  })
})

it('rejects stale publication, supports idempotence and rolls back without changing the date', async () => {
  await withDatabase(async (client) => {
    const first = await saveDraft(client, content())
    await saveDraft(client, content())
    await publishRevision(client, first.slug, first.revision, null, '2026-10-27')
    await publishRevision(client, first.slug, first.revision, null, '2026-10-27')
    const second = await saveDraft(client, content('Approved change'))
    await assert.rejects(publishRevision(client, second.slug, second.revision, null), /Live revision changed/)
    assert.equal((await live(client))[0].content.locales.en.title, 'Original')
    await publishRevision(client, second.slug, second.revision, first.revision)
    await publishRevision(client, first.slug, first.revision, second.revision)
    assert.equal((await live(client))[0].content.locales.en.title, 'Original')
    assert.equal((await live(client))[0].published_at, '2026-10-27')
    assert.equal((await client.query('SELECT * FROM publication_revisions')).rowCount, 2)
    await assert.rejects(publishRevision(client, first.slug, first.revision, first.revision, '2026-10-28'), /cannot be changed/)
  })
})

it('rejects changed stored content and cross-publication selection', async () => {
  await withDatabase(async (client) => {
    const first = await saveDraft(client, content())
    const other = await saveDraft(client, content('Other', 'other'))
    await assert.rejects(publishRevision(client, first.slug, other.revision, null), /not found/)
    await assert.rejects(client.query('UPDATE publications SET published_revision = $1 WHERE slug = $2', [other.revision, first.slug]), /foreign key/)
    await client.query('UPDATE publication_revisions SET content = $1 WHERE id = $2', [content('Changed'), first.revision])
    await assert.rejects(publishRevision(client, first.slug, first.revision, null), /digest/)
    assert.deepEqual(await live(client), [])
  })
})

it('serializes competing publications so a stale caller cannot overwrite the winner', async () => {
  await withDatabase(async (client, schema) => {
    const first = await saveDraft(client, content())
    const second = await saveDraft(client, content('Second'))
    const other = new pg.Client({ connectionString })
    await other.connect()
    try {
      await other.query(`SET search_path TO "${schema}"`)
      const results = await Promise.allSettled([
        publishRevision(client, first.slug, first.revision, null),
        publishRevision(other, second.slug, second.revision, null),
      ])
      assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1)
      assert.equal(results.filter((r) => r.status === 'rejected').length, 1)
      assert.equal((await live(client)).length, 1)
    } finally {
      await other.end()
    }
  })
})
