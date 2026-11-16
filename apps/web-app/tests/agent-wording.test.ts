import { expect, it } from 'vitest'
import { createAnswerWording } from '../server/agent/wording'

it('streams ordinary partial prose without waiting for another provider event', () => {
  const wording = createAnswerWording()
  expect(wording('Partial answer')).toBe('Partial answer')
  expect(wording('', true)).toBe('')
})

it('preserves word boundaries, addresses and links across single-character deltas', () => {
  const wording = createAnswerWording()
  const text = 'Nick uses nick@kosarev.space and /Nick/page. Nickname is unchanged. Николай, Ник.'
  const result = [...text].map((character) => wording(character)).join('') + wording('', true)
  expect(result).toBe('Nikolay uses nick@kosarev.space and /Nick/page. Nickname is unchanged. Николай, Николай.')
})
