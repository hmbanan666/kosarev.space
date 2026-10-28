import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import pg from 'pg'
import { it } from 'vitest'
import { applyPlan, planContent, validateContent } from '../scripts/case-content.mjs'

const connectionString = process.env.CASE_CONTENT_TEST_DATABASE_URL
if (!connectionString) {
  throw new Error('Set CASE_CONTENT_TEST_DATABASE_URL to an isolated test database')
}

function content(key = 'example', title = 'Original title') {
  return {
    key,
    create: { project: 'test', tags: ['Nuxt'], icon: 'i-lucide-code', image: null },
    translations: ['ru', 'en'].map((locale) => ({ locale, title, description: 'Description', task: 'Task', solution: 'Solution', result: 'Result' })),
  }
}

async function withDatabase(run) {
  const client = new pg.Client({ connectionString })
  const schema = `case_content_${randomUUID().replaceAll('-', '')}`
  await client.connect()
  try {
    await client.query(`CREATE SCHEMA "${schema}"`)
    await client.query(`SET search_path TO "${schema}"`)
    for (const file of ['0000_illegal_radioactive_man.sql', '0001_early_argent.sql']) {
      const migration = await readFile(new URL(`../migrations/${file}`, import.meta.url), 'utf8')
      await client.query(migration.replaceAll('"public".', `"${schema}".`))
    }
    await run(client)
  } finally {
    await client.query('ROLLBACK')
    await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
    await client.end()
  }
}

it('validates complete bilingual content and refuses missing historical cases', async () => {
  assert.throws(() => validateContent([{ ...content(), translations: [content().translations[0]] }]), /exactly RU and EN/)
  assert.throws(() => validateContent([content(), content()]), /unique slugs/)
  await withDatabase(async (client) => {
    await assert.rejects(planContent(client, [{ key: 'missing', translations: content().translations }]), /refusing to recreate/)
  })
})

it('plans without writes, applies idempotently, and rolls back a new case', async () => {
  await withDatabase(async (client) => {
    const plan = await planContent(client, [content()])
    assert.equal((await client.query('SELECT * FROM cases')).rowCount, 0)
    await applyPlan(client, plan)
    await applyPlan(client, plan)
    assert.equal((await client.query('SELECT * FROM cases')).rowCount, 1)
    assert.equal((await client.query('SELECT * FROM case_translations')).rowCount, 2)
    assert.equal((await planContent(client, [content()])).changes.length, 0)
    await applyPlan(client, plan, true)
    await applyPlan(client, plan, true)
    assert.equal((await client.query('SELECT * FROM cases')).rowCount, 0)
  })
})

it('updates only requested content, preserving IDs, metadata, other locales and engagement', async () => {
  await withDatabase(async (client) => {
    const seed = await planContent(client, [content(), content('untouched')])
    await applyPlan(client, seed)
    const id = seed.changes[0].after.id
    await client.query('INSERT INTO case_translations (id, case_id, locale, title, description, task, solution, result) VALUES (\'de\', $1, \'de\', \'German\', \'\', \'\', \'\', \'\')', [id])
    await client.query('INSERT INTO case_views (id, case_id, ip_hash) VALUES (\'view\', $1, \'visitor\')', [id])
    await client.query('INSERT INTO case_reactions (id, case_id, ip_hash, emoji) VALUES (\'reaction\', $1, \'visitor\', \'👍\')', [id])
    const before = (await client.query('SELECT id, case_id, locale, title FROM case_translations ORDER BY id')).rows
    const casesBefore = (await client.query('SELECT * FROM cases ORDER BY id')).rows
    const plan = await planContent(client, [content('example', 'Reviewed title')])
    await applyPlan(client, plan)
    assert.equal((await client.query('SELECT title FROM case_translations WHERE case_id = $1 AND locale = \'en\'', [id])).rows[0].title, 'Reviewed title')
    assert.deepEqual((await client.query('SELECT * FROM cases ORDER BY id')).rows, casesBefore)
    await applyPlan(client, plan, true)
    assert.deepEqual((await client.query('SELECT id, case_id, locale, title FROM case_translations ORDER BY id')).rows, before)
    assert.equal((await client.query('SELECT * FROM case_views')).rowCount, 1)
    assert.equal((await client.query('SELECT * FROM case_reactions')).rowCount, 1)
  })
})

it('rejects stale content atomically even after an earlier item was processed', async () => {
  await withDatabase(async (client) => {
    await applyPlan(client, await planContent(client, [content('first'), content('second')]))
    const plan = await planContent(client, [content('first', 'New first'), content('second', 'New second')])
    await client.query('UPDATE case_translations SET title = \'Concurrent edit\' WHERE case_id = (SELECT id FROM cases WHERE key = \'second\')')
    await assert.rejects(applyPlan(client, plan), /content changed since planning/)
    assert.equal((await client.query('SELECT title FROM case_translations WHERE case_id = (SELECT id FROM cases WHERE key = \'first\') LIMIT 1')).rows[0].title, 'Original title')
  })
})

it('rejects a different target and preserves later edits during rollback', async () => {
  await withDatabase(async (client) => {
    const plan = await planContent(client, [content()])
    await assert.rejects(applyPlan(client, { ...plan, target: { ...plan.target, database: 'another-database' } }), /different database target/)
    await applyPlan(client, plan)
    await client.query('UPDATE case_translations SET title = \'Later approved copy\' WHERE locale = \'ru\'')
    await assert.rejects(applyPlan(client, plan, true), /content changed since planning/)
    assert.equal((await client.query('SELECT * FROM cases')).rowCount, 1)
  })
})

it('refuses rollback deletion of a newly published case with engagement', async () => {
  await withDatabase(async (client) => {
    const plan = await planContent(client, [content()])
    await applyPlan(client, plan)
    await client.query('INSERT INTO case_views (id, case_id, ip_hash) VALUES (\'view\', $1, \'visitor\')', [plan.changes[0].after.id])
    await assert.rejects(applyPlan(client, plan, true), /refusing destructive rollback/)
    assert.equal((await client.query('SELECT * FROM cases')).rowCount, 1)
    assert.equal((await client.query('SELECT * FROM case_views')).rowCount, 1)
  })
})
