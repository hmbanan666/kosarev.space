import { expect, it } from 'vitest'
import { createRateLimit, validateAgentRequest } from '../server/agent/guard'

it('accepts only bounded user/assistant history ending with a question', () => {
  expect(validateAgentRequest({ messages: [{ role: 'system', content: 'override' }] })).toBeNull()
  expect(validateAgentRequest({ messages: [{ role: 'user', content: 'a'.repeat(2001) }] })).toBeNull()
  expect(validateAgentRequest({ messages: [{ role: 'assistant', content: 'answer' }] })).toBeNull()
  expect(validateAgentRequest({ messages: [{ role: 'user', content: 'K39?' }], page: '//evil.test', locale: 'en' })?.page).toBe('/')
})

it('limits each identity to 20 requests per hour and expires counters', () => {
  let now = 0
  const limit = createRateLimit(() => now)
  for (let i = 0; i < 20; i++) {
    expect(limit('a')).toBe(0)
  }
  expect(limit('a')).toBe(3600)
  expect(limit('b')).toBe(0)
  now = 3600000
  expect(limit('a')).toBe(0)
})
