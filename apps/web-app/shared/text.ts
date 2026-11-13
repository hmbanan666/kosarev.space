export function wrapText(value: string, maxChars: number, maxLines: number): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let index = 0
  while (index < words.length && lines.length < maxLines) {
    let line = words[index] ?? ''
    index += 1
    while (index < words.length && `${line} ${words[index]}`.length <= maxChars) {
      line = `${line} ${words[index]}`
      index += 1
    }
    if (lines.length === maxLines - 1 && index < words.length) {
      const trimmed = line.slice(0, Math.max(1, maxChars - 3)).trimEnd()
      line = `${trimmed}...`
    }
    lines.push(line)
  }
  return lines
}
