import type { OgCard } from '../../shared/og'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { renderOgSvg } from '../../shared/og'
import { resolvePublicFile } from './public-file'

const fontFiles = [
  'fonts/og/noto-sans-latin-400.ttf',
  'fonts/og/noto-sans-cyrillic-400.ttf',
  'fonts/og/lora-latin-500.ttf',
  'fonts/og/lora-cyrillic-500.ttf',
]

let photoHref: string | undefined

function portraitHref(): string {
  if (!photoHref) {
    const bytes = readFileSync(resolvePublicFile('photo.jpg'))
    photoHref = `data:image/jpeg;base64,${bytes.toString('base64')}`
  }
  return photoHref
}

export async function renderOgPng(card: OgCard): Promise<Buffer> {
  const svg = renderOgSvg(card, portraitHref())
  const { Resvg } = await import('@resvg/resvg-js')
  const renderer = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      fontFiles: fontFiles.map((file) => resolvePublicFile(file)),
      loadSystemFonts: false,
      defaultFontFamily: 'Noto Sans',
    },
  })
  return Buffer.from(renderer.render().asPng())
}
