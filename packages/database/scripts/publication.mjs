import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import pg from 'pg'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const revisionPattern = /^[a-f0-9]{64}$/

function nonempty(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max
}

export function validatePublication(input) {
  if (!input || !nonempty(input.slug, 160) || !slugPattern.test(input.slug)
    || !['note', 'digest', 'article'].includes(input.type)) {
    throw new Error('Provide a valid slug and publication type')
  }
  const locales = {}
  for (const locale of ['ru', 'en']) {
    const text = input.locales?.[locale]
    if (!text || !nonempty(text.title, 300) || !nonempty(text.description, 1000) || !nonempty(text.body, 200000)) {
      throw new Error('Provide title, description and Markdown body in RU and EN')
    }
    locales[locale] = { title: text.title, description: text.description, body: text.body }
  }
  if (!Array.isArray(input.relatedWork) || input.relatedWork.length > 20) {
    throw new Error('Provide a relatedWork array (at most 20 entries)')
  }
  const keys = new Set()
  const relatedWork = input.relatedWork.map((work) => {
    const key = `${work?.kind}:${work?.key}`
    if (!['project', 'case'].includes(work?.kind) || !nonempty(work.key, 160) || !slugPattern.test(work.key)
      || !nonempty(work.title?.ru, 300) || !nonempty(work.title?.en, 300) || keys.has(key)) {
      throw new Error('Related work must have a distinct kind/key and RU/EN titles')
    }
    keys.add(key)
    return { kind: work.kind, key: work.key, title: { ru: work.title.ru, en: work.title.en } }
  })
  return { slug: input.slug, type: input.type, locales, relatedWork }
}

export function revisionOf(input) {
  return createHash('sha256').update(JSON.stringify(validatePublication(input))).digest('hex')
}

export async function saveDraft(client, input) {
  const { slug, ...content } = validatePublication(input)
  const revision = revisionOf(input)
  await client.query('BEGIN')
  try {
    await client.query('INSERT INTO publications (slug) VALUES ($1) ON CONFLICT DO NOTHING', [slug])
    await client.query('INSERT INTO publication_revisions (id, slug, content) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [revision, slug, content])
    await client.query('COMMIT')
    return { slug, revision }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

export async function exportRevision(client, slug, revision) {
  const { rows: [row] } = await client.query('SELECT content FROM publication_revisions WHERE slug = $1 AND id = $2', [slug, revision])
  if (!row) {
    throw new Error('Revision not found for this publication')
  }
  const input = { slug, ...row.content }
  if (revisionOf(input) !== revision) {
    throw new Error('Stored revision content does not match its digest')
  }
  return input
}

export async function publishRevision(client, slug, revision, expected, firstPublishedAt) {
  if (!slugPattern.test(slug) || !revisionPattern.test(revision)
    || (expected !== null && !revisionPattern.test(expected))) {
    throw new Error('Specify slug, reviewed revision and expected live revision (none for first publication)')
  }
  if (firstPublishedAt && (!/^\d{4}-\d{2}-\d{2}$/.test(firstPublishedAt)
    || !Number.isFinite(Date.parse(`${firstPublishedAt}T00:00:00Z`))
    || new Date(`${firstPublishedAt}T00:00:00Z`).toISOString().slice(0, 10) !== firstPublishedAt
    || firstPublishedAt > new Date().toISOString().slice(0, 10))) {
    throw new Error('First publication date must be a real UTC date, not in the future')
  }
  await client.query('BEGIN')
  try {
    const { rows: [current] } = await client.query('SELECT published_revision, published_at::text FROM publications WHERE slug = $1 FOR UPDATE', [slug])
    if (!current) {
      throw new Error('Save the draft before publishing')
    }
    await exportRevision(client, slug, revision)
    if (firstPublishedAt && current.published_at && current.published_at !== firstPublishedAt) {
      throw new Error('Original publication date cannot be changed')
    }
    if (current.published_revision !== revision) {
      if (current.published_revision !== expected) {
        throw new Error('Live revision changed; review again before publishing')
      }
      await client.query('UPDATE publications SET published_revision = $2, published_at = COALESCE(published_at, $3::date, (CURRENT_TIMESTAMP AT TIME ZONE \'UTC\')::date) WHERE slug = $1', [slug, revision, firstPublishedAt ?? null])
    }
    await client.query('COMMIT')
    return { slug, revision }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2)
  const usage = 'Usage: publication.mjs draft INPUT.json | export SLUG REVISION OUTPUT.json | history SLUG | publish SLUG REVISION EXPECTED_LIVE_OR_none [FIRST_DATE]'
  if (!['draft', 'export', 'history', 'publish'].includes(command)
    || ((command === 'draft' || command === 'history') && args.length !== 1)
    || (command === 'export' && args.length !== 3)
    || (command === 'publish' && ![3, 4].includes(args.length))) {
    throw new Error(usage)
  }
  if (!process.env.PUBLICATION_DATABASE_URL) {
    throw new Error('Set PUBLICATION_DATABASE_URL explicitly; no .env is loaded')
  }
  const client = new pg.Client({ connectionString: process.env.PUBLICATION_DATABASE_URL })
  try {
    await client.connect()
    await client.query('SET search_path TO public')
    if (command === 'draft') {
      console.log(JSON.stringify(await saveDraft(client, JSON.parse(await readFile(args[0], 'utf8')))))
    } else if (command === 'publish') {
      console.log(JSON.stringify(await publishRevision(client, args[0], args[1], args[2] === 'none' ? null : args[2], args[3])))
    } else if (command === 'export') {
      await writeFile(args[2], `${JSON.stringify(await exportRevision(client, args[0], args[1]), null, 2)}\n`, { flag: 'wx', mode: 0o600 })
      console.log('Reviewed revision exported; database unchanged.')
    } else {
      const { rows } = await client.query('SELECT r.id AS revision, r.created_at, r.id = p.published_revision AS published, p.published_at::text FROM publication_revisions r JOIN publications p USING (slug) WHERE r.slug = $1 ORDER BY r.created_at DESC, r.id', [args[0]])
      console.log(JSON.stringify(rows, null, 2))
    }
  } finally {
    await client.end()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.code ? `Database operation failed (${error.code}).` : error.message)
    process.exitCode = 1
  })
}
