import { expect, it } from 'vitest'
import { createOutputGuard } from '../server/agent/output'

function answer(text: string, evidence = '') {
  const guard = createOutputGuard([{ title: 'Example', url: '/writing/example', locale: 'en', text: evidence }])
  // Every delimiter and newline crosses a provider delta boundary.
  return [...text].map((character) => guard.push(character)).join('') + guard.push('', true)
}

it('keeps only short exact fenced quotations from the evidence', () => {
  const snippet = '```sh\necho test\n```'
  expect(answer(snippet, snippet)).toBe(snippet)
  expect(answer('```sh\necho unrelated\n```', snippet)).toBe('')
  const long = `\`\`\`sh\n${'x'.repeat(201)}\n\`\`\``
  expect(answer(long, long)).toBe('')
  const manyLines = '```sh\n1\n2\n3\n4\n5\n6\n```'
  expect(answer(manyLines, manyLines)).toBe('')
})

it.each(['```', '~~~', '``````'])('strips complete and incomplete %s fences', (fence) => {
  expect(answer(`Before\n${fence}python\nsecret()\n${fence}\nAfter`)).toBe('Before\n\nAfter')
  expect(answer(`Before\n${fence}python\nsecret()`)).toBe('Before\n')
})

it('keeps inline code formatting and streams ordinary prose immediately', () => {
  const guard = createOutputGuard([])
  expect(guard.push('Partial answer')).toBe('Partial answer')
  expect(answer('Use `K39`')).toBe('Use `K39`')
})

it('does not treat fence characters inside code as a closing fence', () => {
  expect(answer('```python\nprint("```")\nsecret()\n```\nAfter')).toBe('\nAfter')
})

it('waits for a complete closing line before releasing text after a fence', () => {
  expect(answer('```python\n```not-a-closing-fence\nsecret()\n```\nAfter')).toBe('\nAfter')
})
