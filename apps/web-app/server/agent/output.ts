import type { KnowledgeChunk } from './knowledge'

const answerLimit = 4000
const bufferLimit = 8000

// Only short, exact quotations from a fenced site excerpt may survive the guard.
function quotedSnippet(block: string, evidence: KnowledgeChunk[]): boolean {
  const code = block.replace(/^(`{3,}|~{3,})[^\n`~]*\n/, '').replace(/\n?(`{3,}|~{3,})$/, '').trim()
  return !!code && code.length <= 200 && code.split('\n').length <= 5 && evidence.some(({ text }) => {
    return [...text.matchAll(/(`{3,}|~{3,})[^\n`~]*\n([\s\S]*?)\1/g)].some((match) => match[2]?.trim() === code)
  })
}

export function createOutputGuard(evidence: KnowledgeChunk[]) {
  let pending = ''
  let fence = ''
  let emitted = 0
  let received = 0
  let filtered = false
  return {
    get filtered() {
      return filtered
    },
    get empty() {
      return emitted === 0
    },
    get full() {
      return emitted >= answerLimit || received >= bufferLimit
    },
    push(token: string, final = false): string {
      pending += token.slice(0, Math.max(0, bufferLimit - received))
      received += token.length
      let output = ''
      while (pending) {
        if (fence) {
          const headerEnd = pending.indexOf('\n')
          if (headerEnd === -1) {
            break
          }
          fence = /^`{3,}|^~{3,}/.exec(pending)![0]
          const closing = new RegExp(`(?:^|\\n)[ \t]*${fence[0]}{${fence.length},}[ \t]*(?=\\r?\\n${final ? '|$' : ''})`).exec(pending.slice(headerEnd + 1))
          if (!closing) {
            break
          }
          const end = headerEnd + 1 + closing.index + closing[0].length
          const block = pending.slice(0, end)
          if (quotedSnippet(block, evidence)) {
            output += block
          } else {
            filtered = true
          }
          pending = pending.slice(end)
          fence = ''
          continue
        }
        const opening = /`{3,}|~{3,}/.exec(pending)
        if (opening) {
          output += pending.slice(0, opening.index)
          pending = pending.slice(opening.index)
          fence = opening[0]
          continue
        }
        // Hold partial fence delimiters until the next delta, even across UTF-8 frames.
        const tail = /[`~]+$/.exec(pending)?.[0].length ?? 0
        output += pending.slice(0, pending.length - tail)
        pending = pending.slice(pending.length - tail)
        break
      }
      if (final) {
        if (fence) {
          filtered = true
        }
        if (!fence) {
          output += pending
        }
        pending = ''
      }
      output = output.slice(0, answerLimit - emitted)
      emitted += output.length
      return output
    },
  }
}
