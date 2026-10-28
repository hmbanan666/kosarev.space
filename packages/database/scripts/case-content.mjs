import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import pg from 'pg'

const textFields = ['title', 'description', 'task', 'solution', 'result']

export function validateContent(content) {
  if (!Array.isArray(content) || !content.length) {
    throw new Error('Content must be a non-empty array')
  }
  const keys = new Set()
  for (const item of content) {
    if (typeof item?.key !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.key) || keys.has(item.key)) {
      throw new Error('Case keys must be unique slugs')
    }
    keys.add(item.key)
    if (!Array.isArray(item.translations)
      || item.translations.length !== 2
      || new Set(item.translations.map((t) => t.locale)).size !== 2) {
      throw new Error(`${item.key}: provide exactly RU and EN translations`)
    }
    for (const translation of item.translations) {
      if (!['ru', 'en'].includes(translation.locale)
        || textFields.some((field) => typeof translation[field] !== 'string' || !translation[field].trim())) {
        throw new Error(`${item.key}: invalid translation`)
      }
    }
    if (item.create && (typeof item.create.project !== 'string' || !item.create.project
      || typeof item.create.icon !== 'string' || !item.create.icon
      || !Array.isArray(item.create.tags) || item.create.tags.some((tag) => typeof tag !== 'string')
      || (item.create.image !== null && typeof item.create.image !== 'string'))) {
      throw new Error(`${item.key}: invalid creation metadata`)
    }
  }
}

async function targetOf(client) {
  const { rows: [identity] } = await client.query('SELECT current_database() AS database, current_schema() AS schema')
  return { host: client.connectionParameters.host, port: client.connectionParameters.port, ...identity }
}

async function readCase(client, key) {
  const { rows: [item] } = await client.query('SELECT id, key, project, tags, icon, image FROM cases WHERE key = $1', [key])
  if (!item) {
    return null
  }
  const { rows: translations } = await client.query(
    'SELECT id, locale, title, description, task, solution, result FROM case_translations WHERE case_id = $1 ORDER BY locale',
    [item.id],
  )
  return { ...item, translations }
}

export async function planContent(client, content) {
  validateContent(content)
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
  try {
    const plan = { version: 1, target: await targetOf(client), changes: [] }
    for (const item of content) {
      const before = await readCase(client, item.key)
      if (!before && !item.create) {
        throw new Error(`${item.key}: existing case not found; refusing to recreate it`)
      }
      const after = before
        ? structuredClone(before)
        : {
            id: randomUUID(),
            key: item.key,
            project: item.create.project,
            tags: item.create.tags,
            icon: item.create.icon,
            image: item.create.image,
            translations: [],
          }
      for (const translation of item.translations) {
        const existing = after.translations.find((t) => t.locale === translation.locale)
        const next = {
          id: existing?.id ?? randomUUID(),
          locale: translation.locale,
          ...Object.fromEntries(textFields.map((field) => [field, translation[field]])),
        }
        if (existing) {
          Object.assign(existing, next)
        } else {
          after.translations.push(next)
        }
      }
      after.translations.sort((a, b) => a.locale.localeCompare(b.locale))
      if (!isDeepStrictEqual(before, after)) {
        plan.changes.push({ key: item.key, before, after })
      }
    }
    await client.query('COMMIT')
    return plan
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

async function writeCase(client, expected, desired) {
  if (!desired) {
    const { rows: [engagement] } = await client.query(
      'SELECT EXISTS(SELECT 1 FROM case_views WHERE case_id = $1) OR EXISTS(SELECT 1 FROM case_reactions WHERE case_id = $1) AS present',
      [expected.id],
    )
    if (engagement.present) {
      throw new Error(`${expected.key}: has views/reactions; refusing destructive rollback`)
    }
    await client.query('DELETE FROM cases WHERE id = $1', [expected.id])
    return
  }
  if (!expected) {
    await client.query('INSERT INTO cases (id, key, project, tags, icon, image) VALUES ($1, $2, $3, $4, $5, $6)',
      [desired.id, desired.key, desired.project, desired.tags, desired.icon, desired.image])
  }
  for (const previous of expected?.translations ?? []) {
    if (!desired.translations.some((t) => t.locale === previous.locale)) {
      await client.query('DELETE FROM case_translations WHERE id = $1', [previous.id])
    }
  }
  for (const translation of desired.translations) {
    const previous = expected?.translations.find((t) => t.locale === translation.locale)
    if (isDeepStrictEqual(previous, translation)) {
      continue
    }
    await client.query(`
      INSERT INTO case_translations (id, case_id, locale, title, description, task, solution, result)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (case_id, locale) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, task = EXCLUDED.task,
        solution = EXCLUDED.solution, result = EXCLUDED.result, updated_at = now()
    `, [translation.id, desired.id, translation.locale, ...textFields.map((field) => translation[field])])
  }
}

export async function applyPlan(client, plan, rollback = false) {
  if (plan.version !== 1 || !Array.isArray(plan.changes) || !isDeepStrictEqual(plan.target, await targetOf(client))) {
    throw new Error('Invalid plan or different database target; generate a plan for this connection')
  }
  await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE')
  try {
    // Serialize editorial writes; engagement tables remain writable.
    await client.query('LOCK TABLE cases, case_translations IN SHARE ROW EXCLUSIVE MODE')
    for (const change of plan.changes) {
      // Prevent a new view/reaction racing a rollback deletion through its FK.
      await client.query('SELECT id FROM cases WHERE key = $1 FOR UPDATE', [change.key])
      const expected = rollback ? change.after : change.before
      const desired = rollback ? change.before : change.after
      const current = await readCase(client, change.key)
      if (isDeepStrictEqual(current, desired)) {
        continue
      }
      if (!isDeepStrictEqual(current, expected)) {
        throw new Error(`${change.key}: content changed since planning; no changes committed`)
      }
      await writeCase(client, expected, desired)
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

async function main() {
  const [command, input, output, ...extra] = process.argv.slice(2)
  if (!['plan', 'apply', 'rollback'].includes(command) || !input || extra.length
    || (command === 'plan' ? !output : output)) {
    throw new Error('Usage: case-content.mjs plan CONTENT.json PLAN.json | apply PLAN.json | rollback PLAN.json')
  }
  if (!process.env.CASE_CONTENT_DATABASE_URL) {
    throw new Error('Set CASE_CONTENT_DATABASE_URL explicitly; no .env is loaded')
  }
  const data = JSON.parse(await readFile(input, 'utf8'))
  const client = new pg.Client({ connectionString: process.env.CASE_CONTENT_DATABASE_URL })
  try {
    await client.connect()
    await client.query('SET search_path TO public')
    if (command === 'plan') {
      const plan = await planContent(client, data)
      await writeFile(output, `${JSON.stringify(plan, null, 2)}\n`, { flag: 'wx', mode: 0o600 })
      console.log(`Plan saved: ${plan.changes.length} case(s); database unchanged. Review the file before applying.`)
    } else {
      await applyPlan(client, data, command === 'rollback')
      console.log(`${command}: ${data.changes.length} case(s); transaction committed.`)
    }
  } finally {
    await client.end()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    // Driver details can include connection information; do not print them.
    console.error(error.code ? `Database operation failed (${error.code}); no partial transaction committed.` : error.message)
    process.exitCode = 1
  })
}
