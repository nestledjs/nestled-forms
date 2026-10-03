import { describe, expect, it } from 'vitest'
import { markdownToHtml } from './markdown-editor'

describe('markdownToHtml security', () => {
  it('escapes raw HTML so it renders as text', async () => {
    const html = await markdownToHtml('<script>alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('neutralizes javascript: link URLs', async () => {
    const html = await markdownToHtml('[click](javascript:alert(document.cookie))')
    expect(html).not.toContain('javascript:')
    expect(html).toContain('href="#"')
  })

  it('neutralizes obfuscated schemes (whitespace/control chars, case)', async () => {
    const html = await markdownToHtml('[x](JaVa	ScRiPt:alert(1))')
    expect(html).not.toMatch(/href="[^"]*script:/i)
  })

  it('blocks quote breakout in image alt/src', async () => {
    const html = await markdownToHtml('![x" onerror="alert(1)](https://ok.example/a.png)')
    expect(html).not.toContain('onerror="alert')
  })

  it('keeps legitimate links, images, and formatting working', async () => {
    const html = await markdownToHtml('# Title\n**bold** [site](https://example.com) ![pic](/img.png)')
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<a href="https://example.com">site</a>')
    expect(html).toContain('<img alt="pic" src="/img.png" />')
  })

  it('allows mailto and relative URLs', async () => {
    const html = await markdownToHtml('[mail](mailto:hi@example.com) [rel](./docs)')
    expect(html).toContain('href="mailto:hi@example.com"')
    expect(html).toContain('href="./docs"')
  })
})
