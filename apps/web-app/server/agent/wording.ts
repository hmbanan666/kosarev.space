const names: Record<string, string> = { nick: 'Nikolay', nikolai: 'Nikolay', ник: 'Николай', ника: 'Николая', нику: 'Николаю', ником: 'Николаем', нике: 'Николае' }
const wordCharacter = /[\p{L}\p{N}_@./-]/u

// Keep only undecidable text: whitespace, a partial name or a code delimiter.
export function createAnswerWording() {
  let pending = ''
  let whitespace = ''
  let previous = ''
  let token = ''
  let code = ''
  let afterDash = false
  return (text: string, final = false) => {
    pending += text
    let output = ''
    function emit(value: string) {
      output += value
      previous = value.at(-1) ?? previous
      token = /\s/.test(value) ? value.split(/\s/).at(-1)! : token + value
    }
    while (pending) {
      const character = pending[0]!
      if (character === '`' || character === '~') {
        const delimiter = pending.match(/^`+|^~+/)![0]
        if (!final && delimiter.length === pending.length) {
          break
        }
        if (code) {
          if (delimiter[0] === code[0] && (code.length >= 3 ? delimiter.length >= code.length : delimiter.length === code.length)) {
            code = ''
          }
        } else if (character === '`' || delimiter.length >= 3) {
          code = delimiter
        }
        emit(whitespace + delimiter)
        whitespace = ''
        pending = pending.slice(delimiter.length)
        continue
      }
      if (code) {
        emit(character)
        pending = pending.slice(1)
        continue
      }
      if (character === '<') {
        const tag = pending.match(/^<\/?[a-z][\w:.-]*(?:\s(?:[^<>"']|"[^"]*"|'[^']*')*)?\/?>/i)?.[0]
        if (tag) {
          pending = pending.slice(tag.length)
          continue
        }
        // Hold a possible tag across deltas, without buffering unbounded prose.
        const partial = /^<\/?(?:[a-z][\w:.-]*(?:\s[^<]*)?\/?)?$/i.test(pending)
        if (!final && partial && pending.length < 1024) {
          break
        }
      }
      if (/\s/.test(character)) {
        whitespace += character
        pending = pending.slice(1)
        continue
      }
      // URLs, email addresses and paths retain their punctuation verbatim.
      const inAddress = !whitespace && /(?:^|[<(])(?:[a-z][a-z\d+.-]*:\/\/|www\.|\/)|@/i.test(token)
      if (!inAddress && (character === '—' || (previous && whitespace && !/[\r\n]/.test(whitespace) && /[–-]/.test(character)))) {
        if (pending.length === 1 && !final && character !== '—') {
          break
        }
        if (character === '—' || /\s/.test(pending[1] ?? '')) {
          emit(':')
          whitespace = ' '
          afterDash = true
          pending = pending.slice(1)
          continue
        }
      }
      if (afterDash) {
        whitespace = ' '
        afterDash = false
      }
      if (!final && whitespace && pending === '.') {
        break
      }
      if (/[,.;:!?\])}]/.test(character) && !pending.startsWith('..')) {
        whitespace = ''
      }
      if (whitespace) {
        emit(whitespace)
        whitespace = ''
      }
      if (!wordCharacter.test(previous)) {
        const word = pending.match(/^[\p{L}\p{N}_@./-]+/u)?.[0] ?? ''
        const candidate = word.replace(/\.$/, '').toLowerCase()
        if (word && !final && word.length === pending.length && Object.keys(names).some((name) => name.startsWith(candidate))) {
          break
        }
        const name = pending.match(/^(?:nick|nikolai|ник(?:[ауе]|ом)?)(?![\p{L}\p{N}_@/-]|\.[\p{L}\p{N}])/iu)?.[0]
        if (name) {
          emit(names[name.toLowerCase()]!)
          pending = pending.slice(name.length)
          continue
        }
      }
      emit(character)
      pending = pending.slice(1)
    }
    if (final) {
      emit(whitespace)
      whitespace = ''
    }
    return output
  }
}
