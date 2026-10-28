import { describe, expect, it } from 'vitest'
import { renderPublicationMarkdown } from '../server/utils/publication-markdown'

describe('publication Markdown boundary', () => {
  it('escapes raw HTML and refuses executable links', () => {
    const html = renderPublicationMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[x](javascript:alert(1))\n\n[x](data:text/html,test)')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('href="javascript:')
    expect(html).not.toContain('href="data:')
    expect(html).toContain('&lt;script&gt;')
  })

  it('preserves source links, lists and code whitespace without compiling Vue', () => {
    const html = renderPublicationMarkdown('[Source](https://example.com/release)\n\n- One\n- Two\n\n```sh\necho "<tag>"\n  indented\n```\n\n{{ secret }}')
    expect(html).toContain('href="https://example.com/release"')
    expect(html).toContain('<ul>')
    expect(html).toContain('  indented\n')
    expect(html).toContain('&lt;tag&gt;')
    expect(html).toContain('{{ secret }}')
  })

  it('preserves explicit section anchors and disambiguates repeated headings', () => {
    const html = renderPublicationMarkdown('## Новое название {#publication-status}\n\n## Repeat\n\n## Repeat')
    expect(html).toContain('id="publication-status">Новое название</h2>')
    expect(html).not.toContain('{#publication-status}')
    expect(html).toContain('id="section-repeat"')
    expect(html).toContain('id="section-repeat-2"')
  })
})
