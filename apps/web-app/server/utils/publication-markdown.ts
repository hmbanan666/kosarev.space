import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false })

export function renderPublicationMarkdown(source: string): string {
  const tokens = markdown.parse(source, {})
  const used = new Set<string>()
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!
    const inline = tokens[i + 1]
    if (token.type !== 'heading_open' || inline?.type !== 'inline') {
      continue
    }
    const explicit = inline.content.match(/\s+\{#([a-z][a-z0-9-]*)\}$/)
    if (explicit) {
      inline.content = inline.content.slice(0, explicit.index)
      inline.children = markdown.parseInline(inline.content, {})[0]?.children ?? []
    }
    const base = explicit?.[1] ?? `section-${inline.content.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'heading'}`
    let id = base
    for (let suffix = 2; used.has(id); suffix++) {
      id = `${base}-${suffix}`
    }
    used.add(id)
    token.attrSet('id', id)
  }
  return markdown.renderer.render(tokens, markdown.options, {})
}
