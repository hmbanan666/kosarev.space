// Hold an unfinished word so provider delta boundaries cannot split a name.
export function createAnswerWording() {
  let pending = ''
  let previous = ''
  const names: Record<string, string> = { nick: 'Nikolay', nikolai: 'Nikolay', ник: 'Николай', ника: 'Николая', нику: 'Николаю', ником: 'Николаем', нике: 'Николае' }
  return (text: string, final = false) => {
    pending += text
    const word = pending.match(/[\p{L}\p{N}_@./-]+$/u)?.[0] ?? ''
    const possibleName = word && Object.keys(names).some((name) => name.startsWith(word.replace(/\.$/, '').toLowerCase()))
    const tail = !final && possibleName ? word : ''
    const ready = pending.slice(0, pending.length - tail.length)
    pending = tail
    const prefix = /[\p{L}\p{N}_@./-]/u.test(previous) ? '_' : ' '
    previous = ready.at(-1) ?? previous
    return (prefix + ready).replaceAll('—', ',').replace(/(?<![\p{L}\p{N}_@./-])(?:nick|nikolai|ник(?:[ауе]|ом)?)(?![\p{L}\p{N}_@/-]|\.[\p{L}\p{N}])/giu, (name) => names[name.toLowerCase()]!).slice(1)
  }
}
