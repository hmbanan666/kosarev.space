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

it('normalizes punctuation without leaking whitespace across delta boundaries', () => {
  const wording = createAnswerWording()
  const parts = ['В его стеке ', '—', ' TypeScript ', ',', ' Vue ', '–', ' Nuxt ', '-', ' PostgreSQL .']
  expect(parts.map((part) => wording(part)).join('') + wording('', true))
    .toBe('В его стеке: TypeScript, Vue: Nuxt: PostgreSQL.')
})

it.each([
  ['Nick — TypeScript, Ник - Vue. Nikolai – Nuxt.', 'Nikolay: TypeScript, Николай: Vue. Nikolay: Nuxt.'],
  ['Text , next . Yes ; list : good ! Why ? (ok ) [ok ] {ok }', 'Text, next. Yes; list: good! Why? (ok) [ok] {ok}'],
  ['List:\n- Nick\n  - Nuxt - Vue\n', 'List:\n- Nikolay\n  - Nuxt: Vue\n'],
  ['[site](https://example.com/a—b) <https://example.com/a—b>', '[site](https://example.com/a—b) <https://example.com/a—b>'],
  ['Wait ... and 1.5…', 'Wait ... and 1.5…'],
  ['Version 1.5... well… Vue/Nuxt and well-known; https://example.com/a—b?q=1.5', 'Version 1.5... well… Vue/Nuxt and well-known; https://example.com/a—b?q=1.5'],
  ['Nick `Nick — x , y` and ``a ` Nick - b``.\n```ts\nconst Nick = "a — b , c"\n```\nНик.', 'Nikolay `Nick — x , y` and ``a ` Nick - b``.\n```ts\nconst Nick = "a — b , c"\n```\nНиколай.'],
  ['~~~text\nNick — x , y\n~~~\nNick.', '~~~text\nNick — x , y\n~~~\nNikolay.'],
])('preserves protected text and names at every split: %s', (input, expected) => {
  for (let split = 0; split <= input.length; split++) {
    const wording = createAnswerWording()
    expect(wording(input.slice(0, split)) + wording(input.slice(split)) + wording('', true), `split ${split}`).toBe(expected)
    expect(wording('', true)).toBe('')
  }
  const wording = createAnswerWording()
  expect([...input].map((character) => wording(character)).join('') + wording('', true)).toBe(expected)
})

it.each([
  ['<think>Ник</think> [CV](/cv)</siehe><answer> ответ</answer>', 'Николай [CV](/cv) ответ'],
  ['Text <note key="a>b">inside</note><br/> end', 'Text inside end'],
  ['`<think>Nick</think>` and ``</answer>``.\n```xml\n<answer>Nick</answer>\n```\n</siehe>Done', '`<think>Nick</think>` and ``</answer>``.\n```xml\n<answer>Nick</answer>\n```\nDone'],
  ['```xml\n<think>Nick</think>\n````\n<answer>Done</answer>', '```xml\n<think>Nick</think>\n````\nDone'],
  ['~~~xml\n<think>Nick</think>\n~~~\n<answer>Done</answer>', '~~~xml\n<think>Nick</think>\n~~~\nDone'],
  ['a < b and 2 > 1; <https://example.com> <nick@example.com> [site](https://example.com)', 'a < b and 2 > 1; <https://example.com> <nick@example.com> [site](https://example.com)'],
])('removes stray tags outside code at every stream split: %s', (input, expected) => {
  for (let split = 0; split <= input.length; split++) {
    const wording = createAnswerWording()
    expect(wording(input.slice(0, split)) + wording(input.slice(split)) + wording('', true), `split ${split}`).toBe(expected)
  }
  const wording = createAnswerWording()
  expect([...input].map((character) => wording(character)).join('') + wording('', true)).toBe(expected)
})
