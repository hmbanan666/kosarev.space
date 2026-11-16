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

it('rejects questions over 600 characters and bounds retained history to three exchanges', () => {
  expect(validateAgentRequest({ messages: [{ role: 'user', content: 'x'.repeat(601) }] })).toBeNull()
  const history = Array.from({ length: 5 }, (_, index) => [
    { role: 'user', content: `K39 ${index}` },
    { role: 'assistant', content: 'a'.repeat(1000) },
  ]).flat()
  const request = validateAgentRequest({ messages: [...history, { role: 'user', content: 'K39?' }] })
  expect(request?.messages).toHaveLength(7)
  expect(request?.messages[0]?.content).toBe('K39 2')
  expect(request?.messages.every((message) => message.content.length <= 600)).toBe(true)
})
