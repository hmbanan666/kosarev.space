import { describe, expect, it } from 'vitest'
import { createTestDatabaseClient } from '../../../e2e/publication-fixture.mjs'

describe('publication E2E database boundary', () => {
  it('rejects a query-string host override before connecting', () => {
    const url = 'postgresql://localhost/site_test?host=remote.example'
    expect(() => createTestDatabaseClient(url, url)).toThrow('Effective PostgreSQL target')
  })

  it('rejects socket overrides, non-test databases and mismatched URLs', () => {
    const socket = 'postgresql://localhost/site_test?host=%2Fvar%2Frun%2Fpostgresql'
    expect(() => createTestDatabaseClient(socket, socket)).toThrow('Effective PostgreSQL target')
    const database = 'postgresql://127.0.0.1/production'
    expect(() => createTestDatabaseClient(database, database)).toThrow('local database ending in _test')
    expect(() => createTestDatabaseClient('postgresql://127.0.0.1/site_test', database)).toThrow('matching explicit')
  })

  it('accepts explicit loopback test targets without opening a connection', () => {
    for (const host of ['localhost', '127.0.0.1', '[::1]']) {
      const url = `postgresql://${host}/site_test`
      const client = createTestDatabaseClient(url, url)
      expect(client.connectionParameters.database).toBe('site_test')
      expect(client.connectionParameters.host).toBe(host === '[::1]' ? '::1' : host)
    }
  })
})
