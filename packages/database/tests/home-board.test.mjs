import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest'
import { BoardRoom } from '../../../apps/web-app/server/utils/board-room.ts'
import { loadSharedBoard } from '../../../apps/web-app/server/utils/shared-board.ts'
import { openTestDatabase } from '../../../e2e/publication-fixture.mjs'
import { repository, useCreateDatabase, useDatabase } from '../src/index.ts'

const schema = `board_${randomUUID().replaceAll('-', '')}`
const seed = { blocks: [], stickers: [] }
const load = () => repository.homeBoard.load(async () => seed)
const room = () => new BoardRoom(load, repository.homeBoard.update)
const sticker = (kind = 'monkey-love-lab') => ({ id: randomUUID(), kind, x: 0.5, y: 0.5, rotation: 3 })
const migration = (file) => readFile(new URL(`../migrations/${file}.sql`, import.meta.url), 'utf8')
let db

beforeAll(async () => {
  db = await openTestDatabase()
  await db.query(`CREATE SCHEMA "${schema}"`)
  await db.query(`SET search_path TO "${schema}"`)
  await db.query(await migration('0004_shared_board'))
  const url = new URL(process.env.CASE_CONTENT_TEST_DATABASE_URL)
  url.searchParams.set('options', `-c search_path=${schema}`)
  useCreateDatabase(url.href)
})
beforeEach(async () => {
  await db.query('DELETE FROM home_board')
})
afterAll(async () => {
  await useDatabase().$client.end()
  await db.query(`DROP SCHEMA "${schema}" CASCADE`)
  await db.end()
})

it('filters duplicates on read and clears all saved stickers in the migration', async () => {
  const first = sticker()
  const second = sticker('monkey-pink-mug')
  const saved = { blocks: [{ id: 'cv', x: 1, y: 2, w: 4, h: 3 }], stickers: [first, second, sticker(), sticker(second.kind)] }
  const expected = { ...saved, stickers: [first, second] }
  await db.query('INSERT INTO home_board VALUES (1, $1)', [saved])
  expect(await loadSharedBoard()).toEqual(expected)
  await db.query(await migration('0005_unique_board_stickers'))
  expect((await db.query('SELECT state FROM home_board')).rows[0].state).toEqual({ ...saved, stickers: [] })
})

it('serializes competing drops under independent room locks and returns the winner to both clients', async () => {
  const [a, b] = [room(), room()]
  const [left, right] = [sticker(), sticker()]
  const messages = [[], []]
  await Promise.all([a.join('a', (e) => messages[0].push(e)), b.join('b', (e) => messages[1].push(e))])
  await Promise.all([a.act('a', 'begin', left), b.act('b', 'begin', right)])
  await Promise.all([a.act('a', 'drop', left), b.act('b', 'drop', right)])
  const { stickers } = await load()
  expect(stickers).toHaveLength(1)
  expect([left, right]).toContainEqual(stickers[0])
  for (const events of messages) {
    expect(events.at(-1)).toMatchObject({ type: 'board-state', state: { stickers }, held: [] })
  }
})

it('denies a duplicate pick and broadcasts removal to every connected visitor', async () => {
  const shared = room()
  const messages = [[], []]
  const item = sticker()
  await shared.join('a', (e) => messages[0].push(e))
  await shared.join('b', (e) => messages[1].push(e))
  await shared.act('a', 'begin', item)
  await shared.act('a', 'drop', item)
  const copy = sticker()
  await shared.act('b', 'begin', copy)
  await shared.act('b', 'drop', copy)
  expect(messages[1]).toContainEqual({ type: 'board-denied', id: copy.id })
  expect((await load()).stickers).toEqual([item])
  await shared.act('b', 'begin', item)
  await shared.act('b', 'remove', item)
  expect((await load()).stickers).toEqual([])
  for (const events of messages) {
    expect(events.at(-1)).toMatchObject({ type: 'board-state', state: { stickers: [] }, held: [] })
  }
})
